import { Sheet } from "libs/components/Sheet";
import { useCustomTranslation } from "libs/i18n";

export function SharingSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskList: TaskList;
}) {
  const { t } = useCustomTranslation("components.SharingSheet");
  const url = `${window?.location?.origin}/share?code=${props.taskList?.shareCode}`;

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t("Share")}
    >
      <div>Share {props.taskList?.name}</div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          window.alert("Copied to clipboard!");
        }}
      >
        {url}
      </button>
      <button
        disabled={!navigator.share}
        onClick={async () => {
          try {
            await window.navigator.share({
              title: `Share ${props.taskList.name} list!`,
              text: `Please join ${props.taskList?.name} list!`,
              url,
            });
          } catch (err) {
            window.alert(err);
          }
        }}
      >
        Share API
      </button>
    </Sheet>
  );
}
