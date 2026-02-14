"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  Eye,
  X,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  createEducatorPost,
  deleteEducatorPost,
  getEducatorPosts,
  updateEducatorPost,
} from "@/util/server";

const SUBJECT_OPTIONS = [
  "biology",
  "physics",
  "mathematics",
  "chemistry",
  "english",
  "hindi",
] as const;

const SPECIALIZATION_OPTIONS = ["IIT-JEE", "NEET", "CBSE"] as const;

interface Post {
  _id: string;
  title: string;
  description: string;
  subjects?: string[];
  specializations?: string[];
  subject?: string | string[];
  specialization?: string | string[];
  createdAt: string;
}

type FormState = {
  title: string;
  description: string;
  subjects: string[];
  specializations: string[];
};

const initialFormState: FormState = {
  title: "",
  description: "",
  subjects: [],
  specializations: [],
};

const formatLabel = (value: string) => {
  if (!value || typeof value !== "string") return value || "";
  return value
    .split(/[-_]/)
    .map((segment) =>
      segment.length > 0
        ? segment.charAt(0).toUpperCase() + segment.slice(1)
        : segment
    )
    .join(" ");
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const truncate = (value: string, length = 80) =>
  value.length > length ? `${value.slice(0, length - 3)}...` : value;

const resolveSubjects = (post?: Post) => {
  if (!post) return [] as string[];

  // Handle if subject/subjects is an array
  const subjectData = post.subjects || post.subject;
  if (Array.isArray(subjectData) && subjectData.length > 0) {
    return subjectData;
  }

  // Handle if it's a single string value
  if (typeof subjectData === "string") {
    return [subjectData];
  }

  return [];
};

const resolveSpecializations = (post?: Post) => {
  if (!post) return [] as string[];

  // Handle if specialization/specializations is an array
  const specializationData = post.specializations || post.specialization;
  if (Array.isArray(specializationData) && specializationData.length > 0) {
    return specializationData;
  }

  // Handle if it's a single string value
  if (typeof specializationData === "string") {
    return [specializationData];
  }

  return [];
};

export default function PostPage() {
  const { educator, isLoading: authLoading } = useAuth();
  const educatorId = educator?._id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [postBeingEdited, setPostBeingEdited] = useState<Post | null>(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] =
    useState(false);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const specializationDropdownRef = useRef<HTMLDivElement>(null);

  const isEditMode = dialogMode === "edit";

  const isTableLoading = authLoading || isFetching;

  const closeDropdowns = () => {
    setShowSubjectDropdown(false);
    setShowSpecializationDropdown(false);
  };

  useEffect(() => {
    if (!showSubjectDropdown && !showSpecializationDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        (subjectDropdownRef.current &&
          subjectDropdownRef.current.contains(target)) ||
        (specializationDropdownRef.current &&
          specializationDropdownRef.current.contains(target))
      ) {
        return;
      }

      closeDropdowns();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubjectDropdown, showSpecializationDropdown]);

  const openCreateDialog = () => {
    if (isSubmitting) return;
    setDialogMode("create");
    setPostBeingEdited(null);
    setFormData(initialFormState);
    closeDropdowns();
    setIsDialogOpen(true);
  };

  const startEditingPost = (post: Post) => {
    setDialogMode("edit");
    setPostBeingEdited(post);
    setFormData({
      title: post.title || "",
      description: post.description || "",
      subjects: resolveSubjects(post),
      specializations: resolveSpecializations(post),
    });
    closeDropdowns();
    setIsDialogOpen(true);
  };

  const toggleSubject = (value: string) => {
    setFormData((prev) => {
      const exists = prev.subjects.includes(value);
      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter((item) => item !== value)
          : [...prev.subjects, value],
      };
    });
  };

  const toggleSpecialization = (value: string) => {
    setFormData((prev) => {
      const exists = prev.specializations.includes(value);
      return {
        ...prev,
        specializations: exists
          ? prev.specializations.filter((item) => item !== value)
          : [...prev.specializations, value],
      };
    });
  };

  const fetchPosts = useCallback(async () => {
    if (!educatorId) {
      setPosts([]);
      return;
    }

    setIsFetching(true);
    try {
      const response = await getEducatorPosts(educatorId, {
        page: 1,
        limit: 50,
      });
      const list =
        response?.posts ||
        response?.data?.posts ||
        (Array.isArray(response) ? response : []);
      setPosts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to load posts");
    } finally {
      setIsFetching(false);
    }
  }, [educatorId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDialogChange = (open: boolean) => {
    if (!open && isSubmitting) {
      return;
    }
    setIsDialogOpen(open);
    if (!open) {
      setFormData(initialFormState);
      setDialogMode("create");
      setPostBeingEdited(null);
      closeDropdowns();
    }
  };

  const handleViewDialogChange = (open: boolean) => {
    if (!open) {
      setViewPost(null);
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open && !isDeleting) {
      setIsDeleteDialogOpen(false);
      setPostPendingDelete(null);
    } else if (open) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleViewPost = (post: Post) => {
    setViewPost(post);
  };

  const handleDeletePrompt = (post: Post) => {
    setPostPendingDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postPendingDelete?._id) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEducatorPost(postPendingDelete._id);
      setPosts((prev) =>
        prev.filter((post) => post._id !== postPendingDelete._id)
      );
      toast.success("Post deleted successfully");
      setIsDeleteDialogOpen(false);
      setPostPendingDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!educatorId) {
      toast.error("Educator context missing. Please re-login and try again.");
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error("Select at least one subject");
      return;
    }

    if (formData.specializations.length === 0) {
      toast.error("Select at least one specialization");
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedTitle = formData.title.trim();
      const trimmedDescription = formData.description.trim();

      const payload = {
        educatorId,
        title: trimmedTitle,
        description: trimmedDescription,
        subjects: formData.subjects,
        specializations: formData.specializations,
      };

      if (dialogMode === "edit" && postBeingEdited?._id) {
        await updateEducatorPost(postBeingEdited._id, payload);
        toast.success("Post updated successfully");
      } else {
        await createEducatorPost(payload);
        toast.success("Post created successfully");
      }

      setFormData(initialFormState);
      setDialogMode("create");
      setPostBeingEdited(null);
      setIsDialogOpen(false);
      closeDropdowns();
      fetchPosts();
    } catch (error) {
      const defaultMessage =
        dialogMode === "edit"
          ? "Failed to update post"
          : "Failed to create post";
      console.error(
        dialogMode === "edit" ? "Error updating post:" : "Error creating post:",
        error
      );
      const apiError = error as {
        response?: {
          data?: {
            errors?: Array<{ msg?: string; message?: string }>;
            message?: string;
          };
        };
      };
      const validationErrors = apiError.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        validationErrors.forEach((err) =>
          toast.error(err?.msg || err?.message || defaultMessage)
        );
      } else {
        toast.error(apiError.response?.data?.message || defaultMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const postCountLabel = useMemo(() => {
    if (posts.length === 1) return "1 post";
    return `${posts.length} posts`;
  }, [posts.length]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Posts"
        description="Share course updates, announcements, and resources with your learners."
      />

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {postCountLabel}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Your Published Posts
              </h2>
            </div>
            <Button
              className="gap-2"
              onClick={openCreateDialog}
              disabled={!educatorId}
            >
              <Plus className="h-4 w-4" /> Add Post
            </Button>
          </div>

          <div className="rounded-md border">
            {isTableLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  You have not published any posts yet.
                </p>
                <Button
                  className="mt-4 gap-2"
                  onClick={openCreateDialog}
                  disabled={!educatorId}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" /> Create your first post
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {post.title}
                        </p>
                      </TableCell>
                      <TableCell>
                        {resolveSubjects(post).length ? (
                          <div className="flex flex-wrap gap-1">
                            {resolveSubjects(post).map((subject) => (
                              <Badge key={subject} variant="outline">
                                {formatLabel(subject)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {resolveSpecializations(post).length ? (
                          <div className="flex flex-wrap gap-1">
                            {resolveSpecializations(post).map(
                              (specialization) => (
                                <Badge key={specialization}>
                                  {formatLabel(specialization)}
                                </Badge>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {truncate(post.description, 90)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPost(post)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => startEditingPost(post)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeletePrompt(post)}
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-red-900 font-semibold" />{" "}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Post" : "Create Post"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmitPost}>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g., Important announcement for Class 12"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Write the full details of your announcement..."
                rows={5}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 relative" ref={subjectDropdownRef}>
                <Label>Subjects *</Label>
                <div
                  className="min-h-[40px] w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm flex flex-wrap items-center gap-1"
                  onClick={() => {
                    if (isSubmitting) return;
                    setShowSubjectDropdown((prev) => !prev);
                    setShowSpecializationDropdown(false);
                  }}
                >
                  {formData.subjects.length ? (
                    formData.subjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="gap-1 capitalize cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isSubmitting) return;
                          toggleSubject(subject);
                        }}
                      >
                        {formatLabel(subject)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">
                      Select subjects
                    </span>
                  )}
                </div>
                {showSubjectDropdown && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
                    {SUBJECT_OPTIONS.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm capitalize hover:bg-accent"
                        onClick={() => toggleSubject(subject)}
                        disabled={isSubmitting}
                      >
                        <input
                          type="checkbox"
                          className="pointer-events-none"
                          checked={formData.subjects.includes(subject)}
                          readOnly
                        />
                        <span>{formatLabel(subject)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative" ref={specializationDropdownRef}>
                <Label>Exam *</Label>
                <div
                  className="min-h-[40px] w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm flex flex-wrap items-center gap-1"
                  onClick={() => {
                    if (isSubmitting) return;
                    setShowSpecializationDropdown((prev) => !prev);
                    setShowSubjectDropdown(false);
                  }}
                >
                  {formData.specializations.length ? (
                    formData.specializations.map((specialization) => (
                      <Badge
                        key={specialization}
                        variant="secondary"
                        className="gap-1 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isSubmitting) return;
                          toggleSpecialization(specialization);
                        }}
                      >
                        {specialization}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Select Exam</span>
                  )}
                </div>
                {showSpecializationDropdown && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
                    {SPECIALIZATION_OPTIONS.map((specialization) => (
                      <button
                        key={specialization}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                        onClick={() => toggleSpecialization(specialization)}
                        disabled={isSubmitting}
                      >
                        <input
                          type="checkbox"
                          className="pointer-events-none"
                          checked={formData.specializations.includes(
                            specialization
                          )}
                          readOnly
                        />
                        <span>{specialization}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Publish Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewPost)} onOpenChange={handleViewDialogChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {viewPost && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Title
                </p>
                <p className="text-base font-semibold text-foreground">
                  {viewPost.title}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {viewPost.description}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Subjects
                </p>
                <div className="flex flex-wrap gap-1">
                  {resolveSubjects(viewPost).map((subject) => (
                    <Badge key={subject} variant="outline">
                      {formatLabel(subject)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-1">
                  {resolveSpecializations(viewPost).map((specialization) => (
                    <Badge key={specialization}>
                      {formatLabel(specialization)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(viewPost.createdAt)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently remove{" "}
              <span className="font-semibold">
                {postPendingDelete?.title
                  ? `"${postPendingDelete.title}"`
                  : "this post"}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleConfirmDelete}
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
    </div>
  );
}
