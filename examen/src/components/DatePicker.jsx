import React, { useState, useRef, useEffect } from "react";
import { formatDateISO, daysInMonth } from "./dateUtils";

function weekdayNames() {
  return ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
}

export default function DatePicker({ value, onChange, label, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split("-");
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    }
    return new Date();
  });
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const offset = (startDay + 6) % 7;
  const totalDays = daysInMonth(year, month);

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  function handlePrev() {
    const m = month - 1;
    if (m < 0) {
      setViewDate(new Date(year - 1, 11, 1));
    } else {
      setViewDate(new Date(year, m, 1));
    }
  }

  function handleNext() {
    const m = month + 1;
    if (m > 11) {
      setViewDate(new Date(year + 1, 0, 1));
    } else {
      setViewDate(new Date(year, m, 1));
    }
  }

  function handleSelectDate(date) {
    onChange(formatDateISO(date));
    setIsOpen(false);
  }

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="datepicker-container" ref={containerRef}>
      {label && <label className="datepicker-label">{label}</label>}
      <div
        className="datepicker-input"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={displayValue ? "" : "placeholder"}>
          {displayValue || "Selecteer een datum"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"
            fill="currentColor"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="datepicker-dropdown">
          <div className="datepicker-header">
            <button
              className="datepicker-nav"
              onClick={handlePrev}
              type="button"
            >
              ←
            </button>
            <h3>
              {first.toLocaleString("nl-NL", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              className="datepicker-nav"
              onClick={handleNext}
              type="button"
            >
              →
            </button>
          </div>
          <div className="datepicker-weekdays">
            {weekdayNames().map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="datepicker-grid">
            {rows.map((row, ri) =>
              row.map((cell, ci) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${ri}-${ci}`}
                      className="datepicker-day empty"
                    ></div>
                  );
                }
                const iso = formatDateISO(cell);
                const isSelected =
                  selectedDate &&
                  cell.getFullYear() === selectedDate.getFullYear() &&
                  cell.getMonth() === selectedDate.getMonth() &&
                  cell.getDate() === selectedDate.getDate();
                const isToday =
                  cell.getFullYear() === today.getFullYear() &&
                  cell.getMonth() === today.getMonth() &&
                  cell.getDate() === today.getDate();
                const jsDay = cell.getDay();
                const isWeekend = jsDay === 0 || jsDay === 6;
                return (
                  <div
                    key={iso}
                    className={`datepicker-day ${
                      isSelected ? "selected" : ""
                    } ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""}`}
                    onClick={() => handleSelectDate(cell)}
                  >
                    {cell.getDate()}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
