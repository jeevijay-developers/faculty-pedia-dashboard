"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import { ArrowLeft, BookOpen, FileQuestion, Save } from "lucide-react";
import QuestionBank from "@/components/question-bank";
import { useAuth } from "@/contexts/auth-context";
import {
  createLiveTest,
  getEducatorQuestionsByEducatorId,
} from "@/util/server";
import { type Question } from "@/lib/types/test";
import toast from "react-hot-toast";
import {
  type TestFormValues,
  defaultTestFormValues,
  validateTestForm,
  buildCreateTestPayload,
  CLASS_OPTIONS,
  MARKING_TYPE_OPTIONS,
  SPECIALIZATION_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/lib/test-form";

export default function CreateTestPage() {
  const router = useRouter();
  const { educator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [formValues, setFormValues] = useState<TestFormValues>(
    defaultTestFormValues
  );

  const fetchQuestions = useCallback(async () => {
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
  }, [educator?._id]);

  useEffect(() => {
    if (!educator?._id) {
      router.push("/login");
      return;
    }

    fetchQuestions();
  }, [educator?._id, router, fetchQuestions]);

  const handleQuestionSelect = (questionId: string, selected: boolean) => {
    setFormValues((prev) => {
      if (selected) {
        if (prev.questionIds.includes(questionId)) return prev;
        return { ...prev, questionIds: [...prev.questionIds, questionId] };
      }
      return {
        ...prev,
        questionIds: prev.questionIds.filter((id) => id !== questionId),
      };
    });
  };

  const handleFormChange = <K extends keyof TestFormValues>(
    field: K,
    value: TestFormValues[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const validationMessage = validateTestForm(formValues);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    if (!educator?._id) {
      toast.error("Educator information not found");
      return;
    }

    try {
      setLoading(true);
      const payload = buildCreateTestPayload(formValues, educator._id);
      await createLiveTest(payload);
      toast.success("Test created successfully!");
      setFormValues(defaultTestFormValues);
      router.push("/dashboard/test");
    } catch (error) {
      console.error("Error creating test:", error);
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      toast.error(apiMessage || "Failed to create test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string | string[] | undefined) => {
    const normalized = Array.isArray(subject)
      ? subject[0]
      : typeof subject === "string"
      ? subject
      : "";
    const key = typeof normalized === "string" ? normalized.toLowerCase() : "";
    const colors = {
      physics: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      chemistry: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      mathematics: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      mixed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return (
      colors[key as keyof typeof colors] ||
      "bg-gray-500/10 text-gray-500 border-gray-500/20"
    );
  };

  const selectedQuestionDetails = useMemo(
    () =>
      questions.filter((question) =>
        formValues.questionIds.includes(question._id)
      ),
    [questions, formValues.questionIds]
  );

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
            onClick={() => router.push("/dashboard/test")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tests
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/test")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || formValues.questionIds.length === 0}
              className="gap-2"
            >
              {loading ? "Creating..." : "Create Test"}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-5 auto-rows-min gap-4">
          {/* Div 1: Basic Information */}
          <div className="col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-title">Title</Label>
                  <Input
                    id="test-title"
                    placeholder="e.g., JEE Advanced Mock Test"
                    value={formValues.title}
                    onChange={(event) =>
                      handleFormChange("title", event.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-description">Description</Label>
                  <Textarea
                    id="test-description"
                    rows={3}
                    placeholder="Add important details, structure, and instructions"
                    value={formValues.description}
                    onChange={(event) =>
                      handleFormChange("description", event.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Div 2: Audience & Scope */}
          <div className="col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Audience & Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <MultiSelect
                    value={formValues.subjects}
                    onChange={(selection) =>
                      handleFormChange("subjects", selection)
                    }
                    options={SUBJECT_OPTIONS}
                    placeholder="Select one or more subjects"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Classes</Label>
                  <MultiSelect
                    value={formValues.classes}
                    onChange={(selection) =>
                      handleFormChange("classes", selection)
                    }
                    options={CLASS_OPTIONS}
                    placeholder="Select class levels"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <MultiSelect
                    value={formValues.specializations}
                    onChange={(selection) =>
                      handleFormChange("specializations", selection)
                    }
                    options={SPECIALIZATION_OPTIONS}
                    placeholder="Select specialization tracks"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Div 3: Test Settings */}
          <div className="col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Test Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="test-duration">Duration (minutes)</Label>
                  <Input
                    id="test-duration"
                    type="number"
                    min={1}
                    value={formValues.durationMinutes}
                    onChange={(event) =>
                      handleFormChange("durationMinutes", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-marks">Overall Marks</Label>
                  <Input
                    id="test-marks"
                    type="number"
                    min={1}
                    value={formValues.overallMarks}
                    onChange={(event) =>
                      handleFormChange("overallMarks", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-marking-type">Marking Type</Label>
                  <Select
                    value={formValues.markingType}
                    onValueChange={(value) =>
                      handleFormChange(
                        "markingType",
                        value as TestFormValues["markingType"]
                      )
                    }
                  >
                    <SelectTrigger id="test-marking-type">
                      <SelectValue placeholder="Choose type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKING_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Div 4: Advanced Options */}
          <div className="col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="test-instructions">
                      Instructions (optional)
                    </Label>
                    <Textarea
                      id="test-instructions"
                      rows={3}
                      placeholder="Share guidelines that learners see before the test"
                      value={formValues.instructions}
                      onChange={(event) =>
                        handleFormChange("instructions", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passing-marks">
                      Passing Marks (optional)
                    </Label>
                    <Input
                      id="passing-marks"
                      type="number"
                      min={0}
                      value={formValues.passingMarks}
                      onChange={(event) =>
                        handleFormChange("passingMarks", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Negative Marking</Label>
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Enable negative marking
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Deduct marks for incorrect answers
                        </p>
                      </div>
                      <Switch
                        checked={formValues.negativeMarking}
                        onCheckedChange={(checked) =>
                          handleFormChange("negativeMarking", checked)
                        }
                      />
                    </div>
                    {formValues.negativeMarking && (
                      <div className="space-y-1">
                        <Label htmlFor="negative-ratio">
                          Negative Ratio (0 - 1)
                        </Label>
                        <Input
                          id="negative-ratio"
                          type="number"
                          step="0.05"
                          min={0}
                          max={1}
                          value={formValues.negativeMarkingRatio}
                          onChange={(event) =>
                            handleFormChange(
                              "negativeMarkingRatio",
                              event.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Test Series</Label>
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Part of a Test Series
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Link this test to a specific series
                        </p>
                      </div>
                      <Switch
                        checked={formValues.isTestSeriesSpecific}
                        onCheckedChange={(checked) =>
                          handleFormChange("isTestSeriesSpecific", checked)
                        }
                      />
                    </div>
                    {formValues.isTestSeriesSpecific && (
                      <div className="space-y-1">
                        <Label htmlFor="test-series-id">Test Series ID</Label>
                        <Input
                          id="test-series-id"
                          placeholder="Enter Test Series ID"
                          value={formValues.testSeriesId}
                          onChange={(event) =>
                            handleFormChange("testSeriesId", event.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Shuffle Questions</p>
                        <p className="text-xs text-muted-foreground">
                          Randomize question order for each attempt
                        </p>
                      </div>
                      <Switch
                        checked={formValues.shuffleQuestions}
                        onCheckedChange={(checked) =>
                          handleFormChange("shuffleQuestions", checked)
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Show Results</p>
                        <p className="text-xs text-muted-foreground">
                          Display results immediately after submission
                        </p>
                      </div>
                      <Switch
                        checked={formValues.showResult}
                        onCheckedChange={(checked) =>
                          handleFormChange("showResult", checked)
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Allow Review</p>
                        <p className="text-xs text-muted-foreground">
                          Let students review responses after the test
                        </p>
                      </div>
                      <Switch
                        checked={formValues.allowReview}
                        onCheckedChange={(checked) =>
                          handleFormChange("allowReview", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Div 5: Question Bank */}
          <div className="col-span-3 row-span-4 col-start-3 row-start-1">
            <Card className="bg-card border-border h-full flex flex-col min-h-[600px]">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Question Bank
                </CardTitle>
                <Badge variant="outline">
                  {formValues.questionIds.length} selected
                </Badge>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <QuestionBank
                  questions={questions}
                  selectedQuestions={formValues.questionIds}
                  onQuestionSelect={handleQuestionSelect}
                  loading={questionsLoading}
                  height="h-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Div 6: Selected Questions */}
          <div className="col-span-5">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Selected Questions</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedQuestionDetails.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
                    <FileQuestion className="h-10 w-10" />
                    <div>
                      <p className="font-medium">No questions selected</p>
                      <p className="text-sm">
                        Choose questions from the bank to build your test
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedQuestionDetails.slice(0, 4).map((question) => (
                      <div
                        key={question._id}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2"
                      >
                        <Badge
                          variant="outline"
                          className={getSubjectColor(question.subject)}
                        >
                          {question.subject}
                        </Badge>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {question.title}
                        </p>
                      </div>
                    ))}
                    {formValues.questionIds.length > 4 && (
                      <p className="text-center text-sm text-muted-foreground">
                        +{formValues.questionIds.length - 4} more questions
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
