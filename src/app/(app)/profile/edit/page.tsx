'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, PlusCircle, Book, Award, Loader2, ArrowLeft, 
  Github, Linkedin, Globe, Image as ImageIcon, ChevronDown 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Skill = {
  id?: string;
  _id?: string;
  name: string;
  level: string;
  mode: string;
  verification: { type: string; url?: string };
};

export default function EditProfilePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobTitle: '',
    experienceLevel: 'Beginner',
    availability: 'Part-time',
    bio: '',
    avatarUrl: '',
    socialLinks: {
      github: '',
      linkedin: '',
      portfolio: '',
    },
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  /* ================= URL VALIDATION LOGIC ================= */

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const isValidPlatformUrl = (value: string, platform?: 'github' | 'linkedin') => {
    if (!value) return true; 
    try {
      const url = new URL(normalizeUrl(value));
      if (!url.hostname.includes('.')) return false;

      if (platform === 'github') {
        return url.hostname.toLowerCase().includes('github.com');
      }
      if (platform === 'linkedin') {
        return url.hostname.toLowerCase().includes('linkedin.com');
      }
      return true;
    } catch {
      return false; 
    }
  };

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const currentUserId = parsedUser.id || parsedUser._id;
    setUserId(currentUserId);

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        });

        const data = await res.json();

        if (data.user) {
          const u = data.user;

          setFormData({
            name: u.name || '',
            email: u.email || parsedUser.email || '',
            jobTitle: u.jobTitle || '',
            experienceLevel: u.experienceLevel || 'Beginner',
            availability: u.availability || 'Part-time',
            bio: u.bio || '',
            avatarUrl: u.avatarUrl || u.image || '',
            socialLinks: {
              github: u.socialLinks?.github || '',
              linkedin: u.socialLinks?.linkedin || '',
              portfolio: u.socialLinks?.portfolio || '',
            },
          });

          if (Array.isArray(u.skills)) {
            setSkills(
              u.skills.map((s: any, i: number) => ({
                ...s,
                id: s._id || `skill-${i}`,
                mode: s.mode || 'Learner',
                verification: s.verification || { type: 'Self-Declared' },
              }))
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  /* ================= SKILLS ACTIONS ================= */

  const addSkill = () => {
    if (!currentSkill) return;
    if (skills.find(s => s.name.toLowerCase() === currentSkill.toLowerCase())) return;

    setSkills([
      ...skills,
      {
        id: `new-${Date.now()}`,
        name: currentSkill,
        level: 'Beginner',
        mode: 'Learner',
        verification: { type: 'Self-Declared', url: '' },
      },
    ]);
    setCurrentSkill('');
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id && s._id !== id));
  };

  const handleUpdateSkill = (id: string, field: keyof Skill, value: any) => {
    setSkills(skills.map(s => (s.id === id || s._id === id ? { ...s, [field]: value } : s)));
  };

  /* ================= SUBMIT HANDLER ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run Validation Checks
    const { github, linkedin, portfolio } = formData.socialLinks;

    if (github && !isValidPlatformUrl(github, 'github')) {
      toast({ title: 'Invalid GitHub URL', description: 'Link must contain "github.com"', variant: 'destructive' });
      return;
    }
    if (linkedin && !isValidPlatformUrl(linkedin, 'linkedin')) {
      toast({ title: 'Invalid LinkedIn URL', description: 'Link must contain "linkedin.com"', variant: 'destructive' });
      return;
    }
    if (portfolio && !isValidPlatformUrl(portfolio)) {
      toast({ title: 'Invalid Portfolio URL', description: 'Please enter a valid website address (e.g. mysite.com)', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        userId,
        ...formData,
        socialLinks: {
          github: normalizeUrl(formData.socialLinks.github),
          linkedin: normalizeUrl(formData.socialLinks.linkedin),
          portfolio: normalizeUrl(formData.socialLinks.portfolio),
        },
        skills,
      };

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // ✅ TRIGGER EVENT: Notify Sidebar/Header to update immediately
      window.dispatchEvent(new Event("user-updated"));

      toast({ title: 'Profile updated', description: 'Changes saved successfully.' });
      router.push('/profile');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2">
        <Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your public profile and skills.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* === PERSONAL INFORMATION === */}
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
                <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /> Profile Image</Label>
                <div className="flex gap-6 items-center">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0 shadow-sm">
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 flex-grow">
                        <div className="flex gap-2 items-center">
                            <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>Upload Photo</Button>
                            <input
                                id="file-upload" type="file" accept="image/*" className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 5 * 1024 * 1024) { 
                                            toast({ title: "File too large", description: "Limit is 5MB.", variant: "destructive" });
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {formData.avatarUrl && (
                                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setFormData(prev => ({ ...prev, avatarUrl: "" }))}>Remove</Button>
                            )}
                        </div>
                        {/* ✅ REMOVED: Text input box for direct URL paste */}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="e.g. Senior Frontend Developer" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={formData.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="relative">
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        >
                            <option value="Part-time">Part-time</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Experience Level</Label>
                <div className="relative">
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Your Bio</Label>
                <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* === SOCIAL LINKS === */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Only valid links are allowed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex gap-2 items-center"><Github className="h-4 w-4" /> GitHub</Label>
                <Input
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.socialLinks.github}
                  onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex gap-2 items-center"><Linkedin className="h-4 w-4" /> LinkedIn</Label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.socialLinks.linkedin}
                  onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex gap-2 items-center"><Globe className="h-4 w-4" /> Portfolio / Website</Label>
              <Input
                type="url"
                placeholder="https://mywebsite.com"
                value={formData.socialLinks.portfolio}
                onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, portfolio: e.target.value } })}
              />
            </div>
          </CardContent>
        </Card>

        {/* === SKILLS === */}
        <Card>
            <CardHeader>
                <CardTitle>Manage Skills</CardTitle>
                <CardDescription>Add or remove skills to improve AI matching.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Add a new skill (e.g. React)..." 
                        value={currentSkill} 
                        onChange={(e) => setCurrentSkill(e.target.value)} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                            }
                        }}
                    />
                    <Button type="button" onClick={addSkill}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
                </div>

                <div className="space-y-4">
                    {skills.map((skill, index) => (
                        <div key={skill.id || index} className="p-4 border rounded-lg space-y-4 bg-card">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-lg">{skill.name}</h4>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(skill.id!)}><X className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <Label className="text-sm">Proficiency</Label>
                                    <div className="relative mt-1">
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
                                            value={skill.level}
                                            onChange={(e) => handleUpdateSkill(skill.id!, 'level', e.target.value)}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-5 p-3 rounded-md bg-muted">
                                    <Label className="flex items-center gap-2"><Book className="h-4 w-4" /> Learner</Label>
                                    <Switch checked={skill.mode === 'Expert'} onCheckedChange={(checked) => handleUpdateSkill(skill.id!, 'mode', checked ? 'Expert' : 'Learner')} />
                                    <Label className="flex items-center gap-2">Expert <Award className="h-4 w-4" /></Label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* === SAVE BUTTON === */}
        <div className="flex justify-end pb-10">
          <Button type="submit" disabled={saving} size="lg" className="shadow-lg shadow-primary/20">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </div>

      </form>
    </div>
  );
}