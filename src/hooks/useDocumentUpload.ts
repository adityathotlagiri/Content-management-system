import { useState, useCallback } from "react";
import {
  type Document,
  type DocumentFormData,
  SUPPORTED_DOCUMENT_FORMATS,
  MAX_DOCUMENT_SIZE_MB,
} from "../types/cms";
import { createDocument } from "../data/mockDocuments";
import { validateFile, validateRequiredFields } from "./useFileValidation";
import { useToast } from "../context/ToastContext";

interface UseDocumentUploadReturn {
  formData: DocumentFormData;
  setField: <K extends keyof DocumentFormData>(key: K, value: DocumentFormData[K]) => void;
  errors: Record<string, string>;
  isUploading: boolean;
  uploadProgress: number;
  uploadedDocument: Document | null;
  submitUpload: () => Promise<void>;
  reset: () => void;
}

const initialFormData: DocumentFormData = {
  title: "",
  description: "",
  courseId: "",
  lessonId: "",
  file: null,
};

export function useDocumentUpload(): UseDocumentUploadReturn {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);

  const setField = useCallback(
    <K extends keyof DocumentFormData>(key: K, value: DocumentFormData[K]) => {
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

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const requiredCheck = validateRequiredFields({
      title: formData.title,
      courseId: formData.courseId,
      lessonId: formData.lessonId,
    });
    if (!requiredCheck.isValid) newErrors.form = requiredCheck.errorMessage!;

    if (!formData.file) {
      newErrors.file = "Please select a document to upload.";
    } else {
      const fileCheck = validateFile(formData.file, {
        allowedTypes: SUPPORTED_DOCUMENT_FORMATS,
        maxSizeMB: MAX_DOCUMENT_SIZE_MB,
      });
      if (!fileCheck.isValid) newErrors.file = fileCheck.errorMessage!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const simulateProgress = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 15;
        if (progress >= 100) {
          progress = 100;
          setUploadProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setUploadProgress(Math.floor(progress));
        }
      }, 250);
    });
  }, []);

  const submitUpload = useCallback(async () => {
    if (!validate()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await simulateProgress();
      const newDocument = await createDocument(formData);
      setUploadedDocument(newDocument);
      showSuccess("Document uploaded as Draft.");
    } catch (err) {
      setErrors({ form: "Upload failed. Please try again." });
      showError("Upload failed. Please try again.");
      console.log(err);
    } finally {
      setIsUploading(false);
    }
  }, [formData, validate, simulateProgress, showSuccess, showError]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setUploadProgress(0);
    setUploadedDocument(null);
  }, []);

  return {
    formData,
    setField,
    errors,
    isUploading,
    uploadProgress,
    uploadedDocument,
    submitUpload,
    reset,
  };
}