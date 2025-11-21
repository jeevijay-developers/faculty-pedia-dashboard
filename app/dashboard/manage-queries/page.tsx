"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Eye, Edit, Trash2, MoreHorizontal, MessageSquare } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Query {
  id: number
  name: string
  phoneNumber: string
  query: string
  reply?: string
  status: "pending" | "replied"
  date: string
}

export default function ManageQueriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [viewReplyOpen, setViewReplyOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [queryToDelete, setQueryToDelete] = useState<Query | null>(null)
  const [replyText, setReplyText] = useState("")

  const [queries, setQueries] = useState<Query[]>([
    {
      id: 1,
      name: "Arjun Sharma",
      phoneNumber: "+91 98765 43210",
      query: "When will the next batch for Physics start?",
      reply: "The next batch for Physics will start on November 15, 2025. Please register before November 10th.",
      status: "replied",
      date: "2025-10-25",
    },
    {
      id: 2,
      name: "Priya Patel",
      phoneNumber: "+91 98765 43211",
      query: "What is the fee structure for Mathematics course?",
      reply: "The fee for Mathematics Advanced course is ₹4,500. We also offer installment options.",
      status: "replied",
      date: "2025-10-26",
    },
    {
      id: 3,
      name: "Rahul Verma",
      phoneNumber: "+91 98765 43212",
      query: "Do you provide study materials for Chemistry?",
      status: "pending",
      date: "2025-10-28",
    },
    {
      id: 4,
      name: "Ananya Singh",
      phoneNumber: "+91 98765 43213",
      query: "Can I join the one-to-one classes?",
      status: "pending",
      date: "2025-10-29",
    },
    {
      id: 5,
      name: "Vikram Reddy",
      phoneNumber: "+91 98765 43214",
      query: "Is there any discount for multiple course enrollment?",
      reply: "Yes, we offer a 15% discount when you enroll in 2 or more courses together.",
      status: "replied",
      date: "2025-10-30",
    },
  ])

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Filter queries based on debounced search query
  const filteredQueries = queries.filter(
    (query) =>
      query.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      query.phoneNumber.includes(debouncedSearchQuery) ||
      query.query.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  // Handle view reply
  const handleViewReply = (query: Query) => {
    setSelectedQuery(query)
    setViewReplyOpen(true)
  }

  // Handle edit
  const handleEdit = (query: Query) => {
    setSelectedQuery(query)
    setReplyText(query.reply || "")
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedQuery) {
      setQueries(
        queries.map((q) =>
          q.id === selectedQuery.id
            ? { ...q, reply: replyText, status: "replied" as const }
            : q
        )
      )
      setEditOpen(false)
      setSelectedQuery(null)
      setReplyText("")
    }
  }

  // Handle delete
  const handleDeleteClick = (query: Query) => {
    setQueryToDelete(query)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (queryToDelete) {
      setQueries(queries.filter((q) => q.id !== queryToDelete.id))
      setDeleteOpen(false)
      setQueryToDelete(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Manage Queries" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <Input
                placeholder="Search by name, phone number, or query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Queries Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reply</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No queries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQueries.map((query) => (
                      <TableRow key={query.id}>
                        <TableCell className="font-medium">
                          {query.name}
                        </TableCell>
                        <TableCell>{query.phoneNumber}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {query.query}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              query.status === "replied"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {query.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(query)}
                            disabled={query.status === "replied"}
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
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(query)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Reply Dialog */}
      <Dialog open={viewReplyOpen} onOpenChange={setViewReplyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={selectedQuery.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={selectedQuery.phoneNumber} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Query</Label>
                <Textarea value={selectedQuery.query} readOnly rows={3} />
              </div>
              {selectedQuery.reply && (
                <div className="space-y-2">
                  <Label>Reply</Label>
                  <Textarea
                    value={selectedQuery.reply}
                    readOnly
                    rows={4}
                    className="bg-green-50 text-green-900 border-green-200"
                  />
                </div>
              )}
              {!selectedQuery.reply && (
                <p className="text-sm text-yellow-600">
                  No reply has been sent yet.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Add Reply Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Query</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Query</Label>
                <Textarea value={selectedQuery.query} readOnly rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send Reply</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              query from &quot;{queryToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
