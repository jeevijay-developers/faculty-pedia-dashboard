"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TestTube, Users, Calendar, MoreHorizontal, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTestSeriesDialog } from "@/components/create-test-series-dialog"
import { useAuth } from "@/contexts/auth-context"
import { getTestSeriesByIds } from "@/util/server"
import { toast } from "sonner"

export default function TestSeriesPage() {
  const { educator } = useAuth()
  const [testSeries, setTestSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Fetch test series when educator data is available
  useEffect(() => {
    const fetchTestSeries = async () => {
      if (!educator?.testSeries || educator.testSeries.length === 0) {
        setLoading(false)
        setTestSeries([])
        return
      }

      try {
        setLoading(true)
        const testSeriesIds = educator.testSeries
        const fetchedTestSeries = await getTestSeriesByIds(testSeriesIds)
        setTestSeries(fetchedTestSeries)
      } catch (error) {
        console.error("Error fetching test series:", error)
        toast.error("Failed to load test series")
      } finally {
        setLoading(false)
      }
    }

    fetchTestSeries()
  }, [educator?.testSeries])

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading test series...</p>
            </div>
          </div>
        ) : testSeries.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testSeries.map((series) => (
              <Card key={series._id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden ">
                  <img
                    src={series.image?.url || "/placeholder.svg"}
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
                      <CardTitle className="text-lg text-card-foreground line-clamp-1 capitalize">
                        {series.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {series.specialization}
                        </Badge>
                        <span>•</span>
                        <span className="capitalize">{series.subject}</span>
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
                  <CardDescription className="line-clamp-2">
                    {series.description?.shortDesc || series.description?.short || "No description available"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{series.noOfTests || 0} tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{series.enrolledStudents?.length || 0} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{series.validity || 0} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-md font-semibold text-shadow-gray-50">
                        ₹{(series.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Tests Added: {series.liveTests?.length || 0}/{series.noOfTests || 0}
                      </span>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${series.noOfTests ? ((series.liveTests?.length || 0) / series.noOfTests) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
