"use client";

import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { Question } from "@/lib/types/test";

const normalizeField = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

interface QuestionBankProps {
  questions: Question[];
  selectedQuestions: string[];
  onQuestionSelect: (questionId: string, selected: boolean) => void;
  loading?: boolean;
  height?: string;
}

export default function QuestionBank({
  questions,
  selectedQuestions,
  onQuestionSelect,
  loading = false,
  height = "h-full",
}: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");

  const filterQuestions = useCallback(() => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          normalizeField(q.topic)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          normalizeField(q.subject)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter(
        (q) =>
          normalizeField(q.subject).toLowerCase() ===
          subjectFilter.toLowerCase()
      );
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter(
        (q) =>
          normalizeField(q.topic).toLowerCase() === topicFilter.toLowerCase()
      );
    }

    if (questionTypeFilter !== "all") {
      filtered = filtered.filter((q) => {
        const typeValue = getQuestionTypeValue(q);
        return typeValue === questionTypeFilter;
      });
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, subjectFilter, topicFilter, questionTypeFilter]);

  useEffect(() => {
    filterQuestions();
  }, [filterQuestions]);

  const getQuestionTypeValue = (question: Question) => {
    const rawType =
      (question as { questionType?: string }).questionType ??
      (question as { type?: string }).type ??
      "";
    return normalizeField(rawType).toLowerCase();
  };

  const formatQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "single-select":
        return "Single Select";
      case "multi-select":
        return "Multi Select";
      case "integer":
        return "Integer";
      default:
        return type
          ? type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "Unknown";
    }
  };

  const subjects = Array.from(
    new Set(questions.map((q) => normalizeField(q.subject)))
  ).filter(Boolean);
  const topics = Array.from(
    new Set(questions.map((q) => normalizeField(q.topic)))
  ).filter(Boolean);
  const questionTypes = Array.from(
    new Set(questions.map((q) => getQuestionTypeValue(q)))
  ).filter(Boolean);

  return (
    <div className="px-4 py-4 space-y-4 flex flex-col h-full">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject.toLowerCase()}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic.toLowerCase()}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={questionTypeFilter}
            onValueChange={setQuestionTypeFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {questionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {formatQuestionTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="p-3 rounded-lg flex justify-between items-center bg-muted flex-shrink-0">
        <span className="text-sm font-medium">
          Selected: {selectedQuestions.length} questions
        </span>
        <span className="text-sm text-muted-foreground">
          Showing: {filteredQuestions.length} of {questions.length} questions
        </span>
      </div>

      {/* Questions List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {questions.length === 0
                ? "No questions available"
                : "No questions match your filters"}
            </div>
          ) : (
            <div className="space-y-3 p-1">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  selected={selectedQuestions.includes(question._id)}
                  onSelect={onQuestionSelect}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  selected: boolean;
  onSelect: (questionId: string, selected: boolean) => void;
}

function QuestionCard({
  question,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <Card
      className={`rounded-md p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? "ring-2 ring-primary bg-primary/5 border-primary"
          : "hover:shadow-md"
      }`}
      onClick={() => onSelect(question._id, !selected)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) =>
            onSelect(question._id, checked as boolean)
          }
          className="mt-1"
        />
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed text-card-foreground">
            {question.title}
          </p>
        </div>
      </div>
    </Card>
  );
}
