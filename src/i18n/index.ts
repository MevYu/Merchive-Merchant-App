import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Taro from '@tarojs/taro';
import zhCNCommon from './locales/zh-CN/common.json';
import zhCNPages from './locales/zh-CN/pages.json';
import zhCNErrors from './locales/zh-CN/errors.json';
import enUSCommon from './locales/en-US/common.json';
import enUSPages from './locales/en-US/pages.json';
import enUSErrors from './locales/en-US/errors.json';
import jaJPCommon from './locales/ja-JP/common.json';
import jaJPPages from './locales/ja-JP/pages.json';
import jaJPErrors from './locales/ja-JP/errors.json';

// SUPPORTED mirrors miniapp's i18n closed-set: zh-CN / en-US / ja-JP.
// Namespaces (common / pages / errors) are also identical so a future
// sdk-ts can share key conventions.
export const SUPPORTED = ['zh-CN', 'en-US', 'ja-JP'] as const;
export type LangCode = (typeof SUPPORTED)[number];

export const DEFAULT_LANG: LangCode = 'zh-CN';

// Per-app storage key so a device hosting both apps doesn't cross-talk.
export const LANG_STORAGE_KEY = 'ce-merchant-lang';

const resources = {
  'zh-CN': { common: zhCNCommon, pages: zhCNPages, errors: zhCNErrors },
  'en-US': { common: enUSCommon, pages: enUSPages, errors: enUSErrors },
  'ja-JP': { common: jaJPCommon, pages: jaJPPages, errors: jaJPErrors },
};

export function normalizeLang(raw: string | undefined): LangCode {
  if (!raw) return DEFAULT_LANG;
  const v = raw.replace('_', '-').toLowerCase();
  if (v.startsWith('en')) return 'en-US';
  if (v.startsWith('ja')) return 'ja-JP';
  if (v.startsWith('zh')) return 'zh-CN';
  return DEFAULT_LANG;
}

function detectInitialLang(): LangCode {
  try {
    const stored = Taro.getStorageSync(LANG_STORAGE_KEY) as string | undefined;
    if (stored && (SUPPORTED as readonly string[]).includes(stored)) {
      return stored as LangCode;
    }
  } catch {
    // some RN bridges throw on getStorageSync before init — fall through.
  }
  try {
    const info = Taro.getSystemInfoSync();
    return normalizeLang(info.language);
  } catch {
    return DEFAULT_LANG;
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLang(),
  fallbackLng: DEFAULT_LANG,
  supportedLngs: SUPPORTED as unknown as string[],
  ns: ['common', 'pages', 'errors'],
  defaultNS: 'common',
  interpolation: {
    // React already escapes — double-escape would break Taro <Text/>.
    escapeValue: false,
  },
});

export function changeLang(lang: LangCode): Promise<void> {
  try {
    Taro.setStorageSync(LANG_STORAGE_KEY, lang);
  } catch {
    // best-effort
  }
  return i18n.changeLanguage(lang).then(() => undefined);
}

export default i18n;
