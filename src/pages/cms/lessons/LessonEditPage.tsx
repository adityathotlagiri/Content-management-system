import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type{ Lesson } from "../../../types/cms";
import { fetchLessonById } from "../../../data/mockLessons";
import { LessonForm } from "../../../Components/cms/lesson/LessonForm";

export default function LessonEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchLessonById(id).then((result) => {
      if (result) {
        setLesson(result);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <p className="text-gray-500">Loading lesson...</p>
      </div>
    );
  }

  if (notFound || !lesson) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] p-6">
        <p className="text-gray-700">Lesson not found.</p>
        <button
          onClick={() => navigate("/cms/lessons")}
          className="mt-3 text-sm font-medium text-[#238B45] hover:text-[#036724]"
        >
          Back to lessons
        </button>
      </div>
    );
  }

  return <LessonForm existingLesson={lesson} />;
}