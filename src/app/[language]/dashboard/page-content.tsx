"use client";

import { useEffect, useState, useCallback } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import {
  useGetLearnerProgressService,
  LearnerProgressResponse,
} from "@/services/api/services/progress";
import { useTranslation } from "@/services/i18n/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Award from "lucide-react/dist/esm/icons/award";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Compass from "lucide-react/dist/esm/icons/compass";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

function DashboardContent() {
  const { t } = useTranslation("dashboard");
  const fetchLearnerProgress = useGetLearnerProgressService();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LearnerProgressResponse | null>(null);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchLearnerProgress();

      if (response.status === HTTP_CODES_ENUM.OK && response.data) {
        setProgress(response.data);
      } else {
        setError(t("dashboard:error.description"));
      }
    } catch {
      setError(t("dashboard:error.description"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchLearnerProgress, t]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8"
        data-testid="dashboard-loading"
      >
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div
        className="mx-auto w-full max-w-xl px-4 py-16 text-center"
        data-testid="dashboard-error"
      >
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="size-12 text-destructive" />
          <h2 className="text-2xl font-bold">{t("dashboard:error.title")}</h2>
          <p className="text-muted-foreground">{error || t("dashboard:error.description")}</p>
          <Button
            onClick={loadProgress}
            className="flex items-center gap-2 mt-2"
            data-testid="dashboard-retry-btn"
          >
            <RotateCcw className="size-4" />
            {t("dashboard:error.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const isBrandNewLearner =
    progress.completedLessonsCount === 0 &&
    progress.quizStats.totalAttempts === 0 &&
    progress.passedLabsCount === 0;

  const lessonPercentage =
    progress.totalLessonsCount > 0
      ? Math.round((progress.completedLessonsCount / progress.totalLessonsCount) * 100)
      : 0;

  const labPercentage =
    progress.totalLabsCount > 0
      ? Math.round((progress.passedLabsCount / progress.totalLabsCount) * 100)
      : 0;

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8"
      data-testid="dashboard-content"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="dashboard-title"
        >
          {t("dashboard:title")}
        </h1>
        <p className="text-muted-foreground text-base">
          {t("dashboard:subtitle")}
        </p>
      </div>

      {/* Empty State Banner for Brand New Learner */}
      {isBrandNewLearner && (
        <Card
          className="border-dashed bg-muted/40"
          data-testid="dashboard-empty"
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass className="size-5 text-primary" />
              <CardTitle className="text-lg">
                {t("dashboard:emptyState.title")}
              </CardTitle>
            </div>
            <CardDescription className="text-sm">
              {t("dashboard:emptyState.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild data-testid="dashboard-browse-courses">
              <Link href="/">
                {t("dashboard:emptyState.action")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Completed Lessons */}
        <Card
          className="relative overflow-hidden transition-all hover:shadow-md"
          data-testid="completed-lessons-card"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard:metrics.completedLessons.title")}
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <BookOpen className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold tracking-tight"
                data-testid="completed-lessons-count"
              >
                {progress.completedLessonsCount}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("dashboard:metrics.completedLessons.of")} {progress.totalLessonsCount}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(lessonPercentage, 100)}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {progress.completedLessonsCount > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  {lessonPercentage}% {t("dashboard:metrics.completedLessons.description")}
                </span>
              ) : (
                t("dashboard:metrics.completedLessons.description")
              )}
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Quiz Score Statistics */}
        <Card
          className="relative overflow-hidden transition-all hover:shadow-md"
          data-testid="quiz-stats-card"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard:metrics.quizScore.title")}
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Award className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold tracking-tight"
                data-testid="quiz-avg-score"
              >
                {progress.quizStats.totalAttempts > 0
                  ? progress.quizStats.averageScore
                  : 0}
              </span>
              <span className="text-sm text-muted-foreground">
                / 100 ({t("dashboard:metrics.quizScore.averageScore")})
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-xs">
                {t("dashboard:metrics.quizScore.highestScore")}:{" "}
                <span className="font-semibold ms-1" data-testid="quiz-highest-score">
                  {progress.quizStats.highestScore}
                </span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {progress.quizStats.totalAttempts}{" "}
                {t("dashboard:metrics.quizScore.totalAttempts")}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              {progress.quizStats.totalAttempts === 0
                ? t("dashboard:metrics.quizScore.noAttempts")
                : `${progress.quizStats.completedQuizzesCount} ${t("dashboard:metrics.quizScore.completedQuizzes")}`}
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Passed Labs */}
        <Card
          className="relative overflow-hidden transition-all hover:shadow-md"
          data-testid="passed-labs-card"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard:metrics.passedLabs.title")}
            </CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <FlaskConical className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold tracking-tight"
                data-testid="passed-labs-count"
              >
                {progress.passedLabsCount}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("dashboard:metrics.passedLabs.of")} {progress.totalLabsCount}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(labPercentage, 100)}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {progress.passedLabsCount > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  {labPercentage}% {t("dashboard:metrics.passedLabs.description")}
                </span>
              ) : (
                t("dashboard:metrics.passedLabs.description")
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(DashboardContent);
