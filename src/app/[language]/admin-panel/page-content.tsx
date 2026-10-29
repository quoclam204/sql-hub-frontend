"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";
import Users from "lucide-react/dist/esm/icons/users";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

function AdminPanel() {
  const { t } = useTranslation("admin-panel-home");

  const adminSections = [
    {
      key: "users",
      href: "/admin-panel/users",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
      testId: "admin-card-users",
    },
    {
      key: "lessons",
      href: "/admin-panel/lessons",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10",
      testId: "admin-card-lessons",
    },
    {
      key: "quizzes",
      href: "/admin-panel/quiz-questions",
      icon: HelpCircle,
      color: "text-amber-500 bg-amber-500/10",
      testId: "admin-card-quizzes",
    },
    {
      key: "labs",
      href: "/admin-panel/labs",
      icon: FlaskConical,
      color: "text-purple-500 bg-purple-500/10",
      testId: "admin-card-labs",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-base">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Card
              key={sec.key}
              className="relative overflow-hidden transition-all hover:shadow-md border"
              data-testid={sec.testId}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${sec.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {t(`cards.${sec.key}.title`)}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <CardDescription className="text-sm">
                  {t(`cards.${sec.key}.description`)}
                </CardDescription>
                <Button asChild className="w-full gap-2">
                  <Link href={sec.href}>
                    {t(`cards.${sec.key}.action`)}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AdminPanel, { roles: [RoleEnum.ADMIN] });
