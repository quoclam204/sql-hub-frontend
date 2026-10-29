"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useParams } from "next/navigation";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import {
  AdminStatisticsResponse,
  useGetAdminStatisticsService,
} from "@/services/api/services/admin-content";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import Link from "@/components/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Users from "lucide-react/dist/esm/icons/users";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import RotateCw from "lucide-react/dist/esm/icons/rotate-cw";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";

function AdminStatisticsContent() {
  const { t, i18n } = useTranslation("admin-panel-statistics");
  const params = useParams();
  const currentLang = (params?.language as string) || i18n.language || "vi";

  const getStatisticsService = useGetAdminStatisticsService();
  const [data, setData] = useState<AdminStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStatisticsService();
      if (response.status === HTTP_CODES_ENUM.OK && response.data) {
        setData(response.data);
      } else {
        setError(t("status.error"));
      }
    } catch {
      setError(t("status.error"));
    } finally {
      setLoading(false);
    }
  }, [getStatisticsService, t]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleRefresh = () => {
    startTransition(() => {
      fetchStatistics();
    });
  };

  const overview = data?.overview;
  const labsStatistics = data?.labsStatistics || [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="gap-1 p-0 h-auto text-muted-foreground hover:text-foreground">
              <Link href="/admin-panel">
                <ChevronLeft className="size-4" />
                <span>Admin Portal</span>
              </Link>
            </Button>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="admin-statistics-title"
          >
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || isPending}
          data-testid="btn-statistics-refresh"
          className="gap-2 shrink-0"
        >
          <RotateCw
            className={`size-4 ${loading || isPending ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      {/* Error State */}
      {error && !loading && (
        <Card
          className="border-destructive/50 bg-destructive/5"
          data-testid="admin-statistics-error"
        >
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-6 text-destructive shrink-0" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRefresh}
              data-testid="btn-statistics-retry"
            >
              {t("status.retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-8" data-testid="admin-statistics-loading">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-36" />
              </Card>
            ))}
          </div>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && overview && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Learners */}
            <Card data-testid="stat-card-learners" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("overview.totalLearners")}
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Users className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div
                  className="text-2xl font-bold"
                  data-testid="value-total-learners"
                >
                  {overview.totalLearners}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {overview.activeLearners}
                  </span>{" "}
                  {t("overview.activeLearners").toLowerCase()}
                </div>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {t("overview.activeLearnersDesc")}
                </p>
              </CardContent>
            </Card>

            {/* Card 2: SQL Lab Pass Rate */}
            <Card data-testid="stat-card-pass-rate" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("overview.labPassRate")}
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <FlaskConical className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div
                  className="text-2xl font-bold"
                  data-testid="value-lab-pass-rate"
                >
                  {overview.labPassRate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {overview.passedSubmissions}
                  </span>{" "}
                  / {overview.totalSubmissions} {t("overview.totalSubmissions").toLowerCase()}
                </div>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {t("overview.learnerPassRate")}:{" "}
                  <span className="font-medium text-foreground">
                    {overview.learnerLabPassRate}%
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Lessons Completed */}
            <Card data-testid="stat-card-lessons" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("overview.lessonsCompleted")}
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <BookOpen className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div
                  className="text-2xl font-bold"
                  data-testid="value-lessons-completed"
                >
                  {overview.completedLessonsCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("overview.totalLessons")}:{" "}
                  <span className="font-semibold text-foreground">
                    {overview.totalLessons}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {t("overview.lessonsCompletedDesc")}
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Quiz Performance */}
            <Card data-testid="stat-card-quizzes" className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("overview.averageQuizScore")}
                </CardTitle>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <HelpCircle className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div
                  className="text-2xl font-bold"
                  data-testid="value-quiz-score"
                >
                  {overview.averageQuizScore}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / 10
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {overview.totalQuizAttempts}
                  </span>{" "}
                  {t("overview.quizAttempts").toLowerCase()}
                </div>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {t("overview.totalLabs")}:{" "}
                  <span className="font-semibold text-foreground">
                    {overview.totalLabs}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Per-Lab Breakdown Table */}
          <Card data-testid="admin-statistics-labs-table">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("labsTable.title")}
              </CardTitle>
              <CardDescription>
                {t("labsTable.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">{t("labsTable.colLabId")}</TableHead>
                      <TableHead>{t("labsTable.colTitle")}</TableHead>
                      <TableHead className="text-center">{t("labsTable.colSubmissions")}</TableHead>
                      <TableHead className="text-center">{t("labsTable.colPassed")}</TableHead>
                      <TableHead className="text-center">{t("labsTable.colPassRate")}</TableHead>
                      <TableHead className="text-right">{t("labsTable.colAvgRuntime")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labsStatistics.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-28 text-center text-muted-foreground"
                          data-testid="admin-statistics-empty"
                        >
                          {t("labsTable.empty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      labsStatistics.map((item) => {
                        const title =
                          currentLang === "en" ? item.titleEn : item.titleVi;
                        const isHighPass = item.passRate >= 70;
                        const isMedPass = item.passRate >= 40 && item.passRate < 70;

                        return (
                          <TableRow
                            key={item.labId}
                            data-testid={`lab-stat-row-${item.labId}`}
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{item.labId}
                            </TableCell>
                            <TableCell className="font-medium">
                              {title}
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {item.totalSubmissions}
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {item.passedSubmissions}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.totalSubmissions === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  {t("labsTable.noSubmissions")}
                                </span>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={
                                    isHighPass
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : isMedPass
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                  }
                                >
                                  {item.passRate}%
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                              {item.totalSubmissions > 0 && item.averageRuntimeMs > 0
                                ? `${item.averageRuntimeMs} ms`
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default withPageRequiredAuth(AdminStatisticsContent, {
  roles: [RoleEnum.ADMIN],
});
