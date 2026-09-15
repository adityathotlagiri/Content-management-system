import { useState, useCallback } from "react";
import type { AssignmentRubric } from "../types/homework";
import { createRubric } from "../data/rubricApi";
import { useToast } from "../context/ToastContext";

interface CriterionDraft {
  id: string; // client-side only, for React keys — not sent to the server
  title: string;
  description: string;
  weightage: number;
  maxMarks: number;
}

// TODO: replace with the actual logged-in teacher's id once real auth exists
const CURRENT_TEACHER_ID = "user-1";

function createEmptyCriterion(): CriterionDraft {
  return { id: `crit-${Date.now()}-${Math.random()}`, title: "", description: "", weightage: 0, maxMarks: 10 };
}

export function useRubricBuilder() {
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<CriterionDraft[]>([createEmptyCriterion()]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedRubric, setSavedRubric] = useState<AssignmentRubric | null>(null);

  const addCriterion = useCallback(() => {
    setCriteria((prev) => [...prev, createEmptyCriterion()]);
  }, []);

  const removeCriterion = useCallback((id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCriterion = useCallback(
    <K extends keyof CriterionDraft>(id: string, key: K, value: CriterionDraft[K]) => {
      setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    },
    []
  );

  const totalWeightage = criteria.reduce((sum, c) => sum + (Number(c.weightage) || 0), 0);

  const save = useCallback(async () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required.";
    if (criteria.length === 0) newErrors.criteria = "Add at least one criterion.";
    if (criteria.some((c) => !c.title.trim())) newErrors.criteria = "Every criterion needs a title.";
    if (totalWeightage !== 100) {
      newErrors.weightage = `Weightages must sum to 100 (currently ${totalWeightage}).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      const rubric = await createRubric({
        title,
        description: description || undefined,
        createdById: CURRENT_TEACHER_ID,
        criteria: criteria.map((c, i) => ({
          title: c.title,
          description: c.description || undefined,
          weightage: Number(c.weightage),
          maxMarks: Number(c.maxMarks),
          order: i + 1,
        })),
      });
      setSavedRubric(rubric);
      showSuccess("Rubric saved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save rubric.";
      setErrors({ form: message });
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }, [title, description, criteria, totalWeightage, showSuccess, showError]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    criteria,
    addCriterion,
    removeCriterion,
    updateCriterion,
    totalWeightage,
    errors,
    isSaving,
    savedRubric,
    save,
  };
}