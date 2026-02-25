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

const getCourseTypeLabel = (type?: string) => {
  if (!type) return "One To All"
  const normalized =
    type === "OTO"
      ? "one-to-one"
      : type === "OTA"
      ? "one-to-all"
      : type
  return normalized === "one-to-one" ? "One To One" : "One To All"
}

const getClassList = (course: any) => {
  if (!course) return []
  if (Array.isArray(course.class)) return course.class
  if (Array.isArray(course.classes)) return course.classes
  if (course.courseClass) return [course.courseClass]
  return []
}

const formatClassLabel = (cls: string) => {
  if (!cls) return ""
  if (cls === "dropper") return "Dropper"
  const normalized = cls.replace("class-", "")
  return `Class ${normalized}`
}

const getSubjects = (subject: any) => {
  if (!subject) return "N/A"
  if (Array.isArray(subject)) {
    return subject
      .filter(Boolean)
      .map((s) => (typeof s === "string" ? s : String(s)))
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(", ")
  }
  if (typeof subject === "string") return subject
  return "N/A"
}

const getSpecializations = (specialization: any) => {
  if (!specialization) return "N/A"
  if (Array.isArray(specialization)) {
    const joined = specialization
      .filter(Boolean)
      .map((s) => (typeof s === "string" ? s : String(s)))
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ")
    return joined || "N/A"
  }
  if (typeof specialization === "string") return specialization
  return "N/A"
}

const getDescription = (description: any) => {
  if (!description) return "No description"
  if (typeof description === "string") return description
  return description.longDesc || description.shortDesc || "No description"
}

const getImageUrl = (course: any) => {
  if (!course) return ""
  if (course.courseThumbnail) return course.courseThumbnail
  if (typeof course.image === "string") return course.image
  if (course.image?.url) return course.image.url
  return ""
}

export function ViewCourseDialog({ open, onOpenChange, course }: ViewCourseDialogProps) {
  if (!course) return null

  const descriptionText = getDescription(course.description)
  const imageUrl = getImageUrl(course)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold capitalize">{course.title}</DialogTitle>
             
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
          {imageUrl && (
            <div className="aspect-video relative overflow-hidden rounded-lg border">
              <img
                src={imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-w-0">
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Students</p>
                <p className="text-base font-semibold">{course.enrolledStudents?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-w-0">
              <IndianRupee className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Fees</p>
                <p className="text-base font-semibold truncate">₹{course.fees?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-w-0">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Duration</p>
                <p className="text-base font-semibold truncate">{course.classDuration ? `${course.classDuration} min` : (course.courseDuration || "N/A")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-w-0">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Classes/Week</p>
                <p className="text-base font-semibold">{course.classesPerWeek || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-w-0">
              <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Seats</p>
                <p className="text-base font-semibold">{course.maxStudents || course.seatLimit || "Unlimited"}</p>
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
                <p className="font-medium capitalize">{getSubjects(course.subject)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <div className="flex flex-wrap gap-2">
                  {getClassList(course).length ? (
                    getClassList(course).map((cls: string) => (
                      <Badge key={cls} variant="outline" className="capitalize">
                        {formatClassLabel(cls)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Type</p>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  {getCourseTypeLabel(course.courseType)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="font-medium capitalize">{getSpecializations(course.specialization)}</p>
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
          {descriptionText && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {descriptionText}
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
