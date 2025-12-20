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
import { Textarea } from "@/components/ui/textarea";
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
  X,
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
import { Switch } from "@/components/ui/switch";
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

const SUBJECT_OPTIONS = [
  { label: "Biology", value: "biology" },
  { label: "Physics", value: "physics" },
  { label: "Mathematics", value: "mathematics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
];

const getSubjectLabel = (value: string) => {
  const option = SUBJECT_OPTIONS.find((entry) => entry.value === value);
  return option ? option.label : value;
};

const SPECIALIZATION_OPTIONS = [
  { label: "IIT-JEE", value: "IIT-JEE" },
  { label: "NEET", value: "NEET" },
  { label: "CBSE", value: "CBSE" },
];

const getSpecializationLabel = (value: string) => {
  const option = SPECIALIZATION_OPTIONS.find((entry) => entry.value === value);
  return option ? option.label : value;
};

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

const getClassLabel = (value: string) => {
  const option = CLASS_OPTIONS.find((entry) => entry.value === value);
  return option ? option.label : value;
};

interface CourseOption {
  _id: string;
  title?: string;
  name?: string;
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
  introVideo?: string;
  isCourseSpecific?: boolean;
  assignInCourse?: CourseOption | string | null;
}

interface LiveClassFormValues {
  liveClassTitle: string;
  subjects: string[];
  specializations: string[];
  classTiming: string;
  classDuration: string;
  liveClassesFee: string;
  class: string[];
  description: string;
  maxStudents: string;
  isCourseSpecific: boolean;
  assignInCourse: string;
  introVideo: string;
}

const INITIAL_FORM_VALUES: LiveClassFormValues = {
  liveClassTitle: "",
  subjects: [],
  specializations: [],
  classTiming: "",
  classDuration: "",
  liveClassesFee: "",
  class: [],
  description: "",
  maxStudents: "",
  isCourseSpecific: false,
  assignInCourse: "",
  introVideo: "",
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

const getCourseLabel = (course?: CourseOption | string | null) => {
  if (!course) return "All Courses";
  if (typeof course === "string") return course;
  return course.title || course.name || "Course";
};

const toggleArrayValue = (current: string[], value: string) =>
  current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

const buildLiveClassPayload = (
  values: LiveClassFormValues,
  educatorId: string
) => {
  const normalizedSubjects = values.subjects.map((entry) =>
    entry.toLowerCase()
  );
  const normalizedSpecializations = values.specializations.map((entry) =>
    entry.toUpperCase()
  );

  const payload: Record<string, unknown> = {
    liveClassTitle: values.liveClassTitle.trim(),
    subject: normalizedSubjects,
    liveClassSpecification: normalizedSpecializations,
    classTiming: new Date(values.classTiming).toISOString(),
    classDuration: Number(values.classDuration),
    liveClassesFee: Number(values.liveClassesFee),
    class: values.class,
    educatorID: educatorId,
    isCourseSpecific: values.isCourseSpecific,
  };

  if (values.description.trim()) {
    payload.description = values.description.trim();
  }

  if (values.maxStudents) {
    payload.maxStudents = Number(values.maxStudents);
  }

  if (values.introVideo.trim()) {
    payload.introVideo = values.introVideo.trim();
  }

  if (values.isCourseSpecific && values.assignInCourse) {
    payload.assignInCourse = values.assignInCourse;
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
    if (
      formData.subjects.length === 0 ||
      formData.specializations.length === 0
    ) {
      setError("Please select subject and specialization.");
      return;
    }
    if (!formData.classTiming) {
      setError("Please select a class schedule.");
      return;
    }
    if (formData.class.length === 0) {
      setError("Select at least one class level.");
      return;
    }
    if (formData.isCourseSpecific && !formData.assignInCourse) {
      setError("Please select a course to assign this live class.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = buildLiveClassPayload(formData, educatorId);
      const response = await createLiveClass(payload);
      const created = response?.data ?? response;
      if (created) {
        setLiveClasses((prev) => [created, ...prev]);
      }
      resetCreateForm();
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
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (liveClass: LiveClass) => {
    setEditingId(liveClass._id);
    const normalizedSubjects = normalizeMultiValue(liveClass.subject);
    const normalizedSpecializations = normalizeMultiValue(
      liveClass.liveClassSpecification
    );
    setEditFormData({
      liveClassTitle: liveClass.liveClassTitle || "",
      subjects: normalizedSubjects,
      specializations: normalizedSpecializations,
      classTiming: toDateTimeLocalValue(liveClass.classTiming),
      classDuration: liveClass.classDuration?.toString() || "",
      liveClassesFee: liveClass.liveClassesFee?.toString() || "",
      class: liveClass.class || [],
      description: liveClass.description || "",
      maxStudents: liveClass.maxStudents?.toString() || "",
      isCourseSpecific: Boolean(liveClass.isCourseSpecific),
      assignInCourse:
        typeof liveClass.assignInCourse === "string"
          ? liveClass.assignInCourse
          : liveClass.assignInCourse?._id || "",
      introVideo: liveClass.introVideo || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!educatorId || !editingId) return;
    if (
      editFormData.subjects.length === 0 ||
      editFormData.specializations.length === 0
    ) {
      setError("Please select subject and specialization.");
      return;
    }
    if (!editFormData.classTiming) {
      setError("Please select a class schedule.");
      return;
    }
    if (editFormData.class.length === 0) {
      setError("Select at least one class level.");
      return;
    }
    if (editFormData.isCourseSpecific && !editFormData.assignInCourse) {
      setError("Please select a course to assign this live class.");
      return;
    }

    setIsEditSubmitting(true);
    setError(null);
    try {
      const payload = buildLiveClassPayload(editFormData, educatorId);
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
    }
  };

  const handleEditDialogChange = (nextOpen: boolean) => {
    setEditOpen(nextOpen);
    if (!nextOpen) {
      resetEditForm();
    }
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
                <DialogContent className="sm:max-w-[720px]">
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
                  />
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Live Class</TableHead>
                    <TableHead>Subject</TableHead>
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
        <DialogContent className="sm:max-w-[520px]">
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
              {selectedLiveClass.introVideo && (
                <div>
                  <p className="text-sm text-muted-foreground">Intro Video</p>
                  <a
                    href={selectedLiveClass.introVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedLiveClass.introVideo}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-[720px]">
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
};

function LiveClassForm({
  values,
  setValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  courses,
  coursesLoading,
}: LiveClassFormProps) {
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] =
    useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const handleSubjectToggle = (subjectValue: string) => {
    setValues((prev) => ({
      ...prev,
      subjects: toggleArrayValue(prev.subjects, subjectValue),
    }));
  };

  const handleSpecializationToggle = (specValue: string) => {
    setValues((prev) => ({
      ...prev,
      specializations: toggleArrayValue(prev.specializations, specValue),
    }));
  };

  const handleClassToggle = (classValue: string) => {
    setValues((prev) => ({
      ...prev,
      class: toggleArrayValue(prev.class, classValue),
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="liveClassTitle">Title</Label>
          <Input
            id="liveClassTitle"
            value={values.liveClassTitle}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, liveClassTitle: e.target.value }))
            }
            placeholder="Live class title"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Add a short description (optional)"
            rows={3}
            className="min-h-[104px]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 relative">
          <Label>Subjects</Label>
          <div
            className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
            onClick={() => {
              setShowSubjectDropdown((prev) => !prev);
              setShowSpecializationDropdown(false);
              setShowClassDropdown(false);
            }}
          >
            {values.subjects?.length ? (
              values.subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="gap-1 capitalize"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSubjectToggle(subject);
                  }}
                >
                  {getSubjectLabel(subject)}
                  <X className="h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Select subjects</span>
            )}
          </div>
          {showSubjectDropdown && (
            <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md p-2 max-h-56 overflow-y-auto">
              {SUBJECT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer text-sm"
                  onClick={() => handleSubjectToggle(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={values.subjects.includes(option.value)}
                    readOnly
                  />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2 relative">
          <Label>Specialization</Label>
          <div
            className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
            onClick={() => {
              setShowSpecializationDropdown((prev) => !prev);
              setShowSubjectDropdown(false);
              setShowClassDropdown(false);
            }}
          >
            {values.specializations.length ? (
              values.specializations.map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="gap-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSpecializationToggle(spec);
                  }}
                >
                  {getSpecializationLabel(spec)}
                  <X className="h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">
                Select specialization
              </span>
            )}
          </div>
          {showSpecializationDropdown && (
            <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md p-2">
              {SPECIALIZATION_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer text-sm"
                  onClick={() => handleSpecializationToggle(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={values.specializations.includes(option.value)}
                    readOnly
                  />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="classTiming">Class Timing</Label>
          <Input
            id="classTiming"
            type="datetime-local"
            value={values.classTiming}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, classTiming: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classDuration">Duration (mins)</Label>
          <Input
            id="classDuration"
            type="number"
            min={1}
            max={480}
            value={values.classDuration}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, classDuration: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="liveClassesFee">Fee (₹)</Label>
          <Input
            id="liveClassesFee"
            type="number"
            min={0}
            value={values.liveClassesFee}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, liveClassesFee: e.target.value }))
            }
            placeholder="Enter fee"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxStudents">Max Students</Label>
          <Input
            id="maxStudents"
            type="number"
            min={1}
            value={values.maxStudents}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, maxStudents: e.target.value }))
            }
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2 relative">
        <Label>Target Classes</Label>
        <div
          className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
          onClick={() => {
            setShowClassDropdown((prev) => !prev);
            setShowSubjectDropdown(false);
            setShowSpecializationDropdown(false);
          }}
        >
          {values.class.length ? (
            values.class.map((classValue) => (
              <Badge
                key={classValue}
                variant="secondary"
                className="gap-1"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClassToggle(classValue);
                }}
              >
                {getClassLabel(classValue)}
                <X className="h-3 w-3" />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">Select classes</span>
          )}
        </div>
        {showClassDropdown && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md p-2 max-h-60 overflow-y-auto">
            {CLASS_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => handleClassToggle(option.value)}
              >
                <input
                  type="checkbox"
                  checked={values.class.includes(option.value)}
                  readOnly
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="introVideo">Intro Video URL</Label>
          <Input
            id="introVideo"
            type="url"
            value={values.introVideo}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, introVideo: e.target.value }))
            }
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span>Assign to Course</span>
            <span className="text-xs text-muted-foreground">
              Toggle to restrict
            </span>
          </Label>
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Switch
              id="isCourseSpecific"
              checked={values.isCourseSpecific}
              onCheckedChange={(checked) =>
                setValues((prev) => ({
                  ...prev,
                  isCourseSpecific: Boolean(checked),
                  assignInCourse: checked ? prev.assignInCourse : "",
                }))
              }
            />
            <span className="text-sm">Course specific</span>
          </div>
          <Select
            value={values.assignInCourse}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, assignInCourse: value }))
            }
            disabled={!values.isCourseSpecific || coursesLoading}
          >
            <SelectTrigger className="mt-2">
              <SelectValue
                placeholder={
                  coursesLoading
                    ? "Loading courses..."
                    : values.isCourseSpecific
                    ? "Select course"
                    : "All courses"
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
                  {course.title || course.name || "Untitled course"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
