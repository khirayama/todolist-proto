import { useState, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import * as Select from "@radix-ui/react-select";

import { Sheet } from "libs/components/Sheet";

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
        <Select.Root
          value={props.preferences.theme}
          onValueChange={(v: Preferences["theme"]) => {
            props.handlePreferencesChange({
              theme: v,
            });
          }}
        >
          <Select.Trigger className="px-4 py-2">
            <Select.Value aria-label={tr(props.preferences.theme)}>
              {tr(props.preferences.theme)}
            </Select.Value>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[500] bg-white text-right p-2 rounded border">
              <Select.Viewport>
                {themes.map((theme) => (
                  <Select.Item value={theme} className="p-2">
                    <Select.ItemText>{tr(theme)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
      <div className="flex p-4">
        <div className="flex-1">{tr("Language")}</div>
        <Select.Root
          value={props.preferences.theme}
          onValueChange={(v: string) => {
            i18n.changeLanguage(v);
            props.handlePreferencesChange({
              lang: i18n.resolvedLanguage,
            });
          }}
        >
          <Select.Trigger className="px-4 py-2">
            <Select.Value aria-label={tr(props.preferences.lang)}>
              {tr(props.preferences.lang)}
            </Select.Value>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[500] bg-white text-right p-2 rounded border">
              <Select.Viewport>
                {supportedLngs.map((lang) => (
                  <Select.Item value={lang} className="p-2">
                    <Select.ItemText>{tr(lang)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </Sheet>
  );
}
