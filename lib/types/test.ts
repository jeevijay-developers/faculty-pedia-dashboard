// Shared TypeScript models for the test workflow

export interface Question {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  questionType?: string;
  marks: {
    positive: number;
    negative: number;
  };
  options: {
    A: { text: string; image: { url: string; public_id: string } };
    B: { text: string; image: { url: string; public_id: string } };
    C: { text: string; image: { url: string; public_id: string } };
    D: { text: string; image: { url: string; public_id: string } };
  };
  correctOptions: string[];
  educatorId: {
    _id: string;
    email: string;
  };
  __v?: number;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalQuestions: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TestQuestionSummary {
  _id: string;
  title: string;
  difficulty?: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  image?: string;
  subjects: string[];
  class: string[];
  specialization: string[];
  duration: number;
  overallMarks: number;
  markingType: "overall" | "per_question";
  questions: TestQuestionSummary[];
  isTestSeriesSpecific: boolean;
  testSeriesID?: {
    _id: string;
    title: string;
    description?: string;
  } | null;
  educatorID: {
    _id: string;
    name?: string;
    email?: string;
  };
  instructions?: string;
  passingMarks?: number;
  negativeMarking: boolean;
  negativeMarkingRatio: number;
  shuffleQuestions: boolean;
  showResult: boolean;
  allowReview: boolean;
  isActive: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface TestsResponse {
  success: boolean;
  message: string;
  data: {
    tests: Test[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTests: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    };
  };
}

export interface CreateTestPayload {
  title: string;
  description: string;
  subjects: string[];
  class: string[];
  specialization: string[];
  duration: number;
  overallMarks: number;
  markingType: "overall" | "per_question";
  questions: string[];
  educatorID: string;
  instructions?: string;
  passingMarks?: number;
  negativeMarking?: boolean;
  negativeMarkingRatio?: number;
  shuffleQuestions?: boolean;
  showResult?: boolean;
  allowReview?: boolean;
  isTestSeriesSpecific?: boolean;
  testSeriesID?: string;
}

export type UpdateTestPayload = Partial<CreateTestPayload>;
