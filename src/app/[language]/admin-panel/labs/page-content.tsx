"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  AdminLabItem,
  AdminDatasetItem,
  AdminLessonItem,
  useGetAdminLabsService,
  useGetAdminDatasetsService,
  useGetAdminLessonsService,
  usePostAdminLabService,
  usePatchAdminLabService,
  useDeleteAdminLabService,
} from "@/services/api/services/admin-content";
import {
  Card,
  CardContent,
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
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";

function AdminLabsContent() {
  const { t } = useTranslation("admin-panel-labs");
  const { enqueueSnackbar } = useSnackbar();

  const fetchLabs = useGetAdminLabsService();
  const fetchDatasets = useGetAdminDatasetsService();
  const fetchLessons = useGetAdminLessonsService();
  const postLab = usePostAdminLabService();
  const patchLab = usePatchAdminLabService();
  const deleteLab = useDeleteAdminLabService();

  const [labs, setLabs] = useState<AdminLabItem[]>([]);
  const [datasets, setDatasets] = useState<AdminDatasetItem[]>([]);
  const [lessons, setLessons] = useState<AdminLessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabId, setEditingLabId] = useState<number | null>(null);
  const [datasetId, setDatasetId] = useState<number | "">("");
  const [lessonId, setLessonId] = useState<string>("none");
  const [expectedQuery, setExpectedQuery] = useState("");
  const [orderSensitive, setOrderSensitive] = useState(false);
  const [titleVi, setTitleVi] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [hintVi, setHintVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [hintEn, setHintEn] = useState("");

  // Delete Confirm Dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingLabId, setDeletingLabId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [datasetsRes, lessonsRes, labsRes] = await Promise.all([
        fetchDatasets(),
        fetchLessons(),
        fetchLabs(),
      ]);

      if (datasetsRes.status === HTTP_CODES_ENUM.OK && datasetsRes.data) {
        setDatasets(datasetsRes.data);
      }
      if (lessonsRes.status === HTTP_CODES_ENUM.OK && lessonsRes.data) {
        setLessons(lessonsRes.data);
      }
      if (labsRes.status === HTTP_CODES_ENUM.OK && labsRes.data) {
        setLabs(labsRes.data);
      }
    } catch {
      enqueueSnackbar(t("alerts.error"), { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [fetchDatasets, fetchLessons, fetchLabs, enqueueSnackbar, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingLabId(null);
    setDatasetId(datasets[0]?.id || "");
    setLessonId("none");
    setExpectedQuery("SELECT * FROM employees WHERE department_id = 1;");
    setOrderSensitive(false);
    setTitleVi("");
    setDescriptionVi("");
    setHintVi("");
    setTitleEn("");
    setDescriptionEn("");
    setHintEn("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lab: AdminLabItem) => {
    setEditingLabId(lab.id);
    setDatasetId(lab.datasetId);
    setLessonId(lab.lessonId ? String(lab.lessonId) : "none");
    setExpectedQuery(lab.expectedQuery);
    setOrderSensitive(lab.orderSensitive);
    setTitleVi(lab.titleVi);
    setDescriptionVi(lab.descriptionVi || "");
    setHintVi(lab.hintVi || "");
    setTitleEn(lab.titleEn);
    setDescriptionEn(lab.descriptionEn || "");
    setHintEn(lab.hintEn || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetId || !expectedQuery.trim() || !titleVi.trim() || !titleEn.trim()) {
      enqueueSnackbar(t("alerts.error"), { variant: "error" });
      return;
    }

    // NFR-02 & Safety check: must start with SELECT or WITH
    const normalizedQuery = expectedQuery.trim().toUpperCase();
    if (!normalizedQuery.startsWith("SELECT") && !normalizedQuery.startsWith("WITH")) {
      enqueueSnackbar(t("alerts.queryValidationError"), { variant: "error" });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          datasetId: Number(datasetId),
          lessonId: lessonId !== "none" ? Number(lessonId) : null,
          expectedQuery: expectedQuery.trim(),
          orderSensitive,
          titleVi: titleVi.trim(),
          descriptionVi: descriptionVi.trim(),
          hintVi: hintVi.trim(),
          titleEn: titleEn.trim(),
          descriptionEn: descriptionEn.trim(),
          hintEn: hintEn.trim(),
        };

        if (editingLabId) {
          const res = await patchLab(editingLabId, payload);
          if (res.status === HTTP_CODES_ENUM.OK) {
            enqueueSnackbar(t("alerts.updateSuccess"), { variant: "success" });
            setIsModalOpen(false);
            loadData();
          } else {
            enqueueSnackbar(t("alerts.error"), { variant: "error" });
          }
        } else {
          const res = await postLab(payload);
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
    if (!deletingLabId) return;

    startTransition(async () => {
      try {
        const res = await deleteLab(deletingLabId);
        if (res.status === HTTP_CODES_ENUM.OK) {
          enqueueSnackbar(t("alerts.deleteSuccess"), { variant: "success" });
          setIsDeleteOpen(false);
          setDeletingLabId(null);
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
            data-testid="admin-labs-title"
          >
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("description")}
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          data-testid="btn-add-lab"
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          {t("actions.add")}
        </Button>
      </div>

      {/* Table Content */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : labs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FlaskConical className="size-12 mx-auto mb-3 opacity-30" />
              <p>{t("table.noData")}</p>
            </div>
          ) : (
            <Table data-testid="labs-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("table.id")}</TableHead>
                  <TableHead>{t("table.titleVi")}</TableHead>
                  <TableHead>{t("table.titleEn")}</TableHead>
                  <TableHead>{t("table.dataset")}</TableHead>
                  <TableHead>{t("table.lesson")}</TableHead>
                  <TableHead className="w-24 text-center">{t("table.orderSensitive")}</TableHead>
                  <TableHead className="text-end">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labs.map((lab) => (
                  <TableRow
                    key={lab.id}
                    data-testid={`lab-row-${lab.id}`}
                  >
                    <TableCell className="font-medium">#{lab.id}</TableCell>
                    <TableCell className="font-medium">{lab.titleVi || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{lab.titleEn || "-"}</TableCell>
                    <TableCell className="text-xs font-mono">{lab.datasetName || `Dataset #${lab.datasetId}`}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{lab.lessonSlug || "-"}</TableCell>
                    <TableCell className="text-center">
                      {lab.orderSensitive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <Check className="size-3" />
                          {t("table.yes")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <X className="size-3" />
                          {t("table.no")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(lab)}
                        data-testid={`btn-edit-lab-${lab.id}`}
                      >
                        <Pencil className="size-3.5 mr-1" />
                        {t("actions.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeletingLabId(lab.id);
                          setIsDeleteOpen(true);
                        }}
                        data-testid={`btn-delete-lab-${lab.id}`}
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

      {/* Modal Add / Edit Lab */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          data-testid="lab-modal"
        >
          <DialogHeader>
            <DialogTitle>
              {editingLabId ? t("form.editTitle") : t("form.addTitle")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lab-dataset">{t("form.dataset")}</Label>
                <Select
                  value={String(datasetId)}
                  onValueChange={(val) => setDatasetId(Number(val))}
                >
                  <SelectTrigger id="lab-dataset" data-testid="input-lab-dataset">
                    <SelectValue placeholder={t("form.dataset")} />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lab-lesson">{t("form.lesson")}</Label>
                <Select
                  value={lessonId}
                  onValueChange={setLessonId}
                >
                  <SelectTrigger id="lab-lesson" data-testid="input-lab-lesson">
                    <SelectValue placeholder={t("form.lesson")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("form.noLesson")}</SelectItem>
                    {lessons.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.titleVi || l.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Query */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="lab-query">{t("form.expectedQuery")}</Label>
                <span className="text-xs text-muted-foreground">
                  {t("form.expectedQueryHelp")}
                </span>
              </div>
              <Textarea
                id="lab-query"
                rows={3}
                value={expectedQuery}
                onChange={(e) => setExpectedQuery(e.target.value)}
                placeholder="SELECT column_name FROM table_name WHERE condition;"
                className="font-mono text-xs"
                data-testid="input-lab-query"
                required
              />
            </div>

            {/* Order Sensitive Toggle */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
              <input
                id="order-sensitive-checkbox"
                type="checkbox"
                checked={orderSensitive}
                onChange={(e) => setOrderSensitive(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
                data-testid="checkbox-order-sensitive"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="order-sensitive-checkbox"
                  className="font-medium text-sm cursor-pointer"
                >
                  {t("form.orderSensitive")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("form.orderSensitiveHelp")}
                </p>
              </div>
            </div>

            {/* Bilingual VI */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h3 className="font-semibold text-sm text-primary">
                🇻🇳 Tiếng Việt (Vietnamese)
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="lab-title-vi">{t("form.titleVi")}</Label>
                <Input
                  id="lab-title-vi"
                  value={titleVi}
                  onChange={(e) => setTitleVi(e.target.value)}
                  placeholder="Tiêu đề bài thực hành..."
                  data-testid="input-lab-title-vi"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-desc-vi">{t("form.descriptionVi")}</Label>
                <Textarea
                  id="lab-desc-vi"
                  rows={2}
                  value={descriptionVi}
                  onChange={(e) => setDescriptionVi(e.target.value)}
                  placeholder="Nội dung yêu cầu bài thực hành..."
                  data-testid="input-lab-desc-vi"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-hint-vi">{t("form.hintVi")}</Label>
                <Input
                  id="lab-hint-vi"
                  value={hintVi}
                  onChange={(e) => setHintVi(e.target.value)}
                  placeholder="Gợi ý tư duy..."
                  data-testid="input-lab-hint-vi"
                />
              </div>
            </div>

            {/* Bilingual EN */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h3 className="font-semibold text-sm text-primary">
                🇬🇧 Tiếng Anh (English)
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="lab-title-en">{t("form.titleEn")}</Label>
                <Input
                  id="lab-title-en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Lab title in English..."
                  data-testid="input-lab-title-en"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-desc-en">{t("form.descriptionEn")}</Label>
                <Textarea
                  id="lab-desc-en"
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Lab instructions and requirements..."
                  data-testid="input-lab-desc-en"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lab-hint-en">{t("form.hintEn")}</Label>
                <Input
                  id="lab-hint-en"
                  value={hintEn}
                  onChange={(e) => setHintEn(e.target.value)}
                  placeholder="Hint for learners..."
                  data-testid="input-lab-hint-en"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                data-testid="btn-cancel-lab"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="btn-save-lab"
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
              data-testid="btn-confirm-delete-lab"
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

export default withPageRequiredAuth(AdminLabsContent, {
  roles: [RoleEnum.ADMIN],
});
