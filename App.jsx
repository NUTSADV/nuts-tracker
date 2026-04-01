import { useState, useEffect } from "react";

const TOTAL_HOURS = 225;

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
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function App() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [activity, setActivity] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("nuts-tracker");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // SAVE
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

    if (editingIndex !== null) {
      const updated = [...entries];
      updated[editingIndex] = newEntry;
      setEntries(updated);
      setEditingIndex(null);
    } else {
      setEntries([newEntry, ...entries]);
    }

    setNote("");
  };

  const handleDelete = (i) => {
    const updated = entries.filter((_, index) => index !== i);
    setEntries(updated);
  };

  const handleEdit = (i) => {
    const e = entries[i];
    setDate(e.date);
    setStart(e.start);
    setEnd(e.end);
    setActivity(e.activity);
    setNote(e.note);
    setEditingIndex(i);
  };

  const totalWorked = entries.reduce((acc, e) => acc + e.hours, 0);
  const remaining = TOTAL_HOURS - totalWorked;
  const progress = Math.min((totalWorked / TOTAL_HOURS) * 100, 100);

  return (
    <div style={{ padding: 40, fontFamily: "Poppins", maxWidth: 700 }}>
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
            placeholder="Dettaglio attività"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button style={{ marginTop: 10 }} onClick={handleAdd}>
          {editingIndex !== null ? "Salva modifica" : "Aggiungi giornata"}
        </button>
      </div>

      {/* PROGRESS */}
      <div style={{ marginTop: 40 }}>
        <div style={{ marginBottom: 10 }}>
          <strong>Avanzamento: {progress.toFixed(1)}%</strong>
        </div>

        <div
          style={{
            height: 10,
            background: "#eee",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              background: "black",
              height: "100%",
            }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          Fatte: <strong>{totalWorked}h</strong> — Restano:{" "}
          <strong>{remaining}h</strong>
        </div>
      </div>

      {/* LISTA */}
      <div style={{ marginTop: 40 }}>
        {entries.map((e, i) => (
          <div
            key={i}
            style={{
              padding: 15,
              border: "1px solid #ddd",
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {formatDate(e.date)}
            </div>

            <div style={{ fontSize: 22, fontWeight: "bold" }}>
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

            <div style={{ marginTop: 10 }}>
              <button onClick={() => handleEdit(i)}>Modifica</button>
              <button
                style={{ marginLeft: 10, color: "red" }}
                onClick={() => handleDelete(i)}
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
