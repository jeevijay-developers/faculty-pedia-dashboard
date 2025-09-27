"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Video, LinkIcon } from "lucide-react"

interface CreateLiveClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLiveClassDialog({ open, onOpenChange }: CreateLiveClassDialogProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    specialization: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 120,
    platform: "",
    meetingLink: "",
    maxStudents: 100,
    isCourseSpecific: false,
    courseId: "",
  })

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    console.log("Creating live class:", formData)
    onOpenChange(false)
    setStep(1)
    setFormData({
      title: "",
      description: "",
      subject: "",
      specialization: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: 120,
      platform: "",
      meetingLink: "",
      maxStudents: 100,
      isCourseSpecific: false,
      courseId: "",
    })
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Live Class</DialogTitle>
          <DialogDescription>Create an interactive live class session for your students</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i === step
                      ? "bg-primary text-primary-foreground"
                      : i < step
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && <div className="w-8 h-0.5 bg-muted mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Provide the basic details for your live class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Class Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Physics - Laws of Motion"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what will be covered in this live class..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => updateFormData("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => updateFormData("specialization", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IIT-JEE">IIT-JEE</SelectItem>
                        <SelectItem value="NEET">NEET</SelectItem>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="course-specific"
                    checked={formData.isCourseSpecific}
                    onCheckedChange={(checked) => updateFormData("isCourseSpecific", checked)}
                  />
                  <Label htmlFor="course-specific">This is a course-specific class</Label>
                </div>

                {formData.isCourseSpecific && (
                  <div className="space-y-2">
                    <Label htmlFor="course">Select Course</Label>
                    <Select value={formData.courseId} onValueChange={(value) => updateFormData("courseId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course1">Complete Physics for JEE</SelectItem>
                        <SelectItem value="course2">Organic Chemistry Mastery</SelectItem>
                        <SelectItem value="course3">Mathematics Foundation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Schedule & Settings */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule & Settings
                </CardTitle>
                <CardDescription>Set the timing and capacity for your live class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => updateFormData("scheduledDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => updateFormData("scheduledTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="30"
                      max="300"
                      value={formData.duration}
                      onChange={(e) => updateFormData("duration", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-students">Max Students *</Label>
                    <Input
                      id="max-students"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.maxStudents}
                      onChange={(e) => updateFormData("maxStudents", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Class Summary</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Duration: {formData.duration} minutes</p>
                    <p>Capacity: {formData.maxStudents} students</p>
                    {formData.scheduledDate && formData.scheduledTime && (
                      <p>
                        Scheduled: {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Platform & Meeting Link */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Platform & Meeting Details
                </CardTitle>
                <CardDescription>Configure the meeting platform and access details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => updateFormData("platform", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-link">Meeting Link *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="meeting-link"
                        placeholder="https://zoom.us/j/123456789"
                        value={formData.meetingLink}
                        onChange={(e) => updateFormData("meetingLink", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provide the direct meeting link that students will use to join the class
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Platform Guidelines</h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Ensure your meeting room is set up and tested before the class</li>
                    <li>• Enable waiting room or registration if needed for security</li>
                    <li>• Consider recording the session for students who miss it</li>
                    <li>• Test your audio and video setup beforehand</li>
                  </ul>
                </div>

                {/* Class Preview */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Class Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span>{formData.title || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <span>{formData.subject || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span>{formData.platform || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formData.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
              Previous
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!formData.title || !formData.subject || !formData.specialization)) ||
                  (step === 2 && (!formData.scheduledDate || !formData.scheduledTime))
                }
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.platform || !formData.meetingLink}>
                Schedule Live Class
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
