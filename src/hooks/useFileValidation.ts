// src/hooks/useFileValidation.ts

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface FileValidationRules {
  allowedTypes: string[];
  maxSizeMB: number;
}

/**
 * Validates a single file against type and size rules.
 * Shared across video, document, and thumbnail uploads (Task 12.6).
 */
export function validateFile(
  file: File,
  rules: FileValidationRules
): ValidationResult {
  if (!rules.allowedTypes.includes(file.type)) {
    const readableTypes = rules.allowedTypes
      .map((t) => t.split("/")[1]?.toUpperCase())
      .join(", ");
    return {
      isValid: false,
      errorMessage: `Unsupported file type. Allowed formats: ${readableTypes}`,
    };
  }

  const maxSizeBytes = rules.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      errorMessage: `File is too large. Maximum size is ${rules.maxSizeMB}MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that required text fields are non-empty.
 * Used for title/description/course/lesson checks (Task 12.6).
 */
export function validateRequiredFields(
  fields: Record<string, string>
): ValidationResult {
  const missing = Object.entries(fields)
    .filter(([, value]) => !value || value.trim() === "")
    .map(([key]) => key);

  if (missing.length > 0) {
    return {
      isValid: false,
      errorMessage: `Please fill in the following required fields: ${missing.join(", ")}`,
    };
  }

  return { isValid: true };
}

/**
 * Formats bytes into a human-readable string, e.g. 52428800 -> "50 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}