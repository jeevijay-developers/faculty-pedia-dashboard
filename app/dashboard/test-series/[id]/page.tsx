"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Target,
  IndianRupee,
  Loader2,
  FileText,
  TestTube,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getTestSeriesById } from "@/util/server";
import toast from "react-hot-toast";
import Image from "next/image";

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

type DetailedTestSeries = {
  _id: string;
  title: string;
  description?: unknown;
  price?: number | string;
  validity?: number | string;
  subject?: string | string[];
  specialization?: string | string[];
  image?: string | { url?: string };
  liveTests?: SeriesTest[];
  tests?: SeriesTest[];
  numberOfTests?: number;
  noOfTests?: number;
  enrolledStudents?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  isCourseSpecific?: boolean;
  courseId?: string | { _id: string; title: string };
};

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
    return { short: "", long: "" };
  }

  if (typeof description === "string") {
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === "object") {
        const typed = parsed as SeriesDescription;
        return {
          short: typed.short || typed.shortDesc || description,
          long: typed.long || typed.longDesc || description,
        };
      }
      return { short: description, long: description };
    } catch {
      return { short: description, long: description };
    }
  }

  if (typeof description === "object") {
    const typed = description as SeriesDescription;
    return {
      short: typed.short || typed.shortDesc || "",
      long: typed.long || typed.longDesc || "",
    };
  }

  return { short: "", long: "" };
};

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateLabel = (value?: string) => {
  const date = parseDate(value);
  if (!date) {
    return "N/A";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getImageUrl = (image?: string | { url?: string }) => {
  if (!image) return null;
  return typeof image === "string" ? image : image.url || null;
};

const getPriceValue = (price?: number | string) => {
  if (typeof price === "number") {
    return price;
  }
  const parsed = Number(price);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const collectTests = (series: DetailedTestSeries) => {
  const tests = Array.isArray(series.liveTests)
    ? series.liveTests
    : Array.isArray(series.tests)
    ? series.tests
    : [];

  const plannedTotal =
    typeof series.numberOfTests === "number"
      ? series.numberOfTests
      : typeof series.noOfTests === "number"
      ? series.noOfTests
      : tests.length;

  return { tests, plannedTotal };
};

const resolveEndDate = (series: DetailedTestSeries) => {
  if (typeof series.validity === "string") {
    return parseDate(series.validity);
  }
  return null;
};

const getStatusColor = (series: DetailedTestSeries) => {
  const now = new Date();
  const endDate = resolveEndDate(series);

  if (endDate && now > endDate) {
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
  return "bg-green-500/10 text-green-500 border-green-500/20";
};

const getStatusText = (series: DetailedTestSeries) => {
  const now = new Date();
  const endDate = resolveEndDate(series);

  if (endDate && now > endDate) {
    return "Expired";
  }
  return "Active";
};

const getValidityLabel = (series: DetailedTestSeries) => {
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

export default function TestSeriesDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { educator } = useAuth();
  const [testSeries, setTestSeries] = useState<DetailedTestSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const educatorId = educator?._id;
  const seriesId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const fetchTestSeriesDetails = useCallback(async () => {
    if (!educatorId || !seriesId) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedSeries = await getTestSeriesById(seriesId);

      if (!fetchedSeries) {
        setError("Test series not found");
        return;
      }

      setTestSeries(fetchedSeries as DetailedTestSeries);
    } catch (err) {
      console.error("Error fetching test series details:", err);
      setError("Failed to fetch test series details");
      toast.error("Failed to fetch test series details");
    } finally {
      setLoading(false);
    }
  }, [educatorId, seriesId]);

  useEffect(() => {
    if (!educatorId) {
      router.push("/login");
      return;
    }

    if (!seriesId) {
      setError("Invalid test series identifier");
      setLoading(false);
      return;
    }

    fetchTestSeriesDetails();
  }, [educatorId, router, seriesId, fetchTestSeriesDetails]);

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Test Series Details"
          description="View comprehensive test series information"
        />
        <div className="px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading test series details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testSeries) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Test Series Details"
          description="View comprehensive test series information"
        />
        <div className="px-6">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {error || "Test series not found"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                The test series you&apos;re looking for doesn&apos;t exist or
                has been removed.
              </p>
              <Button
                onClick={() => router.push("/dashboard/test-series")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Test Series
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const description = parseDescription(testSeries.description);
  const subjectLabel = normalizeLabel(testSeries.subject) || "General";
  const specializationLabel =
    normalizeLabel(testSeries.specialization) || "General";
  const imageUrl = getImageUrl(testSeries.image);
  const priceValue = getPriceValue(testSeries.price);
  const { tests: seriesTests, plannedTotal } = collectTests(testSeries);
  const includedTests = seriesTests.length;
  const validityLabel = getValidityLabel(testSeries);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Test Series Details"
        description="View comprehensive test series information"
      />

      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/test-series")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Test Series
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-2xl font-bold text-foreground capitalize">
                    {testSeries.title}
                  </CardTitle>
                  <Badge
                    className={`${getSubjectColor(subjectLabel)} capitalize`}
                  >
                    {subjectLabel || "N/A"}
                  </Badge>
                  <Badge className={getStatusColor(testSeries)}>
                    {getStatusText(testSeries)}
                  </Badge>
                  {testSeries.isCourseSpecific && (
                    <Badge variant="outline">Course Specific</Badge>
                  )}
                </div>
                {testSeries.isCourseSpecific && testSeries.courseId && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium">
                      {typeof testSeries.courseId === "string"
                        ? testSeries.courseId
                        : testSeries.courseId.title}
                    </span>
                  </div>
                )}
                <p className="text-muted-foreground">
                  {description.short || "No description available"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {imageUrl && (
          <Card className="bg-card border-border overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={imageUrl}
                alt={testSeries.title}
                className="w-full h-full object-cover"
                fill
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TestTube className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tests</p>
                  <p className="text-sm font-semibold text-foreground">
                    {plannedTotal}
                  </p>
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
                  <p className="text-sm font-semibold text-foreground">
                    {testSeries.enrolledStudents?.length || 0}
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
                  <p className="text-sm font-semibold text-foreground">
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
                  <p className="text-xs text-muted-foreground">Validity</p>
                  <p className="text-sm font-semibold text-foreground">
                    {validityLabel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
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
                <p className="font-medium text-foreground capitalize">
                  {specializationLabel || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <Badge
                  variant="outline"
                  className={getSubjectColor(subjectLabel)}
                >
                  {subjectLabel || "N/A"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created On</p>
                <p className="font-medium text-foreground">
                  {formatDateLabel(testSeries.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Valid Until
                </p>
                <p className="font-medium text-foreground">
                  {formatDateLabel(
                    typeof testSeries.validity === "string"
                      ? testSeries.validity
                      : undefined
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tests Added
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          plannedTotal
                            ? (includedTests / plannedTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {includedTests} / {plannedTotal}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Series ID</p>
                <p className="font-mono text-xs text-foreground">
                  {testSeries._id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {description.long && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {description.long}
              </p>
            </CardContent>
          </Card>
        )}

        {seriesTests.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tests in Series ({seriesTests.length})
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seriesTests.map((test, index) => (
                    <TableRow key={test._id || index}>
                      <TableCell>
                        <Badge variant="outline">{index + 1}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xl text-sm font-medium text-foreground">
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
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Live
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Series Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="font-medium text-foreground">
                  {formatDateLabel(testSeries.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium text-foreground">
                  {formatDateLabel(testSeries.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Series Slug</p>
                <p className="font-mono text-xs text-foreground">
                  {testSeries.slug || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
