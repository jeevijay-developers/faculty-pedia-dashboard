"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
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
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  updateCourse,
  uploadCourseIntroVideo,
  uploadImage,
  uploadPdf,
} from "@/util/server";

type CourseStudyMaterial = {
  title?: string;
  link?: string;
  url?: string;
  publicId?: string;
  resourceType?: string;
};

type CourseShape = {
  _id?: string;
  title?: string;
  courseDuration?: string | number;
  classDuration?: string | number;
  courseType?: string;
  startDate?: string;
  endDate?: string;
  validDate?: string;
  validity?: string;
  specialization?: string[] | string;
  class?: string[] | string;
  subject?: string[] | string | { name?: string } | null;
  description?: string | { longDesc?: string; shortDesc?: string } | null;
  courseObjectives?: string[];
  fees?: number;
  fee?: number;
  maxStudents?: number;
  seatLimit?: number;
  introVideo?: string;
  video?: { intro?: string; lessons?: Array<{ title?: string; link?: string }> };
  videoTitle?: string;
  videos?: Array<{ title?: string; link?: string; url?: string }>;
  studyMaterials?: CourseStudyMaterial[];
  prerequisites?: string[] | string;
  language?: string;
  classesPerWeek?: number;
  classPerWeek?: number;
  testFrequency?: number;
  testsPerWeek?: number;
  classTiming?: string;
  timing?: string;
  image?: string | { url?: string };
  courseThumbnail?: string;
  educatorID?: string;
  certificateAvailable?: boolean;
};

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseShape | null;
  onCourseUpdated: () => void;
}

const normalizeCourseType = (type?: string | null) => {
  if (type === "one-to-one" || type === "one-to-all") return type;
  return "one-to-all";
};

const extractSubject = (subject: CourseShape["subject"]) => {
  if (!subject) return "";
  if (Array.isArray(subject)) return subject[0] || "";
  if (typeof subject === "string") return subject;
  if (typeof subject === "object" && subject?.name) return subject.name;
  return "";
};

const formatClassLabel = (cls: string) => {
  if (!cls) return "";
  if (cls === "dropper") return "Dropper";
  const normalized = cls.replace("class-", "");
  return `Class ${normalized}`;
};

const extractClasses = (course: CourseShape | null) => {
  if (!course) return [] as string[];
  const raw = (course as { class?: string[] | string }).class;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return [raw];
  return [] as string[];
};

const extractVideos = (course: CourseShape | null) => {
  if (!course) return [{ title: "", link: "" }];
  const videos = Array.isArray(course.videos) ? course.videos : [];
  const mapped = videos
    .map((v) => ({ title: v.title || "", link: v.link || v.url || "" }))
    .filter((v: { title: string; link: string }) => v.title || v.link);

  return mapped.length ? mapped : [{ title: "", link: "" }];
};

const extractDescription = (description: CourseShape["description"]) => {
  if (!description) return "";
  if (typeof description === "string") return description;
  return description.longDesc || description.shortDesc || "";
};

const extractImageUrl = (course: CourseShape | null) => {
  if (!course) return "";
  if (course.courseThumbnail) return course.courseThumbnail;
  if (typeof course.image === "string") return course.image;
  if (course.image?.url) return course.image.url;
  return "";
};

const extractVideoTitle = (course: CourseShape | null) => {
  if (!course) return "";
  if (course.videoTitle) return course.videoTitle;
  const lessonTitle =
    course.videos?.[0]?.title || course.video?.lessons?.[0]?.title;
  return lessonTitle || "";
};

