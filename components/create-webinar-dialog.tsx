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
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, LinkIcon, Globe } from "lucide-react"

interface CreateWebinarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWebinarDialog({ open, onOpenChange }: CreateWebinarDialogProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    platform: "",
    meetingLink: "",
    maxAttendees: 500,
    isPublic: true,
    registrationRequired: true,
    registrationLink: "",
  })

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    console.log("Creating webinar:", formData)
    onOpenChange(false)
    setStep(1)
    setFormData({
      title: "",
      description: "",
      topic: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: 60,
      platform: "",
      meetingLink: "",
      maxAttendees: 500,
      isPublic: true,
      registrationRequired: true,
      registrationLink: "",
    })
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Webinar</DialogTitle>
          <DialogDescription>Create a public webinar or educational seminar</DialogDescription>
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
                <CardTitle className="text-lg">Webinar Information</CardTitle>
                <CardDescription>Provide the basic details for your webinar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Webinar Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Career Guidance for Engineering Aspirants"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what will be covered in this webinar..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic Category *</Label>
                  <Select value={formData.topic} onValueChange={(value) => updateFormData("topic", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                      <SelectItem value="Study Tips">Study Tips</SelectItem>
                      <SelectItem value="Exam Strategy">Exam Strategy</SelectItem>
                      <SelectItem value="Subject Overview">Subject Overview</SelectItem>
                      <SelectItem value="Motivation">Motivation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public-webinar"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => updateFormData("isPublic", checked)}
                    />
                    <Label htmlFor="public-webinar">Make this webinar public</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="registration-required"
                      checked={formData.registrationRequired}
                      onCheckedChange={(checked) => updateFormData("registrationRequired", checked)}
                    />
                    <Label htmlFor="registration-required">Require registration to attend</Label>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Webinar Settings</span>
                  </div>
                  <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <p>• Public webinars are visible to all users and can be shared</p>
                    <p>• Registration helps you track attendance and send reminders</p>
                    <p>• You can always change these settings later</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Schedule & Capacity */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule & Capacity
                </CardTitle>
                <CardDescription>Set the timing and attendance limits for your webinar</CardDescription>
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
                      min="15"
                      max="180"
                      value={formData.duration}
                      onChange={(e) => updateFormData("duration", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attendees">Max Attendees *</Label>
                    <Input
                      id="max-attendees"
                      type="number"
                      min="10"
                      max="1000"
                      value={formData.maxAttendees}
                      onChange={(e) => updateFormData("maxAttendees", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Webinar Summary</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Duration: {formData.duration} minutes</p>
                    <p>Capacity: {formData.maxAttendees} attendees</p>
                    <p>Type: {formData.isPublic ? "Public" : "Private"} webinar</p>
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

          {/* Step 3: Platform & Links */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Platform & Access Links
                </CardTitle>
                <CardDescription>Configure the webinar platform and access details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => updateFormData("platform", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select webinar platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom Webinar">Zoom Webinar</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="YouTube Live">YouTube Live</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-link">Webinar Link *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="meeting-link"
                        placeholder="https://zoom.us/webinar/register/WN_xyz123"
                        value={formData.meetingLink}
                        onChange={(e) => updateFormData("meetingLink", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provide the webinar link that attendees will use to join
                  </p>
                </div>

                {formData.registrationRequired && (
                  <div className="space-y-2">
                    <Label htmlFor="registration-link">Registration Link (Optional)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registration-link"
                        placeholder="https://forms.google.com/registration"
                        value={formData.registrationLink}
                        onChange={(e) => updateFormData("registrationLink", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Separate registration form link if different from webinar link
                    </p>
                  </div>
                )}

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    Webinar Best Practices
                  </h4>
                  <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                    <li>• Test your setup and internet connection beforehand</li>
                    <li>• Prepare engaging slides and interactive elements</li>
                    <li>• Plan for Q&A sessions to engage your audience</li>
                    <li>• Consider recording for those who can't attend live</li>
                    <li>• Send reminder emails to registered attendees</li>
                  </ul>
                </div>

                {/* Webinar Preview */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Webinar Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="text-right flex-1 ml-2">{formData.title || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Topic:</span>
                      <span>{formData.topic || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span>{formData.platform || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formData.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span>{formData.maxAttendees} attendees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <div className="flex gap-1">
                        {formData.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                        {formData.registrationRequired && (
                          <Badge variant="outline" className="text-xs">
                            Registration Required
                          </Badge>
                        )}
                      </div>
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
                  (step === 1 && (!formData.title || !formData.topic)) ||
                  (step === 2 && (!formData.scheduledDate || !formData.scheduledTime))
                }
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.platform || !formData.meetingLink}>
                Schedule Webinar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
