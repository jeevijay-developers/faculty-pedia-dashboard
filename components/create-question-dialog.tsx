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
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, ImageIcon } from "lucide-react"

interface CreateQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface QuestionOption {
  text: string
  image: File | null
}

export function CreateQuestionDialog({ open, onOpenChange }: CreateQuestionDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    topic: "",
    positiveMarks: "4",
    negativeMarks: "1",
  })

  const [options, setOptions] = useState<Record<string, QuestionOption>>({
    A: { text: "", image: null },
    B: { text: "", image: null },
    C: { text: "", image: null },
    D: { text: "", image: null },
  })

  const [correctOptions, setCorrectOptions] = useState<string[]>([])
  const [questionImage, setQuestionImage] = useState<File | null>(null)

  const updateOption = (key: string, field: keyof QuestionOption, value: string | File) => {
    setOptions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const toggleCorrectOption = (option: string) => {
    setCorrectOptions((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]))
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Question Data:", {
      ...formData,
      options,
      correctOptions,
      questionImage,
    })
    onOpenChange(false)

    // Reset form
    setFormData({
      title: "",
      subject: "",
      topic: "",
      positiveMarks: "4",
      negativeMarks: "1",
    })
    setOptions({
      A: { text: "", image: null },
      B: { text: "", image: null },
      C: { text: "", image: null },
      D: { text: "", image: null },
    })
    setCorrectOptions([])
    setQuestionImage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Add a new question to your question bank. You can drag these questions into tests later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Question Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Question Text</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
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
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Kinematics, Organic Chemistry"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Question Image (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setQuestionImage(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positiveMarks">Positive Marks</Label>
                  <Input
                    id="positiveMarks"
                    type="number"
                    value={formData.positiveMarks}
                    onChange={(e) => setFormData({ ...formData, positiveMarks: e.target.value })}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Answer Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(options).map(([key, option]) => (
                <div key={key} className="space-y-3 p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`correct-${key}`}
                        checked={correctOptions.includes(key)}
                        onCheckedChange={() => toggleCorrectOption(key)}
                      />
                      <Label htmlFor={`correct-${key}`} className="text-sm font-medium">
                        Option {key} (Correct Answer)
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`option-${key}`}>Option {key} Text</Label>
                    <Input
                      id={`option-${key}`}
                      value={option.text}
                      onChange={(e) => updateOption(key, "text", e.target.value)}
                      placeholder={`Enter option ${key} text`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`image-${key}`}>Option {key} Image (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`image-${key}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateOption(key, "image", e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {option.image && <p className="text-xs text-muted-foreground">Selected: {option.image.name}</p>}
                  </div>
                </div>
              ))}

              {correctOptions.length === 0 && (
                <div className="text-center py-4 text-destructive text-sm">
                  Please select at least one correct answer
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.subject || !formData.topic || correctOptions.length === 0}
          >
            Create Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
