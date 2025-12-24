'use client';

import { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
};

export default function SynergyHelp() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm SynergyHelp ✨ How can I assist you today?",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationHistory: messages.slice(-6), // Last 3 exchanges for context
                }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: data.timestamp,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "Sorry, I'm having trouble responding right now. Please try again! 🔄",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[100]"
                    style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
                >
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-2xl shadow-primary/50 border-0 group relative overflow-hidden"
                        size="icon"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MessageCircle className="h-6 w-6 text-white relative z-10" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    </Button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[100] w-[380px] h-[600px] flex flex-col"
                    style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
                >
                    {/* Glassmorphic Container */}
                    <div className="relative h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-black/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 dark:from-primary/10 dark:via-transparent dark:to-violet-500/10 pointer-events-none" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/10 dark:bg-primary/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />

                        {/* Header */}
                        <div className="relative z-10 flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">SynergyHelp</h3>
                                    <p className="text-xs text-slate-600 dark:text-white/60">AI Assistant</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="relative z-10 h-[calc(100%-140px)] p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                                ? 'bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/20'
                                                : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing Indicator */}
                                {isLoading && (
                                    <div
                                        className="flex justify-start"
                                    >
                                        <div className="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <div className="h-2 w-2 bg-slate-600 dark:bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="h-2 w-2 bg-slate-600 dark:bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="h-2 w-2 bg-slate-600 dark:bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="relative z-10 p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/20">
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 bg-white dark:bg-white/10 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 focus-visible:ring-primary/50 focus-visible:border-primary/50"
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-gradient-to-br from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white border-0 shadow-lg shadow-primary/20"
                                    size="icon"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
