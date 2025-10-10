"use client";

import { useState, useEffect } from "react";
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
import { updateWebinar, uploadImage } from "@/util/server";
import { useAuth } from "@/contexts/auth-context";

interface EditWebinarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinar: any | null;
  onWebinarUpdated?: () => void;
}

interface AssetLink {
  name: "PPT" | "VIDEO" | "PDF" | "DOC";
  link: string;
}

export function EditWebinarDialog({
  open,
  onOpenChange,
  webinar,
  onWebinarUpdated,
}: EditWebinarDialogProps) {
  const [formData, setFormData] = useState({
    shortDescription: "",
    longDescription: "",
    webinarType: "OTA" as "OTO" | "OTA",
    time: "",
    subject: "",
    specialization: "CBSE" as "IIT-JEE" | "NEET" | "CBSE",
    date: "",
    seatLimit: "",
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

  // Populate form when webinar changes
  useEffect(() => {
    if (webinar && open) {
      setFormData({
        shortDescription: webinar.description?.short || "",
        longDescription: webinar.description?.long || "",
        webinarType: webinar.webinarType || "OTA",
        time: webinar.time || "",
        subject: webinar.subject || "",
        specialization: webinar.specialization || "CBSE",
        date: webinar.date
          ? new Date(webinar.date).toISOString().split("T")[0]
          : "",
        seatLimit: webinar.seatLimit?.toString() || "",
        webinarLink: webinar.webinarLink || "",
        assetLinks: webinar.assetsLinks || [],
      });
      setImagePreview(webinar.image?.url || null);
      setSelectedImage(null);
      setError(null);
      setSuccess(false);
    }
  }, [webinar, open]);

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

  const addAssetLink = () => {
    if (newAssetLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        assetLinks: [
          ...prev.assetLinks,
          { name: newAssetName, link: newAssetLink.trim() },
        ],
      }));
      setNewAssetLink("");
    }
  };

  const removeAssetLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      assetLinks: prev.assetLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!webinar?._id) {
      setError("Webinar ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageData = undefined;

      // Only upload if a new image was selected
      if (selectedImage) {
        const imageResponse = await uploadImage(selectedImage);
        imageData = imageResponse.imageUrl;
      }

      const updateData: any = {
        description: {
          short: formData.shortDescription.trim(),
          long: formData.longDescription.trim(),
        },
        webinarType: formData.webinarType,
        time: formData.time.trim(),
        subject: formData.subject.trim(),
        specialization: formData.specialization,
        date: new Date(formData.date).toISOString(),
        seatLimit: Number(formData.seatLimit),
        webinarLink: formData.webinarLink.trim(),
        assetsLinks: formData.assetLinks,
      };

      // Only include image if a new one was uploaded
      if (imageData) {
        updateData.image = imageData;
      }

      await updateWebinar(webinar._id, updateData);
      setSuccess(true);

      if (onWebinarUpdated) {
        onWebinarUpdated();
      }

      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error updating webinar:", error);
      setError(error?.response?.data?.message || "Failed to update webinar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Webinar</DialogTitle>
          <DialogDescription>
            Update the webinar details below.
          </DialogDescription>
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
                <span className="text-sm">Webinar updated successfully!</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webinarType">Webinar Type *</Label>
                <Select
                  value={formData.webinarType}
                  onValueChange={(value) =>
                    handleInputChange("webinarType", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Textarea
                id="shortDescription"
                placeholder="Brief description"
                rows={2}
                value={formData.shortDescription}
                onChange={(e) =>
                  handleInputChange("shortDescription", e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description *</Label>
              <Textarea
                id="longDescription"
                placeholder="Detailed description"
                rows={4}
                value={formData.longDescription}
                onChange={(e) =>
                  handleInputChange("longDescription", e.target.value)
                }
                disabled={isLoading}
              />
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

            <div className="space-y-2">
              <Label htmlFor="seatLimit">Seat Limit *</Label>
              <Input
                id="seatLimit"
                type="number"
                placeholder="100"
                value={formData.seatLimit}
                onChange={(e) => handleInputChange("seatLimit", e.target.value)}
                disabled={isLoading}
              />
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
                <img
                  src={imagePreview}
                  alt="Webinar preview"
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
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
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
          <div className="space-y-4">
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
          </div>
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
                Updating...
              </>
            ) : success ? (
              "Updated!"
            ) : (
              "Update Webinar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