export function EditCourseDialog({
  open,
  onOpenChange,
  course,
  onCourseUpdated,
}: EditCourseDialogProps) {
  const { educator } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (mirrors create-course-dialog)
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
  const [uploadingIntroVideo, setUploadingIntroVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videos, setVideos] = useState<{ title: string; link: string }[]>([
    { title: "", link: "" },
  ]);
  const [assets, setAssets] = useState<
    { title: string; file: File | null; link?: string; publicId?: string; resourceType?: string }[]
  >([{ title: "", file: null }]);
  const [prerequisites, setPrerequisites] = useState("");
  const [language, setLanguage] = useState("english");
  const [classesPerWeek, setClassesPerWeek] = useState("");
  const [testFrequency, setTestFrequency] = useState("");
  const [classDuration, setClassDuration] = useState("");
  const [classTiming, setClassTiming] = useState("");

  // Image State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Dropdown States
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);

  const [step, setStep] = useState(0);
  const steps = ["Basics", "Audience", "Media", "Features"];

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
    if (url.includes("player.vimeo.com/video/")) return url;
    const idMatch = url.match(
      /vimeo\.com\/(?:video\/|manage\/videos\/)?([0-9]+)/
    );
    const videoId = idMatch?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  };

  const introVideoEmbedUrl = toVimeoEmbedUrl(introVideo);

  useEffect(() => {
    if (!course || !open) return;

    setTitle(course.title || "");
    setDuration(
      course.courseDuration?.toString() ||
        course.classDuration?.toString() ||
        ""
    );
    setCourseType(
      normalizeCourseType(course.courseType) as "one-to-all" | "one-to-one"
    );
    setStartDate(course.startDate ? course.startDate.split("T")[0] : "");
    setEndDate(course.endDate ? course.endDate.split("T")[0] : "");
    setValidDate(course.validDate || course.validity || "");
    setSelectedExams(
      Array.isArray(course.specialization)
        ? course.specialization
        : course.specialization
        ? [course.specialization]
        : []
    );
    setSelectedClasses(extractClasses(course));
    setSubject(extractSubject(course.subject));
    setAboutCourse(extractDescription(course.description));
    setSelectedFeatures(
      Array.isArray(course.courseObjectives) ? course.courseObjectives : []
    );
    setCourseFee(course.fees?.toString() || course.fee?.toString() || "");
    setMaxStudents((course.maxStudents || course.seatLimit || "").toString());
    setIntroVideo(
      toVimeoEmbedUrl(course.introVideo || course.video?.intro || "")
    );
    setIntroVideoFile(null);
    setUploadingIntroVideo(false);
    setVideoTitle(extractVideoTitle(course));
    setVideos(extractVideos(course));
    const initialAssets = Array.isArray(course.studyMaterials)
      ? course.studyMaterials.map((m: CourseStudyMaterial) => ({
          title: m?.title || "",
          file: null,
          link: m?.link || m?.url || "",
          publicId: m?.publicId,
          resourceType: m?.resourceType,
        }))
      : [{ title: "", file: null }];
    setAssets(
      initialAssets.length ? initialAssets : [{ title: "", file: null }]
    );
    setPrerequisites(
      Array.isArray(course.prerequisites)
        ? course.prerequisites.join("\n")
        : course.prerequisites || ""
    );
    setLanguage(course.language || "english");
    setClassesPerWeek(
      course.classesPerWeek?.toString() || course.classPerWeek?.toString() || ""
    );
    setTestFrequency(
      course.testFrequency?.toString() || course.testsPerWeek?.toString() || ""
    );
    setClassDuration(
      course.classDuration?.toString() ||
        course.courseDuration?.toString() ||
        ""
    );
    setClassTiming(course.classTiming || course.timing || "");

    const url = extractImageUrl(course);
    setImageUrl(url);
    setImagePreview(url || null);
    setSelectedImage(null);
    setStep(0);
  }, [course, open]);

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
    toast.success(`Selected: ${file.name}`);
  };

  const handleUploadIntroVideo = async () => {
    if (!course?._id) {
      toast.error("Course ID missing");
      return;
    }

    if (!introVideoFile) {
      toast.error("Select a video file first");
      return;
    }

    setUploadingIntroVideo(true);
    const toastId = toast.loading("Uploading intro video to Vimeo...");

    try {
      const uploadResp = await uploadCourseIntroVideo(
        course._id,
        introVideoFile
      );
      const uploadedUrl =
        uploadResp?.data?.introVideo ||
        uploadResp?.data?.embedUrl ||
        uploadResp?.introVideo;
      if (uploadedUrl) {
        setIntroVideo(toVimeoEmbedUrl(uploadedUrl));
      }
      toast.success("Intro video uploaded", { id: toastId });
      setIntroVideoFile(null);
    } catch (err) {
      console.error("Intro video upload failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload intro video",
        { id: toastId }
      );
    } finally {
      setUploadingIntroVideo(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl("");
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
    if (!course?._id) {
      toast.error("Course information missing");
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
    const loadingToast = toast.loading("Updating course...");

    try {
      let finalImageUrl = imageUrl;
      if (selectedImage) {
        const uploadResponse = await uploadImage(selectedImage);
        if (uploadResponse.success) {
          finalImageUrl = uploadResponse.imageUrl;
          setImageUrl(uploadResponse.imageUrl);
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
            ...(asset.publicId ? { publicId: asset.publicId } : {}),
            ...(asset.resourceType ? { resourceType: asset.resourceType } : {}),
          });
        }
      }

      const normalizedClassTiming = classTiming.trim();
      const normalizedIntroVideo = toVimeoEmbedUrl(introVideo);

      const coursePayload = {
        title: title.trim(),
        description: aboutCourse.trim(),
        courseType,
        educatorID: educator?._id || course.educatorID,
        specialization: selectedExams,
        class: selectedClasses,
        subject: subject ? [subject] : [],
        fees: Number(courseFee),
        discount: 0,
        image: finalImageUrl,
        courseThumbnail: finalImageUrl,
        startDate,
        endDate,
        courseDuration: duration.trim(),
        validDate,
        videos: parsedVideos,
        introVideo: normalizedIntroVideo,
        videoTitle: videoTitle.trim(),
        studyMaterials: uploadedStudyMaterials,
        courseObjectives: selectedFeatures,
        prerequisites: parsedPrerequisites,
        language,
        certificateAvailable: course?.certificateAvailable || false,
        maxStudents: Number(maxStudents) || 0,
        classesPerWeek: Number(classesPerWeek) || 0,
        testFrequency: Number(testFrequency) || 0,
        classDuration: Number(classDuration) || 0,
        ...(normalizedClassTiming && { classTiming: normalizedClassTiming }),
      };

      await updateCourse(course._id, coursePayload);
      toast.success("Course updated successfully!", { id: loadingToast });
      onCourseUpdated();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error updating course:", error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to update course";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[98vh] min-h-[82vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update your course details.</DialogDescription>
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

              <div
                className={`grid grid-cols-1 ${
                  courseType === "one-to-one" ? "md:grid-cols-3" : "md:grid-cols-4"
                } gap-4`}
              >
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
                {courseType !== "one-to-one" && (
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
                )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classesPerWeek">Classes per Week</Label>
                  <Input
                    id="classesPerWeek"
                    type="number"
                    min="0"
                    value={classesPerWeek}
                    onChange={(e) => setClassesPerWeek(e.target.value)}
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classDuration">Class Duration (minutes)</Label>
                  <Input
                    id="classDuration"
                    type="number"
                    min="0"
                    value={classDuration}
                    onChange={(e) => setClassDuration(e.target.value)}
                    placeholder="e.g. 90"
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
                      htmlFor="image-upload-edit"
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
                      id="image-upload-edit"
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
                      Max 100MB. Uploading will replace the current intro video.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUploadIntroVideo}
                      disabled={uploadingIntroVideo}
                      className="w-full"
                    >
                      {uploadingIntroVideo ? "Uploading..." : "Upload video"}
                    </Button>
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
                    {introVideoEmbedUrl ? (
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
                  {introVideoEmbedUrl && (
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
              {isSubmitting ? "Updating..." : "Update Course"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
