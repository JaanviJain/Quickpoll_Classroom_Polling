"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Hash, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function JoinPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit Room Code.");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/rooms/join`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ roomCode: code })
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to the dynamic poll page
        router.push(`/poll/${code}`);
      } else {
        setError(data.message || "Invalid or inactive Room Code.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (!user) {
    // If not logged in, redirect to login
    if (typeof window !== "undefined") router.push("/login?redirect=/join");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] shadow-2xl animate-scale-in text-center relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
          
          <div className="w-20 h-20 bg-primary-muted/20 border-2 border-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-float">
            <Hash className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-black text-text-primary mb-3 tracking-tight">Join a Room</h1>
          <p className="text-text-secondary text-sm mb-10 px-4">Enter the 6-digit session code provided by your instructor to participate in the live poll.</p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="relative group">
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="000 000"
                className="w-full bg-surface-elevated/50 border-2 border-glass-border rounded-2xl px-6 py-5 text-4xl font-black text-center tracking-[0.5em] text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted placeholder:tracking-normal placeholder:font-bold placeholder:text-xl group-hover:border-glass-border-hover"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 justify-center p-4 bg-danger-muted/20 border border-danger/20 rounded-2xl text-danger text-sm animate-shake">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={joining || code.length < 6}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {joining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Joining Room...
                </>
              ) : (
                <>
                  Enter Classroom <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-text-muted">
            By joining, you agree to our <span className="underline cursor-pointer">Classroom Etiquette</span> policy.
          </p>
        </div>
      </main>
    </div>
  );
}
