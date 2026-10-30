"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import {
  LearningLessonResponse,
  useGetLearningLessonService,
} from "@/services/api/services/learning-content";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LearningLessonPage() {
  const params = useParams();
  const { t } = useTranslation("learning-content");
  const fetchLesson = useGetLearningLessonService();
  const [content, setContent] = useState<LearningLessonResponse | null>(null);
  const [error, setError] = useState(false);

  const language = params.language === "vi" ? "vi" : "en";
  const courseSlug = String(params.slug);
  const lessonSlug = String(params.lessonSlug);

  useEffect(() => {
    let active = true;
    setError(false);
    fetchLesson(courseSlug, lessonSlug, language)
      .then((response) => {
        if (!active) return;
        if (response.status === HTTP_CODES_ENUM.OK && response.data) {
          setContent(response.data);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [courseSlug, fetchLesson, language, lessonSlug]);

  if (error) {
    return <p className="p-6">{t("error")}</p>;
  }

  if (!content) {
    return <p className="p-6">{t("loading")}</p>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <header>
        <p className="text-sm text-muted-foreground">{content.course.title}</p>
        <h1 className="text-3xl font-semibold">{content.lesson.title}</h1>
      </header>

      <Card>
        <CardContent className="prose max-w-none py-6 dark:prose-invert">
          <pre className="whitespace-pre-wrap">{content.lesson.contentMd}</pre>
        </CardContent>
      </Card>

      {content.quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {quiz.questions.map((question) => (
              <section key={question.id} className="space-y-2">
                <h2 className="font-medium">{question.questionText}</h2>
                <ul className="list-disc space-y-1 pl-5">
                  {question.options.map((option) => (
                    <li key={option.id}>{option.optionText}</li>
                  ))}
                </ul>
                {question.explanation && (
                  <p className="text-sm text-muted-foreground">
                    {question.explanation}
                  </p>
                )}
              </section>
            ))}
          </CardContent>
        </Card>
      ))}

      {content.labs.map((lab) => (
        <Card key={lab.id}>
          <CardHeader>
            <CardTitle>{lab.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{lab.description}</p>
            {lab.hint && (
              <p className="text-sm text-muted-foreground">{lab.hint}</p>
            )}
            {lab.dataset && (
              <p className="text-sm text-muted-foreground">
                {lab.dataset.name}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </main>
  );
}

export default withPageRequiredAuth(LearningLessonPage);
