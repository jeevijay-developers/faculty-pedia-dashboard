"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Lock, Eye, EyeOff, AlertCircle, KeyRound } from "lucide-react";
import { loginEducator, requestPasswordReset, resetPassword } from "@/util/server";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Dev mode detection
  const isDevMode = process.env.NODE_ENV === "development";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Password reset states
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Show loading toast
    const loadingToast = toast.loading("Signing in...");

    try {
      const response = await loginEducator(email, password);

      // Backend returns { TOKEN, educator } - we only need the token
      const token = response.data.tokens.accessToken;
      if (token) {
        // Login function will fetch educator data from API
        await login(token);

        toast.success("Login successful! Redirecting...", {
          id: loadingToast,
          duration: 2000,
        });
        // Navigation will happen automatically via useEffect
      } else {
        const errorMsg = "Invalid response from server. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg, {
          id: loadingToast,
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage = "Invalid email or password. Please try again.";

      // Handle specific error types
      const error = err as {
        code?: string;
        message?: string;
        response?: { data?: { message?: string } };
      };
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Backend server is not responding. Please check if the server is running.";
      } else if (
        error.code === "ERR_NETWORK" ||
        error.message?.includes("Network Error")
      ) {
        errorMessage =
          "Cannot connect to server. Please ensure your backend is running.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setResetEmail(email); // Pre-fill with login email if available
    
    // In dev mode, skip the OTP request dialog and go directly to reset password
    if (isDevMode) {
      setShowResetPasswordDialog(true);
    } else {
      // In prod mode, show the forgot password dialog first
      setShowForgotPasswordDialog(true);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsRequestingReset(true);
    const loadingToast = toast.loading("Sending reset code...");

    try {
      const response = await requestPasswordReset(resetEmail);
      toast.success(response.message || "Reset code sent to your email!", {
        id: loadingToast,
        duration: 4000,
      });

      // Check if in dev mode (message indicates no OTP needed)
      const isDevMode = response.message?.includes("dev mode");
      
      if (isDevMode) {
        // In dev mode, skip OTP and go straight to reset
        toast.success("Dev mode: You can reset password without OTP", {
          duration: 3000,
        });
      }

      setShowForgotPasswordDialog(false);
      setShowResetPasswordDialog(true);
      setOtp(""); // Clear OTP field
    } catch (err) {
      console.error("Password reset request error:", err);
      const error = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset code. Please try again.";
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
    } finally {
      setIsRequestingReset(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail || !newPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsResettingPassword(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      const response = await resetPassword(resetEmail, otp || "000000", newPassword);
      toast.success(
        response.message || "Password reset successful! Please login.",
        {
          id: loadingToast,
          duration: 4000,
        }
      );

      // Close dialog and reset form
      setShowResetPasswordDialog(false);
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Optionally set the email in login form
      setEmail(resetEmail);
    } catch (err) {
      console.error("Password reset error:", err);
      const error = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Show loading screen if checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg border relative z-10 gap-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="bg-muted p-4 rounded-2xl">
              <Image
                src="/logo-blue.png"
                alt="Facultypedia Logo"
                width={40}
                height={20}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Sign in to continue to Facultypedia
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="educator@facultypedia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 h-11 bg-background border-input focus:border-primary focus:ring-primary transition-colors"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 h-11 bg-background border-input focus:border-primary focus:ring-primary transition-colors"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-primary cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Forgot Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we&apos;ll send you a code to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestPasswordReset}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="educator@facultypedia.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isRequestingReset}
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPasswordDialog(false)}
                disabled={isRequestingReset}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRequestingReset}>
                {isRequestingReset ? "Sending..." : "Send Reset Code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {isDevMode ? "Reset Password (Dev Mode)" : "Reset Password"}
            </DialogTitle>
            <DialogDescription>
              {isDevMode
                ? "Enter your email and choose a new password."
                : "Enter the code sent to your email and choose a new password."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              {/* Email field - only shown in dev mode */}
              {isDevMode && (
                <div className="space-y-2">
                  <Label htmlFor="reset-email-in-dialog">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="reset-email-in-dialog"
                      type="email"
                      placeholder="educator@facultypedia.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isResettingPassword}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* OTP field - only shown in prod mode */}
              {!isDevMode && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-10"
                      maxLength={6}
                      disabled={isResettingPassword}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check your email for the verification code
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isResettingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isResettingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-600">Passwords do not match</p>
                </div>
              )}
            </div>
            <DialogFooter>
              {!isDevMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetPasswordDialog(false);
                    setShowForgotPasswordDialog(true);
                  }}
                  disabled={isResettingPassword}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetPasswordDialog(false)}
                disabled={isResettingPassword}
              >
                {isDevMode ? "Cancel" : "Close"}
              </Button>
              <Button
                type="submit"
                disabled={isResettingPassword || newPassword !== confirmPassword}
              >
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
