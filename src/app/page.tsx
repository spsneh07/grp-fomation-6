import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Check, Users, Zap, BrainCircuit, ArrowRight, Star } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
const avatar1 = PlaceHolderImages.find((img) => img.id === 'avatar1')?.imageUrl || '';
const avatar2 = PlaceHolderImages.find((img) => img.id === 'avatar2')?.imageUrl || '';
const avatar3 = PlaceHolderImages.find((img) => img.id === 'avatar3')?.imageUrl || '';


export default function Home() {
  const features = [
    {
      title: 'AI-Powered Matching',
      description: 'Our smart algorithm connects you with the right projects and people based on your skills, interests, and learning goals.',
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Collaborative Workspaces',
      description: 'Each project gets a dedicated space with all the tools your team needs to succeed.',
      icon: <Users className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Skill Development',
      description: 'Join projects as a learner to gain new skills or as an expert to mentor others and build your portfolio.',
      icon: <Zap className="h-8 w-8 text-primary" />,
    },
  ];

  const testimonials = [
    {
      name: 'Alex Doe',
      role: 'Software Engineer',
      quote: 'SynergyHub helped me find a team for a weekend hackathon in just a few hours. The AI matching was spot on!',
      avatar: avatar1,
    },
    {
      name: 'Brenda Smith',
      role: 'UX Designer',
      quote: "I was looking to get into a social impact project, and I found the perfect one here. It's been an amazing experience.",
      avatar: avatar2,
    },
    {
      name: 'Charlie Brown',
      role: 'Student',
      quote: "As a student, getting real-world experience is tough. SynergyHub made it possible for me to contribute to a startup's MVP.",
      avatar: avatar3,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-secondary">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4 md:px-6">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
                The Future of Team Collaboration is Here.
              </h1>
              <p className="max-w-xl text-muted-foreground md:text-xl">
                SynergyHub AI intelligently connects skilled individuals with innovative projects. Build, learn, and grow together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button asChild size="lg" className="font-headline">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-headline">
                  <Link href="/dashboard">Explore Projects</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                A Smarter Way to Build Teams
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                Our platform is designed to make team formation seamless and effective.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center p-4">
                  {feature.icon}
                  <h3 className="font-headline text-xl font-semibold mt-4">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Get Started in 3 Easy Steps
            </h2>
            <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl">1</div>
                <h3 className="font-semibold text-lg mt-2">Create Your Profile</h3>
                <p className="text-muted-foreground max-w-xs">Showcase your skills and what you want to learn.</p>
              </div>
              <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl">2</div>
                <h3 className="font-semibold text-lg mt-2">Find Your Match</h3>
                <p className="text-muted-foreground max-w-xs">Our AI suggests the perfect projects and teammates.</p>
              </div>
              <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl">3</div>
                <h3 className="font-semibold text-lg mt-2">Start Collaborating</h3>
                <p className="text-muted-foreground max-w-xs">Launch your project in a dedicated workspace.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by Innovators Worldwide
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                Don't just take our word for it. Here's what our users are saying.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground pt-2">"{testimonial.quote}"</p>
                     <div className="flex gap-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-secondary">
          <div className="container mx-auto text-center px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Build What's Next?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
              Join a community of builders, creators, and learners. Your next big project awaits.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="font-headline">
                <Link href="/signup">Sign Up & Start Building</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
