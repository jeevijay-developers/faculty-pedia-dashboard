"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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

interface ViewStudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: EnrolledStudent | null;
  allEnrollments?: EnrolledStudent[];
}

export function ViewStudentDetailsDialog({
  open,
  onOpenChange,
  student,
  allEnrollments = [],
}: ViewStudentDetailsDialogProps) {
  if (!student) return null;

  const formatAddress = () => {
    if (!student.address) return "Not provided";
    const { street, city, state, country, pincode } = student.address;
    const parts = [street, city, state, country, pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl md:max-h-[90vh] md:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            Student Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the enrolled student
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Student Profile Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {student.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.image}
                    alt={student.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-foreground break-words md:break-normal">
                      {student.name}
                    </h3>
                    <p className="text-sm text-muted-foreground break-all md:break-normal">
                      @{student.username}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {student.specialization}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {student.class}
                    </Badge>
                    <Badge
                      variant={
                        student.isEmailVerified ? "default" : "destructive"
                      }
                      className="gap-1"
                    >
                      {student.isEmailVerified ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Email Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Email Not Verified
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h4 className="font-semibold text-lg mb-4">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all md:break-normal">
                      {student.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Mobile Number
                    </p>
                    <p className="text-sm font-medium">
                      +91 {student.mobileNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium break-words md:break-normal">
                      {formatAddress()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Joined On</p>
                    <p className="text-sm font-medium">
                      {formatDate(student.joinedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-4">Enrolled Courses</h4>
              <div className="space-y-3">
                {allEnrollments.length > 0 ? (
                  allEnrollments.map((enrollment, index) => (
                    <div key={index}>
                      <div className="flex items-start justify-between gap-4 py-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-foreground break-words md:break-normal">
                            {enrollment.courseTitle}
                          </h5>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                enrollment.courseType === "OTO"
                                  ? "border-blue-500/50 text-blue-500"
                                  : "border-green-500/50 text-green-500"
                              }`}
                            >
                              {enrollment.courseType === "OTO"
                                ? "One to One"
                                : "One to All"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Fees: ₹{enrollment.courseFees.toLocaleString()}
                            </span>
                            {enrollment.courseDiscount > 0 && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <span className="text-xs text-green-600">
                                  {enrollment.courseDiscount}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-foreground">
                            ₹{enrollment.amountPaid.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Paid</p>
                        </div>
                      </div>
                      {index < allEnrollments.length - 1 && <Separator />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No enrollment data available
                  </div>
                )}
              </div>
              {allEnrollments.length > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Total Revenue
                    </span>
                    <span className="text-lg font-bold text-primary">
                      ₹
                      {allEnrollments
                        .reduce((sum, e) => sum + e.amountPaid, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogBody>

        {/* Mobile-only sticky action bar; desktop keeps its original chrome */}
        <DialogFooter className="md:hidden">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full min-h-11"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
