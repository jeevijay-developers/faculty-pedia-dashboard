"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Link2, Plus, ListChecks } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import { deleteVideo, getCoursesByEducator, getVideos, updateVideo } from "@/util/server";
import { CreateVideoDialog } from "@/components/create-video-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CourseSummary {
  _id: string;
  title: string;
}

interface VideoItem {
  _id: string;
  title: string;
  links?: string[];
  isCourseSpecific?: boolean;
  courseId?: string | { _id: string; title?: string };
  courseIds?: Array<string | { _id: string; title?: string }>;
  createdAt?: string;
  educatorID?: string | { _id: string };
}

type ValidationErrorEntry = {
  msg?: string;
  message?: string;
};

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
      errors?: ValidationErrorEntry[];
    };
  };
  message?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function extractArray<T>(value: unknown, key: string): T[] | null {
  if (!value) return null
  if (Array.isArray(value)) return value as T[]
  if (!isRecord(value)) return null
  if (Array.isArray(value[key as keyof typeof value])) {
    return value[key as keyof typeof value] as T[]
  }
  if (isRecord(value.data)) {
    return extractArray<T>(value.data, key)
  }
  return null
}

const normalizeVideos = (payload: unknown): VideoItem[] =>
  extractArray<VideoItem>(payload, "videos") ?? [];

const normalizeCourses = (payload: unknown): CourseSummary[] =>
  extractArray<CourseSummary>(payload, "courses") ?? [];

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (isRecord(error) && (error as ApiErrorResponse).response) {
    const apiError = error as ApiErrorResponse;
    const validationMessage = apiError.response?.data?.errors?.[0];
    if (validationMessage) {
      return (
        (typeof validationMessage.msg === "string" && validationMessage.msg) ||
        (typeof validationMessage.message === "string" && validationMessage.message) ||
        fallback
      );
    }
    const nestedMessage = apiError.response?.data?.message;
    if (typeof nestedMessage === "string") {
      return nestedMessage;
    }
    if (typeof apiError.message === "string") {
      return apiError.message;
    }
  }
  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const resolveReferenceId = (value?: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value._id === "string") {
    return value._id;
  }
  return undefined;
};

