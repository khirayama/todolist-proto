import { useTranslation } from "react-i18next";

import { Sheet } from "libs/components/Sheet";

export function PreferencesSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handlePreferencesChange: (updatedPreferences: Partial<Preferences>) => void;
}) {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`components.PreferencesSheet.${key}`);

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Preferences")}
    >
      <div>Theme</div>
      <div>
        <button
          onClick={() => {
            if (i18n.resolvedLanguage === "en") {
              i18n.changeLanguage("ja");
            } else {
              i18n.changeLanguage("en");
            }
            props.handlePreferencesChange({
              lang: i18n.resolvedLanguage,
            });
          }}
        >
          Lang Toggle
        </button>
      </div>
      <div>Task Insert Position</div>
    </Sheet>
  );
}
