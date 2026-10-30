"use client";

import Link from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import { useParams } from "next/navigation";
import { useGetCourseDetailQuery } from "../queries/queries";

function CourseDetail() {
  const params = useParams<{ slug: string }>();
  const language = useLanguage();
  const { t } = useTranslation("courses");
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseDetailQuery(slug ?? "", language);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/courses"
        className="mb-6 inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        {t("backToCourses")}
      </Link>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <p className="text-destructive" role="alert">
          {t("error")}
        </p>
      )}

      {!isLoading && !isError && !course && (
        <p className="text-muted-foreground">{t("courseNotFound")}</p>
      )}

      {!isLoading && !isError && course && (
        <>
          <h1 className="mb-3 text-3xl font-semibold">{course.title}</h1>
          <p className="mb-8 text-muted-foreground">{course.description}</p>

          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xl font-semibold">{t("lessons")}</h2>
            <Badge variant="secondary">
              {t("lessonsCount", { count: course.lessons.length })}
            </Badge>
          </div>

          {course.lessons.length === 0 && (
            <p className="text-muted-foreground">{t("lessonsEmpty")}</p>
          )}

          {course.lessons.length > 0 && (
            <ol className="divide-y rounded-xl border">
              {course.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {lesson.order}
                  </span>
                  <span className="font-medium">{lesson.title}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

export default CourseDetail;
