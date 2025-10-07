"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
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
  Clock,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Target,
} from "lucide-react";
import { getEducatorTests } from "@/util/server";
import { Test, TestsResponse } from "@/lib/types/test";
import { toast } from "sonner";

export default function CreateTestPage() {
  const { educator } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("Failed to load tests");
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
    const now = new Date();
    const startDate = new Date(test.startDate);

    if (now < startDate) {
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    } else {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const getStatusText = (test: Test) => {
    const now = new Date();
    const startDate = new Date(test.startDate);

    if (now < startDate) {
      return "Upcoming";
    } else {
      return "Active";
    }
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
          <Button
            onClick={() => router.push("/dashboard/test/create")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Test
          </Button>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card
                key={test._id}
                className="bg-card border-border hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(test)}>
                          {getStatusText(test)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getSubjectColor(test.subject)}
                        >
                          {test.subject.charAt(0).toUpperCase() +
                            test.subject.slice(1)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-card-foreground line-clamp-1">
                        {test.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {test.specialization}
                        </Badge>
                      </div>
                    </div>
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
                        <DropdownMenuItem disabled>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Test
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Test
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {test.description.short}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {test.questions.length} questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {test.duration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        {formatDate(test.startDate)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        <span>
                          Marks: +{test.overallMarks.positive} /{" "}
                          {test.overallMarks.negative}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {test.markingType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
