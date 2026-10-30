import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { CourseDetail, CourseSummary } from "../types/course";
import { RequestConfigType } from "./types/request-config";

export type CoursesRequest = {
  locale: string;
};

export type CoursesResponse = CourseSummary[];

export function useGetCoursesService() {
  const fetch = useFetch();

  return useCallback(
    (data: CoursesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/courses`);
      requestUrl.searchParams.append("locale", data.locale);

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CoursesResponse>);
    },
    [fetch]
  );
}

export type CourseRequest = {
  slug: string;
  locale: string;
};

export type CourseResponse = CourseDetail;

export function useGetCourseService() {
  const fetch = useFetch();

  return useCallback(
    (data: CourseRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/courses/${data.slug}`);
      requestUrl.searchParams.append("locale", data.locale);

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CourseResponse>);
    },
    [fetch]
  );
}
