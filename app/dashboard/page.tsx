"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BookOpen,
  FileQuestion,
  TestTube,
  Video,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
  Save,
  Upload,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Share2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { Educator as EducatorType } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import {
  getCurrentEducator,
  updateEducatorBasicInfo,
  updateEducatorImage,
  updateEducatorWorkExperience,
  updateEducatorQualifications,
  updateEducatorSocialLinks,
  updateEducatorSpecializationAndExperience,
  uploadEducatorIntroVideo,
  getEducatorIntroVideoStatus,
  getCoursesByEducator,
  getEducatorWebinars,
} from "@/util/server";

const ensureArray = (value: unknown) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

const toTitleCase = (value: string) =>
  value.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

const getArrayCount = (value: unknown): number =>
  Array.isArray(value) ? value.length : 0;

const normalizeVimeoEmbedUrl = (value: string | undefined | null) => {
  if (!value) return "";
  const trimmed = value.trim();

  const playerMatch = trimmed.match(
    /player\.vimeo\.com\/video\/(\d+)(?:.*?[?&]h=([\w-]+))?/i
  );
  if (playerMatch) {
    const [, id, hash] = playerMatch;
    return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
  }

  const linkMatch = trimmed.match(
    /vimeo\.com\/(?:video\/|videos\/)?(\d+)(?:.*?[?&]h=([\w-]+))?/i
  );
  if (linkMatch) {
    const [, id, hash] = linkMatch;
    return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
  }

  const idOnly = trimmed.match(/^(\d+)$/);
  if (idOnly) {
    return `https://player.vimeo.com/video/${idOnly[1]}`;
  }

  return trimmed;
};

const SPECIALIZATION_OPTIONS = ["IIT-JEE", "NEET", "CBSE"] as const;

const SUBJECT_OPTIONS = [
  { label: "Biology", value: "biology" },
  { label: "Physics", value: "physics" },
  { label: "Mathematics", value: "mathematics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
];

const CLASS_OPTIONS = [
  { label: "Class 6", value: "class-6th" },
  { label: "Class 7", value: "class-7th" },
  { label: "Class 8", value: "class-8th" },
  { label: "Class 9", value: "class-9th" },
  { label: "Class 10", value: "class-10th" },
  { label: "Class 11", value: "class-11th" },
  { label: "Class 12", value: "class-12th" },
  { label: "Dropper", value: "dropper" },
];

const CLASS_VALUE_TO_LABEL = CLASS_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {}
);

const CLASS_LABEL_TO_VALUE = CLASS_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.label.toLowerCase()] = option.value;
    acc[option.value.toLowerCase()] = option.value;
    return acc;
  },
  {}
);

const SUBJECT_VALUE_TO_LABEL = SUBJECT_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {}
);

const SUBJECT_LABEL_TO_VALUE = SUBJECT_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.label.toLowerCase()] = option.value;
    acc[option.value.toLowerCase()] = option.value;
    return acc;
  },
  {}
);

const formatClassLabel = (value: string) =>
  CLASS_VALUE_TO_LABEL[value] ||
  toTitleCase(value.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim());

const formatClassList = (values: string[]) =>
  values.map((value) => formatClassLabel(value)).join(", ");

const normalizeClassValues = (values: string[]) =>
  values.map((value) => {
    const normalizedKey = value?.toString().trim().toLowerCase();
    if (!normalizedKey) return value;
    return CLASS_LABEL_TO_VALUE[normalizedKey] || value;
  });

const formatSubjectLabel = (value: string) =>
  SUBJECT_VALUE_TO_LABEL[value] || toTitleCase(value || "");

const formatSubjectList = (values: string[]) =>
  values.map((value) => formatSubjectLabel(value)).join(", ");

const normalizeSubjectValues = (values: string[]) =>
  values.map((value) => {
    const normalizedKey = value?.toString().trim().toLowerCase();
    if (!normalizedKey) return value;
    return SUBJECT_LABEL_TO_VALUE[normalizedKey] || value;
  });

