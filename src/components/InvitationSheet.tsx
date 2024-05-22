import { Sheet } from "libs/components/Sheet";
import { useCustomTranslation } from "libs/i18n";

export function InvitationSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useCustomTranslation("components.InvitationSheet");

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t("Invite")}
    >
      <div>Invite!</div>
    </Sheet>
  );
}
