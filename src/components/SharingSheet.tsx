import { ParamsSheet } from "libs/components/ParamsSheet";
import { useCustomTranslation } from "libs/i18n";
import { useTaskLists } from "hooks/useTaskLists";

export function SharingSheet(props: {
  open: (q?: Query) => boolean;
  taskList: TaskList;
}) {
  const { t } = useCustomTranslation("components.SharingSheet");
  const url = `${window?.location?.origin}/share?code=${props.taskList?.shareCode}`;
  const [, { refreshShareCode }] = useTaskLists();

  return (
    <ParamsSheet
      open={props.open}
      title={t("Share {{name}} list", {
        name: props.taskList?.name || "",
      })}
    >
      <div className="p-4">
        <button
          className="w-full border rounded p-2"
          onClick={() => {
            /* FYI: Only work under https or localhost */
            try {
              window.navigator.clipboard.writeText(url);
              window.alert(t("Copied to clipboard"));
            } catch (err) {
              window.alert(t("Need to run this under https or localhost"));
            }
          }}
        >
          {url}
        </button>
        <div className="py-2">
          <button
            className="w-full border rounded p-2"
            disabled={!window?.navigator?.share}
            onClick={async () => {
              try {
                await window.navigator.share({
                  title: t("Share {{name}} list", {
                    name: props.taskList?.name,
                  }),
                  text: t("Please join {{name}} list!", {
                    name: props.taskList?.name,
                  }),
                  url,
                });
              } catch (err) {
                window.alert(t("Need to run this under https or localhost"));
              }
            }}
          >
            {t("Share with other apps")}
          </button>
        </div>
        <div className="py-2">
          <button
            className="w-full border rounded p-2"
            onClick={(e) => {
              e.preventDefault();
              refreshShareCode(props.taskList.id);
            }}
          >
            {t("Refresh share code")}
          </button>
        </div>
      </div>
    </ParamsSheet>
  );
}
