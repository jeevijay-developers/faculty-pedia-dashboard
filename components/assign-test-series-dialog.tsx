"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";
import { getEducatorTestSeries, bulkAssignTestsToSeries } from "@/util/server";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { subjectToDisplay } from "@/lib/subject-utils";

interface TestSeries {
  _id: string;
  title: string;
  subject?: string | string[];
  specialization?: string | string[];
  tests?: string[];
}

interface AssignTestSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTestIds: string[];
  onAssignmentComplete?: () => void;
}

export function AssignTestSeriesDialog({
  open,
  onOpenChange,
  selectedTestIds,
  onAssignmentComplete,
}: AssignTestSeriesDialogProps) {
  const { educator } = useAuth();
  const [testSeriesList, setTestSeriesList] = useState<TestSeries[]>([]);
  const [selectedTestSeriesId, setSelectedTestSeriesId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch test series when dialog opens
  useEffect(() => {
    const fetchTestSeries = async () => {
      if (!open || !educator?._id) {
        setTestSeriesList([]);
        return;
      }

      try {
        setLoading(true);
        const response = await getEducatorTestSeries(educator._id, {
          limit: 100,
        });
        const fetchedTestSeries = Array.isArray(response)
          ? response
          : Array.isArray(response?.testSeries)
          ? response.testSeries
          : [];
        setTestSeriesList(fetchedTestSeries);
      } catch (error) {
        console.error("Error fetching test series:", error);
        toast.error("Failed to load test series");
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, [open, educator?._id]);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTestSeriesId(null);
    }
  }, [open]);

  const handleTestSeriesToggle = (testSeriesId: string) => {
    // Toggle selection: if same test series clicked again, deselect
    setSelectedTestSeriesId((prev) =>
      prev === testSeriesId ? null : testSeriesId
    );
  };

  const handleAssign = async () => {
    if (!selectedTestSeriesId) {
      toast.error("Please select a test series");
      return;
    }

    if (selectedTestIds.length === 0) {
      toast.error("No tests selected");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      `Assigning ${selectedTestIds.length} test(s) to test series...`
    );

    try {
      const result = await bulkAssignTestsToSeries(
        selectedTestSeriesId,
        selectedTestIds
      );

      toast.success(
        result.message || `Successfully assigned ${result.addedCount} test(s)!`,
        { id: loadingToast }
      );

      onOpenChange(false);
      onAssignmentComplete?.();
    } catch (error) {
      console.error("Error assigning tests to test series:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message ||
          "Failed to assign tests to test series",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubjectLabel = (subject: TestSeries["subject"]) => {
    if (Array.isArray(subject) && subject.length > 0) {
      return subjectToDisplay(subject[0]);
    }
    if (typeof subject === "string" && subject.length > 0) {
      return subjectToDisplay(subject);
    }
    return "N/A";
  };

  const getSpecializationLabel = (
    specialization: TestSeries["specialization"]
  ) => {
    if (Array.isArray(specialization) && specialization.length > 0) {
      return specialization[0];
    }
    if (typeof specialization === "string" && specialization.length > 0) {
      return specialization;
    }
    return "General";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign to Test Series</DialogTitle>
          <DialogDescription>
            Select a test series to assign the selected test(s) to. The tests
            will be added to the selected test series.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">
            Selected Tests: {selectedTestIds.length}
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">
                Loading test series...
              </span>
            </div>
          ) : testSeriesList.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Available Test Series ({testSeriesList.length})
              </p>
              {testSeriesList.map((testSeries) => (
                <Card
                  key={testSeries._id}
                  className={`cursor-pointer transition-colors ${
                    selectedTestSeriesId === testSeries._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleTestSeriesToggle(testSeries._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTestSeriesId === testSeries._id}
                        onCheckedChange={() =>
                          handleTestSeriesToggle(testSeries._id)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground line-clamp-1">
                            {testSeries.title}
                          </h4>
                          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getSubjectLabel(testSeries.subject)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getSpecializationLabel(testSeries.specialization)}
                          </Badge>
                          {testSeries.tests && testSeries.tests.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {testSeries.tests.length} test
                              {testSeries.tests.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No test series available. Create a test series first to assign
                  tests.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || loading || !selectedTestSeriesId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedTestIds.length} Test${
                selectedTestIds.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
