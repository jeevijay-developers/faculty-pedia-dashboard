"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { createPayPerHourSession } from "@/util/server";
import { useAuth } from "@/contexts/auth-context";

// Simple alert components for now
const Alert = ({
  children,
  variant,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}) => (
  <div
    className={`relative w-full rounded-lg border p-4 ${
      variant === "destructive"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-green-200 bg-green-50 text-green-800"
    } ${className}`}
  >
    {children}
  </div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm flex items-center gap-2">{children}</div>
);

interface CreatePayPerHourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated?: () => void | Promise<void>;
}

interface FormData {
  subject: string;
  specialization: string;
  fees: string;
  preferredDate: string;
  duration: string;
  message: string;
}

export function CreatePayPerHourDialog({
  open,
  onOpenChange,
  onSessionCreated,
}: CreatePayPerHourDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    specialization: "",
    fees: "",
    preferredDate: "",
    duration: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { educator } = useAuth();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.subject.trim()) return "Subject is required";
    if (!formData.specialization) return "Specialization is required";
    if (!formData.fees.trim()) return "Fees is required";
    if (isNaN(Number(formData.fees)) || Number(formData.fees) < 0) {
      return "Fees must be a valid positive number";
    }
    if (!formData.preferredDate.trim()) return "Preferred date is required";
    if (!formData.duration.trim()) return "Duration is required";
    if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      return "Duration must be a valid positive number";
    }
    if (formData.message.length > 1000) {
      return "Message must not exceed 1000 characters";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionData = {
        educator: educator?._id || "",
        subject: formData.subject.trim(),
        specialization: formData.specialization,
        fees: formData.fees,
        preferredDate: formData.preferredDate.trim(),
        duration: Number(formData.duration),
        message: formData.message.trim(),
        status: "pending",
      };

      const response = await createPayPerHourSession(sessionData);

      // Success
      setSuccess(true);

      // Call the callback to refresh the parent component's data
      if (onSessionCreated) {
        onSessionCreated();
      }

      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          subject: "",
          specialization: "",
          fees: "",
          preferredDate: "",
          duration: "",
          message: "",
        });
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating pay per hour session:", error);

      // Handle different types of errors with a type guard for `unknown`
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as any).response;
        const status = response?.status;
        const data = response?.data;

        if (status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (status === 400) {
          setError(data?.message || "Invalid input data");
        } else if (status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(data?.message || "Failed to create session");
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        setError((error as any).message);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        subject: "",
        specialization: "",
        fees: "",
        preferredDate: "",
        duration: "",
        message: "",
      });
      setError(null);
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Pay Per Hour Session</DialogTitle>
          <DialogDescription>
            Set up a new tutoring session. Fill in the details below to create
            your offering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Pay Per Hour session created successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Physics"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) =>
                  handleInputChange("specialization", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                  <SelectItem value="NEET">NEET</SelectItem>
                  <SelectItem value="CBSE">CBSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fees">Fees (₹/hour) *</Label>
              <Input
                id="fees"
                type="number"
                placeholder="1500"
                min="0"
                value={formData.fees}
                onChange={(e) => handleInputChange("fees", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="2"
                min="1"
                max="8"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredDate">Preferred Date *</Label>
            <Input
              id="preferredDate"
              type="date"
              value={formData.preferredDate}
              onChange={(e) =>
                handleInputChange("preferredDate", e.target.value)
              }
              disabled={isLoading}
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Session Description</Label>
            <Textarea
              id="message"
              placeholder="Describe what you'll cover in this session..."
              rows={4}
              maxLength={1000}
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              disabled={isLoading}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.message.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : success ? (
              "Created!"
            ) : (
              "Create Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
