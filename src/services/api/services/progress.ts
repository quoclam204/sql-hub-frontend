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

export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  isActiveToday: boolean;
  activeDates: string[];
};

export type BadgeItem = {
  id: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  category: "milestone" | "streak" | "mastery";
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  currentProgress: number;
  targetProgress: number;
};

export type LearnerProgressResponse = {
  completedLessonsCount: number;
  totalLessonsCount: number;
  quizStats: QuizStats;
  passedLabsCount: number;
  totalLabsCount: number;
  streak: StreakInfo;
  badges: BadgeItem[];
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

export function useGetLearnerStreakService() {
  const fetch = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/progress/streaks`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<StreakInfo>);
    },
    [fetch]
  );
}

export function useGetLearnerBadgesService() {
  const fetch = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/progress/badges`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BadgeItem[]>);
    },
    [fetch]
  );
}
