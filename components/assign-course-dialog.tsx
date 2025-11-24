"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";
import { getCoursesByEducator, assignTestSeriesToCourse } from "@/util/server";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";

interface Course {
  _id: string;
  title: string;
  subject?: string | string[];
  specialization?: string | string[];
}

interface AssignCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSeries: {
    _id: string;
    title: string;
    isCourseSpecific?: boolean;
    courseId?: string;
  } | null;
  onAssignmentComplete?: () => void;
}

export function AssignCourseDialog({
  open,
  onOpenChange,
  testSeries,
  onAssignmentComplete,
}: AssignCourseDialogProps) {
  const { educator } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses when dialog opens
  useEffect(() => {
    const fetchCourses = async () => {
      if (!open || !educator?._id) {
        setCourses([]);
        return;
      }

      try {
        setLoading(true);
        const response = await getCoursesByEducator(educator._id, {
          limit: 100, // Fetch more courses to show all available
        });
        const fetchedCourses = Array.isArray(response)
          ? response
          : Array.isArray(response?.courses)
          ? response.courses
          : [];
        setCourses(fetchedCourses);

        // Pre-select course if test series is already course-specific
        if (testSeries?.isCourseSpecific && testSeries?.courseId) {
          setSelectedCourseId(testSeries.courseId);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [open, educator?._id, testSeries]);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedCourseId(null);
    }
  }, [open]);

  const handleCourseToggle = (courseId: string) => {
    // Toggle selection: if same course clicked again, deselect
    setSelectedCourseId((prev) => (prev === courseId ? null : courseId));
  };

  const handleAssign = async () => {
    if (!testSeries?._id) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating test series...");

    try {
      await assignTestSeriesToCourse(testSeries._id, selectedCourseId || null);

      toast.success(
        selectedCourseId
          ? "Test series assigned to course successfully!"
          : "Test series unassigned from course successfully!",
        { id: loadingToast }
      );

      onOpenChange(false);
      onAssignmentComplete?.();
    } catch (error) {
      console.error("Error assigning course:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message ||
          "Failed to update test series assignment",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubjectLabel = (subject: Course["subject"]) => {
    if (Array.isArray(subject) && subject.length > 0) {
      return subject[0];
    }
    if (typeof subject === "string" && subject.length > 0) {
      return subject;
    }
    return "N/A";
  };

  const getSpecializationLabel = (specialization: Course["specialization"]) => {
    if (Array.isArray(specialization) && specialization.length > 0) {
      return specialization[0];
    }
    if (typeof specialization === "string" && specialization.length > 0) {
      return specialization;
    }
    return "General";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign to Course</DialogTitle>
          <DialogDescription>
            Select a course to assign this test series to. Test series assigned
            to courses will be course-specific and only available to students
            enrolled in that course.
          </DialogDescription>
        </DialogHeader>

        {testSeries && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Test Series:</p>
            <p className="font-semibold text-foreground">{testSeries.title}</p>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading courses...</span>
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Available Courses ({courses.length})
              </p>
              {courses.map((course) => (
                <Card
                  key={course._id}
                  className={`cursor-pointer transition-colors ${
                    selectedCourseId === course._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleCourseToggle(course._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedCourseId === course._id}
                        onCheckedChange={() => handleCourseToggle(course._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground line-clamp-1">
                            {course.title}
                          </h4>
                          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getSubjectLabel(course.subject)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getSpecializationLabel(course.specialization)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No courses available. Create a course first to assign test
                  series.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : selectedCourseId ? (
              "Assign Course"
            ) : (
              "Remove Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
