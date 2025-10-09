"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, MoreHorizontal, Edit, Trash2, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateCourseDialog } from "@/components/create-course-dialog"
import { ViewCourseDialog } from "@/components/view-course-dialog"
import { EditCourseDialog } from "@/components/edit-course-dialog"
import { DeleteCourseAlert } from "@/components/delete-course-alert"
import { useAuth } from "@/contexts/auth-context"
import { getCoursesByIds, deleteCourse } from "@/util/server"
import toast from "react-hot-toast"

const ITEMS_PER_PAGE = 10

export default function CoursesPage() {
  const { educator } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [courseToDelete, setCourseToDelete] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch courses when educator data is available
  useEffect(() => {
    fetchCourses()
  }, [educator?.courses])

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE)
  const paginatedCourses = courses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course)
    setIsViewDialogOpen(true)
  }

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCourse = (course: any) => {
    setCourseToDelete(course)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return

    setDeleteLoading(true)
    try {
      await deleteCourse(courseToDelete._id)
      toast.success("Course deleted successfully!")
      setIsDeleteAlertOpen(false)
      setCourseToDelete(null)
      // Refresh courses list
      fetchCourses()
    } catch (error: any) {
      console.error("Error deleting course:", error)
      toast.error(error.response?.data?.message || "Failed to delete course")
    } finally {
      setDeleteLoading(false)
    }
  }

  const fetchCourses = async () => {
    if (!educator?.courses || educator.courses.length === 0) {
      setLoading(false)
      setCourses([])
      return
    }

    try {
      setLoading(true)
      const courseIds = educator.courses
      const fetchedCourses = await getCoursesByIds(courseIds)
      setCourses(fetchedCourses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Course Management" description="Create and manage your educational courses" />

      <div className="px-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">Your Courses</h2>
            <p className="text-sm text-muted-foreground">Manage your course content, videos, and student enrollment</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          </div>
        ) : courses.length > 0 ? (
          <>
            <Card className="bg-card border-border">
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCourses.map((course) => (
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
                          <span className="max-w-2xs font-medium text-foreground capitalize line-clamp-1 truncate">
                            {course.title}
                          </span>
                          <span className="max-w-md text-xs text-muted-foreground line-clamp-1 truncate">
                            {course.description?.shortDesc || "No description"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{course.subject}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Class {course.courseClass}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          {course.courseType || "OTA"}
                        </Badge>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 font-semibold" onClick={() => handleDeleteCourse(course)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, courses.length)} of {courses.length} courses
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No courses yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first course to start teaching students
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateCourseDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      <ViewCourseDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} course={selectedCourse} />
      <EditCourseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        course={selectedCourse}
        onCourseUpdated={fetchCourses}
      />
      <DeleteCourseAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDeleteCourse}
        loading={deleteLoading}
        courseName={courseToDelete?.title || ""}
      />
    </div>
  )
}
