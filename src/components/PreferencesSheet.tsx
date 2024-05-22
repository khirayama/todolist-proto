import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import { Sheet } from "libs/components/Sheet";
import { useCustomTranslation } from "libs/i18n";

export function PreferencesSheet(props: {
  preferences: Preferences;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlePreferencesChange: (updatedPreferences: Partial<Preferences>) => void;
}) {
  const { t, i18n } = useCustomTranslation("components.PreferencesSheet");
  const supportedLngs = Object.keys(i18n.options.resources).map((lang) =>
    lang.toUpperCase()
  );
  const themes = ["SYSTEM", "LIGHT", "DARK"];
  const lang = props.preferences.lang.toLowerCase();

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t("Preferences")}
    >
      <div className="flex p-4">
        <div className="flex-1">{t("Appearance")}</div>
        <Select.Root
          value={props.preferences.theme}
          onValueChange={(v: Preferences["theme"]) => {
            props.handlePreferencesChange({
              theme: v,
            });
          }}
        >
          <Select.Trigger className="p-2 border rounded inline-flex items-center">
            <Select.Value aria-label={t(props.preferences.theme)}>
              {t(props.preferences.theme)}
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
                    <Select.ItemText>{t(theme)}</Select.ItemText>
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
        <div className="flex-1">{t("Language")}</div>
        <Select.Root
          value={lang}
          onValueChange={(v: Preferences["lang"]) => {
            props.handlePreferencesChange({
              lang: v,
            });
          }}
        >
          <Select.Trigger className="p-2 border rounded inline-flex items-center">
            <Select.Value aria-label={t(props.preferences.lang)}>
              {t(props.preferences.lang)}
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
                    <Select.ItemText>{t(ln)}</Select.ItemText>
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
