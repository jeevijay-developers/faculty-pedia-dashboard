"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GripVertical, MoreHorizontal, Edit, Trash2, CheckCircle } from "lucide-react"

interface Question {
  id: string
  title: string
  subject: string
  topic: string
  marks: { positive: number; negative: number }
  options: {
    A: { text: string; image: { url: string; public_id: string } }
    B: { text: string; image: { url: string; public_id: string } }
    C: { text: string; image: { url: string; public_id: string } }
    D: { text: string; image: { url: string; public_id: string } }
  }
  correctOptions: string[]
  image: { url: string; public_id: string }
  educatorId: string
}

interface QuestionCardProps {
  question: Question
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, questionId: string) => void
  isDraggable?: boolean
}

export function QuestionCard({ question, onDelete, onDragStart, isDraggable = false }: QuestionCardProps) {
  const getSubjectColor = (subject: string) => {
    const colors = {
      Physics: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Chemistry: "bg-green-500/10 text-green-500 border-green-500/20",
      Mathematics: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Biology: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    }
    return colors[subject as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }

  return (
    <Card
      className="bg-card border-border hover:shadow-lg transition-all "
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, question.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {isDraggable && (
            <div className="flex items-center justify-center mt-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base text-card-foreground leading-relaxed line-clamp-2">
                {question.title}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Question
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(question.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Question
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getSubjectColor(question.subject)}>{question.subject}</Badge>
              <Badge variant="outline" className="text-xs">
                {question.topic}
              </Badge>
              <Badge variant="outline" className="text-xs">
                +{question.marks.positive} / {question.marks.negative}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Options */}
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(question.options).map(([key, option]) => (
              <div
                key={key}
                className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                  question.correctOptions.includes(key)
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <span className="font-medium text-muted-foreground w-6">{key}.</span>
                <span className="flex-1 text-card-foreground">{option.text}</span>
                {question.correctOptions.includes(key) && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            ))}
          </div>

          {/* Correct Answer Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Correct Answer{question.correctOptions.length > 1 ? "s" : ""}:</span>
            <div className="flex gap-1">
              {question.correctOptions.map((option) => (
                <Badge
                  key={option}
                  variant="outline"
                  className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
