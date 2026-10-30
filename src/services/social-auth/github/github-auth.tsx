"use client";

import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/full-page-loader";
import { useAuthGithubLoginService } from "@/services/api/services/auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { useTranslation } from "@/services/i18n/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const GITHUB_OAUTH_MESSAGE_TYPE = "sqlhub:github-oauth";
const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 660;
const POPUP_POLL_INTERVAL_MS = 500;

type GithubOAuthMessage = {
  type: typeof GITHUB_OAUTH_MESSAGE_TYPE;
  accessToken?: string;
  error?: string;
};

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className="size-4"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function GithubAuth() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const authGithubLoginService = useAuthGithubLoginService();
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const popupWatcherRef = useRef<number | null>(null);

  const stopPopupWatcher = useCallback(() => {
    if (popupWatcherRef.current !== null) {
      window.clearInterval(popupWatcherRef.current);
      popupWatcherRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<GithubOAuthMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GITHUB_OAUTH_MESSAGE_TYPE) return;

      stopPopupWatcher();
      popupRef.current?.close();
      popupRef.current = null;

      if (!event.data.accessToken) {
        toast.error(t("common:auth.github.errors.failed"));
        return;
      }

      setIsLoading(true);

      try {
        const { status, data } = await authGithubLoginService({
          accessToken: event.data.accessToken,
        });

        if (status === HTTP_CODES_ENUM.OK) {
          setTokensInfo({
            token: data.token,
            refreshToken: data.refreshToken,
            tokenExpires: data.tokenExpires,
          });
          setUser(data.user);
        } else {
          toast.error(t("common:auth.github.errors.failed"));
        }
      } catch {
        toast.error(t("common:auth.github.errors.failed"));
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [authGithubLoginService, setTokensInfo, setUser, stopPopupWatcher, t]);

  useEffect(
    () => () => {
      stopPopupWatcher();
      popupRef.current?.close();
    },
    [stopPopupWatcher]
  );

  const onLogin = () => {
    const popup = window.open(
      "/api/auth/github/authorize",
      "sqlhub-github-oauth",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      toast.error(t("common:auth.github.errors.popupBlocked"));
      return;
    }

    popupRef.current = popup;
    stopPopupWatcher();
    popupWatcherRef.current = window.setInterval(() => {
      if (popup.closed) {
        stopPopupWatcher();
        popupRef.current = null;
      }
    }, POPUP_POLL_INTERVAL_MS);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onLogin}
        data-testid="github-login"
      >
        <GithubIcon />
        {t("common:auth.github.action")}
      </Button>
      <FullPageLoader isLoading={isLoading} />
    </>
  );
}
