"use client";

import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { cookieName } from "@/services/i18n/config";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { useAuthPatchMeService } from "@/services/api/services/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
  { code: "uk", label: "Українська" },
  { code: "zh", label: "中文" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { setUser } = useAuthActions();
  const fetchAuthPatchMe = useAuthPatchMeService();

  const currentLang = pathname?.split("/")[1] || "en";

  const handleChange = (newLang: string) => {
    // 1. Remember choice in cookie
    Cookies.set(cookieName, newLang, { path: "/" });

    // 2. If logged in and locale differs, update user profile in backend
    if (user && user.locale !== newLang) {
      fetchAuthPatchMe({ locale: newLang })
        .then(({ data, status }) => {
          if (status === 200 && data) {
            setUser(data);
          }
        })
        .catch(() => {
          // Non-blocking
        });
    }

    // 3. Navigate to target URL preserving path, search query, and hash
    if (!pathname) {
      window.location.assign(`/${newLang}`);
      return;
    }

    const pathSegments = pathname.split("/");
    pathSegments[1] = newLang;
    const newPath = pathSegments.join("/");
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    window.location.assign(`${newPath}${search}${hash}`);
  };

  return (
    <Select value={currentLang} onValueChange={handleChange}>
      <SelectTrigger
        size="sm"
        className="min-w-[120px]"
        data-testid="language-switcher"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            data-testid={`language-option-${lang.code}`}
          >
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
