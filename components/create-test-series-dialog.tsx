/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import {
  createTestSeries,
  getEducatorTests,
  getCoursesByIds,
  uploadImage,
} from "@/util/server";
import {
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSubjectDisplayOptions, subjectToDB } from "@/lib/subject-utils";

// Constants
const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  price: "",
  validity: "180",
  noOfTests: "0",
  subject: "",
  specialization: "",
  isCourseSpecific: false,
  courseId: "",
};

const SUBJECTS = getSubjectDisplayOptions();
const SPECIALIZATIONS = ["IIT-JEE", "NEET", "CBSE"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Interfaces
interface CreateTestSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeriesCreated?: () => void;
}

interface LiveTestSummary {
  _id: string;
  title: string;
  subject: string;
  specialization?: string;
  startDate?: string;
  duration?: number;
  description?: {
    short?: string;
    long?: string;
  };
}

interface Course {
  _id: string;
  title: string;
}

interface RawEducatorTest {
  _id: string;
  title: string;
  subjects?: string[];
  subject?: string;
  specialization?: string[] | string;
  startDate?: string;
  schedule?: {
    startDate?: string;
  };
  createdAt?: string;
  duration?: number;
  description?:
    | string
    | {
        short?: string;
        long?: string;
      };
}

export function CreateTestSeriesDialog({
  open,
  onOpenChange,
  onSeriesCreated,
}: CreateTestSeriesDialogProps) {
  const { educator, refreshEducator } = useAuth();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<LiveTestSummary[]>([]);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Data states
  const [availableTests, setAvailableTests] = useState<LiveTestSummary[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [fetchTestsError, setFetchTestsError] = useState<string | null>(null);

  // Update noOfTests when selectedTests changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      noOfTests: String(selectedTests.length),
    }));
  }, [selectedTests.length]);

  // Fetch available tests for step 2
  const fetchAvailableTests = useCallback(async () => {
    if (!educator?._id) return;

    try {
      setLoadingTests(true);
      setFetchTestsError(null);
      const response = await getEducatorTests(educator._id);
      const testsPayload = (response?.tests ??
        response?.data?.tests ??
        []) as RawEducatorTest[];
      const tests: LiveTestSummary[] = testsPayload.map((test) => {
        const normalizedSubject = Array.isArray(test.subjects)
          ? test.subjects[0]
          : test.subject || "";
        const normalizedSpecialization = Array.isArray(test.specialization)
          ? test.specialization[0]
          : test.specialization || "";

        return {
          _id: test._id,
          title: test.title,
          subject: normalizedSubject,
          specialization: normalizedSpecialization,
          startDate:
            test.startDate || test.schedule?.startDate || test.createdAt,
          duration: test.duration,
          description:
            typeof test.description === "string"
              ? { short: test.description }
              : test.description,
        };
      });
      setAvailableTests(tests);
    } catch (error) {
      console.error("Error fetching live tests:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      setFetchTestsError(
        apiError.response?.data?.message || "Failed to load live tests"
      );
    } finally {
      setLoadingTests(false);
    }
  }, [educator?._id]);

  // Fetch tests when step 2 is opened
  useEffect(() => {
    if (open && currentStep === 2) {
      fetchAvailableTests();
    }
  }, [open, currentStep, fetchAvailableTests]);

  // Fetch educator's courses
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

  // Handlers
  const handleAddTest = (test: LiveTestSummary) => {
    if (!selectedTests.some((t) => t._id === test._id)) {
      setSelectedTests((prev) => [...prev, test]);
    }
  };

  const handleRemoveTest = (testId: string) => {
    setSelectedTests((prev) => prev.filter((test) => test._id !== testId));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "--";
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedTests([]);
    setSelectedImage(null);
    setImagePreview(null);
    setCurrentStep(1);
  };

  const validateForm = (): boolean => {
    if (!educator?._id) {
      toast.error("Educator information missing. Please log in again");
      return false;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.subject ||
      !formData.specialization
    ) {
      toast.error("Please fill in all required fields");
      return false;
    }

    if (formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return false;
    }

    if (selectedTests.length === 0) {
      toast.error("Add at least one live test to create a series");
      return false;
    }

    const priceValue = Number(formData.price);
    const validityValue = Number(formData.validity);

    if (Number.isNaN(priceValue) || Number.isNaN(validityValue)) {
      toast.error("Please enter valid numeric values for price and validity");
      return false;
    }

    return true;
  };

  const prepareSubmissionData = (imageUrl?: string) => {
    const priceValue = Number(formData.price);
    const validityDays = Number(formData.validity);
    const selectedTestIds = selectedTests.map((test) => test._id);

    const validityDate = new Date();
    if (!Number.isNaN(validityDays) && validityDays > 0) {
      validityDate.setDate(validityDate.getDate() + validityDays);
    } else {
      validityDate.setDate(validityDate.getDate() + 180);
    }

    const validityISO = validityDate.toISOString();

    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
      educatorId: educator!._id,
      description: formData.description.trim(),
      specialization: [formData.specialization],
      subject: [subjectToDB(formData.subject)],
      price: priceValue,
      validity: validityISO,
      numberOfTests: selectedTestIds.length,
      tests: selectedTestIds,
      isCourseSpecific: formData.isCourseSpecific,
    };

    if (formData.isCourseSpecific && formData.courseId) {
      payload.courseId = formData.courseId;
    }

    if (imageUrl) {
      payload.image = imageUrl;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating test series...");

    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        const uploadResponse = await uploadImage(selectedImage, "test-series");
        const uploadedUrl = uploadResponse?.imageUrl || uploadResponse?.url;
        if (!uploadedUrl) {
          throw new Error(
            uploadResponse?.message || "Failed to upload banner image"
          );
        }
        imageUrl = uploadedUrl;
      }

      const submissionData = prepareSubmissionData(imageUrl);
      await createTestSeries(submissionData);
      await refreshEducator();

      toast.success("Test series created successfully!", { id: loadingToast });
      resetForm();
      onOpenChange(false);
      onSeriesCreated?.();
    } catch (error) {
      console.error("Error creating test series:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Failed to create test series",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Test Series Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter test series title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe what this series covers, structure, and outcomes."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Banner Image (Optional)</Label>
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Test series banner preview"
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload a banner image for your test series
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Supports JPG, PNG. Max size 5MB
              </p>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </span>
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization *</Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) =>
              setFormData({ ...formData, specialization: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="2500"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validity">Validity (days) *</Label>
          <Input
            id="validity"
            type="number"
            value={formData.validity}
            onChange={(e) =>
              setFormData({ ...formData, validity: e.target.value })
            }
            placeholder="180"
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseSpecific">Course Specific</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="courseSpecific"
              checked={formData.isCourseSpecific}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isCourseSpecific: checked })
              }
            />
            <Label htmlFor="courseSpecific" className="text-sm cursor-pointer">
              Link to course
            </Label>
          </div>
        </div>

        {formData.isCourseSpecific && (
          <div className="space-y-2">
            <Label htmlFor="courseId">Select Course *</Label>
            {loadingCourses ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading courses...
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
    </div>
  );

  const renderStep2 = () => {
    // Filter out already selected tests
    const selectableTests = availableTests.filter(
      (test) => !selectedTests.some((selected) => selected._id === test._id)
    );

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Selected Live Tests
              </h3>
              <p className="text-sm text-muted-foreground">
                These live tests will be bundled into this series.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedTests.length} selected
            </Badge>
          </div>

          {selectedTests.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No live tests added yet. Use the{" "}
                <span className="font-semibold">Add</span> button below to
                include tests from your live test library.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {selectedTests.map((test) => (
                <Card key={test._id} className="border-border">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                        {test.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="uppercase">
                          {test.subject}
                        </Badge>
                        {test.specialization && (
                          <Badge variant="outline">{test.specialization}</Badge>
                        )}
                        <span>{formatDateTime(test.startDate)}</span>
                        {typeof test.duration === "number" && (
                          <span>{test.duration} min</span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTest(test._id)}
                      aria-label={`Remove ${test.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  {test.description?.short && (
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {test.description.short}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Available Live Tests
              </h3>
              <p className="text-sm text-muted-foreground">
                Pick from the live tests you have already created on the Live
                Tests page.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchAvailableTests}
              disabled={loadingTests}
            >
              {loadingTests ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {fetchTestsError && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-4 text-sm text-destructive">
                {fetchTestsError}
              </CardContent>
            </Card>
          )}

          {loadingTests ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading live
              tests...
            </div>
          ) : selectableTests.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {selectableTests.map((test) => (
                <Card key={test._id} className="border-border justify-between">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                      {test.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="uppercase">
                        {test.subject}
                      </Badge>
                      {test.specialization && (
                        <Badge variant="outline">{test.specialization}</Badge>
                      )}
                      <span>{formatDateTime(test.startDate)}</span>
                      {typeof test.duration === "number" && (
                        <span>{test.duration} min</span>
                      )}
                    </div>
                  </CardHeader>
                  {test.description?.short && (
                    <CardContent className="pt-0 pb-2 text-sm text-muted-foreground">
                      {test.description.short}
                    </CardContent>
                  )}
                  <CardContent className="pt-0">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleAddTest(test)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No available live tests found. Create live tests on the Live
                Tests page, then return here to add them.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test Series</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 2:{" "}
            {currentStep === 1 ? "Basic Information" : "Build Tests"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 2 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Test Series"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
