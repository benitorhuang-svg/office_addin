/**
 * Molecule Service: i18n
 * Logic for managing display language and string lookups.
 */
import { Language, LocaleKey, LOCALES } from "../atoms/locales";

interface OfficeDisplayContext {
    displayLanguage?: string;
}

declare const Office: {
    context?: OfficeDisplayContext;
};

export class I18nManager {
    private static current: Language = 'en';

    /**
     * Initializes language detection from Office context.
     */
    public static init() {
        if (typeof Office !== 'undefined' && Office.context?.displayLanguage) {
            const lang = Office.context.displayLanguage.toLowerCase();
            if (lang.includes('zh') || lang.includes('cht') || lang.includes('chs')) {
              this.current = 'zh';
            } else {
              this.current = 'en';
            }
        }
    }

    /**
     * Translates a key based on current language.
     */
    public static t(key: LocaleKey): string {
        return LOCALES[this.current][key] || (key as string);
    }

    public static setLanguage(lang: Language) {
        this.current = lang;
    }

    public static getLanguage(): Language {
        return this.current;
    }
}

// Initial detection pass
I18nManager.init();

/**
 * Shorthand exported for easier global usage.
 */
export const NexusI18n = {
    t: (key: LocaleKey) => I18nManager.t(key),
    setLanguage: (lang: Language) => I18nManager.setLanguage(lang),
    getLanguage: () => I18nManager.getLanguage()
};
