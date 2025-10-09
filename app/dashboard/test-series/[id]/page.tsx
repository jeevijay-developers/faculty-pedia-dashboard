"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Target,
  IndianRupee,
  Edit,
  Trash2,
  Copy,
  Loader2,
  FileText,
  TestTube,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getTestSeriesByIds } from "@/util/server";
import toast from "react-hot-toast";

export default function TestSeriesDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { educator } = useAuth();
  const [testSeries, setTestSeries] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchTestSeriesDetails();
  }, [educator, params.id, router]);

  const fetchTestSeriesDetails = async () => {
    if (!educator?.testSeries || !params.id) return;

    try {
      setLoading(true);
      const testSeriesIds = educator.testSeries;
      const fetchedTestSeries = await getTestSeriesByIds(testSeriesIds);
      const foundSeries = fetchedTestSeries.find((ts: any) => ts._id === params.id);

      if (!foundSeries) {
        setError("Test series not found");
        return;
      }

      setTestSeries(foundSeries);
    } catch (error) {
      console.error("Error fetching test series details:", error);
      setError("Failed to fetch test series details");
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

  const getStatusColor = (series: any) => {
    const now = new Date();
    const startDate = new Date(series.startDate);
    const endDate = new Date(series.endDate);

    if (now < startDate) {
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    } else if (now > endDate) {
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    } else {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const getStatusText = (series: any) => {
    const now = new Date();
    const startDate = new Date(series.startDate);
    const endDate = new Date(series.endDate);

    if (now < startDate) {
      return "Upcoming";
    } else if (now > endDate) {
      return "Completed";
    } else {
      return "Active";
    }
  };

  const handleDeleteTestSeries = () => {
    toast.error("Delete functionality not implemented yet");
  };

  const handleEditTestSeries = () => {
    toast.custom("Edit functionality not implemented yet");
  };

  if (!educator) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Test Series Details" description="View comprehensive test series information" />
        <div className="px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading test series details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testSeries) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Test Series Details" description="View comprehensive test series information" />
        <div className="px-6">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {error || "Test series not found"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                The test series you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/dashboard/test-series")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Test Series
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Test Series Details" description="View comprehensive test series information" />

      <div className="px-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard/test-series")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Test Series
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditTestSeries} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteTestSeries} className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Test Series Title Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-2xl font-bold text-foreground capitalize">{testSeries.title}</CardTitle>
                  <Badge className={`${getSubjectColor(testSeries.subject)} capitalize`}>
                    {testSeries.subject}
                  </Badge>
                  <Badge className={getStatusColor(testSeries)}>{getStatusText(testSeries)}</Badge>
                  {testSeries.isCourseSpecific && (
                    <Badge variant="outline">Course Specific</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {testSeries.description?.shortDesc || testSeries.description?.short || "No description available"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Series Image */}
        {testSeries.image?.url && (
          <Card className="bg-card border-border overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={testSeries.image.url}
                alt={testSeries.title}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TestTube className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tests</p>
                  <p className="text-sm font-semibold text-foreground">{testSeries.noOfTests || 0}</p>
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
                  <p className="text-xs text-muted-foreground">Enrolled Students</p>
                  <p className="text-sm font-semibold text-foreground">{testSeries.enrolledStudents?.length || 0}</p>
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
                  <p className="text-sm font-semibold text-foreground">₹{testSeries.price?.toLocaleString() || 0}</p>
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
                  <p className="text-sm font-semibold text-foreground">{testSeries.validity || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Series Information */}
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
                <p className="text-sm text-muted-foreground mb-1">Specialization</p>
                <p className="font-medium text-foreground capitalize">{testSeries.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <Badge variant="outline" className={getSubjectColor(testSeries.subject)}>
                  {testSeries.subject}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-medium text-foreground">{formatDate(testSeries.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="font-medium text-foreground">{formatDate(testSeries.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tests Added</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${testSeries.noOfTests ? ((testSeries.liveTests?.length || 0) / testSeries.noOfTests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {testSeries.liveTests?.length || 0} / {testSeries.noOfTests || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Series ID</p>
                <p className="font-mono text-xs text-foreground">{testSeries._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {testSeries.description?.longDesc && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{testSeries.description.longDesc}</p>
            </CardContent>
          </Card>
        )}

        {/* Tests in Series */}
        {testSeries.liveTests && testSeries.liveTests.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tests in Series ({testSeries.liveTests.length})
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
                  {testSeries.liveTests.map((test: any, index: number) => (
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
                          {test.duration || "-"} min
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {test.questions?.length || 0} questions
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

        {/* Series Metadata */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Series Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="font-medium text-foreground">
                  {testSeries.createdAt ? formatDate(testSeries.createdAt) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium text-foreground">
                  {testSeries.updatedAt ? formatDate(testSeries.updatedAt) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Series Slug</p>
                <p className="font-mono text-xs text-foreground">{testSeries.slug || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
