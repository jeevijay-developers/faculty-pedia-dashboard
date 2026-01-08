"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
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
import {
  createCourse,
  uploadCourseIntroVideo,
  uploadImage,
  uploadPdf,
} from "@/util/server";
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
  const [maxStudents, setMaxStudents] = useState("100");
  const [introVideo, setIntroVideo] = useState("");
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);
  const [introVideoPreview, setIntroVideoPreview] = useState<string | null>(
    null
  );
  const [uploadingIntroVideo, setUploadingIntroVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videos, setVideos] = useState<{ title: string; link: string }[]>([
    { title: "", link: "" },
  ]);
  const [assets, setAssets] = useState<
    { title: string; file: File | null; link?: string }[]
  >([{ title: "", file: null }]);
  const [prerequisites, setPrerequisites] = useState("");
  const [language, setLanguage] = useState("english");
  const [classesPerWeek, setClassesPerWeek] = useState("");
  const [testFrequency, setTestFrequency] = useState("");
  const [classDuration, setClassDuration] = useState("");
  const [classTiming, setClassTiming] = useState("");

  useEffect(() => {
    return () => {
      if (introVideoPreview) {
        URL.revokeObjectURL(introVideoPreview);
      }
    };
  }, [introVideoPreview]);

  // Image State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Dropdown States
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);

  const [step, setStep] = useState(0);
  const steps = ["Basics", "Audience", "Media", "Features", "Content"];

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

  const toVimeoEmbedUrl = (url: string) => {
    if (!url) return "";
    // Already an embed/player URL
    if (url.includes("player.vimeo.com/video/")) return url;

    // Common watch/manage formats → extract the numeric id
    const idMatch = url.match(
      /vimeo\.com\/(?:video\/|manage\/videos\/)?([0-9]+)/
    );
    const videoId = idMatch?.[1];

    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  };

  const introVideoEmbedUrl = toVimeoEmbedUrl(introVideo);

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

  const handleIntroVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video size must be under 500MB");
      return;
    }

    setIntroVideoFile(file);
    setIntroVideoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    toast.success(`Selected: ${file.name}`);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleVideoChange = (
    index: number,
    field: "title" | "link",
    value: string
  ) => {
    setVideos((prev) =>
      prev.map((video, idx) =>
        idx === index ? { ...video, [field]: value } : video
      )
    );
  };

  const addVideoField = () => {
    setVideos((prev) => [...prev, { title: "", link: "" }]);
  };

  const handleAssetTitleChange = (index: number, value: string) => {
    setAssets((prev) =>
      prev.map((asset, idx) =>
        idx === index ? { ...asset, title: value } : asset
      )
    );
  };

  const handleAssetFileChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    if (!isPdf) {
      toast.error("Only PDF files are allowed for assets");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF size should be under 10MB");
      return;
    }

    setAssets((prev) =>
      prev.map((asset, idx) => (idx === index ? { ...asset, file } : asset))
    );
  };

  const addAssetField = () => {
    setAssets((prev) => [...prev, { title: "", file: null }]);
  };

  const removeAssetField = (index: number) => {
    setAssets((prev) => prev.filter((_, idx) => idx !== index));
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

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      if (!title.trim()) {
        toast.error("Course title is required");
        return false;
      }
      if (!aboutCourse.trim()) {
        toast.error("Please add a course description");
        return false;
      }
      if (!duration.trim()) {
        toast.error("Duration is required");
        return false;
      }
      if (!courseType) {
        toast.error("Select a course type");
        return false;
      }
      if (!startDate || !endDate || !validDate) {
        toast.error("Select start, end, and validity dates");
        return false;
      }
      if (!courseFee) {
        toast.error("Course fee is required");
        return false;
      }
    }
    if (currentStep === 1) {
      if (!selectedExams.length) {
        toast.error("Select at least one exam/specialization");
        return false;
      }
      if (!selectedClasses.length) {
        toast.error("Select at least one class");
        return false;
      }
      if (!subject) {
        toast.error("Select a subject");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!aboutCourse.trim()) {
        toast.error("Please add a course description");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!educator?._id) {
      toast.error("Educator information missing. Please log in again");
      return;
    }

    if (!validateStep(step)) return;
    if (!selectedExams.length) {
      toast.error("Select at least one exam/specialization");
      setStep(1);
      return;
    }
    if (!selectedClasses.length) {
      toast.error("Select at least one class");
      setStep(1);
      return;
    }
    if (!subject) {
      toast.error("Select a subject");
      setStep(1);
      return;
    }
    if (!courseFee) {
      toast.error("Course fee is required");
      setStep(0);
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

      const parsedPrerequisites = prerequisites
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const parsedVideos = videos
        .map((v, idx) => ({
          title: v.title.trim(),
          link: v.link.trim(),
          sequenceNumber: idx + 1,
        }))
        .filter((v) => v.title && v.link);

      const uploadedStudyMaterials = [] as Array<{
        title: string;
        link: string;
        fileType: "PDF";
        publicId?: string;
        resourceType?: string;
      }>;

      for (const asset of assets) {
        const assetTitle = asset.title.trim();
        if (!assetTitle) continue;

        if (asset.file) {
          const uploadResponse = await uploadPdf(asset.file);
          const assetUrl = uploadResponse?.fileUrl || uploadResponse?.url;
          if (!assetUrl) {
            throw new Error("PDF upload failed");
          }
          uploadedStudyMaterials.push({
            title: assetTitle,
            link: assetUrl,
            fileType: "PDF",
            publicId: uploadResponse?.publicId,
            resourceType: uploadResponse?.resourceType,
          });
        } else if (asset.link) {
          uploadedStudyMaterials.push({
            title: assetTitle,
            link: asset.link,
            fileType: "PDF",
          });
        }
      }

      const normalizedClassTiming = classTiming.trim();
      const normalizedIntroVideo = toVimeoEmbedUrl(introVideo.trim());

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
        videos: parsedVideos,
        ...(normalizedIntroVideo && { introVideo: normalizedIntroVideo }),
        videoTitle: videoTitle.trim(),
        studyMaterials: uploadedStudyMaterials,
        courseObjectives: selectedFeatures,
        prerequisites: parsedPrerequisites,
        language: language,
        certificateAvailable: false,
        maxStudents: Number(maxStudents) || 0,
        classesPerWeek: Number(classesPerWeek) || 0,
        testFrequency: Number(testFrequency) || 0,
        classDuration: Number(classDuration) || 0,
        ...(normalizedClassTiming && { classTiming: normalizedClassTiming }),
      };

      const created = await createCourse(coursePayload);
      const createdCourse =
        created?.course || created?.data?.course || created?.data || created;
      const createdCourseId = createdCourse?._id || createdCourse?.id;

      if (introVideoFile && createdCourseId) {
        try {
          setUploadingIntroVideo(true);
          const uploadResp = await uploadCourseIntroVideo(
            createdCourseId,
            introVideoFile
          );
          const uploadedUrl =
            uploadResp?.data?.introVideo ||
            uploadResp?.data?.embedUrl ||
            uploadResp?.introVideo;
          if (uploadedUrl) {
            setIntroVideo(toVimeoEmbedUrl(uploadedUrl));
          }
          toast.success("Intro video uploaded to Vimeo");
        } catch (err) {
          console.error("Intro video upload failed:", err);
          toast.error(
            err instanceof Error
              ? err.message
              : "Intro video upload failed. You can retry from edit."
          );
        } finally {
          setUploadingIntroVideo(false);
        }
      }

      await refreshEducator();
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
      setIntroVideoFile(null);
      setIntroVideoPreview(null);
      setUploadingIntroVideo(false);
      setVideoTitle("");
      setClassesPerWeek("");
      setTestFrequency("");
      setClassDuration("");
      setClassTiming("");
      setSelectedImage(null);
      setImagePreview(null);
      setAssets([{ title: "", file: null }]);
    } catch (error) {
      console.error("Error creating course:", error);
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Array<{ msg?: string }> };
        };
        message?: string;
      };

      const serverMessage =
        err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg;

      const message =
        serverMessage || err?.message || "Failed to create course";

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[98vh] min-h-[82vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Live Course</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new live course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2 flex-nowrap rounded-lg border bg-gradient-to-r from-muted/60 via-background to-muted/60 px-3 py-2 shadow-sm">
            {steps.map((label, idx) => {
              const isActive = idx === step;
              const isDone = idx < step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : isDone
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs ${
                      isActive ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className="w-6 border-t border-dashed border-muted" />
                  )}
                </div>
              );
            })}
          </div>

          {step === 0 && (
            <div className="grid gap-5 rounded-lg border bg-muted/20 p-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 months"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Label htmlFor="language">Language *</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Seat</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    placeholder="Max seats"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validDate">Validity Date *</Label>
                  <Input
                    id="validDate"
                    type="date"
                    value={validDate}
                    onChange={(e) => setValidDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="aboutCourse">About Course *</Label>
                <Textarea
                  id="aboutCourse"
                  value={aboutCourse}
                  onChange={(e) => setAboutCourse(e.target.value)}
                  placeholder="Course description..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border bg-muted/20 p-5 shadow-sm min-h-[360px]">
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
                          toggleSelection(
                            exam,
                            selectedExams,
                            setSelectedExams
                          );
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
                    <span className="text-muted-foreground">
                      Select classes
                    </span>
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
          )}

          {step === 2 && (
            <div className="grid gap-5 rounded-lg border bg-muted/20 p-5 shadow-sm">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoTitle">Video Title (optional)</Label>
                    <Input
                      id="videoTitle"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Video Title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introVideoFile">
                      Intro Video Upload (Vimeo)
                    </Label>
                    <Input
                      id="introVideoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleIntroVideoFileChange}
                    />
                    {introVideoFile && (
                      <span className="text-xs text-muted-foreground truncate">
                        {introVideoFile.name}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Optional. We will upload this to Vimeo right after the
                      course is created. Max 500MB. Uploading will replace the
                      current intro video.
                    </p>
                    {uploadingIntroVideo && (
                      <p className="text-xs text-primary font-medium">
                        Uploading intro video...
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {introVideoPreview ? (
                      <video
                        key={introVideoPreview}
                        src={introVideoPreview}
                        controls
                        className="h-full w-full object-contain bg-black"
                      />
                    ) : introVideoEmbedUrl ? (
                      <iframe
                        key={introVideoEmbedUrl}
                        src={`${introVideoEmbedUrl}${
                          introVideoEmbedUrl.includes("?") ? "&" : "?"
                        }title=0&byline=0&portrait=0`}
                        width="100%"
                        height="100%"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No intro video available yet
                      </span>
                    )}
                  </div>
                  {introVideoPreview && (
                    <p className="text-xs text-muted-foreground">
                      Previewing selected file. It will upload to Vimeo after
                      you create the course.
                    </p>
                  )}
                  {!introVideoPreview && introVideoEmbedUrl && (
                    <p className="text-xs text-muted-foreground">
                      Note: Newly uploaded videos may take 2-5 minutes to
                      process on Vimeo before they can be previewed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5 rounded-lg border bg-muted/20 p-5 shadow-sm">
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
                    <span className="text-muted-foreground">
                      Select features
                    </span>
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

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                    placeholder="One per line"
                    className="min-h-[140px]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-5 rounded-lg border bg-muted/20 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg">Videos</DialogTitle>
                  <DialogDescription className="mt-1">
                    Add video title and paste the YouTube (unlisted) link for
                    this course.
                  </DialogDescription>
                </div>
                <Button type="button" variant="outline" onClick={addVideoField}>
                  Add Videos
                </Button>
              </div>

              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border bg-background p-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`video-title-${index}`}>
                        Video Title
                      </Label>
                      <Input
                        id={`video-title-${index}`}
                        value={video.title}
                        onChange={(e) =>
                          handleVideoChange(index, "title", e.target.value)
                        }
                        placeholder="Enter video title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`video-link-${index}`}>
                        Video Link (YouTube)
                      </Label>
                      <Input
                        id={`video-link-${index}`}
                        value={video.link}
                        onChange={(e) =>
                          handleVideoChange(index, "link", e.target.value)
                        }
                        placeholder="YouTube unlisted link (https://youtu.be/{id})"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg">Assets (PDF)</DialogTitle>
                    <DialogDescription className="mt-1">
                      Upload supporting PDFs students will see in the course
                      panel.
                    </DialogDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAssetField}
                  >
                    Add Asset
                  </Button>
                </div>

                <div className="space-y-4">
                  {assets.map((asset, index) => (
                    <div
                      key={`asset-${index}`}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border bg-background p-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`asset-title-${index}`}>
                          Asset Title
                        </Label>
                        <Input
                          id={`asset-title-${index}`}
                          value={asset.title}
                          onChange={(e) =>
                            handleAssetTitleChange(index, e.target.value)
                          }
                          placeholder="e.g. Mechanics Formula Sheet"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`asset-file-${index}`}>PDF File</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id={`asset-file-${index}`}
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleAssetFileChange(index, e)}
                          />
                          {asset.file && (
                            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                              {asset.file.name}
                            </span>
                          )}
                          {assets.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeAssetField(index)}
                            >
                              <MdDelete className="text-red-700 size-5" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          PDF only. Max size per course upload: 5MB.
                        </p>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No assets added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          {step < steps.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Course"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
