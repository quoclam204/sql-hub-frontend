"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  AdminQuizQuestionItem,
  AdminQuizItem,
  AdminQuestionOptionItem,
  useGetAdminQuizQuestionsService,
  useGetAdminQuizzesService,
  usePostAdminQuizQuestionService,
  usePatchAdminQuizQuestionService,
  useDeleteAdminQuizQuestionService,
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
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";

type FormOption = {
  id?: number;
  optionTextVi: string;
  optionTextEn?: string;
  isCorrect: boolean;
};

function AdminQuizQuestionsContent() {
  const { t } = useTranslation("admin-panel-quizzes");
  const { enqueueSnackbar } = useSnackbar();

  const fetchQuestions = useGetAdminQuizQuestionsService();
  const fetchQuizzes = useGetAdminQuizzesService();
  const postQuestion = usePostAdminQuizQuestionService();
  const patchQuestion = usePatchAdminQuizQuestionService();
  const deleteQuestion = useDeleteAdminQuizQuestionService();

  const [questions, setQuestions] = useState<AdminQuizQuestionItem[]>([]);
  const [quizzes, setQuizzes] = useState<AdminQuizItem[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [quizId, setQuizId] = useState<number | "">("");
  const [order, setOrder] = useState<number>(1);
  const [questionTextVi, setQuestionTextVi] = useState("");
  const [explanationVi, setExplanationVi] = useState("");
  const [questionTextEn, setQuestionTextEn] = useState("");
  const [explanationEn, setExplanationEn] = useState("");
  const [options, setOptions] = useState<FormOption[]>([
    { optionTextVi: "", optionTextEn: "", isCorrect: true },
    { optionTextVi: "", optionTextEn: "", isCorrect: false },
  ]);

  // Delete Confirm Dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [quizzesRes, questionsRes] = await Promise.all([
        fetchQuizzes(),
        fetchQuestions(selectedQuizId !== "all" ? Number(selectedQuizId) : undefined),
      ]);

      if (quizzesRes.status === HTTP_CODES_ENUM.OK && quizzesRes.data) {
        setQuizzes(quizzesRes.data);
      }
      if (questionsRes.status === HTTP_CODES_ENUM.OK && questionsRes.data) {
        setQuestions(questionsRes.data);
      }
    } catch {
      enqueueSnackbar(t("alerts.error"), { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuizzes, fetchQuestions, selectedQuizId, enqueueSnackbar, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingQuestionId(null);
    setQuizId(quizzes[0]?.id || "");
    setOrder(questions.length + 1);
    setQuestionTextVi("");
    setExplanationVi("");
    setQuestionTextEn("");
    setExplanationEn("");
    setOptions([
      { optionTextVi: "", optionTextEn: "", isCorrect: true },
      { optionTextVi: "", optionTextEn: "", isCorrect: false },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: AdminQuizQuestionItem) => {
    setEditingQuestionId(q.id);
    setQuizId(q.quizId);
    setOrder(q.order);
    setQuestionTextVi(q.questionTextVi);
    setExplanationVi(q.explanationVi || "");
    setQuestionTextEn(q.questionTextEn);
    setExplanationEn(q.explanationEn || "");
    setOptions(
      q.options && q.options.length > 0
        ? q.options.map((opt) => ({
            id: opt.id,
            optionTextVi: opt.optionTextVi,
            optionTextEn: opt.optionTextEn || "",
            isCorrect: opt.isCorrect,
          }))
        : [
            { optionTextVi: "", optionTextEn: "", isCorrect: true },
            { optionTextVi: "", optionTextEn: "", isCorrect: false },
          ]
    );
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { optionTextVi: "", optionTextEn: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure at least one correct option exists if the removed one was correct
      if (prev[index].isCorrect && updated.length > 0) {
        updated[0].isCorrect = true;
      }
      return updated;
    });
  };

  const handleSelectCorrectOption = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
  };

  const handleOptionChange = (
    index: number,
    field: "optionTextVi" | "optionTextEn",
    value: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId || !questionTextVi.trim() || !questionTextEn.trim()) {
      enqueueSnackbar(t("alerts.error"), { variant: "error" });
      return;
    }

    // Validation: at least 2 options, and exactly 1 correct
    if (options.length < 2) {
      enqueueSnackbar(t("alerts.optionValidationError"), { variant: "error" });
      return;
    }
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      enqueueSnackbar(t("alerts.optionValidationError"), { variant: "error" });
      return;
    }
    const hasEmptyOption = options.some((o) => !o.optionTextVi.trim());
    if (hasEmptyOption) {
      enqueueSnackbar(t("alerts.optionValidationError"), { variant: "error" });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          quizId: Number(quizId),
          order: Number(order) || 1,
          questionTextVi: questionTextVi.trim(),
          explanationVi: explanationVi.trim(),
          questionTextEn: questionTextEn.trim(),
          explanationEn: explanationEn.trim(),
          options: options.map((opt, idx) => ({
            id: opt.id,
            optionTextVi: opt.optionTextVi.trim(),
            optionTextEn: opt.optionTextEn?.trim(),
            isCorrect: opt.isCorrect,
            order: idx + 1,
          })),
        };

        if (editingQuestionId) {
          const res = await patchQuestion(editingQuestionId, payload);
          if (res.status === HTTP_CODES_ENUM.OK) {
            enqueueSnackbar(t("alerts.updateSuccess"), { variant: "success" });
            setIsModalOpen(false);
            loadData();
          } else {
            enqueueSnackbar(t("alerts.error"), { variant: "error" });
          }
        } else {
          const res = await postQuestion(payload);
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
    if (!deletingQuestionId) return;

    startTransition(async () => {
      try {
        const res = await deleteQuestion(deletingQuestionId);
        if (res.status === HTTP_CODES_ENUM.OK) {
          enqueueSnackbar(t("alerts.deleteSuccess"), { variant: "success" });
          setIsDeleteOpen(false);
          setDeletingQuestionId(null);
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
            data-testid="admin-quiz-questions-title"
          >
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("description")}
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          data-testid="btn-add-quiz-question"
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          {t("actions.add")}
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="w-full sm:w-72 space-y-1">
            <Label htmlFor="quiz-filter" className="text-xs text-muted-foreground">
              {t("actions.filterByQuiz")}
            </Label>
            <Select
              value={selectedQuizId}
              onValueChange={setSelectedQuizId}
            >
              <SelectTrigger id="quiz-filter" data-testid="select-filter-quiz">
                <SelectValue placeholder={t("actions.allQuizzes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("actions.allQuizzes")}</SelectItem>
                {quizzes.map((q) => (
                  <SelectItem key={q.id} value={String(q.id)}>
                    {q.title || `Quiz #${q.id}`}
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
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HelpCircle className="size-12 mx-auto mb-3 opacity-30" />
              <p>{t("table.noData")}</p>
            </div>
          ) : (
            <Table data-testid="quiz-questions-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("table.order")}</TableHead>
                  <TableHead className="w-48">{t("table.quiz")}</TableHead>
                  <TableHead>{t("table.questionVi")}</TableHead>
                  <TableHead>{t("table.questionEn")}</TableHead>
                  <TableHead className="w-24 text-center">{t("table.optionsCount")}</TableHead>
                  <TableHead className="text-end">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow
                    key={q.id}
                    data-testid={`quiz-question-row-${q.id}`}
                  >
                    <TableCell className="font-medium">{q.order}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {q.quizTitle || `Quiz #${q.quizId}`}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {q.questionTextVi || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {q.questionTextEn || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {q.options?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(q)}
                        data-testid={`btn-edit-question-${q.id}`}
                      >
                        <Pencil className="size-3.5 mr-1" />
                        {t("actions.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeletingQuestionId(q.id);
                          setIsDeleteOpen(true);
                        }}
                        data-testid={`btn-delete-question-${q.id}`}
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

      {/* Modal Add / Edit Quiz Question */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          data-testid="quiz-question-modal"
        >
          <DialogHeader>
            <DialogTitle>
              {editingQuestionId ? t("form.editTitle") : t("form.addTitle")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="question-quiz">{t("form.quiz")}</Label>
                <Select
                  value={String(quizId)}
                  onValueChange={(val) => setQuizId(Number(val))}
                >
                  <SelectTrigger id="question-quiz" data-testid="input-question-quiz">
                    <SelectValue placeholder={t("form.quiz")} />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((q) => (
                      <SelectItem key={q.id} value={String(q.id)}>
                        {q.title || `Quiz #${q.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="question-order">{t("form.order")}</Label>
                <Input
                  id="question-order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  data-testid="input-question-order"
                  required
                />
              </div>
            </div>

            {/* Bilingual VI */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h3 className="font-semibold text-sm text-primary">
                🇻🇳 Tiếng Việt (Vietnamese)
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="question-vi">{t("form.questionVi")}</Label>
                <Textarea
                  id="question-vi"
                  rows={2}
                  value={questionTextVi}
                  onChange={(e) => setQuestionTextVi(e.target.value)}
                  placeholder="Nội dung câu hỏi..."
                  data-testid="input-question-vi"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="explanation-vi">{t("form.explanationVi")}</Label>
                <Textarea
                  id="explanation-vi"
                  rows={2}
                  value={explanationVi}
                  onChange={(e) => setExplanationVi(e.target.value)}
                  placeholder="Giải thích vì sao đáp án đúng..."
                  data-testid="input-explanation-vi"
                />
              </div>
            </div>

            {/* Bilingual EN */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h3 className="font-semibold text-sm text-primary">
                🇬🇧 Tiếng Anh (English)
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="question-en">{t("form.questionEn")}</Label>
                <Textarea
                  id="question-en"
                  rows={2}
                  value={questionTextEn}
                  onChange={(e) => setQuestionTextEn(e.target.value)}
                  placeholder="Question text in English..."
                  data-testid="input-question-en"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="explanation-en">{t("form.explanationEn")}</Label>
                <Textarea
                  id="explanation-en"
                  rows={2}
                  value={explanationEn}
                  onChange={(e) => setExplanationEn(e.target.value)}
                  placeholder="Explanation in English..."
                  data-testid="input-explanation-en"
                />
              </div>
            </div>

            {/* Options Management */}
            <div className="p-4 border rounded-lg bg-muted/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">
                    {t("form.optionsSection")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("alerts.optionValidationError")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  data-testid="btn-add-option"
                  className="flex items-center gap-1"
                >
                  <Plus className="size-3.5" />
                  {t("actions.addOption")}
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-md space-y-2 transition-colors ${
                      opt.isCorrect
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-border bg-background"
                    }`}
                    data-testid={`option-item-${idx}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => handleSelectCorrectOption(idx)}
                          className="accent-emerald-600 size-4 cursor-pointer"
                          data-testid={`radio-option-correct-${idx}`}
                        />
                        <span className={opt.isCorrect ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                          {t("form.correctAnswer")}
                        </span>
                        {opt.isCorrect && (
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                        )}
                      </label>

                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveOption(idx)}
                          data-testid={`btn-remove-option-${idx}`}
                        >
                          <Trash2 className="size-3 mr-1" />
                          {t("actions.removeOption")}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={opt.optionTextVi}
                        onChange={(e) =>
                          handleOptionChange(idx, "optionTextVi", e.target.value)
                        }
                        placeholder={t("form.optionViPlaceholder")}
                        data-testid={`input-option-vi-${idx}`}
                        required
                      />
                      <Input
                        value={opt.optionTextEn || ""}
                        onChange={(e) =>
                          handleOptionChange(idx, "optionTextEn", e.target.value)
                        }
                        placeholder={t("form.optionEnPlaceholder")}
                        data-testid={`input-option-en-${idx}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                data-testid="btn-cancel-question"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="btn-save-question"
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
              data-testid="btn-confirm-delete-question"
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

export default withPageRequiredAuth(AdminQuizQuestionsContent, {
  roles: [RoleEnum.ADMIN],
});
