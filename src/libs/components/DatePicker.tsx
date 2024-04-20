import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

export function DatePicker(props: {
  value: string;
  autoFocus?: boolean;
  handleChange: (val: string) => void;
  handleCancel: () => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`libs.components.DatePicker.${key}`);

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

  const numOfMonths = 3;
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
        e.preventDefault();
        const key = e.key;
        if (key === "ArrowDown") {
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
          if (val) {
            setVal(format(addDays(val, -1), "yyyy-MM-dd"));
          } else {
            setVal(format(startOfMonth(refDate), "yyyy-MM-dd"));
          }
        } else if (key === "ArrowRight") {
          if (val) {
            setVal(format(addDays(val, 1), "yyyy-MM-dd"));
          } else {
            setVal(format(startOfMonth(refDate), "yyyy-MM-dd"));
          }
        } else if (key === "Enter") {
          props.handleChange(val);
        } else if (key === "Escape") {
          setVal(props.value);
        } else if (key === "Backspace" || key === "Delete") {
          setVal("");
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
                    {tr("Reset")}
                  </button>
                  <button
                    className="pl-4 pr-3"
                    onClick={() => {
                      setVal(props.value);
                      props.handleCancel();
                    }}
                  >
                    {tr("Cancel")}
                  </button>
                </div>
              </th>
            </tr>
            <tr>
              <th className="p-2 pb-4">{tr("Sunday")}</th>
              <th className="p-2 pb-4">{tr("Monday")}</th>
              <th className="p-2 pb-4">{tr("Tuesday")}</th>
              <th className="p-2 pb-4">{tr("Wednesday")}</th>
              <th className="p-2 pb-4">{tr("Thursday")}</th>
              <th className="p-2 pb-4">{tr("Friday")}</th>
              <th className="p-2 pb-4">{tr("Saturday")}</th>
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