export default function VideosPage() {
  const { educator } = useAuth();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [videoBeingViewed, setVideoBeingViewed] = useState<VideoItem | null>(null);
  const [videoPendingDelete, setVideoPendingDelete] = useState<VideoItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim().toLowerCase());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchVideosList = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await getVideos();
      setVideos(normalizeVideos(response));
    } catch (error) {
      setFetchError(getApiErrorMessage(error, "Failed to load videos"));
    } finally {
      setIsFetching(false);
    }
  }, []);

  const fetchCoursesList = useCallback(async () => {
    if (!educator?._id) {
      setCourses([]);
      return;
    }

    try {
      const response = await getCoursesByEducator(educator._id, { limit: 100 });
      setCourses(normalizeCourses(response));
    } catch (error) {
      console.warn("Unable to load courses for videos page", error);
    }
  }, [educator?._id]);

  useEffect(() => {
    fetchVideosList();
  }, [fetchVideosList]);

  useEffect(() => {
    fetchCoursesList();
  }, [fetchCoursesList]);

  const videosByEducator = useMemo(() => {
    if (!educator?._id) {
      return videos;
    }
    return videos.filter((video) => {
      const ownerId = resolveReferenceId(video.educatorID);
      return ownerId ? ownerId === educator._id : true;
    });
  }, [videos, educator?._id]);

  const filteredVideos = useMemo(() => {
    if (!debouncedSearchQuery) {
      return videosByEducator;
    }
    return videosByEducator.filter((video) =>
      video.title?.toLowerCase().includes(debouncedSearchQuery)
    );
  }, [videosByEducator, debouncedSearchQuery]);

  const courseLookup = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((course) => map.set(course._id, course.title));
    return map;
  }, [courses]);

  const collectCourseIds = useCallback((video: VideoItem) => {
    const ids: string[] = [];

    if (Array.isArray(video.courseIds)) {
      video.courseIds.forEach((entry) => {
        if (typeof entry === "string") {
          ids.push(entry);
        } else if (isRecord(entry) && typeof entry._id === "string") {
          ids.push(entry._id);
        }
      });
    }

    if (video.courseId) {
      if (typeof video.courseId === "string") {
        ids.push(video.courseId);
      } else if (isRecord(video.courseId) && typeof video.courseId._id === "string") {
        ids.push(video.courseId._id);
      }
    }

    return Array.from(new Set(ids));
  }, []);

  const isCourseScoped = useCallback(
    (video: VideoItem) => collectCourseIds(video).length > 0,
    [collectCourseIds]
  );

  const getCourseNames = useCallback(
    (video: VideoItem) => {
      const ids = collectCourseIds(video);
      if (ids.length === 0) return "-";
      return ids.map((id) => courseLookup.get(id) || "Linked course").join(", ");
    },
    [collectCourseIds, courseLookup]
  );

  const handleViewDialogChange = (open: boolean) => {
    if (!open) {
      setVideoBeingViewed(null);
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open && !isDeleting) {
      setIsDeleteDialogOpen(false);
      setVideoPendingDelete(null);
    } else if (open) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoPendingDelete?._id) {
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading("Deleting video...");

    try {
      await deleteVideo(videoPendingDelete._id);
      setVideos((prev) => prev.filter((video) => video._id !== videoPendingDelete._id));
      toast.success("Video deleted successfully", { id: toastId });
      setIsDeleteDialogOpen(false);
      setVideoPendingDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete video"), { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setSelectedVideoIds((prev) =>
      prev.filter((id) => filteredVideos.some((video) => video._id === id))
    );
  }, [filteredVideos]);

  useEffect(() => {
    if (!isAssignDialogOpen) {
      setSelectedCourseIds([]);
    }
  }, [isAssignDialogOpen]);

  const visibleVideoIds = useMemo(
    () => filteredVideos.map((video) => video._id),
    [filteredVideos]
  );

  const allVisibleSelected =
    visibleVideoIds.length > 0 && visibleVideoIds.every((id) => selectedVideoIds.includes(id));

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedVideoIds((prev) => {
      if (checked) {
        const next = new Set([...prev, ...visibleVideoIds]);
        return Array.from(next);
      }
      return prev.filter((id) => !visibleVideoIds.includes(id));
    });
  };

  const handleAssignSubmit = async () => {
    if (selectedVideoIds.length === 0) {
      toast.error("Select at least one video to assign.");
      return;
    }

    const targetCourseIds = selectedCourseIds;
    const courseSpecific = targetCourseIds.length > 0;

    setIsAssigning(true);
    const loadingToast = toast.loading("Updating video assignment...");

    try {
      await Promise.all(
        selectedVideoIds.map((videoId) =>
          updateVideo(videoId, {
            isCourseSpecific: courseSpecific,
            courseIds: targetCourseIds,
          })
        )
      );

      toast.success(
        courseSpecific
          ? "Videos assigned to selected courses."
          : "Course assignment cleared. Videos are unassigned (shown as None).",
        { id: loadingToast }
      );

      setIsAssignDialogOpen(false);
      setSelectedVideoIds([]);
      fetchVideosList();
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to assign videos");
      toast.error(message, { id: loadingToast });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader title="Videos" description="Manage your recorded content." />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              <Input
                placeholder="Search videos by title"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="md:max-w-sm"
              />
              <div className="flex flex-1 justify-end gap-2">
                {selectedVideoIds.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setIsAssignDialogOpen(true)}
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Assign to Course ({selectedVideoIds.length})
                  </Button>
                )}
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </Button>
              </div>
            </div>

            {fetchError && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {fetchError}
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(checked) => handleSelectAllVisible(checked === true)}
                        aria-label="Select all videos"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading videos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                        No videos found. Use the button above to add your first video.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos.map((video) => (
                      <TableRow key={video._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedVideoIds.includes(video._id)}
                            onCheckedChange={() => handleSelectVideo(video._id)}
                            aria-label={`Select ${video.title}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(video.links || []).map((link, index) => (
                              <a
                                key={`${video._id}-link-${index}`}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Link2 className="h-3.5 w-3.5" />
                                Link {index + 1}
                              </a>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isCourseScoped(video) ? "Course-specific" : "Not assigned"}
                        </TableCell>
                        <TableCell>
                          {isCourseScoped(video) ? getCourseNames(video) : "None"}
                        </TableCell>
                        <TableCell>{formatDate(video.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setVideoBeingViewed(video)}>
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setVideoPendingDelete(video);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateVideoDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            fetchVideosList();
          }
        }}
        courses={courses}
        onSuccess={fetchVideosList}
      />

      <Dialog open={Boolean(videoBeingViewed)} onOpenChange={handleViewDialogChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Video Details</DialogTitle>
            <DialogDescription>Review the links and course scope for this video.</DialogDescription>
          </DialogHeader>
          {videoBeingViewed && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-base font-semibold text-foreground">{videoBeingViewed.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Scope</p>
                <p className="text-sm text-foreground">
                  {isCourseScoped(videoBeingViewed) ? "Course-specific" : "Not assigned"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Course</p>
                <p className="text-sm text-foreground">
                  {isCourseScoped(videoBeingViewed) ? getCourseNames(videoBeingViewed) : "None"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Video Links</p>
                <div className="space-y-1">
                  {(videoBeingViewed.links || []).map((link, index) => (
                    <a
                      key={`${videoBeingViewed._id}-view-link-${index}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {link}
                    </a>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">{formatDate(videoBeingViewed.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently remove
              {" "}
              <span className="font-semibold">
                {videoPendingDelete?.title ? `"${videoPendingDelete.title}"` : "this video"}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleDeleteVideo}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Assign Videos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedVideoIds.length} video{selectedVideoIds.length === 1 ? "" : "s"}
            </p>
            <div className="space-y-2">
              <Label>Select courses (leave empty for none)</Label>
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
                        />
                        <span className="text-sm line-clamp-1">{course.title}</span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to keep videos unassigned (shown as None).
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} disabled={isAssigning}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit} disabled={isAssigning || selectedVideoIds.length === 0}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
