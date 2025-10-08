"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateLiveClassDialog } from "@/components/create-live-class-dialog"
import { CreateWebinarDialog } from "@/components/create-webinar-dialog"
import {
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Plus,
  Trash2,
  Users,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  live: "border-destructive/30 bg-destructive/10 text-destructive",
  scheduled: "border-primary/30 bg-primary/10 text-primary",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  default: "border-border/60 bg-muted text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  live: "Live Now",
  scheduled: "Scheduled",
  completed: "Completed",
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

export default function LiveClassesPage() {
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false)
  const [isCreateWebinarDialogOpen, setIsCreateWebinarDialogOpen] = useState(false)

  const liveClasses = [
    {
      id: 1,
      title: "Sample Live Class",
      description: "Sample description",
      status: "scheduled",
      scheduledAt: new Date().toISOString(),
      duration: 60,
      maxStudents: 50,
      enrolledStudents: 25,
      platform: "Zoom",
      specialization: "Computer Science",
      subject: "Programming",
      isCourseSpecific: true,
      recordingUrl: "",
    },
  ]

  const webinars = [
    {
      id: 1,
      title: "Sample Webinar",
      description: "Sample description",
      status: "scheduled",
      scheduledAt: new Date().toISOString(),
      duration: 90,
      maxAttendees: 100,
      registeredAttendees: 45,
      platform: "Zoom",
      topic: "Technology",
      isPublic: true,
      registrationRequired: true,
    },
  ]

  const totalLiveClasses = liveClasses.length
  const liveNowCount = liveClasses.filter((liveClass) => liveClass.status === "live").length
  const scheduledLiveCount = liveClasses.filter((liveClass) => liveClass.status === "scheduled").length
  const totalWebinars = webinars.length
  const upcomingWebinars = webinars.filter((webinar) => webinar.status === "scheduled").length
  const totalParticipants =
    liveClasses.reduce((sum, liveClass) => sum + liveClass.enrolledStudents, 0) +
    webinars.reduce((sum, webinar) => sum + webinar.registeredAttendees, 0)

  const renderStatusBadge = (status: string) => (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", statusStyles[status] ?? statusStyles.default)}
    >
      {statusLabels[status] ?? "Unknown"}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Live Sessions Hub"
        description="Plan, monitor, and run your live classes and webinars with a consistent experience."
      />

      <div className="px-6 space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl text-card-foreground">Live Sessions Hub</CardTitle>
              <CardDescription className="text-muted-foreground">
                Stay on top of your scheduled classes and webinars, and take quick action when plans change.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsCreateClassDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Live Class
              </Button>
              <Button variant="outline" onClick={() => setIsCreateWebinarDialogOpen(true)} className="gap-2">
                <Video className="h-4 w-4" />
                Plan Webinar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              {liveNowCount} Live Now
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {scheduledLiveCount} Scheduled Classes
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              {upcomingWebinars} Upcoming Webinars
            </span>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Live Classes</p>
                <p className="text-3xl font-semibold text-card-foreground">{totalLiveClasses}</p>
              </div>
              <Video className="h-10 w-10 text-primary" />
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Classes Live Now</p>
                <p className="text-3xl font-semibold text-card-foreground">{liveNowCount}</p>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Webinars</p>
                <p className="text-3xl font-semibold text-card-foreground">{totalWebinars}</p>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                <p className="text-3xl font-semibold text-card-foreground">{totalParticipants}</p>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <Tabs defaultValue="live-classes" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-border bg-muted p-1">
                <TabsTrigger
                  value="live-classes"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Live Classes
                </TabsTrigger>
                <TabsTrigger
                  value="webinars"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Webinars
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live-classes" className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-card-foreground">Live Classes</h2>
                    <p className="text-sm text-muted-foreground">
                      Interactive sessions designed for your enrolled students.
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateClassDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Live Class
                  </Button>
                </div>

                {liveClasses.length === 0 ? (
                  <Card className="border border-dashed border-border/60 bg-muted/10 text-center">
                    <CardContent className="space-y-4 py-12">
                      <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-card-foreground">No live classes scheduled</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule your first live class to engage with students in real time.
                      </p>
                      <Button onClick={() => setIsCreateClassDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Schedule Your First Live Class
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {liveClasses.map((liveClass) => {
                      const { date, time } = formatDateTime(liveClass.scheduledAt)
                      const capacity = Math.max(1, liveClass.maxStudents)
                      const fillPercentage = Math.min(100, (liveClass.enrolledStudents / capacity) * 100)

                      return (
                        <Card key={liveClass.id} className="border-border bg-card shadow-sm transition hover:shadow-md">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {renderStatusBadge(liveClass.status)}
                                  {liveClass.isCourseSpecific && (
                                    <Badge variant="outline" className="border-primary/40 text-xs text-primary">
                                      Course Specific
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2">
                                  {liveClass.title}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="border-border/60 text-muted-foreground">
                                    {liveClass.specialization}
                                  </Badge>
                                  <span>•</span>
                                  <span className="capitalize">{liveClass.subject}</span>
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
                            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                              {liveClass.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-5 pt-0">
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>
                                  {liveClass.enrolledStudents}/{liveClass.maxStudents}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-primary" />
                                <span>{liveClass.platform}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Duration: {liveClass.duration} min</span>
                                <span>{fillPercentage.toFixed(0)}% full</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${fillPercentage}%` }}
                                />
                              </div>
                            </div>

                            {liveClass.status === "live" ? (
                              <Button className="w-full gap-2">
                                <Video className="h-4 w-4" />
                                Join Live Class
                              </Button>
                            ) : liveClass.status === "completed" && liveClass.recordingUrl ? (
                              <Button variant="outline" className="w-full gap-2">
                                <Video className="h-4 w-4" />
                                View Recording
                              </Button>
                            ) : null}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="webinars" className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-card-foreground">Webinars</h2>
                    <p className="text-sm text-muted-foreground">
                      Public sessions to reach a broader audience and grow your community.
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateWebinarDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Webinar
                  </Button>
                </div>

                {webinars.length === 0 ? (
                  <Card className="border border-dashed border-border/60 bg-muted/10 text-center">
                    <CardContent className="space-y-4 py-12">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-card-foreground">No webinars scheduled</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first webinar to engage with a wider audience.
                      </p>
                      <Button onClick={() => setIsCreateWebinarDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Plan Your First Webinar
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {webinars.map((webinar) => {
                      const { date, time } = formatDateTime(webinar.scheduledAt)
                      const capacity = Math.max(1, webinar.maxAttendees)
                      const fillPercentage = Math.min(100, (webinar.registeredAttendees / capacity) * 100)

                      return (
                        <Card key={webinar.id} className="border-border bg-card shadow-sm transition hover:shadow-md">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {renderStatusBadge(webinar.status)}
                                  {webinar.isPublic && (
                                    <Badge variant="outline" className="border-primary/40 text-xs text-primary">
                                      Public
                                    </Badge>
                                  )}
                                  {webinar.registrationRequired && (
                                    <Badge variant="outline" className="border-purple-400/40 text-xs text-purple-400">
                                      Registration Required
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2">
                                  {webinar.title}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="border-border/60 text-muted-foreground">
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
                            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                              {webinar.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-5 pt-0">
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>
                                  {webinar.registeredAttendees}/{webinar.maxAttendees}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-primary" />
                                <span>{webinar.platform}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Duration: {webinar.duration} min</span>
                                <span>{fillPercentage.toFixed(0)}% registered</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${fillPercentage}%` }}
                                />
                              </div>
                            </div>

                            {webinar.registrationRequired && webinar.status === "scheduled" && (
                              <Button variant="outline" className="w-full gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Registration Link
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <CreateLiveClassDialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen} />
        <CreateWebinarDialog open={isCreateWebinarDialogOpen} onOpenChange={setIsCreateWebinarDialogOpen} />
      </div>
    </div>
  )
}
