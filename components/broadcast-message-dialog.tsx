"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Users } from "lucide-react";
import toast from "react-hot-toast";
import { sendBroadcastMessage } from "@/util/server";

interface BroadcastMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educatorId: string;
  followerCount?: number;
}

export function BroadcastMessageDialog({
  open,
  onOpenChange,
  educatorId,
  followerCount = 0,
}: BroadcastMessageDialogProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a message title");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (title.length > 200) {
      toast.error("Title must be 200 characters or less");
      return;
    }

    if (message.length > 1000) {
      toast.error("Message must be 1000 characters or less");
      return;
    }

    try {
      setIsLoading(true);

      await sendBroadcastMessage(educatorId, {
        title: title.trim(),
        message: message.trim(),
      });

      toast.success(
        `Message sent successfully to ${followerCount} follower${
          followerCount !== 1 ? "s" : ""
        }!`
      );

      // Reset form and close dialog
      setTitle("");
      setMessage("");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error sending broadcast message:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined;
      toast.error(errorMessage || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setTitle("");
      setMessage("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Broadcast Message to All Followers
          </DialogTitle>
          <DialogDescription>
            This message will be sent to all student
            {followerCount !== 1 ? "s" : ""} who follow you. They will receive
            it as a notification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="message-title">
              Message Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="message-title"
              placeholder="e.g., Important Course Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/200 characters
            </p>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="broadcast-message"
              placeholder="This message will be sent to all your student followers. Keep it clear and informative..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={8}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !title.trim() || !message.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
