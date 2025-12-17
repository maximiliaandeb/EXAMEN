import React, { useEffect, useState } from "react";
import Calendar from "./components/Calendar";
import Modal from "./components/Modal";
import AppointmentForm from "./components/AppointmentForm";
import AvailabilityForm from "./components/AvailabilityForm";
import RecurringAvailabilityManager from "./components/RecurringAvailabilityManager";
import RecurringAvailabilityDetail from "./components/RecurringAvailabilityDetail";
import "./App.css";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatNLDate(iso) {
  if (!iso) return "(geen datum)";
  return new Date(iso + "T00:00:00").toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [appointments, setAppointments] = useState(() =>
    load("appointments", [])
  );
  const [availabilities, setAvailabilities] = useState(() =>
    load("availabilities", [])
  );
  const [recurringAvailabilities, setRecurringAvailabilities] = useState(() =>
    load("recurringAvailabilities", [])
  );

  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    save("appointments", appointments);
  }, [appointments]);
  useEffect(() => {
    save("availabilities", availabilities);
  }, [availabilities]);
  useEffect(() => {
    save("recurringAvailabilities", recurringAvailabilities);
  }, [recurringAvailabilities]);

  function handlePrev() {
    const m = month - 1;
    if (m < 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(m);
  }
  function handleNext() {
    const m = month + 1;
    if (m > 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(m);
  }

  function openNewAppointment(date) {
    setModalContent(
      <AppointmentForm
        date={date}
        appointments={appointments}
        availabilities={availabilities}
        recurringAvailabilities={recurringAvailabilities}
        onCancel={() => setModalContent(null)}
        onSave={(a) => {
          setAppointments((prev) => {
            const next = [...prev.filter((p) => p.id !== a.id), a].sort(
              (x, y) =>
                x.date.localeCompare(y.date) || x.time.localeCompare(y.time)
            );
            return next;
          });
          setModalContent(null);
        }}
      />
    );
  }

  function openEditAppointment(appt) {
    setModalContent(
      <AppointmentForm
        initial={appt}
        appointments={appointments}
        availabilities={availabilities}
        recurringAvailabilities={recurringAvailabilities}
        onCancel={() => setModalContent(null)}
        onDelete={(id) => {
          setAppointments((prev) => prev.filter((p) => p.id !== id));
          setModalContent(null);
        }}
        onSave={(a) => {
          setAppointments((prev) => {
            const next = [...prev.filter((p) => p.id !== a.id), a].sort(
              (x, y) =>
                x.date.localeCompare(y.date) || x.time.localeCompare(y.time)
            );
            return next;
          });
          setModalContent(null);
        }}
      />
    );
  }

  function openNewAvailability(date) {
    setModalContent(
      <AvailabilityForm
        initial={{ date }}
        onCancel={() => setModalContent(null)}
        onSave={(av) => {
          setAvailabilities((prev) =>
            [...prev.filter((p) => p.id !== av.id), av].sort((a, b) =>
              a.date.localeCompare(b.date)
            )
          );
          setModalContent(null);
        }}
        onSaveRecurring={(rav) => {
          setRecurringAvailabilities((prev) =>
            [...prev.filter((p) => p.id !== rav.id), rav].sort(
              (a, b) =>
                a.weekday - b.weekday ||
                (a.start || "").localeCompare(b.start || "")
            )
          );
          setModalContent(null);
        }}
      />
    );
  }

  function openDayQuickActions(date) {
    setModalContent(
      <div className="quick-add-modal">
        <h3>Nieuwe invoer</h3>
        <p className="quick-add-date">Datum: {formatNLDate(date)}</p>
        <div className="quick-add-buttons">
          <button className="btn" onClick={() => openNewAppointment(date)}>
            Nieuwe afspraak
          </button>
          <button
            className="btn btn-add"
            onClick={() => openNewAvailability(date)}
          >
            Beschikbaarheid
          </button>
        </div>
      </div>
    );
  }

  function openEditAvailability(avail) {
    setModalContent(
      <AvailabilityForm
        initial={avail}
        onCancel={() => setModalContent(null)}
        onDelete={(id) => {
          // Find the availability being deleted to get its date
          const availToDelete = availabilities.find((a) => a.id === id);
          setAvailabilities((prev) => prev.filter((p) => p.id !== id));
          // Remove all appointments on that date
          if (availToDelete) {
            setAppointments((prev) =>
              prev.filter((a) => a.date !== availToDelete.date)
            );
          }
          setModalContent(null);
        }}
        onSave={(av) => {
          setAvailabilities((prev) =>
            [...prev.filter((p) => p.id !== av.id), av].sort((a, b) =>
              a.date.localeCompare(b.date)
            )
          );
          setModalContent(null);
        }}
        onSaveRecurring={(rav) => {
          setRecurringAvailabilities((prev) =>
            [...prev.filter((p) => p.id !== rav.id), rav].sort(
              (a, b) =>
                a.weekday - b.weekday ||
                (a.start || "").localeCompare(b.start || "")
            )
          );
          setModalContent(null);
        }}
      />
    );
  }

  return (
    <div className="app">
      <h1>Agenda</h1>
      <div className="top-controls">
        <button className="btn" onClick={() => openNewAppointment()}>
          Voeg afspraak toe
        </button>
        <button className="btn btn-add" onClick={() => openNewAvailability()}>
          Voeg beschikbaarheid toe
        </button>
        <button
          className="btn"
          onClick={() =>
            setModalContent(
              <RecurringAvailabilityManager
                rules={recurringAvailabilities}
                onDelete={(id) => {
                  setRecurringAvailabilities((prev) =>
                    prev.filter((p) => p.id !== id)
                  );
                  setModalContent(null);
                }}
                onAddRule={(rav) => {
                  setRecurringAvailabilities((prev) =>
                    [...prev.filter((p) => p.id !== rav.id), rav].sort(
                      (a, b) =>
                        a.weekday - b.weekday ||
                        (a.start || "").localeCompare(b.start || "")
                    )
                  );
                }}
                onAddException={(id, iso) => {
                  setRecurringAvailabilities((prev) =>
                    prev.map((p) => {
                      if (p.id !== id) return p;
                      const exceptions = Array.from(
                        new Set([...(p.exceptions || []), iso])
                      );
                      return { ...p, exceptions };
                    })
                  );                  setAppointments((prev) => prev.filter((a) => a.date !== iso));                }}
                onRemoveException={(id, iso) => {
                  setRecurringAvailabilities((prev) =>
                    prev.map((p) => {
                      if (p.id !== id) return p;
                      const exceptions = (p.exceptions || []).filter(
                        (d) => d !== iso
                      );
                      return { ...p, exceptions };
                    })
                  );
                }}
              />
            )
          }
        >
          Beheer vaste beschikbaarheid
        </button>
        <div style={{ marginLeft: "auto" }}></div>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          year={year}
          month={month}
          appointments={appointments}
          availabilities={availabilities}
          recurringAvailabilities={recurringAvailabilities}
          onEditAppointment={(a) => openEditAppointment(a)}
          onEditAvailability={(av) => openEditAvailability(av)}
          onEditRecurringAvailability={(rule, iso) =>
            setModalContent(
              <RecurringAvailabilityDetail
                rule={rule}
                date={iso}
                onClose={() => setModalContent(null)}
                onDelete={(id) => {
                  setRecurringAvailabilities((prev) =>
                    prev.filter((p) => p.id !== id)
                  );
                  setModalContent(null);
                }}
                onDeleteOne={(id, dateIso) => {
                  setRecurringAvailabilities((prev) =>
                    prev.map((p) => {
                      if (p.id !== id) return p;
                      const exceptions = Array.from(
                        new Set([...(p.exceptions || []), dateIso])
                      );
                      return { ...p, exceptions };
                    })
                  );
                  setAppointments((prev) => prev.filter((a) => a.date !== dateIso));
                  setModalContent(null);
                }}
              />
            )
          }
          onDayClick={(iso) => openDayQuickActions(iso)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>

      {modalContent && (
        <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>
      )}
    </div>
  );
}
