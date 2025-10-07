"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
  height = "h-96",
  darkTheme = false,
}: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, subjectFilter, topicFilter]);

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter(
        (q) => q.subject.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter(
        (q) => q.topic.toLowerCase() === topicFilter.toLowerCase()
      );
    }

    setFilteredQuestions(filtered);
  };

  const subjects = Array.from(new Set(questions.map((q) => q.subject)));
  const topics = Array.from(new Set(questions.map((q) => q.topic)));

  const getSubjectColor = (subject: string) => {
    if (darkTheme) {
      const colors = {
        physics: "bg-blue-900/50 text-blue-300",
        chemistry: "bg-green-900/50 text-green-300",
        mathematics: "bg-purple-900/50 text-purple-300",
        math: "bg-purple-900/50 text-purple-300",
      };
      return (
        colors[subject.toLowerCase() as keyof typeof colors] ||
        "bg-gray-700 text-gray-300"
      );
    } else {
      const colors = {
        physics: "bg-blue-100 text-blue-800",
        chemistry: "bg-green-100 text-green-800",
        mathematics: "bg-purple-100 text-purple-800",
        math: "bg-purple-100 text-purple-800",
      };
      return (
        colors[subject.toLowerCase() as keyof typeof colors] ||
        "bg-gray-100 text-gray-800"
      );
    }
  };

  return (
    <div className={`space-y-4 ${darkTheme ? "text-gray-100" : ""}`}>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500"
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
                ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500"
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
      <ScrollArea className={height}>
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
                getSubjectColor={getSubjectColor}
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
  getSubjectColor: (subject: string) => string;
  darkTheme?: boolean;
}

function QuestionCard({
  question,
  selected,
  onSelect,
  getSubjectColor,
  darkTheme = false,
}: QuestionCardProps) {
  return (
    <Card
      className={`p-4 transition-all duration-200 ${
        selected
          ? darkTheme
            ? "ring-2 ring-blue-400 bg-blue-900/20 border-blue-600"
            : "ring-2 ring-blue-500 bg-blue-50"
          : darkTheme
          ? "hover:shadow-lg bg-gray-700/30 border-gray-600 hover:border-gray-500"
          : "hover:shadow-md"
      }`}
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
        <div className="flex-1 space-y-3">
          <div
            className={`font-medium text-sm leading-relaxed ${
              darkTheme ? "text-gray-200" : ""
            }`}
          >
            {question.title}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={getSubjectColor(question.subject)}>
              {question.subject}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                darkTheme ? "border-gray-500 text-gray-300" : ""
              }`}
            >
              {question.topic}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                darkTheme ? "border-gray-500 text-gray-300" : ""
              }`}
            >
              +{question.marks.positive} / {question.marks.negative}
            </Badge>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ${
              darkTheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <div className="space-y-1">
              <div>
                <span className="font-medium">A)</span>{" "}
                {question.options.A.text}
              </div>
              <div>
                <span className="font-medium">B)</span>{" "}
                {question.options.B.text}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="font-medium">C)</span>{" "}
                {question.options.C.text}
              </div>
              <div>
                <span className="font-medium">D)</span>{" "}
                {question.options.D.text}
              </div>
            </div>
          </div>

          {question.correctOptions.length > 0 && (
            <div
              className={`text-xs ${
                darkTheme ? "text-green-400" : "text-green-600"
              }`}
            >
              <span className="font-medium">Correct:</span>{" "}
              {question.correctOptions.join(", ")}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
