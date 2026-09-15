// src/types/homework.ts

export type AssignmentStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED";
export type AssignmentType = "TEXT" | "FILE_UPLOAD" | "CODE" | "MIXED";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string | null;
  courseId: string;
  courseName: string;
  assignmentType: AssignmentType;
  difficultyLevel: DifficultyLevel;
  maxMarks: number;
  passingMarks: number;
  startDate: string; // ISO string, as returned by the API
  submissionDeadline: string;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  allowMultipleFiles: boolean;
  maxSubmissionAttempts: number;
  lateSubmissionAllowed: boolean;
  latePenaltyPercent?: number | null;
  status: AssignmentStatus;
  version: number;
  clonedFromId?: string | null;
  archivedAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Shape the create/edit form collects — mirrors the backend's
// CreateAssignmentInput, minus server-generated fields.
export interface AssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseName: string;
  assignmentType: AssignmentType;
  difficultyLevel: DifficultyLevel;
  maxMarks: number;
  passingMarks: number;
  startDate: string;
  submissionDeadline: string;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  allowMultipleFiles: boolean;
  maxSubmissionAttempts: number;
  lateSubmissionAllowed: boolean;
  latePenaltyPercent?: number;
}

export interface AssignmentListResponse {
  assignments: Assignment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const ASSIGNMENT_FILE_TYPE_OPTIONS = [
  { label: "PDF", value: "application/pdf" },
  { label: "DOC/DOCX", value: "application/msword" },
  { label: "Images (JPG/PNG)", value: "image/jpeg" },
  { label: "PPT/PPTX", value: "application/vnd.ms-powerpoint" },
  { label: "ZIP", value: "application/zip" },
];

export type SubmissionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "LATE"
  | "UNDER_REVIEW"
  | "GRADED"
  | "RESUBMISSION_REQUIRED";

export interface SubmissionAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  textAnswer?: string | null;
  status: SubmissionStatus;
  attemptNumber: number;
  isLate: boolean;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: SubmissionAttachment[];
  assignment?: Assignment;
}

export type AIGradingStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REQUIRES_REVIEW";

export interface AIGradingResult {
  id: string;
  submissionId: string;
  status: AIGradingStatus;
  suggestedScore?: number | null;
  confidenceScore?: number | null;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  incorrectAnswers: string[];
  improvementSuggestions: string[];
  errorMessage?: string | null;
  queuedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  teacherApproved?: boolean | null;
  finalScore?: number | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
}
export interface AttentionSubmission {
  id: string;
  studentId: string;
  status: SubmissionStatus;
  assignmentId: string;
}

export interface TeacherDashboardData {
  totalAssignments: number;
  pendingGrading: number;
  aiGradedCount: number;
  teacherReviewedCount: number;
  averageScore: number | null;
  lateSubmissionsCount: number;
  missingSubmissions: number | null;
  studentsRequiringAttention: AttentionSubmission[];
}

export interface DashboardFilters {
  courseId?: string;
  assignmentId?: string;
  status?: string;
  lateOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
export interface StudentDashboardData {
  upcoming: Assignment[];
  dueToday: Assignment[];
  overdue: Assignment[];
  submitted: (Assignment | undefined)[];
  graded: { assignment: Assignment | undefined; finalScore?: number | null }[];
  pendingFeedbackCount: number;
  averageScore: number | null;
}
export interface RubricCriterion {
  id: string;
  title: string;
  description?: string | null;
  weightage: number;
  maxMarks: number;
  order: number;
}

export interface AssignmentRubric {
  id: string;
  title: string;
  description?: string | null;
  createdById: string;
  criteria: RubricCriterion[];
  createdAt: string;
  updatedAt: string;
}

export interface RubricEvaluation {
  id: string;
  gradingResultId: string;
  criterionId: string;
  aiScore: number;
  aiReasoning: string;
  teacherScore?: number | null;
  teacherOverridden: boolean;
}

export type NotificationType =
  | "ASSIGNMENT_PUBLISHED"
  | "DEADLINE_APPROACHING"
  | "DUE_TODAY"
  | "OVERDUE"
  | "SUBMISSION_SUCCESSFUL"
  | "GRADE_PUBLISHED"
  | "FEEDBACK_AVAILABLE"
  | "RESUBMISSION_REQUESTED"
  | "DEADLINE_EXTENDED";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  assignmentId?: string | null;
  submissionId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type FeedbackStatus = "DRAFT" | "APPROVED" | "PUBLISHED";

export interface Feedback {
  id: string;
  submissionId: string;
  overallComments: string;
  whatWentWell: string[];
  areasForImprovement: string[];
  specificMistakes: string[];
  recommendedNextSteps: string[];
  suggestedResources: string[];
  teacherComments?: string | null;
  status: FeedbackStatus;
  generatedAt: string;
  regeneratedCount: number;
  approvedById?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
}

export interface AssignmentAnalytics {
  submissionRate: number;
  completionRate: number;
  lateSubmissionRate: number;
  averageScore: number | null;
  medianScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  rubricWisePerformance: { criterionId: string; title: string; averageScore: number; maxMarks: number }[];
  commonMistakes: { text: string; count: number }[];
  aiVsTeacherGradingDifference: number | null;
}