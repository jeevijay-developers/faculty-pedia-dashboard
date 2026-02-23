"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
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
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setLinkInputs([""]);
    setIsCourseSpecific(false);
    setSelectedCourseIds([]);
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

    if (isCourseSpecific && selectedCourseIds.length === 0) {
      toast.error("Please select at least one course for this video");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating video...");

    try {
      await createVideo({
        title: title.trim(),
        links: sanitizedLinks,
        isCourseSpecific,
        courseIds: isCourseSpecific ? selectedCourseIds : [],
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
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLinkField}
                disabled={isSubmitting || linkInputs.length >= 20}
              >
                <Plus className="mr-1 h-4 w-4" /> Add link
              </Button> */}
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
              onCheckedChange={(next) => {
                setIsCourseSpecific(next);
                if (!next) {
                  setSelectedCourseIds([]);
                }
              }}
              disabled={isSubmitting}
            />
          </div>

          {isCourseSpecific && (
            <div className="space-y-2">
              <Label>Select courses</Label>
              <div className="max-h-56 overflow-y-auto rounded-md border p-2 space-y-2">
                {courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses available.</p>
                ) : (
                  courses.map((course) => {
                    const checked = selectedCourseIds.includes(course._id);
                    return (
                      <label
                        key={course._id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setSelectedCourseIds((prev) =>
                              value === true
                                ? [...prev, course._id]
                                : prev.filter((id) => id !== course._id)
                            );
                          }}
                          disabled={isSubmitting}
                        />
                        <span className="text-sm line-clamp-1">{course.title}</span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Select one or more courses. Leave empty to keep the video unassigned.
              </p>
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
