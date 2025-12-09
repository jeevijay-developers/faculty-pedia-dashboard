/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  TestTube,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTestSeriesDialog } from "@/components/create-test-series-dialog";
import { EditTestSeriesDialog } from "@/components/edit-test-series-dialog";
import { DeleteTestSeriesAlert } from "@/components/delete-test-series-alert";
import { AssignCourseDialog } from "@/components/assign-course-dialog";
import { useAuth } from "@/contexts/auth-context";
import { getEducatorTestSeries, deleteTestSeries } from "@/util/server";
import { ViewTestSeriesDialog } from "@/components/view-test-series-dialog";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

type DashboardTestSeries = {
  _id: string;
  title: string;
  description?: unknown;
  price?: number | string;
  subject?: string | string[];
  specialization?: string | string[];
  image?: string | { url?: string };
  numberOfTests?: number;
  noOfTests?: number;
  tests?: Array<string | { _id: string }>;
  validity?: number | string;
  enrolledStudents?: unknown[];
  createdAt?: string;
  isCourseSpecific?: boolean;
};

export default function TestSeriesPage() {
  const { educator } = useAuth();
  const [testSeries, setTestSeries] = useState<DashboardTestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] =
    useState<DashboardTestSeries | null>(null);
  const [seriesToDelete, setSeriesToDelete] =
    useState<DashboardTestSeries | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [seriesToView, setSeriesToView] = useState<DashboardTestSeries | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [seriesToAssign, setSeriesToAssign] =
    useState<DashboardTestSeries | null>(null);

  const getDescriptionSnippet = (
    description: DashboardTestSeries["description"]
  ) => {
    if (!description) return "No description";

    if (typeof description === "string") {
      try {
        const parsed = JSON.parse(description);
        if (parsed && typeof parsed === "object") {
          return (
            parsed.short ||
            parsed.shortDesc ||
            parsed.long ||
            parsed.longDesc ||
            "No description"
          );
        }
        return description;
      } catch {
        return description;
      }
    }

    const descObject = description as {
      short?: string;
      shortDesc?: string;
      long?: string;
      longDesc?: string;
    };

    return (
      descObject.short ||
      descObject.shortDesc ||
      descObject.long ||
      descObject.longDesc ||
      "No description"
    );
  };

  const getSubjectLabel = (subject: DashboardTestSeries["subject"]) => {
    if (Array.isArray(subject) && subject.length > 0) {
      return subject[0];
    }
    if (typeof subject === "string" && subject.length > 0) {
      return subject;
    }
    return "N/A";
  };

  const getSpecializationLabel = (
    specialization: DashboardTestSeries["specialization"]
  ) => {
    if (Array.isArray(specialization) && specialization.length > 0) {
      return specialization[0];
    }
    if (typeof specialization === "string" && specialization.length > 0) {
      return specialization;
    }
    return "General";
  };

  const getImageSource = (series: DashboardTestSeries) => {
    if (!series.image) {
      return "/placeholder.svg";
    }
    if (typeof series.image === "string") {
      return series.image;
    }
    return series.image.url || "/placeholder.svg";
  };

  const getTestsCount = (series: DashboardTestSeries) => {
    if (typeof series.numberOfTests === "number") {
      return series.numberOfTests;
    }
    if (typeof series.noOfTests === "number") {
      return series.noOfTests;
    }
    if (Array.isArray(series.tests)) {
      return series.tests.length;
    }
    return 0;
  };

  const getPriceValue = (price: DashboardTestSeries["price"]) => {
    if (typeof price === "number") {
      return price;
    }
    const parsed = Number(price);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getStartDateValue = (series: DashboardTestSeries) => series.createdAt;

  const getEndDateValue = (series: DashboardTestSeries) => series.validity;

  const getValidityDays = (series: DashboardTestSeries) => {
    if (typeof series.validity === "number") {
      return series.validity;
    }

    const endValue = getEndDateValue(series);
    if (!endValue) return 0;

    const endDate = new Date(endValue);
    if (Number.isNaN(endDate.getTime())) {
      return 0;
    }

    const startValue = getStartDateValue(series);
    const startDate = startValue ? new Date(startValue) : new Date();
    const diff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  // Fetch test series when educator data is available
  const fetchTestSeries = useCallback(async () => {
    if (!educator?._id) {
      setLoading(false);
      setTestSeries([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getEducatorTestSeries(educator._id);
      const seriesList: DashboardTestSeries[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.testSeries)
        ? response.testSeries
        : [];
      setTestSeries(seriesList);
    } catch (error) {
      console.error("Error fetching test series:", error);
      toast.error("Failed to load test series");
      setTestSeries([]);
    } finally {
      setLoading(false);
    }
  }, [educator?._id]);

  useEffect(() => {
    fetchTestSeries();
  }, [fetchTestSeries]);

  const totalPages = Math.ceil(testSeries.length / ITEMS_PER_PAGE);
  const paginatedTestSeries = testSeries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewTestSeries = (series: DashboardTestSeries) => {
    setSeriesToView(series);
    setIsViewDialogOpen(true);
  };

  const handleEditTestSeries = (series: DashboardTestSeries) => {
    setSelectedSeries(series);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTestSeries = (series: DashboardTestSeries) => {
    setSeriesToDelete(series);
    setIsDeleteAlertOpen(true);
  };

  const handleAssignCourse = (series: DashboardTestSeries) => {
    setSeriesToAssign(series);
    setIsAssignDialogOpen(true);
  };

  const confirmDeleteTestSeries = async () => {
    if (!seriesToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteTestSeries(seriesToDelete._id);
      toast.success("Test series deleted successfully!");
      setIsDeleteAlertOpen(false);
      setSeriesToDelete(null);
      // Refresh the test series list
      await fetchTestSeries();
    } catch (error) {
      console.error("Error deleting test series:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Failed to delete test series"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (series: DashboardTestSeries) => {
    const now = new Date();
    const endValue = getEndDateValue(series);
    const endDate = endValue ? new Date(endValue) : null;

    const isAfterEnd =
      endDate && !Number.isNaN(endDate.getTime()) && now > endDate;

    if (isAfterEnd) {
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }

    return "bg-green-500/10 text-green-500 border-green-500/20";
  };

  const getStatusText = (series: DashboardTestSeries) => {
    const now = new Date();
    const endValue = getEndDateValue(series);
    const endDate = endValue ? new Date(endValue) : null;

    const isAfterEnd =
      endDate && !Number.isNaN(endDate.getTime()) && now > endDate;

    if (isAfterEnd) {
      return "Expired";
    }

    return "Active";
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Test Series Management"
        description="Create and manage your test series"
      />

      <div className="px-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Test Series
            </h2>
            <p className="text-sm text-muted-foreground">
              Organize tests into series and track student performance
            </p>
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
                    <TableHead>Assign</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTestSeries.map((series) => (
                    <TableRow key={series._id}>
                      <TableCell>
                        <div className="w-16 h-12 rounded overflow-hidden">
                          <img
                            src={getImageSource(series)}
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
                            {getDescriptionSnippet(series.description)}
                          </span>
                          {series.isCourseSpecific && (
                            <Badge
                              variant="outline"
                              className="w-fit mt-1 text-xs"
                            >
                              Course Specific
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit capitalize">
                            {getSubjectLabel(series.subject)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            {getSpecializationLabel(series.specialization)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">
                            {series.tests?.length}/{getTestsCount(series)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {Array.isArray(series.enrolledStudents)
                            ? series.enrolledStudents.length
                            : 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₹{getPriceValue(series.price).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {getValidityDays(series)} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(series)}>
                          {getStatusText(series)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignCourse(series)}
                        >
                          {series.isCourseSpecific ? "Reassign" : "Assign"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewTestSeries(series)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditTestSeries(series)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Series
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 font-medium"
                              onClick={() => handleDeleteTestSeries(series)}
                            >
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
                  {Math.min(currentPage * ITEMS_PER_PAGE, testSeries.length)} of{" "}
                  {testSeries.length} test series
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
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
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No test series yet
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first test series to organize your tests
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Test Series
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreateTestSeriesDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSeriesCreated={fetchTestSeries}
      />
      <EditTestSeriesDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        testSeries={selectedSeries}
        onTestSeriesUpdated={fetchTestSeries}
      />
      <DeleteTestSeriesAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDeleteTestSeries}
        loading={deleteLoading}
        seriesTitle={seriesToDelete?.title || ""}
      />
      <ViewTestSeriesDialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSeriesToView(null);
          }
        }}
        testSeries={seriesToView}
      />
      <AssignCourseDialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          setIsAssignDialogOpen(open);
          if (!open) {
            setSeriesToAssign(null);
          }
        }}
        testSeries={seriesToAssign}
        onAssignmentComplete={fetchTestSeries}
      />
    </div>
  );
}
