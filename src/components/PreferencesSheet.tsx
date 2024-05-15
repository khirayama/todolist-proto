import { useTranslation } from "react-i18next";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import { Sheet } from "libs/components/Sheet";

export function PreferencesSheet(props: {
  preferences: Preferences;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlePreferencesChange: (updatedPreferences: Partial<Preferences>) => void;
}) {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`components.PreferencesSheet.${key}`);
  const supportedLngs = Object.keys(i18n.options.resources).map((lang) =>
    lang.toUpperCase()
  );
  const themes = ["SYSTEM", "LIGHT", "DARK"];
  const lang = props.preferences.lang.toLowerCase();

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
          <Select.Trigger className="p-2 border rounded inline-flex items-center">
            <Select.Value aria-label={tr(props.preferences.theme)}>
              {tr(props.preferences.theme)}
            </Select.Value>
            <Select.Icon className="pl-2">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[500] bg-white p-2 rounded border shadow">
              <Select.Viewport>
                {themes.map((theme) => (
                  <Select.Item
                    key={theme}
                    value={theme}
                    className="p-2 flex items-center"
                  >
                    <Select.ItemText>{tr(theme)}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon />
                    </Select.ItemIndicator>
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
          value={lang}
          onValueChange={(v: Preferences["lang"]) => {
            props.handlePreferencesChange({
              lang: v,
            });
            i18n.changeLanguage(v);
          }}
        >
          <Select.Trigger className="p-2 border rounded inline-flex items-center">
            <Select.Value aria-label={tr(props.preferences.lang)}>
              {tr(props.preferences.lang)}
            </Select.Value>
            <Select.Icon className="pl-2">
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[500] bg-white p-2 rounded border shadow">
              <Select.Viewport>
                {supportedLngs.map((ln) => (
                  <Select.Item
                    key={ln}
                    value={ln}
                    className="p-2 flex items-center"
                  >
                    <Select.ItemText>{tr(ln)}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon />
                    </Select.ItemIndicator>
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
