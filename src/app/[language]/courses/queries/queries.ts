import {
  useGetCoursesService,
  useGetCourseService,
} from "@/services/api/services/courses";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useQuery } from "@tanstack/react-query";

export const coursesQueryKeys = createQueryKeys(["courses"], {
  list: (locale: string) => ({
    key: [locale],
  }),
  detail: (slug: string, locale: string) => ({
    key: [slug, locale],
  }),
});

export const useGetCoursesListQuery = (locale: string) => {
  const fetch = useGetCoursesService();

  return useQuery({
    queryKey: coursesQueryKeys.list(locale).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await fetch({ locale }, { signal });

      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to load courses");
      }

      return data;
    },
  });
};

export const useGetCourseDetailQuery = (slug: string, locale: string) => {
  const fetch = useGetCourseService();

  return useQuery({
    queryKey: coursesQueryKeys.detail(slug, locale).key,
    queryFn: async ({ signal }) => {
      const { status, data } = await fetch({ slug, locale }, { signal });

      if (status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Failed to load course");
      }

      return data;
    },
    enabled: Boolean(slug),
  });
};
