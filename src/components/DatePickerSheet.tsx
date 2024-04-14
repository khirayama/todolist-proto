import { Sheet } from "libs/components/Sheet";
import { useTranslation } from "react-i18next";

export function DatePickerSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.DatePickerSheet.${key}`);

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Date Picker")}
    >
      <div>DatePicker</div>
    </Sheet>
  );
}
