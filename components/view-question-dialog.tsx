"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, X } from "lucide-react"

interface ViewQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: any
}

export function ViewQuestionDialog({ open, onOpenChange, question }: ViewQuestionDialogProps) {
  if (!question) return null

  const isCorrectOption = (option: string) => {
    return question.correctOptions?.includes(option)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <Badge variant="outline" className="capitalize">
                {question.subject}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {question.topic}
              </Badge>
              <Badge variant="outline">{question.type || "MCQ"}</Badge>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Positive Marks:</span>
                <span className="font-semibold text-green-600">+{question.marks?.positive || 4}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Negative Marks:</span>
                <span className="font-semibold text-red-600">-{question.marks?.negative || 1}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Question</h3>
            <p className="text-base leading-relaxed">{question.title}</p>
          </div>

          {/* Question Image if exists */}
          {question.image?.url && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Question Image</h3>
              <div className="rounded-lg border overflow-hidden">
                <img src={question.image.url} alt="Question" className="w-full h-auto" />
              </div>
            </div>
          )}

          <Separator />

          {/* Answer Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Answer Options</h3>
            <div className="space-y-3">
              {["A", "B", "C", "D"].map((option) => {
                const optionData = question.options?.[option]
                const isCorrect = isCorrectOption(option)

                return (
                  <div
                    key={option}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isCorrect
                        ? "border-green-500 bg-green-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <span className="font-semibold text-lg">Option {option}</span>
                        {isCorrect && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-base">{optionData?.text || "No text provided"}</p>
                        {optionData?.image?.url && (
                          <div className="rounded border overflow-hidden max-w-md">
                            <img src={optionData.image.url} alt={`Option ${option}`} className="w-full h-auto" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Correct Answer Summary */}
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600">Correct Answer(s)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {question.correctOptions?.length > 1 ? "Multiple correct answers: " : "Correct answer: "}
              <span className="font-semibold text-foreground">
                {question.correctOptions?.join(", ") || "Not specified"}
              </span>
            </p>
          </div>

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {question.updatedAt && question.updatedAt !== question.createdAt && (
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="font-medium">
                  {new Date(question.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
