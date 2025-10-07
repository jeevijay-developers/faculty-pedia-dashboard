"use client"

import { useState } from "react"
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
      recordingUrl: ""
    }
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
      registrationRequired: true
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 text-red-700 border border-red-200"
      case "scheduled":
        return "bg-blue-100 text-blue-700 border border-blue-200"
      case "completed":
        return "bg-green-100 text-green-700 border border-green-200"
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200"
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

  const totalLiveClasses = liveClasses.length
  const liveNowCount = liveClasses.filter((liveClass) => liveClass.status === "live").length
  const scheduledLiveCount = liveClasses.filter((liveClass) => liveClass.status === "scheduled").length
  const totalWebinars = webinars.length
  const upcomingWebinars = webinars.filter((webinar) => webinar.status === "scheduled").length
  const totalParticipants =
    liveClasses.reduce((sum, liveClass) => sum + liveClass.enrolledStudents, 0) +
    webinars.reduce((sum, webinar) => sum + webinar.registeredAttendees, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live Sessions Hub
            </h1>
            <p className="text-lg text-gray-600">
              Plan, monitor, and run your live classes and webinars with a consistent brand experience.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {liveNowCount} Live Now
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {scheduledLiveCount} Scheduled Classes
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                {upcomingWebinars} Upcoming Webinars
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsCreateClassDialogOpen(true)}
              className="px-6 py-3 text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Schedule Live Class
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreateWebinarDialogOpen(true)}
              className="px-6 py-3 text-sm font-semibold border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Video className="mr-2 h-5 w-5" />
              Plan Webinar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Live Classes</p>
                  <p className="text-3xl font-bold text-blue-900">{totalLiveClasses}</p>
                </div>
                <Video className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Classes Live Now</p>
                  <p className="text-3xl font-bold text-red-900">{liveNowCount}</p>
                </div>
                <Clock className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Webinars</p>
                  <p className="text-3xl font-bold text-purple-900">{totalWebinars}</p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Participants</p>
                  <p className="text-3xl font-bold text-green-900">{totalParticipants}</p>
                </div>
                <Users className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-blue-100 backdrop-blur">
          <Tabs defaultValue="live-classes" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-slate-100/80 p-1">
              <TabsTrigger value="live-classes" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Live Classes
              </TabsTrigger>
              <TabsTrigger value="webinars" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Webinars
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live-classes" className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Live Classes</h2>
                  <p className="text-sm text-gray-500">Interactive sessions designed for your enrolled students.</p>
                </div>
                <Button
                  onClick={() => setIsCreateClassDialogOpen(true)}
                  className="px-5 py-2 text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Live Class
                </Button>
              </div>

              {liveClasses.length === 0 ? (
                <Card className="border-2 border-dashed border-blue-200 bg-white/70 text-center shadow-sm">
                  <CardContent className="space-y-4 py-12">
                    <Video className="mx-auto h-12 w-12 text-blue-500" />
                    <h3 className="text-xl font-semibold text-gray-800">No live classes scheduled</h3>
                    <p className="text-sm text-gray-500">
                      Schedule your first live class to engage with students in real time.
                    </p>
                    <Button
                      onClick={() => setIsCreateClassDialogOpen(true)}
                      className="text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
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
                      <Card
                        key={liveClass.id}
                        className="group border-0 bg-white/80 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={getStatusColor(liveClass.status)}>{getStatusText(liveClass.status)}</Badge>
                                {liveClass.isCourseSpecific && (
                                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                                    Course Specific
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 line-clamp-2">
                                {liveClass.title}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                                  {liveClass.specialization}
                                </Badge>
                                <span>•</span>
                                <span className="capitalize">{liveClass.subject}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
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
                          <CardDescription className="text-sm text-gray-500 line-clamp-3">{liveClass.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-0">
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <span>{time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-500" />
                              <span>
                                {liveClass.enrolledStudents}/{liveClass.maxStudents}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-orange-500" />
                              <span>{liveClass.platform}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Duration: {liveClass.duration} min</span>
                              <span>{fillPercentage.toFixed(0)}% full</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                          </div>

                          {liveClass.status === "live" ? (
                            <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600">
                              <Video className="mr-2 h-4 w-4" />
                              Join Live Class
                            </Button>
                          ) : liveClass.status === "completed" && liveClass.recordingUrl ? (
                            <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                              <Video className="mr-2 h-4 w-4" />
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
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Webinars</h2>
                  <p className="text-sm text-gray-500">
                    Public sessions to reach a broader audience and grow your community.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateWebinarDialogOpen(true)}
                  className="px-5 py-2 text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Webinar
                </Button>
              </div>

              {webinars.length === 0 ? (
                <Card className="border-2 border-dashed border-purple-200 bg-white/70 text-center shadow-sm">
                  <CardContent className="space-y-4 py-12">
                    <Users className="mx-auto h-12 w-12 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-800">No webinars scheduled</h3>
                    <p className="text-sm text-gray-500">Create your first webinar to engage with a wider audience.</p>
                    <Button
                      onClick={() => setIsCreateWebinarDialogOpen(true)}
                      className="text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
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
                      <Card
                        key={webinar.id}
                        className="group border-0 bg-white/80 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={getStatusColor(webinar.status)}>{getStatusText(webinar.status)}</Badge>
                                {webinar.isPublic && (
                                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                                    Public
                                  </Badge>
                                )}
                                {webinar.registrationRequired && (
                                  <Badge variant="outline" className="border-purple-200 bg-purple-50 text-xs text-purple-700">
                                    Registration Required
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 line-clamp-2">
                                {webinar.title}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                  {webinar.topic}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
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
                          <CardDescription className="text-sm text-gray-500 line-clamp-3">{webinar.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-0">
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <span>{time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-500" />
                              <span>
                                {webinar.registeredAttendees}/{webinar.maxAttendees}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-orange-500" />
                              <span>{webinar.platform}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Duration: {webinar.duration} min</span>
                              <span>{fillPercentage.toFixed(0)}% registered</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                          </div>

                          {webinar.registrationRequired && webinar.status === "scheduled" && (
                            <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                              <ExternalLink className="mr-2 h-4 w-4" />
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
        </div>

        <CreateLiveClassDialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen} />
        <CreateWebinarDialog open={isCreateWebinarDialogOpen} onOpenChange={setIsCreateWebinarDialogOpen} />
      </div>
    </div>
  )
}
