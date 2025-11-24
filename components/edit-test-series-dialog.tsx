/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import {
  updateTestSeries,
  getCoursesByIds,
  updateTestSeriesImage,
} from "@/util/server";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getSubjectDisplayOptions,
  subjectToDB,
  subjectToDisplay,
} from "@/lib/subject-utils";

interface DescriptionContent {
  short?: string;
  shortDesc?: string;
  long?: string;
  longDesc?: string;
}

interface CourseOption {
  _id: string;
  title: string;
}

interface TestSeries {
  _id: string;
  title: string;
  description?: unknown;
  price?: number | string;
  validity?: number | string;
  image?: string | { url?: string } | null;
  subject?: string | string[];
  specialization?: string | string[];
  isCourseSpecific?: boolean;
  courseId?: string | { _id: string };
  createdAt?: string;
}

interface EditTestSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSeries: TestSeries | null;
  onTestSeriesUpdated: () => void;
}

type FormState = {
  title: string;
  description: string;
  price: string;
  validity: string;
  subject: string;
  specialization: string;
  isCourseSpecific: boolean;
  courseId: string;
};

const SUBJECT_OPTIONS = getSubjectDisplayOptions();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const INITIAL_FORM_STATE: FormState = {
  title: "",
  description: "",
  price: "",
  validity: "",
  subject: "",
  specialization: "",
  isCourseSpecific: false,
  courseId: "",
};

const resolveImageUrl = (image?: TestSeries["image"]) => {
  if (!image) {
    return null;
  }

  if (typeof image === "string" && image.trim().length > 0) {
    return image;
  }

  if (typeof image === "object" && image !== null) {
    const possibleUrl = (image as { url?: string }).url;
    if (possibleUrl && possibleUrl.trim().length > 0) {
      return possibleUrl;
    }
  }

  return null;
};

