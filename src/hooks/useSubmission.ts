import { useState, useCallback } from "react";
import type { Assignment, AssignmentSubmission } from "../types/homework";
import { submitAssignment } from "../data/submissionsApi";
import { useToast } from "../context/ToastContext";

// TODO: replace with the actual logged-in student's id once real auth exists
const CURRENT_STUDENT_ID = "student-1";

interface UseSubmissionReturn {
  textAnswer: string;
  setTextAnswer: (value: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submittedResult: AssignmentSubmission | null;
  submit: (assignment: Assignment) => Promise<void>;
}

export function useSubmission(): UseSubmissionReturn {
  const { showSuccess, showError } = useToast();
  const [textAnswer, setTextAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<AssignmentSubmission | null>(null);

  const submit = useCallback(
    async (assignment: Assignment) => {
      const newErrors: Record<string, string> = {};

      if (assignment.assignmentType !== "FILE_UPLOAD" && !textAnswer.trim()) {
        newErrors.textAnswer = "A text answer is required.";
      }
      if (assignment.assignmentType !== "TEXT" && !file) {
        newErrors.file = "Please attach a file.";
      }
      if (file) {
        if (!assignment.allowedFileTypes.includes(file.type)) {
          newErrors.file = "This file type isn't allowed for this assignment.";
        }
        const maxBytes = assignment.maxFileSizeMb * 1024 * 1024;
        if (file.size > maxBytes) {
          newErrors.file = `File exceeds the ${assignment.maxFileSizeMb}MB limit.`;
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      setErrors({});
      try {
        // NOTE: this sends file metadata only — real file bytes need a
        // storage upload step (e.g. S3/Cloudinary) wired in before this
        // fileUrl is meaningful. Flagged for the next pass, same as the
        // CMS module's URL.createObjectURL placeholder approach.
        const result = await submitAssignment({
          assignmentId: assignment.id,
          studentId: CURRENT_STUDENT_ID,
          textAnswer: textAnswer || undefined,
          attachments: file
            ? [
                {
                  fileName: file.name,
                  fileUrl: URL.createObjectURL(file),
                  fileType: file.type,
                  fileSizeBytes: file.size,
                },
              ]
            : undefined,
        });

        setSubmittedResult(result);
        showSuccess(result.isLate ? "Submitted (late)." : "Submitted successfully.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Submission failed.";
        setErrors({ form: message });
        showError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [textAnswer, file, showSuccess, showError]
  );

  return { textAnswer, setTextAnswer, file, setFile, errors, isSubmitting, submittedResult, submit };
}