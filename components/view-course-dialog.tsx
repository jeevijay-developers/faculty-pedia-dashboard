"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Calendar, Users, BookOpen, Clock, IndianRupee, Video, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ViewCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: any
}

export function ViewCourseDialog({ open, onOpenChange, course }: ViewCourseDialogProps) {
  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold capitalize">{course.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{course.description?.shortDesc || "No description"}</p>
            </div>
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Course Image */}
          {course.image?.url && (
            <div className="aspect-video relative overflow-hidden rounded-lg border">
              <img
                src={course.image.url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-lg font-semibold">{course.enrolledStudents?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <IndianRupee className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fees</p>
                <p className="text-lg font-semibold">₹{course.fees?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{course.classDuration || 0} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Seats</p>
                <p className="text-lg font-semibold">{course.seatLimit || "Unlimited"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium capitalize">{course.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <Badge variant="outline">Class {course.courseClass}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Type</p>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  {course.courseType || "OTA"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="font-medium capitalize">{course.specialization || "N/A"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {course.startDate
                      ? new Date(course.startDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {course.endDate
                      ? new Date(course.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {course.description?.longDesc && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description.longDesc}
                </p>
              </div>
            </>
          )}

          {/* Videos */}
          {(course.video?.intro || course.video?.descriptionVideo || course.video?.lessons?.length > 0) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Course Videos
                </h3>
                <div className="space-y-2">
                  {course.video?.intro && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Introduction Video</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  )}
                  {course.video?.descriptionVideo && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Description Video</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  )}
                  {course.video?.lessons?.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Lessons</span>
                      <Badge variant="outline">{course.video.lessons.length} Videos</Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Additional Details */}
          {course.validity && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Validity</p>
                    <p className="font-medium">{course.validity} days</p>
                  </div>
                  {course.courseLink && (
                    <div>
                      <p className="text-sm text-muted-foreground">Course Link</p>
                      <a
                        href={course.courseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
