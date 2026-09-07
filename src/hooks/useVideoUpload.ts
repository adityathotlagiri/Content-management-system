import { useState, useCallback } from "react";
import { type Video, type VideoFormData, SUPPORTED_VIDEO_FORMATS, MAX_VIDEO_SIZE_MB } from "../types/cms";
import { createVideo, updateVideo, retryVideoProcessing } from "../data/mockVideos";
import { validateFile, validateRequiredFields } from "./useFileValidation";
import { useToast } from "../context/ToastContext";

interface UseVideoUploadReturn {
  formData: VideoFormData;
  setField: <K extends keyof VideoFormData>(key: K, value: VideoFormData[K]) => void;
  errors: Record<string, string>;
  isUploading: boolean;
  uploadProgress: number;
  uploadedVideo: Video | null;
  submitUpload: () => Promise<void>;
  retryUpload: (videoId: string) => Promise<void>;
  reset: () => void;
}

const initialFormData: VideoFormData = {
  title: "",
  description: "",
  courseId: "",
  lessonId: "",
  file: null,
  thumbnail: null,
};

export function useVideoUpload(): UseVideoUploadReturn {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<VideoFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);

  const setField = useCallback(
    <K extends keyof VideoFormData>(key: K, value: VideoFormData[K]) => {
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
      newErrors.file = "Please select a video file to upload.";
    } else {
      const fileCheck = validateFile(formData.file, {
        allowedTypes: SUPPORTED_VIDEO_FORMATS,
        maxSizeMB: MAX_VIDEO_SIZE_MB,
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
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          progress = 100;
          setUploadProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setUploadProgress(Math.floor(progress));
        }
      }, 300);
    });
  }, []);

  const submitUpload = useCallback(async () => {
    if (!validate()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await simulateProgress();
      const newVideo = await createVideo(formData);
      setUploadedVideo(newVideo);
      showSuccess("Video uploaded — processing started.");

      setTimeout(async () => {
        const didSucceed = Math.random() > 0.1;
        const finalVideo = await updateVideo(newVideo.id, {
          status: didSucceed ? "Published" : "Failed",
          ...(didSucceed
            ? {}
            : { errorMessage: "Video processing failed. Please try again." }),
        });
        setUploadedVideo(finalVideo);
        if (didSucceed) {
          showSuccess(`"${finalVideo.title}" is now published.`);
        } else {
          showError(`"${finalVideo.title}" failed to process.`);
        }
      }, 2000);
    } catch (err) {
      setErrors({ form: "Upload failed. Please try again." });
      showError("Upload failed. Please try again.");
      console.log(err);
    } finally {
      setIsUploading(false);
    }
  }, [formData, validate, simulateProgress, showSuccess, showError]);

  const retryUpload = useCallback(
    async (videoId: string) => {
      try {
        const retrying = await retryVideoProcessing(videoId);
        setUploadedVideo(retrying);

        setTimeout(async () => {
          const didSucceed = Math.random() > 0.1;
          const finalVideo = await updateVideo(videoId, {
            status: didSucceed ? "Published" : "Failed",
            ...(didSucceed
              ? {}
              : { errorMessage: "Video processing failed. Please try again." }),
          });
          setUploadedVideo(finalVideo);
          if (didSucceed) {
            showSuccess(`"${finalVideo.title}" is now published.`);
          } else {
            showError(`"${finalVideo.title}" failed again.`);
          }
        }, 2000);
      } catch (err) {
        setErrors({ form: "Retry failed. Please try again." });
        showError("Retry failed. Please try again.");
        console.log(err);
      }
    },
    [showSuccess, showError]
  );

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setUploadProgress(0);
    setUploadedVideo(null);
  }, []);

  return {
    formData,
    setField,
    errors,
    isUploading,
    uploadProgress,
    uploadedVideo,
    submitUpload,
    retryUpload,
    reset,
  };
}