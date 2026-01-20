"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createQuestion, uploadImage } from "@/util/server";
import toast from "react-hot-toast";
import {
  CLASS_OPTIONS,
  SPECIALIZATION_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/lib/test-form";

interface CreateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type QuestionType = "single-select" | "multi-select" | "integer";

interface QuestionOption {
  text: string;
  image: File | string | null;
}

export function CreateQuestionDialog({
  open,
  onOpenChange,
}: CreateQuestionDialogProps) {
  const { educator, refreshEducator } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    specialization: "",
    classLevel: "",
    topic: "",
    tags: "",
    positiveMarks: "4",
    negativeMarks: "1",
    questionType: "single-select" as QuestionType,
    explanation: "",
    difficulty: "Medium",
  });

  const [options, setOptions] = useState<Record<string, QuestionOption>>({
    A: { text: "", image: null },
    B: { text: "", image: null },
    C: { text: "", image: null },
    D: { text: "", image: null },
  });

  const [correctOptions, setCorrectOptions] = useState<string[]>([]);
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [integerAnswer, setIntegerAnswer] = useState("");

  const updateOption = (
    key: string,
    field: keyof QuestionOption,
    value: string | File | null
  ) => {
    setOptions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const toggleCorrectOption = (option: string) => {
    setCorrectOptions((prev) => {
      if (formData.questionType === "single-select") {
        return prev.includes(option) ? [] : [option];
      }
      return prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option];
    });
  };

  const handleQuestionTypeChange = (value: QuestionType) => {
    setFormData((prev) => ({ ...prev, questionType: value }));
    setCorrectOptions([]);
    if (value !== "integer") {
      setIntegerAnswer("");
    }
  };

  const handlePositiveMarksBlur = () => {
    const parsed = Number(formData.positiveMarks);
    if (!Number.isNaN(parsed) && parsed < 0) {
      toast.error("The value of Positive marks could not be negative");
      setFormData((prev) => ({ ...prev, positiveMarks: "" }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (formData.title.trim().length < 10) {
      toast.error("Title must be at least 10 characters");
      return;
    }

    if (!formData.subject || !formData.specialization || !formData.classLevel) {
      toast.error("Subject, specialization, and class are required");
      return;
    }

    if (!formData.questionType) {
      toast.error("Please select a question type");
      return;
    }

    if (formData.questionType !== "integer" && correctOptions.length === 0) {
      toast.error("Select at least one correct option");
      return;
    }

    if (
      formData.questionType === "single-select" &&
      correctOptions.length !== 1
    ) {
      toast.error("Single select questions need exactly one correct option");
      return;
    }

    if (formData.questionType !== "integer") {
      const missingOption = Object.values(options).some(
        (opt) => !opt.text.trim()
      );
      if (missingOption) {
        toast.error("Please fill all option texts");
        return;
      }
    }

    if (formData.questionType === "integer") {
      const parsedIntegerAnswer = Number(integerAnswer);
      if (!integerAnswer.trim() || Number.isNaN(parsedIntegerAnswer)) {
        toast.error("Provide a valid integer answer");
        return;
      }

      if (!Number.isInteger(parsedIntegerAnswer)) {
        toast.error("Integer answer must be a whole number");
        return;
      }
    }

    if (!educator?._id) {
      toast.error("Educator information missing. Please log in again.");
      return;
    }

    const positiveMarksValue = Number(formData.positiveMarks);
    const negativeMarksValue = Number(formData.negativeMarks);

    if (Number.isNaN(positiveMarksValue) || Number.isNaN(negativeMarksValue)) {
      toast.error("Please enter valid numeric values for marks");
      return;
    }

    const normalizedOptions =
      formData.questionType === "integer"
        ? undefined
        : Object.entries(options).reduce((acc, [key, option]) => {
            acc[key] = option.text.trim();
            return acc;
          }, {} as Record<string, string>);

    const topics = formData.topic
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (!topics.length) {
      toast.error("Add at least one topic");
      return;
    }

    const subjectValue = formData.subject.toLowerCase();
    const specializationValue = formData.specialization;
    const classValue = formData.classLevel;

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    let questionImageUrl: string | null = null;

    try {
      if (questionImage instanceof File) {
        const uploadResponse = await uploadImage(questionImage, "question");
        questionImageUrl = uploadResponse?.imageUrl || null;
      }
    } catch (error) {
      console.error("Error uploading question image", error);
      toast.error("Failed to upload question image");
      return;
    }

    let formattedCorrectOptions: string | string[] | number = correctOptions;

    if (formData.questionType === "single-select") {
      formattedCorrectOptions = correctOptions[0];
    } else if (formData.questionType === "integer") {
      formattedCorrectOptions = Number(integerAnswer);
    }

    const questionData = {
      title: formData.title.trim(),
      questionType: formData.questionType,
      educatorId: educator._id,
      ...(questionImageUrl ? { questionImage: questionImageUrl } : {}),
      subject: subjectValue ? [subjectValue] : [],
      specialization: specializationValue ? [specializationValue] : [],
      class: classValue ? [classValue] : [],
      topics,
      explanation: formData.explanation.trim(),
      difficulty: formData.difficulty,
      marks: {
        positive: positiveMarksValue,
        negative: Math.max(0, negativeMarksValue),
      },
      ...(normalizedOptions ? { options: normalizedOptions } : {}),
      correctOptions: formattedCorrectOptions,
      ...(tags.length ? { tags } : {}),
    };

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating question...");

    try {
      // Call API to create question
      await createQuestion(questionData);

      // Refresh educator data to show new question
      await refreshEducator();

      toast.success("Question created successfully!", {
        id: loadingToast,
      });

      // Reset form and close dialog
      setFormData({
        title: "",
        subject: "",
        specialization: "",
        classLevel: "",
        topic: "",
        tags: "",
        positiveMarks: "4",
        negativeMarks: "1",
        questionType: "single-select",
        explanation: "",
        difficulty: "Medium",
      });
      setOptions({
        A: { text: "", image: null },
        B: { text: "", image: null },
        C: { text: "", image: null },
        D: { text: "", image: null },
      });

      setCorrectOptions([]);
      setQuestionImage(null);
      setIntegerAnswer("");
      onOpenChange(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating question:", error);
      toast.error(
        error.response?.data?.message || "Failed to create question",
        {
          id: loadingToast,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Add a new question to your question bank. You can drag these
            questions into tests later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Question Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Question Text</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((subjectOption) => (
                        <SelectItem
                          key={subjectOption.value}
                          value={subjectOption.value}
                        >
                          {subjectOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialization: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATION_OPTIONS.map((specializationOption) => (
                        <SelectItem
                          key={specializationOption.value}
                          value={specializationOption.value}
                        >
                          {specializationOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class-level">Class</Label>
                  <Select
                    value={formData.classLevel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, classLevel: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((classOption) => (
                        <SelectItem
                          key={classOption.value}
                          value={classOption.value}
                        >
                          {classOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value: QuestionType) =>
                      handleQuestionTypeChange(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-select">
                        Single Select
                      </SelectItem>
                      <SelectItem value="multi-select">Multi Select</SelectItem>
                      <SelectItem value="integer">Integer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title Image (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setQuestionImage(e.target.files?.[0] || null)
                      }
                      className="flex-1"
                    />
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {questionImage instanceof File && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {questionImage.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topics</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    placeholder="Comma separated e.g., Kinematics, Organic Chemistry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="Comma separated tags"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positiveMarks">Positive Marks</Label>
                  <Input
                    id="positiveMarks"
                    type="number"
                    value={formData.positiveMarks}
                    onBlur={handlePositiveMarksBlur}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        positiveMarks: e.target.value,
                      })
                    }
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeMarks: e.target.value,
                      })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  rows={4}
                  placeholder="Provide a solution walkthrough or explanation for this question"
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {formData.questionType === "integer" ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Integer Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="integer-answer">Correct Answer</Label>
                  <Input
                    id="integer-answer"
                    type="number"
                    value={integerAnswer}
                    onChange={(e) => setIntegerAnswer(e.target.value)}
                    placeholder="Enter integer value"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Answer Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(options).map(([key, option]) => (
                  <div
                    key={key}
                    className="space-y-3 p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`correct-${key}`}
                          checked={correctOptions.includes(key)}
                          onCheckedChange={() => toggleCorrectOption(key)}
                        />
                        <Label
                          htmlFor={`correct-${key}`}
                          className="text-sm font-medium"
                        >
                          Option {key} (Correct Answer)
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`option-${key}`}>Option {key} Text</Label>
                      <Input
                        id={`option-${key}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(key, "text", e.target.value)
                        }
                        placeholder={`Enter option ${key} text`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`image-${key}`}>
                        Option {key} Image (Optional)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`image-${key}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateOption(
                              key,
                              "image",
                              e.target.files?.[0] || null
                            )
                          }
                          className="flex-1"
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {option.image && option.image instanceof File && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {option.image.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {correctOptions.length === 0 && (
                  <div className="text-center py-4 text-destructive text-sm">
                    Please select at least one correct answer
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              formData.title.trim().length < 10 ||
              !formData.subject ||
              !formData.specialization ||
              !formData.classLevel ||
              !formData.topic.trim() ||
              (formData.questionType !== "integer" &&
                correctOptions.length === 0) ||
              (formData.questionType === "integer" && !integerAnswer.trim())
            }
          >
            {isSubmitting ? "Creating..." : "Create Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
