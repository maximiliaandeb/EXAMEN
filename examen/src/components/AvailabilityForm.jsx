import React, { useState, useMemo } from "react";
import { timeToMinutes, addMinutesToTime } from "./dateUtils";

export default function AvailabilityForm({
  initial,
  onSave,
  onCancel,
  onDelete,
  onSaveRecurring,
}) {
  const [date, setDate] = useState(
    initial?.date || new Date().toISOString().slice(0, 10)
  );
  const [start, setStart] = useState(initial?.start || "09:00");
  const [end, setEnd] = useState(initial?.end || "10:00");
  const jsDay = new Date(date + "T00:00:00").getDay(); // 0..6
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [weekday, setWeekday] = useState(jsDay);
  const [fromDate, setFromDate] = useState(date);
  const [untilDate, setUntilDate] = useState("");
  const isStartAligned = !repeatWeekly
    || (!!fromDate && new Date(fromDate + "T00:00:00").getDay() === Number(weekday));

  // Genereer alle kwartier-tijden
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

  // Automatisch eindtijd instellen bij wijzigen starttijd
  function handleStartChange(e) {
    const newStart = e.target.value;
    setStart(newStart);
    const startMins = timeToMinutes(newStart);
    let nextEnd = addMinutesToTime(newStart, 60);
    // Als +60 min buiten bereik valt, kies eerstvolgende kwartier
    if (timeToMinutes(nextEnd) <= startMins) {
      const idx = allTimes.indexOf(newStart);
      nextEnd = allTimes[Math.min(idx + 1, allTimes.length - 1)];
    }
    setEnd(nextEnd);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      alert("Start moet eerder zijn dan einde");
      return;
    }
    if (repeatWeekly && onSaveRecurring) {
      if (!isStartAligned) {
        alert("Kies een 'Vanaf'-datum die op de geselecteerde weekdag valt.");
        return;
      }
      const payload = {
        id: Date.now(),
        type: "weekly",
        weekday: Number(weekday), // 0..6 JS
        start,
        end,
        startDate: fromDate,
        endDate: untilDate || undefined,
      };
      onSaveRecurring(payload);
      return;
    }
    onSave({ id: initial?.id || Date.now(), date, start, end });
  }

  return (
    <form onSubmit={handleSubmit} className="appt-form">
      <div className="form-row">
        <label>Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            const d = new Date(e.target.value + "T00:00:00");
            setWeekday(d.getDay());
            setFromDate(e.target.value);
          }}
          required
        />
      </div>
      <div className="form-row">
        <label>Start</label>
        <select value={start} onChange={handleStartChange} required>
          {allTimes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Eind</label>
        <select value={end} onChange={(e) => setEnd(e.target.value)} required>
          {allTimes
            .filter((t) => timeToMinutes(t) > timeToMinutes(start))
            .map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
        </select>
      </div>
      <div className="form-row">
        <label>
          <input
            type="checkbox"
            checked={repeatWeekly}
            onChange={(e) => setRepeatWeekly(e.target.checked)}
          />
          &nbsp;Herhaal wekelijks
        </label>
      </div>
      {repeatWeekly && (
        <>
          <div className="form-row">
            <label>Weekdag</label>
            <select value={weekday} onChange={(e) => setWeekday(e.target.value)}>
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
            <label>Vanaf</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
            {repeatWeekly && !isStartAligned && (
              <div className="field-hint error">
                Kies een datum die op de gekozen weekdag valt.
              </div>
            )}
          </div>
          <div className="form-row">
            <label>Tot en met (optioneel)</label>
            <input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
            />
          </div>
        </>
      )}
      <div className="form-actions">
        <button type="submit" disabled={repeatWeekly && !isStartAligned}>Opslaan</button>
        <button type="button" onClick={onCancel}>
          Annuleren
        </button>
        {onDelete && initial?.id && (
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (
                confirm(
                  "Weet je zeker dat je deze beschikbaarheid wilt verwijderen?"
                )
              ) {
                onDelete(initial.id);
              }
            }}
          >
            Verwijderen
          </button>
        )}
      </div>
    </form>
  );
}
