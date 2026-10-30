import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type LearningLessonResponse = {
  course: {
    slug: string;
    title: string;
  };
  lesson: {
    id: number;
    slug: string;
    order: number;
    title: string;
    contentMd: string;
  };
  quizzes: Array<{
    id: number;
    title: string;
    questions: Array<{
      id: number;
      order: number;
      questionText: string;
      explanation: string;
      options: Array<{
        id: number;
        order: number;
        optionText: string;
      }>;
    }>;
  }>;
  labs: Array<{
    id: number;
    title: string;
    description: string;
    hint: string;
    orderSensitive: boolean;
    dataset: {
      id: number;
      name: string;
      setupSql: string;
    } | null;
  }>;
};

export function useGetLearningLessonService() {
  const fetch = useFetch();

  return useCallback(
    (
      courseSlug: string,
      lessonSlug: string,
      locale: "vi" | "en",
      requestConfig?: RequestConfigType
    ) => {
      const url = new URL(
        `${API_URL}/v1/courses/${encodeURIComponent(
          courseSlug
        )}/lessons/${encodeURIComponent(lessonSlug)}`
      );
      url.searchParams.set("locale", locale);

      return fetch(url.toString(), {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LearningLessonResponse | null>);
    },
    [fetch]
  );
}
