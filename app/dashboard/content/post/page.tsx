"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, MoreHorizontal, ChevronDown, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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

interface Post {
  id: number
  title: string
  detail: string
  date: string
}

export default function PostPage() {
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editFormData, setEditFormData] = useState<Post | null>(null)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [postToAssign, setPostToAssign] = useState<Post | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  
  // Assignment form data
  const [jeeChecked, setJeeChecked] = useState(false)
  const [neetChecked, setNeetChecked] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  
  // Form data for creating new post
  const [formData, setFormData] = useState({
    title: "",
    detail: "",
    date: ""
  })

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "Important Announcement",
      detail: "Classes will resume from next Monday",
      date: "2025-11-01"
    },
    {
      id: 2,
      title: "New Course Launch",
      detail: "We are launching a new advanced physics course",
      date: "2025-11-05"
    }
  ])

  const cbseClasses = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"]

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Handle create form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPost: Post = {
      id: posts.length + 1,
      title: formData.title,
      detail: formData.detail,
      date: formData.date
    }
    setPosts([...posts, newPost])
    setFormData({ title: "", detail: "", date: "" })
    setOpen(false)
  }

  // Handle view
  const handleView = (post: Post) => {
    setSelectedPost(post)
    setViewOpen(true)
  }

  // Handle edit
  const handleEdit = (post: Post) => {
    setEditFormData(post)
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editFormData) {
      setPosts(posts.map(p => p.id === editFormData.id ? editFormData : p))
      setEditOpen(false)
      setEditFormData(null)
    }
  }

  // Handle assign to course
  const handleAssignClick = (post: Post) => {
    setPostToAssign(post)
    setJeeChecked(false)
    setNeetChecked(false)
    setSelectedClasses([])
    setAssignOpen(true)
  }

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    )
  }

  const handleAssignSubmit = () => {
    console.log("Assigning post:", postToAssign?.title)
    console.log("JEE:", jeeChecked, "NEET:", neetChecked)
    console.log("Selected Classes:", selectedClasses)
    setAssignOpen(false)
    setPostToAssign(null)
    setJeeChecked(false)
    setNeetChecked(false)
    setSelectedClasses([])
  }

  // Handle delete
  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      setPosts(posts.filter(p => p.id !== postToDelete.id))
      setDeleteOpen(false)
      setPostToDelete(null)
    }
  }

  // Filter posts based on debounced search query
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Post" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            {/* Search Bar and Add Post Button */}
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Post</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter post title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detail">Detail</Label>
                      <Textarea
                        id="detail"
                        value={formData.detail}
                        onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                        placeholder="Enter post details"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Posts Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Assign to Course</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell className="max-w-md truncate">{post.detail}</TableCell>
                        <TableCell>
                          {post.date
                            ? new Date(post.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAssignClick(post)}
                          >
                            Assign
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
                            <DropdownMenuItem onClick={() => handleView(post)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(post)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(post)}
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

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>View Post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={selectedPost.title} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Detail</Label>
                <Textarea value={selectedPost.detail} readOnly rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={selectedPost.date} readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-detail">Detail</Label>
                <Textarea
                  id="edit-detail"
                  value={editFormData.detail}
                  onChange={(e) => setEditFormData({ ...editFormData, detail: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
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
              This action cannot be undone. This will permanently delete the post
              &quot;{postToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Post: {postToAssign?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* JEE and NEET Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="jee" 
                  checked={jeeChecked}
                  onCheckedChange={(checked) => setJeeChecked(checked as boolean)}
                />
                <Label htmlFor="jee" className="text-sm font-medium cursor-pointer">
                  JEE
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="neet" 
                  checked={neetChecked}
                  onCheckedChange={(checked) => setNeetChecked(checked as boolean)}
                />
                <Label htmlFor="neet" className="text-sm font-medium cursor-pointer">
                  NEET
                </Label>
              </div>
            </div>

            {/* CBSE Classes Multi-Select Dropdown */}
            <div className="space-y-2">
              <Label>CBSE</Label>
              <DropdownMenu open={classDropdownOpen} onOpenChange={setClassDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[40px] h-auto"
                  >
                    <div className="flex flex-wrap items-center gap-1 flex-1">
                      {selectedClasses.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Select classes</span>
                      ) : (
                        selectedClasses.map((className) => (
                          <Badge
                            key={className}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            <span>{className}</span>
                            <button
                              type="button"
                              className="ml-1 rounded-full hover:bg-muted-foreground/20"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClassToggle(className)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {cbseClasses.map((className) => (
                    <DropdownMenuCheckboxItem
                      key={className}
                      checked={selectedClasses.includes(className)}
                      onCheckedChange={() => handleClassToggle(className)}
                    >
                      {className}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleAssignSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
