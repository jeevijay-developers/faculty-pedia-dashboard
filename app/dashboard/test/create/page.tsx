"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Award,
  CheckCircle2,
  Save,
  BookOpen,
  FileQuestion,
} from "lucide-react";
import QuestionBank from "@/components/question-bank";
import { useAuth } from "@/contexts/auth-context";
import {
  createLiveTest,
  getEducatorQuestionsByEducatorId,
} from "@/util/server";
import { CreateTestData } from "@/lib/types/test";
import { Question } from "@/lib/types/test";
import { toast } from "sonner";

export default function CreateTestPage() {
  const router = useRouter();
  const { educator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    subject: "",
    specialization: "",
    startDate: "",
    startTime: "",
    duration: "",
    positiveMarks: "",
    negativeMarks: "",
    markingType: "PQM",
  });

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchQuestions();
  }, [educator, router]);

  const fetchQuestions = async () => {
    if (!educator?._id) return;

    try {
      setQuestionsLoading(true);
      const response = await getEducatorQuestionsByEducatorId(educator._id);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleQuestionSelect = (questionId: string, selected: boolean) => {
    if (selected) {
      setSelectedQuestions((prev) => [...prev, questionId]);
    } else {
      setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "shortDescription",
      "longDescription",
      "subject",
      "specialization",
      "startDate",
      "startTime",
      "duration",
      "positiveMarks",
      "negativeMarks",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(
          `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }

    // Validate title length
    if (formData.title.length < 3) {
      toast.error("Title must be at least 3 characters long");
      return false;
    }

    if (formData.title.length > 200) {
      toast.error("Title must not exceed 200 characters");
      return false;
    }

    // Validate short description length
    if (formData.shortDescription.length < 10) {
      toast.error("Short description must be at least 10 characters long");
      return false;
    }

    if (formData.shortDescription.length > 500) {
      toast.error("Short description must not exceed 500 characters");
      return false;
    }

    // Validate long description length
    if (formData.longDescription.length < 20) {
      toast.error("Detailed description must be at least 20 characters long");
      return false;
    }

    if (formData.longDescription.length > 2000) {
      toast.error("Detailed description must not exceed 2000 characters");
      return false;
    }

    // Validate marks
    const positiveMarks = parseInt(formData.positiveMarks);
    const negativeMarks = parseInt(formData.negativeMarks);

    if (positiveMarks <= 0) {
      toast.error("Positive marks must be greater than 0");
      return false;
    }

    if (negativeMarks >= 0) {
      toast.error("Negative marks must be less than 0");
      return false;
    }

    // Validate duration
    const duration = parseInt(formData.duration);
    if (duration <= 0) {
      toast.error("Duration must be greater than 0 minutes");
      return false;
    }

    if (duration > 1440) {
      toast.error("Duration cannot exceed 24 hours (1440 minutes)");
      return false;
    }

    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!educator?._id) {
      toast.error("Educator information not found");
      return;
    }

    try {
      setLoading(true);

      // Combine date and time
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );

      const testData: CreateTestData = {
        title: formData.title,
        description: {
          short: formData.shortDescription,
          long: formData.longDescription,
        },
        subject: formData.subject,
        specialization: formData.specialization as "IIT-JEE" | "NEET" | "CBSE",
        startDate: startDateTime.toISOString(),
        duration: parseInt(formData.duration),
        overallMarks: {
          positive: parseInt(formData.positiveMarks),
          negative: parseInt(formData.negativeMarks),
        },
        markingType: formData.markingType as "OAM" | "PQM",
        questions: selectedQuestions,
        educatorId: educator._id,
      };

      await createLiveTest(testData);
      toast.success("Test created successfully!");
      router.push("/dashboard/create-test");
    } catch (error: any) {
      console.error("Error creating test:", error);

      // Handle specific API errors
      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle duplicate title error
        if (
          errorData.message &&
          errorData.message.includes("title already exists")
        ) {
          toast.error(
            "A test with this title already exists. Please choose a different title."
          );
          return;
        }

        // Handle validation errors array
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err: string) => {
            // Transform specific error messages to be more user-friendly
            if (
              err.includes(
                "description.long must be between 20 to 2000 characters"
              )
            ) {
              return "Detailed description must be between 20 to 2000 characters";
            }
            if (err.includes("description.short")) {
              return "Short description length is invalid";
            }
            if (err.includes("title")) {
              return "Test title format is invalid";
            }
            return err;
          });
          toast.error(errorMessages.join(". "));
          return;
        }

        // Handle single error message
        if (errorData.message) {
          toast.error(errorData.message);
          return;
        }
      }

      // Fallback error message
      toast.error("Failed to create test. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
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

  if (!educator) {
    return null;
  }

  return (
    <div className="space-y-6 pb-6">
      <DashboardHeader
        title="Create New Test"
        description="Build comprehensive tests with custom questions and settings"
      />

      <div className="px-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/create-test")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tests
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/create-test")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedQuestions.length === 0}
              className="gap-2"
            >
              {loading ? "Creating..." : "Create Test"}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Test Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., JEE Mixed Subject Test"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    maxLength={200}
                  />
                  <div className="flex justify-between text-xs">
                    <span
                      className={`${
                        formData.title.length < 3
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      Minimum 3 characters
                    </span>
                    <span
                      className={`${
                        formData.title.length > 200
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formData.title.length}/200
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Brief description of the test"
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }))
                    }
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs">
                    <span
                      className={`${
                        formData.shortDescription.length < 10
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      Minimum 10 characters
                    </span>
                    <span
                      className={`${
                        formData.shortDescription.length > 500
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formData.shortDescription.length}/500
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Detailed Description</Label>
                  <Textarea
                    id="longDescription"
                    placeholder="Detailed description including test pattern, instructions, etc."
                    rows={4}
                    value={formData.longDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        longDescription: e.target.value,
                      }))
                    }
                    maxLength={2000}
                  />
                  <div className="flex justify-end text-xs text-muted-foreground">
                    {formData.longDescription.length}/2000
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          specialization: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                        <SelectItem value="NEET">NEET</SelectItem>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Timing */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule & Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration (minutes)
                    </div>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 180"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Marking Scheme */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Marking Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positiveMarks">Positive Marks</Label>
                    <Input
                      id="positiveMarks"
                      type="number"
                      placeholder="e.g., 4"
                      value={formData.positiveMarks}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          positiveMarks: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negativeMarks">Negative Marks</Label>
                    <Input
                      id="negativeMarks"
                      type="number"
                      placeholder="e.g., -1"
                      value={formData.negativeMarks}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          negativeMarks: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markingType">Marking Type</Label>
                    <Select
                      value={formData.markingType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, markingType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PQM">Per Question Marking</SelectItem>
                        <SelectItem value="OAM">Overall Marking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Questions Summary */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Selected Questions ({selectedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileQuestion className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No questions selected yet</p>
                    <p className="text-sm">
                      Select questions from the question bank
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {questions
                      .filter((q) => selectedQuestions.includes(q._id))
                      .slice(0, 3)
                      .map((question) => (
                        <div
                          key={question._id}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
                        >
                          <Badge
                            variant="outline"
                            className={getSubjectColor(question.subject)}
                          >
                            {question.subject}
                          </Badge>
                          <span className="text-sm text-card-foreground font-medium truncate">
                            {question.title}
                          </span>
                        </div>
                      ))}
                    {selectedQuestions.length > 3 && (
                      <div className="text-center py-2 text-sm text-muted-foreground">
                        ... and {selectedQuestions.length - 3} more questions
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Question Bank */}
          <div className="space-y-3">
            <Card className="bg-card border-border px-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Question Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <QuestionBank
                  questions={questions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  loading={questionsLoading}
                  darkTheme={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
