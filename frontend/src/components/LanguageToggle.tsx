"use client";

import { useI18n } from "@/i18n";
import { Globe } from "lucide-react";

/**
 * Language toggle button — switches between English and Arabic.
 * Can be placed in the sidebar, settings, or navbar.
 */
export default function LanguageToggle() {
    const { locale, setLocale, isRTL } = useI18n();

    return (
        <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            title={locale === "en" ? "التبديل إلى العربية" : "Switch to English"}
        >
            <Globe className="w-4 h-4" />
            <span>{locale === "en" ? "عربي" : "EN"}</span>
        </button>
    );
}
