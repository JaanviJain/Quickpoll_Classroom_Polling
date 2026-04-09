"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft, Mail, Info } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-lg animate-scale-in text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="text-white font-black text-lg">Q</span>
          </div>
          <span className="text-2xl font-black text-text-primary tracking-tighter">QuickPoll</span>
        </Link>
        
        <div className="glass-card p-12 rounded-[3.5rem] border border-glass-border shadow-2xl relative">
          <div className="w-16 h-16 bg-accent-muted/20 border-2 border-accent/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>

          <h1 className="text-3xl font-black text-text-primary tracking-tight mb-4">Registration Restricted</h1>
          <p className="text-text-secondary text-base mb-8 leading-relaxed">
            QuickPoll accounts are managed strictly by system administrators to maintain classroom security and integrity. 
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-4 p-5 bg-card/40 rounded-3xl border border-glass-border text-left">
              <div className="mt-1 p-2 bg-primary/10 rounded-xl text-primary">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Contact Your Instructor</h3>
                <p className="text-xs text-text-secondary">Teachers can request accounts for their students directly from the IT department.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 bg-card/40 rounded-3xl border border-glass-border text-left">
              <div className="mt-1 p-2 bg-accent/10 rounded-xl text-accent">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Admin Invitations</h3>
                <p className="text-xs text-text-secondary">If you were invited, check your email for a temporary password and login link.</p>
              </div>
            </div>
          </div>

          <Link href="/login" className="w-full bg-primary hover:bg-primary-hover text-background font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 transform hover:scale-[1.02] active:scale-[0.98]">
            Go to Login
          </Link>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 mt-8 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>
      </div>
    </div>
  );
}
