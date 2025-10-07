"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Award,
  CheckCircle2,
  Plus,
  Save,
  BookOpen,
  Users,
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

export default function CreateTestPage() {
  const router = useRouter();
  const { educator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError("Failed to fetch questions");
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
        setError(
          `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }

    // Validate title length
    if (formData.title.length < 3) {
      setError("Title must be at least 3 characters long");
      return false;
    }

    if (formData.title.length > 200) {
      setError("Title must not exceed 200 characters");
      return false;
    }

    // Validate short description length
    if (formData.shortDescription.length < 10) {
      setError("Short description must be at least 10 characters long");
      return false;
    }

    if (formData.shortDescription.length > 500) {
      setError("Short description must not exceed 500 characters");
      return false;
    }

    // Validate long description length
    if (formData.longDescription.length < 20) {
      setError("Detailed description must be at least 20 characters long");
      return false;
    }

    if (formData.longDescription.length > 2000) {
      setError("Detailed description must not exceed 2000 characters");
      return false;
    }

    // Validate title length
    if (formData.title.length < 3) {
      setError("Test title must be at least 3 characters long");
      return false;
    }

    if (formData.title.length > 200) {
      setError("Test title must not exceed 200 characters");
      return false;
    }

    // Validate short description
    if (formData.shortDescription.length < 10) {
      setError("Short description must be at least 10 characters long");
      return false;
    }

    if (formData.shortDescription.length > 500) {
      setError("Short description must not exceed 500 characters");
      return false;
    }

    // Validate marks
    const positiveMarks = parseInt(formData.positiveMarks);
    const negativeMarks = parseInt(formData.negativeMarks);

    if (positiveMarks <= 0) {
      setError("Positive marks must be greater than 0");
      return false;
    }

    if (negativeMarks >= 0) {
      setError("Negative marks must be less than 0");
      return false;
    }

    // Validate duration
    const duration = parseInt(formData.duration);
    if (duration <= 0) {
      setError("Duration must be greater than 0 minutes");
      return false;
    }

    if (duration > 1440) {
      setError("Duration cannot exceed 24 hours (1440 minutes)");
      return false;
    }

    if (selectedQuestions.length === 0) {
      setError("Please select at least one question");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!educator?._id) {
      setError("Educator information not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
          setError(
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
          setError(errorMessages.join(". "));
          return;
        }

        // Handle single error message
        if (errorData.message) {
          setError(errorData.message);
          return;
        }
      }

      // Fallback error message
      setError("Failed to create test. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      physics: "bg-blue-900/50 text-blue-300 border-blue-700",
      chemistry: "bg-green-900/50 text-green-300 border-green-700",
      mathematics: "bg-purple-900/50 text-purple-300 border-purple-700",
      mixed: "bg-orange-900/50 text-orange-300 border-orange-700",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-700 text-gray-300 border-gray-600"
    );
  };

  if (!educator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/create-test")}
              className="hover:bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/create-test")}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedQuestions.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? "Creating..." : "Create Test"}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create New Test
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Build comprehensive tests with custom questions and settings
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Test Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Test Title
                  </Label>
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
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    maxLength={200}
                  />
                  <div className="flex justify-between text-xs">
                    <span
                      className={`${
                        formData.title.length < 3
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      Minimum 3 characters
                    </span>
                    <span
                      className={`${
                        formData.title.length > 200
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.title.length}/200
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-gray-300">
                    Short Description
                  </Label>
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
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs">
                    <span
                      className={`${
                        formData.shortDescription.length < 10
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      Minimum 10 characters
                    </span>
                    <span
                      className={`${
                        formData.shortDescription.length > 500
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.shortDescription.length}/500
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription" className="text-gray-300">
                    Detailed Description
                  </Label>
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
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">
                      Subject
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue
                          placeholder="Select subject"
                          className="text-gray-400"
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem
                          value="physics"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          Physics
                        </SelectItem>
                        <SelectItem
                          value="chemistry"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          Chemistry
                        </SelectItem>
                        <SelectItem
                          value="mathematics"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          Mathematics
                        </SelectItem>
                        <SelectItem
                          value="mixed"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          Mixed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-gray-300">
                      Specialization
                    </Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          specialization: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500">
                        <SelectValue
                          placeholder="Select specialization"
                          className="text-gray-400"
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem
                          value="IIT-JEE"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          IIT-JEE
                        </SelectItem>
                        <SelectItem
                          value="NEET"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          NEET
                        </SelectItem>
                        <SelectItem
                          value="CBSE"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          CBSE
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Timing */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-400" />
                  Schedule & Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-300">
                      Start Date
                    </Label>
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
                      className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-gray-300">
                      Start Time
                    </Label>
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
                      className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-300">
                    Duration (minutes)
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
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Marking Scheme */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Marking Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positiveMarks" className="text-gray-300">
                      Positive Marks
                    </Label>
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
                      className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negativeMarks" className="text-gray-300">
                      Negative Marks
                    </Label>
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
                      className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markingType" className="text-gray-300">
                      Marking Type
                    </Label>
                    <Select
                      value={formData.markingType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, markingType: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem
                          value="PQM"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          Per Question Marking
                        </SelectItem>
                        <SelectItem
                          value="OAM"
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          Overall Marking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Questions Summary */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Selected Questions ({selectedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileQuestion className="h-12 w-12 mx-auto mb-3 text-gray-500" />
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
                      .map((question, index) => (
                        <div
                          key={question._id}
                          className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                        >
                          <Badge
                            className={`${getSubjectColor(
                              question.subject
                            )} text-xs`}
                          >
                            {question.subject}
                          </Badge>
                          <span className="text-sm text-gray-300 font-medium truncate">
                            {question.title}
                          </span>
                        </div>
                      ))}
                    {selectedQuestions.length > 3 && (
                      <div className="text-center py-2 text-sm text-gray-400">
                        ... and {selectedQuestions.length - 3} more questions
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Question Bank */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  Question Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <QuestionBank
                  questions={questions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  loading={questionsLoading}
                  height="600px"
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
