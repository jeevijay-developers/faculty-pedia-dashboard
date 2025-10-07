export interface LiveTest {
  _id: string;
  title: string;
  description: {
    short: string;
    long: string;
  };
  image?: {
    public_id: string;
    url: string;
  };
  subject: string;
  specialization: "IIT-JEE" | "NEET" | "CBSE";
  startDate: string;
  duration: number;
  overallMarks: {
    positive: number;
    negative: number;
  };
  markingType: "OAM" | "PQM";
  questions: Array<{
    _id: string;
    title: string;
    subject: string;
    topic: string;
  }>;
  testSeriesId?: string;
  educatorId: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiveTestData {
  title: string;
  description: {
    short: string;
    long: string;
  };
  subject: string;
  specialization: "IIT-JEE" | "NEET" | "CBSE";
  startDate: string;
  duration: number;
  overallMarks: {
    positive: number;
    negative: number;
  };
  markingType: "OAM" | "PQM";
  questions: string[];
  educatorId: string;
}

export interface LiveTestsResponse {
  success: boolean;
  tests: LiveTest[];
  total: number;
}
