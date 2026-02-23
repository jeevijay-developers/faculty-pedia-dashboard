"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Eye, Download, MoreHorizontal, Trash2, ListChecks } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AddStudyMaterialDialog, type CourseSummary } from "@/components/add-study-material-dialog"
import {
  deleteStudyMaterialEntry,
  getCoursesByEducator,
  getStudyMaterialsByEducator,
  updateStudyMaterialEntry,
} from "@/util/server"
import toast from "react-hot-toast"

interface StudyMaterialDoc {
  _id: string
  name: string
  originalName: string
  fileType: string
  mimeType: string
  url: string
  sizeInBytes: number
}

interface StudyMaterialItem {
  _id: string
  title: string
  description?: string
  tags?: string[]
  docs: StudyMaterialDoc[]
  isCourseSpecific: boolean
  courseId?: {
    _id: string
    title?: string
    slug?: string
  }
  courseIds?: Array<
    | string
    | {
        _id: string
        title?: string
        slug?: string
      }
  >
  createdAt?: string
  updatedAt?: string
}

type ValidationErrorEntry = {
  msg?: string
  message?: string
}

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string
      errors?: ValidationErrorEntry[]
    }
  }
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isStudyMaterialArray = (value: unknown): value is StudyMaterialItem[] =>
  Array.isArray(value)

const isCourseArray = (value: unknown): value is CourseSummary[] =>
  Array.isArray(value)

const isApiErrorResponse = (error: unknown): error is ApiErrorResponse =>
  typeof error === "object" && error !== null

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  if (isApiErrorResponse(error)) {
    const validationMessage = error.response?.data?.errors?.[0]
    if (validationMessage) {
      return (
        (typeof validationMessage.msg === "string" && validationMessage.msg) ||
        (typeof validationMessage.message === "string" && validationMessage.message) ||
        fallback
      )
    }

    const nestedMessage = error.response?.data?.message
    if (typeof nestedMessage === "string") {
      return nestedMessage
    }

    if (typeof error.message === "string") {
      return error.message
    }
  }

  return fallback
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatFileSize = (size?: number) => {
  if (typeof size !== "number" || Number.isNaN(size)) {
    return "-"
  }

  const units = ["B", "KB", "MB", "GB"]
  let currentSize = size
  let unitIndex = 0

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024
    unitIndex += 1
  }

  const digits = currentSize >= 10 || unitIndex === 0 ? 0 : 1
  return `${currentSize.toFixed(digits)} ${units[unitIndex]}`
}

const normalizeStudyMaterials = (payload: unknown): StudyMaterialItem[] => {
  if (!payload) return []
  if (isStudyMaterialArray(payload)) return payload

  if (isRecord(payload)) {
    if (isStudyMaterialArray(payload.studyMaterials)) {
      return payload.studyMaterials
    }

    const nestedData = payload.data
    if (isRecord(nestedData) && isStudyMaterialArray(nestedData.studyMaterials)) {
      return nestedData.studyMaterials
    }

    if (isStudyMaterialArray(nestedData)) {
      return nestedData
    }
  }

  return []
}

const normalizeCourses = (payload: unknown): CourseSummary[] => {
  if (!payload) return []
  if (isCourseArray(payload)) return payload

  if (isRecord(payload)) {
    if (isCourseArray(payload.courses)) {
      return payload.courses
    }

    const dataField = payload.data
    if (isRecord(dataField) && isCourseArray(dataField.courses)) {
      return dataField.courses
    }

    if (isCourseArray(dataField)) {
      return dataField
    }
  }

  return []
}

