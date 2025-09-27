"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Video, Users, Calendar, Clock, MoreHorizontal, Edit, Trash2, Eye, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateLiveClassDialog } from "@/components/create-live-class-dialog"
import { CreateWebinarDialog } from "@/components/create-webinar-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for live classes
const liveClasses = [
  {
    id: "1",
    title: "Physics - Laws of Motion",
    description: "Comprehensive discussion on Newton's laws of motion with practical examples",
    subject: "Physics",
    specialization: "IIT-JEE",
    scheduledAt: "2024-01-20T10:00:00Z",
    duration: 120,
    meetingLink: "https://zoom.us/j/123456789",
    platform: "Zoom",
    maxStudents: 100,
    enrolledStudents: 45,
    status: "scheduled",
    courseId: "course1",
    isCourseSpecific: true,
    recordingUrl: "",
    educatorId: "educator1",
  },
  {
    id: "2",
    title: "Organic Chemistry Basics",
    description: "Introduction to organic chemistry fundamentals and nomenclature",
    subject: "Chemistry",
    specialization: "NEET",
    scheduledAt: "2024-01-18T14:00:00Z",
    duration: 90,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    platform: "Google Meet",
    maxStudents: 80,
    enrolledStudents: 67,
    status: "completed",
    courseId: "",
    isCourseSpecific: false,
    recordingUrl: "https://drive.google.com/file/d/recording123",
    educatorId: "educator1",
  },
  {
    id: "3",
    title: "Calculus Problem Solving",
    description: "Advanced calculus problems and solution techniques",
    subject: "Mathematics",
    specialization: "CBSE",
    scheduledAt: "2024-01-25T16:00:00Z",
    duration: 150,
    meetingLink: "https://teams.microsoft.com/l/meetup-join/xyz",
    platform: "Microsoft Teams",
    maxStudents: 60,
    enrolledStudents: 23,
    status: "live",
    courseId: "",
    isCourseSpecific: false,
    recordingUrl: "",
    educatorId: "educator1",
  },
]

// Mock data for webinars
const webinars = [
  {
    id: "1",
    title: "Career Guidance for Engineering Aspirants",
    description: "Complete guide to engineering entrance exams and career opportunities",
    topic: "Career Guidance",
    scheduledAt: "2024-01-22T18:00:00Z",
    duration: 60,
    meetingLink: "https://zoom.us/webinar/register/WN_xyz123",
    platform: "Zoom Webinar",
    maxAttendees: 500,
    registeredAttendees: 234,
    status: "scheduled",
    isPublic: true,
    registrationRequired: true,
    educatorId: "educator1",
  },
  {
    id: "2",
    title: "Study Strategies for Competitive Exams",
    description: "Effective study techniques and time management for competitive exam preparation",
    topic: "Study Tips",
    scheduledAt: "2024-01-15T19:00:00Z",
    duration: 45,
    meetingLink: "https://meet.google.com/webinar-xyz",
    platform: "Google Meet",
    maxAttendees: 300,
    registeredAttendees: 189,
    status: "completed",
    isPublic: true,
    registrationRequired: false,
    educatorId: "educator1",
  },
]

export default function LiveClassesPage() {
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false)
  const [isCreateWebinarDialogOpen, setIsCreateWebinarDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "scheduled":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "Live Now"
      case "scheduled":
        return "Scheduled"
      case "completed":
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Live Classes & Webinars" description="Schedule and manage your live sessions" />

      <div className="px-6 space-y-6">
        <Tabs defaultValue="live-classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
            <TabsTrigger value="webinars">Webinars</TabsTrigger>
          </TabsList>

          <TabsContent value="live-classes" className="space-y-6">
            {/* Live Classes Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">Live Classes</h2>
                <p className="text-sm text-muted-foreground">Interactive classes with your students</p>
              </div>
              <Button onClick={() => setIsCreateClassDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Live Class
              </Button>
            </div>

            {/* Live Classes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveClasses.map((liveClass) => {
                const { date, time } = formatDateTime(liveClass.scheduledAt)
                return (
                  <Card key={liveClass.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(liveClass.status)}>
                              {getStatusText(liveClass.status)}
                            </Badge>
                            {liveClass.isCourseSpecific && (
                              <Badge variant="outline" className="text-xs">
                                Course Specific
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg text-card-foreground line-clamp-2">{liveClass.title}</CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {liveClass.specialization}
                            </Badge>
                            <span>•</span>
                            <span>{liveClass.subject}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Join Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Class
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="line-clamp-2">{liveClass.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {liveClass.enrolledStudents}/{liveClass.maxStudents}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{liveClass.platform}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Duration: {liveClass.duration} min</span>
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(liveClass.enrolledStudents / liveClass.maxStudents) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {liveClass.status === "live" && (
                          <Button className="w-full gap-2 bg-red-600 hover:bg-red-700">
                            <Video className="h-4 w-4" />
                            Join Live Class
                          </Button>
                        )}

                        {liveClass.status === "completed" && liveClass.recordingUrl && (
                          <Button variant="outline" className="w-full gap-2 bg-transparent">
                            <Video className="h-4 w-4" />
                            View Recording
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="webinars" className="space-y-6">
            {/* Webinars Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">Webinars</h2>
                <p className="text-sm text-muted-foreground">Public seminars and educational sessions</p>
              </div>
              <Button onClick={() => setIsCreateWebinarDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Webinar
              </Button>
            </div>

            {/* Webinars Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {webinars.map((webinar) => {
                const { date, time } = formatDateTime(webinar.scheduledAt)
                return (
                  <Card key={webinar.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(webinar.status)}>{getStatusText(webinar.status)}</Badge>
                            {webinar.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg text-card-foreground line-clamp-2">{webinar.title}</CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {webinar.topic}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Join Webinar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Webinar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Webinar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="line-clamp-2">{webinar.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {webinar.registeredAttendees}/{webinar.maxAttendees}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{webinar.platform}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Duration: {webinar.duration} min</span>
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(webinar.registeredAttendees / webinar.maxAttendees) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {webinar.registrationRequired && webinar.status === "scheduled" && (
                          <Button variant="outline" className="w-full gap-2 bg-transparent">
                            <ExternalLink className="h-4 w-4" />
                            Registration Link
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty States */}
        {liveClasses.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No live classes scheduled</h3>
              <p className="text-muted-foreground text-center mb-4">
                Schedule your first live class to interact with students in real-time
              </p>
              <Button onClick={() => setIsCreateClassDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Your First Live Class
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateLiveClassDialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen} />
      <CreateWebinarDialog open={isCreateWebinarDialogOpen} onOpenChange={setIsCreateWebinarDialogOpen} />
    </div>
  )
}
