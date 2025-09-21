import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("ar") ? "ar" :
                  i18n.language?.startsWith("de") ? "de" : "en";
  const [value, setValue] = useState<"en" | "de" | "ar">(current);

  useEffect(() => {
    setValue(current);
    // i18n/index.ts already applies dir/localStorage on languageChanged
  }, [current]);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lng = e.target.value as "en" | "de" | "ar";
    setValue(lng);
    i18n.changeLanguage(lng);
  }

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Language</span>
      <select
        className="border rounded px-3 py-1.5 bg-white"
        value={value}
        onChange={onChange}
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="ar">العربية</option>
      </select>
    </label>
  );
}
