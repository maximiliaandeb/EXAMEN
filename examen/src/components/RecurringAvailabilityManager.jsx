import React, { useMemo, useState } from "react";

function weekdayLabel(day) {
  // JS: 0=Sun..6=Sat
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

export default function RecurringAvailabilityManager({
  rules = [],
  onDelete,
  onAddException,
  onRemoveException,
  onAddRule,
}) {
  const [dates, setDates] = useState({}); // per rule input value
  const [newRule, setNewRule] = useState({
    weekday: 1,
    start: "10:00",
    end: "12:00",
    startDate: "",
    endDate: "",
  });
  const startAligned =
    !!newRule.startDate &&
    new Date(newRule.startDate + "T00:00:00").getDay() ===
      Number(newRule.weekday);

  const allTimes = useMemo(() => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  }, []);

  function setDate(ruleId, iso) {
    setDates((prev) => ({ ...prev, [ruleId]: iso }));
  }

  return (
    <div className="recurring-manager">
      <h3>Vaste beschikbaarheid</h3>
      <div className="recurring-add-rule">
        <div className="form-row">
          <label>Weekdag</label>
          <select
            value={newRule.weekday}
            onChange={(e) =>
              setNewRule((r) => ({ ...r, weekday: Number(e.target.value) }))
            }
          >
            <option value={1}>Maandag</option>
            <option value={2}>Dinsdag</option>
            <option value={3}>Woensdag</option>
            <option value={4}>Donderdag</option>
            <option value={5}>Vrijdag</option>
            <option value={6}>Zaterdag</option>
            <option value={0}>Zondag</option>
          </select>
        </div>
        <div className="form-row">
          <label>Start</label>
          <select
            value={newRule.start}
            onChange={(e) => {
              const start = e.target.value;
              // default end +60 min (or next slot)
              const idx = allTimes.indexOf(start);
              const endIdx = Math.min(idx + 4, allTimes.length - 1);
              const end = allTimes[endIdx];
              setNewRule((r) => ({
                ...r,
                start,
                end: r.end && r.end !== r.start ? r.end : end,
              }));
            }}
          >
            {allTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Eind</label>
          <select
            value={newRule.end}
            onChange={(e) => setNewRule((r) => ({ ...r, end: e.target.value }))}
          >
            {allTimes
              .filter((t) => t > newRule.start)
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>
        </div>
        <div className="form-row">
          <label>Vanaf</label>
          <input
            type="date"
            value={newRule.startDate}
            onChange={(e) =>
              setNewRule((r) => ({ ...r, startDate: e.target.value }))
            }
            required
          />
          {newRule.startDate && !startAligned && (
            <div className="field-hint error">
              Kies een datum die op de gekozen weekdag valt.
            </div>
          )}
        </div>
        <div className="form-row">
          <label>Tot en met (optioneel)</label>
          <input
            type="date"
            value={newRule.endDate}
            onChange={(e) =>
              setNewRule((r) => ({ ...r, endDate: e.target.value }))
            }
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-add"
            onClick={() => {
              if (!newRule.startDate) {
                alert("Kies een vanaf-datum");
                return;
              }
              if (!startAligned) {
                alert(
                  "Kies een 'Vanaf'-datum die op de geselecteerde weekdag valt."
                );
                return;
              }
              if (newRule.start >= newRule.end) {
                alert("Start moet eerder zijn dan einde");
                return;
              }
              const payload = {
                id: Date.now(),
                type: "weekly",
                weekday: Number(newRule.weekday),
                start: newRule.start,
                end: newRule.end,
                startDate: newRule.startDate,
                endDate: newRule.endDate || undefined,
              };
              onAddRule && onAddRule(payload);
              setNewRule({
                weekday: 1,
                start: "10:00",
                end: "12:00",
                startDate: "",
                endDate: "",
              });
            }}
            disabled={
              !newRule.startDate ||
              !startAligned ||
              newRule.start >= newRule.end
            }
          >
            Voeg vaste beschikbaarheid toe
          </button>
        </div>
      </div>
      {rules.length === 0 ? (
        <p className="muted">Geen vaste regels toegevoegd.</p>
      ) : (
        <div className="recurring-list">
          {rules.map((r) => (
            <div key={r.id} className="recurring-item">
              <div className="recurring-main">
                <span className="recurring-badge">Wekelijks</span>
                <span className="recurring-text">
                  {weekdayLabel(r.weekday)} {r.start}–{r.end}
                </span>
              </div>
              <div className="recurring-range">
                <span>Vanaf: {r.startDate || "—"}</span>
                <span>Tot en met: {r.endDate || "—"}</span>
              </div>
              {Array.isArray(r.exceptions) && r.exceptions.length > 0 && (
                <div className="recurring-exceptions">
                  <span className="exceptions-label">Uitzonderingen:</span>
                  <div className="exceptions-list">
                    {r.exceptions.map((ex) => (
                      <span key={ex} className="exception-chip">
                        {new Date(ex + "T00:00:00").toLocaleDateString(
                          "nl-NL",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() =>
                            onRemoveException && onRemoveException(r.id, ex)
                          }
                          aria-label={`Verwijder uitzondering ${ex}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="recurring-add-exception">
                <label className="add-exc-label">Verwijder één dag</label>
                <div className="exception-callout">
                  <div className="add-exc-row">
                    <input
                      type="date"
                      value={dates[r.id] || ""}
                      onChange={(e) => setDate(r.id, e.target.value)}
                    />
                    {(() => {
                      const iso = dates[r.id];
                      const aligned =
                        !iso ||
                        new Date(iso + "T00:00:00").getDay() ===
                          Number(r.weekday);
                      return (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={!iso || !aligned}
                            onClick={() =>
                              iso &&
                              aligned &&
                              onAddException &&
                              onAddException(r.id, iso)
                            }
                            title="Verwijder de beschikbaarheid voor deze specifieke dag"
                          >
                            Verwijder dag
                          </button>
                          {iso && !aligned && (
                            <div className="field-hint error">
                              Kies een datum die op {weekdayLabel(r.weekday)}{" "}
                              valt.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="manager-delete">
                <span className="manager-delete-text">
                  Verwijder volledige wekelijkse regel
                </span>
                <div className="recurring-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDelete && onDelete(r.id)}
                    title="Verwijder deze vaste beschikbaarheidsregel"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
