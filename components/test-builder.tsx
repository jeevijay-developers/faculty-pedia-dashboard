"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, TestTube, FileQuestion, GripVertical } from "lucide-react"
import { QuestionCard } from "@/components/question-card"

interface Test {
  id: string
  title: string
  duration: number
  questions: any[]
}

interface TestBuilderProps {
  maxTests: number
  tests: Test[]
  onTestsChange: (tests: Test[]) => void
  subject: string
  specialization: string
}

// Mock questions data (filtered by subject)
const mockQuestions = [
  {
    id: "1",
    title:
      "A particle moves in a straight line with constant acceleration. If it covers 100m in the first 5 seconds, what is its acceleration?",
    subject: "Physics",
    topic: "Kinematics",
    marks: { positive: 4, negative: 1 },
    options: {
      A: { text: "4 m/s²", image: { url: "", public_id: "" } },
      B: { text: "8 m/s²", image: { url: "", public_id: "" } },
      C: { text: "10 m/s²", image: { url: "", public_id: "" } },
      D: { text: "12 m/s²", image: { url: "", public_id: "" } },
    },
    correctOptions: ["B"],
    image: { url: "", public_id: "" },
    educatorId: "educator1",
  },
  {
    id: "2",
    title: "Which of the following compounds exhibits optical isomerism?",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    marks: { positive: 4, negative: 1 },
    options: {
      A: { text: "CH₃CH₂CH₂CH₃", image: { url: "", public_id: "" } },
      B: { text: "CH₃CH(OH)CH₂CH₃", image: { url: "", public_id: "" } },
      C: { text: "CH₃CH₂OH", image: { url: "", public_id: "" } },
      D: { text: "CH₃COOH", image: { url: "", public_id: "" } },
    },
    correctOptions: ["B"],
    image: { url: "", public_id: "" },
    educatorId: "educator1",
  },
  {
    id: "3",
    title: "Find the derivative of f(x) = x³ + 2x² - 5x + 1",
    subject: "Mathematics",
    topic: "Calculus",
    marks: { positive: 4, negative: 1 },
    options: {
      A: { text: "3x² + 4x - 5", image: { url: "", public_id: "" } },
      B: { text: "3x² + 2x - 5", image: { url: "", public_id: "" } },
      C: { text: "x² + 4x - 5", image: { url: "", public_id: "" } },
      D: { text: "3x² + 4x + 5", image: { url: "", public_id: "" } },
    },
    correctOptions: ["A"],
    image: { url: "", public_id: "" },
    educatorId: "educator1",
  },
]

export function TestBuilder({ maxTests, tests, onTestsChange, subject, specialization }: TestBuilderProps) {
  const [filteredQuestions, setFilteredQuestions] = useState(mockQuestions)
  const [draggedQuestion, setDraggedQuestion] = useState<any>(null)

  useEffect(() => {
    // Filter questions by subject if specified
    if (subject) {
      setFilteredQuestions(mockQuestions.filter((q) => q.subject === subject))
    } else {
      setFilteredQuestions(mockQuestions)
    }
  }, [subject])

  const addTest = () => {
    if (tests.length < maxTests) {
      const newTest: Test = {
        id: Date.now().toString(),
        title: `Test ${tests.length + 1}`,
        duration: 180, // 3 hours in minutes
        questions: [],
      }
      onTestsChange([...tests, newTest])
    }
  }

  const updateTest = (testId: string, field: keyof Test, value: any) => {
    const updatedTests = tests.map((test) => (test.id === testId ? { ...test, [field]: value } : test))
    onTestsChange(updatedTests)
  }

  const deleteTest = (testId: string) => {
    onTestsChange(tests.filter((test) => test.id !== testId))
  }

  const handleQuestionDragStart = (e: React.DragEvent, question: any) => {
    setDraggedQuestion(question)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleTestDrop = (e: React.DragEvent, testId: string) => {
    e.preventDefault()
    if (draggedQuestion) {
      const test = tests.find((t) => t.id === testId)
      if (test && !test.questions.find((q) => q.id === draggedQuestion.id)) {
        updateTest(testId, "questions", [...test.questions, draggedQuestion])
      }
      setDraggedQuestion(null)
    }
  }

  const handleTestDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeQuestionFromTest = (testId: string, questionId: string) => {
    const test = tests.find((t) => t.id === testId)
    if (test) {
      updateTest(
        testId,
        "questions",
        test.questions.filter((q) => q.id !== questionId),
      )
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Question Bank */}
      <div className="lg:col-span-1">
        <Card className="bg-card border-border h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Question Bank
              {subject && <Badge variant="outline">{subject}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] px-4">
              <div className="space-y-3 pb-4">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handleQuestionDragStart(e, question)}
                  >
                    <QuestionCard
                      question={question}
                      onDelete={() => {}}
                      onDragStart={handleQuestionDragStart}
                      isDraggable={false}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Test Builder */}
      <div className="lg:col-span-2">
        <Card className="bg-card border-border h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Tests ({tests.length}/{maxTests})
              </CardTitle>
              <Button onClick={addTest} disabled={tests.length >= maxTests} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Test
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] px-4">
              <div className="space-y-4 pb-4">
                {tests.map((test, index) => (
                  <Card
                    key={test.id}
                    className="bg-muted/30 border-border"
                    onDrop={(e) => handleTestDrop(e, test.id)}
                    onDragOver={handleTestDragOver}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <Input
                              value={test.title}
                              onChange={(e) => updateTest(test.id, "title", e.target.value)}
                              className="h-8 font-medium"
                            />
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Duration (min):</Label>
                              <Input
                                type="number"
                                value={test.duration}
                                onChange={(e) => updateTest(test.id, "duration", Number.parseInt(e.target.value))}
                                className="h-6 w-20 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTest(test.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Questions: {test.questions.length}</span>
                          <span className="text-muted-foreground">
                            Total Marks: {test.questions.reduce((sum, q) => sum + q.marks.positive, 0)}
                          </span>
                        </div>

                        {test.questions.length === 0 ? (
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Drag questions from the question bank to add them to this test
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {test.questions.map((question) => (
                              <div
                                key={question.id}
                                className="flex items-center justify-between p-2 bg-background rounded border border-border"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium line-clamp-1">{question.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {question.topic}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      +{question.marks.positive}/-{question.marks.negative}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestionFromTest(test.id, question.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {tests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tests created yet</p>
                    <p className="text-sm">Click "Add Test" to start building your test series</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
