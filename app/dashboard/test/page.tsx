/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Loader2,
  FileQuestion,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTestDialog } from "@/components/edit-test-dialog";
import { DeleteTestAlert } from "@/components/delete-test-alert";
import { AssignTestSeriesDialog } from "@/components/assign-test-series-dialog";
import { getEducatorTests, deleteLiveTest } from "@/util/server";
import { Test } from "@/lib/types/test";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export default function CreateTestPage() {
  const { educator } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const fetchTests = useCallback(async () => {
    if (!educator?._id) return;

    try {
      setLoading(true);
      const response = await getEducatorTests(educator._id);
      // response is either response.data or the full payload
      const testsData = response.tests || response.data?.tests || [];
      setTests(testsData);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  }, [educator?._id]);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchTests();
  }, [educator, router, fetchTests]);

  const handleViewTest = (test: Test) => {
    router.push(`/dashboard/test/${test._id}`);
  };

  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTest = (test: Test) => {
    setTestToDelete(test);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteLiveTest(testToDelete._id);
      toast.success("Test deleted successfully!");
      setIsDeleteAlertOpen(false);
      setTestToDelete(null);
      // Refresh tests list
      fetchTests();
    } catch (error: any) {
      console.error("Error deleting test:", error);
      toast.error(error.response?.data?.message || "Failed to delete test");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      physics: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      chemistry: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      mathematics: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      mixed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-500/10 text-gray-500 border-gray-500/20"
    );
  };

  const getStatusColor = (test: Test) => {
    return test.isActive
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getStatusText = (test: Test) => {
    return test.isActive ? "Active" : "Inactive";
  };

  const totalPages = Math.ceil(tests.length / ITEMS_PER_PAGE);
  const paginatedTests = tests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTest = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTestIds.length === paginatedTests.length) {
      setSelectedTestIds([]);
    } else {
      setSelectedTestIds(paginatedTests.map((test) => test._id));
    }
  };

  const handleAssignToTestSeries = () => {
    setIsAssignDialogOpen(true);
  };

  const handleAssignmentComplete = () => {
    setSelectedTestIds([]);
    fetchTests();
  };

  if (!educator) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Test Management"
        description="Create and manage your live tests"
      />

      <div className="px-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Tests
            </h2>
            <p className="text-sm text-muted-foreground">
              Create comprehensive tests with custom questions and settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedTestIds.length > 0 && (
              <Button
                onClick={handleAssignToTestSeries}
                variant="outline"
                className="gap-2"
              >
                <ListChecks className="h-4 w-4" />
                Assign to Test Series ({selectedTestIds.length})
              </Button>
            )}
            <Button
              onClick={() => router.push("/dashboard/test/create")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Test
            </Button>
          </div>
        </div>

        {/* Test Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          </div>
        ) : tests.length > 0 ? (
          <>
            <Card className="bg-card border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          paginatedTests.length > 0 &&
                          selectedTestIds.length === paginatedTests.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Test Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTests.map((test) => (
                    <TableRow key={test._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTestIds.includes(test._id)}
                          onCheckedChange={() => handleSelectTest(test._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-xs">
                          <span className="font-medium text-foreground line-clamp-1">
                            {test.title}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1 truncate">
                            {test.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {test.subjects.slice(0, 2).map((subject, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={getSubjectColor(subject)}
                            >
                              {subject.charAt(0).toUpperCase() +
                                subject.slice(1)}
                            </Badge>
                          ))}
                          {test.subjects.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{test.subjects.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {test.specialization.map((spec, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {test.questions.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {test.duration} min
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(test.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(test)}>
                          {getStatusText(test)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {test.overallMarks}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
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
                              onClick={() => handleViewTest(test)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditTest(test)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Test
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-white font-semibold"
                              onClick={() => handleDeleteTest(test)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Test
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
                  {Math.min(currentPage * ITEMS_PER_PAGE, tests.length)} of{" "}
                  {tests.length} tests
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
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No tests yet
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first test to start building your test library
              </p>
              <Button
                onClick={() => router.push("/dashboard/test/create")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Test
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <EditTestDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        test={selectedTest}
        onTestUpdated={fetchTests}
      />
      <DeleteTestAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDeleteTest}
        loading={deleteLoading}
        testTitle={testToDelete?.title || ""}
      />
      <AssignTestSeriesDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        selectedTestIds={selectedTestIds}
        onAssignmentComplete={handleAssignmentComplete}
      />
    </div>
  );
}
