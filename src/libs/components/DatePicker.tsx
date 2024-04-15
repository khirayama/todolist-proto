import { useState } from "react";
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
} from "date-fns";
import clsx from "clsx";

export function DatePicker() {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.DatePicker.${key}`);

  const refDate = new Date();
  const [val, setVal] = useState<string>(format(refDate, "yyyy-MM-dd"));

  const handleDateClick = (d: Date) => {
    setVal(format(d, "yyyy-MM-dd"));
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

  const months = [];
  for (let i = 0; i < 24; i += 1) {
    months.push(i);
  }

  return (
    <div
      tabIndex={0}
      className="w-full max-w-[420px] mx-auto relative"
      onKeyDown={(e) => {
        e.preventDefault();
        const key = e.key;
        if (key === "ArrowDown") {
          setVal(format(addDays(val, 7), "yyyy-MM-dd"));
        } else if (key === "ArrowUp") {
          setVal(format(addDays(val, -7), "yyyy-MM-dd"));
        } else if (key === "ArrowLeft") {
          setVal(format(addDays(val, -1), "yyyy-MM-dd"));
        } else if (key === "ArrowRight") {
          setVal(format(addDays(val, 1), "yyyy-MM-dd"));
        } else if (key === "Enter") {
          console.log("TODO: Dispatch Event(enter? confirm?)");
        }
      }}
    >
      <div className="">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
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
          <tbody>
            {months.map((d) => {
              const r = addMonths(refDate, d);
              const cal = getCal(r);
              return (
                <>
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
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
