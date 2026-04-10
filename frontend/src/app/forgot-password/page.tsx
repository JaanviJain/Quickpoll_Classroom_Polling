"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(
        "Failed to connect to the server. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
              <span className="text-white font-black text-lg">Q</span>
            </div>
            <span className="text-2xl font-black text-text-primary tracking-tighter">
              QuickPoll
            </span>
          </Link>
          <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
            Reset Password
          </h1>
          <p className="text-text-secondary text-sm">
            We'll send you instructions to get back in.
          </p>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border border-glass-border shadow-2xl relative">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field !pl-12 !py-4 text-sm bg-surface-elevated/30 focus:bg-card/50"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-danger bg-danger-muted/10 p-3 rounded-xl border border-danger/20">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-background font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 transform hover:translate-y-[-2px] active:translate-y-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-text-primary">
                  Check your email
                </h2>
                <p className="text-sm text-text-secondary px-4">
                  We've sent a password reset link to{" "}
                  <span className="text-text-primary font-bold">{email}</span>{" "}
                  if the account exists.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline pt-4"
              >
                Return to sign in <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
