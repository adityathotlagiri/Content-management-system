import { useState, useCallback } from "react";
import {
  type Quiz,
  type QuizFormData,
  type AnswerOption,
  createEmptyQuestion,
} from "../types/cms";
import { createQuiz, updateQuiz } from "../data/mockQuizzes";
import { validateRequiredFields } from "./useFileValidation";
import { useToast } from "../context/ToastContext";

interface UseQuizBuilderReturn {
  formData: QuizFormData;
  errors: Record<string, string>;
  isSaving: boolean;
  savedQuiz: Quiz | null;

  setField: <K extends keyof QuizFormData>(key: K, value: QuizFormData[K]) => void;

  addQuestion: () => void;
  removeQuestion: (questionId: string) => void;
  updateQuestionText: (questionId: string, text: string) => void;
  updateQuestionMarks: (questionId: string, marks: number) => void;
  moveQuestion: (questionId: string, direction: "up" | "down") => void;

  addOption: (questionId: string) => void;
  removeOption: (questionId: string, optionId: string) => void;
  updateOptionText: (questionId: string, optionId: string, text: string) => void;
  setCorrectOption: (questionId: string, optionId: string) => void;

  saveAsDraft: () => Promise<void>;
  publish: () => Promise<void>;
  reset: () => void;
}

function buildInitialFormData(existing?: Quiz): QuizFormData {
  if (existing) {
    return {
      title: existing.title,
      description: existing.description,
      courseId: existing.courseId,
      lessonId: existing.lessonId,
      questions: existing.questions,
      durationMinutes: existing.durationMinutes,
      passingScore: existing.passingScore,
    };
  }
  return {
    title: "",
    description: "",
    courseId: "",
    lessonId: "",
    questions: [createEmptyQuestion(1)],
    passingScore: 60,
  };
}

export function useQuizBuilder(existingQuiz?: Quiz): UseQuizBuilderReturn {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<QuizFormData>(() =>
    buildInitialFormData(existingQuiz)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedQuiz, setSavedQuiz] = useState<Quiz | null>(null);

  const setField = useCallback(
    <K extends keyof QuizFormData>(key: K, value: QuizFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addQuestion = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(prev.questions.length + 1)],
    }));
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((q) => q.id !== questionId)
        .map((q, i) => ({ ...q, order: i + 1 })),
    }));
  }, []);

  const updateQuestionText = useCallback((questionId: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, text } : q)),
    }));
  }, []);

  const updateQuestionMarks = useCallback((questionId: string, marks: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, marks } : q)),
    }));
  }, []);

  const moveQuestion = useCallback((questionId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const questions = [...prev.questions].sort((a, b) => a.order - b.order);
      const index = questions.findIndex((q) => q.id === questionId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= questions.length) return prev;

      const temp = questions[index].order;
      questions[index].order = questions[targetIndex].order;
      questions[targetIndex].order = temp;

      return { ...prev, questions };
    });
  }, []);

  const addOption = useCallback((questionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: `opt-${Date.now()}`, text: "", isCorrect: false } as AnswerOption,
              ],
            }
          : q
      ),
    }));
  }, []);

  const removeOption = useCallback((questionId: string, optionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      ),
    }));
  }, []);

  const updateOptionText = useCallback(
    (questionId: string, optionId: string, text: string) => {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
              }
            : q
        ),
      }));
    },
    []
  );

  const setCorrectOption = useCallback((questionId: string, optionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => ({ ...o, isCorrect: o.id === optionId })),
            }
          : q
      ),
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const requiredCheck = validateRequiredFields({
      title: formData.title,
      courseId: formData.courseId,
      lessonId: formData.lessonId,
    });
    if (!requiredCheck.isValid) newErrors.form = requiredCheck.errorMessage!;

    if (formData.questions.length === 0) {
      newErrors.questions = "Add at least one question.";
    } else {
      for (const q of formData.questions) {
        if (!q.text.trim()) {
          newErrors.questions = "Every question needs question text.";
          break;
        }
        if (q.options.length < 2) {
          newErrors.questions = "Every question needs at least two answer options.";
          break;
        }
        if (q.options.some((o) => !o.text.trim())) {
          newErrors.questions = "Every answer option needs text.";
          break;
        }
        if (!q.options.some((o) => o.isCorrect)) {
          newErrors.questions = "Every question needs a correct answer selected.";
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const persist = useCallback(
    async (status: "Draft" | "Published") => {
      if (!validate()) return;

      setIsSaving(true);
      try {
        const result = existingQuiz
          ? await updateQuiz(existingQuiz.id, { ...formData, status })
          : await createQuiz(formData);

        const finalQuiz =
          !existingQuiz && status === "Published"
            ? await updateQuiz(result.id, { status: "Published" })
            : result;

        setSavedQuiz(finalQuiz);
        showSuccess(status === "Published" ? "Quiz published." : "Quiz saved as draft.");
      } catch (err) {
        setErrors({ form: "Failed to save quiz. Please try again." });
        showError("Failed to save quiz. Please try again.");
        console.log(err);
      } finally {
        setIsSaving(false);
      }
    },
    [formData, validate, existingQuiz, showSuccess, showError]
  );

  const saveAsDraft = useCallback(() => persist("Draft"), [persist]);
  const publish = useCallback(() => persist("Published"), [persist]);

  const reset = useCallback(() => {
    setFormData(buildInitialFormData());
    setErrors({});
    setSavedQuiz(null);
  }, []);

  return {
    formData,
    errors,
    isSaving,
    savedQuiz,
    setField,
    addQuestion,
    removeQuestion,
    updateQuestionText,
    updateQuestionMarks,
    moveQuestion,
    addOption,
    removeOption,
    updateOptionText,
    setCorrectOption,
    saveAsDraft,
    publish,
    reset,
  };
}