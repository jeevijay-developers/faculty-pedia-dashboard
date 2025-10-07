"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Target,
  Award,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getEducatorTests } from "@/util/server";
import { Test } from "@/lib/types/test";

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
      const response = await getEducatorTests(educator._id);
      const foundTest = response.tests.find((t: Test) => t._id === params.id);

      if (!foundTest) {
        setError("Test not found");
        return;
      }

      setTest(foundTest);
    } catch (error) {
      console.error("Error fetching test details:", error);
      setError("Failed to fetch test details");
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
      physics: "bg-blue-100 text-blue-800 border-blue-200",
      chemistry: "bg-green-100 text-green-800 border-green-200",
      mathematics: "bg-purple-100 text-purple-800 border-purple-200",
      mixed: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getTopicColor = (subject: string) => {
    const colors = {
      physics: "bg-blue-50 text-blue-700 border-blue-100",
      chemistry: "bg-green-50 text-green-700 border-green-100",
      mathematics: "bg-purple-50 text-purple-700 border-purple-100",
      mixed: "bg-orange-50 text-orange-700 border-orange-100",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-50 text-gray-700 border-gray-100"
    );
  };

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-lg text-gray-600">Loading test details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-lg text-red-600">
              {error || "Test not found"}
            </div>
            <Button
              onClick={() => router.push("/dashboard/create-test")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Group questions by subject
  const questionsBySubject = test.questions.reduce((acc, question) => {
    const subject = question.subject.toLowerCase();
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(question);
    return acc;
  }, {} as Record<string, typeof test.questions>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/create-test")}
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                disabled
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {test.title}
              </h1>
              <Badge
                className={`${getSubjectColor(
                  test.subject
                )} font-medium px-4 py-2 text-sm`}
              >
                {test.subject.charAt(0).toUpperCase() + test.subject.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {test.description.short}
            </p>
          </div>
        </div>

        {/* Test Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    Specialization
                  </div>
                  <div className="font-medium text-gray-900">
                    {test.specialization}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                  <div className="font-medium text-gray-900">
                    {test.duration} minutes
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Start Date & Time
                </div>
                <div className="font-medium text-gray-900">
                  {formatDate(test.startDate)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marking Scheme */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Marking Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 mb-1">
                    Positive Marks
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    +{test.overallMarks.positive}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 mb-1">
                    Negative Marks
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {test.overallMarks.negative}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Marking Type</div>
                <div className="font-medium text-gray-900">
                  {test.markingType === "PQM"
                    ? "Per Question Marking"
                    : "Overall Marking"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {test.description.long}
            </p>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Questions ({test.questions.length} Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-6">
                {Object.entries(questionsBySubject).map(
                  ([subject, questions]) => (
                    <div key={subject} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${getSubjectColor(
                            subject
                          )} font-medium px-3 py-1`}
                        >
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {questions.length} question
                          {questions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <div
                            key={question._id}
                            className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Q{index + 1}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getTopicColor(
                                      question.subject
                                    )}`}
                                  >
                                    {question.topic}
                                  </Badge>
                                </div>
                                <p className="text-gray-900 font-medium leading-relaxed">
                                  {question.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Test Metadata */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Test Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium text-gray-900">
                  {formatDate(test.createdAt)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <div className="font-medium text-gray-900">
                  {formatDate(test.updatedAt)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Test Slug:</span>
                <div className="font-medium text-gray-900 font-mono text-xs">
                  {test.slug}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
