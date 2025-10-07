"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { getEducatorTests } from "@/util/server";
import { Test, TestsResponse } from "@/lib/types/test";

export default function CreateTestPage() {
  const { educator } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchTests();
  }, [educator, router]);

  const fetchTests = async () => {
    if (!educator?._id) return;

    try {
      setLoading(true);
      const response: TestsResponse = await getEducatorTests(educator._id);
      setTests(response.tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setError("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTest = (test: Test) => {
    router.push(`/dashboard/test/${test._id}`);
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
      physics: "bg-blue-100 text-blue-800",
      chemistry: "bg-green-100 text-green-800",
      mathematics: "bg-purple-100 text-purple-800",
      mixed: "bg-orange-100 text-orange-800",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Test Bank
            </h1>
            <p className="text-gray-600 text-lg">
              Create and manage your live tests with comprehensive question
              selection
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {tests.length} Tests Created
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Active Educator: {educator?.firstName} {educator?.lastName}
              </span>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/test/create")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 py-3 text-lg font-medium"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Test
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold">Error Loading Tests</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tests Content */}
        {tests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-12 w-12 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  No tests created yet
                </h3>
                <p className="text-gray-600">
                  Start building your test library by creating your first live
                  test
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard/test/create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-8 py-3"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {tests.map((test) => (
              <Card
                key={test._id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {test.title}
                        </CardTitle>
                        <Badge
                          className={`${getSubjectColor(
                            test.subject
                          )} font-medium px-3 py-1`}
                        >
                          {test.subject.charAt(0).toUpperCase() +
                            test.subject.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {test.description.short}
                      </CardDescription>

                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700 font-medium">
                            {test.specialization}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-700 font-medium">
                            {test.duration} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-700 font-medium">
                            {test.questions.length} questions
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all"
                        onClick={() => handleViewTest(test)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
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
                        className="bg-red-50 border-red-200 text-red-500 cursor-not-allowed"
                        disabled
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Detailed Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Test Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start Date:</span>
                            <div className="font-medium text-gray-900">
                              {formatDate(test.startDate)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Marking:</span>
                            <div className="font-medium text-gray-900">
                              +{test.overallMarks.positive} /{" "}
                              {test.overallMarks.negative} ({test.markingType})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {test.questions.length > 0 && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Sample Questions
                          </h4>
                          <div className="space-y-3">
                            {test.questions.slice(0, 2).map((question) => (
                              <div
                                key={question._id}
                                className="bg-white rounded-lg p-3 shadow-sm border"
                              >
                                <div className="font-medium text-gray-900 text-sm truncate mb-2">
                                  {question.title}
                                </div>
                                <div className="flex gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {question.subject}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                  >
                                    {question.topic}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {test.questions.length > 2 && (
                              <div className="text-center py-2">
                                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                  +{test.questions.length - 2} more questions
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
