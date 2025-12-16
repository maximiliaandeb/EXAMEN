import React, { useState, useEffect, useMemo } from "react";
import { timeToMinutes, addMinutesToTime, formatDateISO } from "./dateUtils";

const TYPES = [
  {
    label: "Beeldbellen 60 min",
    value: "beeldbellen",
    duration: 60,
    color: "#60c1be",
  },
  {
    label: "Belafspraak 15 min",
    value: "belafspraak",
    duration: 15,
    color: "#ff6b6b",
  },
  {
    label: "Behandeling 60 min",
    value: "behandeling",
    duration: 60,
    color: "#b28cff",
  },
];

export default function AppointmentForm({
  initial,
  date,
  onSave,
  onCancel,
  onDelete,
  appointments = [],
  availabilities,
}) {
  const [type, setType] = useState(initial?.type || TYPES[0].value);
  const [time, setTime] = useState(initial?.time || "09:00");
  const [apptDate, setApptDate] = useState(
    initial?.date || date || formatDateISO(new Date())
  );

  useEffect(() => {
    if (date) setApptDate(date);
  }, [date]);

  // generate times at 15-minute intervals
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

  // filter times to those that fit at least one availability for the selected date
  const availableTimes = useMemo(() => {
    const duration = getDuration();
    const dayAvail = availabilities.filter((a) => a.date === apptDate);
    const dayAppts = appointments.filter(
      (a) => a.date === apptDate && a.id !== initial?.id
    );
    if (dayAvail.length === 0) return [];
    return allTimes.filter((t) => {
      const start = timeToMinutes(t);
      const end = start + duration;
      const fitsAvailability = dayAvail.some(
        (a) => timeToMinutes(a.start) <= start && timeToMinutes(a.end) >= end
      );
      if (!fitsAvailability) return false;
      return !dayAppts.some((appt) => {
        const apptStart = timeToMinutes(appt.time);
        const apptEnd = apptStart + getAppointmentDuration(appt);
        return start < apptEnd && end > apptStart;
      });
    });
  }, [allTimes, appointments, availabilities, apptDate, initial]);

  function getDuration() {
    const t = TYPES.find((x) => x.value === type);
    return t?.duration || 60;
  }

  function getAppointmentDuration(appt) {
    const typeInfo = TYPES.find((x) => x.value === appt.type);
    return appt.duration ?? typeInfo?.duration ?? 0;
  }

  function validateAvailability() {
    const duration = getDuration();
    const start = timeToMinutes(time);
    const end = start + duration;
    const dayAvail = availabilities.filter((a) => a.date === apptDate);
    const dayAppts = appointments.filter(
      (a) => a.date === apptDate && a.id !== initial?.id
    );
    if (dayAvail.length === 0) return false;
    // any availability covering the whole appointment
    const hasAvailability = dayAvail.some(
      (a) => timeToMinutes(a.start) <= start && timeToMinutes(a.end) >= end
    );
    if (!hasAvailability) return false;
    // reject overlap with existing appointments on the same day
    const hasConflict = dayAppts.some((appt) => {
      const apptStart = timeToMinutes(appt.time);
      const apptEnd = apptStart + getAppointmentDuration(appt);
      return start < apptEnd && end > apptStart;
    });
    return !hasConflict;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateAvailability()) {
      alert(
        "Fout: Er is geen beschikbaarheid of er bestaat al een afspraak in deze periode."
      );
      return;
    }
    onSave({
      id: initial?.id || Date.now(),
      type,
      date: apptDate,
      time,
      duration: getDuration(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="appt-form">
      <div className="form-row">
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Datum</label>
        <input
          type="date"
          value={apptDate}
          onChange={(e) => setApptDate(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label>Tijd</label>
        {availableTimes.length > 0 ? (
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            {availableTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ color: "#b00" }}>
            Geen beschikbare tijden voor deze datum. Voeg eerst beschikbaarheid
            toe.
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={availableTimes.length === 0}>
          Opslaan
        </button>
        <button type="button" onClick={onCancel}>
          Annuleren
        </button>
        {initial && (
          <button
            type="button"
            onClick={() => onDelete(initial.id)}
            className="danger"
          >
            Verwijder
          </button>
        )}
      </div>
    </form>
  );
}
