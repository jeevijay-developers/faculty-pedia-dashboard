"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { CreateWebinarDialog } from "@/components/create-webinar-dialog"
import { EditWebinarDialog } from "@/components/edit-webinar-dialog"
//import { ViewWebinarDialog } from "@/components/ViewWebinarDialog"
import { deleteWebinar, getEducatorWebinars } from "@/util/server"
import { useAuth } from "@/contexts/auth-context"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Webinar {
  _id: string
  title: string
  description?: string | { short?: string; long?: string }
  webinarType?: string
  timing?: string
  subject?: string[] | string
  specialization?: string[] | string
  duration?: string | number
  fees?: number
  seatLimit?: number
  class?: string[]
  webinarLink?: string
  isActive?: boolean
  date?: string
  time?: string
}

interface WebinarPaginationMeta {
  currentPage: number
  totalPages: number
  totalWebinars: number
}

const ITEMS_PER_PAGE = 10
const MULTI_SELECT_SCROLL_THRESHOLD = 2
const WIDE_COLUMN_CLASS = "min-w-[260px]"
const DESCRIPTION_WORD_LIMIT = 20

const getDescription = (value: Webinar["description"]) => {
  if (!value) return "-"
  const resolved =
    typeof value === "string"
      ? value.trim()
      : (value.long || value.short || "-").toString().trim()
  if (!resolved || resolved === "-") return "-"

  const words = resolved.split(/\s+/).filter(Boolean)
  if (words.length <= DESCRIPTION_WORD_LIMIT) {
    return resolved
  }

  return `${words.slice(0, DESCRIPTION_WORD_LIMIT).join(" ")}...`
}

const toArray = (value?: string[] | string) => {
  if (!value) return []
  return Array.isArray(value)
    ? value
    : value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
}

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-"
  return `₹${value.toLocaleString("en-IN")}`
}

const parseDate = (value?: string) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateValue = (webinar: Webinar) => {
  const parsed = parseDate(webinar.timing || webinar.date)
  if (parsed) {
    return parsed.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }
  return webinar.date || "-"
}