export default function StudyMaterialPage() {
  const { educator, isLoading: authLoading } = useAuth()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialItem[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterialItem | null>(null)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [materialPendingDelete, setMaterialPendingDelete] = useState<StudyMaterialItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedAssignCourseIds, setSelectedAssignCourseIds] = useState<string[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  const courseNameMap = useMemo(
    () => new Map(courses.map((course) => [course._id, course.title || "Untitled course"])),
    [courses]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim().toLowerCase())
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchStudyMaterials = useCallback(async () => {
    if (!educator?._id) {
      return
    }

    setIsFetching(true)
    setFetchError(null)
    try {
      const response = await getStudyMaterialsByEducator(educator._id)
      setStudyMaterials(normalizeStudyMaterials(response))
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to load study materials")
      setFetchError(message)
    } finally {
      setIsFetching(false)
    }
  }, [educator?._id])

  const fetchCourses = useCallback(async () => {
    if (!educator?._id) {
      return
    }

    try {
      const response = await getCoursesByEducator(educator._id, { limit: 100 })
      setCourses(normalizeCourses(response))
    } catch (error: unknown) {
      console.warn("Unable to fetch courses for study material modal", error)
    }
  }, [educator?._id])

  useEffect(() => {
    fetchStudyMaterials()
  }, [fetchStudyMaterials])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    setSelectedMaterialIds((prev) =>
      prev.filter((id) => studyMaterials.some((material) => material._id === id))
    )
  }, [studyMaterials])

  useEffect(() => {
    if (!isAssignDialogOpen) {
      setSelectedAssignCourseIds([])
    }
  }, [isAssignDialogOpen])

  const filteredMaterials = useMemo(() => {
    if (!debouncedSearchQuery) {
      return studyMaterials
    }

    return studyMaterials.filter((material) => {
      const titleMatch = material.title?.toLowerCase().includes(debouncedSearchQuery)
      const descriptionMatch = material.description?.toLowerCase().includes(debouncedSearchQuery)
      return Boolean(titleMatch || descriptionMatch)
    })
  }, [studyMaterials, debouncedSearchQuery])

  const getCourseNames = useCallback(
    (material: StudyMaterialItem) => {
      if (!material.isCourseSpecific) {
        return "None"
      }

      const collectedIds: string[] = []

      if (Array.isArray(material.courseIds)) {
        material.courseIds.forEach((entry) => {
          if (typeof entry === "string") {
            collectedIds.push(entry)
          } else if (entry?._id) {
            collectedIds.push(entry._id)
          }
        })
      }

      if (material.courseId) {
        if (typeof material.courseId === "string") {
          collectedIds.push(material.courseId)
        } else if (material.courseId._id) {
          collectedIds.push(material.courseId._id)
        }
      }

      const uniqueIds = Array.from(new Set(collectedIds))

      if (uniqueIds.length === 0) {
        if (typeof material.courseId === "object") {
          return material.courseId.title || "Linked course"
        }
        return "None"
      }

      const names = uniqueIds.map((id) => courseNameMap.get(id) || "Linked course")
      return names.join(", ")
    },
    [courseNameMap]
  )

  const handleViewMaterial = (material: StudyMaterialItem) => {
    setSelectedMaterial(material)
    setViewOpen(true)
  }

  const handleDeleteClick = (material: StudyMaterialItem) => {
    setMaterialPendingDelete(material)
    setDeleteDialogOpen(true)
  }

  const handleDeleteDialogChange = (nextOpen: boolean) => {
    setDeleteDialogOpen(nextOpen)
    if (!nextOpen) {
      setMaterialPendingDelete(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!materialPendingDelete) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteStudyMaterialEntry(materialPendingDelete._id)
      setStudyMaterials((prev) => prev.filter((item) => item._id !== materialPendingDelete._id))
      if (selectedMaterial?._id === materialPendingDelete._id) {
        setSelectedMaterial(null)
        setViewOpen(false)
      }
      toast.success("Study material deleted successfully.")
      handleDeleteDialogChange(false)
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to delete study material")
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const visibleMaterialIds = useMemo(
    () => filteredMaterials.map((material) => material._id),
    [filteredMaterials]
  )

  const allVisibleSelected =
    visibleMaterialIds.length > 0 && visibleMaterialIds.every((id) => selectedMaterialIds.includes(id))

  const handleSelectMaterial = (materialId: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    )
  }

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedMaterialIds((prev) => {
      if (checked) {
        const next = new Set([...prev, ...visibleMaterialIds])
        return Array.from(next)
      }
      return prev.filter((id) => !visibleMaterialIds.includes(id))
    })
  }

  const handleAssignSubmit = async () => {
    if (selectedMaterialIds.length === 0) {
      toast.error("Select at least one study material to assign.")
      return
    }

    const targetCourseIds = selectedAssignCourseIds
    const courseSpecific = targetCourseIds.length > 0

    setIsAssigning(true)
    const loadingToast = toast.loading("Updating study material assignment...")

    try {
      await Promise.all(
        selectedMaterialIds.map((materialId) =>
          updateStudyMaterialEntry(materialId, {
            isCourseSpecific: courseSpecific,
            courseIds: targetCourseIds,
          })
        )
      )

      toast.success(
        courseSpecific
          ? "Study materials assigned to selected courses."
          : "Course assignment cleared. Materials are not linked to any course.",
        { id: loadingToast }
      )

      setIsAssignDialogOpen(false)
      setSelectedMaterialIds([])
      fetchStudyMaterials()
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to assign study materials")
      toast.error(message, { id: loadingToast })
    } finally {
      setIsAssigning(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    )
  }

  if (!educator) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please log in to manage study materials.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Study Material" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search study materials by title or description..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {selectedMaterialIds.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setIsAssignDialogOpen(true)}
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Assign to Course ({selectedMaterialIds.length})
                  </Button>
                )}
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setIsAddDialogOpen(true)}
                  disabled={!educator}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Study Material
                </Button>
              </div>
            </div>

            {fetchError && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
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
                        aria-label="Select all study materials"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Documents</TableHead>
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
                          <span>Loading study materials...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                        No study materials found. Use the button above to add your first resource.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map((material) => (
                      <TableRow key={material._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMaterialIds.includes(material._id)}
                            onCheckedChange={() => handleSelectMaterial(material._id)}
                            aria-label={`Select ${material.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{material.title}</div>
                          {material.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {material.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {getCourseNames(material)}
                        </TableCell>
                        <TableCell className="space-y-1">
                          {material.tags && material.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {material.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                              {material.tags.length > 4 && (
                                <Badge variant="outline">+{material.tags.length - 4}</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {material.docs?.length || 0} file(s)
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {material.docs?.map((doc) => doc.fileType).join(", ") || ""}
                          </p>
                        </TableCell>
                        <TableCell>{formatDate(material.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewMaterial(material)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(material)}
                                className="text-red-600 focus:text-red-600"
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

      <AddStudyMaterialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        educatorId={educator?._id}
        onSuccess={fetchStudyMaterials}
        courses={courses}
      />

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Assign Study Materials</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedMaterialIds.length} material{selectedMaterialIds.length === 1 ? "" : "s"}
            </p>
            <div className="space-y-2">
              <Label>Select courses (leave empty for all)</Label>
              <div className="max-h-56 overflow-y-auto rounded-md border p-2 space-y-2">
                {courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses available.</p>
                ) : (
                  courses.map((course) => {
                    const checked = selectedAssignCourseIds.includes(course._id)
                    return (
                      <label
                        key={course._id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setSelectedAssignCourseIds((prev) =>
                              value === true
                                ? [...prev, course._id]
                                : prev.filter((id) => id !== course._id)
                            )
                          }}
                        />
                        <span className="text-sm line-clamp-1">{course.title}</span>
                      </label>
                    )
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to keep materials unassigned (shown as None).
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} disabled={isAssigning}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit} disabled={isAssigning || selectedMaterialIds.length === 0}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Study Material Details</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedMaterial.title}</p>
              </div>

              {selectedMaterial.description && (
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedMaterial.description}
                  </p>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Scope</Label>
                  <p className="text-sm">
                    {selectedMaterial.isCourseSpecific
                      ? getCourseNames(selectedMaterial)
                      : "Available for all courses"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedMaterial.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase text-muted-foreground">Subject</Label>
                {selectedMaterial.tags && selectedMaterial.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedMaterial.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags added</p>
                )}
              </div>

              <div>
                <Label className="text-xs uppercase text-muted-foreground">Documents</Label>
                <div className="mt-2 space-y-2">
                  {selectedMaterial.docs?.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.originalName || doc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {doc.fileType} • {formatFileSize(doc.sizeInBytes)}
                        </span>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete study material?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. &ldquo;
              {materialPendingDelete?.title ?? "Selected study material"}
              &rdquo; will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
