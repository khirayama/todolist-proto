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
          /* FYI: Only work under https or localhost */
          try {
            window.navigator.clipboard.writeText(url);
            window.alert("Copied to clipboard!");
          } catch (err) {
            window.alert("Need to run this under https or localhost");
          }
        }}
      >
        {url}
      </button>
      <button
        disabled={!window?.navigator?.share}
        onClick={async () => {
          try {
            /* FYI: Only work under https or localhost */
            await window.navigator.share({
              title: `Share ${props.taskList.name} list!`,
              text: `Please join ${props.taskList?.name} list!`,
              url,
            });
          } catch (err) {
            window.alert("Need to run this under https or localhost");
          }
        }}
      >
        Share API
      </button>
    </Sheet>
  );
}
