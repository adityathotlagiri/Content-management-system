import { useState, useCallback } from "react";
import type { Assignment, AssignmentFormData } from "../types/homework";
import { createAssignment, updateAssignmentStatus } from "../data/assignmentsApi";
import { validateRequiredFields } from "./useFileValidation";
import { useToast } from "../context/ToastContext";

interface UseAssignmentBuilderReturn {
  formData: AssignmentFormData;
  setField: <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => void;
  toggleFileType: (fileType: string) => void;
  errors: Record<string, string>;
  isSaving: boolean;
  savedAssignment: Assignment | null;
  saveAsDraft: () => Promise<void>;
  schedule: () => Promise<void>;
  publish: () => Promise<void>;
  reset: () => void;
}

const initialFormData: AssignmentFormData = {
  title: "",
  description: "",
  instructions: "",
  courseId: "",
  courseName: "",
  assignmentType: "FILE_UPLOAD",
  difficultyLevel: "MEDIUM",
  maxMarks: 100,
  passingMarks: 40,
  startDate: "",
  submissionDeadline: "",
  allowedFileTypes: [],
  maxFileSizeMb: 10,
  allowMultipleFiles: false,
  maxSubmissionAttempts: 1,
  lateSubmissionAllowed: false,
  latePenaltyPercent: undefined,
};

// TODO: replace with the actual logged-in user's id once real auth exists
// (same placeholder approach as CMSAuthContext's dev-only role switcher).
const CURRENT_USER_ID = "user-1";

export function useAssignmentBuilder(): UseAssignmentBuilderReturn {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<AssignmentFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedAssignment, setSavedAssignment] = useState<Assignment | null>(null);

  const setField = useCallback(
    <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    []
  );

  // Checkbox-list toggle for allowedFileTypes — add if absent, remove if present.
  const toggleFileType = useCallback((fileType: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(fileType)
        ? prev.allowedFileTypes.filter((t) => t !== fileType)
        : [...prev.allowedFileTypes, fileType],
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const requiredCheck = validateRequiredFields({
      title: formData.title,
      description: formData.description,
      courseId: formData.courseId,
      startDate: formData.startDate,
      submissionDeadline: formData.submissionDeadline,
    });
    if (!requiredCheck.isValid) newErrors.form = requiredCheck.errorMessage!;

    if (formData.allowedFileTypes.length === 0 && formData.assignmentType !== "TEXT") {
      newErrors.allowedFileTypes = "Select at least one allowed file type.";
    }

    if (formData.passingMarks > formData.maxMarks) {
      newErrors.passingMarks = "Passing marks cannot exceed maximum marks.";
    }

    if (
      formData.startDate &&
      formData.submissionDeadline &&
      new Date(formData.submissionDeadline) <= new Date(formData.startDate)
    ) {
      newErrors.submissionDeadline = "Deadline must be after the start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const persist = useCallback(
    async (status: "DRAFT" | "SCHEDULED" | "PUBLISHED") => {
      if (!validate()) return;

      setIsSaving(true);
      try {
        const created = await createAssignment(formData, CURRENT_USER_ID);

        // createAssignment always creates as DRAFT server-side;
        // flip status in a follow-up call if a non-draft state was requested.
        const finalAssignment =
          status !== "DRAFT"
            ? await updateAssignmentStatus(created.id, status, CURRENT_USER_ID)
            : created;

        setSavedAssignment(finalAssignment);
        showSuccess(
          status === "PUBLISHED"
            ? "Assignment published."
            : status === "SCHEDULED"
            ? "Assignment scheduled."
            : "Assignment saved as draft."
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save assignment.";
        setErrors({ form: message });
        showError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [formData, validate, showSuccess, showError]
  );

  const saveAsDraft = useCallback(() => persist("DRAFT"), [persist]);
  const schedule = useCallback(() => persist("SCHEDULED"), [persist]);
  const publish = useCallback(() => persist("PUBLISHED"), [persist]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setSavedAssignment(null);
  }, []);

  return {
    formData,
    setField,
    toggleFileType,
    errors,
    isSaving,
    savedAssignment,
    saveAsDraft,
    schedule,
    publish,
    reset,
  };
}