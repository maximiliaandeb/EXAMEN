import React, { useEffect, useState } from "react";
import Calendar from "./components/Calendar";
import Modal from "./components/Modal";
import AppointmentForm from "./components/AppointmentForm";
import AvailabilityForm from "./components/AvailabilityForm";
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

  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    save("appointments", appointments);
  }, [appointments]);
  useEffect(() => {
    save("availabilities", availabilities);
  }, [availabilities]);

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
      />
    );
  }

  function openDayQuickActions(date) {
    setModalContent(
      <div className="quick-add-modal">
        <h3>Nieuwe invoer</h3>
        <p className="quick-add-date">Datum: {date || "(geen datum)"}</p>
        <div className="quick-add-buttons">
          <button className="btn" onClick={() => openNewAppointment(date)}>
            Nieuwe afspraak
          </button>
          <button className="btn btn-add" onClick={() => openNewAvailability(date)}>
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
          setAvailabilities((prev) => prev.filter((p) => p.id !== id));
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
        <div style={{ marginLeft: "auto" }}></div>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          year={year}
          month={month}
          appointments={appointments}
          availabilities={availabilities}
          onEditAppointment={(a) => openEditAppointment(a)}
          onEditAvailability={(av) => openEditAvailability(av)}
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
