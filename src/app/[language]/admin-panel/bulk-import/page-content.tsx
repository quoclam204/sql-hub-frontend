"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import Link from "@/components/link";
import {
  BulkImportType,
  BulkImportFormat,
  BulkImportErrorItem,
  BulkImportTemplates,
  usePostAdminBulkImportService,
  useGetAdminBulkImportTemplatesService,
} from "@/services/api/services/admin-content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import Upload from "lucide-react/dist/esm/icons/upload";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import FileText from "lucide-react/dist/esm/icons/file-text";
import FileCode from "lucide-react/dist/esm/icons/file-code";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Eye from "lucide-react/dist/esm/icons/eye";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import BookOpen from "lucide-react/dist/esm/icons/book-open";

function AdminBulkImportContent() {
  const { t } = useTranslation("admin-panel-bulk-import");
  const { enqueueSnackbar } = useSnackbar();

  const postBulkImport = usePostAdminBulkImportService();
  const fetchTemplates = useGetAdminBulkImportTemplatesService();

  const [contentType, setContentType] = useState<BulkImportType>("lessons");
  const [format, setFormat] = useState<BulkImportFormat>("json");
  const [content, setContent] = useState<string>("");
  const [templates, setTemplates] = useState<BulkImportTemplates | null>(null);

  const [isPending, startTransition] = useTransition();
  const [previewItems, setPreviewItems] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<BulkImportErrorItem[]>([]);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
    type: BulkImportType;
  } | null>(null);

  // Load sample templates from backend on mount
  useEffect(() => {
    fetchTemplates()
      .then((res) => {
        if (res.status === HTTP_CODES_ENUM.OK && res.data) {
          setTemplates(res.data);
        }
      })
      .catch(() => {
        // Fallback or ignore if backend offline
      });
  }, [fetchTemplates]);

  // Handle Load Template
  const handleLoadTemplate = () => {
    if (!templates) {
      // Fallback templates
      if (contentType === "lessons") {
        if (format === "json") {
          setContent(
            JSON.stringify(
              [
                {
                  courseId: 1,
                  slug: "menh-de-select-co-ban",
                  order: 1,
                  titleVi: "Mệnh đề SELECT cơ bản",
                  titleEn: "Basic SELECT Statement",
                  contentVi: "# Cú pháp SELECT\n\nSELECT * FROM employees;",
                  contentEn: "# SELECT Syntax\n\nSELECT * FROM employees;",
                },
              ],
              null,
              2
            )
          );
        } else {
          setContent(`---
courseId: 1
slug: menh-de-select-co-ban
order: 1
titleVi: Mệnh đề SELECT cơ bản
titleEn: Basic SELECT Statement
---
# vi
# Cú pháp SELECT trong SQL
SELECT * FROM employees;

# en
# SELECT Syntax in SQL
SELECT * FROM employees;`);
        }
      } else if (contentType === "quiz-questions") {
        if (format === "json") {
          setContent(
            JSON.stringify(
              [
                {
                  quizId: 1,
                  order: 1,
                  questionTextVi: "Từ khóa nào dùng để lấy dữ liệu?",
                  questionTextEn: "Which keyword retrieves data?",
                  explanationVi: "SELECT là câu lệnh cơ bản.",
                  explanationEn: "SELECT is the fundamental command.",
                  options: [
                    { optionTextVi: "SELECT", optionTextEn: "SELECT", isCorrect: true },
                    { optionTextVi: "GET", optionTextEn: "GET", isCorrect: false },
                  ],
                },
              ],
              null,
              2
            )
          );
        } else {
          setContent(`Quiz: 1
Order: 1
Question Vi: Từ khóa nào dùng để lấy dữ liệu?
Question En: Which keyword retrieves data?
Explanation Vi: SELECT là câu lệnh cơ bản.
Explanation En: SELECT is the fundamental command.
- [x] SELECT | SELECT
- [ ] GET | GET`);
        }
      } else {
        // labs
        if (format === "json") {
          setContent(
            JSON.stringify(
              [
                {
                  datasetId: 1,
                  lessonId: 1,
                  expectedQuery: "SELECT * FROM employees WHERE department_id = 1;",
                  orderSensitive: false,
                  titleVi: "Lọc nhân viên theo phòng ban",
                  titleEn: "Filter Employees by Department",
                  descriptionVi: "Viết truy vấn lọc nhân viên phòng ban 1.",
                  descriptionEn: "Write a query to filter department 1 employees.",
                  hintVi: "Dùng mệnh đề WHERE.",
                  hintEn: "Use WHERE clause.",
                },
              ],
              null,
              2
            )
          );
        } else {
          setContent(`---
datasetId: 1
lessonId: 1
orderSensitive: false
titleVi: Lọc nhân viên theo phòng ban
titleEn: Filter Employees by Department
---
### Description Vi
Viết truy vấn lọc nhân viên phòng ban 1.

### Description En
Write a query to filter department 1 employees.

### Expected Query
\`\`\`sql
SELECT * FROM employees WHERE department_id = 1;
\`\`\`

### Hint Vi
Dùng mệnh đề WHERE.`);
        }
      }
      return;
    }

    let tpl = "";
    if (contentType === "lessons") {
      tpl = format === "json" ? templates.lessons.json : templates.lessons.markdown;
    } else if (contentType === "quiz-questions") {
      tpl = format === "json" ? templates.quizQuestions.json : templates.quizQuestions.markdown;
    } else {
      tpl = format === "json" ? templates.labs.json : templates.labs.markdown;
    }
    setContent(tpl);
    setPreviewItems(null);
    setValidationErrors([]);
    setImportResult(null);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
        if (file.name.endsWith(".json")) {
          setFormat("json");
        } else if (file.name.endsWith(".md")) {
          setFormat("markdown");
        }
        setPreviewItems(null);
        setValidationErrors([]);
        setImportResult(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Validate / Dry Run
  const handleValidate = () => {
    if (!content.trim()) {
      enqueueSnackbar(t("alerts.emptyContent"), { variant: "warning" });
      return;
    }

    startTransition(async () => {
      try {
        const res = await postBulkImport({
          type: contentType,
          format,
          content: content.trim(),
          dryRun: true,
        });

        if (res.data) {
          if (res.data.success) {
            setPreviewItems(res.data.preview || []);
            setValidationErrors([]);
            setImportResult(null);
            enqueueSnackbar(t("preview.validBadge"), { variant: "success" });
          } else {
            setValidationErrors(res.data.errors || []);
            setPreviewItems(null);
            setImportResult(null);
            enqueueSnackbar(t("errors.title"), { variant: "error" });
          }
        } else {
          enqueueSnackbar(t("alerts.parseError"), { variant: "error" });
        }
      } catch {
        enqueueSnackbar(t("alerts.parseError"), { variant: "error" });
      }
    });
  };

  // Handle Execute Import
  const handleExecuteImport = () => {
    if (!content.trim()) {
      enqueueSnackbar(t("alerts.emptyContent"), { variant: "warning" });
      return;
    }

    startTransition(async () => {
      try {
        const res = await postBulkImport({
          type: contentType,
          format,
          content: content.trim(),
          dryRun: false,
        });

        if (res.data && res.data.success) {
          setImportResult({
            success: true,
            importedCount: res.data.importedCount,
            type: contentType,
          });
          setValidationErrors([]);
          setPreviewItems(null);
          setContent("");
          enqueueSnackbar(t("alerts.importSuccess"), { variant: "success" });
        } else {
          const errs = res.data?.errors || [];
          setValidationErrors(errs);
          setImportResult(null);
          enqueueSnackbar(t("alerts.importFailed"), { variant: "error" });
        }
      } catch {
        enqueueSnackbar(t("alerts.importFailed"), { variant: "error" });
      }
    });
  };

  const getTargetManageUrl = (type: BulkImportType) => {
    if (type === "lessons") return "/admin-panel/lessons";
    if (type === "quiz-questions") return "/admin-panel/quiz-questions";
    return "/admin-panel/labs";
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="admin-bulk-import-title"
        >
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("description")}
        </p>
      </div>

      {/* Configuration Toolbar */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="import-type">{t("actions.selectType")}</Label>
            <Select
              value={contentType}
              onValueChange={(val: BulkImportType) => {
                setContentType(val);
                setPreviewItems(null);
                setValidationErrors([]);
                setImportResult(null);
              }}
            >
              <SelectTrigger id="import-type" data-testid="select-import-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lessons">{t("types.lessons")}</SelectItem>
                <SelectItem value="quiz-questions">{t("types.quizQuestions")}</SelectItem>
                <SelectItem value="labs">{t("types.labs")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="import-format">{t("actions.selectFormat")}</Label>
            <Select
              value={format}
              onValueChange={(val: BulkImportFormat) => {
                setFormat(val);
                setPreviewItems(null);
                setValidationErrors([]);
                setImportResult(null);
              }}
            >
              <SelectTrigger id="import-format" data-testid="select-import-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">{t("formats.json")}</SelectItem>
                <SelectItem value="markdown">{t("formats.markdown")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleLoadTemplate}
            data-testid="btn-load-template"
            className="flex items-center gap-2"
          >
            {format === "json" ? (
              <FileCode className="size-4" />
            ) : (
              <FileText className="size-4" />
            )}
            {t("actions.loadTemplate")}
          </Button>

          <div>
            <input
              type="file"
              id="file-upload"
              accept=".json,.md,.txt"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => document.getElementById("file-upload")?.click()}
              data-testid="btn-upload-file"
              className="w-full flex items-center gap-2"
            >
              <Upload className="size-4" />
              {t("actions.uploadFile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor & Action Area */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              {t("editor.label")}
            </CardTitle>
            <CardDescription className="text-xs">
              {format === "json"
                ? "Định dạng JSON mảng hoặc object bao bọc. Hỗ trợ song ngữ qua titleVi/titleEn."
                : "Định dạng Markdown tài liệu có frontmatter metadata và phân đoạn tiêu đề."}
            </CardDescription>
          </div>
          {content && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setContent("");
                setPreviewItems(null);
                setValidationErrors([]);
                setImportResult(null);
              }}
              data-testid="btn-clear-content"
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5 mr-1" />
              {t("actions.clear")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("editor.placeholder")}
            className="font-mono text-xs leading-relaxed"
            data-testid="textarea-bulk-content"
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !content.trim()}
              onClick={handleValidate}
              data-testid="btn-validate-import"
              className="flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Eye className="size-4" />
              )}
              {t("actions.validate")}
            </Button>

            <Button
              type="button"
              disabled={isPending || !content.trim()}
              onClick={handleExecuteImport}
              data-testid="btn-execute-import"
              className="flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {t("actions.import")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Result Card */}
      {importResult && (
        <Card
          className="border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
          data-testid="import-success-card"
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <CheckCircle2 className="size-6 text-emerald-600" />
            <div>
              <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">
                {t("results.successTitle")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("results.successMessage")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{t("results.importedCount")}:</span>
              <span
                className="font-bold text-emerald-600 text-base"
                data-testid="imported-count-badge"
              >
                {importResult.importedCount}
              </span>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href={getTargetManageUrl(importResult.type)}>
                {t("results.viewList")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Errors List */}
      {validationErrors.length > 0 && (
        <Card
          className="border-destructive bg-destructive/5"
          data-testid="import-errors-card"
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <AlertCircle className="size-6 text-destructive" />
            <div>
              <CardTitle className="text-lg text-destructive">
                {t("errors.title")} ({validationErrors.length})
              </CardTitle>
              <CardDescription className="text-sm">
                {t("errors.summary")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-testid="import-errors-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">{t("errors.columns.row")}</TableHead>
                  <TableHead className="w-48">{t("errors.columns.field")}</TableHead>
                  <TableHead>{t("errors.columns.message")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationErrors.map((err, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs font-semibold">
                      #{err.index} {err.identifier ? `(${err.identifier})` : ""}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {err.field || "-"}
                    </TableCell>
                    <TableCell className="text-destructive font-medium text-xs">
                      {err.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {previewItems && previewItems.length > 0 && (
        <Card data-testid="import-preview-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                {t("preview.title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("preview.totalItems")}: {previewItems.length}
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              {t("preview.validBadge")}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-testid="import-preview-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("preview.columns.index")}</TableHead>
                  <TableHead>{t("preview.columns.identifier")}</TableHead>
                  <TableHead>{t("preview.columns.details")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-xs">
                      {item.slug ||
                        item.questionTextVi ||
                        item.titleVi ||
                        `Item #${idx + 1}`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                      {item.titleEn ||
                        item.questionTextEn ||
                        item.expectedQuery ||
                        item.titleVi ||
                        "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default withPageRequiredAuth(AdminBulkImportContent, {
  roles: [RoleEnum.ADMIN],
});
