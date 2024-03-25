import { Sheet } from "components/Sheet";

export function UserSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange} title="ログイン">
      <div>Log In</div>
      <div>Sign Up</div>
      <div>User Info</div>
      <div>Log Out</div>
    </Sheet>
  );
}
