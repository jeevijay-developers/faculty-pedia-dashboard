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
import { Switch } from "@/components/ui/switch"
import { TestBuilder } from "@/components/test-builder"

interface CreateTestSeriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTestSeriesDialog({ open, onOpenChange }: CreateTestSeriesDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    price: "",
    validity: "180",
    noOfTests: "10",
    startDate: "",
    endDate: "",
    subject: "",
    specialization: "",
    isCourseSpecific: false,
    courseId: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [tests, setTests] = useState<any[]>([])

  const handleSubmit = () => {
    // Handle form submission
    console.log("Test Series Data:", formData)
    console.log("Tests:", tests)
    onOpenChange(false)

    // Reset form
    setFormData({
      title: "",
      shortDesc: "",
      longDesc: "",
      price: "",
      validity: "180",
      noOfTests: "10",
      startDate: "",
      endDate: "",
      subject: "",
      specialization: "",
      isCourseSpecific: false,
      courseId: "",
    })
    setTests([])
    setCurrentStep(1)
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Test Series Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter test series title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc">Short Description</Label>
        <Input
          id="shortDesc"
          value={formData.shortDesc}
          onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
          placeholder="Brief description of the test series"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDesc">Detailed Description</Label>
        <Textarea
          id="longDesc"
          value={formData.longDesc}
          onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
          placeholder="Detailed description, learning outcomes, etc."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
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
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="2500"
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
        <div className="space-y-2">
          <Label htmlFor="noOfTests">Number of Tests</Label>
          <Input
            id="noOfTests"
            type="number"
            value={formData.noOfTests}
            onChange={(e) => setFormData({ ...formData, noOfTests: e.target.value })}
            placeholder="10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseSpecific">Course Specific</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="courseSpecific"
              checked={formData.isCourseSpecific}
              onCheckedChange={(checked) => setFormData({ ...formData, isCourseSpecific: checked })}
            />
            <Label htmlFor="courseSpecific" className="text-sm">
              Link to course
            </Label>
          </div>
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

      {formData.isCourseSpecific && (
        <div className="space-y-2">
          <Label htmlFor="courseId">Select Course</Label>
          <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="course1">Advanced Physics for JEE Main</SelectItem>
              <SelectItem value="course2">Organic Chemistry Mastery</SelectItem>
              <SelectItem value="course3">Mathematics Foundation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Build Tests</h3>
          <p className="text-sm text-muted-foreground">Create tests by dragging questions from your question bank</p>
        </div>
      </div>

      <TestBuilder
        maxTests={Number.parseInt(formData.noOfTests) || 10}
        tests={tests}
        onTestsChange={setTests}
        subject={formData.subject}
        specialization={formData.specialization}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test Series</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 2: {currentStep === 1 ? "Basic Information" : "Build Tests"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
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
            {currentStep < 2 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Create Test Series</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
