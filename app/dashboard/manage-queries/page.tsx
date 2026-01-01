"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, MoreHorizontal, Loader2, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { getEducatorQueries, replyToQuery, resolveQuery } from "@/util/server";
import { useToast } from "@/hooks/use-toast";
import { MessageAdminDialog } from "@/components/message-admin-dialog";

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface Query {
  _id: string;
  student: {
    _id: string;
    fullName: string;
    mobileNumber?: string;
  };
  educator: string;
  subject: string;
  messages: Message[];
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export default function ManageQueriesPage() {
  const { educator } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewReplyOpen, setViewReplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [queryToDelete, setQueryToDelete] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [messageAdminOpen, setMessageAdminOpen] = useState(false);

  // Helper function to normalize API response
  const normalizeQueriesResponse = (response: unknown): Query[] => {
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === "object") {
      const resp = response as Record<string, unknown>;
      if (resp.queries && Array.isArray(resp.queries)) {
        return resp.queries;
      } else if (resp.data && Array.isArray(resp.data)) {
        return resp.data;
      } else if (resp.data && typeof resp.data === "object") {
        const data = resp.data as Record<string, unknown>;
        if (data.queries && Array.isArray(data.queries)) {
          return data.queries;
        }
      }
    }
    return [];
  };

  // Fetch queries from API
  useEffect(() => {
    const fetchQueries = async () => {
      if (!educator?._id) return;

      try {
        setIsLoading(true);
        const response = await getEducatorQueries(educator._id);

        const queriesData = normalizeQueriesResponse(response);
        setQueries(queriesData);
      } catch (error) {
        console.error("Error fetching queries:", error);
        setQueries([]); // Set empty array on error
        toast({
          title: "Error",
          description: "Failed to fetch queries. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueries();
  }, [educator?._id, toast]);

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Get unique subjects for filter dropdown
  const uniqueSubjects = Array.from(
    new Set(queries.map((q) => q.subject).filter(Boolean))
  ).sort();

  // Filter queries based on search, status, and subject
  const filteredQueries = Array.isArray(queries)
    ? queries.filter((query) => {
        // Search filter
        const studentName = query.student?.fullName || "";
        const phoneNumber = query.student?.mobileNumber || "";
        const subject = query.subject || "";
        const firstMessage = query.messages?.[0]?.content || "";

        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          !debouncedSearchQuery ||
          studentName.toLowerCase().includes(searchLower) ||
          phoneNumber.includes(debouncedSearchQuery) ||
          subject.toLowerCase().includes(searchLower) ||
          firstMessage.toLowerCase().includes(searchLower);

        // Status filter
        const replied = hasReply(query);
        const queryStatus =
          query.status === "closed"
            ? "resolved"
            : replied
            ? "replied"
            : "pending";
        const matchesStatus =
          statusFilter === "all" || queryStatus === statusFilter;

        // Subject filter
        const matchesSubject =
          subjectFilter === "all" || query.subject === subjectFilter;

        return matchesSearch && matchesStatus && matchesSubject;
      })
    : [];

  // Handle view reply
  const handleViewReply = (query: Query) => {
    setSelectedQuery(query);
    setViewReplyOpen(true);
  };

  // Handle edit
  const handleEdit = (query: Query) => {
    setSelectedQuery(query);
    const lastReply = getEducatorReply(query);
    setReplyText(lastReply?.content || "");
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    try {
      setIsSubmitting(true);
      await replyToQuery(selectedQuery._id, replyText.trim());

      // Refresh queries after successful reply
      if (educator?._id) {
        const response = await getEducatorQueries(educator._id);
        setQueries(normalizeQueriesResponse(response));
      }

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      setEditOpen(false);
      setSelectedQuery(null);
      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (query: Query) => {
    setQueryToDelete(query);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!queryToDelete) return;

    try {
      setIsSubmitting(true);
      await resolveQuery(queryToDelete._id);

      // Refresh queries after successful resolution
      if (educator?._id) {
        const response = await getEducatorQueries(educator._id);
        setQueries(normalizeQueriesResponse(response));
      }

      toast({
        title: "Success",
        description: "Query resolved successfully",
      });

      setDeleteOpen(false);
      setQueryToDelete(null);
    } catch (error) {
      console.error("Error resolving query:", error);
      toast({
        title: "Error",
        description: "Failed to resolve query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the latest educator message in a query
  const getEducatorReply = (query: Query) => {
    if (!educator?._id || !query.messages || query.messages.length === 0) {
      return null;
    }

    // Find the last message from the educator
    const educatorMessages = query.messages.filter(
      (msg) => msg.sender === educator._id
    );

    return educatorMessages.length > 0
      ? educatorMessages[educatorMessages.length - 1]
      : null;
  };

  // Check if query has been replied to
  const hasReply = (query: Query) => {
    return getEducatorReply(query) !== null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Manage Queries" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            {/* Search Bar and Filters */}
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Search by name, phone number, or query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[250px] max-w-md"
                />

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setMessageAdminOpen(true)}
                  variant="outline"
                  className="gap-2 ml-auto"
                >
                  <Mail className="h-4 w-4" />
                  Message Admin
                </Button>
              </div>

              {/* Active Filters Summary */}
              {(statusFilter !== "all" ||
                subjectFilter !== "all" ||
                debouncedSearchQuery) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters:</span>
                  {debouncedSearchQuery && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Search: {debouncedSearchQuery}
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                      Status: {statusFilter}
                    </span>
                  )}
                  {subjectFilter !== "all" && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      Subject: {subjectFilter}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setSubjectFilter("all");
                    }}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Queries Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reply</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading queries...
                      </TableCell>
                    </TableRow>
                  ) : filteredQueries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        {searchQuery
                          ? "No queries found matching your search"
                          : "No queries yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQueries.map((query) => {
                      const replied = hasReply(query);
                      const firstMessage = query.messages?.[0];

                      return (
                        <TableRow key={query._id}>
                          <TableCell className="font-medium">
                            {query.student?.fullName || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {query.student?.mobileNumber || "N/A"}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {query.subject}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {firstMessage?.content || "No message"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                query.status === "closed"
                                  ? "bg-gray-100 text-gray-700"
                                  : replied
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {query.status === "closed"
                                ? "Resolved"
                                : replied
                                ? "Replied"
                                : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(query.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(query)}
                              disabled={query.status === "closed"}
                            >
                              Reply
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewReply(query)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {query.status !== "closed" && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(query)}
                                    className="text-green-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Mark as Resolved
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Reply Dialog */}
      <Dialog open={viewReplyOpen} onOpenChange={setViewReplyOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Query Conversation</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input
                  value={selectedQuery.student?.fullName || "Unknown"}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={selectedQuery.student?.mobileNumber || "N/A"}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={selectedQuery.subject} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input
                  value={
                    selectedQuery.status === "closed"
                      ? "Resolved"
                      : hasReply(selectedQuery)
                      ? "Replied"
                      : "Pending"
                  }
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Conversation</Label>
                <div className="border rounded-lg p-4 space-y-3 max-h-[300px] overflow-y-auto bg-gray-50">
                  {selectedQuery.messages &&
                  selectedQuery.messages.length > 0 ? (
                    selectedQuery.messages.map((message, index) => {
                      const isEducator = message.sender === educator?._id;
                      return (
                        <div
                          key={message._id || index}
                          className={`p-3 rounded-lg ${
                            isEducator
                              ? "bg-blue-100 ml-8"
                              : "bg-white mr-8 border"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {isEducator
                                ? "You"
                                : selectedQuery.student?.fullName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No messages in this conversation
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Add Reply Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reply to Query</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Input
                  value={selectedQuery.student?.fullName || "Unknown"}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={selectedQuery.subject} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Student Query</Label>
                <Textarea
                  value={selectedQuery.messages?.[0]?.content || "No message"}
                  readOnly
                  rows={3}
                  className="bg-gray-50"
                />
              </div>
              {selectedQuery.messages && selectedQuery.messages.length > 1 && (
                <div className="space-y-2">
                  <Label>Previous Messages</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto bg-gray-50">
                    {selectedQuery.messages.slice(1).map((message, index) => {
                      const isEducator = message.sender === educator?._id;
                      return (
                        <div
                          key={message._id || index}
                          className={`p-2 rounded text-sm ${
                            isEducator ? "bg-blue-50" : "bg-white border"
                          }`}
                        >
                          <div className="font-semibold text-xs text-gray-600 mb-1">
                            {isEducator
                              ? "You"
                              : selectedQuery.student?.fullName}
                          </div>
                          <p className="text-gray-800">{message.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reply"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Query Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Query as Resolved?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the query from &quot;
              {queryToDelete?.student?.fullName}&quot; as resolved. The query
              will be closed and no further replies can be sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Mark as Resolved"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Message Admin Dialog */}
      {educator?._id && (
        <MessageAdminDialog
          open={messageAdminOpen}
          onOpenChange={setMessageAdminOpen}
          educatorId={educator._id}
        />
      )}
    </div>
  );
}
