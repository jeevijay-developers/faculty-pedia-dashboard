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
  Play,
  Pause,
  StopCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getEducatorTests } from "@/util/server";
import { LiveTest } from "@/lib/types/live-test";

export default function LiveTestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { educator } = useAuth();
  const [liveTest, setLiveTest] = useState<LiveTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchLiveTestDetails();
  }, [educator, params.id, router]);

  const fetchLiveTestDetails = async () => {
    if (!educator?._id || !params.id) return;

    try {
      setLoading(true);
      const response = await getEducatorTests(educator._id);
      const foundLiveTest = response.tests.find(
        (t: LiveTest) => t._id === params.id
      );

      if (!foundLiveTest) {
        setError("Live test not found");
        return;
      }

      setLiveTest(foundLiveTest);
    } catch (error) {
      console.error("Error fetching live test details:", error);
      setError("Failed to fetch live test details");
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

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      "IIT-JEE": "bg-red-100 text-red-800 border-red-200",
      NEET: "bg-green-100 text-green-800 border-green-200",
      CBSE: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      colors[specialization as keyof typeof colors] ||
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

  const isTestLive = () => {
    if (!liveTest) return false;
    const now = new Date();
    const startDate = new Date(liveTest.startDate);
    const endDate = new Date(startDate.getTime() + liveTest.duration * 60000);
    return now >= startDate && now <= endDate;
  };

  const isTestUpcoming = () => {
    if (!liveTest) return false;
    const now = new Date();
    const startDate = new Date(liveTest.startDate);
    return now < startDate;
  };

  const isTestCompleted = () => {
    if (!liveTest) return false;
    const now = new Date();
    const startDate = new Date(liveTest.startDate);
    const endDate = new Date(startDate.getTime() + liveTest.duration * 60000);
    return now > endDate;
  };

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-lg text-gray-600">
              Loading live test details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !liveTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-lg text-red-600">
              {error || "Live test not found"}
            </div>
            <Button
              onClick={() => router.push("/dashboard/live-test")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Live Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Group questions by subject
  const questionsBySubject = liveTest.questions.reduce((acc, question) => {
    const subject = question.subject.toLowerCase();
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(question);
    return acc;
  }, {} as Record<string, typeof liveTest.questions>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/live-test")}
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Live Tests
            </Button>

            <div className="flex gap-2">
              {isTestLive() && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  End Test
                </Button>
              )}
              {isTestUpcoming() && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              )}
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
                {liveTest.title}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getSubjectColor(
                    liveTest.subject
                  )} font-medium px-4 py-2 text-sm`}
                >
                  {liveTest.subject.charAt(0).toUpperCase() +
                    liveTest.subject.slice(1)}
                </Badge>
                <Badge
                  className={`${getSpecializationColor(
                    liveTest.specialization
                  )} font-medium px-4 py-2 text-sm`}
                >
                  {liveTest.specialization}
                </Badge>
                {isTestLive() && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 font-medium px-4 py-2 text-sm animate-pulse">
                    🔴 LIVE
                  </Badge>
                )}
                {isTestUpcoming() && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-medium px-4 py-2 text-sm">
                    📅 UPCOMING
                  </Badge>
                )}
                {isTestCompleted() && (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200 font-medium px-4 py-2 text-sm">
                    ✅ COMPLETED
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {liveTest.description.short}
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
                Live Test Information
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
                    {liveTest.specialization}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                  <div className="font-medium text-gray-900">
                    {liveTest.duration} minutes
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Start Date & Time
                </div>
                <div className="font-medium text-gray-900">
                  {formatDate(liveTest.startDate)}
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
                    +{liveTest.overallMarks.positive}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 mb-1">
                    Negative Marks
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {liveTest.overallMarks.negative}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Marking Type</div>
                <div className="font-medium text-gray-900">
                  {liveTest.markingType === "PQM"
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
              {liveTest.description.long}
            </p>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Questions ({liveTest.questions.length} Total)
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
              Live Test Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium text-gray-900">
                  {formatDate(liveTest.createdAt)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <div className="font-medium text-gray-900">
                  {formatDate(liveTest.updatedAt)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Test Slug:</span>
                <div className="font-medium text-gray-900 font-mono text-xs">
                  {liveTest.slug}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
