import { useState, useEffect } from "react";

const activities = [
  "Video Production",
  "Video Post",
  "Graphic Design",
  "Web Design",
  "Social",
  "Blogging",
  "Photo",
  "Altro",
];

const toDecimalHours = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const diff = endMin - startMin;
  return Math.round(diff / 30) / 2;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT");
};

export default function App() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [activity, setActivity] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);

  // 🔥 LOAD DATI ALL'AVVIO
  useEffect(() => {
    const saved = localStorage.getItem("nuts-tracker");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // 🔥 SALVA OGNI VOLTA CHE CAMBIA
  useEffect(() => {
    localStorage.setItem("nuts-tracker", JSON.stringify(entries));
  }, [entries]);

  const handleAdd = () => {
    if (!date) {
      alert("Inserisci la data");
      return;
    }

    const hours = toDecimalHours(start, end);

    const newEntry = {
      date,
      start,
      end,
      hours,
      activity,
      note,
    };

    setEntries([newEntry, ...entries]);
    setNote("");
  };

  return (
    <div style={{ padding: 40, fontFamily: "Poppins", maxWidth: 600 }}>
      <h1>Internship Tracker</h1>

      {/* FORM */}
      <div style={{ marginTop: 30 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          {" → "}
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          >
            <option value="">Tipo attività</option>
            {activities.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <textarea
            placeholder="Dettaglio attività (opzionale)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button style={{ marginTop: 10 }} onClick={handleAdd}>
          Aggiungi giornata
        </button>
      </div>

      {/* LISTA */}
      <div style={{ marginTop: 40 }}>
        {entries.map((e, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {formatDate(e.date)}
            </div>

            <div style={{ fontSize: 20 }}>
              {e.hours} ore{" "}
              <span style={{ fontSize: 12, color: "#666" }}>
                ({e.start} - {e.end})
              </span>
            </div>

            {e.activity && (
              <div style={{ fontWeight: "bold" }}>{e.activity}</div>
            )}

            {e.note && (
              <div style={{ color: "#666" }}>{e.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
