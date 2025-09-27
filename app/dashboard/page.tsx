"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileQuestion, TestTube, Video, Users, TrendingUp, Clock, Calendar, ArrowRight } from "lucide-react"

const stats = [
  {
    title: "Total Courses",
    value: "12",
    description: "4 active courses",
    icon: BookOpen,
    trend: "+2 this month",
    href: "/dashboard/courses",
  },
  {
    title: "Question Bank",
    value: "1,247",
    description: "Questions created",
    icon: FileQuestion,
    trend: "+89 this week",
    href: "/dashboard/questions",
  },
  {
    title: "Test Series",
    value: "8",
    description: "Active test series",
    icon: TestTube,
    trend: "+1 this month",
    href: "/dashboard/test-series",
  },
  {
    title: "Students Enrolled",
    value: "2,341",
    description: "Across all courses",
    icon: Users,
    trend: "+156 this month",
    href: "/dashboard/students",
  },
]

const liveStats = [
  {
    title: "Live Classes",
    value: "3",
    description: "Scheduled this week",
    icon: Video,
    status: "1 live now",
    href: "/dashboard/live-classes",
  },
  {
    title: "Webinars",
    value: "2",
    description: "Upcoming events",
    icon: Calendar,
    status: "234 registered",
    href: "/dashboard/live-classes",
  },
]

const recentActivity = [
  {
    title: "New student enrolled in Physics Course",
    time: "2 minutes ago",
    icon: Users,
    type: "enrollment",
  },
  {
    title: "Test Series 'JEE Main Mock Tests' published",
    time: "1 hour ago",
    icon: TestTube,
    type: "test",
  },
  {
    title: "Live class 'Physics - Laws of Motion' starting soon",
    time: "3 hours ago",
    icon: Video,
    type: "live",
  },
  {
    title: "50 new questions added to Question Bank",
    time: "1 day ago",
    icon: FileQuestion,
    type: "question",
  },
  {
    title: "Webinar 'Career Guidance' registration opened",
    time: "2 days ago",
    icon: Calendar,
    type: "webinar",
  },
]

const upcomingEvents = [
  {
    title: "Physics - Laws of Motion",
    type: "Live Class",
    time: "Today, 10:00 AM",
    students: 45,
    status: "starting-soon",
  },
  {
    title: "Career Guidance Webinar",
    type: "Webinar",
    time: "Tomorrow, 6:00 PM",
    students: 234,
    status: "scheduled",
  },
  {
    title: "Chemistry Mock Test",
    type: "Test Series",
    time: "Jan 25, 2:00 PM",
    students: 89,
    status: "scheduled",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your courses."
      />

      <div className="px-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <div className="flex items-center mt-2 text-xs text-primary">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Live Sessions Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {liveStats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="text-xs">
                      {stat.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-card-foreground">{activity.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Upcoming Events</CardTitle>
              <CardDescription>Your scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-card-foreground line-clamp-1">{event.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                        {event.status === "starting-soon" && (
                          <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20">Starting Soon</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.students} participants
                    </div>
                  </div>
                  {index < upcomingEvents.length - 1 && <div className="border-b border-border" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/courses">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Create Course</p>
                    <p className="text-xs text-muted-foreground">Start building</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/questions">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileQuestion className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Add Questions</p>
                    <p className="text-xs text-muted-foreground">Expand bank</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/test-series">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <TestTube className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Create Test</p>
                    <p className="text-xs text-muted-foreground">Build series</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/live-classes">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Schedule Live</p>
                    <p className="text-xs text-muted-foreground">Plan session</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
