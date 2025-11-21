"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

interface Video {
  id: number
  title: string
  link: string
}

export default function VideosPage() {
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [editFormData, setEditFormData] = useState<Video | null>(null)
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [courseSearchQuery, setCourseSearchQuery] = useState("")
  const [debouncedCourseSearchQuery, setDebouncedCourseSearchQuery] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [videoToAssign, setVideoToAssign] = useState<Video | null>(null)
  
  // Form data for creating new video
  const [formData, setFormData] = useState({
    title: "",
    link: ""
  })

  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: "Introduction to Physics",
      link: "https://youtube.com/watch?v=example1"
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      link: "https://youtube.com/watch?v=example2"
    }
  ])

  // Mock courses data (similar to courses page)
  const mockCourses = [
    {
      _id: "1",
      title: "Physics Complete Course",
      subject: "physics",
      courseClass: "12",
      courseType: "OTA",
      fees: 5000,
      startDate: "2025-11-01",
      image: { url: "/physics-course.jpg" },
      description: { shortDesc: "Complete physics course for class 12" },
      enrolledStudents: [1, 2, 3]
    },
    {
      _id: "2",
      title: "Mathematics Advanced",
      subject: "mathematics",
      courseClass: "11",
      courseType: "OTA",
      fees: 4500,
      startDate: "2025-11-05",
      image: { url: "/mathematics-course.png" },
      description: { shortDesc: "Advanced mathematics for class 11" },
      enrolledStudents: [1, 2]
    },
    {
      _id: "3",
      title: "Chemistry Fundamentals",
      subject: "chemistry",
      courseClass: "10",
      courseType: "OTA",
      fees: 4000,
      startDate: "2025-11-10",
      image: { url: "/chemistry-course.png" },
      description: { shortDesc: "Basic chemistry concepts" },
      enrolledStudents: [1]
    }
  ]

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Debounce effect for course search query in assign dialog
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCourseSearchQuery(courseSearchQuery)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [courseSearchQuery])

  // Handle create form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newVideo: Video = {
      id: videos.length + 1,
      title: formData.title,
      link: formData.link
    }
    setVideos([...videos, newVideo])
    setFormData({ title: "", link: "" })
    setOpen(false)
  }

  // Handle view
  const handleView = (video: Video) => {
    setSelectedVideo(video)
    setViewOpen(true)
  }

  // Handle edit
  const handleEdit = (video: Video) => {
    setEditFormData(video)
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editFormData) {
      setVideos(videos.map(v => v.id === editFormData.id ? editFormData : v))
      setEditOpen(false)
      setEditFormData(null)
    }
  }

  // Handle assign to course
  const handleAssignToCourse = (video: Video) => {
    setVideoToAssign(video)
    setSelectedCourses([])
    setCourseSearchQuery("")
    setAssignOpen(true)
  }

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleAssignSubmit = () => {
    // Handle the assignment logic here
    console.log("Assigning video:", videoToAssign?.title, "to courses:", selectedCourses)
    setAssignOpen(false)
    setVideoToAssign(null)
    setSelectedCourses([])
  }

  // Handle delete
  const handleDeleteClick = (video: Video) => {
    setVideoToDelete(video)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (videoToDelete) {
      setVideos(videos.filter(v => v.id !== videoToDelete.id))
      setDeleteOpen(false)
      setVideoToDelete(null)
    }
  }

  // Filter videos based on debounced search query
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  // Filter courses based on debounced search query in assign dialog
  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(debouncedCourseSearchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Videos" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            {/* Search Bar and Add Video Button */}
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
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Video</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter video title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link">Add Link</Label>
                      <Input
                        id="link"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="Enter video link"
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

            {/* Videos Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Assign to Course</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No videos found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>
                          <a 
                            href={video.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {video.link}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleAssignToCourse(video)}>
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
                            <DropdownMenuItem onClick={() => handleView(video)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(video)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(video)}
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
            <DialogTitle>View Video</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={selectedVideo.title} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input value={selectedVideo.link} readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
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
                <Label htmlFor="edit-link">Link</Label>
                <Input
                  id="edit-link"
                  value={editFormData.link}
                  onChange={(e) => setEditFormData({ ...editFormData, link: e.target.value })}
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
              This action cannot be undone. This will permanently delete the video
              &quot;{videoToDelete?.title}&quot;.
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

      {/* Assign to Course Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Assign Video to Courses</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select courses to assign &quot;{videoToAssign?.title}&quot;
            </p>
          </DialogHeader>
          
          {/* Search Bar for Courses */}
          <div className="mb-4">
            <Input
              placeholder="Search courses by title..."
              value={courseSearchQuery}
              onChange={(e) => setCourseSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-center">Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-4">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course._id}>
                    <TableCell>
                      <div className="w-16 h-12 rounded overflow-hidden">
                        <img
                          src={course.image?.url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground capitalize line-clamp-1">
                          {course.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {course.description?.shortDesc || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{course.subject}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">Class {course.courseClass}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{course.courseType || "OTA"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {course.enrolledStudents?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₹{course.fees?.toLocaleString() || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {course.startDate
                          ? new Date(course.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedCourses.includes(course._id)}
                        onCheckedChange={() => handleCourseToggle(course._id)}
                      />
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAssignSubmit}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
