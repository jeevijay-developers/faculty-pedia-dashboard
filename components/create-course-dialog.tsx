"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { X, Upload, ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createCourse, uploadImage } from "@/util/server";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCourseDialog({
  open,
  onOpenChange,
}: CreateCourseDialogProps) {
  const { educator, refreshEducator } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [courseType, setCourseType] = useState<"one-to-all" | "one-to-one">(
    "one-to-all"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [courseFee, setCourseFee] = useState("");
  const [validDate, setValidDate] = useState("");
  const [introVideo, setIntroVideo] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [classesPerWeek, setClassesPerWeek] = useState("");
  const [testFrequency, setTestFrequency] = useState("");
  const [classDuration, setClassDuration] = useState("");
  const [classTiming, setClassTiming] = useState("");

  // Image State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Dropdown States
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);

  const examDropdownRef = useRef<HTMLDivElement>(null);
  const classDropdownRef = useRef<HTMLDivElement>(null);
  const featureDropdownRef = useRef<HTMLDivElement>(null);

  const exams = ["IIT-JEE", "NEET", "CBSE"];
  const classes = [
    "class-6th",
    "class-7th",
    "class-8th",
    "class-9th",
    "class-10th",
    "class-11th",
    "class-12th",
    "dropper",
  ];
  const features = [
    "Live Class",
    "Study material (PDF)",
    "Online Tests",
    "Recording of live classes",
    "Doubt support",
    "Printed study material",
  ];

  const formatClassLabel = (cls: string) => {
    if (!cls) return "";
    if (cls === "dropper") return "Dropper";
    const normalized = cls.replace("class-", "");
    return `Class ${normalized}`;
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const toggleSelection = (
    item: string,
    currentSelection: string[],
    setSelection: (val: string[]) => void
  ) => {
    if (currentSelection.includes(item)) {
      setSelection(currentSelection.filter((i) => i !== item));
    } else {
      setSelection([...currentSelection, item]);
    }
  };

  const handleSubmit = async () => {
    if (!educator?._id) {
      toast.error("Educator information missing. Please log in again");
      return;
    }

    if (!title.trim()) {
      toast.error("Course title is required");
      return;
    }
    if (!aboutCourse.trim()) {
      toast.error("Please add a course description");
      return;
    }
    if (!duration.trim()) {
      toast.error("Duration is required");
      return;
    }
    if (!courseType) {
      toast.error("Select a course type");
      return;
    }
    if (!startDate || !endDate || !validDate) {
      toast.error("Select start, end, and validity dates");
      return;
    }
    if (!selectedExams.length) {
      toast.error("Select at least one exam/specialization");
      return;
    }
    if (!selectedClasses.length) {
      toast.error("Select at least one class");
      return;
    }
    if (!subject) {
      toast.error("Select a subject");
      return;
    }
    if (!courseFee) {
      toast.error("Course fee is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating course...");

    try {
      let imageUrl = "";
      if (selectedImage) {
        const uploadResponse = await uploadImage(selectedImage);
        if (uploadResponse.success) {
          imageUrl = uploadResponse.imageUrl;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const coursePayload = {
        title: title.trim(),
        description: aboutCourse.trim(),
        courseType,
        educatorID: educator._id,
        specialization: selectedExams,
        class: selectedClasses,
        subject: [subject],
        fees: Number(courseFee),
        discount: 0,
        image: imageUrl,
        courseThumbnail: imageUrl,
        startDate,
        endDate,
        courseDuration: duration.trim(),
        validDate,
        videos: [],
        introVideo,
        studyMaterials: [],
        courseObjectives: selectedFeatures,
        prerequisites: [],
        language: "English",
        certificateAvailable: false,
        maxStudents: 100,
      };

      await createCourse(coursePayload);
      await refreshEducator();

      toast.success("Course created successfully!", { id: loadingToast });
      onOpenChange(false);

      // Reset form
      setTitle("");
      setDuration("");
      setCourseType("one-to-all");
      setStartDate("");
      setEndDate("");
      setSelectedExams([]);
      setSelectedClasses([]);
      setSubject("");
      setAboutCourse("");
      setSelectedFeatures([]);
      setCourseFee("");
      setValidDate("");
      setIntroVideo("");
      setVideoTitle("");
      setClassesPerWeek("");
      setTestFrequency("");
      setClassDuration("");
      setClassTiming("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating course:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create course";
      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Live Course</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new live course.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Course Banner</Label>
            <div className="space-y-3">
              <div className="relative w-full h-60 rounded-md border-2 border-dashed bg-muted/40 overflow-hidden">
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      sizes="100vw"
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-60 w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                    <p className="text-sm">Upload a banner image</p>
                    <p className="text-xs text-muted-foreground">
                      Recommended size 1200x400px
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Label>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveImage}
                  >
                    <MdDelete className="text-red-700 size-5" />
                  </Button>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Max 5MB. JPG, PNG, WebP.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course Title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseType">Course Type *</Label>
              <Select
                value={courseType}
                onValueChange={(value) =>
                  setCourseType(value as "one-to-all" | "one-to-one")
                }
              >
                <SelectTrigger id="courseType">
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-to-all">One To All</SelectItem>
                  <SelectItem value="one-to-one">One To One</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 months"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exams */}
            <div className="space-y-2 relative" ref={examDropdownRef}>
              <Label>For Exam</Label>
              <div
                className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
                onClick={() => setShowExamDropdown(!showExamDropdown)}
              >
                {selectedExams.length > 0 ? (
                  selectedExams.map((exam) => (
                    <Badge
                      key={exam}
                      variant="secondary"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(exam, selectedExams, setSelectedExams);
                      }}
                    >
                      {exam} <X className="h-3 w-3" />
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">Select exams</span>
                )}
              </div>
              {showExamDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md p-2">
                  {exams.map((exam) => (
                    <div
                      key={exam}
                      className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                      onClick={() =>
                        toggleSelection(exam, selectedExams, setSelectedExams)
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedExams.includes(exam)}
                        readOnly
                      />
                      <span>{exam}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Classes */}
            <div className="space-y-2 relative" ref={classDropdownRef}>
              <Label>For Class</Label>
              <div
                className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
              >
                {selectedClasses.length > 0 ? (
                  selectedClasses.map((cls) => (
                    <Badge
                      key={cls}
                      variant="secondary"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(
                          cls,
                          selectedClasses,
                          setSelectedClasses
                        );
                      }}
                    >
                      {formatClassLabel(cls)} <X className="h-3 w-3" />
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">Select classes</span>
                )}
              </div>
              {showClassDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md p-2 max-h-60 overflow-y-auto">
                  {classes.map((cls) => (
                    <div
                      key={cls}
                      className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                      onClick={() =>
                        toggleSelection(
                          cls,
                          selectedClasses,
                          setSelectedClasses
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls)}
                        readOnly
                      />
                      <span>{formatClassLabel(cls)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutCourse">About Course</Label>
            <Textarea
              id="aboutCourse"
              value={aboutCourse}
              onChange={(e) => setAboutCourse(e.target.value)}
              placeholder="Course description..."
            />
          </div>

          {/* Features */}
          <div className="space-y-2 relative" ref={featureDropdownRef}>
            <Label>Course Features</Label>
            <div
              className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
              onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
            >
              {selectedFeatures.length > 0 ? (
                selectedFeatures.map((feat) => (
                  <Badge
                    key={feat}
                    variant="secondary"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(
                        feat,
                        selectedFeatures,
                        setSelectedFeatures
                      );
                    }}
                  >
                    {feat} <X className="h-3 w-3" />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Select features</span>
              )}
            </div>
            {showFeatureDropdown && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md p-2 max-h-60 overflow-y-auto">
                {features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                    onClick={() =>
                      toggleSelection(
                        feat,
                        selectedFeatures,
                        setSelectedFeatures
                      )
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feat)}
                      readOnly
                    />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseFee">Course Fee *</Label>
              <Input
                id="courseFee"
                type="number"
                value={courseFee}
                onChange={(e) => setCourseFee(e.target.value)}
                placeholder="Amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validDate">Validity Date</Label>
              <Input
                id="validDate"
                type="date"
                value={validDate}
                onChange={(e) => setValidDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="introVideo">Intro Video URL</Label>
              <Input
                id="introVideo"
                value={introVideo}
                onChange={(e) => setIntroVideo(e.target.value)}
                placeholder="YouTube Link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoTitle">Video Title</Label>
              <Input
                id="videoTitle"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Video Title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classesPerWeek">Classes Per Week</Label>
              <Input
                id="classesPerWeek"
                type="number"
                value={classesPerWeek}
                onChange={(e) => setClassesPerWeek(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testFrequency">Test Frequency (Per Week)</Label>
              <Input
                id="testFrequency"
                type="number"
                value={testFrequency}
                onChange={(e) => setTestFrequency(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classDuration">Class Duration (Hours)</Label>
              <Input
                id="classDuration"
                type="number"
                value={classDuration}
                onChange={(e) => setClassDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classTiming">Class Timing</Label>
              <Input
                id="classTiming"
                type="time"
                value={classTiming}
                onChange={(e) => setClassTiming(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
