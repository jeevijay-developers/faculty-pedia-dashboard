"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateLiveTest } from "@/util/server"

interface EditTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  test: any
  onTestUpdated: () => void
}

export function EditTestDialog({ open, onOpenChange, test, onTestUpdated }: EditTestDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    specialization: "",
    shortDesc: "",
    longDesc: "",
    startDate: "",
    duration: "",
    positiveMarks: "",
    negativeMarks: "",
    markingType: "PQM",
  })

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || "",
        subject: test.subject?.toLowerCase() || "",
        specialization: test.specialization || "",
        shortDesc: test.description?.short || "",
        longDesc: test.description?.long || "",
        startDate: test.startDate ? new Date(test.startDate).toISOString().slice(0, 16) : "",
        duration: test.duration?.toString() || "",
        positiveMarks: test.overallMarks?.positive?.toString() || "",
        negativeMarks: test.overallMarks?.negative?.toString() || "",
        markingType: test.markingType || "PQM",
      })
    }
  }, [test])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        title: formData.title,
        subject: formData.subject,
        specialization: formData.specialization,
        description: {
          short: formData.shortDesc,
          long: formData.longDesc,
        },
        startDate: new Date(formData.startDate).toISOString(),
        duration: Number(formData.duration),
        overallMarks: {
          positive: Number(formData.positiveMarks),
          negative: Number(formData.negativeMarks),
        },
        markingType: formData.markingType,
      }

      await updateLiveTest(test._id, updateData)
      toast.success("Test updated successfully!")
      onTestUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating test:", error)
      toast.error(error.response?.data?.message || "Failed to update test")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Test Title *</Label>
            <Input
              id="edit-title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter test title"
            />
          </div>

          {/* Subject and Specialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialization">Specialization *</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              >
                <SelectTrigger id="edit-specialization">
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

          {/* Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-short-desc">Short Description *</Label>
              <Input
                id="edit-short-desc"
                required
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                placeholder="Brief description (shown in cards)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-long-desc">Long Description *</Label>
              <Textarea
                id="edit-long-desc"
                required
                value={formData.longDesc}
                onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
                placeholder="Detailed test description"
                rows={4}
              />
            </div>
          </div>

          {/* Date and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date">Start Date & Time *</Label>
              <Input
                id="edit-start-date"
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes) *</Label>
              <Input
                id="edit-duration"
                type="number"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 180"
                min="1"
              />
            </div>
          </div>

          {/* Marks and Marking Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-positive">Positive Marks *</Label>
              <Input
                id="edit-positive"
                type="number"
                required
                value={formData.positiveMarks}
                onChange={(e) => setFormData({ ...formData, positiveMarks: e.target.value })}
                placeholder="e.g., 4"
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-negative">Negative Marks *</Label>
              <Input
                id="edit-negative"
                type="number"
                required
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                placeholder="e.g., 1"
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-marking-type">Marking Type *</Label>
              <Select
                value={formData.markingType}
                onValueChange={(value) => setFormData({ ...formData, markingType: value })}
              >
                <SelectTrigger id="edit-marking-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PQM">Per Question Marks (PQM)</SelectItem>
                  <SelectItem value="OAM">Overall Marks (OAM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Questions cannot be edited from this dialog. To modify questions, please delete and
              recreate the test.
            </p>
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
                "Update Test"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
