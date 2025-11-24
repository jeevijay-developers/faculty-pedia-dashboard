/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  BookOpen,
  Target,
  Users,
  TestTube,
  IndianRupee,
  Clock,
  FileText,
} from "lucide-react";
import { getTestSeriesById } from "@/util/server";
import toast from "react-hot-toast";

export type ViewableTestSeries = {
  _id: string;
  title: string;
  description?: unknown;
  price?: number | string;
  validity?: number | string;
  subject?: string | string[];
  specialization?: string | string[];
  image?: string | { url?: string };
  liveTests?: Array<SeriesTest | string>;
  tests?: Array<SeriesTest | string>;
  numberOfTests?: number;
  noOfTests?: number;
  enrolledStudents?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  isCourseSpecific?: boolean;
  courseId?: string | { _id: string; title: string };
};

type SeriesDescription = {
  short?: string;
  shortDesc?: string;
  long?: string;
  longDesc?: string;
};

type SeriesTest = {
  _id?: string;
  title?: string;
  duration?: number;
  questions?: unknown[];
};

interface ViewTestSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSeries: ViewableTestSeries | null;
}

const SUBJECT_COLORS: Record<string, string> = {
  physics: "bg-blue-500/10 text-blue-700 border-blue-200",
  chemistry: "bg-green-500/10 text-green-700 border-green-200",
  mathematics: "bg-purple-500/10 text-purple-700 border-purple-200",
  mixed: "bg-orange-500/10 text-orange-700 border-orange-200",
};

const getSubjectColor = (subject: string) => {
  return (
    SUBJECT_COLORS[subject.toLowerCase()] || "bg-muted text-muted-foreground"
  );
};

const normalizeLabel = (value?: string | string[]) => {
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return "";
};

const parseDescription = (description?: unknown) => {
  if (!description) {
    return "";
  }

  if (typeof description === "string") {
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === "object") {
        const typed = parsed as SeriesDescription;
        return (
          typed.long ||
          typed.longDesc ||
          typed.short ||
          typed.shortDesc ||
          description
        );
      }
      return description;
    } catch {
      return description;
    }
  }

  if (typeof description === "object") {
    const typed = description as SeriesDescription;
    return typed.long || typed.longDesc || typed.short || typed.shortDesc || "";
  }

  return "";
};

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getImageUrl = (image?: string | { url?: string }) => {
  if (!image) return "/placeholder.svg";
  return typeof image === "string" ? image : image.url || "/placeholder.svg";
};

