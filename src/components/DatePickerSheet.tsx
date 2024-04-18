import { Sheet } from "libs/components/Sheet";
import { useTranslation } from "react-i18next";

import { DatePicker } from "libs/components/DatePicker";

export function DatePickerSheet(props: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleChange: (val: string) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.DatePickerSheet.${key}`);

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Date Picker")}
    >
      <div className="px-12">
        <DatePicker
          autoFocus
          value={props.task.date}
          handleChange={props.handleChange}
        />
      </div>
    </Sheet>
  );
}
