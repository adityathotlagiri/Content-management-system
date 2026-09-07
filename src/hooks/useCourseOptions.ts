/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import type { CourseOption, CourseLessonOption } from "../types/cms";
import { fetchCourses, fetchCourseLessons } from "../data/mockCourses";

interface UseCourseOptionsReturn {
  courses: CourseOption[];
  lessons: CourseLessonOption[]; // filtered to the selected course
  isLoading: boolean;
}

export function useCourseOptions(selectedCourseId: string): UseCourseOptionsReturn {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [lessons, setLessons] = useState<CourseLessonOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }
    fetchCourseLessons(selectedCourseId).then(setLessons);
  }, [selectedCourseId]);

  return { courses, lessons, isLoading };
}