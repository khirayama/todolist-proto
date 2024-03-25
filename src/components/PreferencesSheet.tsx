import { Sheet } from "components/Sheet";

export function PreferencesSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange} title="設定">
      <div>Theme</div>
      <div>Lang</div>
      <div>Task Insert Position</div>
    </Sheet>
  );
}
