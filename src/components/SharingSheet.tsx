import { Sheet } from "libs/components/Sheet";
import { useCustomTranslation } from "libs/i18n";

export function SharingSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useCustomTranslation("components.SharingSheet");

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t("Share")}
    >
      <div>Share!</div>
    </Sheet>
  );
}
