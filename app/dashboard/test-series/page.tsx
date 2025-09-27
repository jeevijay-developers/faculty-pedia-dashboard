"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TestTube, Users, Calendar, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTestSeriesDialog } from "@/components/create-test-series-dialog"

// Mock data for test series
const testSeries = [
  {
    id: "1",
    title: "JEE Main Physics Mock Tests",
    description: {
      short: "Comprehensive physics mock tests for JEE Main preparation",
      long: "A complete series of physics mock tests designed specifically for JEE Main aspirants. Covers all important topics with detailed solutions and performance analysis.",
    },
    price: 2500,
    validity: 180,
    noOfTests: 15,
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    subject: "Physics",
    specialization: "IIT-JEE",
    enrolledStudents: 234,
    liveTests: ["test1", "test2", "test3"],
    isCourseSpecific: false,
    image: "/test-series-physics.jpg",
  },
  {
    id: "2",
    title: "NEET Chemistry Test Series",
    description: {
      short: "Complete chemistry test series for NEET preparation",
      long: "Comprehensive chemistry test series covering organic, inorganic, and physical chemistry for NEET aspirants.",
    },
    price: 2000,
    validity: 150,
    noOfTests: 12,
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    subject: "Chemistry",
    specialization: "NEET",
    enrolledStudents: 189,
    liveTests: ["test4", "test5"],
    isCourseSpecific: true,
    courseId: "course1",
    image: "/test-series-chemistry.png",
  },
  {
    id: "3",
    title: "Mathematics Foundation Tests",
    description: {
      short: "Foundation level mathematics tests for competitive exams",
      long: "Build strong mathematical foundations with these carefully designed tests covering all basic to intermediate topics.",
    },
    price: 1500,
    validity: 120,
    noOfTests: 10,
    startDate: "2024-03-01",
    endDate: "2024-08-01",
    subject: "Mathematics",
    specialization: "CBSE",
    enrolledStudents: 156,
    liveTests: ["test6"],
    isCourseSpecific: false,
    image: "/test-series-math.png",
  },
]

export default function TestSeriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const getStatusColor = (series: any) => {
    const now = new Date()
    const startDate = new Date(series.startDate)
    const endDate = new Date(series.endDate)

    if (now < startDate) {
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    } else if (now > endDate) {
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    } else {
      return "bg-green-500/10 text-green-500 border-green-500/20"
    }
  }

  const getStatusText = (series: any) => {
    const now = new Date()
    const startDate = new Date(series.startDate)
    const endDate = new Date(series.endDate)

    if (now < startDate) {
      return "Upcoming"
    } else if (now > endDate) {
      return "Completed"
    } else {
      return "Active"
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Test Series Management" description="Create and manage your test series" />

      <div className="px-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">Your Test Series</h2>
            <p className="text-sm text-muted-foreground">Organize tests into series and track student performance</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Test Series
          </Button>
        </div>

        {/* Test Series Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testSeries.map((series) => (
            <Card key={series.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={series.image || "/placeholder.svg"}
                  alt={series.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={getStatusColor(series)}>{getStatusText(series)}</Badge>
                </div>
                {series.isCourseSpecific && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-background/80">
                      Course Specific
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg text-card-foreground line-clamp-1">{series.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {series.specialization}
                      </Badge>
                      <span>•</span>
                      <span>{series.subject}</span>
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
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Series
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Series
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">{series.description.short}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{series.noOfTests} tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{series.enrolledStudents} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{series.validity} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">₹{series.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Tests Added: {series.liveTests.length}/{series.noOfTests}
                    </span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(series.liveTests.length / series.noOfTests) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {testSeries.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No test series yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first test series to organize your tests
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Test Series
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTestSeriesDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
