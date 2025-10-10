"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { updateTestSeries, getCoursesByIds } from "@/util/server"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface TestSeries {
  _id: string
  title: string
  description?: {
    short?: string
    shortDesc?: string
    long?: string
    longDesc?: string
  }
  price: number
  validity: number
  noOfTests: number
  startDate: string
  endDate: string
  subject: string
  specialization: string
  isCourseSpecific?: boolean
  courseId?: string | { _id: string; title: string; description?: any }
}

interface EditTestSeriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testSeries: TestSeries | null
  onTestSeriesUpdated: () => void
}

export function EditTestSeriesDialog({ 
  open, 
  onOpenChange, 
  testSeries,
  onTestSeriesUpdated 
}: EditTestSeriesDialogProps) {
  const { educator } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    price: "",
    validity: "",
    startDate: "",
    endDate: "",
    subject: "",
    specialization: "",
    isCourseSpecific: false,
    courseId: "",
  })

  // Fetch educator's courses when dialog opens
  useEffect(() => {
    const fetchCourses = async () => {
      if (!open || !educator?.courses || educator.courses.length === 0) {
        setAvailableCourses([])
        return
      }

      try {
        setLoadingCourses(true)
        const courses = await getCoursesByIds(educator.courses)
        console.log("Courses: ", courses);
        
        setAvailableCourses(courses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast.error("Failed to load courses")
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses()
  }, [open, educator?.courses])

  useEffect(() => {
    if (testSeries) {
      const shortDesc = testSeries.description?.short || testSeries.description?.shortDesc || ""
      const longDesc = testSeries.description?.long || testSeries.description?.longDesc || ""
      
      // Format dates for datetime-local input
      const formatDateTime = (dateString: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        title: testSeries.title || "",
        shortDesc,
        longDesc,
        price: String(testSeries.price || 0),
        validity: String(testSeries.validity || 180),
        startDate: formatDateTime(testSeries.startDate),
        endDate: formatDateTime(testSeries.endDate),
        subject: testSeries.subject?.toLowerCase() || "",
        specialization: testSeries.specialization || "",
        isCourseSpecific: testSeries.isCourseSpecific || false,
        // Handle both populated object and string ID
        courseId: typeof testSeries.courseId === 'object' && testSeries.courseId !== null
          ? testSeries.courseId._id 
          : (testSeries.courseId as string || ""),
      })
    }
  }, [testSeries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!testSeries) return

    // Validation
    if (formData.title.length < 3) {
      toast.error("Title must be at least 3 characters long")
      return
    }

    if (formData.shortDesc.length < 10) {
      toast.error("Short description must be at least 10 characters long")
      return
    }

    if (formData.longDesc.length < 20) {
      toast.error("Long description must be at least 20 characters long")
      return
    }

    if (Number(formData.price) < 0) {
      toast.error("Price cannot be negative")
      return
    }

    if (Number(formData.validity) < 1) {
      toast.error("Validity must be at least 1 day")
      return
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("End date must be after start date")
      return
    }

    if (formData.isCourseSpecific && !formData.courseId) {
      toast.error("Please select a course when 'Course Specific' is enabled")
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        title: formData.title,
        description: {
          short: formData.shortDesc,
          long: formData.longDesc,
        },
        price: Number(formData.price),
        validity: Number(formData.validity),
        startDate: formData.startDate,
        endDate: formData.endDate,
        subject: formData.subject,
        specialization: formData.specialization,
        isCourseSpecific: formData.isCourseSpecific,
        courseId: formData.courseId
      }
      console.log("Form Data: ", formData);
      
      console.log("Data to be updated: ", updateData);
      
      await updateTestSeries(testSeries._id, updateData)
      toast.success("Test series updated successfully!")
      onTestSeriesUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating test series:", error)
      toast.error(error.response?.data?.message || "Failed to update test series")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Series</DialogTitle>
          <DialogDescription>
            Update test series details. Note: You cannot change the tests included in this series.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter test series title"
              required
            />
          </div>

          {/* Subject and Specialization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., NEET, JEE"
                required
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="shortDesc">Short Description *</Label>
            <Textarea
              id="shortDesc"
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              placeholder="Brief description (10-500 characters)"
              rows={2}
              required
            />
            <p className="text-xs text-muted-foreground">{formData.shortDesc.length}/500</p>
          </div>

          {/* Long Description */}
          <div className="space-y-2">
            <Label htmlFor="longDesc">Detailed Description *</Label>
            <Textarea
              id="longDesc"
              value={formData.longDesc}
              onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
              placeholder="Detailed description (20-2000 characters)"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">{formData.longDesc.length}/2000</p>
          </div>

          {/* Price and Validity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Validity (days) *</Label>
              <Input
                id="validity"
                type="number"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                placeholder="180"
                min="1"
                step="1"
                required
              />
            </div>
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Course Specific */}
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex items-center space-x-2">
            <Switch
              id="isCourseSpecific"
              checked={formData.isCourseSpecific}
              onCheckedChange={(checked) => setFormData({ ...formData, isCourseSpecific: checked })}
            />
            <Label htmlFor="isCourseSpecific" className="cursor-pointer">
              Course Specific
            </Label>
            </div>
            <div>
          {formData.isCourseSpecific && (
            <div className="space-y-2 w-full">
              <Label htmlFor="courseId">Select Course *</Label>
              {loadingCourses ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading courses...
                </div>
              ) : availableCourses.length > 0 ? (
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  required={formData.isCourseSpecific}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  No courses available. Create a course first to link it to this test series.
                </p>
              )}
            </div>
          )}
          </div>
          </div>


          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Test Series"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
