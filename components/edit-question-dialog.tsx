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
import { Loader2 } from "lucide-react";
import { updateQuestion } from "@/util/server";
import toast from "react-hot-toast";

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
    topic: "",
    type: "MCQ",
    positiveMarks: "",
    negativeMarks: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOptions: [] as string[],
  });

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

      setFormData({
        title: question.title || "",
        subject: normalizeSubject(question.subject),
        topic: normalizeTopic(question.topic ?? question.topics),
        type: normalizeType(question.type || question.questionType),
        positiveMarks:
          question.marks?.positive?.toString() || question.positiveMarks?.toString?.() || "",
        negativeMarks:
          question.marks?.negative?.toString() || question.negativeMarks?.toString?.() || "",
        optionA: normalizeOption(question.options?.A),
        optionB: normalizeOption(question.options?.B),
        optionC: normalizeOption(question.options?.C),
        optionD: normalizeOption(question.options?.D),
        correctOptions: normalizeCorrectOptions(question.correctOptions),
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
      const updateData: Record<string, any> = {
        title: formData.title,
        questionType,
        marks: {
          positive: positiveMarks,
          negative: negativeMarks,
        },
        correctOptions: formattedCorrectOptions,
      };

      if (subjectArray) {
        updateData.subject = subjectArray;
      }

      if (topicsArray && topicsArray.length) {
        updateData.topics = topicsArray;
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

          {/* Subject, Topic, Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData({ ...formData, subject: value })
                }
              >
                <SelectTrigger id="edit-subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-topic">Topic *</Label>
              <Input
                id="edit-topic"
                required
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder="e.g., Thermodynamics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice (Single)</SelectItem>
                  <SelectItem value="MSQ">
                    Multiple Choice (Multiple)
                  </SelectItem>
                  <SelectItem value="numerical">Numerical</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                placeholder="e.g., 4"
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
                placeholder="e.g., 1"
                step="0.01"
              />
            </div>
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
