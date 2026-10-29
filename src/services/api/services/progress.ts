import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

export type QuizStats = {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  completedQuizzesCount: number;
};

export type LearnerProgressResponse = {
  completedLessonsCount: number;
  totalLessonsCount: number;
  quizStats: QuizStats;
  passedLabsCount: number;
  totalLabsCount: number;
};

export function useGetLearnerProgressService() {
  const fetch = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/progress/summary`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<LearnerProgressResponse>);
    },
    [fetch]
  );
}
