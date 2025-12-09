"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { createVideo } from "@/util/server";

interface CourseSummary {
  _id: string;
  title: string;
}

interface CreateVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses?: CourseSummary[];
  onSuccess?: () => void;
}

export function CreateVideoDialog({
  open,
  onOpenChange,
  courses = [],
  onSuccess,
}: CreateVideoDialogProps) {
  const [title, setTitle] = useState("");
  const [linkInputs, setLinkInputs] = useState<string[]>([""]);
  const [isCourseSpecific, setIsCourseSpecific] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setLinkInputs([""]);
    setIsCourseSpecific(false);
    setSelectedCourseId("");
  };

  const handleClose = (nextState: boolean) => {
    if (!nextState) {
      resetForm();
    }
    onOpenChange(nextState);
  };

  const handleLinkChange = (index: number, value: string) => {
    setLinkInputs((prev) => prev.map((link, idx) => (idx === index ? value : link)));
  };

  const addLinkField = () => {
    setLinkInputs((prev) => [...prev, ""]);
  };

  const removeLinkField = (index: number) => {
    setLinkInputs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Video title is required");
      return;
    }

    const sanitizedLinks = linkInputs.map((link) => link.trim()).filter((link) => link.length > 0);
    if (!sanitizedLinks.length) {
      toast.error("Please add at least one video link");
      return;
    }

    if (isCourseSpecific && !selectedCourseId) {
      toast.error("Please select a course for this video");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating video...");

    try {
      await createVideo({
        title: title.trim(),
        links: sanitizedLinks,
        isCourseSpecific,
        courseId: isCourseSpecific ? selectedCourseId : undefined,
      });
      toast.success("Video created successfully", { id: toastId });
      resetForm();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create video", error);
      toast.error("Unable to create video. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              placeholder="Enter video title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Video Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLinkField}
                disabled={isSubmitting || linkInputs.length >= 20}
              >
                <Plus className="mr-1 h-4 w-4" /> Add link
              </Button>
            </div>
            <div className="space-y-2">
              {linkInputs.map((link, index) => (
                <div key={`video-link-${index}`} className="flex items-center gap-2">
                  <Input
                    placeholder="https://..."
                    value={link}
                    onChange={(event) => handleLinkChange(index, event.target.value)}
                    disabled={isSubmitting}
                  />
                  {linkInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLinkField(index)}
                      disabled={isSubmitting}
                      aria-label="Remove link"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label className="text-sm font-medium">Course Specific</Label>
              <p className="text-xs text-muted-foreground">
                Toggle on to attach this video to a specific course.
              </p>
            </div>
            <Switch
              checked={isCourseSpecific}
              onCheckedChange={setIsCourseSpecific}
              disabled={isSubmitting}
            />
          </div>

          {isCourseSpecific && (
            <div className="space-y-2">
              <Label htmlFor="video-course">Select Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={isSubmitting || courses.length === 0}
              >
                <SelectTrigger id="video-course">
                  <SelectValue placeholder={courses.length ? "Choose a course" : "No courses available"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  You have no courses yet. Create a course first to attach videos.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
