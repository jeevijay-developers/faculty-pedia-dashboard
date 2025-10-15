"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Palette, Save, Loader2, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getCurrentEducator,
  updateEducatorBasicInfo,
  updateEducatorImage,
  updateEducatorWorkExperience,
  updateEducatorQualifications,
  updateEducatorSocialLinks,
  updateEducatorSpecializationAndExperience,
} from "@/util/server";

export default function SettingsPage() {
  const [educatorId, setEducatorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [profileImage, setProfileImage] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    bio: "",
    introVideoLink: "",
    specialization: "Physics",
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

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    studentEnrollments: true,
    testSubmissions: true,
    liveClassReminders: true,
    weeklyReports: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "english",
    timezone: "Asia/Kolkata",
    defaultCurrency: "INR",
  });

  // Fetch educator data on mount
  useEffect(() => {
    const fetchEducatorData = async () => {
      setFetchingData(true);
      try {
        const response = await getCurrentEducator();
        const educator = response.educator; // Changed from response.data to response.educator
        console.log("Educator: ", educator);
        
        setEducatorId(educator._id); // Changed from educator.id to educator._id
        setProfileImage(educator.image?.url || "");
        setProfileData({
          firstName: educator.firstName || "",
          lastName: educator.lastName || "",
          email: educator.email || "",
          mobileNumber: educator.mobileNumber || "",
          bio: educator.bio || "",
          introVideoLink: educator.introVideoLink || "",
          specialization: educator.specialization || "Physics",
          yearsExperience: educator.yearsExperience || 0,
        });
        setWorkExperience(educator.workExperience || []);
        setQualifications(educator.qualification || []);
        setSocialLinks({
          linkedin: educator.socials?.linkedin || "",
          twitter: educator.socials?.twitter || "",
          facebook: educator.socials?.facebook || "",
          instagram: educator.socials?.instagram || "",
          youtube: educator.socials?.youtube || "",
        });
      } catch (error) {
        console.error("Error fetching educator data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setFetchingData(false);
      }
    };

    fetchEducatorData();
  }, []);

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
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!educatorId) return;

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
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

  // Add work experience entry
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

  // Remove work experience entry
  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  // Add qualification entry
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

  // Remove qualification entry
  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="px-6 space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Basic Information Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={profileImage || "/placeholder.svg"}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
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
                      <Button variant="outline" size="sm" asChild disabled={loading}>
                        <span className="cursor-pointer">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Change Photo
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
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
                  <Label htmlFor="introVideoLink">Introduction Video Link</Label>
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Basic Information
                </Button>
              </CardContent>
            </Card>

            {/* Specialization & Experience Card */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={profileData.specialization}
                      onValueChange={(value) =>
                        setProfileData((prev) => ({ ...prev, specialization: value }))
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                        <SelectItem value="NEET">NEET</SelectItem>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>

                <Button 
                  className="gap-2"
                  onClick={handleUpdateSpecialization}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Specialization
                </Button>
              </CardContent>
            </Card>

            {/* Work Experience Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Work Experience
                </CardTitle>
                <CardDescription>
                  Add your professional work history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {workExperience.map((exp, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Experience #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkExperience(index)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].title = e.target.value;
                            setWorkExperience(updated);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].company = e.target.value;
                            setWorkExperience(updated);
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
                          value={exp.startDate?.split('T')[0] || ''}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].startDate = new Date(e.target.value).toISOString();
                            setWorkExperience(updated);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={exp.endDate?.split('T')[0] || ''}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].endDate = new Date(e.target.value).toISOString();
                            setWorkExperience(updated);
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
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Work Experience
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Education & Qualifications
                </CardTitle>
                <CardDescription>
                  Add your educational background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {qualifications.map((qual, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Qualification #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQualification(index)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree/Title</Label>
                        <Input
                          value={qual.title}
                          onChange={(e) => {
                            const updated = [...qualifications];
                            updated[index].title = e.target.value;
                            setQualifications(updated);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institute</Label>
                        <Input
                          value={qual.institute}
                          onChange={(e) => {
                            const updated = [...qualifications];
                            updated[index].institute = e.target.value;
                            setQualifications(updated);
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
                          value={qual.startDate?.split('T')[0] || ''}
                          onChange={(e) => {
                            const updated = [...qualifications];
                            updated[index].startDate = new Date(e.target.value).toISOString();
                            setQualifications(updated);
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={qual.endDate?.split('T')[0] || ''}
                          onChange={(e) => {
                            const updated = [...qualifications];
                            updated[index].endDate = new Date(e.target.value).toISOString();
                            setQualifications(updated);
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
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Qualifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Links Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
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
                        setSocialLinks((prev) => ({ ...prev, linkedin: e.target.value }))
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
                        setSocialLinks((prev) => ({ ...prev, twitter: e.target.value }))
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
                        setSocialLinks((prev) => ({ ...prev, facebook: e.target.value }))
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
                        setSocialLinks((prev) => ({ ...prev, instagram: e.target.value }))
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
                        setSocialLinks((prev) => ({ ...prev, youtube: e.target.value }))
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Social Links
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          pushNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Student Enrollments</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when students enroll in your courses
                      </p>
                    </div>
                    <Switch
                      checked={notifications.studentEnrollments}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          studentEnrollments: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Test Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when students submit tests
                      </p>
                    </div>
                    <Switch
                      checked={notifications.testSubmissions}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          testSubmissions: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Live Class Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded about upcoming Pay Per Hour
                      </p>
                    </div>
                    <Switch
                      checked={notifications.liveClassReminders}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          liveClassReminders: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly performance reports
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          weeklyReports: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Application Preferences
                </CardTitle>
                <CardDescription>
                  Customize your dashboard experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, timezone: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          Asia/Kolkata (IST)
                        </SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={preferences.defaultCurrency}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({
                          ...prev,
                          defaultCurrency: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
{/* 
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Active Sessions</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage your active login sessions
                    </p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div> */}

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
