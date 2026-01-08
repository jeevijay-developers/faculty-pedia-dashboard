"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewStudentDetailsDialog } from "@/components/view-student-details-dialog";
import { BroadcastMessageDialog } from "@/components/broadcast-message-dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  getEducatorEnrolledStudents,
  getCoursesByEducator,
} from "@/util/server";
import { Users, Loader2, Eye, UserX, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { MessageAdminDialog } from "@/components/message-admin-dialog";

interface EnrolledStudent {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  username: string;
  specialization: string;
  class: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  image?: string;
  joinedAt: string;
  isEmailVerified: boolean;
  courseId: string;
  courseTitle: string;
  courseType: string;
  courseFees: number;
  courseDiscount: number;
  amountPaid: number;
}

interface Course {
  _id: string;
  title: string;
}

export default function StudentsPage() {
  const { educator } = useAuth();
  const router = useRouter();

  // State
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "joinedAt">("joinedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedStudent, setSelectedStudent] =
    useState<EnrolledStudent | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  // Fetch enrolled students and courses
  const fetchData = useCallback(async () => {
    if (!educator?._id) return;

    try {
      setLoading(true);

      // Fetch enrolled students
      const studentsResponse = await getEducatorEnrolledStudents(educator._id);
      const studentsData = studentsResponse.data || [];
      setStudents(studentsData);

      // Fetch courses for filter dropdown
      const coursesResponse = await getCoursesByEducator(educator._id, {
        limit: 100,
      });
      const coursesData = Array.isArray(coursesResponse)
        ? coursesResponse
        : coursesResponse?.courses || [];
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load students data");
    } finally {
      setLoading(false);
    }
  }, [educator?._id]);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [educator, router, fetchData]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter((student) => {
      // Course filter
      if (selectedCourse !== "all" && student.courseId !== selectedCourse) {
        return false;
      }

      // Search filter
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.mobileNumber.includes(query) ||
          student.courseTitle.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const dateA = new Date(a.joinedAt).getTime();
        const dateB = new Date(b.joinedAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

  // Get unique student count
  const uniqueStudents = new Set(students.map((s) => s._id)).size;

  const handleViewDetails = (student: EnrolledStudent) => {
    // Get all enrollments for this student
    setSelectedStudent({
      ...student,
    });
    setIsDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!educator) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Students"
        description="Manage your enrolled students"
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {uniqueStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Enrollments
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {students.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Courses
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Students Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Enrolled Students</h3>

            {/* Filters and Message Button */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Message Button */}
              {/* <div className="flex justify-end">
                <Button
                  onClick={() => setIsBroadcastDialogOpen(true)}
                  className="gap-2"
                  variant="default"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message All Followers
                </Button>
              </div> */}

              {/* Filters Row */}
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, mobile, or course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split("-") as [
                      "name" | "joinedAt",
                      "asc" | "desc"
                    ];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="joinedAt-desc">Newest First</SelectItem>
                    <SelectItem value="joinedAt-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  className="gap-2 md:ml-auto"
                  onClick={() => setIsChatDialogOpen(true)}
                >
                  <Mail className="h-4 w-4" />
                  Chat with Admin
                </Button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Course Type</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {searchQuery || selectedCourse !== "all"
                              ? "No students found matching your filters"
                              : "No enrolled students yet"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedStudents.map((student, index) => (
                        <TableRow
                          key={`${student._id}-${student.courseId}-${index}`}
                        >
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {student.email}
                          </TableCell>
                          <TableCell className="text-sm">
                            +91 {student.mobileNumber}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <span className="line-clamp-1">
                              {student.courseTitle}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                student.courseType === "OTO"
                                  ? "border-blue-500/50 text-blue-500"
                                  : "border-green-500/50 text-green-500"
                              }`}
                            >
                              {student.courseType === "OTO"
                                ? "One to One"
                                : "One to All"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {student.specialization}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {student.class}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(student.joinedAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(student)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <ViewStudentDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        student={selectedStudent}
        allEnrollments={
          selectedStudent
            ? students.filter((s) => s._id === selectedStudent._id)
            : []
        }
      />

      {/* Broadcast Message Dialog */}
      <BroadcastMessageDialog
        open={isBroadcastDialogOpen}
        onOpenChange={setIsBroadcastDialogOpen}
        educatorId={educator._id}
        followerCount={educator?.followers?.length || 0}
      />

      <MessageAdminDialog
        open={isChatDialogOpen}
        onOpenChange={setIsChatDialogOpen}
        educatorId={educator._id}
      />
    </div>
  );
}
