import qs from "query-string";

import { ParamsSheet } from "libs/components/ParamsSheet";
import { DatePicker } from "libs/components/DatePicker";
import { useCustomTranslation } from "libs/i18n";
import { useTasks } from "hooks/useTasks";

export function DatePickerSheet(props: {
  open: (q?: Query) => boolean;
  handleChange: (val?: string) => void;
  handleCancel: () => void;
}) {
  const taskId = qs.parse(window.location.search).taskid as string;
  const { t } = useCustomTranslation("components.DatePickerSheet");
  const [, { updateTask }, { getTasksById }] = useTasks("/api/tasks");
  const task = getTasksById([taskId])[0];

  return (
    <ParamsSheet open={props.open} title={t("Date Picker")}>
      <div className="px-4">
        <DatePicker
          autoFocus
          value={task?.date || ""}
          handleChange={(v) => {
            updateTask({
              ...task,
              date: v,
            });
            props.handleChange();
          }}
          handleCancel={props.handleCancel}
        />
      </div>
    </ParamsSheet>
  );
}
