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
import { Loader2, Plus, Eye, Download, MoreHorizontal, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AddStudyMaterialDialog, type CourseSummary } from "@/components/add-study-material-dialog"
import {
  deleteStudyMaterialEntry,
  getCoursesByEducator,
  getStudyMaterialsByEducator,
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
              <Button
                className="w-full sm:w-auto"
                onClick={() => setIsAddDialogOpen(true)}
                disabled={!educator}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Study Material
              </Button>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading study materials...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                        No study materials found. Use the button above to add your first resource.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map((material) => (
                      <TableRow key={material._id}>
                        <TableCell>
                          <div className="font-medium">{material.title}</div>
                          {material.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {material.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {material.isCourseSpecific ? (
                            <span>{material.courseId?.title || "Linked course"}</span>
                          ) : (
                            <span className="text-muted-foreground">All courses</span>
                          )}
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
        courses={courses}
        onSuccess={fetchStudyMaterials}
      />

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
                      ? selectedMaterial.courseId?.title || "Linked course"
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
