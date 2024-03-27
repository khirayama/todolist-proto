import { useTranslation } from "react-i18next";

import { Sheet } from "components/Sheet";

export function InvitationSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {

  const { t } = useTranslation();
  const tr = (key: string) => t(`components.InvitationSheet.${key}`);

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange} title={tr("Invite")}>
      <div>Invite!</div>
    </Sheet>
  );
}
