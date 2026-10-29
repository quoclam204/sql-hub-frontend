"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  AdminLessonItem,
  AdminCourseItem,
  useGetAdminLessonsService,
  useGetAdminCoursesService,
  usePostAdminLessonService,
  usePatchAdminLessonService,
  useDeleteAdminLessonService,
} from "@/services/api/services/admin-content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Plus from "lucide-react/dist/esm/icons/plus";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import BookOpen from "lucide-react/dist/esm/icons/book-open";

function AdminLessonsContent() {
  const { t } = useTranslation("admin-panel-lessons");
  const { enqueueSnackbar } = useSnackbar();

  const fetchLessons = useGetAdminLessonsService();
  const fetchCourses = useGetAdminCoursesService();
  const postLesson = usePostAdminLessonService();
  const patchLesson = usePatchAdminLessonService();
  const deleteLesson = useDeleteAdminLessonService();

  const [lessons, setLessons] = useState<AdminLessonItem[]>([]);
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | "">("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [titleVi, setTitleVi] = useState("");
  const [contentVi, setContentVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");

  // Delete Confirm Dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [coursesRes, lessonsRes] = await Promise.all([
        fetchCourses(),
        fetchLessons(selectedCourseId !== "all" ? Number(selectedCourseId) : undefined),
      ]);

      if (coursesRes.status === HTTP_CODES_ENUM.OK && coursesRes.data) {
        setCourses(coursesRes.data);
      }
      if (lessonsRes.status === HTTP_CODES_ENUM.OK && lessonsRes.data) {
        setLessons(lessonsRes.data);
      }
    } catch {
      enqueueSnackbar(t("alerts.error"), { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCourses, fetchLessons, selectedCourseId, enqueueSnackbar, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingLessonId(null);
    setCourseId(courses[0]?.id || "");
    setSlug("");
    setOrder(lessons.length + 1);
    setTitleVi("");
    setContentVi("");
    setTitleEn("");
    setContentEn("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lesson: AdminLessonItem) => {
    setEditingLessonId(lesson.id);
    setCourseId(lesson.courseId);
    setSlug(lesson.slug);
    setOrder(lesson.order);
    setTitleVi(lesson.titleVi);
    setContentVi(lesson.contentVi);
    setTitleEn(lesson.titleEn);
    setContentEn(lesson.contentEn);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !slug.trim()) {
      enqueueSnackbar(t("alerts.error"), { variant: "error" });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          courseId: Number(courseId),
          slug: slug.trim(),
          order: Number(order) || 1,
          titleVi: titleVi.trim(),
          contentVi: contentVi.trim(),
          titleEn: titleEn.trim(),
          contentEn: contentEn.trim(),
        };

        if (editingLessonId) {
          const res = await patchLesson(editingLessonId, payload);
          if (res.status === HTTP_CODES_ENUM.OK) {
            enqueueSnackbar(t("alerts.updateSuccess"), { variant: "success" });
            setIsModalOpen(false);
            loadData();
          } else {
            enqueueSnackbar(t("alerts.error"), { variant: "error" });
          }
        } else {
          const res = await postLesson(payload);
          if (res.status === HTTP_CODES_ENUM.CREATED) {
            enqueueSnackbar(t("alerts.createSuccess"), { variant: "success" });
            setIsModalOpen(false);
            loadData();
          } else {
            enqueueSnackbar(t("alerts.error"), { variant: "error" });
          }
        }
      } catch {
        enqueueSnackbar(t("alerts.error"), { variant: "error" });
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingLessonId) return;

    startTransition(async () => {
      try {
        const res = await deleteLesson(deletingLessonId);
        if (res.status === HTTP_CODES_ENUM.OK) {
          enqueueSnackbar(t("alerts.deleteSuccess"), { variant: "success" });
          setIsDeleteOpen(false);
          setDeletingLessonId(null);
          loadData();
        } else {
          enqueueSnackbar(t("alerts.error"), { variant: "error" });
        }
      } catch {
        enqueueSnackbar(t("alerts.error"), { variant: "error" });
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="admin-lessons-title"
          >
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("description")}
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          data-testid="btn-add-lesson"
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          {t("actions.add")}
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="w-full sm:w-64 space-y-1">
            <Label htmlFor="course-filter" className="text-xs text-muted-foreground">
              {t("actions.filterByCourse")}
            </Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
            >
              <SelectTrigger id="course-filter" data-testid="select-filter-course">
                <SelectValue placeholder={t("actions.allCourses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("actions.allCourses")}</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.titleVi || c.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table Content */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BookOpen className="size-12 mx-auto mb-3 opacity-30" />
              <p>{t("table.noData")}</p>
            </div>
          ) : (
            <Table data-testid="lessons-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("table.order")}</TableHead>
                  <TableHead>{t("table.slug")}</TableHead>
                  <TableHead>{t("table.titleVi")}</TableHead>
                  <TableHead>{t("table.titleEn")}</TableHead>
                  <TableHead className="text-end">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow
                    key={lesson.id}
                    data-testid={`lesson-row-${lesson.id}`}
                  >
                    <TableCell className="font-medium">{lesson.order}</TableCell>
                    <TableCell className="font-mono text-xs">{lesson.slug}</TableCell>
                    <TableCell className="font-medium">{lesson.titleVi || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{lesson.titleEn || "-"}</TableCell>
                    <TableCell className="text-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(lesson)}
                        data-testid={`btn-edit-lesson-${lesson.id}`}
                      >
                        <Pencil className="size-3.5 mr-1" />
                        {t("actions.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeletingLessonId(lesson.id);
                          setIsDeleteOpen(true);
                        }}
                        data-testid={`btn-delete-lesson-${lesson.id}`}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        {t("actions.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Add / Edit Lesson */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-testid="lesson-modal"
        >
          <DialogHeader>
            <DialogTitle>
              {editingLessonId ? t("form.editTitle") : t("form.addTitle")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="lesson-course">{t("form.course")}</Label>
                <Select
                  value={String(courseId)}
                  onValueChange={(val) => setCourseId(Number(val))}
                >
                  <SelectTrigger id="lesson-course" data-testid="input-lesson-course">
                    <SelectValue placeholder={t("form.course")} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.titleVi || c.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lesson-order">{t("form.order")}</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  data-testid="input-lesson-order"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lesson-slug">{t("form.slug")}</Label>
              <Input
                id="lesson-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vd: cau-lenh-select-co-ban"
                data-testid="input-lesson-slug"
                required
              />
            </div>

            {/* Bilingual VI */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h3 className="font-semibold text-sm text-primary">
                🇻🇳 Tiếng Việt (Vietnamese)
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-title-vi">{t("form.titleVi")}</Label>
                <Input
                  id="lesson-title-vi"
                  value={titleVi}
                  onChange={(e) => setTitleVi(e.target.value)}
                  placeholder="Tiêu đề bài học..."
                  data-testid="input-lesson-title-vi"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-content-vi">{t("form.contentVi")}</Label>
                <Textarea
                  id="lesson-content-vi"
                  rows={4}
                  value={contentVi}
                  onChange={(e) => setContentVi(e.target.value)}
                  placeholder="# Lý thuyết bài học..."
                  data-testid="input-lesson-content-vi"
                />
              </div>
            </div>

            {/* Bilingual EN */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h3 className="font-semibold text-sm text-primary">
                🇬🇧 Tiếng Anh (English)
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-title-en">{t("form.titleEn")}</Label>
                <Input
                  id="lesson-title-en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Lesson title..."
                  data-testid="input-lesson-title-en"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-content-en">{t("form.contentEn")}</Label>
                <Textarea
                  id="lesson-content-en"
                  rows={4}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="# Lesson Markdown..."
                  data-testid="input-lesson-content-en"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                data-testid="btn-cancel-lesson"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="btn-save-lesson"
              >
                {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("confirm.deleteMessage")}
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              data-testid="btn-confirm-delete-lesson"
            >
              {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              {t("confirm.confirmBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withPageRequiredAuth(AdminLessonsContent, {
  roles: [RoleEnum.ADMIN],
});
