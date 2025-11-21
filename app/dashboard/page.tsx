"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/util/server";

const ensureArray = (value: any) => {
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

export default function DashboardPage() {
  const { educator, getFullName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    bio: "",
    description: "",
    introVideoLink: "",
    specialization: [] as string[],
    subject: [] as string[],
    yearsExperience: 0,
  });

  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
  });

  // Options for multi-select
  const specializationOptions = ["IIT-JEE", "NEET", "CBSE"];
  const subjectOptions = [
    "Biology",
    "Physics",
    "Mathematics",
    "Chemistry",
    "English",
    "Hindi",
  ];

  const hydrateFromEducator = useCallback(
    (educatorData: Partial<EducatorType> | null | undefined) => {
      if (!educatorData) return;

      setEducatorId(educatorData._id || null);
      setProfileImage(
        educatorData.profilePicture || educatorData.image?.url || ""
      );

      const fullName = educatorData.fullName || "";
      const [firstName, ...restName] = fullName.trim().split(/\s+/);
      const lastName = restName.join(" ");

      setProfileData({
        firstName: firstName || educatorData.username || "",
        lastName,
        email: educatorData.email || "",
        mobileNumber: educatorData.mobileNumber || "",
        bio: educatorData.description || "",
        description: educatorData.description || "",
        introVideoLink: educatorData.introVideo || "",
        specialization: ensureArray(educatorData.specialization),
        subject: ensureArray(educatorData.subject),
        yearsExperience: educatorData.yoe || 0,
      });

      setWorkExperience(
        Array.isArray((educatorData as any)?.workExperience)
          ? (educatorData as any).workExperience
          : []
      );
      setQualifications(
        Array.isArray((educatorData as any)?.qualification)
          ? (educatorData as any).qualification
          : []
      );
      const socials = (educatorData as any)?.socials || {};
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
  const coursesCount = getArrayCount(educator?.courses);
  const questionsCount = getArrayCount(educator?.questions);
  const testSeriesCount = getArrayCount(educator?.testSeries);
  const studentsCount = getArrayCount(educator?.followers);
  const webinarsCount = getArrayCount(educator?.webinars);
  const liveTestsCount = Math.max(
    getArrayCount((educator as any)?.liveTests),
    getArrayCount(educator?.tests)
  );

  const subjectTrend = Array.isArray(educator?.subject)
    ? educator?.subject.map(toTitleCase).join(", ")
    : educator?.subject || "N/A";
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
        introVideoLink: profileData.introVideoLink,
      });

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
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
        yearsExperience: Number(profileData.yearsExperience),
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
                  <Link href="/dashboard/courses">
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

                  <Link href="/dashboard/live-classes">
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
                    disabled={loading}
                    placeholder="https://youtube.com/..."
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
                          {specializationOptions.map((option) => (
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
                    <Label>Subjects/Classes</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          disabled={loading}
                        >
                          <span className="truncate">
                            {profileData.subject.length > 0
                              ? profileData.subject.join(", ")
                              : "Select classes..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                          {subjectOptions.map((option) => (
                            <div
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`subject-${option}`}
                                checked={profileData.subject.includes(option)}
                                onCheckedChange={() => toggleSubject(option)}
                                disabled={loading}
                              />
                              <label
                                htmlFor={`subject-${option}`}
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
                      Select one or more classes you teach
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
                <div className="space-y-4">
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
