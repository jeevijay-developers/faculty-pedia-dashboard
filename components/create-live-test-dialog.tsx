"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Target,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
} from "lucide-react";
import QuestionBank from "@/components/question-bank";
import { useAuth } from "@/contexts/auth-context";
import {
  createLiveTest,
  getEducatorQuestionsByEducatorId,
} from "@/util/server";
import { CreateLiveTestData } from "@/lib/types/live-test";
import { Question } from "@/lib/types/test";

interface CreateLiveTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLiveTestCreated: () => void;
}

export default function CreateLiveTestDialog({
  open,
  onOpenChange,
  onLiveTestCreated,
}: CreateLiveTestDialogProps) {
  const { educator } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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
    if (open && educator?._id) {
      fetchQuestions();
    }
  }, [open, educator]);

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

  const resetForm = () => {
    setFormData({
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
    setSelectedQuestions([]);
    setCurrentStep(1);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const validateStep1 = () => {
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

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1() || selectedQuestions.length === 0) {
      setError("Please select at least one question");
      return;
    }

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

      const liveTestData: CreateLiveTestData = {
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

      await createLiveTest(liveTestData);
      onLiveTestCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating live test:", error);
      setError("Failed to create live test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Live Test
          </DialogTitle>
          <div className="flex items-center gap-4 mt-4">
            <div
              className={`flex items-center gap-2 ${
                currentStep >= 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <span className="font-medium">Live Test Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div
              className={`flex items-center gap-2 ${
                currentStep >= 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="font-medium">Select Questions</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6 pr-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Live Test Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., JEE Mixed Subject Live Test"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">
                        Short Description
                      </Label>
                      <Textarea
                        id="shortDescription"
                        placeholder="Brief description of the live test"
                        rows={2}
                        value={formData.shortDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shortDescription: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longDescription">
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
                      />
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
                            <SelectItem value="mathematics">
                              Mathematics
                            </SelectItem>
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
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
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
                      <Label htmlFor="duration">Duration (minutes)</Label>
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
              </div>

              {/* Marking Scheme */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
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
                          setFormData((prev) => ({
                            ...prev,
                            markingType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PQM">
                            Per Question Marking
                          </SelectItem>
                          <SelectItem value="OAM">Overall Marking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="pr-4">
              <QuestionBank
                questions={questions}
                selectedQuestions={selectedQuestions}
                onQuestionSelect={handleQuestionSelect}
                loading={questionsLoading}
                height="h-[50vh]"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <Button
                variant="outline"
                onClick={handlePrevStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <div className="text-sm text-gray-600">
                {selectedQuestions.length} question
                {selectedQuestions.length !== 1 ? "s" : ""} selected
              </div>
            )}

            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>

            {currentStep === 1 ? (
              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedQuestions.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
              >
                {loading ? "Creating..." : "Create Live Test"}
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
