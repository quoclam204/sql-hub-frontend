import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { RequestConfigType } from "./types/request-config";

// ── Course & Dataset Types ──────────────────────────────────────
export type AdminCourseItem = {
  id: number;
  slug: string;
  order: number;
  titleVi: string;
  titleEn: string;
};

export type AdminQuizItem = {
  id: number;
  lessonId: number | null;
  title: string;
  lessonTitle: string;
};

export type AdminDatasetItem = {
  id: number;
  name: string;
};

// ── Lesson Types ────────────────────────────────────────────────
export type AdminLessonItem = {
  id: number;
  courseId: number;
  courseSlug?: string;
  slug: string;
  order: number;
  titleVi: string;
  contentVi: string;
  titleEn: string;
  contentEn: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLessonPayload = {
  courseId: number;
  slug: string;
  order?: number;
  titleVi: string;
  contentVi: string;
  titleEn: string;
  contentEn: string;
};

export type UpdateLessonPayload = Partial<CreateLessonPayload>;

// ── Quiz Question Types ─────────────────────────────────────────
export type AdminQuestionOptionItem = {
  id?: number;
  optionTextVi: string;
  optionTextEn?: string;
  isCorrect: boolean;
  order?: number;
};

export type AdminQuizQuestionItem = {
  id: number;
  quizId: number;
  quizTitle?: string;
  order: number;
  questionTextVi: string;
  explanationVi?: string;
  questionTextEn: string;
  explanationEn?: string;
  options: AdminQuestionOptionItem[];
  createdAt: string;
};

export type CreateQuizQuestionPayload = {
  quizId: number;
  order?: number;
  questionTextVi: string;
  explanationVi?: string;
  questionTextEn: string;
  explanationEn?: string;
  options: AdminQuestionOptionItem[];
};

export type UpdateQuizQuestionPayload = Partial<CreateQuizQuestionPayload>;

// ── Lab Types ───────────────────────────────────────────────────
export type AdminLabItem = {
  id: number;
  datasetId: number;
  datasetName?: string;
  lessonId?: number | null;
  lessonSlug?: string;
  expectedQuery: string;
  orderSensitive: boolean;
  titleVi: string;
  descriptionVi?: string;
  hintVi?: string;
  titleEn: string;
  descriptionEn?: string;
  hintEn?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLabPayload = {
  datasetId: number;
  lessonId?: number | null;
  expectedQuery: string;
  orderSensitive?: boolean;
  titleVi: string;
  descriptionVi?: string;
  hintVi?: string;
  titleEn: string;
  descriptionEn?: string;
  hintEn?: string;
};

export type UpdateLabPayload = Partial<CreateLabPayload>;

// ── Custom Hooks for Lessons ────────────────────────────────────
export function useGetAdminLessonsService() {
  const fetch = useFetch();
  return useCallback(
    (courseId?: number, requestConfig?: RequestConfigType) => {
      const url = courseId
        ? `${API_URL}/v1/admin/lessons?courseId=${courseId}`
        : `${API_URL}/v1/admin/lessons`;
      return fetch(url, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminLessonItem[]>);
    },
    [fetch]
  );
}

export function useGetAdminCoursesService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/lessons/courses`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminCourseItem[]>);
    },
    [fetch]
  );
}

export function usePostAdminLessonService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateLessonPayload, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/lessons`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminLessonItem>);
    },
    [fetch]
  );
}

export function usePatchAdminLessonService() {
  const fetch = useFetch();
  return useCallback(
    (id: number, data: UpdateLessonPayload, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/lessons/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminLessonItem>);
    },
    [fetch]
  );
}

export function useDeleteAdminLessonService() {
  const fetch = useFetch();
  return useCallback(
    (id: number, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/lessons/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<{ success: boolean; message: string }>);
    },
    [fetch]
  );
}

// ── Custom Hooks for Quiz Questions ─────────────────────────────
export function useGetAdminQuizQuestionsService() {
  const fetch = useFetch();
  return useCallback(
    (quizId?: number, requestConfig?: RequestConfigType) => {
      const url = quizId
        ? `${API_URL}/v1/admin/quiz-questions?quizId=${quizId}`
        : `${API_URL}/v1/admin/quiz-questions`;
      return fetch(url, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminQuizQuestionItem[]>);
    },
    [fetch]
  );
}

export function useGetAdminQuizzesService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/quiz-questions/quizzes`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminQuizItem[]>);
    },
    [fetch]
  );
}

export function usePostAdminQuizQuestionService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateQuizQuestionPayload, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/quiz-questions`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminQuizQuestionItem>);
    },
    [fetch]
  );
}

export function usePatchAdminQuizQuestionService() {
  const fetch = useFetch();
  return useCallback(
    (
      id: number,
      data: UpdateQuizQuestionPayload,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/admin/quiz-questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminQuizQuestionItem>);
    },
    [fetch]
  );
}

export function useDeleteAdminQuizQuestionService() {
  const fetch = useFetch();
  return useCallback(
    (id: number, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/quiz-questions/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<{ success: boolean; message: string }>);
    },
    [fetch]
  );
}

// ── Custom Hooks for Labs ───────────────────────────────────────
export function useGetAdminLabsService() {
  const fetch = useFetch();
  return useCallback(
    (lessonId?: number, requestConfig?: RequestConfigType) => {
      const url = lessonId
        ? `${API_URL}/v1/admin/labs?lessonId=${lessonId}`
        : `${API_URL}/v1/admin/labs`;
      return fetch(url, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminLabItem[]>);
    },
    [fetch]
  );
}

export function useGetAdminDatasetsService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/labs/datasets`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminDatasetItem[]>);
    },
    [fetch]
  );
}

export function usePostAdminLabService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateLabPayload, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/labs`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminLabItem>);
    },
    [fetch]
  );
}

export function usePatchAdminLabService() {
  const fetch = useFetch();
  return useCallback(
    (id: number, data: UpdateLabPayload, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/labs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AdminLabItem>);
    },
    [fetch]
  );
}

export function useDeleteAdminLabService() {
  const fetch = useFetch();
  return useCallback(
    (id: number, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/labs/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<{ success: boolean; message: string }>);
    },
    [fetch]
  );
}

// ── Bulk Import Types & Hooks ───────────────────────────────────
export type BulkImportType = "lessons" | "quiz-questions" | "labs";
export type BulkImportFormat = "json" | "markdown";

export type BulkImportPayload = {
  type: BulkImportType;
  format: BulkImportFormat;
  content: string;
  dryRun?: boolean;
};

export type BulkImportErrorItem = {
  index: number;
  identifier?: string;
  field?: string;
  message: string;
};

export type BulkImportResult = {
  success: boolean;
  type: BulkImportType;
  dryRun: boolean;
  totalCount: number;
  importedCount: number;
  errors: BulkImportErrorItem[];
  preview?: any[];
};

export type BulkImportTemplates = {
  lessons: { json: string; markdown: string };
  quizQuestions: { json: string; markdown: string };
  labs: { json: string; markdown: string };
};

export function usePostAdminBulkImportService() {
  const fetch = useFetch();
  return useCallback(
    (data: BulkImportPayload, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/bulk-import`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BulkImportResult>);
    },
    [fetch]
  );
}

export function useGetAdminBulkImportTemplatesService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/admin/bulk-import/templates`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BulkImportTemplates>);
    },
    [fetch]
  );
}

