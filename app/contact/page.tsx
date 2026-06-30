"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "../../lib/context/AppContext";
import { ArrowLeft, Send, Check } from "lucide-react";

export default function ContactPage() {
  const { addToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      addToast("Please fill in all fields.", "error");
      return;
    }

    setStatus('loading');
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus('success');
    addToast("Message sent successfully!", "success");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-foreground/80">
      
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>

      <div className="space-y-4 border-b border-card-border pb-6">
        <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Connect with Us</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-foreground font-display leading-tight">
          Contact Trendloop
        </h1>
        <p className="text-xs text-foreground/50">For brand partnerships, newsletter sponsorships, or product submissions.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Contact details */}
        <div className="md:col-span-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Email</h3>
            <p className="text-xs font-bold text-foreground hover:text-gold">
              <a href="mailto:hello@trendloop.com">hello@trendloop.com</a>
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Socials</h3>
            <div className="flex flex-col gap-1 text-xs font-bold text-foreground">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-gold">Pinterest</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-gold">TikTok</a>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-8 bg-card border border-card-border p-6 rounded-2xl md:rounded-3xl shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-gold-light text-gold flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Message Sent!</h3>
              <p className="text-xs text-foreground/50">We'll get back to you within 24-48 hours.</p>
              <button
                onClick={() => setStatus('idle')}
                className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Email</label>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Message</label>
                <textarea
                  placeholder="Partnership query or submission details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold h-28 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                {status === 'loading' ? "Sending..." : "Send Message"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
