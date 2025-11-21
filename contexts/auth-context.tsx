"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentEducator } from "@/util/server";

export interface Educator {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  mobileNumber: string;
  description?: string;
  specialization: string[];
  class: string[];
  subject: string[];
  profilePicture?: string;
  image?: {
    url?: string;
  };
  introVideo?: string;
  payPerHourFee?: number;
  followers: string[];
  status: string;
  rating?: {
    average?: number;
    count?: number;
  };
  courses?: string[];
  questions?: string[];
  testSeries?: string[];
  webinars?: string[];
  tests?: string[];
  posts?: string[];
  yoe?: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  educator: Educator | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshEducator: () => Promise<void>;
  getFullName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [educator, setEducator] = useState<Educator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch educator data from API
  const fetchEducatorData = async () => {
    try {
      const response = await getCurrentEducator();
      setEducator(response.educator);
    } catch (error) {
      console.error("Error fetching educator data:", error);
      // If token is invalid or expired, clear auth
      localStorage.removeItem("faculty-pedia-auth-token");
      localStorage.removeItem("user-role");
      setEducator(null);
      throw error;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("faculty-pedia-auth-token");

      if (token) {
        try {
          await fetchEducatorData();
        } catch (error) {
          console.error("Failed to fetch educator on mount:", error);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function - only stores token, fetches educator data
  const login = async (token: string) => {
    localStorage.setItem("faculty-pedia-auth-token", token);
    localStorage.setItem("user-role", "educator");

    try {
      await fetchEducatorData();
    } catch (error) {
      // If fetching fails, clear token
      localStorage.removeItem("faculty-pedia-auth-token");
      localStorage.removeItem("user-role");
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("faculty-pedia-auth-token");
    localStorage.removeItem("user-role");
    setEducator(null);
    router.push("/");
  };

  // Refresh educator data (call after updates)
  const refreshEducator = async () => {
    try {
      await fetchEducatorData();
    } catch (error) {
      console.error("Failed to refresh educator data:", error);
      throw error;
    }
  };

  // Get full name helper
  const getFullName = () => {
    if (!educator) return "Educator";
    if (educator.fullName) return educator.fullName;
    return educator.username || "Educator";
  };

  const value = {
    educator,
    isAuthenticated: !!educator,
    isLoading,
    login,
    logout,
    refreshEducator,
    getFullName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
