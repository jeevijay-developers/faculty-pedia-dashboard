"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import type {
  Course,
  CoursePaginationMeta,
  CourseType,
  EducatorCourseResponse,
} from "@/lib/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  BookOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CreateCourseDialog } from "@/components/create-course-dialog";
import { ViewCourseDialog } from "@/components/view-course-dialog";
import { EditCourseDialog } from "@/components/edit-course-dialog";
import { DeleteCourseAlert } from "@/components/delete-course-alert";
import { useAuth } from "@/contexts/auth-context";
import { deleteCourse, getCoursesByEducator } from "@/util/server";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const formatCourseType = (type?: CourseType | string) => {
  if (!type) return "One To All";
  const normalized =
    type === "OTO"
      ? "one-to-one"
      : type === "OTA"
      ? "one-to-all"
      : type;
  return normalized === "one-to-one" ? "One To One" : "One To All";
};

export default function LiveCoursesPage() {
  const { educator } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<CoursePaginationMeta | null>(
    null
  );

  const educatorId = educator?._id;

  const fetchCourses = useCallback(
    async (page = 1) => {
      if (!educatorId) {
        return;
      }

      try {
        setLoading(true);
        const data = (await getCoursesByEducator(educatorId, {
          page,
          limit: ITEMS_PER_PAGE,
        })) as EducatorCourseResponse;
        setCourses(data?.courses || []);
        if (data?.pagination) {
          setPagination(data.pagination);
          setCurrentPage(data.pagination.currentPage || page);
        } else {
          setPagination(null);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    },
    [educatorId]
  );

  useEffect(() => {
    if (educatorId) {
      fetchCourses(1);
    }
  }, [educatorId, fetchCourses]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) {
      return;
    }
    setCurrentPage(page);
    fetchCourses(page);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteCourse(courseToDelete._id);
      toast.success("Course deleted successfully!");
      setIsDeleteAlertOpen(false);
      setCourseToDelete(null);
      fetchCourses(currentPage);
    } catch (error) {
      console.error("Error deleting course:", error);
      const serverMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      toast.error(serverMessage || "Failed to delete course");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      fetchCourses(currentPage);
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      fetchCourses(currentPage);
    }
  };

  const renderSubject = (subject: Course["subject"]) => {
    if (!subject || subject.length === 0) {
      return "N/A";
    }
    return subject
      .map((subj) => subj.charAt(0).toUpperCase() + subj.slice(1))
      .join(", ");
  };

  const renderClasses = (course: Course) => {
    const classList = Array.isArray(course.class)
      ? course.class
      : Array.isArray(course.classes)
      ? course.classes
      : course.courseClass
      ? [course.courseClass]
      : [];

    if (classList.length === 0) {
      return <Badge variant="outline">N/A</Badge>;
    }

    return classList.map((cls: string) => (
      <Badge key={cls} variant="outline" className="mr-1 capitalize">
        {cls.replace("class-", "Class ")}
      </Badge>
    ));
  };

  const renderCourseImage = (course: Course) => {
    const src =
      course.courseThumbnail ??
      (typeof course.image === "string" ? course.image : course.image?.url) ??
      "/placeholder.svg";
    return (
      <div className="w-16 h-12 rounded overflow-hidden relative">
        <Image
          src={src}
          alt={course.title}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
    );
  };

  const totalPages = pagination?.totalPages || 1;
  const totalCourses = pagination?.totalCourses ?? courses.length;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Live Courses"
        description="Create and manage your active courses"
      />

      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Courses
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your course content, videos, and student enrollment
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>

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
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>{renderCourseImage(course)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="max-w-2xs font-medium text-foreground capitalize line-clamp-1 truncate">
                            {course.title}
                          </span>
                          <span className="max-w-md text-xs text-muted-foreground line-clamp-1 truncate">
                            {course.description || "No description"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {renderSubject(course.subject)}
                        </span>
                      </TableCell>
                      <TableCell>{renderClasses(course)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          {formatCourseType(course.courseType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {course.enrolledStudents?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₹{course.fees?.toLocaleString() || course.fee || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {course.startDate
                            ? new Date(course.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewCourse(course)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 font-semibold"
                              onClick={() => handleDeleteCourse(course)}
                            >
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)} of{" "}
                  {totalCourses} courses
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
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
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No courses yet
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first course to start teaching students
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateCourseDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogChange}
      />
      <ViewCourseDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        course={selectedCourse}
      />
      <EditCourseDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogChange}
        course={
          selectedCourse
            ? {
                ...selectedCourse,
                educatorID:
                  typeof selectedCourse.educatorID === "string"
                    ? selectedCourse.educatorID
                    : undefined,
              }
            : null
        }
        onCourseUpdated={() => fetchCourses(currentPage)}
      />
      <DeleteCourseAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDeleteCourse}
        loading={deleteLoading}
        courseName={courseToDelete?.title || ""}
      />
    </div>
  );
}
