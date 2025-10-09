"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TestTube, Loader2, MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateTestSeriesDialog } from "@/components/create-test-series-dialog"
import { useAuth } from "@/contexts/auth-context"
import { getTestSeriesByIds } from "@/util/server"
import toast from "react-hot-toast"

const ITEMS_PER_PAGE = 10

export default function TestSeriesPage() {
  const { educator } = useAuth()
  const router = useRouter()
  const [testSeries, setTestSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.ceil(testSeries.length / ITEMS_PER_PAGE)
  const paginatedTestSeries = testSeries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleViewTestSeries = (series: any) => {
    router.push(`/dashboard/test-series/${series._id}`)
  }

  const handleEditTestSeries = (series: any) => {
    toast.custom("Edit functionality coming soon")
  }

  const handleDeleteTestSeries = (series: any) => {
    toast.error("Delete functionality coming soon")
  }

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
          <>
            <Card className="bg-card border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Series Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTestSeries.map((series) => (
                    <TableRow key={series._id}>
                      <TableCell>
                        <div className="w-16 h-12 rounded overflow-hidden">
                          <img
                            src={series.image?.url || "/placeholder.svg"}
                            alt={series.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-sm">
                          <span className="font-medium text-foreground capitalize line-clamp-1">
                            {series.title}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1 truncate">
                            {series.description?.shortDesc || series.description?.short || "No description"}
                          </span>
                          {series.isCourseSpecific && (
                            <Badge variant="outline" className="w-fit mt-1 text-xs">
                              Course Specific
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit capitalize">
                            {series.subject}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">{series.specialization}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">{series.noOfTests || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{series.enrolledStudents?.length || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₹{(series.price || 0).toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{series.validity || 0} days</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(series)}>{getStatusText(series)}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTestSeries(series)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTestSeries(series)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Series
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTestSeries(series)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Series
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, testSeries.length)} of {testSeries.length} test series
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-card border-border">
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No test series yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first test series to organize your tests
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Test Series
              </Button>
            </div>
          </Card>
        )}
      </div>

      <CreateTestSeriesDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
