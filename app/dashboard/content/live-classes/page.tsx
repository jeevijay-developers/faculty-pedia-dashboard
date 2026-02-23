"use client";

import {
  Dispatch,
  FormEvent,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  createLiveClass,
  deleteLiveClass,
  getCoursesByEducator,
  getLiveClassesByEducator,
  updateLiveClass,
} from "@/util/server";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

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

interface CourseOption {
  _id: string;
  title?: string;
  name?: string;
  subject?: string | string[];
  specialization?: string | string[];
  class?: string | string[];
}

interface LiveClass {
  _id: string;
  liveClassTitle: string;
  subject: string | string[];
  liveClassSpecification: string | string[];
  classTiming: string;
  classDuration: number;
  liveClassesFee: number;
  class: string[];
  description?: string;
  maxStudents?: number;
  liveClassLink?: string;
  recordingURL?: string;
  isCourseSpecific?: boolean;
  assignInCourse?: CourseOption | string | null;
}

interface LiveClassFormValues {
  liveClassTitle: string;
  classTiming: string;
  classDuration: string;
  liveClassLink: string;
  assignInCourse: string;
}

const INITIAL_FORM_VALUES: LiveClassFormValues = {
  liveClassTitle: "",
  classTiming: "",
  classDuration: "",
  liveClassLink: "",
  assignInCourse: "",
};

const normalizeMultiValue = (value?: string | string[] | null) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (entry) => typeof entry === "string" && entry.trim().length > 0
    );
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

const formatSubjects = (subject?: string | string[]) => {
  const list = normalizeMultiValue(subject);
  if (list.length === 0) return "-";
  return list
    .map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1))
    .join(", ");
};

const formatSpecifications = (specifications?: string | string[]) => {
  const list = normalizeMultiValue(specifications);
  if (list.length === 0) return "-";
  return list.join(", ");
};

