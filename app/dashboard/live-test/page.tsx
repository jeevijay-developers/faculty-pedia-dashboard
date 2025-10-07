"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Calendar, Clock, Users, BookOpen } from "lucide-react";
import CreateLiveTestDialog from "../../../components/create-live-test-dialog";
import { useAuth } from "@/contexts/auth-context";
import { getEducatorTests } from "@/util/server";
import { LiveTest, LiveTestsResponse } from "@/lib/types/live-test";

export default function LiveTestPage() {
  const { educator } = useAuth();
  const router = useRouter();
  const [liveTests, setLiveTests] = useState<LiveTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchLiveTests();
  }, [educator, router]);

  const fetchLiveTests = async () => {
    if (!educator?._id) return;

    try {
      setLoading(true);
      const response: LiveTestsResponse = await getEducatorTests(educator._id);
      setLiveTests(response.tests);
    } catch (error) {
      console.error("Error fetching live tests:", error);
      setError("Failed to fetch live tests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLiveTest = (liveTest: LiveTest) => {
    router.push(`/dashboard/live-test/${liveTest._id}`);
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

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      "IIT-JEE": "bg-red-100 text-red-800",
      NEET: "bg-green-100 text-green-800",
      CBSE: "bg-blue-100 text-blue-800",
    };
    return (
      colors[specialization as keyof typeof colors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading live tests...</div>
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
              Live Tests
            </h1>
            <p className="text-gray-600 text-lg">
              Create and manage live tests for real-time assessment
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Scheduled Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Real-time Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Live Participation</span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Live Test
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Live Tests
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {liveTests.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Active Tests
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {
                      liveTests.filter(
                        (test) => new Date(test.startDate) > new Date()
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Questions Used
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    {liveTests.reduce(
                      (total, test) => total + test.questions.length,
                      0
                    )}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">
                    Avg Duration
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    {liveTests.length > 0
                      ? Math.round(
                          liveTests.reduce(
                            (total, test) => total + test.duration,
                            0
                          ) / liveTests.length
                        )
                      : 0}{" "}
                    min
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Tests List */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {liveTests.length === 0 && !error ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Live Tests Created Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first live test to start conducting real-time
              assessments
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Live Test
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {liveTests.map((liveTest) => (
              <Card
                key={liveTest._id}
                className="bg-white hover:shadow-lg transition-all duration-200 border-0 shadow-md overflow-hidden group"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {liveTest.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {liveTest.description.short}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      className={`${getSubjectColor(
                        liveTest.subject
                      )} text-xs px-2 py-1`}
                    >
                      {liveTest.subject.charAt(0).toUpperCase() +
                        liveTest.subject.slice(1)}
                    </Badge>
                    <Badge
                      className={`${getSpecializationColor(
                        liveTest.specialization
                      )} text-xs px-2 py-1`}
                    >
                      {liveTest.specialization}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(liveTest.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{liveTest.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{liveTest.questions.length} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        +{liveTest.overallMarks.positive}/
                        {liveTest.overallMarks.negative}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all w-full"
                      onClick={() => handleViewLiveTest(liveTest)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateLiveTestDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onLiveTestCreated={fetchLiveTests}
        />
      </div>
    </div>
  );
}
