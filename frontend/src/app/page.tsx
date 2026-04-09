"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      id: "feature-live-polling",
      title: "Live Polling",
      desc: "Create polls and watch responses stream in real time via WebSocket.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: "feature-real-time",
      title: "6-Digit Entry",
      desc: "Students join your session instantly using a simple 6-digit room code — no complex URLs needed.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
        </svg>
      ),
    },
    {
      id: "feature-roles",
      title: "Role-Based Access",
      desc: "Separate dashboards for students, teachers, and admins with tailored permissions.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
  ];

  function getDashboardLink() {
    if (!user) return "/signup";
    if (user.role === "teacher") return "/teacher";
    if (user.role === "admin") return "/admin";
    return "/join";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 flex items-center justify-center px-6 py-24 overflow-hidden">
          {/* Subtle grid bg */}
          <div className="absolute inset-0 bg-grid opacity-40" />
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-3xl" />

          <div className="relative max-w-2xl mx-auto text-center">
            <div
              className={`transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-text-muted mb-8">
                <span className="dot-live" />
                Real-time classroom polling
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                <span className="text-text-primary">Engage your </span>
                <span className="gradient-text">classroom</span>
                <br />
                <span className="text-text-primary">in real time</span>
              </h1>

              <p className="text-base sm:text-lg text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
                Create live polls and collect instant responses
                — all without the complexity.
              </p>

              <div className="flex items-center justify-center gap-3">
                <Link
                  href={getDashboardLink()}
                  id="hero-cta-primary"
                  className="btn-primary !py-2.5 !px-5 text-sm"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    id="hero-login"
                    className="btn-secondary !py-2.5 !px-5 text-sm"
                  >
                    Log in
                  </Link>
                )}

              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div
              className={`text-center mb-14 transition-all duration-700 delay-100 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-3">
                Everything you need
              </h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                A minimal suite of tools designed for seamless classroom engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, idx) => (
                <div
                  key={feature.id}
                  id={feature.id}
                  className={`group p-5 rounded-xl border border-border bg-card hover:bg-card-hover transition-all duration-300 ${
                    mounted ? "animate-slide-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${200 + idx * 100}ms` }}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-muted text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>QuickPoll</span>
          <span>Built for classrooms</span>
        </div>
      </footer>
    </div>
  );
}
