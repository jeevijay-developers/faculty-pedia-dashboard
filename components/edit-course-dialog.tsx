"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, X, Loader2 } from "lucide-react"
import { updateCourse } from "@/util/server"
import toast from "react-hot-toast"

interface EditCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: any
  onCourseUpdated: () => void
}

export function EditCourseDialog({ open, onOpenChange, course, onCourseUpdated }: EditCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    courseClass: "",
    specialization: "",
    courseType: "OTA",
    fees: "",
    startDate: "",
    endDate: "",
    seatLimit: "",
    classDuration: "",
    validity: "",
    shortDesc: "",
    longDesc: "",
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        subject: course.subject || "",
        courseClass: course.courseClass || "",
        specialization: course.specialization || "",
        courseType: course.courseType || "OTA",
        fees: course.fees?.toString() || "",
        startDate: course.startDate ? new Date(course.startDate).toISOString().slice(0, 16) : "",
        endDate: course.endDate ? new Date(course.endDate).toISOString().slice(0, 16) : "",
        seatLimit: course.seatLimit?.toString() || "",
        classDuration: course.classDuration?.toString() || "",
        validity: course.validity?.toString() || "",
        shortDesc: course.description?.shortDesc || "",
        longDesc: course.description?.longDesc || "",
      })
      setImagePreview(course.image?.url || null)
      setSelectedImage(null)
    }
  }, [course])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(course?.image?.url || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData: any = {
        title: formData.title,
        subject: formData.subject,
        courseClass: formData.courseClass,
        specialization: formData.specialization,
        courseType: formData.courseType,
        fees: Number(formData.fees),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        seatLimit: Number(formData.seatLimit),
        classDuration: Number(formData.classDuration),
        validity: Number(formData.validity),
        description: {
          shortDesc: formData.shortDesc,
          longDesc: formData.longDesc,
        },
      }

      // If a new image is selected, create FormData
      let dataToSend
      if (selectedImage) {
        const formDataToSend = new FormData()
        formDataToSend.append("data", JSON.stringify(updateData))
        formDataToSend.append("image", selectedImage)
        dataToSend = formDataToSend
      } else {
        dataToSend = updateData
      }
      
      await updateCourse(course._id, dataToSend)
      toast.success("Course updated successfully!")
      onCourseUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating course:", error)
      toast.error(error.response?.data?.message || "Failed to update course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Course Banner Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Course Title *</Label>
              <Input
                id="edit-title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Advanced Physics for JEE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger id="edit-subject">
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
              <Label htmlFor="edit-class">Class *</Label>
              <Select
                value={formData.courseClass}
                onValueChange={(value) => setFormData({ ...formData, courseClass: value })}
              >
                <SelectTrigger id="edit-class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Class {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialization">Specialization *</Label>
              <Input
                id="edit-specialization"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., JEE, NEET"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Course Type *</Label>
              <Select
                value={formData.courseType}
                onValueChange={(value) => setFormData({ ...formData, courseType: value })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OTA">One Time Access (OTA)</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fees">Fees (₹) *</Label>
              <Input
                id="edit-fees"
                type="number"
                required
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                placeholder="e.g., 5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date *</Label>
              <Input
                id="edit-startDate"
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date *</Label>
              <Input
                id="edit-endDate"
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-seatLimit">Seat Limit</Label>
              <Input
                id="edit-seatLimit"
                type="number"
                value={formData.seatLimit}
                onChange={(e) => setFormData({ ...formData, seatLimit: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Class Duration (minutes)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.classDuration}
                onChange={(e) => setFormData({ ...formData, classDuration: e.target.value })}
                placeholder="e.g., 60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-validity">Validity (days)</Label>
              <Input
                id="edit-validity"
                type="number"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                placeholder="e.g., 365"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-shortDesc">Short Description *</Label>
              <Input
                id="edit-shortDesc"
                required
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                placeholder="Brief description (shown in cards)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-longDesc">Long Description</Label>
              <Textarea
                id="edit-longDesc"
                value={formData.longDesc}
                onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
                placeholder="Detailed course description"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
