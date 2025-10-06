"use client"

import { useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Youtube, FileText, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createCourse } from "@/util/server"
import toast from "react-hot-toast"

interface CreateCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface VideoLesson {
  id: string
  title: string
  youtubeUrl: string
  description: string
}

interface CoursePDF {
  id: string
  name: string
  file: File | null
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const { refreshEducator } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    specialization: "",
    courseClass: "",
    subject: "",
    courseType: "OTA",
    startDate: "",
    endDate: "",
    seatLimit: "",
    classDuration: "",
    fees: "",
    validity: "",
  })

  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([])
  const [coursePDFs, setCoursePDFs] = useState<CoursePDF[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const addVideoLesson = () => {
    const newLesson: VideoLesson = {
      id: Date.now().toString(),
      title: "",
      youtubeUrl: "",
      description: "",
    }
    setVideoLessons([...videoLessons, newLesson])
  }

  const updateVideoLesson = (id: string, field: keyof VideoLesson, value: string) => {
    setVideoLessons((lessons) => lessons.map((lesson) => (lesson.id === id ? { ...lesson, [field]: value } : lesson)))
  }

  const removeVideoLesson = (id: string) => {
    setVideoLessons((lessons) => lessons.filter((lesson) => lesson.id !== id))
  }

  const addPDF = () => {
    const newPDF: CoursePDF = {
      id: Date.now().toString(),
      name: "",
      file: null,
    }
    setCoursePDFs([...coursePDFs, newPDF])
  }

  const updatePDF = (id: string, field: keyof CoursePDF, value: string | File) => {
    setCoursePDFs((pdfs) => pdfs.map((pdf) => (pdf.id === id ? { ...pdf, [field]: value } : pdf)))
  }

  const removePDF = (id: string) => {
    setCoursePDFs((pdfs) => pdfs.filter((pdf) => pdf.id !== id))
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.specialization || !formData.subject) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating course...")

    try {
      // Prepare course data for API
      const courseData = {
        ...formData,
        videoLessons,
        pdfs: coursePDFs,
      }

      // Call API to create course
      await createCourse(courseData)

      // Refresh educator data to show new course
      await refreshEducator()

      toast.success("Course created successfully!", {
        id: loadingToast,
      })

      // Reset form and close dialog
      setFormData({
        title: "",
        shortDesc: "",
        longDesc: "",
        specialization: "",
        courseClass: "",
        subject: "",
        courseType: "OTA",
        startDate: "",
        endDate: "",
        seatLimit: "",
        classDuration: "",
        fees: "",
        validity: "",
      })
      setVideoLessons([])
      setCoursePDFs([])
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating course:", error)
      toast.error(error.response?.data?.message || "Failed to create course", {
        id: loadingToast,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter course title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Physics, Chemistry"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc">Short Description</Label>
        <Input
          id="shortDesc"
          value={formData.shortDesc}
          onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
          placeholder="Brief description of the course"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDesc">Detailed Description</Label>
        <Textarea
          id="longDesc"
          value={formData.longDesc}
          onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
          placeholder="Detailed course description, learning outcomes, etc."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) => setFormData({ ...formData, specialization: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
              <SelectItem value="NEET">NEET</SelectItem>
              <SelectItem value="CBSE">CBSE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseClass">Class</Label>
          <Select
            value={formData.courseClass}
            onValueChange={(value) => setFormData({ ...formData, courseClass: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Class {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseType">Course Type</Label>
          <Select
            value={formData.courseType}
            onValueChange={(value) => setFormData({ ...formData, courseType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OTA">One-to-All</SelectItem>
              <SelectItem value="OTO">One-to-One</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seatLimit">Seat Limit</Label>
          <Input
            id="seatLimit"
            type="number"
            value={formData.seatLimit}
            onChange={(e) => setFormData({ ...formData, seatLimit: e.target.value })}
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classDuration">Class Duration (hrs)</Label>
          <Input
            id="classDuration"
            type="number"
            value={formData.classDuration}
            onChange={(e) => setFormData({ ...formData, classDuration: e.target.value })}
            placeholder="2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fees">Fees (₹)</Label>
          <Input
            id="fees"
            type="number"
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
            placeholder="15000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validity">Validity (days)</Label>
          <Input
            id="validity"
            type="number"
            value={formData.validity}
            onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
            placeholder="180"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Video Lessons</h3>
          <p className="text-sm text-muted-foreground">Add YouTube video links for your course lessons</p>
        </div>
        <Button onClick={addVideoLesson} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {videoLessons.map((lesson, index) => (
          <Card key={lesson.id} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  Lesson {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideoLesson(lesson.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Lesson Title</Label>
                <Input
                  value={lesson.title}
                  onChange={(e) => updateVideoLesson(lesson.id, "title", e.target.value)}
                  placeholder="Enter lesson title"
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input
                  value={lesson.youtubeUrl}
                  onChange={(e) => updateVideoLesson(lesson.id, "youtubeUrl", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={lesson.description}
                  onChange={(e) => updateVideoLesson(lesson.id, "description", e.target.value)}
                  placeholder="Brief description of this lesson"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videoLessons.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No video lessons added yet</p>
          <p className="text-sm">Click "Add Video" to start adding your course content</p>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Course Materials</h3>
          <p className="text-sm text-muted-foreground">Upload PDF files and other course materials</p>
        </div>
        <Button onClick={addPDF} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add PDF
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {coursePDFs.map((pdf, index) => (
          <Card key={pdf.id} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  PDF {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePDF(pdf.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>File Name</Label>
                <Input
                  value={pdf.name}
                  onChange={(e) => updatePDF(pdf.id, "name", e.target.value)}
                  placeholder="Enter file name"
                />
              </div>
              <div className="space-y-2">
                <Label>Upload PDF</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        updatePDF(pdf.id, "file", file)
                        if (!pdf.name) {
                          updatePDF(pdf.id, "name", file.name.replace(".pdf", ""))
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {pdf.file && (
                  <Badge variant="outline" className="text-xs">
                    {pdf.file.name} ({(pdf.file.size / 1024 / 1024).toFixed(2)} MB)
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coursePDFs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No PDF materials added yet</p>
          <p className="text-sm">Click "Add PDF" to upload course materials</p>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3:{" "}
            {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Video Lessons" : "Course Materials"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
