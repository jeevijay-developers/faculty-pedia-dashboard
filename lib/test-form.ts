import {
  type CreateTestPayload,
  type UpdateTestPayload,
} from "@/lib/types/test";

export const SUBJECT_OPTIONS = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Mathematics", value: "mathematics" },
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
];

export const CLASS_OPTIONS = [
  { label: "Class 6th", value: "class-6th" },
  { label: "Class 7th", value: "class-7th" },
  { label: "Class 8th", value: "class-8th" },
  { label: "Class 9th", value: "class-9th" },
  { label: "Class 10th", value: "class-10th" },
  { label: "Class 11th", value: "class-11th" },
  { label: "Class 12th", value: "class-12th" },
  { label: "Dropper", value: "dropper" },
];

export const SPECIALIZATION_OPTIONS = [
  { label: "IIT-JEE", value: "IIT-JEE" },
  { label: "NEET", value: "NEET" },
  { label: "CBSE", value: "CBSE" },
];

export const MARKING_TYPE_OPTIONS = [
  { label: "Overall", value: "overall" },
  { label: "Per Question", value: "per_question" },
];

export interface TestFormValues {
  title: string;
  description: string;
  subjects: string[];
  classes: string[];
  specializations: string[];
  durationMinutes: string;
  overallMarks: string;
  markingType: "overall" | "per_question";
  questionIds: string[];
  instructions: string;
  passingMarks: string;
  negativeMarking: boolean;
  negativeMarkingRatio: string;
  shuffleQuestions: boolean;
  showResult: boolean;
  allowReview: boolean;
  isTestSeriesSpecific: boolean;
  testSeriesId: string;
}

export const defaultTestFormValues: TestFormValues = {
  title: "",
  description: "",
  subjects: [],
  classes: [],
  specializations: [],
  durationMinutes: "120",
  overallMarks: "100",
  markingType: "per_question",
  questionIds: [],
  instructions: "",
  passingMarks: "",
  negativeMarking: true,
  negativeMarkingRatio: "0.25",
  shuffleQuestions: false,
  showResult: true,
  allowReview: true,
  isTestSeriesSpecific: false,
  testSeriesId: "",
};

export interface ValidateTestFormOptions {
  requireQuestions?: boolean;
}

export const validateTestForm = (
  values: TestFormValues,
  options: ValidateTestFormOptions = { requireQuestions: true }
): string | null => {
  if (!values.title.trim()) {
    return "Title is required";
  }

  if (!values.description.trim()) {
    return "Description is required";
  }

  if (!values.subjects.length) {
    return "Select at least one subject";
  }

  if (!values.classes.length) {
    return "Select at least one class";
  }

  if (!values.specializations.length) {
    return "Select at least one specialization";
  }

  const duration = Number(values.durationMinutes);
  if (!Number.isFinite(duration) || duration <= 0) {
    return "Duration must be greater than 0";
  }

  const overallMarks = Number(values.overallMarks);
  if (!Number.isFinite(overallMarks) || overallMarks <= 0) {
    return "Overall marks must be greater than 0";
  }

  if (values.passingMarks) {
    const passing = Number(values.passingMarks);
    if (!Number.isFinite(passing) || passing < 0) {
      return "Passing marks must be 0 or higher";
    }

    if (passing > overallMarks) {
      return "Passing marks cannot exceed overall marks";
    }
  }

  if (values.negativeMarking) {
    const ratio = Number(values.negativeMarkingRatio);
    if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
      return "Negative marking ratio must be between 0 and 1";
    }
  }

  if (values.isTestSeriesSpecific && !values.testSeriesId.trim()) {
    return "Provide a Test Series ID or disable the Test Series toggle";
  }

  if (options.requireQuestions && values.questionIds.length === 0) {
    return "Select at least one question";
  }

  return null;
};

const normalizeQuestions = (questionIds: string[]) =>
  questionIds.filter(Boolean);

const basePayload = (values: TestFormValues) => {
  const duration = Number(values.durationMinutes);
  const overallMarks = Number(values.overallMarks);
  const passingMarks = values.passingMarks
    ? Number(values.passingMarks)
    : undefined;
  const negativeRatio = values.negativeMarking
    ? Number(values.negativeMarkingRatio || 0.25)
    : 0;

  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    subjects: values.subjects,
    class: values.classes,
    specialization: values.specializations,
    duration,
    overallMarks,
    markingType: values.markingType,
    instructions: values.instructions.trim(),
    passingMarks,
    negativeMarking: values.negativeMarking,
    negativeMarkingRatio: values.negativeMarking ? negativeRatio : 0,
    shuffleQuestions: values.shuffleQuestions,
    showResult: values.showResult,
    allowReview: values.allowReview,
    isTestSeriesSpecific: values.isTestSeriesSpecific,
    testSeriesID:
      values.isTestSeriesSpecific && values.testSeriesId.trim()
        ? values.testSeriesId.trim()
        : undefined,
  };

  return payload;
};

export const buildCreateTestPayload = (
  values: TestFormValues,
  educatorId: string
): CreateTestPayload => ({
  ...basePayload(values),
  questions: normalizeQuestions(values.questionIds),
  educatorID: educatorId,
});

export const buildUpdateTestPayload = (
  values: TestFormValues
): UpdateTestPayload => ({
  ...basePayload(values),
  questions: values.questionIds.length
    ? normalizeQuestions(values.questionIds)
    : undefined,
});
