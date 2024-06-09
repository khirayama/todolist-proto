import { ParamsSheet } from "libs/components/ParamsSheet";

import { DatePicker } from "libs/components/DatePicker";
import { useCustomTranslation } from "libs/i18n";

export function DatePickerSheet(props: {
  value: string;
  open: (q?: Query) => boolean;
  handleChange: (val: string) => void;
  handleCancel: () => void;
}) {
  const { t } = useCustomTranslation("components.DatePickerSheet");

  return (
    <ParamsSheet open={props.open} title={t("Date Picker")}>
      <div className="px-12">
        <DatePicker
          autoFocus
          value={props.value}
          handleChange={props.handleChange}
          handleCancel={props.handleCancel}
        />
      </div>
    </ParamsSheet>
  );
}
