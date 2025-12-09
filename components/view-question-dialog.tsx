"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

interface ViewQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
}

export function ViewQuestionDialog({
  open,
  onOpenChange,
  question,
}: ViewQuestionDialogProps) {
  if (!question) return null;

  const toFirstString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      const first = value.find(
        (item) => typeof item === "string" && item.trim()
      );
      return typeof first === "string" ? first : "";
    }
    return "";
  };

  const formatQuestionType = (value: string) => {
    switch (value) {
      case "single-select":
        return "Single Select";
      case "multi-select":
        return "Multi Select";
      case "integer":
        return "Integer";
      case "mcq":
        return "MCQ";
      case "msq":
        return "MSQ";
      case "numerical":
        return "Numerical";
      default:
        return value || "Unknown";
    }
  };

  const rawType = question.questionType || question.type || "";
  const normalizedType =
    typeof rawType === "string" ? rawType.toLowerCase() : "";
  const subjectLabel = toFirstString(question.subject);
  const topicLabel = toFirstString(question.topic || question.topics);
  const questionText = question.title || question.question || "";
  const questionImageUrl =
    question.image?.url ||
    (typeof question.image === "string" ? question.image : null) ||
    question.questionImage ||
    question.question_image ||
    null;

  const explanationText =
    question.explanation ||
    question.solution ||
    question.answerExplanation ||
    "";

  const positiveMarks = question.marks?.positive ?? question.positiveMarks ?? 0;
  const negativeMarks = question.marks?.negative ?? question.negativeMarks ?? 0;

  const rawCorrectOptions =
    question.correctOptions ??
    question.correctOption ??
    question.correctAnswer ??
    question.correctAnswers;

  const normalizedCorrectOptions = Array.isArray(rawCorrectOptions)
    ? rawCorrectOptions.map((option) => option?.toString()).filter(Boolean)
    : typeof rawCorrectOptions === "string"
    ? [rawCorrectOptions]
    : [];

  const numericCorrectAnswer =
    typeof rawCorrectOptions === "number"
      ? rawCorrectOptions
      : typeof question.integerAnswer === "number"
      ? question.integerAnswer
      : typeof question.correctIntegerAnswer === "number"
      ? question.correctIntegerAnswer
      : null;

  const isIntegerQuestion =
    normalizedType === "integer" || numericCorrectAnswer !== null;
  const correctOptionSet = new Set(normalizedCorrectOptions);

  const isCorrectOption = (option: string) => correctOptionSet.has(option);

  const normalizedOptions = ["A", "B", "C", "D"].map((optionKey) => {
    const rawOption = question.options?.[optionKey] ?? question[optionKey];

    if (!rawOption) {
      const fallbackText = question[`option${optionKey}`];
      return {
        key: optionKey,
        text: typeof fallbackText === "string" ? fallbackText : "",
        imageUrl: null,
      };
    }

    if (typeof rawOption === "string") {
      return { key: optionKey, text: rawOption, imageUrl: null };
    }

    const text =
      (typeof rawOption.text === "string" && rawOption.text) ||
      (typeof rawOption.value === "string" ? rawOption.value : "");
    const imageUrl =
      rawOption.image?.url ||
      (typeof rawOption.image === "string" ? rawOption.image : null) ||
      rawOption.imageUrl ||
      null;

    return { key: optionKey, text, imageUrl };
  });

  const hasChoiceOptions = normalizedOptions.some(
    (option) => option.text || option.imageUrl
  );
  const correctAnswerSummary = isIntegerQuestion
    ? numericCorrectAnswer?.toString() ||
      normalizedCorrectOptions.join(", ") ||
      "Not specified"
    : normalizedCorrectOptions.join(", ") || "Not specified";

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
              {subjectLabel ? (
                <Badge variant="outline" className="capitalize">
                  {subjectLabel}
                </Badge>
              ) : null}
              {topicLabel ? (
                <Badge variant="outline" className="capitalize">
                  {topicLabel}
                </Badge>
              ) : null}
              <Badge variant="outline">
                {formatQuestionType(normalizedType)}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Positive Marks:</span>
                <span className="font-semibold text-green-600">
                  +{positiveMarks}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Negative Marks:</span>
                <span className="font-semibold text-red-600">
                  -{negativeMarks}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Question
            </h3>
            <p className="text-base leading-relaxed">
              {questionText || "No question text provided"}
            </p>
          </div>

          {/* Question Image if exists */}
          {questionImageUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Question Image
              </h3>
              <div className="rounded-lg border overflow-hidden">
                <img
                  src={questionImageUrl}
                  alt="Question"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {explanationText ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Explanation
              </h3>
              <p className="text-base leading-relaxed whitespace-pre-line">
                {explanationText}
              </p>
            </div>
          ) : null}

          <Separator />

          {/* Answer Options */}
          {hasChoiceOptions && !isIntegerQuestion ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Answer Options
              </h3>
              <div className="space-y-3">
                {normalizedOptions.map(({ key, text, imageUrl }) => {
                  const optionIsCorrect = isCorrectOption(key);

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        optionIsCorrect
                          ? "border-green-500 bg-green-500/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <span className="font-semibold text-lg">
                            Option {key}
                          </span>
                          {optionIsCorrect && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-base">
                            {text || "No text provided"}
                          </p>
                          {imageUrl && (
                            <div className="rounded border overflow-hidden max-w-md">
                              <img
                                src={imageUrl}
                                alt={`Option ${key}`}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {isIntegerQuestion ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Integer Answer
              </h3>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-base font-semibold">
                  {numericCorrectAnswer !== null
                    ? numericCorrectAnswer
                    : normalizedCorrectOptions.join(", ") || "Not specified"}
                </p>
              </div>
            </div>
          ) : null}

          {/* Correct Answer Summary */}
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600">
                Correct Answer(s)
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {normalizedCorrectOptions.length > 1 && !isIntegerQuestion
                ? "Multiple correct answers: "
                : "Correct answer: "}
              <span className="font-semibold text-foreground">
                {correctAnswerSummary}
              </span>
            </p>
          </div>

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {question.updatedAt &&
              question.updatedAt !== question.createdAt && (
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
  );
}
