// Frontend TypeScript interfaces for test bank functionality

export interface Question {
  _id: string;
  title: string;
  subject: string;
  topic: string;
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

export interface Test {
  _id: string;
  title: string;
  description: {
    short: string;
    long: string;
  };
  subject: string;
  specialization: string;
  startDate: string;
  duration: number;
  overallMarks: {
    positive: number;
    negative: number;
  };
  markingType: string;
  questions: Array<{
    _id: string;
    title: string;
    subject: string;
    topic: string;
  }>;
  educatorId: {
    _id: string;
    email: string;
  };
  slug: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface TestsResponse {
  tests: Test[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTests: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateTestData {
  title: string;
  description: {
    short: string;
    long: string;
  };
  subject: string;
  specialization: string;
  startDate: string;
  duration: number;
  overallMarks: {
    positive: number;
    negative: number;
  };
  markingType: string;
  questions: string[];
  educatorId: string;
}
