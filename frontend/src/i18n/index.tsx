"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "./en.json";
import ar from "./ar.json";

type Locale = "en" | "ar";
type TranslationMap = typeof en;

const translations: Record<Locale, TranslationMap> = { en, ar };

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    dir: "ltr" | "rtl";
    isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({
    locale: "en",
    setLocale: () => { },
    t: (key) => key,
    dir: "ltr",
    isRTL: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        // Load saved preference
        const saved = localStorage.getItem("pathwise_locale") as Locale;
        if (saved && (saved === "en" || saved === "ar")) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("pathwise_locale", newLocale);

        // Update document direction
        document.documentElement.setAttribute("dir", newLocale === "ar" ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", newLocale);
    };

    // Apply direction on mount
    useEffect(() => {
        document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", locale);
    }, [locale]);

    const t = (key: string, params?: Record<string, string | number>): string => {
        // key format: "section.key" e.g. "nav.dashboard"
        const parts = key.split(".");
        let value: any = translations[locale];

        for (const part of parts) {
            if (value && typeof value === "object" && part in value) {
                value = value[part];
            } else {
                // Fallback to English
                let fallback: any = translations.en;
                for (const p of parts) {
                    fallback = fallback?.[p];
                }
                value = fallback || key;
                break;
            }
        }

        if (typeof value !== "string") return key;

        // Replace template params: {{name}} → actual value
        if (params) {
            return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
                return String(params[paramKey] ?? `{{${paramKey}}}`);
            });
        }

        return value;
    };

    const isRTL = locale === "ar";
    const dir = isRTL ? "rtl" : "ltr";

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, dir, isRTL }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}

export function useTranslation() {
    const { t } = useContext(I18nContext);
    return { t };
}
