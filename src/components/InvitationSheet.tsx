import { Sheet } from "components/Sheet";

export function InvitationSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange} title="招待">
      <div>Invite!</div>
    </Sheet>
  );
}
