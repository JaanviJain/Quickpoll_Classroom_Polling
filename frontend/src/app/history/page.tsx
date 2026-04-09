"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  History,
  Calendar,
  CheckSquare,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

export default function StudentHistoryPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/user/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setHistory(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user, token]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-muted/20 rounded-2xl flex items-center justify-center border border-primary/20">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Your History
            </h1>
            <p className="text-text-secondary text-sm">
              Review your past poll participation and answers.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((entry, idx) => (
              <div
                key={entry.id}
                className="glass-card p-6 rounded-3xl border border-glass-border hover:bg-card/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {entry.selectedOption !== null ? (
                      <CheckSquare className="w-5 h-5 text-accent" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                      {entry.poll.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-1 mb-2 italic">
                      "{entry.question?.text || "No question text"}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] bg-surface-elevated px-2 py-0.5 rounded-full text-text-muted font-bold uppercase">
                        {entry.question?.type === "open_ended"
                          ? "Open Text"
                          : "Multiple Choice"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-elevated/50 p-4 rounded-2xl min-w-[160px] md:text-right">
                  <span className="text-[10px] text-text-muted uppercase font-black tracking-widest block mb-1">
                    Your Answer
                  </span>
                  <p className="text-sm font-black text-text-primary truncate">
                    {entry.answerText || "Option " + (entry.selectedOption + 1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-card rounded-[3rem] border-dashed border-glass-border">
            <div className="w-16 h-16 bg-surface-elevated rounded-3xl flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
              <History className="w-8 h-8 text-text-muted" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              No History Found
            </h2>
            <p className="text-text-secondary text-sm max-w-xs mx-auto mb-8">
              You haven't participated in any polls yet. Join a room and share
              your thoughts!
            </p>
            <button
              onClick={() => router.push("/join")}
              className="btn-primary"
            >
              Join a Room
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
