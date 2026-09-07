import { useState, useCallback } from "react";
import type{ Lesson, LessonFormData, LessonContentItem, LessonContentType } from "../types/cms";
import { createLesson, updateLesson } from "../data/mockLessons";
import { validateRequiredFields } from "./useFileValidation";
import { useToast } from "../context/ToastContext";

interface UseLessonBuilderReturn {
  formData: LessonFormData;
  errors: Record<string, string>;
  isSaving: boolean;
  savedLesson: Lesson | null;

  setField: <K extends keyof LessonFormData>(key: K, value: LessonFormData[K]) => void;

  attachContent: (contentType: LessonContentType, contentId: string, title: string) => void;
  removeContent: (itemId: string) => void;
  moveContent: (itemId: string, direction: "up" | "down") => void;

  saveAsDraft: () => Promise<void>;
  publish: () => Promise<void>;
}

function buildInitialFormData(existing?: Lesson): LessonFormData {
  if (existing) {
    return {
      title: existing.title,
      description: existing.description,
      learningObjectives: existing.learningObjectives,
      courseId: existing.courseId,
      content: existing.content,
    };
  }
  return {
    title: "",
    description: "",
    learningObjectives: "",
    courseId: "",
    content: [],
  };
}

export function useLessonBuilder(existingLesson?: Lesson): UseLessonBuilderReturn {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<LessonFormData>(() =>
    buildInitialFormData(existingLesson)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedLesson, setSavedLesson] = useState<Lesson | null>(null);

  const setField = useCallback(
    <K extends keyof LessonFormData>(key: K, value: LessonFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const attachContent = useCallback(
    (contentType: LessonContentType, contentId: string, title: string) => {
      setFormData((prev) => {
        const alreadyAttached = prev.content.some(
          (c) => c.contentType === contentType && c.contentId === contentId
        );
        if (alreadyAttached) return prev;

        const newItem: LessonContentItem = {
          id: `lc-${Date.now()}`,
          contentType,
          contentId,
          title,
          order: prev.content.length + 1,
        };
        return { ...prev, content: [...prev.content, newItem] };
      });
    },
    []
  );

  const removeContent = useCallback((itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content
        .filter((c) => c.id !== itemId)
        .map((c, i) => ({ ...c, order: i + 1 })),
    }));
  }, []);

  const moveContent = useCallback((itemId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const content = [...prev.content].sort((a, b) => a.order - b.order);
      const index = content.findIndex((c) => c.id === itemId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= content.length) return prev;

      const temp = content[index].order;
      content[index].order = content[targetIndex].order;
      content[targetIndex].order = temp;

      return { ...prev, content };
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const requiredCheck = validateRequiredFields({
      title: formData.title,
      courseId: formData.courseId,
    });
    if (!requiredCheck.isValid) newErrors.form = requiredCheck.errorMessage!;

    if (formData.content.length === 0) {
      newErrors.content = "Attach at least one video, document, or quiz to this lesson.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const persist = useCallback(
    async (status: "Draft" | "Published") => {
      if (!validate()) return;

      setIsSaving(true);
      try {
        const result = existingLesson
          ? await updateLesson(existingLesson.id, { ...formData, status })
          : await createLesson(formData);

        const finalLesson =
          !existingLesson && status === "Published"
            ? await updateLesson(result.id, { status: "Published" })
            : result;

        setSavedLesson(finalLesson);
        showSuccess(status === "Published" ? "Lesson published." : "Lesson saved as draft.");
      } catch (err) {
        setErrors({ form: "Failed to save lesson. Please try again." });
        showError("Failed to save lesson. Please try again.");
        console.log(err);
      } finally {
        setIsSaving(false);
      }
    },
    [formData, validate, existingLesson, showSuccess, showError]
  );

  const saveAsDraft = useCallback(() => persist("Draft"), [persist]);
  const publish = useCallback(() => persist("Published"), [persist]);

  return {
    formData,
    errors,
    isSaving,
    savedLesson,
    setField,
    attachContent,
    removeContent,
    moveContent,
    saveAsDraft,
    publish,
  };
}