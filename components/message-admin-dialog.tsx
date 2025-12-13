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
import { Loader2, Send, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { createConversation, sendChatMessage } from "@/util/server";

interface MessageAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educatorId: string;
}

export function MessageAdminDialog({
  open,
  onOpenChange,
}: MessageAdminDialogProps) {
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

    if (message.length > 5000) {
      toast.error("Message must be 5000 characters or less");
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Get or create conversation with admin
      const conversationResponse = await createConversation();

      if (!conversationResponse?.success) {
        throw new Error(
          conversationResponse?.message || "Failed to create conversation"
        );
      }

      const conversation = conversationResponse.data?.conversation;

      if (!conversation) {
        throw new Error("No conversation data received");
      }

      // Find the admin participant
      const adminParticipant = conversation.participants?.find(
        (p: { userType: string }) => p.userType === "Admin"
      );

      if (!adminParticipant) {
        throw new Error("Admin participant not found in conversation");
      }

      // Step 2: Send the message
      const fullMessage = `Subject: ${title}\n\n${message}`;

      // Extract the admin ID (handle both populated and unpopulated cases)
      const adminId =
        typeof adminParticipant.userId === "object"
          ? adminParticipant.userId._id
          : adminParticipant.userId;

      const messageResponse = await sendChatMessage({
        conversationId: conversation._id,
        receiverId: adminId,
        receiverType: "Admin",
        content: fullMessage,
        messageType: "text",
        attachments: [],
      });

      if (!messageResponse?.success) {
        throw new Error(messageResponse?.message || "Failed to send message");
      }

      toast.success("Message sent to admin successfully!");

      // Reset form and close dialog
      setTitle("");
      setMessage("");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error sending message to admin:", error);
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
            <Shield className="h-5 w-5 text-primary" />
            Message Admin
          </DialogTitle>
          <DialogDescription>
            Send a message directly to the platform administrator. They will
            respond as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="admin-message-title">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admin-message-title"
              placeholder="e.g., Technical Issue with Payment Gateway"
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
            <Label htmlFor="admin-message-content">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="admin-message-content"
              placeholder="Describe your issue or query in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              rows={10}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/5000 characters
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
