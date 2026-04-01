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

  return Math.round((endMin - startMin) / 30) / 2;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
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

  useEffect(() => {
    const saved = localStorage.getItem("nuts-tracker");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("nuts-tracker", JSON.stringify(entries));
  }, [entries]);

  const handleAdd = () => {
    if (!date) return alert("Inserisci la data");

    const hours = toDecimalHours(start, end);

    const newEntry = { date, start, end, hours, activity, note };

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
    setEntries(entries.filter((_, idx) => idx !== i));
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
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          Internship Tracker
        </h1>

        {/* FORM CARD */}
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 16,
            marginTop: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            style={{ width: "100%", marginTop: 10 }}
          >
            <option value="">Tipo attività</option>
            {activities.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <textarea
            placeholder="Dettaglio attività"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%", marginTop: 10 }}
          />

          <button
            onClick={handleAdd}
            style={{
              marginTop: 10,
              width: "100%",
              padding: 10,
              background: "black",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            {editingIndex !== null ? "Salva modifica" : "Aggiungi giornata"}
          </button>
        </div>

        {/* PROGRESS */}
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 16,
            marginTop: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Avanzamento {progress.toFixed(1)}%
          </div>

          <div
            style={{
              height: 10,
              background: "#eee",
              borderRadius: 10,
              marginTop: 10,
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
            <strong>{totalWorked}h</strong> fatte —{" "}
            <strong>{remaining}h</strong> restanti
          </div>
        </div>

        {/* LISTA */}
        <div style={{ marginTop: 20 }}>
          {entries.map((e, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 16,
                marginBottom: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {formatDate(e.date)}
              </div>

              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {e.hours}h{" "}
                <span style={{ fontSize: 12, color: "#777" }}>
                  ({e.start} - {e.end})
                </span>
              </div>

              {e.activity && (
                <div style={{ fontWeight: 600 }}>{e.activity}</div>
              )}

              {e.note && (
                <div style={{ color: "#666" }}>{e.note}</div>
              )}

              <div style={{ marginTop: 10 }}>
                <button onClick={() => handleEdit(i)}>Modifica</button>
                <button
                  onClick={() => handleDelete(i)}
                  style={{ marginLeft: 10, color: "red" }}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