export function EditTestSeriesDialog({
  open,
  onOpenChange,
  testSeries,
  onTestSeriesUpdated,
}: EditTestSeriesDialogProps) {
  const { educator } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!open || !educator?.courses?.length) {
        setAvailableCourses([]);
        return;
      }

      try {
        setLoadingCourses(true);
        const courses = await getCoursesByIds(educator.courses);
        setAvailableCourses(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [open, educator?.courses]);

  useEffect(() => {
    if (!testSeries) {
      setFormData(INITIAL_FORM_STATE);
      setCurrentImage(null);
      return;
    }

    const parseDescription = (description?: unknown) => {
      if (!description) {
        return "";
      }

      if (typeof description === "string") {
        try {
          const parsed = JSON.parse(description);
          if (parsed && typeof parsed === "object") {
            const typed = parsed as DescriptionContent;
            return (
              typed.long ||
              typed.longDesc ||
              typed.short ||
              typed.shortDesc ||
              description
            );
          }
          return description;
        } catch {
          return description;
        }
      }

      if (typeof description === "object") {
        const typedDescription = description as DescriptionContent;
        return (
          typedDescription.long ||
          typedDescription.longDesc ||
          typedDescription.short ||
          typedDescription.shortDesc ||
          ""
        );
      }

      return "";
    };

    const computeValidityDays = () => {
      if (typeof testSeries.validity === "number") {
        return testSeries.validity;
      }

      if (typeof testSeries.validity === "string") {
        const validityDate = new Date(testSeries.validity);
        if (!Number.isNaN(validityDate.getTime())) {
          const baseDate = testSeries.createdAt
            ? new Date(testSeries.createdAt)
            : new Date();
          if (!Number.isNaN(baseDate.getTime())) {
            const diffDays = Math.ceil(
              (validityDate.getTime() - baseDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return diffDays > 0 ? diffDays : 1;
          }

          const diffDays = Math.ceil(
            (validityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          return diffDays > 0 ? diffDays : 1;
        }
      }

      return 180;
    };

    const normalizedSubject = Array.isArray(testSeries.subject)
      ? testSeries.subject[0]
      : testSeries.subject;

    const normalizedSpecialization = Array.isArray(testSeries.specialization)
      ? testSeries.specialization[0]
      : testSeries.specialization;

    const parsedDescription = parseDescription(testSeries.description);
    setCurrentImage(resolveImageUrl(testSeries.image));

    setFormData({
      title: testSeries.title || "",
      description: parsedDescription,
      price: String(testSeries.price ?? 0),
      validity: String(computeValidityDays()),
      subject: normalizedSubject ? subjectToDisplay(normalizedSubject) : "",
      specialization: normalizedSpecialization?.toString() || "",
      isCourseSpecific: Boolean(testSeries.isCourseSpecific),
      courseId:
        typeof testSeries.courseId === "object" && testSeries.courseId !== null
          ? testSeries.courseId._id
          : (testSeries.courseId as string) || "",
    });
  }, [testSeries]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!testSeries) {
      toast.error("No test series selected");
      return;
    }

    if (formData.title.trim().length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }

    if (formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    if (Number(formData.price) < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    if (Number(formData.validity) < 1) {
      toast.error("Validity must be at least 1 day");
      return;
    }

    if (formData.isCourseSpecific && !formData.courseId) {
      toast.error("Please select a course for course-specific series");
      return;
    }

    setIsSubmitting(true);

    try {
      const days = Number(formData.validity);
      let validityBase = testSeries.createdAt
        ? new Date(testSeries.createdAt)
        : new Date();

      if (Number.isNaN(validityBase.getTime())) {
        validityBase = new Date();
      }

      const safeDays = Number.isNaN(days) || days < 1 ? 1 : Math.floor(days);
      validityBase.setDate(validityBase.getDate() + safeDays);
      const validityISO = validityBase.toISOString();

      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        validity: validityISO,
        subject: [subjectToDB(formData.subject)],
        specialization: [formData.specialization],
        isCourseSpecific: formData.isCourseSpecific,
      };

      if (formData.isCourseSpecific && formData.courseId) {
        payload.courseId = formData.courseId;
      } else {
        payload.courseId = null;
      }

      await updateTestSeries(testSeries._id, payload);
      toast.success("Test series updated successfully!");
      onTestSeriesUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating test series:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Failed to update test series"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagePickerClick = () => {
    if (isImageUploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleBannerUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 5MB");
      event.target.value = "";
      return;
    }

    if (!testSeries?._id) {
      toast.error("Missing test series context");
      event.target.value = "";
      return;
    }

    setIsImageUploading(true);
    try {
      const response = await updateTestSeriesImage(testSeries._id, file);
      const updatedUrl =
        response?.imageUrl || response?.testSeries?.image || null;

      if (updatedUrl) {
        setCurrentImage(updatedUrl);
      }

      toast.success("Banner image updated successfully");
      onTestSeriesUpdated();
    } catch (error) {
      console.error("Failed to update banner image", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Failed to update banner image"
      );
    } finally {
      setIsImageUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Series</DialogTitle>
          <DialogDescription>
            Update your test series details. Tests included in the series cannot
            be changed from here.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-40 h-28 rounded-lg border border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Test series banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground text-center px-2">
                    No banner uploaded
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImagePickerClick}
                  disabled={isImageUploading || !testSeries}
                >
                  {isImageUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Change Image"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WEBP up to 5MB. Changes save immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              placeholder="Enter test series title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData({ ...formData, subject: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    specialization: event.target.value,
                  })
                }
                placeholder="e.g., NEET, JEE"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              placeholder="Describe the test series (at least 20 characters)"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/2000
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(event) =>
                  setFormData({ ...formData, price: event.target.value })
                }
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity">Validity (days) *</Label>
              <Input
                id="validity"
                type="number"
                min="1"
                value={formData.validity}
                onChange={(event) =>
                  setFormData({ ...formData, validity: event.target.value })
                }
                placeholder="180"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="courseSpecific"
                checked={formData.isCourseSpecific}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isCourseSpecific: checked })
                }
              />
              <Label htmlFor="courseSpecific" className="cursor-pointer">
                Course Specific
              </Label>
            </div>
            {formData.isCourseSpecific && (
              <div className="space-y-2">
                <Label htmlFor="courseId">Select Course *</Label>
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                    courses...
                  </div>
                ) : availableCourses.length > 0 ? (
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, courseId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                    No courses available. Create a course first.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Test Series"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
