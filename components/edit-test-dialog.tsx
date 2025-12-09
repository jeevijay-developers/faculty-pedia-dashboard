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
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateLiveTest } from "@/util/server";
import {
  CLASS_OPTIONS,
  SUBJECT_OPTIONS,
  SPECIALIZATION_OPTIONS,
} from "@/lib/test-form";
import { Test } from "@/lib/types/test";

interface EditTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  onTestUpdated: () => void;
}

export function EditTestDialog({
  open,
  onOpenChange,
  test,
  onTestUpdated,
}: EditTestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjects: [] as string[],
    class: [] as string[],
    specialization: [] as string[],
    duration: "",
    overallMarks: "",
    markingType: "per_question" as "overall" | "per_question",
    instructions: "",
    passingMarks: "",
    negativeMarking: false,
    negativeMarkingRatio: "0.25",
    shuffleQuestions: false,
    showResult: true,
    allowReview: true,
  });

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || "",
        description: test.description || "",
        subjects: Array.isArray(test.subjects) ? test.subjects : [],
        class: Array.isArray(test.class) ? test.class : [],
        specialization: Array.isArray(test.specialization)
          ? test.specialization
          : [],
        duration: test.duration?.toString() || "",
        overallMarks: test.overallMarks?.toString() || "",
        markingType: test.markingType || "per_question",
        instructions: test.instructions || "",
        passingMarks: test.passingMarks?.toString() || "",
        negativeMarking: test.negativeMarking ?? false,
        negativeMarkingRatio: test.negativeMarkingRatio?.toString() || "0.25",
        shuffleQuestions: test.shuffleQuestions ?? false,
        showResult: test.showResult ?? true,
        allowReview: test.allowReview ?? true,
      });
    }
  }, [test, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!test) return;

    // Validation
    if (formData.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    if (formData.class.length === 0) {
      toast.error("Please select at least one class");
      return;
    }
    if (formData.specialization.length === 0) {
      toast.error("Please select at least one specialization");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        subjects: formData.subjects,
        class: formData.class,
        specialization: formData.specialization,
        duration: Number(formData.duration),
        overallMarks: Number(formData.overallMarks),
        markingType: formData.markingType,
        instructions: formData.instructions,
        negativeMarking: formData.negativeMarking,
        negativeMarkingRatio: Number(formData.negativeMarkingRatio),
        shuffleQuestions: formData.shuffleQuestions,
        showResult: formData.showResult,
        allowReview: formData.allowReview,
        ...(formData.passingMarks && {
          passingMarks: Number(formData.passingMarks),
        }),
      };

      await updateLiveTest(test._id, updateData);
      toast.success("Test updated successfully!");
      onTestUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating test:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to update test";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Test Title *</Label>
            <Input
              id="edit-title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter test title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter test description"
              rows={3}
            />
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <Label>Subjects *</Label>
            <MultiSelect
              options={SUBJECT_OPTIONS}
              value={formData.subjects}
              onChange={(values) =>
                setFormData({ ...formData, subjects: values })
              }
              placeholder="Select subjects"
            />
          </div>

          {/* Class */}
          <div className="space-y-2">
            <Label>Class *</Label>
            <MultiSelect
              options={CLASS_OPTIONS}
              value={formData.class}
              onChange={(values) => setFormData({ ...formData, class: values })}
              placeholder="Select classes"
            />
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label>Specialization *</Label>
            <MultiSelect
              options={SPECIALIZATION_OPTIONS}
              value={formData.specialization}
              onChange={(values) =>
                setFormData({ ...formData, specialization: values })
              }
              placeholder="Select specialization"
            />
          </div>

          {/* Duration and Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes) *</Label>
              <Input
                id="edit-duration"
                type="number"
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 180"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-marks">Overall Marks *</Label>
              <Input
                id="edit-marks"
                type="number"
                required
                value={formData.overallMarks}
                onChange={(e) =>
                  setFormData({ ...formData, overallMarks: e.target.value })
                }
                placeholder="e.g., 300"
                min="1"
              />
            </div>
          </div>

          {/* Passing Marks and Marking Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-passing">Passing Marks</Label>
              <Input
                id="edit-passing"
                type="number"
                value={formData.passingMarks}
                onChange={(e) =>
                  setFormData({ ...formData, passingMarks: e.target.value })
                }
                placeholder="Optional"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-marking-type">Marking Type *</Label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="markingType"
                    value="per_question"
                    checked={formData.markingType === "per_question"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        markingType: e.target.value as "per_question",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Per Question</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="markingType"
                    value="overall"
                    checked={formData.markingType === "overall"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        markingType: e.target.value as "overall",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Overall</span>
                </label>
              </div>
            </div>
          </div>

          {/* Negative Marking */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="negative-marking"
                checked={formData.negativeMarking}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    negativeMarking: checked as boolean,
                  })
                }
              />
              <Label htmlFor="negative-marking" className="cursor-pointer">
                Enable Negative Marking
              </Label>
            </div>

            {formData.negativeMarking && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="edit-negative-ratio">
                  Negative Marking Ratio
                </Label>
                <Input
                  id="edit-negative-ratio"
                  type="number"
                  value={formData.negativeMarkingRatio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      negativeMarkingRatio: e.target.value,
                    })
                  }
                  placeholder="e.g., 0.25"
                  step="0.01"
                  min="0"
                  max="1"
                />
                <p className="text-xs text-muted-foreground">
                  Value between 0 and 1 (e.g., 0.25 means -1 for every 4 marks)
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="edit-instructions">Instructions</Label>
            <Textarea
              id="edit-instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="Optional test instructions for students"
              rows={3}
            />
          </div>

          {/* Test Options */}
          <div className="space-y-3">
            <Label>Test Options</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="shuffle-questions"
                  checked={formData.shuffleQuestions}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      shuffleQuestions: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="shuffle-questions"
                  className="cursor-pointer font-normal"
                >
                  Shuffle Questions
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-result"
                  checked={formData.showResult}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showResult: checked as boolean })
                  }
                />
                <Label
                  htmlFor="show-result"
                  className="cursor-pointer font-normal"
                >
                  Show Result After Test
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="allow-review"
                  checked={formData.allowReview}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      allowReview: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="allow-review"
                  className="cursor-pointer font-normal"
                >
                  Allow Answer Review
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Questions cannot be edited from this
              dialog. Questions are managed separately.
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
                "Update Test"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
