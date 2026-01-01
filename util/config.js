"use client";
import axios from "axios";

// Get base URL with fallbacks for deployment
const getBaseURL = () => {
  // Production URL (replace with your actual backend URL)
  const PRODUCTION_URL =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;

  // Development URL
  const DEVELOPMENT_URL = "http://localhost:5000";

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === "production";

  // Return appropriate URL
  if (isProduction && PRODUCTION_URL) {
    return PRODUCTION_URL;
  }

  return DEVELOPMENT_URL;
};

const API_CLIENT = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 second timeout to handle slow backend
  withCredentials: true,
});

API_CLIENT.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Check if in browser
      const TOKEN = localStorage.getItem("faculty-pedia-auth-token");

      // Always add auth token if we have one (for optional auth endpoints)
      if (TOKEN) {
        config.headers.Authorization = `Bearer ${TOKEN}`;
      }

      // Note: We no longer redirect to login here since browsing should be allowed without auth
      // Authentication requirements are now handled per-endpoint by the backend
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API_CLIENT.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error:", error.response?.status, error.message);

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isOnLoginPage =
        currentPath.includes("/login") || currentPath.includes("/signup");

      // Only redirect on 401 if:
      // 1. We're not already on a login page, AND
      // 2. This is NOT an enrollment-specific auth error (those are handled by EnrollButton)
      // 3. This is a critical auth failure (like token expired during an authenticated session)
      const isEnrollmentAuth = error.response?.data?.requiresAuth;
      const isCriticalAuthFailure =
        error.response?.status === 401 &&
        localStorage.getItem("faculty-pedia-auth-token") && // Had a token
        !isEnrollmentAuth; // Not an enrollment action

      if (isCriticalAuthFailure && !isOnLoginPage) {
        localStorage.removeItem("faculty-pedia-auth-token");
        localStorage.removeItem("faculty-pedia-student-data");
        localStorage.removeItem("faculty-pedia-educator-data");
        localStorage.removeItem("user-role");
        window.location.href =
          "/login?message=Session expired. Please login again.";
      }
    }
    return Promise.reject(error);
  }
);
export default API_CLIENT;
