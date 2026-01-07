export interface CourseMedia {
  url?: string;
  public_id?: string;
}

export type CourseType = "one-to-one" | "one-to-all";

export type CourseClass =
  | "class-6th"
  | "class-7th"
  | "class-8th"
  | "class-9th"
  | "class-10th"
  | "class-11th"
  | "class-12th"
  | "dropper";

export type CourseSubject =
  | "biology"
  | "physics"
  | "mathematics"
  | "chemistry"
  | "english"
  | "hindi";

export interface CourseStudyMaterial {
  title: string;
  link: string;
  fileType?: "PDF" | "DOC" | "PPT" | "EXCEL" | "OTHER";
  publicId?: string;
  resourceType?: string;
}

export interface EducatorSummary {
  _id: string;
  fullName?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  courseType: CourseType;
  educatorID: string | EducatorSummary;
  specialization: string[];
  class?: CourseClass[];
  classes?: CourseClass[]; // legacy field
  courseClass?: CourseClass; // legacy single value
  subject?: CourseSubject[];
  fees: number;
  discount?: number;
  image?: string | CourseMedia;
  courseThumbnail?: string;
  startDate?: string;
  endDate?: string;
  courseDuration?: string;
  validDate?: string;
  studyMaterials?: CourseStudyMaterial[];
  enrolledStudents?: Array<string | { _id: string }>;
  fee?: number; // legacy fallback
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoursePaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
}

export interface EducatorCourseResponse {
  courses: Course[];
  pagination?: CoursePaginationMeta;
}
