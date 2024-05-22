import { Sheet } from "libs/components/Sheet";

import { DatePicker } from "libs/components/DatePicker";
import { useCustomTranslation } from "libs/i18n";

export function DatePickerSheet(props: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleChange: (val: string) => void;
  handleCancel: () => void;
}) {
  const { t } = useCustomTranslation("components.DatePickerSheet");

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t("Date Picker")}
    >
      <div className="px-12">
        <DatePicker
          autoFocus
          value={props.value}
          handleChange={props.handleChange}
          handleCancel={props.handleCancel}
        />
      </div>
    </Sheet>
  );
}
