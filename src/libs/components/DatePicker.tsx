import { useState, useRef, useEffect } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
} from "date-fns";
import clsx from "clsx";

import { useCustomTranslation } from "libs/i18n";
import { Icon } from "libs/components/Icon";

export function DatePicker(props: {
  value: string;
  autoFocus?: boolean;
  handleChange: (val: string) => void;
  handleCancel: () => void;
}) {
  const { t } = useCustomTranslation("libs.components.DatePicker");

  const ref = useRef<HTMLTableSectionElement>(null);
  const [val, setVal] = useState<string>(props.value);
  const [refDate, setRefDate] = useState<Date>(
    props.value ? new Date(props.value) : new Date()
  );

  const handleDateClick = (d: Date) => {
    const v = format(d, "yyyy-MM-dd");
    setVal(v);
    props.handleChange(v);
  };

  const getCal = (date: Date) => {
    const sundays = eachWeekOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });
    return sundays.map((sunday) => {
      return eachDayOfInterval({
        start: sunday,
        end: endOfWeek(sunday),
      });
    });
  };

  const cal = getCal(refDate);
  const headDate = startOfMonth(refDate);
  const lastDate = endOfMonth(addMonths(refDate, 0));

  useEffect(() => {
    if (props.autoFocus) {
      ref.current.focus();
    }
  }, []);

  return (
    <div>
      <div>
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th colSpan={7} className="p-2">
                <div className="flex">
                  <span className="flex-1 text-left">{val}</span>
                  <button
                    className="px-4"
                    onClick={() => {
                      setVal("");
                      props.handleChange("");
                    }}
                  >
                    {t("Reset")}
                  </button>
                  <button
                    className="pl-4 pr-3"
                    onClick={() => {
                      setVal(props.value);
                      props.handleCancel();
                    }}
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </th>
            </tr>
            <tr>
              <td colSpan={7}>
                <div className="flex px-4 pt-8 pb-2 font-bold text-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRefDate(addMonths(refDate, -1));
                    }}
                  >
                    <Icon text="arrow_left" />
                  </button>
                  <div className="flex-1">{format(refDate, "yyyy/MM")}</div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRefDate(addMonths(refDate, 1));
                    }}
                  >
                    <Icon text="arrow_right" />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <th className="p-2 pb-4">{t("Sunday")}</th>
              <th className="p-2 pb-4">{t("Monday")}</th>
              <th className="p-2 pb-4">{t("Tuesday")}</th>
              <th className="p-2 pb-4">{t("Wednesday")}</th>
              <th className="p-2 pb-4">{t("Thursday")}</th>
              <th className="p-2 pb-4">{t("Friday")}</th>
              <th className="p-2 pb-4">{t("Saturday")}</th>
            </tr>
          </thead>
          <tbody
            ref={ref}
            tabIndex={0}
            className="w-full max-w-[420px] mx-auto relative"
            onKeyDown={(e) => {
              const key = e.key;
              if (key === "ArrowDown") {
                e.preventDefault();
                const d = val ? addDays(val, 7) : headDate;
                setVal(format(d, "yyyy-MM-dd"));
                setRefDate(d);
              } else if (key === "ArrowUp") {
                e.preventDefault();
                const d = val ? addDays(val, -7) : lastDate;
                setVal(format(d, "yyyy-MM-dd"));
                setRefDate(d);
              } else if (key === "ArrowLeft") {
                e.preventDefault();
                const d = val ? addDays(val, -1) : startOfMonth(refDate);
                setVal(format(d, "yyyy-MM-dd"));
                setRefDate(d);
              } else if (key === "ArrowRight") {
                e.preventDefault();
                const d = val ? addDays(val, 1) : startOfMonth(refDate);
                setVal(format(d, "yyyy-MM-dd"));
                setRefDate(d);
              } else if (key === "Enter") {
                e.preventDefault();
                props.handleChange(val);
              } else if (key === "Backspace" || key === "Delete") {
                e.preventDefault();
                setVal("");
              } else if (key === "Escape") {
                /* FYI: No calling e.preventDefault */
                setVal(props.value);
              }
            }}
          >
            {cal.map((week) => (
              <tr key={week.toString()}>
                {week.map((day) => (
                  <td
                    key={day.toString()}
                    className="text-center p-2 cursor-pointer"
                    onClick={() => handleDateClick(day)}
                  >
                    {day.getMonth() === refDate.getMonth() && (
                      <div
                        className={clsx(
                          "flex p-4 rounded-full w-8 h-8 items-center justify-center",
                          val === format(day, "yyyy-MM-dd") &&
                            "text-white bg-gray-600"
                        )}
                      >
                        <span>{day.getDate()}</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
