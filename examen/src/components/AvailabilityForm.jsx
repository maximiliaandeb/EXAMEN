import React, { useState, useMemo } from "react";
import { timeToMinutes, addMinutesToTime } from "./dateUtils";

export default function AvailabilityForm({ initial, onSave, onCancel }) {
  const [date, setDate] = useState(
    initial?.date || new Date().toISOString().slice(0, 10)
  );
  const [start, setStart] = useState(initial?.start || "09:00");
  const [end, setEnd] = useState(initial?.end || "10:00");

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
    onSave({ id: initial?.id || Date.now(), date, start, end });
  }

  return (
    <form onSubmit={handleSubmit} className="appt-form">
      <div className="form-row">
        <label>Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
      <div className="form-actions">
        <button type="submit">Opslaan</button>
        <button type="button" onClick={onCancel}>
          Annuleren
        </button>
      </div>
    </form>
  );
}
