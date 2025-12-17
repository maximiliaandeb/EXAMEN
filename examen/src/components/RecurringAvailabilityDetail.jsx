import React from "react";

function weekdayLabel(day) {
  switch (Number(day)) {
    case 1:
      return "Maandag";
    case 2:
      return "Dinsdag";
    case 3:
      return "Woensdag";
    case 4:
      return "Donderdag";
    case 5:
      return "Vrijdag";
    case 6:
      return "Zaterdag";
    case 0:
    default:
      return "Zondag";
  }
}

export default function RecurringAvailabilityDetail({
  rule,
  date,
  onClose,
  onDelete,
  onDeleteOne,
}) {
  if (!rule) return null;
  const displayDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  return (
    <div className="recurring-detail">
      <h3>Vaste beschikbaarheid</h3>
      <div className="recurring-item">
        <div className="recurring-main">
          <span className="recurring-badge">Wekelijks</span>
          <span className="recurring-text">
            {weekdayLabel(rule.weekday)} {rule.start}–{rule.end}
          </span>
        </div>
        <div className="recurring-range">
          <span>Vanaf: {rule.startDate || "—"}</span>
          <span>Tot en met: {rule.endDate || "—"}</span>
        </div>
        {displayDate && (
          <div className="detail-date-callout">
            <span className="detail-icon" aria-hidden>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>
              Gekozen dag: <strong>{displayDate}</strong>
            </span>
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Sluiten
        </button>
        {date && (
          <button
            type="button"
            className="btn btn-add"
            onClick={() => onDeleteOne && onDeleteOne(rule.id, date)}
            title="Verwijder alleen deze dag uit de wekelijkse regel"
          >
            Verwijder alleen deze dag
          </button>
        )}
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete && onDelete(rule.id)}
        >
          Verwijder vaste beschikbaarheid
        </button>
      </div>
    </div>
  );
}
