const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Polls
  createPoll: (data: {
    roomCode: string;
    title: string;
    questionType: string;
    question: string;
    options: string[];
    isAnonymousAllowed: boolean;
  }) => request("/polls", { method: "POST", body: JSON.stringify(data) }),

  getPollsByRoom: (roomCode: string) =>
    request(`/polls/room/${roomCode}`),

  getPollResults: (pollId: string) =>
    request(`/polls/${pollId}/results`),

  closePoll: (pollId: string) =>
    request(`/polls/${pollId}/close`, { method: "PATCH" }),

  submitResponse: (data: {
    pollId: string;
    studentName: string | null;
    answer: string;
    isAnonymous: boolean;
  }) => request("/polls/respond", { method: "POST", body: JSON.stringify(data) }),

  exportResults: (pollId: string) =>
    `${API_URL}/polls/${pollId}/export`,

  // Events
  createEvent: (data: {
    title: string;
    description: string;
    date: string;
    location: string;
  }) => request("/events", { method: "POST", body: JSON.stringify(data) }),

  getEvents: () => request("/events"),

  getEvent: (eventId: string) => request(`/events/${eventId}`),

  // RSVP
  submitRSVP: (data: {
    eventId: string;
    name: string;
    email: string;
  }) => request("/rsvp", { method: "POST", body: JSON.stringify(data) }),

  getEventRSVPs: (eventId: string) =>
    request(`/rsvp/event/${eventId}`),

  checkIn: (qrData: string) =>
    request("/rsvp/checkin", { method: "POST", body: JSON.stringify({ qrData }) }),

  // Room
  createRoom: () => request("/rooms", { method: "POST" }),

  validateRoom: (roomCode: string) =>
    request(`/rooms/${roomCode}/validate`),
};
