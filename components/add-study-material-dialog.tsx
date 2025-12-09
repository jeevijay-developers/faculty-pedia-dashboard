"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { createStudyMaterialEntry } from "@/util/server";

const MAX_FILE_COUNT = 10;
const ACCEPTED_FILE_TYPES = ".pdf";

const SUBJECT_OPTIONS = [
  { label: "Biology", value: "biology" },
  { label: "Physics", value: "physics" },
  { label: "Mathematics", value: "mathematics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
];

const getSubjectLabel = (value: string) => {
  const option = SUBJECT_OPTIONS.find((entry) => entry.value === value);
  return option ? option.label : value;
};

interface ValidationErrorEntry {
  msg?: string;
  message?: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: ValidationErrorEntry[];
    };
  };
  message?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorResponse;
    const validationMessage = apiError.response?.data?.errors?.[0];
    if (validationMessage) {
      return (
        (typeof validationMessage.msg === "string" && validationMessage.msg) ||
        (typeof validationMessage.message === "string" && validationMessage.message) ||
        fallback
      );
    }
    const nestedMessage = apiError.response?.data?.message;
    if (typeof nestedMessage === "string") {
      return nestedMessage;
    }
    if (typeof apiError.message === "string") {
      return apiError.message;
    }
  }
  return fallback;
};

const formatFileSize = (size?: number) => {
  if (typeof size !== "number" || Number.isNaN(size)) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB"];
  let currentSize = size;
  let unitIndex = 0;

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex += 1;
  }

  const digits = currentSize >= 10 || unitIndex === 0 ? 0 : 1;
  return `${currentSize.toFixed(digits)} ${units[unitIndex]}`;
};

export interface CourseSummary {
  _id: string;
  title: string;
}

interface CreateStudyMaterialPayload {
  educatorID: string;
  title: string;
  description?: string;
  tags: string[];
  docs: File[];
  isCourseSpecific: boolean;
  courseId?: string;
}

const submitStudyMaterialEntry =
  createStudyMaterialEntry as unknown as (
    payload: CreateStudyMaterialPayload
  ) => Promise<unknown>;

interface AddStudyMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educatorId?: string;
  courses: CourseSummary[];
  onSuccess?: () => void;
}

export function AddStudyMaterialDialog({
  open,
  onOpenChange,
  educatorId,
  courses,
  onSuccess,
}: AddStudyMaterialDialogProps) {
  const [formState, setFormState] = useState({ title: "", description: "" });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [isCourseSpecific, setIsCourseSpecific] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const subjectFieldRef = useRef<HTMLDivElement | null>(null);
  const subjectDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isCourseSpecific) {
      setSelectedCourseId("");
      return;
    }

    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [isCourseSpecific, courses, selectedCourseId]);

  const resetForm = () => {
    setFormState({ title: "", description: "" });
    setSelectedSubjects([]);
    setShowSubjectDropdown(false);
    setSelectedFiles([]);
    setIsCourseSpecific(false);
    setSelectedCourseId("");
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleSubject = (subjectValue: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectValue)
        ? prev.filter((subject) => subject !== subjectValue)
        : prev.length >= 25
        ? (toast.error("You can select up to 25 subjects."), prev)
        : [...prev, subjectValue]
    );
  };

  useEffect(() => {
    if (!showSubjectDropdown) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        subjectFieldRef.current?.contains(target) ||
        subjectDropdownRef.current?.contains(target)
      ) {
        return;
      }
      setShowSubjectDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubjectDropdown]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (files.length > MAX_FILE_COUNT) {
      setFormError(`You can upload up to ${MAX_FILE_COUNT} files at once.`);
      return;
    }

    setSelectedFiles(files);
    setFormError(null);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!educatorId) {
      setFormError("Educator information is missing. Please re-login and try again.");
      return;
    }

    if (!formState.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!selectedFiles.length) {
      setFormError("Please upload at least one document.");
      return;
    }

    if (isCourseSpecific && !selectedCourseId) {
      setFormError("Please select a course for course-specific study material.");
      return;
    }

    const tags = selectedSubjects.slice(0, 25);

    try {
      setIsSubmitting(true);
      await submitStudyMaterialEntry({
        educatorID: educatorId,
        title: formState.title.trim(),
        description: formState.description.trim(),
        tags,
        isCourseSpecific,
        courseId: isCourseSpecific ? selectedCourseId : undefined,
        docs: selectedFiles,
      });

      toast.success("Study material added. The material is now available to your students.");

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to create study material");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Study Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="study-material-title">Title *</Label>
            <Input
              id="study-material-title"
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Enter a descriptive title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="study-material-description">Description</Label>
            <Textarea
              id="study-material-description"
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Provide context, usage instructions, or highlights"
              rows={4}
            />
          </div>

          <div className="space-y-2 relative">
            <Label>Subjects</Label>
            <div
              ref={subjectFieldRef}
              className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
              onClick={() => {
                if (isSubmitting) return;
                setShowSubjectDropdown((prev) => !prev);
              }}
            >
              {selectedSubjects.length ? (
                selectedSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="gap-1 capitalize">
                    {getSubjectLabel(subject)}
                    <button
                      type="button"
                      className="ml-1 rounded transition hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSubject(subject);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Select subjects</span>
              )}
            </div>
            {showSubjectDropdown && (
              <div
                ref={subjectDropdownRef}
                className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md p-2 max-h-56 overflow-y-auto"
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm capitalize hover:bg-accent"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSubject(option.value);
                    }}
                  >
                    <input
                      type="checkbox"
                      className="pointer-events-none"
                      readOnly
                      checked={selectedSubjects.includes(option.value)}
                    />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Select up to 25 subjects that best describe this material.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Course specific material</p>
              <p className="text-xs text-muted-foreground">
                Link the material to a particular course if needed.
              </p>
            </div>
            <Switch
              checked={isCourseSpecific}
              onCheckedChange={(checked) => {
                setIsCourseSpecific(checked);
                if (!checked) {
                  setSelectedCourseId("");
                }
              }}
            />
          </div>

          {isCourseSpecific && (
            <div className="space-y-2">
              <Label htmlFor="study-material-course">Assign Course *</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={courses.length === 0}
              >
                <SelectTrigger id="study-material-course">
                  <SelectValue
                    placeholder={
                      courses.length === 0 ? "No courses available" : "Select a course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  You have no courses yet. Create a course first to attach study material.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="study-material-docs">Upload Documents *</Label>
            <Input
              id="study-material-docs"
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <p className="text-xs text-muted-foreground">
              Upload up to {MAX_FILE_COUNT} PDF files (25 MB each maximum).
            </p>
            {selectedFiles.length > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium line-clamp-1">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
