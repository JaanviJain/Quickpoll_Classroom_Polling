"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User, AuditLog, SystemMetrics, UserRole } from "@/types";
import {
  Users,
  Activity,
  ShieldAlert,
  Download,
  UserPlus,
  Trash2,
  ArrowUpCircle,
  BarChart3,
  CheckCircle2,
  LineChart,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, token, register } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [fetching, setFetching] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "teacher" as UserRole,
  });
  const [formError, setFormError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const fetchData = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const [uRes, lRes, mRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (lRes.ok) setLogs(await lRes.json());
      if (mRes.ok) setMetrics(await mRes.json());
    } catch (err) {
      console.error("Fetch admin data error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await register(newUser);
      setShowAddModal(false);
      setNewUser({ email: "", name: "", password: "", role: "teacher" });
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const promoteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: "teacher" }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    window.open(`${API_URL}/admin/export-all?token=${token}`, "_blank");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              System Administration
            </h1>
            <p className="text-text-secondary">
              Monitor platform activity and manage users.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                window.open("http://localhost:3000/d/quickpoll-sys", "_blank")
              }
              className="btn-secondary flex items-center gap-2 border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent"
            >
              <LineChart className="w-4 h-4" /> Monitor System
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export All (CSV)
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Users",
              value: metrics?.totalUsers ?? "...",
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Active Polls",
              value: metrics?.activePolls ?? "...",
              icon: Activity,
              color: "text-accent",
            },
            {
              label: "Total Responses",
              value: metrics?.totalResponses ?? "...",
              icon: BarChart3,
              color: "text-secondary",
            },
            {
              label: "Response Rate (7d)",
              value: metrics?.recentResponses ?? "...",
              icon: CheckCircle2,
              color: "text-warning",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between bg-card/30">
                <h2 className="text-lg font-bold text-text-primary">
                  User Management
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase text-text-muted font-semibold bg-surface-elevated/50">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-card-hover/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-text-primary">
                              {u.name}
                            </span>
                            <span className="text-xs text-text-muted">
                              {u.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              u.role === "admin"
                                ? "bg-primary-muted text-primary"
                                : u.role === "teacher"
                                  ? "bg-accent-muted text-accent"
                                  : "bg-surface-elevated text-text-muted"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {u.role === "student" && (
                            <button
                              onClick={() => promoteUser(u.id)}
                              title="Promote to Teacher"
                              className="p-1.5 text-text-muted hover:text-accent transition-colors"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.id !== user.id && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              title="Delete User"
                              className="p-1.5 text-text-muted hover:text-danger transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Audit Logs Sidebar */}
          <div className="space-y-6">
            <div
              className="glass-card rounded-2xl h-[calc(100vh-300px)] flex flex-col animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <div className="px-6 py-4 border-b border-glass-border flex items-center gap-2 bg-card/30">
                <ShieldAlert className="w-5 h-5 text-warning" />
                <h2 className="text-lg font-bold text-text-primary">
                  Audit Logs
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-glass-border bg-surface-elevated/40 text-xs"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-text-primary">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">
                      <span className="font-medium text-text-primary">
                        {log.admin.name}
                      </span>{" "}
                      acted on {log.targetType} ({log.targetId?.slice(0, 8)})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl animate-scale-in">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Create New User
            </h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="input-field"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as UserRole })
                  }
                  className="input-field"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formError && (
                <p className="text-xs text-danger bg-danger-muted/20 p-3 rounded-lg border border-danger/20">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
