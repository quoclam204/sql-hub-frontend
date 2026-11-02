"use client";

import Link from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import { useGetCoursesListQuery } from "./queries/queries";

function Courses() {
  const language = useLanguage();
  const { t } = useTranslation("courses");
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesListQuery(language);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-destructive" role="alert">
          {t("error")}
        </p>
      )}

      {!isLoading && !isError && courses?.length === 0 && (
        <p className="text-muted-foreground">{t("empty")}</p>
      )}

      {!isLoading && !isError && !!courses?.length && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/60 hover:bg-accent/40"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  #{course.order}
                </span>
                <Badge variant="secondary">
                  {t("lessonsCount", { count: course.lessonsCount })}
                </Badge>
              </div>
              <h2 className="mb-2 text-lg font-semibold group-hover:text-primary">
                {course.title}
              </h2>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {course.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
