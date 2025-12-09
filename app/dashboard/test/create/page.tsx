"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/lib/test-form";
import { TestMetadataForm } from "@/components/test-metadata-form";

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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TestMetadataForm values={formValues} onChange={handleFormChange} />

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Question Bank
                </CardTitle>
                <Badge variant="outline">
                  {formValues.questionIds.length} selected
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <QuestionBank
                  questions={questions}
                  selectedQuestions={formValues.questionIds}
                  onQuestionSelect={handleQuestionSelect}
                  loading={questionsLoading}
                  darkTheme
                />
              </CardContent>
            </Card>

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
