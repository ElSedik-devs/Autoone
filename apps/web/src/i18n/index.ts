import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en/common.json";
import de from "../locales/de/common.json";
import ar from "../locales/ar/common.json";

const saved = localStorage.getItem("lang") || "en";

function applyDir(lng: string) {
  const isRTL = lng.startsWith("ar");
  const el = document.documentElement;
  el.dir = isRTL ? "rtl" : "ltr";
  el.classList.toggle("rtl", isRTL);
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      de: { common: de },
      ar: { common: ar },
    },
    lng: saved,
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });

// apply once on init
applyDir(saved);

// keep dir + localStorage in sync when language changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  applyDir(lng);
});

export default i18n;
