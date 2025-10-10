"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileQuestion, Loader2, MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateQuestionDialog } from "@/components/create-question-dialog"
import { ViewQuestionDialog } from "@/components/view-question-dialog"
import { EditQuestionDialog } from "@/components/edit-question-dialog"
import { DeleteQuestionAlert } from "@/components/delete-question-alert"
import { useAuth } from "@/contexts/auth-context"
import { getQuestionsByIds, deleteQuestion } from "@/util/server"
import toast from "react-hot-toast"

const ITEMS_PER_PAGE = 15

export default function QuestionsPage() {
  const { educator } = useAuth()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [questionToDelete, setQuestionToDelete] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [topicFilter, setTopicFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch questions when educator data is available
  useEffect(() => {
    fetchQuestions()
  }, [educator?.questions])

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

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question)
    setIsViewDialogOpen(true)
  }

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question)
    setIsEditDialogOpen(true)
  }

  const handleDeleteQuestion = (question: any) => {
    setQuestionToDelete(question)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return

    setDeleteLoading(true)
    try {
      await deleteQuestion(questionToDelete._id || questionToDelete.id)
      toast.success("Question deleted successfully!")
      setIsDeleteAlertOpen(false)
      setQuestionToDelete(null)
      // Refresh questions list
      fetchQuestions()
    } catch (error: any) {
      console.error("Error deleting question:", error)
      toast.error(error.response?.data?.message || "Failed to delete question")
    } finally {
      setDeleteLoading(false)
    }
  }

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

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
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
        ) : filteredQuestions.length > 0 ? (
          <>
            <Card className="bg-card border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuestions.map((question) => (
                    <TableRow key={question._id || question.id}>
                      <TableCell>
                        <div className="max-w-xl">
                          <div className="font-medium text-foreground line-clamp-1 truncate">
                            {question.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {question.subject}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">
                          {question.topic}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.type || "MCQ"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600">+{question.positiveMarks || 4}</span>
                          {" / "}
                          <span className="text-red-600">-{question.negativeMarks || 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewQuestion(question)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Question
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 font-semibold"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Question
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredQuestions.length)} of {filteredQuestions.length}{" "}
                  questions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : null}

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
      <ViewQuestionDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} question={selectedQuestion} />
      <EditQuestionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        question={selectedQuestion}
        onQuestionUpdated={fetchQuestions}
      />
      <DeleteQuestionAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDeleteQuestion}
        loading={deleteLoading}
        questionTitle={questionToDelete?.title || ""}
      />
    </div>
  )
}
