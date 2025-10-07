"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Users, BookOpen, Target, Award } from "lucide-react";
import { Test } from "@/lib/types/test";

interface ViewTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
}

export default function ViewTestDialog({
  open,
  onOpenChange,
  test,
}: ViewTestDialogProps) {
  if (!test) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      physics: "bg-blue-100 text-blue-800 border-blue-200",
      chemistry: "bg-green-100 text-green-800 border-green-200",
      mathematics: "bg-purple-100 text-purple-800 border-purple-200",
      mixed: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getTopicColor = (subject: string) => {
    const colors = {
      physics: "bg-blue-50 text-blue-700 border-blue-100",
      chemistry: "bg-green-50 text-green-700 border-green-100",
      mathematics: "bg-purple-50 text-purple-700 border-purple-100",
      mixed: "bg-orange-50 text-orange-700 border-orange-100",
    };
    return (
      colors[subject.toLowerCase() as keyof typeof colors] ||
      "bg-gray-50 text-gray-700 border-gray-100"
    );
  };

  // Group questions by subject
  const questionsBySubject = test.questions.reduce((acc, question) => {
    const subject = question.subject.toLowerCase();
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(question);
    return acc;
  }, {} as Record<string, typeof test.questions>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {test.title}
              </DialogTitle>
              <Badge
                className={`${getSubjectColor(
                  test.subject
                )} font-medium px-4 py-2 text-sm`}
              >
                {test.subject.charAt(0).toUpperCase() + test.subject.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {test.description.short}
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Test Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Test Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="h-4 w-4" />
                        Specialization
                      </div>
                      <div className="font-medium text-gray-900">
                        {test.specialization}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        Duration
                      </div>
                      <div className="font-medium text-gray-900">
                        {test.duration} minutes
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Start Date & Time
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatDate(test.startDate)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marking Scheme */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Marking Scheme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 mb-1">
                        Positive Marks
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        +{test.overallMarks.positive}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="text-sm text-red-600 mb-1">
                        Negative Marks
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {test.overallMarks.negative}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Marking Type</div>
                    <div className="font-medium text-gray-900">
                      {test.markingType === "PQM"
                        ? "Per Question Marking"
                        : "Overall Marking"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {test.description.long}
                </p>
              </CardContent>
            </Card>

            {/* Questions Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Questions Overview ({test.questions.length} Total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(questionsBySubject).map(
                    ([subject, questions]) => (
                      <div key={subject} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${getSubjectColor(
                              subject
                            )} font-medium px-3 py-1`}
                          >
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {questions.length} question
                            {questions.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {questions.map((question, index) => (
                            <div
                              key={question._id}
                              className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                      Q{index + 1}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getTopicColor(
                                        question.subject
                                      )}`}
                                    >
                                      {question.topic}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-900 font-medium leading-relaxed">
                                    {question.title}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Metadata */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Test Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <div className="font-medium text-gray-900">
                      {formatDate(test.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <div className="font-medium text-gray-900">
                      {formatDate(test.updatedAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Test Slug:</span>
                    <div className="font-medium text-gray-900 font-mono text-xs">
                      {test.slug}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
