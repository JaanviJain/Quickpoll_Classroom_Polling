"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Poll, PollResults, QuestionResult, PollResponse } from "@/types";
import { 
  PlusCircle, 
  Play, 
  Square, 
  Users, 
  Download, 
  Activity,
  UserCheck,
  Trash2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Type,
  ListIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: "",
    isAnonymous: false,
    questions: [
      { text: "", type: "multiple_choice", options: ["Option 1", "Option 2"] }
    ]
  });

  const [pollResults, setPollResults] = useState<PollResults | null>(null);
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const [attendance, setAttendance] = useState<any[]>([]);

  const fetchPolls = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/polls/my-polls`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const allPolls = await res.json();
        setPolls(allPolls);
        const active = allPolls.find((p: Poll) => p.isActive);
        if (active) {
          setActivePoll(active);
          fetchResults(active.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchResults = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/polls/${id}/results`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPollResults(data);
        if (!data.poll.isAnonymous) {
          fetchAttendance(id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/polls/${id}/attendance`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setAttendance(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      router.push("/login");
      return;
    }
    fetchPolls();
  }, [user, token, router]);

  // Socket setup
  useEffect(() => {
    if (!activePoll?.roomCode) return;
    
    const socket = getSocket();
    socket.emit("room:join", { roomCode: activePoll.roomCode });
    
    socket.on("room:student-count", ({ count }) => setConnectedCount(count));
    
    socket.on("results:live", () => {
      fetchResults(activePoll.id);
    });

    return () => {
      socket.off("room:student-count");
      socket.off("results:live");
    };
  }, [activePoll?.roomCode]);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newPoll)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewPoll({ 
          title: "", 
          isAnonymous: false, 
          questions: [{ text: "", type: "multiple_choice", options: ["Option 1", "Option 2"] }] 
        });
        fetchPolls();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePoll = async (poll: Poll) => {
    try {
      const endpoint = poll.isActive ? "stop" : "start";
      const res = await fetch(`${API_URL}/polls/${poll.id}/${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        const socket = getSocket();
        if (endpoint === "start") {
          socket.emit("poll:start", { roomCode: updated.roomCode, poll: updated });
        } else {
          socket.emit("poll:stop", { roomCode: poll.roomCode });
        }
        fetchPolls();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (id: string) => {
    window.open(`${API_URL}/polls/${id}/export?token=${token}`, "_blank");
  };

  const addQuestion = () => {
    setNewPoll({
      ...newPoll,
      questions: [...newPoll.questions, { text: "", type: "multiple_choice", options: ["Option 1", "Option 2"] }]
    });
  };

  const removeQuestion = (idx: number) => {
    if (newPoll.questions.length > 1) {
      const qs = [...newPoll.questions];
      qs.splice(idx, 1);
      setNewPoll({ ...newPoll, questions: qs });
    }
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const qs = [...newPoll.questions];
    (qs[idx] as any)[field] = value;
    setNewPoll({ ...newPoll, questions: qs });
  };

  const activeQuestionResult = pollResults?.results[activeResultIdx];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Teacher Dashboard</h1>
            <p className="text-text-secondary">Create and manage your classroom sessions.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Create New Quiz
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider px-2">My Sessions</h2>
            <div className="space-y-3">
              {polls.map((poll) => (
                <div 
                  key={poll.id} 
                  onClick={() => { setActivePoll(poll); fetchResults(poll.id); setActiveResultIdx(0); }}
                  className={`glass-card p-4 rounded-xl cursor-pointer transition-all border-l-4 ${
                    activePoll?.id === poll.id ? "border-l-primary ring-1 ring-primary/20 bg-primary-muted/10" : "border-l-transparent bg-card/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      poll.isActive ? "bg-accent-muted text-accent" : "bg-surface-elevated text-text-muted"
                    }`}>
                      {poll.isActive ? "Active" : "Closed"}
                    </span>
                    <span className="text-[10px] text-text-muted">{poll._count?.questions} questions</span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary truncate">{poll.title}</h3>
                </div>
              ))}
              {polls.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-glass-border rounded-2xl">
                  <p className="text-sm text-text-muted">No sessions created yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-8 space-y-6">
            {activePoll ? (
              <div className="glass-card rounded-3xl p-8 animate-fade-in border border-primary/10">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">{activePoll.title}</h2>
                    <div className="flex gap-4">
                       <span className="text-xs text-text-muted">Created {new Date(activePoll.createdAt).toLocaleDateString()}</span>
                       <span className="text-xs text-text-muted">•</span>
                       <span className="text-xs text-text-muted">{activePoll.isAnonymous ? "Anonymous Mode" : "Identity Recorded"}</span>
                    </div>
                  </div>
                  
                  {activePoll.isActive && (
                    <div className="flex flex-col items-center justify-center p-4 bg-primary-muted/20 border border-primary/20 rounded-2xl min-w-[160px]">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Room Code</span>
                      <span className="text-3xl font-black text-primary tracking-tighter">{activePoll.roomCode}</span>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-primary/70">
                        <Users className="w-3.5 h-3.5" /> {connectedCount} connected
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-12">
                  <button 
                    onClick={() => togglePoll(activePoll)} 
                    className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      activePoll.isActive ? "bg-danger-muted text-danger border border-danger/20" : "bg-accent text-background"
                    }`}
                  >
                    {activePoll.isActive ? <><Square className="w-4 h-4" /> Stop Session</> : <><Play className="w-4 h-4" /> Start Session</>}
                  </button>
                  <button onClick={() => handleExport(activePoll.id)} className="btn-secondary flex-1 min-w-[140px] flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export All (CSV)
                  </button>
                </div>

                {/* Multi-Question Results Navigation */}
                {pollResults && pollResults.results.length > 0 ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-glass-border pb-4">
                      <div className="flex items-center gap-4">
                        <button 
                          disabled={activeResultIdx === 0}
                          onClick={() => setActiveResultIdx(v => v - 1)}
                          className="p-2 rounded-lg hover:bg-surface-elevated disabled:opacity-20"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Question {activeResultIdx + 1} of {pollResults.results.length}</p>
                          <p className="text-sm font-bold text-text-primary px-2">{activeQuestionResult?.text}</p>
                        </div>
                        <button 
                          disabled={activeResultIdx === pollResults.results.length - 1}
                          onClick={() => setActiveResultIdx(v => v + 1)}
                          className="p-2 rounded-lg hover:bg-surface-elevated disabled:opacity-20"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Responses</h3>
                        <div className="h-[300px] w-full bg-card/30 rounded-2xl p-4 border border-glass-border">
                          {activeQuestionResult?.summary.some(s => s.count > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={activeQuestionResult.summary} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="option" type="category" width={100} tick={{fontSize: 10, fill: '#888'}} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                  {activeQuestionResult.summary.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                               <div className="h-full flex items-center justify-center text-xs text-text-muted italic">Waiting for responses to this question...</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2"><UserCheck className="w-5 h-5 text-accent" /> Participation</h3>
                        <div className="h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                          {activePoll.isAnonymous ? (
                            <div className="bg-surface-elevated/40 p-6 rounded-2xl text-center"><p className="text-xs text-text-muted">Identity obscured.</p></div>
                          ) : activeQuestionResult?.responses.length ? (
                            activeQuestionResult.responses.map((v, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-card/30 border border-glass-border rounded-xl">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-text-primary">{v.user?.name}</span>
                                  <span className="text-[10px] text-text-muted">{activeQuestionResult.type === 'open_ended' ? v.answerText : activeQuestionResult.options[v.selectedOption!]}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12 text-xs text-text-muted italic">No responses yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                    <div className="text-center py-20 bg-surface-elevated/20 rounded-3xl border border-dashed border-glass-border">
                         <p className="text-sm text-text-muted font-medium">Session results will appear here once students start voting.</p>
                    </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center glass-card rounded-3xl border border-dashed border-glass-border">
                <Activity className="w-12 h-12 text-text-muted mb-4" />
                <h2 className="text-xl font-bold text-text-primary mb-1">No Session Selected</h2>
                <p className="text-sm text-text-secondary">Choose a quiz from the sidebar to view results.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="max-w-2xl w-full glass-card p-8 rounded-3xl animate-scale-in my-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Quiz Session</h2>
            <form onSubmit={handleCreatePoll} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Quiz Title</label>
                <input required type="text" value={newPoll.title} onChange={(e) => setNewPoll({...newPoll, title: e.target.value})} className="input-field" placeholder="Weekly Knowledge Check" />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Questions</h3>
                    <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                </div>

                {newPoll.questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-6 bg-card/40 border border-glass-border rounded-2xl relative animate-fade-in">
                    {newPoll.questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qIdx)} className="absolute top-4 right-4 text-danger hover:opacity-70">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                             <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Question {qIdx + 1}</label>
                             <input required type="text" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} className="input-field !py-2.5" placeholder="Enter question text..." />
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Type</label>
                             <select value={q.type} onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)} className="input-field !py-2.5">
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="true_false">True / False</option>
                                <option value="open_ended">Open Ended</option>
                             </select>
                        </div>
                    </div>

                    {q.type === 'multiple_choice' && (
                        <div className="space-y-2 mt-4">
                           <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Options</label>
                           {q.options.map((opt, oIdx) => (
                               <div key={oIdx} className="flex gap-2">
                                  <input 
                                    required
                                    type="text" 
                                    value={opt} 
                                    onChange={(e) => {
                                        const opts = [...q.options];
                                        opts[oIdx] = e.target.value;
                                        updateQuestion(qIdx, 'options', opts);
                                    }}
                                    className="input-field !py-1.5 !px-3 text-xs" 
                                    placeholder={`Option ${oIdx + 1}`}
                                  />
                                  {q.options.length > 2 && (
                                      <button type="button" onClick={() => {
                                          const opts = q.options.filter((_, i) => i !== oIdx);
                                          updateQuestion(qIdx, 'options', opts);
                                      }} className="text-danger p-1">
                                          <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                  )}
                               </div>
                           ))}
                           {q.options.length < 6 && (
                               <button type="button" onClick={() => updateQuestion(qIdx, 'options', [...q.options, `Option ${q.options.length+1}`])}
                                className="text-[10px] font-bold text-primary hover:underline ml-1">
                                    + Add Option
                                </button>
                           )}
                        </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-elevated/40 rounded-2xl border border-glass-border">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-accent" />
                    <div>
                        <p className="text-xs font-bold text-text-primary">Anonymous Mode</p>
                        <p className="text-[10px] text-text-muted">Hide student names in results</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setNewPoll({...newPoll, isAnonymous: !newPoll.isAnonymous})}
                    className={`relative w-10 h-6 rounded-full transition-colors ${newPoll.isAnonymous ? "bg-accent" : "bg-border"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${newPoll.isAnonymous ? "translate-x-4" : ""}`} />
                  </button>
              </div>

              <div className="flex gap-3 pt-6 border-t border-glass-border">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