const formatClasses = (classes: string[] = []) =>
  classes
    .map((value) => {
      const option = CLASS_OPTIONS.find((option) => option.value === value);
      return option ? option.label : value;
    })
    .join(", ");

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "-";
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatDateTime = (isoDate?: string) => {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocalValue = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const buildLiveClassPayload = (
  values: LiveClassFormValues,
  educatorId: string,
  selectedCourse?: CourseOption
) => {
  const normalizedSubjects = normalizeMultiValue(selectedCourse?.subject).map(
    (entry) => entry.toLowerCase()
  );
  const normalizedSpecializations = normalizeMultiValue(
    selectedCourse?.specialization
  ).map((entry) => entry.toUpperCase());
  const normalizedClasses = normalizeMultiValue(selectedCourse?.class);

  const subjects = normalizedSubjects.length ? normalizedSubjects : ["english"];
  const specializations =
    normalizedSpecializations.length ? normalizedSpecializations : ["CBSE"];
  const classes = normalizedClasses.length ? normalizedClasses : ["class-10th"];

  const payload: Record<string, unknown> = {
    liveClassTitle: values.liveClassTitle.trim(),
    subject: subjects,
    liveClassSpecification: specializations,
    classTiming: new Date(values.classTiming).toISOString(),
    classDuration: Number(values.classDuration),
    liveClassesFee: 0,
    class: classes,
    educatorID: educatorId,
    isCourseSpecific: true,
    assignInCourse: values.assignInCourse,
  };

  if (values.liveClassLink.trim()) {
    payload.liveClassLink = values.liveClassLink.trim();
  }

  return payload;
};

export default function LiveClassesPage() {
  const { educator } = useAuth();
  const educatorId = educator?._id;

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [formData, setFormData] =
    useState<LiveClassFormValues>(INITIAL_FORM_VALUES);
  const [editFormData, setEditFormData] =
    useState<LiveClassFormValues>(INITIAL_FORM_VALUES);
  const [selectedLiveClass, setSelectedLiveClass] = useState<LiveClass | null>(
    null
  );
  const [liveClassToDelete, setLiveClassToDelete] = useState<LiveClass | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const courseNameById = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((course) => {
      map.set(course._id, course.title || course.name || "Untitled course");
    });
    return map;
  }, [courses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLiveClasses = useCallback(async () => {
    if (!educatorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLiveClassesByEducator(educatorId, {
        limit: 100,
      });
      const liveClassList =
        response?.data?.liveClasses ??
        response?.data ??
        response?.liveClasses ??
        [];
      setLiveClasses(liveClassList);
    } catch (err) {
      console.error("Error fetching live classes:", err);
      let message = "Unable to load live classes.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const responseErr = err as {
          response?: { data?: { message?: string } };
        };
        message = responseErr.response?.data?.message ?? message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [educatorId]);

  useEffect(() => {
    fetchLiveClasses();
  }, [fetchLiveClasses]);

  const fetchCourses = useCallback(async () => {
    if (!educatorId) return;
    setCoursesLoading(true);
    try {
      const response = await getCoursesByEducator(educatorId, { limit: 100 });
      const courseList = response?.courses ?? response?.data?.courses ?? [];
      setCourses(courseList);
    } catch (err) {
      console.error("Error fetching educator courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  }, [educatorId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredLiveClasses = useMemo(() => {
    if (!debouncedSearchQuery) return liveClasses;
    return liveClasses.filter((liveClass) =>
      liveClass.liveClassTitle
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase())
    );
  }, [liveClasses, debouncedSearchQuery]);

  const resetCreateForm = () => {
    setFormData(INITIAL_FORM_VALUES);
  };

  const resetEditForm = () => {
    setEditingId(null);
    setEditFormData(INITIAL_FORM_VALUES);
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!educatorId) return;
    setCreateFormError(null);
    if (!formData.liveClassTitle.trim()) {
      setCreateFormError("Please enter a title.");
      return;
    }
    if (!formData.classDuration || Number(formData.classDuration) <= 0) {
      setCreateFormError("Please enter a valid duration in minutes.");
      return;
    }
    if (!formData.classTiming) {
      setCreateFormError("Please select a class schedule.");
      return;
    }
    if (!formData.assignInCourse) {
      setCreateFormError("Please select a course to assign this live class.");
      return;
    }

    const selectedCourse = courses.find(
      (course) => course._id === formData.assignInCourse
    );
    if (!selectedCourse) {
      setCreateFormError("Selected course not found. Please choose a valid course.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = buildLiveClassPayload(formData, educatorId, selectedCourse);
      const response = await createLiveClass(payload);
      const created = response?.data ?? response;
      if (created) {
        setLiveClasses((prev) => [created, ...prev]);
      }
      resetCreateForm();
      setCreateFormError(null);
      setOpen(false);
      toast.success("Live class created successfully");
    } catch (err) {
      console.error("Error creating live class:", err);
      let message = "Unable to create live class.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const responseErr = err as {
          response?: { data?: { message?: string } };
        };
        message = responseErr.response?.data?.message ?? message;
      }
      setCreateFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (liveClass: LiveClass) => {
    setEditingId(liveClass._id);
    setEditFormData({
      liveClassTitle: liveClass.liveClassTitle || "",
      classTiming: toDateTimeLocalValue(liveClass.classTiming),
      classDuration: liveClass.classDuration?.toString() || "",
      assignInCourse:
        typeof liveClass.assignInCourse === "string"
          ? liveClass.assignInCourse
          : liveClass.assignInCourse?._id || "",
      liveClassLink: liveClass.liveClassLink || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!educatorId || !editingId) return;
    if (!editFormData.liveClassTitle.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!editFormData.classDuration || Number(editFormData.classDuration) <= 0) {
      setError("Please enter a valid duration in minutes.");
      return;
    }
    if (!editFormData.classTiming) {
      setError("Please select a class schedule.");
      return;
    }
    if (!editFormData.assignInCourse) {
      setError("Please select a course to assign this live class.");
      return;
    }

    const selectedCourse = courses.find(
      (course) => course._id === editFormData.assignInCourse
    );
    if (!selectedCourse) {
      setError("Selected course not found. Please choose a valid course.");
      return;
    }

    setIsEditSubmitting(true);
    setError(null);
    try {
      const payload = buildLiveClassPayload(
        editFormData,
        educatorId,
        selectedCourse
      );
      const response = await updateLiveClass(editingId, payload);
      const updated = response?.data ?? response;
      if (updated) {
        setLiveClasses((prev) =>
          prev.map((liveClass) =>
            liveClass._id === updated._id ? updated : liveClass
          )
        );
      }
      resetEditForm();
      setEditOpen(false);
      toast.success("Live class updated successfully");
    } catch (err) {
      console.error("Error updating live class:", err);
      let message = "Unable to update live class.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const responseErr = err as {
          response?: { data?: { message?: string } };
        };
        message = responseErr.response?.data?.message ?? message;
      }
      setError(message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteClick = (liveClass: LiveClass) => {
    setLiveClassToDelete(liveClass);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!liveClassToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteLiveClass(liveClassToDelete._id);
      setLiveClasses((prev) =>
        prev.filter((lc) => lc._id !== liveClassToDelete._id)
      );
      setDeleteOpen(false);
      setLiveClassToDelete(null);
      toast.success("Live class deleted successfully");
    } catch (err) {
      console.error("Error deleting live class:", err);
      let message = "Unable to delete live class.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const responseErr = err as {
          response?: { data?: { message?: string } };
        };
        message = responseErr.response?.data?.message ?? message;
      }
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (liveClass: LiveClass) => {
    setSelectedLiveClass(liveClass);
    setViewOpen(true);
  };

  const handleCreateDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetCreateForm();
      setCreateFormError(null);
    }
  };

  const handleEditDialogChange = (nextOpen: boolean) => {
    setEditOpen(nextOpen);
    if (!nextOpen) {
      resetEditForm();
    }
  };

  const getCourseName = (value: CourseOption | string | null | undefined) => {
    if (!value) return "—";
    if (typeof value === "string") {
      return courseNameById.get(value) || value || "Course";
    }
    const directName = value.title || value.name;
    if (directName) return directName;
    if (value._id) {
      return courseNameById.get(value._id) || value._id;
    }
    return "Course";
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Live Classes" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:max-w-sm"
              />
              <Dialog open={open} onOpenChange={handleCreateDialogChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Live Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Live Class</DialogTitle>
                  </DialogHeader>
                  <LiveClassForm
                    values={formData}
                    setValues={setFormData}
                    onSubmit={handleCreateSubmit}
                    isSubmitting={isSubmitting}
                    submitLabel="Create"
                    courses={courses}
                    coursesLoading={coursesLoading}
                    formError={createFormError}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Live Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Classes</TableHead>
                   
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Loading live classes...
                      </TableCell>
                    </TableRow>
                  ) : filteredLiveClasses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No live classes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLiveClasses.map((liveClass) => (
                      <TableRow key={liveClass._id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {liveClass.liveClassTitle}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">
                              {formatSubjects(liveClass.subject)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatSpecifications(
                                liveClass.liveClassSpecification
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {getCourseName(liveClass.assignInCourse)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDateTime(liveClass.classTiming)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {liveClass.classDuration || 0} mins
                        </TableCell>
                        <TableCell>
                          {formatCurrency(liveClass.liveClassesFee)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(liveClass.class || []).map((classValue) => (
                              <Badge
                                key={`${liveClass._id}-${classValue}`}
                                variant="secondary"
                              >
                                {CLASS_OPTIONS.find(
                                  (option) => option.value === classValue
                                )?.label || classValue}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(liveClass)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(liveClass)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(liveClass)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Live Class Details</DialogTitle>
          </DialogHeader>
          {selectedLiveClass && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">
                  {selectedLiveClass.liveClassTitle}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">
                    {formatSubjects(selectedLiveClass.subject)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Specialization
                  </p>
                  <p className="font-medium">
                    {formatSpecifications(
                      selectedLiveClass.liveClassSpecification
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Schedule</p>
                  <p className="font-medium">
                    {formatDateTime(selectedLiveClass.classTiming)}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedLiveClass.classDuration} mins
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">
                    {formatCurrency(selectedLiveClass.liveClassesFee)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Students</p>
                  <p className="font-medium">
                    {selectedLiveClass.maxStudents || "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Classes</p>
                <p className="font-medium">
                  {formatClasses(selectedLiveClass.class)}
                </p>
              </div>
              {selectedLiveClass.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedLiveClass.description}</p>
                </div>
              )}
              {selectedLiveClass.liveClassLink && (
                <div>
                  <p className="text-sm text-muted-foreground">Live Class Link</p>
                  <a
                    href={selectedLiveClass.liveClassLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedLiveClass.liveClassLink}
                  </a>
                </div>
              )}
              {selectedLiveClass.recordingURL && (
                <div>
                  <p className="text-sm text-muted-foreground">Recording Link</p>
                  <a
                    href={selectedLiveClass.recordingURL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedLiveClass.recordingURL}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Live Class</DialogTitle>
          </DialogHeader>
          <LiveClassForm
            values={editFormData}
            setValues={setEditFormData}
            onSubmit={handleEditSubmit}
            isSubmitting={isEditSubmitting}
            submitLabel="Save Changes"
            courses={courses}
            coursesLoading={coursesLoading}
            formError={null}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete live class?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. &ldquo;
              {liveClassToDelete?.liveClassTitle}&rdquo; will be removed
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

type LiveClassFormProps = {
  values: LiveClassFormValues;
  setValues: Dispatch<React.SetStateAction<LiveClassFormValues>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitLabel: string;
  courses: CourseOption[];
  coursesLoading: boolean;
  formError?: string | null;
};

function LiveClassForm({
  values,
  setValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  courses,
  coursesLoading,
  formError,
}: LiveClassFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="liveClassTitle">Title</Label>
        <Input
          id="liveClassTitle"
          value={values.liveClassTitle}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, liveClassTitle: event.target.value }))
          }
          placeholder="Live class title"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="classDuration">Duration (mins)</Label>
          <Input
            id="classDuration"
            type="number"
            min={1}
            max={480}
            value={values.classDuration}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, classDuration: event.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classTiming">Timing</Label>
          <Input
            id="classTiming"
            type="datetime-local"
            value={values.classTiming}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, classTiming: event.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="liveClassLink">Link</Label>
        <Input
          id="liveClassLink"
          type="url"
          value={values.liveClassLink}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, liveClassLink: event.target.value }))
          }
          placeholder="https://example.com/live"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignInCourse">Select Course</Label>
        <Select
          value={values.assignInCourse}
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, assignInCourse: value }))
          }
          disabled={coursesLoading}
        >
          <SelectTrigger className="!w-full [&>span]:truncate [&>span]:max-w-full [&>span]:block">
            <SelectValue
              placeholder={
                coursesLoading ? "Loading courses..." : "Choose a course"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {coursesLoading && (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            )}
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                <span
                  className="truncate block max-w-[400px]"
                  title={course.title || course.name || "Untitled course"}
                >
                  {course.title || course.name || "Untitled course"}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
