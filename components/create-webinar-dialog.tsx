/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { Loader2, AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { createWebinar, uploadImage } from "@/util/server";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import Image from "next/image";

interface CreateWebinarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebinarCreated?: () => void;
}

interface AssetLink {
  name: "PPT" | "VIDEO" | "PDF" | "DOC";
  link: string;
}

export function CreateWebinarDialog({
  open,
  onOpenChange,
  onWebinarCreated,
}: CreateWebinarDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    webinarType: "OTA" as "OTO" | "OTA",
    time: "",
    subject: "",
    specialization: "CBSE" as "IIT-JEE" | "NEET" | "CBSE",
    date: "",
    seatLimit: "",
    duration: "",
    fees: "",
    webinarLink: "",
    assetLinks: [] as AssetLink[],
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newAssetName, setNewAssetName] = useState<AssetLink["name"]>("PPT");
  const [newAssetLink, setNewAssetLink] = useState("");

  const { educator } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };



  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (formData.description.trim().length > 1000) {
      setError("Description must be 1000 characters or less");
      return;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!formData.date.trim()) {
      setError("Date is required");
      return;
    }
    if (!formData.time.trim()) {
      setError("Time is required");
      return;
    }
    if (!formData.seatLimit.trim()) {
      setError("Seat limit is required");
      return;
    }
    if (isNaN(Number(formData.seatLimit)) || Number(formData.seatLimit) <= 0) {
      setError("Seat limit must be a valid positive number");
      return;
    }
    if (!formData.duration.trim()) {
      setError("Duration is required");
      return;
    }
    if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      setError("Duration must be a valid positive number");
      return;
    }
    if (!formData.fees.trim()) {
      setError("Fees is required");
      return;
    }
    if (isNaN(Number(formData.fees)) || Number(formData.fees) < 0) {
      setError("Fees must be a valid non-negative number");
      return;
    }
    if (!formData.webinarLink.trim()) {
      setError("Webinar link is required");
      return;
    }

    if (!educator?._id) {
      setError("User authentication required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageData = null;

      if (selectedImage) {
        const imageResponse = await uploadImage(selectedImage);
        imageData = imageResponse.imageUrl;
      }

      // Combine date and time into a single Date object for timing field
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const webinarData = {
        title: formData.title.trim(),
        description: formData.description.trim(), // Single string field
        webinarType: formData.webinarType, // Will be converted by schema setter
        timing: dateTime.toISOString(), // Combined date and time
        subject: [formData.subject.trim().toLowerCase()], // Array as per schema
        specialization: [formData.specialization], // Array as per schema
        seatLimit: Number(formData.seatLimit),
        duration: Number(formData.duration),
        fees: Number(formData.fees),
        educatorId: educator._id,
        webinarLink: formData.webinarLink.trim(),
        assetsLink: formData.assetLinks.map(asset => asset.link), // Schema expects array of strings (field name is assetsLink, singular)
        ...(imageData && { image: imageData }),
      };

      await createWebinar(educator._id, webinarData);
      setSuccess(true);

      if (onWebinarCreated) {
        onWebinarCreated();
      }

      // Reset form and close dialog after a delay
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          webinarType: "OTA",
          time: "",
          subject: "",
          specialization: "CBSE",
          date: "",
          seatLimit: "",
          duration: "",
          fees: "",
          webinarLink: "",
          assetLinks: [],
        });
        setSelectedImage(null);
        setImagePreview(null);
        setNewAssetName("PPT");
        setNewAssetLink("");
        setSuccess(false);
        setError(null);
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating webinar:", error);
      setError(error?.response?.data?.message || "Failed to create webinar");
      if (Array.isArray(error?.response?.data?.errors)) {
        error?.response?.data?.errors.map((err: any) => {
          if (err !== "Invalid value")
            toast.error(err, {
              duration: 8000,
              position: "top-right",
              style: { background: "#ffeded", color: "#ff0000" },
            });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Webinar</DialogTitle>
          <DialogDescription>Set up a new webinar session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Webinar created successfully!</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., JEE Physics Problem Solving Marathon"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webinarType">Webinar Type *</Label>
                <Select
                  value={formData.webinarType}
                  onValueChange={(value) =>
                    handleInputChange("webinarType", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OTO">One To One (OTO)</SelectItem>
                    <SelectItem value="OTA">One To All (OTA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) =>
                    handleInputChange("specialization", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                  disabled={isLoading}
                >
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter webinar description"
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                disabled={isLoading}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatLimit">Seat Limit *</Label>
                <Input
                  id="seatLimit"
                  type="number"
                  placeholder="100"
                  value={formData.seatLimit}
                  onChange={(e) =>
                    handleInputChange("seatLimit", e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="90"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fees">Fees (₹) *</Label>
                <Input
                  id="fees"
                  type="number"
                  placeholder="500"
                  value={formData.fees}
                  onChange={(e) => handleInputChange("fees", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webinarLink">Webinar Link *</Label>
              <Input
                id="webinarLink"
                placeholder="https://zoom.us/j/1234567890"
                value={formData.webinarLink}
                onChange={(e) =>
                  handleInputChange("webinarLink", e.target.value)
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Webinar Image</h3>

            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Webinar preview"
                  width={600}
                  height={192}
                  unoptimized
                  className="w-full h-48 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="text-sm font-medium mx-auto text-primary hover:text-primary/80">
                        Upload webinar image
                      </span>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                        disabled={isLoading}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset Links Section */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium">Asset Links</h3>

            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newAssetName}
                onValueChange={(value: AssetLink["name"]) =>
                  setNewAssetName(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PPT">PPT</SelectItem>
                  <SelectItem value="VIDEO">VIDEO</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOC">DOC</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Asset link URL"
                value={newAssetLink}
                onChange={(e) => setNewAssetLink(e.target.value)}
                disabled={isLoading}
                className="col-span-2"
              />

              <Button
                type="button"
                onClick={addAssetLink}
                disabled={!newAssetLink.trim() || isLoading}
                className="col-span-3"
                variant="outline"
              >
                Add Asset Link
              </Button>
            </div>

            {formData.assetLinks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Added Assets ({formData.assetLinks.length})
                </h4>
                {formData.assetLinks.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted p-3 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {asset.name}
                      </span>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {asset.link}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssetLink(index)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : success ? (
              "Created!"
            ) : (
              "Create Webinar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
