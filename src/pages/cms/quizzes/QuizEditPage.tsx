import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Quiz } from "../../../types/cms";
import { fetchQuizById } from "../../../data/mockQuizzes";
import { QuizBuilderForm } from "../../../Components/cms/quiz/QuizBuilderForm";

export default function QuizEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchQuizById(id).then((result) => {
      if (result) {
        setQuiz(result);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <p className="text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] p-6">
        <p className="text-gray-700">Quiz not found.</p>
        <button
          onClick={() => navigate("/cms/quizzes")}
          className="mt-3 text-sm font-medium text-[#238B45] hover:text-[#036724]"
        >
          Back to quizzes
        </button>
      </div>
    );
  }

  return <QuizBuilderForm existingQuiz={quiz} />;
}