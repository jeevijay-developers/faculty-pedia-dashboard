"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import {
  getEducatorQuestionsByEducatorId,
  createLiveTest,
} from "@/util/server";
import QuestionBank from "./question-bank";
import { Question, QuestionsResponse, CreateTestData } from "@/lib/types/test";

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestCreated: () => void;
}

interface TestFormData {
  title: string;
  shortDescription: string;
  longDescription: string;
  subject: string;
  specialization: string;
  startDate: string;
  duration: number;
  positiveMarks: number;
  negativeMarks: number;
  markingType: string;
  selectedQuestions: string[];
}

export default function CreateTestDialog({
  open,
  onOpenChange,
  onTestCreated,
}: CreateTestDialogProps) {
  const { educator } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [formData, setFormData] = useState<TestFormData>({
    title: "",
    shortDescription: "",
    longDescription: "",
    subject: "",
    specialization: "",
    startDate: "",
    duration: 60,
    positiveMarks: 4,
    negativeMarks: -1,
    markingType: "PQM",
    selectedQuestions: [],
  });

  useEffect(() => {
    if (open && educator?._id) {
      fetchQuestions();
    }
  }, [open, educator]);

  const fetchQuestions = async () => {
    if (!educator?._id) return;

    try {
      setQuestionsLoading(true);
      const response: QuestionsResponse =
        await getEducatorQuestionsByEducatorId(educator._id);
      setQuestions(response.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof TestFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionSelect = (questionId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        selectedQuestions: [...prev.selectedQuestions, questionId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedQuestions: prev.selectedQuestions.filter(
          (id) => id !== questionId
        ),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!educator?._id) return;

    try {
      setLoading(true);

      const testData: CreateTestData = {
        title: formData.title,
        description: {
          short: formData.shortDescription,
          long: formData.longDescription,
        },
        subject: formData.subject.toLowerCase(),
        specialization: formData.specialization,
        startDate: new Date(formData.startDate).toISOString(),
        duration: formData.duration,
        overallMarks: {
          positive: formData.positiveMarks,
          negative: formData.negativeMarks,
        },
        markingType: formData.markingType,
        questions: formData.selectedQuestions,
        educatorId: educator._id,
      };

      await createLiveTest(testData);
      onTestCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating test:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      title: "",
      shortDescription: "",
      longDescription: "",
      subject: "",
      specialization: "",
      startDate: "",
      duration: 60,
      positiveMarks: 4,
      negativeMarks: -1,
      markingType: "PQM",
      selectedQuestions: [],
    });
  };

  const isStep1Valid =
    formData.title &&
    formData.shortDescription &&
    formData.longDescription &&
    formData.subject &&
    formData.specialization &&
    formData.startDate;

  const isStep2Valid = formData.selectedQuestions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Live Test
            </DialogTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === 1
                      ? "bg-blue-600 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {step === 1 ? "1" : "✓"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === 1 ? "text-blue-600" : "text-green-600"
                  }`}
                >
                  Test Details
                </span>
              </div>
              <div
                className={`w-16 h-1 rounded-full ${
                  step === 2 ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Select Questions
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4 max-h-[calc(95vh-180px)] overflow-y-auto">
            {/* Basic Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Test Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter test title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="subject"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subject *
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      handleInputChange("subject", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
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
              </div>
            </div>

            {/* Test Configuration Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Test Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label
                    htmlFor="specialization"
                    className="text-sm font-medium text-gray-700"
                  >
                    Specialization *
                  </Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      handleInputChange("specialization", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Start Date & Time *
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="duration"
                    className="text-sm font-medium text-gray-700"
                  >
                    Duration (minutes) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="positiveMarks"
                    className="text-sm font-medium text-gray-700"
                  >
                    Positive Marks *
                  </Label>
                  <Input
                    id="positiveMarks"
                    type="number"
                    value={formData.positiveMarks}
                    onChange={(e) =>
                      handleInputChange(
                        "positiveMarks",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="negativeMarks"
                    className="text-sm font-medium text-gray-700"
                  >
                    Negative Marks *
                  </Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) =>
                      handleInputChange(
                        "negativeMarks",
                        parseInt(e.target.value)
                      )
                    }
                    max="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Description
              </h3>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="shortDescription"
                    className="text-sm font-medium text-gray-700"
                  >
                    Short Description *
                  </Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    placeholder="Brief description of the test"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="longDescription"
                    className="text-sm font-medium text-gray-700"
                  >
                    Long Description *
                  </Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) =>
                      handleInputChange("longDescription", e.target.value)
                    }
                    placeholder="Detailed description of the test"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
              >
                Next: Select Questions
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Question Bank
              </h3>
              <QuestionBank
                questions={questions}
                selectedQuestions={formData.selectedQuestions}
                onQuestionSelect={handleQuestionSelect}
                loading={questionsLoading}
                height="h-80"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="px-6"
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isStep2Valid || loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Test
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
