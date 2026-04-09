"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import Navbar from "@/components/Navbar";
import { Poll, PollResults, Question } from "@/types";
import {
  CheckCircle2,
  Clock,
  BarChart3,
  Send,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Hash,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function StudentPollPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const { user, token } = useAuth();
  const router = useRouter();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [hasCompletedAll, setHasCompletedAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Voting State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");

  const [results, setResults] = useState<any>(null);
  const [resultsIdx, setResultsIdx] = useState(0);

  const fetchRoomData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setPoll(data.poll);
        setHasCompletedAll(data.hasVoted);
        setCurrentQuestionIdx(data.answeredCount); // Start at the next unanswered question

        if (data.hasVoted) fetchResults();
      } else {
        setError(data.message || "Failed to join room.");
      }
    } catch (err) {
      setError("Connection error. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms/${roomCode}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/poll/" + roomCode);
      return;
    }
    fetchRoomData();
  }, [user, token, roomCode]);

  // Socket
  useEffect(() => {
    if (!roomCode) return;
    const socket = getSocket();
    socket.emit("room:join", { roomCode });

    socket.on("poll:start", (newPoll) => {
      setPoll(newPoll);
      setHasCompletedAll(false);
      setCurrentQuestionIdx(0);
      setResults(null);
      setSelectedOption(null);
      setAnswerText("");
    });

    socket.on("poll:stop", () => {
      if (poll) setPoll({ ...poll, isActive: false });
    });

    socket.on("results:live", () => {
      if (hasCompletedAll) fetchResults();
    });

    return () => {
      socket.off("poll:start");
      socket.off("poll:stop");
      socket.off("results:live");
    };
  }, [roomCode, hasCompletedAll, poll?.id]);

  const handleSubmit = async () => {
    if (!poll || !poll.questions[currentQuestionIdx] || submitting) return;
    setSubmitting(true);
    setError("");

    const currentQuestion = poll.questions[currentQuestionIdx];

    try {
      const res = await fetch(`${API_URL}/rooms/${roomCode}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOption,
          answerText,
        }),
      });

      if (res.ok) {
        const nextIdx = currentQuestionIdx + 1;
        if (nextIdx >= poll.questions.length) {
          setHasCompletedAll(true);
          fetchResults();
          // Notify teacher via socket
          const socket = getSocket();
          socket.emit("vote:cast", { roomCode, pollId: poll.id });
        } else {
          setCurrentQuestionIdx(nextIdx);
          setSelectedOption(null);
          setAnswerText("");
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit answer.");
      }
    } catch (err) {
      setError("Network error when voting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="glass-card p-10 rounded-[2.5rem] border-danger/20">
            <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Room Error
            </h1>
            <p className="text-text-secondary mb-8">{error}</p>
            <button
              onClick={() => router.push("/join")}
              className="btn-primary w-full"
            >
              Try Another Code
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = poll?.questions[currentQuestionIdx];
  const startTime = poll?.startedAt || poll?.createdAt;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {poll ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] bg-primary-muted text-primary border border-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 inline-block">
                  Live Classroom Session
                </span>
                <h1 className="text-3xl font-black text-text-primary tracking-tight">
                  {poll.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-text-muted bg-card px-4 py-2 rounded-2xl border border-glass-border">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold tracking-tight">
                  Started{" "}
                  {startTime
                    ? new Date(startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>
            </div>

            <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-glass-border shadow-xl relative overflow-hidden">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 h-1.5 bg-surface-elevated w-full">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{
                    width: `${((currentQuestionIdx + (hasCompletedAll ? 1 : 0)) / poll.questions.length) * 100}%`,
                  }}
                />
              </div>

              {!hasCompletedAll && poll.isActive && currentQuestion ? (
                <div className="space-y-8 mt-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                      Question {currentQuestionIdx + 1} of{" "}
                      {poll.questions.length}
                    </span>
                    <div className="flex items-center gap-2 bg-surface-elevated/50 px-2.5 py-1 rounded-full text-[10px] font-bold text-text-muted">
                      <Hash className="w-3 h-3" />
                      {currentQuestion.type === "multiple_choice"
                        ? "Choice"
                        : currentQuestion.type === "true_false"
                          ? "True/False"
                          : "Open Text"}
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-text-primary leading-tight">
                    {poll.questions.length > 0
                      ? currentQuestion?.text
                      : "No questions available."}
                  </h2>

                  <div className="space-y-4">
                    {(currentQuestion.type === "multiple_choice" ||
                      currentQuestion.type === "true_false") && (
                      <div className="grid grid-cols-1 gap-3">
                        {JSON.parse(currentQuestion.options).map(
                          (option: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedOption(idx)}
                              className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all transform active:scale-[0.98] ${
                                selectedOption === idx
                                  ? "bg-primary border-primary text-background shadow-lg shadow-primary/20"
                                  : "bg-surface-elevated/40 border-glass-border text-text-primary hover:border-primary/50 hover:bg-card-hover/20"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedOption === idx
                                      ? "border-background bg-background"
                                      : "border-text-muted/30"
                                  }`}
                                >
                                  {selectedOption === idx && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                  )}
                                </div>
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    )}

                    {currentQuestion.type === "open_ended" && (
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your response here..."
                        className="input-field min-h-[160px] text-lg p-6 rounded-3xl"
                      />
                    )}

                    <div className="pt-6">
                      <button
                        onClick={handleSubmit}
                        disabled={
                          submitting ||
                          (selectedOption === null && !answerText.trim())
                        }
                        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-background font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {currentQuestionIdx === poll.questions.length - 1
                              ? "Finish Quiz"
                              : "Next Question"}{" "}
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      {error && (
                        <p className="text-xs text-danger text-center mt-3 font-semibold">
                          {error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 animate-fade-in">
                  {poll.questions.length > 0 ? (
                    <>
                      <div className="w-16 h-16 bg-accent-muted/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-accent" />
                      </div>
                      <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">
                        Responses Recorded
                      </h2>
                      <p className="text-text-secondary text-sm">
                        Your answers have been securely submitted to the
                        instructor.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-danger-muted/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-danger" />
                      </div>
                      <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">
                        No Questions Found
                      </h2>
                      <p className="text-text-secondary text-sm">
                        This session was created without any questions. Please
                        ask your instructor to update it.
                      </p>
                    </>
                  )}
                  {!poll.isActive && (
                    <div className="pt-8">
                      <p className="text-xs font-bold text-text-muted mb-4 uppercase tracking-widest">
                        The session has ended
                      </p>
                      <button
                        onClick={() => router.push("/join")}
                        className="btn-secondary"
                      >
                        Join another room
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Waiting for session data...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ChevronLeftIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
