/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ImageIcon } from "lucide-react";
import { updateQuestion, uploadImage } from "@/util/server";
import toast from "react-hot-toast";
import {
  CLASS_OPTIONS,
  SPECIALIZATION_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/lib/test-form";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  onQuestionUpdated: () => void;
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onQuestionUpdated,
}: EditQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    specialization: "",
    classLevel: "",
    topic: "",
    tags: "",
    type: "MCQ",
    difficulty: "Medium",
    positiveMarks: "",
    negativeMarks: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOptions: [] as string[],
    explanation: "",
  });
  const [questionImage, setQuestionImage] = useState<File | null>(null);

  useEffect(() => {
    if (question) {
      // Normalize incoming data so form controls always receive strings/arrays
      const normalizeSubject = (value: unknown) => {
        if (Array.isArray(value)) {
          const subjectValue = value.find((s) => typeof s === "string" && s.trim().length > 0);
          return (subjectValue as string | undefined)?.toLowerCase() || "";
        }
        if (typeof value === "string") return value.toLowerCase();
        return "";
      };

      const normalizeTopic = (value: unknown) => {
        if (Array.isArray(value)) {
          const topicValue = value.find((t) => typeof t === "string" && t.trim().length > 0);
          return (topicValue as string | undefined) || "";
        }
        if (typeof value === "string") return value;
        return "";
      };

      const normalizeType = (raw: unknown) => {
        if (typeof raw !== "string") return "MCQ";
        const value = raw.toLowerCase();
        if (value === "single-select" || value === "single") return "MCQ";
        if (value === "multi-select" || value === "multiple") return "MSQ";
        if (value === "integer" || value === "numerical") return "numerical";
        return raw;
      };

      const normalizeOption = (value: unknown) => {
        if (typeof value === "string") return value;
        if (
          value &&
          typeof value === "object" &&
          "text" in (value as Record<string, unknown>) &&
          typeof (value as Record<string, unknown>).text === "string"
        ) {
          return (value as { text: string }).text;
        }
        return "";
      };

      const normalizeCorrectOptions = (value: unknown) => {
        if (Array.isArray(value)) return value.map((opt) => String(opt).toUpperCase());
        if (typeof value === "string" || typeof value === "number") return [String(value).toUpperCase()];
        return [] as string[];
      };

      const normalizeSpecialization = (value: unknown) => {
        if (Array.isArray(value)) {
          const specValue = value.find((s) => typeof s === "string" && s.trim().length > 0);
          return (specValue as string | undefined) || "";
        }
        if (typeof value === "string") return value;
        return "";
      };

      const normalizeClass = (value: unknown) => {
        if (Array.isArray(value)) {
          const classValue = value.find((c) => typeof c === "string" && c.trim().length > 0);
          return (classValue as string | undefined) || "";
        }
        if (typeof value === "string") return value;
        return "";
      };

      const normalizeTags = (value: unknown) => {
        if (Array.isArray(value)) {
          return value.filter((t) => typeof t === "string" && t.trim().length > 0).join(", ");
        }
        if (typeof value === "string") return value;
        return "";
      };

      const normalizeTopics = (value: unknown) => {
        if (Array.isArray(value)) {
          return value.filter((t) => typeof t === "string" && t.trim().length > 0).join(", ");
        }
        if (typeof value === "string") return value;
        return "";
      };

      setFormData({
        title: question.title || "",
        subject: normalizeSubject(question.subject),
        specialization: normalizeSpecialization(question.specialization),
        classLevel: normalizeClass(question.class),
        topic: normalizeTopics(question.topics ?? question.topic),
        tags: normalizeTags(question.tags),
        type: normalizeType(question.type || question.questionType),
        difficulty: question.difficulty || "Medium",
        positiveMarks:
          question.marks?.positive?.toString() || question.positiveMarks?.toString?.() || "",
        negativeMarks:
          question.marks?.negative?.toString() || question.negativeMarks?.toString?.() || "",
        optionA: normalizeOption(question.options?.A),
        optionB: normalizeOption(question.options?.B),
        optionC: normalizeOption(question.options?.C),
        optionD: normalizeOption(question.options?.D),
        correctOptions: normalizeCorrectOptions(question.correctOptions),
        explanation: question.explanation || "",
      });
    }
  }, [question]);

  const handleCorrectOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        correctOptions: [...formData.correctOptions, option],
      });
    } else {
      setFormData({
        ...formData,
        correctOptions: formData.correctOptions.filter((o) => o !== option),
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mapTypeToQuestionType = (value: string) => {
      const lower = value?.toLowerCase();
      if (lower === "mcq") return "single-select";
      if (lower === "msq") return "multi-select";
      if (lower === "numerical") return "integer";
      return value;
    };

    const questionType = mapTypeToQuestionType(formData.type);
    const allowedTypes = ["single-select", "multi-select", "integer"];
    if (!allowedTypes.includes(questionType)) {
      toast.error("Please choose a valid question type");
      return;
    }

    const positiveMarks = Number(formData.positiveMarks);
    const negativeMarks = Number(formData.negativeMarks);

    if (Number.isNaN(positiveMarks) || positiveMarks < 0) {
      toast.error("Positive marks must be a non-negative number");
      return;
    }

    if (Number.isNaN(negativeMarks) || negativeMarks < 0) {
      toast.error("Negative marks must be a non-negative number");
      return;
    }

    // Build correctOptions in the shape the API expects
    const buildCorrectOptions = () => {
      const normalized = formData.correctOptions.map((opt) =>
        String(opt).toUpperCase()
      );

      if (questionType === "single-select") {
        if (normalized.length !== 1) {
          toast.error("Single-select needs exactly one correct option");
          return null;
        }
        return normalized[0];
      }

      if (questionType === "multi-select") {
        if (normalized.length === 0) {
          toast.error("Select at least one correct option");
          return null;
        }
        return normalized;
      }

      // integer / numerical
      const numericValue = Number(normalized[0]);
      if (normalized.length !== 1 || Number.isNaN(numericValue)) {
        toast.error("Provide a valid integer answer");
        return null;
      }
      if (!Number.isInteger(numericValue)) {
        toast.error("Integer answer must be a whole number");
        return null;
      }
      return numericValue;
    };

    const formattedCorrectOptions = buildCorrectOptions();
    if (formattedCorrectOptions === null) return;

    if (questionType !== "integer") {
      const missingOption = [
        formData.optionA,
        formData.optionB,
        formData.optionC,
        formData.optionD,
      ].some((opt) => !opt.trim());
      if (missingOption) {
        toast.error("Please fill all option texts");
        return;
      }
    }

    const subjectArray = formData.subject
      ? [formData.subject.toLowerCase()]
      : undefined;

    const topicsArray = formData.topic
      ? formData.topic
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const specializationArray = formData.specialization
      ? [formData.specialization]
      : undefined;

    const classArray = formData.classLevel
      ? [formData.classLevel]
      : undefined;

    const optionsPayload =
      questionType === "integer"
        ? undefined
        : {
            A: formData.optionA.trim(),
            B: formData.optionB.trim(),
            C: formData.optionC.trim(),
            D: formData.optionD.trim(),
          };

    setLoading(true);

    try {
      let questionImageUrl: string | null = null;
      if (questionImage instanceof File) {
        try {
          const uploadResponse = await uploadImage(questionImage, "question");
          questionImageUrl = uploadResponse?.imageUrl || null;
        } catch (error) {
          console.error("Error uploading question image", error);
          toast.error("Failed to upload question image");
          setLoading(false);
          return;
        }
      }

      const updateData: Record<string, any> = {
        title: formData.title,
        questionType,
        marks: {
          positive: positiveMarks,
          negative: negativeMarks,
        },
        correctOptions: formattedCorrectOptions,
        difficulty: formData.difficulty,
      };

      if (subjectArray) {
        updateData.subject = subjectArray;
      }

      if (specializationArray) {
        updateData.specialization = specializationArray;
      }

      if (classArray) {
        updateData.class = classArray;
      }

      if (topicsArray && topicsArray.length) {
        updateData.topics = topicsArray;
      }

      if (tagsArray && tagsArray.length) {
        updateData.tags = tagsArray;
      }

      if (formData.explanation.trim()) {
        updateData.explanation = formData.explanation.trim();
      }

      if (questionImageUrl) {
        updateData.questionImage = questionImageUrl;
      }

      if (optionsPayload) {
        updateData.options = optionsPayload;
      }

      await updateQuestion(question._id || question.id, updateData);
      toast.success("Question updated successfully!");
      onQuestionUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast.error(error.response?.data?.message || "Failed to update question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Question Text *</Label>
            <Textarea
              id="edit-title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter the question text"
              rows={3}
            />
          </div>

          {/* Subject, Specialization, Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData({ ...formData, subject: value })
                }
              >
                <SelectTrigger id="edit-subject" className="w-full">
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
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) =>
                  setFormData({ ...formData, specialization: value })
                }
              >
                <SelectTrigger id="edit-specialization" className="w-full">
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
              <Label htmlFor="edit-class">Class</Label>
              <Select
                value={formData.classLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, classLevel: value })
                }
              >
                <SelectTrigger id="edit-class" className="w-full">
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

            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger id="edit-difficulty" className="w-full">
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
              <Label htmlFor="edit-type">Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="edit-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Single Select</SelectItem>
                  <SelectItem value="MSQ">Multi Select</SelectItem>
                  <SelectItem value="numerical">Integer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Image (Optional)</Label>
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

          {/* Topics, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic">Topics *</Label>
              <Input
                id="edit-topic"
                required
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder="Comma separated e.g., Kinematics, Organic Chemistry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (Optional)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="Comma separated tags"
              />
            </div>
          </div>

          {/* Positive Marks, Negative Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-positive">Positive Marks *</Label>
              <Input
                id="edit-positive"
                type="number"
                required
                value={formData.positiveMarks}
                onChange={(e) =>
                  setFormData({ ...formData, positiveMarks: e.target.value })
                }
                placeholder="4"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-negative">Negative Marks *</Label>
              <Input
                id="edit-negative"
                type="number"
                required
                value={formData.negativeMarks}
                onChange={(e) =>
                  setFormData({ ...formData, negativeMarks: e.target.value })
                }
                placeholder="1"
                step="0.01"
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="edit-explanation">Explanation (Optional)</Label>
            <Textarea
              id="edit-explanation"
              rows={4}
              placeholder="Provide a solution walkthrough or explanation for this question"
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label>Answer Options *</Label>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-10">
                  <Checkbox
                    id="edit-option-a-correct"
                    checked={formData.correctOptions.includes("A")}
                    onCheckedChange={(checked) =>
                      handleCorrectOptionChange("A", checked as boolean)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="edit-option-a"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Option A *
                  </Label>
                  <Input
                    id="edit-option-a"
                    required
                    value={formData.optionA}
                    onChange={(e) =>
                      setFormData({ ...formData, optionA: e.target.value })
                    }
                    placeholder="Enter option A"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center h-10">
                  <Checkbox
                    id="edit-option-b-correct"
                    checked={formData.correctOptions.includes("B")}
                    onCheckedChange={(checked) =>
                      handleCorrectOptionChange("B", checked as boolean)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="edit-option-b"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Option B *
                  </Label>
                  <Input
                    id="edit-option-b"
                    required
                    value={formData.optionB}
                    onChange={(e) =>
                      setFormData({ ...formData, optionB: e.target.value })
                    }
                    placeholder="Enter option B"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center h-10">
                  <Checkbox
                    id="edit-option-c-correct"
                    checked={formData.correctOptions.includes("C")}
                    onCheckedChange={(checked) =>
                      handleCorrectOptionChange("C", checked as boolean)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="edit-option-c"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Option C *
                  </Label>
                  <Input
                    id="edit-option-c"
                    required
                    value={formData.optionC}
                    onChange={(e) =>
                      setFormData({ ...formData, optionC: e.target.value })
                    }
                    placeholder="Enter option C"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center h-10">
                  <Checkbox
                    id="edit-option-d-correct"
                    checked={formData.correctOptions.includes("D")}
                    onCheckedChange={(checked) =>
                      handleCorrectOptionChange("D", checked as boolean)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="edit-option-d"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Option D *
                  </Label>
                  <Input
                    id="edit-option-d"
                    required
                    value={formData.optionD}
                    onChange={(e) =>
                      setFormData({ ...formData, optionD: e.target.value })
                    }
                    placeholder="Enter option D"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Check the box(es) next to the correct answer(s). For MCQ, select
              one. For MSQ, select multiple.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Question"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
