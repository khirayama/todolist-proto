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
  isBefore,
  isAfter,
} from "date-fns";
import clsx from "clsx";

import { useCustomTranslation } from "libs/i18n";

export function DatePicker(props: {
  value: string;
  autoFocus?: boolean;
  handleChange: (val: string) => void;
  handleCancel: () => void;
}) {
  const { t } = useCustomTranslation("libs.components.DatePicker");

  const refDate = new Date();
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState<string>(props.value);

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

  const numOfMonths = 24;
  const months = [];
  for (let i = 0; i < numOfMonths; i += 1) {
    months.push(i);
  }
  const headDate = startOfMonth(refDate);
  const lastDate = endOfMonth(addMonths(refDate, numOfMonths - 1));

  useEffect(() => {
    if (props.autoFocus) {
      ref.current.focus();
    }
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      className="w-full max-w-[420px] mx-auto relative"
      onKeyDown={(e) => {
        const key = e.key;
        if (key === "ArrowDown") {
          e.preventDefault();
          if (val) {
            const d = addDays(val, 7);
            if (isAfter(d, lastDate)) {
              setVal("");
            } else {
              setVal(format(d, "yyyy-MM-dd"));
            }
          } else {
            setVal(format(headDate, "yyyy-MM-dd"));
          }
        } else if (key === "ArrowUp") {
          e.preventDefault();
          if (val) {
            const d = addDays(val, -7);
            if (isBefore(d, headDate)) {
              setVal("");
            } else {
              setVal(format(d, "yyyy-MM-dd"));
            }
          } else {
            setVal(format(lastDate, "yyyy-MM-dd"));
          }
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          if (val) {
            setVal(format(addDays(val, -1), "yyyy-MM-dd"));
          } else {
            setVal(format(startOfMonth(refDate), "yyyy-MM-dd"));
          }
        } else if (key === "ArrowRight") {
          e.preventDefault();
          if (val) {
            setVal(format(addDays(val, 1), "yyyy-MM-dd"));
          } else {
            setVal(format(startOfMonth(refDate), "yyyy-MM-dd"));
          }
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
              <th className="p-2 pb-4">{t("Sunday")}</th>
              <th className="p-2 pb-4">{t("Monday")}</th>
              <th className="p-2 pb-4">{t("Tuesday")}</th>
              <th className="p-2 pb-4">{t("Wednesday")}</th>
              <th className="p-2 pb-4">{t("Thursday")}</th>
              <th className="p-2 pb-4">{t("Friday")}</th>
              <th className="p-2 pb-4">{t("Saturday")}</th>
            </tr>
          </thead>
          {months.map((d) => {
            const r = addMonths(refDate, d);
            const cal = getCal(r);
            return (
              <tbody key={d.toString()}>
                <tr>
                  <td className="px-4 pt-8 pb-2 font-bold" colSpan={7}>
                    <div>{format(r, "yyyy/MM")}</div>
                  </td>
                </tr>
                {cal.map((week) => (
                  <tr key={week.toString()}>
                    {week.map((day) => (
                      <td
                        key={day.toString()}
                        className="text-center p-2 cursor-pointer"
                        onClick={() => handleDateClick(day)}
                      >
                        {day.getMonth() === r.getMonth() && (
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
            );
          })}
        </table>
      </div>
    </div>
  );
}
