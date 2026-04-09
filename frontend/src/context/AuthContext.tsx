"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { User, UserRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => ({} as User),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("quickpoll-token");
    const storedUser = localStorage.getItem("quickpoll-user");

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
        setToken(storedToken);
      } catch {
        localStorage.removeItem("quickpoll-token");
        localStorage.removeItem("quickpoll-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const authUser = data.user as User;
    setUser(authUser);
    setToken(data.token);
    localStorage.setItem("quickpoll-token", data.token);
    localStorage.setItem("quickpoll-user", JSON.stringify(authUser));
  };

  const register = async (registerData: RegisterData) => {
    if (!token) throw new Error("Authentication required to register users");
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data as User;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("quickpoll-token");
    localStorage.removeItem("quickpoll-user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