const formatTimeValue = (webinar: Webinar) => {
  const parsed = parseDate(webinar.timing)
  if (parsed) {
    return parsed.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  return webinar.time || "-"
}

const formatDuration = (duration?: string | number) => {
  if (typeof duration === "number" && !Number.isNaN(duration)) {
    return `${duration} min`
  }
  if (typeof duration === "string" && duration.trim().length > 0) {
    return duration
  }
  return "-"
}

export default function WebinarPage() {
  const { educator } = useAuth()
  const educatorId = educator?._id

  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [webinarToEdit, setWebinarToEdit] = useState<Webinar | null>(null)
  const [pagination, setPagination] = useState<WebinarPaginationMeta | null>(
    null
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const fetchWebinars = useCallback(
    async (page = 1) => {
      if (!educatorId) {
        setWebinars([])
        setPagination(null)
        return
      }

      try {
        setIsLoading(true)
        const response = await getEducatorWebinars(educatorId, {
          page,
          limit: ITEMS_PER_PAGE,
        })
        const webinarList = response?.webinars || []
        setWebinars(webinarList)
        if (response?.pagination) {
          setPagination(response.pagination)
          setCurrentPage(response.pagination.currentPage || page)
        } else {
          setPagination(null)
          setCurrentPage(page)
        }
        setError(null)
      } catch (fetchError) {
        console.error("Error fetching webinars:", fetchError)
        setError("Failed to load webinars. Please try again.")
        setWebinars([])
      } finally {
        setIsLoading(false)
      }
    },
    [educatorId]
  )

  useEffect(() => {
    fetchWebinars(1)
  }, [fetchWebinars])

  const openCreateDialog = () => {
    setDialogMode("create")
    setWebinarToEdit(null)
    setIsDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setDialogMode("create")
      setWebinarToEdit(null)
      fetchWebinars(currentPage)
    }
  }

  const handleWebinarCreated = () => {
    fetchWebinars(currentPage)
  }

  const handleWebinarUpdated = () => {
    fetchWebinars(currentPage)
  }

  const handlePageChange = (page: number) => {
    const maxPages = pagination?.totalPages || 1
    if (page < 1 || page > maxPages) return
    fetchWebinars(page)
  }

  const handleViewWebinar = (webinar: Webinar) => {
    setSelectedWebinar(webinar)
    setIsViewDialogOpen(true)
  }

  const handleEditWebinar = (webinar: Webinar) => {
    setDialogMode("edit")
    setWebinarToEdit(webinar)
    setIsDialogOpen(true)
  }

  const handleDeleteRequest = (webinar: Webinar) => {
    setWebinarToDelete(webinar)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteWebinar = async () => {
    if (!webinarToDelete) return

    try {
      setDeleteLoading(true)
      await deleteWebinar(webinarToDelete._id)
      toast.success("Webinar deleted successfully")
      setIsDeleteDialogOpen(false)
      setWebinarToDelete(null)
      fetchWebinars(currentPage)
    } catch (deleteError) {
      console.error("Error deleting webinar:", deleteError)
      const serverMessage =
        typeof deleteError === "object" &&
        deleteError !== null &&
        "response" in deleteError &&
        (deleteError as {
          response?: { data?: { message?: string } }
        }).response?.data?.message
      toast.error(serverMessage || "Failed to delete webinar")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open)
    if (!open && !deleteLoading) {
      setWebinarToDelete(null)
    }
  }

  const handleViewDialogChange = (open: boolean) => {
    setIsViewDialogOpen(open)
    if (!open) {
      setSelectedWebinar(null)
    }
  }

  const totalPages = pagination?.totalPages || 1
  const totalWebinars = pagination?.totalWebinars ?? webinars.length

  const humanizeLabel = (value: string) =>
    value
      .split(/[-_]/)
      .map((segment) =>
        segment.length > 0
          ? segment.charAt(0).toUpperCase() + segment.slice(1)
          : segment
      )
      .join(" ")

  const renderBadgeGroup = (
    items: string[],
    formatter?: (value: string) => string
  ) => {
    if (!items.length) {
      return <Badge variant="outline">N/A</Badge>
    }
    const badgeItems = items.map((item) => (
      <Badge key={item} variant="outline">
        {formatter ? formatter(item) : humanizeLabel(item)}
      </Badge>
    ))
    return <div className="flex flex-wrap gap-1">{badgeItems}</div>
  }

  const formatClassLabel = (value: string) => {
    if (value === "dropper") return "Dropper"
    if (value.startsWith("class-")) {
      return value.replace("class-", "Class ")
    }
    return value
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Webinar"
        description="Manage your webinars and online sessions"
      />

      <div className="px-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Webinars
            </h2>
            <p className="text-sm text-muted-foreground">
              Track schedules, seats, and fees for every session
            </p>
          </div>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            Create Webinar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading webinars...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-red-600">
              {error}
            </CardContent>
          </Card>
        ) : webinars.length > 0 ? (
          <>
            <Card className="bg-card border-border">
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title & Description</TableHead>
                      <TableHead
                        className={
                          webinars.some(
                            (webinar) =>
                              toArray(webinar.subject).length >
                              MULTI_SELECT_SCROLL_THRESHOLD
                          )
                            ? WIDE_COLUMN_CLASS
                            : undefined
                        }
                      >
                        Subjects
                      </TableHead>
                      <TableHead
                        className={
                          webinars.some(
                            (webinar) =>
                              toArray(webinar.specialization).length >
                              MULTI_SELECT_SCROLL_THRESHOLD
                          )
                            ? WIDE_COLUMN_CLASS
                            : undefined
                        }
                      >
                        Specialization
                      </TableHead>
                      <TableHead
                        className={
                          webinars.some(
                            (webinar) =>
                              (Array.isArray(webinar.class)
                                ? webinar.class
                                : []
                              ).length > MULTI_SELECT_SCROLL_THRESHOLD
                          )
                            ? WIDE_COLUMN_CLASS
                            : undefined
                        }
                      >
                        Classes
                      </TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webinars.map((webinar) => {
                      const subjects = toArray(webinar.subject)
                      const specializations = toArray(webinar.specialization)
                      const classList = Array.isArray(webinar.class)
                        ? webinar.class
                        : []
                      const subjectsClassName =
                        subjects.length > MULTI_SELECT_SCROLL_THRESHOLD
                          ? WIDE_COLUMN_CLASS
                          : undefined
                      const specializationClassName =
                        specializations.length > MULTI_SELECT_SCROLL_THRESHOLD
                          ? WIDE_COLUMN_CLASS
                          : undefined
                      const classesClassName =
                        classList.length > MULTI_SELECT_SCROLL_THRESHOLD
                          ? WIDE_COLUMN_CLASS
                          : undefined
                      return (
                        <TableRow key={webinar._id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground line-clamp-1">
                                  {webinar.title}
                                </span>
                                <Badge
                                  variant={webinar.isActive === false ? "outline" : "default"}
                                  className={
                                    webinar.isActive === false
                                      ? "text-orange-600 border-orange-200"
                                      : "bg-green-600 text-white"
                                  }
                                >
                                  {webinar.isActive === false ? "Inactive" : "Active"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {getDescription(webinar.description)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className={subjectsClassName}>
                            {renderBadgeGroup(subjects)}
                          </TableCell>
                          <TableCell className={specializationClassName}>
                            {renderBadgeGroup(specializations)}
                          </TableCell>
                          <TableCell className={classesClassName}>
                            {renderBadgeGroup(classList, formatClassLabel)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {webinar.seatLimit ?? "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(webinar.fees)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              <div>{formatDateValue(webinar)}</div>
                              <div>{formatTimeValue(webinar)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDuration(webinar.duration)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  aria-label="Webinar actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewWebinar(webinar)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditWebinar(webinar)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-500 font-semibold"
                                  onClick={() => handleDeleteRequest(webinar)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalWebinars)} of{" "}
                  {totalWebinars} webinars
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-blue-50 p-4 mb-4">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No webinars yet
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first webinar to connect with students live
              </p>
              <Button
                className="gap-2"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4" />
                Create Your First Webinar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateWebinarDialog
        open={isDialogOpen && dialogMode === "create"}
        onOpenChange={handleDialogChange}
        onWebinarCreated={handleWebinarCreated}
      />

      <EditWebinarDialog
        open={isDialogOpen && dialogMode === "edit"}
        onOpenChange={handleDialogChange}
        webinar={webinarToEdit}
        onWebinarUpdated={handleWebinarUpdated}
      />

      <Dialog open={isViewDialogOpen} onOpenChange={handleViewDialogChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedWebinar?.title || "Webinar details"}</DialogTitle>
            <DialogDescription>
              Review the key information for this webinar.
            </DialogDescription>
          </DialogHeader>

          {selectedWebinar ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="text-sm text-foreground whitespace-pre-line">
                  {getDescription(selectedWebinar.description)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <div className="font-medium">{formatDateValue(selectedWebinar)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Time</span>
                  <div className="font-medium">{formatTimeValue(selectedWebinar)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <div className="font-medium">{formatDuration(selectedWebinar.duration)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Fees</span>
                  <div className="font-medium">{formatCurrency(selectedWebinar.fees)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Subjects</span>
                  {renderBadgeGroup(toArray(selectedWebinar.subject))}
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Specialization</span>
                  {renderBadgeGroup(toArray(selectedWebinar.specialization))}
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Classes</span>
                  {renderBadgeGroup(
                    Array.isArray(selectedWebinar.class)
                      ? selectedWebinar.class
                      : [],
                    formatClassLabel
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Seat limit</span>
                  <div className="font-medium">{selectedWebinar.seatLimit ?? "-"}</div>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <span className="text-muted-foreground">Webinar link</span>
                <div className="font-medium break-all">{selectedWebinar.webinarLink || "Not provided"}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No webinar selected.</div>
          )}
        </DialogContent>
      </Dialog>

      

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webinar?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {webinarToDelete?.title ?? "This"}
              webinar will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-600/90"
              onClick={confirmDeleteWebinar}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
