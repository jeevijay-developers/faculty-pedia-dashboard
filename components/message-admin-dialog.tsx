"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Shield, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import {
  createConversation,
  getConversationMessages,
  markConversationAsRead,
  markMessageAsRead,
  sendChatMessage,
  uploadChatImage,
} from "@/util/server";

interface Attachment {
  url: string;
  type?: string;
  filename?: string;
  size?: number;
}

interface Participant {
  userType: "Admin" | "Educator";
  userId:
    | string
    | {
        _id: string;
        fullName?: string;
        profilePicture?: string;
        image?: string;
      };
}

interface ChatMessage {
  _id: string;
  content: string;
  messageType: "text" | "image" | "file";
  attachments?: Attachment[];
  sender: { userId: string | { _id: string }; userType: "Admin" | "Educator" };
  receiver: {
    userId: string | { _id: string };
    userType: "Admin" | "Educator";
  };
  createdAt: string;
  isRead?: boolean;
  readAt?: string;
}

interface MessageAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educatorId: string;
}

const getBaseSocketUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:5000";

const resolveId = (user: string | { _id?: string }) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user._id || "";
};

export function MessageAdminDialog({
  open,
  onOpenChange,
  educatorId,
}: MessageAdminDialogProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adminLabel = useMemo(() => "Super Admin", []);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const fetchConversationAndMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const convoResponse = await createConversation();
      const conversation = convoResponse?.data?.conversation;
      if (!conversation?._id) {
        throw new Error("Conversation not available");
      }

      const adminParticipant = (conversation.participants || []).find(
        (p: Participant) => p.userType === "Admin"
      ) as Participant | undefined;

      const adminUserId = adminParticipant
        ? resolveId(adminParticipant.userId as any)
        : null;

      setConversationId(conversation._id);
      setAdminId(adminUserId);

      const messagesResponse = await getConversationMessages(
        conversation._id,
        1,
        100
      );
      const payload = messagesResponse?.data ?? messagesResponse;
      const history = payload?.data?.messages || payload?.messages || [];
      setMessages(history);

      // Mark everything as read when the conversation opens
      await markConversationAsRead(conversation._id);
    } catch (error) {
      console.error("Error preparing chat:", error);
      toast.error("Unable to load chat. Please try again.");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }, [markConversationAsRead, onOpenChange]);

  const connectSocket = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("faculty-pedia-auth-token")
        : null;

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    const socket = io(`${getBaseSocketUrl()}/admin-educator-chat`, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect_error", (err) => {
      console.error("Chat socket error", err.message);
      toast.error("Chat connection failed");
    });

    socket.on("new_message", ({ message }) => {
      if (message?.conversationId?.toString?.() === conversationId) {
        upsertMessage(message);

        // Immediately acknowledge receipt when educator is the receiver
        if (resolveId(message.receiver.userId) === educatorId) {
          void markMessageAsRead(message._id).catch((err) =>
            console.error("Failed to mark message read", err)
          );
        }
      }
    });

    socket.on("message_sent", ({ message }) => {
      if (message?.conversationId?.toString?.() === conversationId) {
        upsertMessage(message);
      }
    });

    socket.on("typing", ({ conversationId: cid, userId, isTyping: typing }) => {
      if (cid === conversationId && userId !== educatorId) {
        setIsTyping(typing);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (typing) {
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        }
      }
    });

    socketRef.current = socket;
  }, [conversationId, educatorId, upsertMessage]);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      setIsTyping(false);
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    void fetchConversationAndMessages();
  }, [open, fetchConversationAndMessages]);

  useEffect(() => {
    if (open && conversationId) {
      connectSocket();
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [open, conversationId, connectSocket]);

  const handleSendMessage = async (
    content: string,
    attachments: Attachment[] = [],
    messageType: "text" | "image" = "text"
  ) => {
    if (!conversationId || !adminId) {
      toast.error("Chat is not ready yet");
      return;
    }
    if (!content.trim()) {
      toast.error("Type a message before sending");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        conversationId,
        receiverId: adminId,
        receiverType: "Admin" as const,
        content,
        messageType,
        attachments,
      };

      if (socketRef.current?.connected) {
        socketRef.current.emit("send_message", payload);
        setInput("");
      } else {
        const response = await sendChatMessage(payload);
        const sent = response?.data?.message || response?.message;
        if (sent) {
          upsertMessage(sent);
        }
        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSendMessage(input.trim());
  };

  const handleTyping = () => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("typing", {
      conversationId,
      receiverId: adminId,
      isTyping: true,
    });
  };

  const handleSelectImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setIsUploading(true);
    try {
      const uploadResponse = await uploadChatImage(file);
      const attachment =
        uploadResponse?.data?.attachment || uploadResponse?.attachment;
      if (!attachment?.url) {
        throw new Error("Upload response missing URL");
      }
      const displayName = attachment.filename || file.name || "Image";
      await handleSendMessage(displayName, [attachment], "image");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const meId = educatorId;

  const renderMessage = (message: ChatMessage) => {
    const isMine = resolveId(message.sender.userId) === meId;
    const hasImage =
      message.messageType === "image" && message.attachments?.length;
    const attachment = hasImage ? message.attachments?.[0] : null;

    return (
      <div
        key={message._id}
        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isMine
              ? "bg-primary text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          {hasImage && attachment ? (
            <div className="mb-2">
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl border border-white/30"
              >
                <img
                  src={attachment.url}
                  alt={attachment.filename || "Image attachment"}
                  className="max-h-64 w-full object-cover"
                />
              </a>
            </div>
          ) : null}
          <p className="whitespace-pre-wrap leading-relaxed break-words">
            {message.content}
          </p>
          <p
            className={`mt-1 text-[11px] ${
              isMine ? "text-white/70" : "text-gray-500"
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Chat with Admin
          </DialogTitle>
          <DialogDescription>
            Real-time messages with the super admin. Attach images if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[520px] flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {adminLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {isTyping ? "Admin is typing..." : "Secure channel"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg border bg-white px-4 py-3">
            {isLoading ? (
              <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading conversation...
              </div>
            ) : sortedMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Start the conversation with the admin.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedMessages.map(renderMessage)}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleTyping}
                onKeyDown={handleTyping}
                placeholder="Type your message..."
                disabled={isSending || isUploading || isLoading}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={isUploading || isSending || isLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                Image
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={isSending || isUploading || !input.trim()}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
            />
          </form>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
