import { useTranslation } from "react-i18next";

import { Sheet } from "libs/components/Sheet";
import { ChangeEvent } from "react";

export function PreferencesSheet(props: {
  preferences: Preferences;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlePreferencesChange: (updatedPreferences: Partial<Preferences>) => void;
}) {
  const { t, i18n } = useTranslation();
  const supportedLngs = Object.keys(i18n.options.resources);
  const themes = ["system", "light", "dark"];
  const tr = (key: string) => t(`components.PreferencesSheet.${key}`);

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Preferences")}
    >
      <div className="flex p-4">
        <div className="flex-1">{tr("Appearance")}</div>
        <select
          className="text-right"
          value={props.preferences.theme}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            props.handlePreferencesChange({
              theme: e.target.value as Preferences["theme"],
            });
          }}
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {tr(theme)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex p-4">
        <div className="flex-1">{tr("Language")}</div>
        <select
          className="text-right"
          value={props.preferences.lang}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            i18n.changeLanguage(e.target.value);
            props.handlePreferencesChange({
              lang: i18n.resolvedLanguage,
            });
          }}
        >
          {supportedLngs.map((lang) => (
            <option key={lang} value={lang}>
              {tr(lang)}
            </option>
          ))}
        </select>
      </div>
    </Sheet>
  );
}
