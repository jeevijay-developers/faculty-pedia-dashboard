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
  darkTheme?: boolean;
}

export default function QuestionBank({
  questions,
  selectedQuestions,
  onQuestionSelect,
  loading = false,
  height = "h-[69rem]",
  darkTheme = false,
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
    <div className={`px-1 space-y-4 ${darkTheme ? "text-gray-100" : ""}`}>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              darkTheme ? "text-gray-400" : "text-gray-400"
            }`}
          />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${
              darkTheme
                ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500"
                : ""
            }`}
          />
        </div>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger
            className={
              darkTheme
                ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500 w-full"
                : ""
            }
          >
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent
            className={darkTheme ? "bg-gray-800 border-gray-700" : ""}
          >
            <SelectItem
              value="all"
              className={darkTheme ? "text-gray-100 focus:bg-gray-700" : ""}
            >
              All Subjects
            </SelectItem>
            {subjects.map((subject) => (
              <SelectItem
                key={subject}
                value={subject.toLowerCase()}
                className={darkTheme ? "text-gray-100 focus:bg-gray-700" : ""}
              >
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger
            className={
              darkTheme
                ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500 w-full"
                : ""
            }
          >
            <SelectValue placeholder="Filter by topic" />
          </SelectTrigger>
          <SelectContent
            className={darkTheme ? "bg-gray-800 border-gray-700" : ""}
          >
            <SelectItem
              value="all"
              className={darkTheme ? "text-gray-100 focus:bg-gray-700" : ""}
            >
              All Topics
            </SelectItem>
            {topics.map((topic) => (
              <SelectItem
                key={topic}
                value={topic.toLowerCase()}
                className={darkTheme ? "text-gray-100 focus:bg-gray-700" : ""}
              >
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={questionTypeFilter}
          onValueChange={setQuestionTypeFilter}
        >
          <SelectTrigger
            className={
              darkTheme
                ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500 w-full"
                : ""
            }
          >
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent
            className={darkTheme ? "bg-gray-800 border-gray-700" : ""}
          >
            <SelectItem
              value="all"
              className={darkTheme ? "text-gray-100 focus:bg-gray-700" : ""}
            >
              All Types
            </SelectItem>
            {questionTypes.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className={darkTheme ? "text-gray-100 focus:bg-gray-700" : ""}
              >
                {formatQuestionTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selection Summary */}
      <div
        className={`p-3 rounded-lg flex justify-between items-center ${
          darkTheme ? "bg-gray-700/50 border border-gray-600" : "bg-gray-50"
        }`}
      >
        <span
          className={`text-sm font-medium ${darkTheme ? "text-gray-200" : ""}`}
        >
          Selected: {selectedQuestions.length} questions
        </span>
        <span
          className={`text-sm ${darkTheme ? "text-gray-400" : "text-gray-600"}`}
        >
          Showing: {filteredQuestions.length} of {questions.length} questions
        </span>
      </div>

      {/* Questions List */}
      <ScrollArea
        className={height}
        style={{
          height: height.includes("vh")
            ? height.replace("h-[", "").replace("]", "")
            : undefined,
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2
              className={`h-6 w-6 animate-spin ${
                darkTheme ? "text-gray-400" : ""
              }`}
            />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkTheme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {questions.length === 0
              ? "No questions available"
              : "No questions match your filters"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                selected={selectedQuestions.includes(question._id)}
                onSelect={onQuestionSelect}
                darkTheme={darkTheme}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  selected: boolean;
  onSelect: (questionId: string, selected: boolean) => void;
  darkTheme?: boolean;
}

function QuestionCard({
  question,
  selected,
  onSelect,
  darkTheme = false,
}: QuestionCardProps) {
  return (
    <Card
      className={`rounded-md m-2 p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? darkTheme
            ? "ring-2 ring-blue-400 bg-blue-900/20 border-blue-600"
            : "ring-2 ring-blue-500 bg-blue-50"
          : darkTheme
          ? "hover:shadow-lg bg-gray-700/30 border-gray-600 hover:border-gray-500"
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
          className={`mt-1 ${
            darkTheme
              ? "border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              : ""
          }`}
        />
        <div className="flex-1">
          <p
            className={`text-sm font-medium leading-relaxed ${
              darkTheme ? "text-gray-200" : "text-card-foreground"
            }`}
          >
            {question.title}
          </p>
        </div>
      </div>
    </Card>
  );
}
