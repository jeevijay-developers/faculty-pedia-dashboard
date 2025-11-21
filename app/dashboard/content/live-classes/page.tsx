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

interface LiveClass {
  id: number
  title: string
  link: string
}

export default function LiveClassesPage() {
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClass | null>(null)
  const [editFormData, setEditFormData] = useState<LiveClass | null>(null)
  const [liveClassToDelete, setLiveClassToDelete] = useState<LiveClass | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [courseSearchQuery, setCourseSearchQuery] = useState("")
  const [debouncedCourseSearchQuery, setDebouncedCourseSearchQuery] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [liveClassToAssign, setLiveClassToAssign] = useState<LiveClass | null>(null)
  
  // Form data for creating new live class
  const [formData, setFormData] = useState({
    title: "",
    link: ""
  })

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([
    {
      id: 1,
      title: "Chemistry Live Session",
      link: "https://meet.google.com/abc-defg-hij"
    },
    {
      id: 2,
      title: "Biology Practical Class",
      link: "https://zoom.us/j/1234567890"
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
    const newLiveClass: LiveClass = {
      id: liveClasses.length + 1,
      title: formData.title,
      link: formData.link
    }
    setLiveClasses([...liveClasses, newLiveClass])
    setFormData({ title: "", link: "" })
    setOpen(false)
  }

  // Handle view
  const handleView = (liveClass: LiveClass) => {
    setSelectedLiveClass(liveClass)
    setViewOpen(true)
  }

  // Handle edit
  const handleEdit = (liveClass: LiveClass) => {
    setEditFormData(liveClass)
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editFormData) {
      setLiveClasses(liveClasses.map(lc => lc.id === editFormData.id ? editFormData : lc))
      setEditOpen(false)
      setEditFormData(null)
    }
  }

  // Handle assign to course
  const handleAssignToCourse = (liveClass: LiveClass) => {
    setLiveClassToAssign(liveClass)
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
    console.log("Assigning live class:", liveClassToAssign?.title, "to courses:", selectedCourses)
    setAssignOpen(false)
    setLiveClassToAssign(null)
    setSelectedCourses([])
  }

  // Handle delete
  const handleDeleteClick = (liveClass: LiveClass) => {
    setLiveClassToDelete(liveClass)
    setDeleteOpen(true)
  }

  

  const handleDeleteConfirm = () => {
    if (liveClassToDelete) {
      setLiveClasses(liveClasses.filter(lc => lc.id !== liveClassToDelete.id))
      setDeleteOpen(false)
      setLiveClassToDelete(null)
    }
  }

  // Filter live classes based on debounced search query
  const filteredLiveClasses = liveClasses.filter(liveClass =>
    liveClass.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  // Filter courses based on debounced search query in assign dialog
  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(debouncedCourseSearchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Live Classes" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            {/* Search Bar and Add Live Class Button */}
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
                    Add Live Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Live Class</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter live class title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link">Add Link</Label>
                      <Input
                        id="link"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="Enter live class link"
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

            {/* Live Classes Table */}
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
                  {filteredLiveClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No live classes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLiveClasses.map((liveClass) => (
                      <TableRow key={liveClass.id}>
                        <TableCell className="font-medium">{liveClass.title}</TableCell>
                        <TableCell>
                          <a 
                            href={liveClass.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {liveClass.link}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleAssignToCourse(liveClass)}>
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
                            <DropdownMenuItem onClick={() => handleView(liveClass)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(liveClass)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(liveClass)}
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
            <DialogTitle>View Live Class</DialogTitle>
          </DialogHeader>
          {selectedLiveClass && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={selectedLiveClass.title} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input value={selectedLiveClass.link} readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Live Class</DialogTitle>
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
              This action cannot be undone. This will permanently delete the live class
              &quot;{liveClassToDelete?.title}&quot;.
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
            <DialogTitle>Assign Live Class to Courses</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select courses to assign &quot;{liveClassToAssign?.title}&quot;
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
