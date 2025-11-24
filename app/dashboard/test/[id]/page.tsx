"use client";

import { useState, useEffect } from "react";
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
  Calendar,
  Clock,
  BookOpen,
  Target,
  Award,
  Edit,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getTestById } from "@/util/server";
import { Test } from "@/lib/types/test";
import toast from "react-hot-toast";

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { educator } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchTestDetails();
  }, [educator, params.id, router]);

  const fetchTestDetails = async () => {
    if (!educator?._id || !params.id) return;

    try {
      setLoading(true);
      const fetchedTest = await getTestById(params.id as string);

      if (!fetchedTest) {
        setError("Test not found");
        toast.error("Test not found");
        return;
      }

      setTest(fetchedTest);
    } catch (error) {
      console.error("Error fetching test details:", error);
      setError("Failed to fetch test details");
      toast.error("Failed to fetch test details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      physics: "bg-blue-500/10 text-blue-700 border-blue-200",
      chemistry: "bg-green-500/10 text-green-700 border-green-200",
      mathematics: "bg-purple-500/10 text-purple-700 border-purple-200",
      mixed: "bg-orange-500/10 text-orange-700 border-orange-200",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-muted text-muted-foreground"
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-500/10 text-green-600 border-green-200",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      hard: "bg-red-500/10 text-red-600 border-red-200",
    };
    return (
      colors[difficulty?.toLowerCase() as keyof typeof colors] || "bg-muted"
    );
  };

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Test Details"
          description="View comprehensive test information"
        />
        <div className="px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading test details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Test Details"
          description="View comprehensive test information"
        />
        <div className="px-6">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {error || "Test not found"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                The test you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <Button
                onClick={() => router.push("/dashboard/test")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tests
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Test Details"
        description="View comprehensive test information"
      />

      <div className="px-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/test")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tests
          </Button>
        </div>

        {/* Test Title Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {test.title}
                  </CardTitle>
                  {test.subjects.slice(0, 3).map((subject, index) => (
                    <Badge
                      key={index}
                      className={`${getSubjectColor(subject)} capitalize`}
                    >
                      {subject}
                    </Badge>
                  ))}
                  {test.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{test.subjects.length - 3} more
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{test.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Test Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Specialization
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {test.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="text-xs font-semibold text-foreground capitalize"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold text-foreground">
                    {test.duration} minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overall Marks</p>
                  <p className="text-sm font-semibold text-green-600">
                    {test.overallMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Award className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Negative Marking
                  </p>
                  <p className="text-sm font-semibold text-red-600">
                    {test.negativeMarking
                      ? `Yes (${test.negativeMarkingRatio}x)`
                      : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Created Date
                </p>
                <p className="font-medium text-foreground">
                  {formatDate(test.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Marking Type
                </p>
                <Badge variant="outline">
                  {test.markingType === "per_question"
                    ? "Per Question Marking"
                    : "Overall Marking"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Questions
                </p>
                <p className="font-medium text-foreground">
                  {test.questions.length} questions
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Classes</p>
                <div className="flex flex-wrap gap-1">
                  {test.class.map((cls, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
              {test.passingMarks && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Passing Marks
                  </p>
                  <p className="font-medium text-foreground">
                    {test.passingMarks}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Test ID</p>
                <p className="font-mono text-xs text-foreground">{test._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {test.instructions && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {test.instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Questions Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Questions ({test.questions.length} Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {test.questions.map((question, index) => (
                  <TableRow key={question._id}>
                    <TableCell>
                      <Badge variant="outline">Q{index + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-2xl text-sm font-medium text-foreground line-clamp-2">
                        {question.title}
                      </p>
                    </TableCell>
                    <TableCell>
                      {question.difficulty ? (
                        <Badge
                          className={`text-xs ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Test Metadata */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Test Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="font-medium text-foreground">
                  {formatDate(test.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium text-foreground">
                  {formatDate(test.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Test Slug</p>
                <p className="font-mono text-xs text-foreground">{test.slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