const getPriceValue = (price?: number | string) => {
  if (typeof price === "number") {
    return price;
  }
  const parsed = Number(price);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeTests = (tests?: Array<SeriesTest | string>) => {
  if (!Array.isArray(tests)) {
    return [] as SeriesTest[];
  }
  return tests.map((entry, index) => {
    if (typeof entry === "string") {
      return { _id: entry, title: `Test ${index + 1}` };
    }
    return entry;
  });
};

const collectTests = (series: ViewableTestSeries) => {
  const tests = Array.isArray(series.liveTests)
    ? normalizeTests(series.liveTests)
    : Array.isArray(series.tests)
    ? normalizeTests(series.tests)
    : [];

  const plannedTotal =
    typeof series.numberOfTests === "number"
      ? series.numberOfTests
      : typeof series.noOfTests === "number"
      ? series.noOfTests
      : tests.length;

  return { tests, plannedTotal };
};

const resolveEndDate = (series: ViewableTestSeries) => {
  if (typeof series.validity === "string") {
    return parseDate(series.validity);
  }

  return null;
};

const getValidityLabel = (series: ViewableTestSeries) => {
  if (typeof series.validity === "number") {
    return `${series.validity} days`;
  }

  const endDate = resolveEndDate(series);
  if (!endDate) {
    return "N/A";
  }

  const diffDays = Math.ceil(
    (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) {
    return "Expired";
  }

  return `${diffDays} days remaining`;
};

export function ViewTestSeriesDialog({
  open,
  onOpenChange,
  testSeries,
}: ViewTestSeriesDialogProps) {
  const [seriesDetails, setSeriesDetails] = useState<ViewableTestSeries | null>(
    testSeries
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seriesId = testSeries?._id;

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    if (!seriesId) {
      setError("Missing test series identifier");
      return;
    }

    let isCancelled = false;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetched = await getTestSeriesById(seriesId);
        if (!isCancelled) {
          if (!fetched) {
            setError("Test series not found");
          } else {
            setSeriesDetails(fetched as ViewableTestSeries);
          }
        }
      } catch (err) {
        console.error("Failed to load test series details", err);
        if (!isCancelled) {
          setError("Failed to load test series details");
          toast.error("Failed to load test series details");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isCancelled = true;
    };
  }, [open, seriesId]);

  useEffect(() => {
    if (!open) {
      setSeriesDetails(testSeries);
    }
  }, [open, testSeries]);

  const description = useMemo(
    () => parseDescription(seriesDetails?.description),
    [seriesDetails?.description]
  );
  const subjectLabel = useMemo(
    () => normalizeLabel(seriesDetails?.subject) || "General",
    [seriesDetails?.subject]
  );
  const specializationLabel = useMemo(
    () => normalizeLabel(seriesDetails?.specialization) || "General",
    [seriesDetails?.specialization]
  );
  const imageUrl = useMemo(
    () => getImageUrl(seriesDetails?.image),
    [seriesDetails?.image]
  );
  const priceValue = useMemo(
    () => getPriceValue(seriesDetails?.price),
    [seriesDetails?.price]
  );
  const { tests, plannedTotal } = useMemo(
    () =>
      seriesDetails
        ? collectTests(seriesDetails)
        : { tests: [], plannedTotal: 0 },
    [seriesDetails]
  );
  const validityLabel = useMemo(
    () => (seriesDetails ? getValidityLabel(seriesDetails) : "N/A"),
    [seriesDetails]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-card border-border">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-semibold">
            Test Series Details
          </DialogTitle>
          <DialogDescription>
            Explore the structure and schedule of this series without leaving
            the page.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-4">
              Loading test series details...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-4">
            <TestTube className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-medium text-foreground">{error}</p>
            <Button
              variant="outline"
              onClick={() => seriesId && onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : seriesDetails ? (
          <ScrollArea className="max-h-[75vh] pr-4">
            <div className="space-y-6">
              <Card className="bg-muted/40 border-border">
                <CardHeader>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-2xl font-bold capitalize">
                        {seriesDetails.title}
                      </CardTitle>
                      <Badge
                        className={`${getSubjectColor(
                          subjectLabel
                        )} capitalize`}
                      >
                        {subjectLabel}
                      </Badge>
                      {seriesDetails.isCourseSpecific && (
                        <Badge variant="outline">Course Specific</Badge>
                      )}
                    </div>
                    {seriesDetails.isCourseSpecific &&
                      seriesDetails.courseId && (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Assigned to:
                          </span>
                          <span className="font-medium">
                            {typeof seriesDetails.courseId === "string"
                              ? seriesDetails.courseId
                              : seriesDetails.courseId.title}
                          </span>
                        </div>
                      )}
                    <p className="text-muted-foreground">
                      {description || "No description available"}
                    </p>
                  </div>
                </CardHeader>
                {imageUrl && (
                  <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden border border-border">
                      <img
                        src={imageUrl}
                        alt={seriesDetails.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TestTube className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total Tests
                        </p>
                        <p className="text-sm font-semibold">{plannedTotal}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Enrolled Students
                        </p>
                        <p className="text-sm font-semibold">
                          {Array.isArray(seriesDetails.enrolledStudents)
                            ? seriesDetails.enrolledStudents.length
                            : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-semibold">
                          ₹{priceValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Validity
                        </p>
                        <p className="text-sm font-semibold">{validityLabel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Series Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Specialization
                      </p>
                      <p className="font-medium capitalize">
                        {specializationLabel || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Subject
                      </p>
                      <Badge
                        variant="outline"
                        className={getSubjectColor(subjectLabel)}
                      >
                        {subjectLabel || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Tests Added
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${
                                plannedTotal
                                  ? (tests.length / plannedTotal) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {tests.length} / {plannedTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {description && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {tests.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Tests in Series ({tests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>Test Title</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Questions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tests.map((test, index) => (
                          <TableRow key={test._id || index}>
                            <TableCell>
                              <Badge variant="outline">{index + 1}</Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium capitalize">
                                {test.title || `Test ${index + 1}`}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {typeof test.duration === "number"
                                  ? `${test.duration} min`
                                  : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {Array.isArray(test.questions)
                                  ? test.questions.length
                                  : 0}{" "}
                                questions
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Select a test series to view its details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
