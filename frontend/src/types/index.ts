export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Question {
  id: string;
  pollId: string;
  text: string;
  type: string; // "multiple_choice", "true_false", "open_ended"
  options: string; // JSON string
  order: number;
}

export interface Poll {
  id: string;
  title: string;
  isAnonymous: boolean;
  isActive: boolean;
  roomCode: string | null;
  createdById: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  questions: Question[];
  _count?: {
    questions: number;
  };
}

export interface PollResponse {
  id: string;
  pollId: string;
  questionId: string;
  userId: string | null;
  answerText: string | null;
  selectedOption: number | null;
  submittedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface QuestionResult {
  questionId: string;
  text: string;
  type: string;
  options: string[];
  summary: {
    option: string;
    count: number;
  }[];
  totalResponses: number;
  responses: PollResponse[];
}

export interface PollResults {
  poll: Poll;
  results: QuestionResult[];
  totalParticipants?: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  timestamp: string;
  admin: {
    name: string;
  };
}

export interface SystemMetrics {
  totalUsers: number;
  activePolls: number;
  totalResponses: number;
  recentResponses: number;
}
