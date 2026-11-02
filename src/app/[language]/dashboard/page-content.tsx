"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import {
  useGetLearnerProgressService,
  LearnerProgressResponse,
  BadgeItem,
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
import Flame from "lucide-react/dist/esm/icons/flame";
import Zap from "lucide-react/dist/esm/icons/zap";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Star from "lucide-react/dist/esm/icons/star";
import Lock from "lucide-react/dist/esm/icons/lock";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

function DashboardContent() {
  const { t, i18n } = useTranslation("dashboard");
  const params = useParams();
  const currentLang = (params?.language as string) || i18n.language || "vi";

  const fetchLearnerProgress = useGetLearnerProgressService();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LearnerProgressResponse | null>(
    null
  );
  const [badgeFilter, setBadgeFilter] = useState<"all" | "unlocked" | "locked">(
    "all"
  );

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

  const streak = progress?.streak;
  const badges = useMemo(() => progress?.badges || [], [progress?.badges]);

  const filteredBadges = useMemo(() => {
    if (badgeFilter === "unlocked") {
      return badges.filter((b) => b.isUnlocked);
    }
    if (badgeFilter === "locked") {
      return badges.filter((b) => !b.isUnlocked);
    }
    return badges;
  }, [badges, badgeFilter]);

  const unlockedCount = useMemo(() => {
    return badges.filter((b) => b.isUnlocked).length;
  }, [badges]);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
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
          <p className="text-muted-foreground">
            {error || t("dashboard:error.description")}
          </p>
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
      ? Math.round(
          (progress.completedLessonsCount / progress.totalLessonsCount) * 100
        )
      : 0;

  const labPercentage =
    progress.totalLabsCount > 0
      ? Math.round((progress.passedLabsCount / progress.totalLabsCount) * 100)
      : 0;

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = isUnlocked ? "size-6" : "size-6 text-muted-foreground";

    switch (iconName) {
      case "book-open":
        return <BookOpen className={iconClass} />;
      case "help-circle":
        return <HelpCircle className={iconClass} />;
      case "flask-conical":
        return <FlaskConical className={iconClass} />;
      case "flame":
        return <Flame className={iconClass} />;
      case "zap":
        return <Zap className={iconClass} />;
      case "award":
        return <Award className={iconClass} />;
      case "trophy":
        return <Trophy className={iconClass} />;
      case "star":
        return <Star className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

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
              <Link href="/">{t("dashboard:emptyState.action")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* FR-PROG-02: Streaks Hero Card */}
      {streak && (
        <Card
          className="relative overflow-hidden border-orange-500/20 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent"
          data-testid="learning-streak-card"
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3.5 rounded-2xl ${
                    streak.currentStreak > 0
                      ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Flame className="size-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold">
                      {t("dashboard:streak.title")}
                    </h2>
                    {streak.isActiveToday ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1"
                        data-testid="streak-active-today-badge"
                      >
                        <CheckCircle2 className="size-3" />
                        {t("dashboard:streak.activeToday")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        data-testid="streak-inactive-today-badge"
                      >
                        {t("dashboard:streak.inactiveToday")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {streak.isActiveToday
                      ? t("dashboard:streak.keepItUp")
                      : t("dashboard:streak.startToday")}
                  </p>
                </div>
              </div>

              {/* Streak Counters */}
              <div className="flex items-center gap-6 sm:gap-8 self-stretch md:self-auto justify-around border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                <div className="text-center">
                  <div
                    className="text-3xl font-extrabold text-orange-600 dark:text-orange-400"
                    data-testid="current-streak-count"
                  >
                    {streak.currentStreak}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {t("dashboard:streak.currentStreak")}
                  </div>
                </div>

                <div className="h-8 w-px bg-border/60" />

                <div className="text-center">
                  <div
                    className="text-3xl font-extrabold text-foreground"
                    data-testid="longest-streak-count"
                  >
                    {streak.longestStreak}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {t("dashboard:streak.longestStreak")}
                  </div>
                </div>

                <div className="h-8 w-px bg-border/60" />

                <div className="text-center">
                  <div
                    className="text-3xl font-extrabold text-foreground"
                    data-testid="total-active-days"
                  >
                    {streak.totalActiveDays}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {t("dashboard:streak.totalActiveDays")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Stats Grid (FR-PROG-01) */}
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
                {t("dashboard:metrics.completedLessons.of")}{" "}
                {progress.totalLessonsCount}
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
                  {lessonPercentage}%{" "}
                  {t("dashboard:metrics.completedLessons.description")}
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
                <span
                  className="font-semibold ms-1"
                  data-testid="quiz-highest-score"
                >
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
                  {labPercentage}%{" "}
                  {t("dashboard:metrics.passedLabs.description")}
                </span>
              ) : (
                t("dashboard:metrics.passedLabs.description")
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FR-PROG-02: Badges Section */}
      <div className="space-y-4" data-testid="badges-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight"
              data-testid="badges-section-title"
            >
              {t("dashboard:badges.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("dashboard:badges.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1 font-semibold text-xs"
              data-testid="badges-unlocked-count"
            >
              {t("dashboard:badges.unlockedCount", {
                unlocked: unlockedCount,
                total: badges.length,
              })}
            </Badge>

            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              <Button
                variant={badgeFilter === "all" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setBadgeFilter("all")}
                data-testid="filter-badge-all"
              >
                {t("dashboard:badges.filterAll")}
              </Button>
              <Button
                variant={badgeFilter === "unlocked" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setBadgeFilter("unlocked")}
                data-testid="filter-badge-unlocked"
              >
                {t("dashboard:badges.filterUnlocked")}
              </Button>
              <Button
                variant={badgeFilter === "locked" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setBadgeFilter("locked")}
                data-testid="filter-badge-locked"
              >
                {t("dashboard:badges.filterLocked")}
              </Button>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge: BadgeItem) => {
            const title = currentLang === "en" ? badge.titleEn : badge.titleVi;
            const description =
              currentLang === "en" ? badge.descriptionEn : badge.descriptionVi;
            const progressPercent =
              badge.targetProgress > 0
                ? Math.min(
                    100,
                    Math.round(
                      (badge.currentProgress / badge.targetProgress) * 100
                    )
                  )
                : 0;

            return (
              <Card
                key={badge.id}
                className={`relative flex flex-col justify-between overflow-hidden transition-all duration-200 ${
                  badge.isUnlocked
                    ? "border-primary/20 bg-card hover:shadow-md hover:border-primary/40"
                    : "opacity-75 bg-muted/20 border-dashed"
                }`}
                data-testid={`badge-card-${badge.id}`}
              >
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`p-3 rounded-xl ${
                        badge.isUnlocked
                          ? badge.category === "streak"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : badge.category === "mastery"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground/60"
                      }`}
                    >
                      {renderBadgeIcon(badge.icon, badge.isUnlocked)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={badge.isUnlocked ? "default" : "secondary"}
                        className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0"
                      >
                        {t(`dashboard:badges.categories.${badge.category}`)}
                      </Badge>
                      {badge.isUnlocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          {t("dashboard:badges.filterUnlocked")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <Lock className="size-3" />
                          {t("dashboard:badges.locked")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold leading-tight">
                      {title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-2">
                  {badge.isUnlocked ? (
                    badge.unlockedAt && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>
                          {t("dashboard:badges.unlockedOn")}{" "}
                          {new Date(badge.unlockedAt).toLocaleDateString(
                            currentLang === "vi" ? "vi-VN" : "en-US"
                          )}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t("dashboard:badges.inProgress")}</span>
                        <span className="font-mono">
                          {badge.currentProgress} / {badge.targetProgress}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary/50 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(DashboardContent);
