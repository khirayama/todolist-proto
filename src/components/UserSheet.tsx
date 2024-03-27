import { Sheet } from "components/Sheet";
import { useTranslation } from "react-i18next";

export function UserSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.UserSheet.${key}`);

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Log In")}
    >
      <div>Log In</div>
      <div>Sign Up</div>
      <div>User Info</div>
      <div>Log Out</div>
    </Sheet>
  );
}
