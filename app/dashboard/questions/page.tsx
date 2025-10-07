"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileQuestion, Loader2 } from "lucide-react"
import { CreateQuestionDialog } from "@/components/create-question-dialog"
import { QuestionCard } from "@/components/question-card"
import { useAuth } from "@/contexts/auth-context"
import { getQuestionsByIds } from "@/util/server"
import { toast } from "sonner"

export default function QuestionsPage() {
  const { educator } = useAuth()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [topicFilter, setTopicFilter] = useState("all")

  // Fetch questions when educator data is available
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!educator?.questions || educator.questions.length === 0) {
        setLoading(false)
        setQuestions([])
        return
      }

      try {
        setLoading(true)
        const questionIds = educator.questions
        const fetchedQuestions = await getQuestionsByIds(questionIds)
        setQuestions(fetchedQuestions)
      } catch (error) {
        console.error("Error fetching questions:", error)
        toast.error("Failed to load questions")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [educator?.questions])

  // Get unique subjects and topics for filters
  const subjects = Array.from(new Set(questions.map((q) => q.subject)))
  const topics = Array.from(new Set(questions.map((q) => q.topic)))

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "all" || question.subject === subjectFilter
    const matchesTopic = topicFilter === "all" || question.topic === topicFilter

    return matchesSearch && matchesSubject && matchesTopic
  })

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    e.dataTransfer.setData("text/plain", questionId)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Question Bank" description="Create and manage your question repository" />

      <div className="px-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">Your Questions</h2>
            <p className="text-sm text-muted-foreground">
              Create questions and drag them into tests. Total: {questions.length} questions
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Question
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading questions...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question._id || question.id}
                question={question}
                onDelete={handleDeleteQuestion}
                onDragStart={handleDragStart}
                isDraggable={true}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredQuestions.length === 0 && questions.length > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No questions found</h3>
              <p className="text-muted-foreground text-center mb-4">Try adjusting your search terms or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSubjectFilter("all")
                  setTopicFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {filteredQuestions.length === 0 && questions.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No questions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first question to start building your question bank
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateQuestionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
