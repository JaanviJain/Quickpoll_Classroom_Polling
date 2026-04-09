"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, History, PlusCircle, Shield, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-glass-border backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="text-white font-black text-sm">Q</span>
          </div>
          <span className="text-lg font-black text-text-primary tracking-tighter">
            QuickPoll
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {user && (
            <>
              {user.role === "admin" && (
                <Link href="/admin" id="nav-admin" className="nav-link flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              {(user.role === "teacher" || user.role === "admin") && (
                <Link href="/teacher" id="nav-teacher" className="nav-link flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Instructor Dashboard
                </Link>
              )}
              {user.role === "student" && (
                <>
                  <Link href="/join" id="nav-join" className="nav-link flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Join Class
                  </Link>
                  <Link href="/history" id="nav-history" className="nav-link flex items-center gap-2">
                    <History className="w-4 h-4" /> Participation History
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="w-px h-6 bg-glass-border mx-1" />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-surface-elevated/40 border border-glass-border">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-text-primary leading-none">{user.name}</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-glass-border">
                  <span className="text-xs font-black text-primary uppercase">{user.name.charAt(0)}</span>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={logout}
                className="p-2 text-text-muted hover:text-danger hover:bg-danger-muted/20 rounded-xl transition-all"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="nav-login"
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Log in
              </Link>
              <Link
                href="/signup"
                id="nav-signup"
                className="btn-primary !px-5 !py-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