type WorkExperienceEntry = {
  title?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type QualificationEntry = {
  title?: string;
  institute?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type SocialLinks = {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
};

type ExtendedEducator = EducatorType & {
  workExperience?: WorkExperienceEntry[];
  qualification?: QualificationEntry[];
  socials?: SocialLinks;
  liveTests?: string[];
};

export default function DashboardPage() {
  const { educator, getFullName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState("");
  const [coursesCount, setCoursesCount] = useState(0);
  const [webinarsCount, setWebinarsCount] = useState(0);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    bio: "",
    description: "",
    introVideoLink: "",
    specialization: [] as string[],
    class: [] as string[],

    subject: [] as string[],
    yearsExperience: 0,
    payPerHourFee: 0,
  });

  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    []
  );
  const [qualifications, setQualifications] = useState<QualificationEntry[]>(
    []
  );
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
  });

  // Video upload state
  const [videoData, setVideoData] = useState({
    videoFile: null as File | null,
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [introVideoStatus, setIntroVideoStatus] = useState<
    "idle" | "processing" | "ready" | "error"
  >("idle");

  const introEmbedUrl = useMemo(
    () => normalizeVimeoEmbedUrl(profileData.introVideoLink),
    [profileData.introVideoLink]
  );

  const hydrateFromEducator = useCallback(
    (educatorData: Partial<EducatorType> | null | undefined) => {
      if (!educatorData) return;

      setEducatorId(educatorData._id || null);
      setProfileImage(
        educatorData.profilePicture || educatorData.image?.url || ""
      );

      const fullName = educatorData.fullName || "";
      const [derivedFirstName, ...restName] = fullName.trim().split(/\s+/);
      const lastName = restName.join(" ");
      const firstName = derivedFirstName || educatorData.username || "";

      const extendedEducator = educatorData as ExtendedEducator;

      const normalizedClasses = normalizeClassValues(
        ensureArray(extendedEducator?.class as string[])
      );
      const normalizedSubjects = normalizeSubjectValues(
        ensureArray(extendedEducator?.subject)
      );

      const introUrl = normalizeVimeoEmbedUrl(educatorData.introVideo);

      setProfileData({
        firstName,
        lastName,
        email: educatorData.email || "",
        mobileNumber: educatorData.mobileNumber || "",
        bio: educatorData.description || "",
        description: educatorData.description || "",
        introVideoLink: introUrl,
        specialization: ensureArray(educatorData.specialization),
        class: normalizedClasses,
        subject: normalizedSubjects,
        yearsExperience: educatorData.yoe || 0,
        payPerHourFee: educatorData.payPerHourFee ?? 0,
      });

      // Mark intro video as ready if link already exists
      if (introUrl) {
        setIntroVideoStatus("ready");
      }

      setWorkExperience(
        Array.isArray(extendedEducator.workExperience)
          ? extendedEducator.workExperience
          : []
      );
      setQualifications(
        Array.isArray(extendedEducator.qualification)
          ? extendedEducator.qualification
          : []
      );
      const socials = extendedEducator.socials || {};
      setSocialLinks({
        linkedin: socials.linkedin || "",
        twitter: socials.twitter || "",
        facebook: socials.facebook || "",
        instagram: socials.instagram || "",
        youtube: socials.youtube || "",
      });
    },
    []
  );

  // Calculate stats from educator data
  const questionsCount = getArrayCount(educator?.questions);
  const testSeriesCount = getArrayCount(educator?.testSeries);
  const studentsCount = getArrayCount(educator?.followers);
  const educatorStats = educator as ExtendedEducator | null;
  const liveTestsCount = Math.max(
    getArrayCount(educatorStats?.liveTests),
    getArrayCount(educator?.tests)
  );

  const educatorSubjects = normalizeSubjectValues(
    ensureArray(educator?.subject)
  );
  const subjectTrend = educatorSubjects.length
    ? formatSubjectList(educatorSubjects)
    : "N/A";
  const specializationTrend = Array.isArray(educator?.specialization)
    ? educator?.specialization.join(", ")
    : educator?.specialization || "N/A";
  const ratingValue =
    typeof educator?.rating === "object"
      ? educator?.rating?.average ?? 0
      : educator?.rating ?? 0;

  const statsData = [
    {
      title: "Total Courses",
      value: coursesCount.toString(),
      description: `${coursesCount} courses created`,
      icon: BookOpen,
      trend: `Subject: ${subjectTrend}`,
      href: "/dashboard/courses",
    },
    {
      title: "Question Bank",
      value: questionsCount.toString(),
      description: "Questions created",
      icon: FileQuestion,
      trend: `Specialization: ${specializationTrend}`,
      href: "/dashboard/questions",
    },
    {
      title: "Test Series",
      value: testSeriesCount.toString(),
      description: "Test series created",
      icon: TestTube,
      trend: `${liveTestsCount} live tests`,
      href: "/dashboard/test-series",
    },
    {
      title: "Followers",
      value: studentsCount.toString(),
      description: "Total followers",
      icon: Users,
      trend: `Rating: ${ratingValue}/5`,
      href: "/dashboard/students",
    },
  ];

  const liveStatsData = [
    {
      title: "Webinars",
      value: webinarsCount.toString(),
      description: "Total webinars",
      icon: Calendar,
      status: `${educator?.yoe || 0} years exp`,
      href: "/dashboard/live-classes",
    },
    {
      title: "Experience",
      value: `${educator?.yoe || 0}yr`,
      description: "Teaching experience",
      icon: Clock,
      status: educator?.status || "active",
      href: "/dashboard",
    },
  ];

  // Fetch educator data on mount
  useEffect(() => {
    const fetchEducatorData = async () => {
      // Prefer context data if already loaded
      if (educator) {
        hydrateFromEducator(educator);
        setFetchingData(false);
        return;
      }

      setFetchingData(true);
      try {
        const response = await getCurrentEducator();
        hydrateFromEducator(response.educator);
      } catch (error) {
        console.error("Error fetching educator data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setFetchingData(false);
      }
    };

    fetchEducatorData();
  }, [educator, hydrateFromEducator]);

  // Seed counts from in-memory educator (fast path)
  useEffect(() => {
    if (!educator) return;
    setCoursesCount(getArrayCount(educator.courses));
    setWebinarsCount(getArrayCount(educator.webinars));
  }, [educator]);

  // Refresh counts from server to avoid stale zeros
  useEffect(() => {
    const refreshCounts = async () => {
      if (!educatorId) return;

      try {
        const [coursesResponse, webinarsResponse] = await Promise.all([
          getCoursesByEducator(educatorId, { page: 1, limit: 1 }),
          getEducatorWebinars(educatorId, { page: 1, limit: 1 }),
        ]);

        const totalCourses =
          coursesResponse?.pagination?.totalCourses ??
          coursesResponse?.data?.pagination?.totalCourses ??
          (Array.isArray(coursesResponse?.courses)
            ? coursesResponse.courses.length
            : 0);

        const totalWebinars =
          webinarsResponse?.pagination?.totalWebinars ??
          webinarsResponse?.data?.pagination?.totalWebinars ??
          (Array.isArray(webinarsResponse?.webinars)
            ? webinarsResponse.webinars.length
            : 0);

        if (Number.isFinite(totalCourses)) {
          setCoursesCount(Number(totalCourses));
        }

        if (Number.isFinite(totalWebinars)) {
          setWebinarsCount(Number(totalWebinars));
        }
      } catch (error) {
        console.error("Failed to refresh educator counts:", error);
      }
    };

    void refreshCounts();
  }, [educatorId]);

  // Handle basic info update
  const handleUpdateBasicInfo = async () => {
    if (!educatorId) {
      toast.error("Educator ID not found");
      return;
    }

    setLoading(true);
    try {
      await updateEducatorBasicInfo(educatorId, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        bio: profileData.bio,
        description: profileData.description,
        introVideoLink: introEmbedUrl,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      toast.error(apiMessage || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!educatorId) return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setLoading(true);
    try {
      const response = await updateEducatorImage(educatorId, file);
      setProfileImage(response.educator?.image?.url || "");
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  // Handle work experience update
  const handleUpdateWorkExperience = async () => {
    if (!educatorId) return;

    setLoading(true);
    try {
      await updateEducatorWorkExperience(educatorId, workExperience);
      toast.success("Work experience updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update work experience");
    } finally {
      setLoading(false);
    }
  };

  // Handle qualifications update
  const handleUpdateQualifications = async () => {
    if (!educatorId) return;

    setLoading(true);
    try {
      await updateEducatorQualifications(educatorId, qualifications);
      toast.success("Qualifications updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update qualifications");
    } finally {
      setLoading(false);
    }
  };

  // Handle social links update
  const handleUpdateSocialLinks = async () => {
    if (!educatorId) return;

    setLoading(true);
    try {
      await updateEducatorSocialLinks(educatorId, socialLinks);
      toast.success("Social links updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update social links");
    } finally {
      setLoading(false);
    }
  };

  // Handle specialization update
  const handleUpdateSpecialization = async () => {
    if (!educatorId) return;

    setLoading(true);
    try {
      await updateEducatorSpecializationAndExperience(educatorId, {
        specialization: profileData.specialization,
        subject: profileData.subject,
        class: profileData.class,
        yearsExperience: Number(profileData.yearsExperience),
        payPerHourFee: Math.max(0, Number(profileData.payPerHourFee) || 0),
      });
      toast.success("Specialization updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update specialization");
    } finally {
      setLoading(false);
    }
  };

  // Add/Remove work experience
  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        title: "",
        company: "",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
    ]);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  // Add/Remove qualifications
  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        title: "",
        institute: "",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
    ]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  // Handle specialization toggle
  const toggleSpecialization = (value: string) => {
    setProfileData((prev) => {
      const currentSpecializations = prev.specialization;
      if (currentSpecializations.includes(value)) {
        return {
          ...prev,
          specialization: currentSpecializations.filter((s) => s !== value),
        };
      } else {
        return {
          ...prev,
          specialization: [...currentSpecializations, value],
        };
      }
    });
  };

  // Handle subject toggle
  const toggleSubject = (value: string) => {
    setProfileData((prev) => {
      const currentSubjects = prev.subject;
      if (currentSubjects.includes(value)) {
        return {
          ...prev,
          subject: currentSubjects.filter((s) => s !== value),
        };
      } else {
        return {
          ...prev,
          subject: [...currentSubjects, value],
        };
      }
    });
  };

  // Handle class toggle
  const toggleClass = (value: string) => {
    setProfileData((prev) => {
      const currentClass = prev.class;
      if (currentClass.includes(value)) {
        return {
          ...prev,
          class: currentClass.filter((c) => c !== value),
        };
      } else {
        return {
          ...prev,
          class: [...currentClass, value],
        };
      }
    });
  };

  // Handle video file selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file size must be less than 500MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }

      setVideoData((prev) => ({ ...prev, videoFile: file }));
      toast.success(`Selected: ${file.name}`);
    }
  };

  // Handle video upload to Vimeo
  const handleUploadVideo = async () => {
    if (!educatorId) {
      toast.error("Educator ID not found");
      return;
    }

    if (!videoData.videoFile) {
      toast.error("Please select a video file");
      return;
    }

    setUploadingVideo(true);
    setIntroVideoStatus("processing");
    const toastId = toast.loading("Uploading intro video to Vimeo...");

    try {
      const uploadResponse = await uploadEducatorIntroVideo(
        educatorId,
        videoData.videoFile
      );

      const newIntroUrl = normalizeVimeoEmbedUrl(
        uploadResponse?.data?.introVideo || uploadResponse?.data?.embedUrl
      );

      if (newIntroUrl) {
        setProfileData((prev) => ({
          ...prev,
          introVideoLink: newIntroUrl,
        }));
      }

      // Start polling for Vimeo transcode completion
      const pollIntroStatus = async () => {
        const maxAttempts = 12; // ~36s at 3s interval
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const statusResp = await getEducatorIntroVideoStatus(educatorId);
            const status = statusResp?.data?.status || "unknown";
            const latestUrl = normalizeVimeoEmbedUrl(
              statusResp?.data?.introVideo || statusResp?.data?.embedUrl
            );

            if (latestUrl) {
              setProfileData((prev) => ({
                ...prev,
                introVideoLink: latestUrl,
              }));
            }

            if (status === "complete") {
              setIntroVideoStatus("ready");
              return;
            }

            if (status === "error") {
              setIntroVideoStatus("error");
              return;
            }

            await new Promise((resolve) => setTimeout(resolve, 3000));
          } catch (err) {
            console.error("Intro video status poll failed:", err);
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
        setIntroVideoStatus("processing");
      };

      pollIntroStatus();

      toast.success("Video uploaded. Processing on Vimeo...", { id: toastId });

      // Reset form
      setVideoData({ videoFile: null });

      const fileInput = document.getElementById(
        "videoFile"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setIntroVideoStatus("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload video. Please try again.",
        { id: toastId }
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`Welcome back, ${getFullName()}!`}
        description="Manage your profile and view your teaching statistics"
      />

      <div className="px-6 space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Personal Details
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-card-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-card-foreground">
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-primary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.trend}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Live Sessions Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              {liveStatsData.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-card-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-card-foreground">
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {stat.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Link href="/dashboard/courses/live">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Create Course
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Start building
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>

                  <Link href="/dashboard/questions">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <FileQuestion className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Add Questions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expand bank
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>

                  <Link href="/dashboard/test-series">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <TestTube className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Create Test
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Build series
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>

                  <Link href="/dashboard/content/live-classes">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Schedule Live
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Plan session
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Basic Information Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Basic Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={profileImage || "/placeholder.svg"}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {profileData.firstName?.[0]}
                      {profileData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                      disabled={loading}
                    />
                    <Label htmlFor="profile-image-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={loading}
                      >
                        <span className="cursor-pointer gap-2">
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Change Photo
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      value={profileData.mobileNumber}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          mobileNumber: e.target.value,
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    disabled={loading}
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {profileData.bio.length}/500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    disabled={loading}
                    placeholder="Detailed description of your expertise, teaching style, and achievements..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {profileData.description.length}/1000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="introVideoLink">
                    Introduction Video Link
                  </Label>
                  <Input
                    id="introVideoLink"
                    type="url"
                    value={profileData.introVideoLink}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        introVideoLink: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      setProfileData((prev) => ({
                        ...prev,
                        introVideoLink: normalizeVimeoEmbedUrl(
                          prev.introVideoLink
                        ),
                      }))
                    }
                    disabled={loading}
                    placeholder="https://player.vimeo.com/video/{id}"
                  />
                </div>

                <Button
                  className="gap-2"
                  onClick={handleUpdateBasicInfo}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Basic Information
                </Button>
              </CardContent>
            </Card>

            {/* Specialization Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Specialization & Experience
                </CardTitle>
                <CardDescription>
                  Update your teaching specialization and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      value={profileData.yearsExperience}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          yearsExperience: Number(e.target.value),
                        }))
                      }
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payPerHourFee">
                      Pay per hour fee (INR)
                    </Label>
                    <Input
                      id="payPerHourFee"
                      type="number"
                      min="0"
                      value={profileData.payPerHourFee}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          payPerHourFee: Number(e.target.value),
                        }))
                      }
                      disabled={loading}
                      placeholder="Enter fee amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          disabled={loading}
                        >
                          <span className="truncate">
                            {profileData.specialization.length > 0
                              ? profileData.specialization.join(", ")
                              : "Select specializations..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="p-4 space-y-2">
                          {SPECIALIZATION_OPTIONS.map((option) => (
                            <div
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`spec-${option}`}
                                checked={profileData.specialization.includes(
                                  option
                                )}
                                onCheckedChange={() =>
                                  toggleSpecialization(option)
                                }
                                disabled={loading}
                              />
                              <label
                                htmlFor={`spec-${option}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Select one or more specializations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Classes</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          disabled={loading}
                        >
                          <span className="truncate">
                            {profileData?.class?.length > 0
                              ? formatClassList(profileData.class)
                              : "Select classes..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                          {CLASS_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`class-${option.value}`}
                                checked={profileData.class.includes(
                                  option.value
                                )}
                                onCheckedChange={() =>
                                  toggleClass(option.value)
                                }
                                disabled={loading}
                              />
                              <label
                                htmlFor={`class-${option.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Select one or more classes you teach
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Subjects</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          disabled={loading}
                        >
                          <span className="truncate">
                            {profileData.subject.length > 0
                              ? formatSubjectList(profileData.subject)
                              : "Select subjects..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                          {SUBJECT_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`subject-${option.value}`}
                                checked={profileData.subject.includes(
                                  option.value
                                )}
                                onCheckedChange={() =>
                                  toggleSubject(option.value)
                                }
                                disabled={loading}
                              />
                              <label
                                htmlFor={`subject-${option.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Select one or more subjects you teach
                    </p>
                  </div>
                </div>
                <Button
                  className="gap-2"
                  onClick={handleUpdateSpecialization}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Specialization
                </Button>
              </CardContent>
            </Card>

            {/* Social Links Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className=" grid grid-cols-2 gap-3 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={socialLinks.linkedin}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          linkedin: e.target.value,
                        }))
                      }
                      disabled={loading}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={socialLinks.twitter}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          twitter: e.target.value,
                        }))
                      }
                      disabled={loading}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      type="url"
                      value={socialLinks.facebook}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          facebook: e.target.value,
                        }))
                      }
                      disabled={loading}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={socialLinks.instagram}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          instagram: e.target.value,
                        }))
                      }
                      disabled={loading}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      type="url"
                      value={socialLinks.youtube}
                      onChange={(e) =>
                        setSocialLinks((prev) => ({
                          ...prev,
                          youtube: e.target.value,
                        }))
                      }
                      disabled={loading}
                      placeholder="https://youtube.com/@..."
                    />
                  </div>
                </div>

                <Button
                  className="gap-2"
                  onClick={handleUpdateSocialLinks}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Social Links
                </Button>
              </CardContent>
            </Card>

            {/* Video Section Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Add Demo Video
                </CardTitle>
                <CardDescription>
                  Upload your educational videos to Vimeo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoFile">Video File</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="videoFile"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          disabled={loading || uploadingVideo}
                          className="cursor-pointer"
                        />
                        {videoData.videoFile && (
                          <Badge variant="outline" className="text-xs">
                            {(videoData.videoFile.size / (1024 * 1024)).toFixed(
                              2
                            )}{" "}
                            MB
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Max file size: 500MB. Supported formats: MP4, MOV, AVI,
                        etc.
                      </p>
                    </div>

                    <Button
                      className="gap-2"
                      onClick={handleUploadVideo}
                      disabled={
                        loading || uploadingVideo || !videoData.videoFile
                      }
                    >
                      {uploadingVideo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Video
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-card-foreground flex items-center justify-between">
                      <span>Preview</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {introVideoStatus === "processing"
                          ? "Processing"
                          : introVideoStatus === "ready"
                          ? "Ready"
                          : introVideoStatus === "error"
                          ? "Error"
                          : introEmbedUrl
                          ? "Ready"
                          : "Not available"}
                      </span>
                    </p>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {introEmbedUrl ? (
                        <iframe
                          key={introEmbedUrl}
                          src={`${introEmbedUrl}${
                            introEmbedUrl.includes("?") ? "&" : "?"
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            {/* Work Experience Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
                <CardDescription>
                  Add your professional work history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {workExperience.map((exp, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experience #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkExperience(index)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...workExperience];
                            newExp[index].title = e.target.value;
                            setWorkExperience(newExp);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...workExperience];
                            newExp[index].company = e.target.value;
                            setWorkExperience(newExp);
                          }}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={exp.startDate?.split("T")[0] || ""}
                          onChange={(e) => {
                            const newExp = [...workExperience];
                            newExp[index].startDate = e.target.value;
                            setWorkExperience(newExp);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={exp.endDate?.split("T")[0] || ""}
                          onChange={(e) => {
                            const newExp = [...workExperience];
                            newExp[index].endDate = e.target.value;
                            setWorkExperience(newExp);
                          }}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addWorkExperience}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                  <Button
                    onClick={handleUpdateWorkExperience}
                    disabled={loading || workExperience.length === 0}
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Work Experience
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education & Qualifications
                </CardTitle>
                <CardDescription>
                  Add your educational background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {qualifications.map((qual, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Qualification #{index + 1}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQualification(index)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree/Title</Label>
                        <Input
                          value={qual.title}
                          onChange={(e) => {
                            const newQual = [...qualifications];
                            newQual[index].title = e.target.value;
                            setQualifications(newQual);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institute</Label>
                        <Input
                          value={qual.institute}
                          onChange={(e) => {
                            const newQual = [...qualifications];
                            newQual[index].institute = e.target.value;
                            setQualifications(newQual);
                          }}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={qual.startDate?.split("T")[0] || ""}
                          onChange={(e) => {
                            const newQual = [...qualifications];
                            newQual[index].startDate = e.target.value;
                            setQualifications(newQual);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={qual.endDate?.split("T")[0] || ""}
                          onChange={(e) => {
                            const newQual = [...qualifications];
                            newQual[index].endDate = e.target.value;
                            setQualifications(newQual);
                          }}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addQualification}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Qualification
                  </Button>
                  <Button
                    onClick={handleUpdateQualifications}
                    disabled={loading || qualifications.length === 0}
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Qualifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
