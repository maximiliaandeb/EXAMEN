import React from "react";
import { formatDateISO, daysInMonth, ruleAppliesOnISO } from "./dateUtils";

function weekdayNames() {
  return ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
}

export default function Calendar({
  year,
  month,
  appointments,
  availabilities,
  recurringAvailabilities = [],
  onEditAppointment,
  onEditAvailability,
  onEditRecurringAvailability,
  onDayClick,
  onPrev,
  onNext,
}) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 Sun..6 Sat
  // we want Monday start; map JS day to Monday=0
  const offset = (startDay + 6) % 7; // Monday=0
  const totalDays = daysInMonth(year, month);

  const cells = [];
  // prepend blanks
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));

  // make rows of 7
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="calendar-header">
        <button className="nav-button" onClick={onPrev}>
          ←
        </button>
        <h2>
          {first.toLocaleString("nl-NL", { month: "long", year: "numeric" })}
        </h2>
        <button className="nav-button" onClick={onNext}>
          →
        </button>
      </div>
      <div className="weekday-row">
        {weekdayNames().map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {rows.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell)
              return (
                <div key={`empty-${ri}-${ci}`} className="day-cell empty"></div>
              );
            const iso = formatDateISO(cell);
            const dayAppts = appointments.filter((a) => a.date === iso);
            const dayAvailSpecific = availabilities.filter(
              (av) => av.date === iso
            );
            const dayAvailRecurring = recurringAvailabilities
              .filter((rav) => ruleAppliesOnISO(rav, iso))
              .map((rav) => ({
                id: rav.id,
                start: rav.start,
                end: rav.end,
                _recurring: true,
                _rule: rav,
              }));
            const dayAvail = [...dayAvailSpecific, ...dayAvailRecurring];
            const todayDate = new Date();
            const isToday =
              cell.getFullYear() === todayDate.getFullYear() &&
              cell.getMonth() === todayDate.getMonth() &&
              cell.getDate() === todayDate.getDate();
            const jsDay = cell.getDay(); // 0 Sun..6 Sat
            const isWeekend = jsDay === 0 || jsDay === 6;
            return (
              <div
                key={iso}
                className={
                  "day-cell " +
                  (isToday ? "today " : "") +
                  (isWeekend ? "weekend" : "")
                }
                onClick={() => onDayClick && onDayClick(iso)}
              >
                <div className="day-number">{cell.getDate()}</div>
                <div className="day-content">
                  {dayAvail.map((av) => {
                    const content = (
                      <div
                        key={av.id}
                        className={
                          "avail-badge" +
                          (av._recurring ? " avail-recurring" : "")
                        }
                      >
                        <span className="avail-title">
                          {av._recurring
                            ? "Vaste beschikbaarheid"
                            : "Beschikbaar"}
                        </span>
                        <span className="avail-time">
                          {av.start}-{av.end}
                        </span>
                      </div>
                    );
                    if (av._recurring) {
                      return React.cloneElement(content, {
                        onClick: (e) => {
                          e.stopPropagation();
                          onEditRecurringAvailability &&
                            onEditRecurringAvailability(av._rule, iso);
                        },
                      });
                    }
                    return React.cloneElement(content, {
                      onClick: (e) => {
                        e.stopPropagation();
                        onEditAvailability(av);
                      },
                    });
                  })}
                  {dayAppts.map((a) => (
                    <div
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAppointment(a);
                      }}
                      className={
                        "appt-badge " +
                        (a.type === "beeldbellen"
                          ? "appt-beeldbellen"
                          : a.type === "belafspraak"
                          ? "appt-belafspraak"
                          : "appt-behandeling")
                      }
                    >
                      <span className="badge-icon" aria-hidden>
                        {a.type === "beeldbellen" ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"
                              fill="currentColor"
                            />
                          </svg>
                        ) : a.type === "belafspraak" ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.01l-2.2 2.21z"
                              fill="currentColor"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="badge-text">
                        {a.time}{" "}
                        <span className="badge-label">
                          {a.type === "beeldbellen"
                            ? "Beeldbellen"
                            : a.type === "belafspraak"
                            ? "Belafspraak"
                            : "Behandeling"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* hint removed: appointment creation is via the 'Voeg afspraak toe' button */}
    </div>
  );
}
