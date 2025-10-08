"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { createTestSeries, getEducatorTests } from "@/util/server"
import { Loader2, Plus, RefreshCcw, Trash2, Upload, X, ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

interface CreateTestSeriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LiveTestSummary {
  _id: string
  title: string
  subject: string
  specialization?: string
  startDate?: string
  duration?: number
  description?: {
    short?: string
    long?: string
  }
}

export function CreateTestSeriesDialog({ open, onOpenChange }: CreateTestSeriesDialogProps) {
  const { educator, refreshEducator } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    price: "",
    validity: "180",
  noOfTests: "0",
    startDate: "",
    endDate: "",
    subject: "",
    specialization: "",
    isCourseSpecific: false,
    courseId: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTests, setSelectedTests] = useState<LiveTestSummary[]>([])
  const [availableTests, setAvailableTests] = useState<LiveTestSummary[]>([])
  const [loadingTests, setLoadingTests] = useState(false)
  const [fetchTestsError, setFetchTestsError] = useState<string | null>(null)

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      noOfTests: String(selectedTests.length),
    }))
  }, [selectedTests.length])

  const fetchAvailableTests = useCallback(async () => {
    if (!educator?._id) {
      return
    }

    try {
      setLoadingTests(true)
      setFetchTestsError(null)
      const response = await getEducatorTests(educator._id)
      const tests: LiveTestSummary[] = (response?.tests ?? [])
        .filter((test: any) => !test?.testSeriesId)
        .map((test: any) => ({
          _id: test._id,
          title: test.title,
          subject: test.subject,
          specialization: test.specialization,
          startDate: test.startDate,
          duration: test.duration,
          description: test.description,
        }))

      setAvailableTests(tests)
    } catch (error: any) {
      console.error("Error fetching live tests:", error)
      setFetchTestsError(error.response?.data?.message || "Failed to load live tests")
    } finally {
      setLoadingTests(false)
    }
  }, [educator?._id])

  useEffect(() => {
    if (!open || currentStep !== 2) {
      return
    }
    fetchAvailableTests()
  }, [open, currentStep, fetchAvailableTests])

  const handleAddTest = (test: LiveTestSummary) => {
    if (selectedTests.some((selected) => selected._id === test._id)) {
      return
    }
    setSelectedTests((prev) => [...prev, test])
  }

  const handleRemoveTest = (testId: string) => {
    setSelectedTests((prev) => prev.filter((test) => test._id !== testId))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file")
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const formatDateTime = (date?: string) => {
    if (!date) return "--"
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSubmit = async () => {
    if (!educator?._id) {
      toast.error("Educator information missing. Please log in again")
      return
    }

    if (!formData.title || !formData.shortDesc || !formData.longDesc || !formData.subject || !formData.specialization) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select both start and end dates")
      return
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("End date must be after start date")
      return
    }

    if (selectedTests.length === 0) {
      toast.error("Add at least one live test to create a series")
      return
    }

    const priceValue = Number(formData.price)
    const validityValue = Number(formData.validity)

    if (Number.isNaN(priceValue) || Number.isNaN(validityValue)) {
      toast.error("Please enter valid numeric values for price and validity")
      return
    }

    // Prepare data for submission
    let submissionData: any

    if (selectedImage) {
      // Use FormData for file upload
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("title", formData.title.trim())
      formDataToSubmit.append("educatorId", educator._id)
      formDataToSubmit.append("description[short]", formData.shortDesc.trim())
      formDataToSubmit.append("description[long]", formData.longDesc.trim())
      formDataToSubmit.append("specialization", formData.specialization)
      formDataToSubmit.append("subject", formData.subject.toLowerCase())
      formDataToSubmit.append("price", priceValue.toString())
      formDataToSubmit.append("validity", validityValue.toString())
      formDataToSubmit.append("noOfTests", selectedTests.length.toString())
      formDataToSubmit.append("startDate", formData.startDate)
      formDataToSubmit.append("endDate", formData.endDate)
      formDataToSubmit.append("isCourseSpecific", formData.isCourseSpecific.toString())
      
      if (formData.isCourseSpecific && formData.courseId) {
        formDataToSubmit.append("courseId", formData.courseId)
      }
      
      // Append live tests
      selectedTests.forEach((test, index) => {
        formDataToSubmit.append(`liveTests[${index}]`, test._id)
      })
      
      // Append image
      formDataToSubmit.append("image", selectedImage)
      
      submissionData = formDataToSubmit
    } else {
      // Use regular JSON data
      submissionData = {
        title: formData.title.trim(),
        educatorId: educator._id,
        description: {
          short: formData.shortDesc.trim(),
          long: formData.longDesc.trim(),
        },
        specialization: formData.specialization,
        subject: formData.subject.toLowerCase(),
        price: priceValue,
        validity: validityValue,
        noOfTests: selectedTests.length,
        startDate: formData.startDate,
        endDate: formData.endDate,
        liveTests: selectedTests.map((test) => test._id),
        isCourseSpecific: formData.isCourseSpecific,
        ...(formData.isCourseSpecific && formData.courseId
          ? { courseId: formData.courseId }
          : {}),
      }
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating test series...")

    try {
      await createTestSeries(submissionData)
      await refreshEducator()

      toast.success("Test series created successfully!", {
        id: loadingToast,
      })

      setFormData({
        title: "",
        shortDesc: "",
        longDesc: "",
        price: "",
        validity: "180",
        noOfTests: "0",
        startDate: "",
        endDate: "",
        subject: "",
        specialization: "",
        isCourseSpecific: false,
        courseId: "",
      })
      setSelectedTests([])
      setSelectedImage(null)
      setImagePreview(null)
      setCurrentStep(1)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating test series:", error)
      toast.error(error.response?.data?.message || "Failed to create test series", {
        id: loadingToast,
      })
    } finally {
      setIsSubmitting(false)
    }
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

      <div className="space-y-2">
        <Label htmlFor="image">Banner Image (Optional)</Label>
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Test series banner preview"
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload a banner image for your test series
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Supports JPG, PNG. Max size 5MB
              </p>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </span>
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 ">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent >
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
            <SelectTrigger className="w-full">
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
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="2500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">

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
        
      {formData.isCourseSpecific && (
        <div className="space-y-2">
          <Label htmlFor="courseId">Select Course</Label>
          <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
            <SelectTrigger className="w-full">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 w-full">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            className="w-full"
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
    </div>
  )

  const renderStep2 = () => {
    const selectableTests = availableTests.filter(
      (test) => !selectedTests.some((selected) => selected._id === test._id),
    )

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Selected Live Tests</h3>
              <p className="text-sm text-muted-foreground">
                These live tests will be bundled into this series.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedTests.length} selected
            </Badge>
          </div>

          {selectedTests.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No live tests added yet. Use the <span className="font-semibold">Add</span> button below to include tests
                from your live test library.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {selectedTests.map((test) => (
                <Card key={test._id} className="border-border">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                        {test.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="uppercase">
                          {test.subject}
                        </Badge>
                        {test.specialization && <Badge variant="outline">{test.specialization}</Badge>}
                        <span>{formatDateTime(test.startDate)}</span>
                        {typeof test.duration === "number" && <span>{test.duration} min</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTest(test._id)}
                      aria-label={`Remove ${test.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  {test.description?.short && (
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {test.description.short}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Available Live Tests</h3>
              <p className="text-sm text-muted-foreground">
                Pick from the live tests you have already created on the Live Tests page.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchAvailableTests}
              disabled={loadingTests}
            >
              {loadingTests ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {fetchTestsError && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-4 text-sm text-destructive">
                {fetchTestsError}
              </CardContent>
            </Card>
          )}

          {loadingTests ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading live tests...
            </div>
          ) : selectableTests.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {selectableTests.map((test) => (
                <Card key={test._id} className="border-border justify-between">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                      {test.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="uppercase">
                        {test.subject}
                      </Badge>
                      {test.specialization && <Badge variant="outline">{test.specialization}</Badge>}
                      <span>{formatDateTime(test.startDate)}</span>
                      {typeof test.duration === "number" && <span>{test.duration} min</span>}
                    </div>
                  </CardHeader>
                  {test.description?.short && (
                    <CardContent className="pt-0 pb-2 text-sm text-muted-foreground">
                      {test.description.short}
                    </CardContent>
                  )}
                  <CardContent className="pt-0">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleAddTest(test)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No available live tests found. Create live tests on the Live Tests page, then return here to add them.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Test Series"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
