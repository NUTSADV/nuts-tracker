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
      background: "#f7f7f7",
      minHeight: "100vh",
      padding: 20,
    }}
  >
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <img
          src="https://nutsadv.it/wp-content/uploads/2018/02/600X600_LOGO_PNG_NERO.png"
          style={{ width: 70 }}
        />
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>
          Internship Tracker
        </h1>
      </div>

      {/* FORM */}
      <div style={cardStyle}>
        
        {/* DATA */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            ...inputStyle,
            border: !date ? "1px solid red" : "1px solid #ddd",
          }}
        />

        {/* ORARI */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* QUICK BUTTONS */}
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setEnd("18:00")} style={ghostBtn}>
            +8h
          </button>
          <button onClick={() => setEnd("14:00")} style={ghostBtn}>
            +4h
          </button>
        </div>

        {/* ATTIVITÀ */}
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          style={inputStyle}
        >
          <option value="">Tipo attività</option>
          {activities.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        {/* NOTE */}
        <textarea
          placeholder="Dettaglio attività"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ ...inputStyle, minHeight: 80 }}
        />

        {/* BUTTON */}
        <button onClick={handleAdd} style={mainBtn}>
          {editingIndex !== null ? "Salva modifica" : "Aggiungi giornata"}
        </button>
      </div>

      {/* PROGRESS */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 600 }}>
          Avanzamento {progress.toFixed(1)}%
        </div>

        <div style={progressBarBg}>
          <div style={{ ...progressBarFill, width: `${progress}%` }} />
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
              ...cardStyle,
              border:
                editingIndex === i
                  ? "2px solid #111"
                  : "1px solid transparent",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              
              <div>
                <div style={{ fontWeight: 600 }}>
                  {formatDate(e.date)}
                </div>

                <div style={{ fontWeight: 600 }}>{e.activity}</div>
                <div style={{ color: "#666" }}>{e.note}</div>
              </div>

              {/* ORE A DESTRA */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {e.hours}h
                </div>
                <div style={{ fontSize: 12, color: "#777" }}>
                  {e.start} - {e.end}
                </div>
              </div>
            </div>

            {/* AZIONI */}
            <div style={{ marginTop: 10 }}>
              <button onClick={() => handleEdit(i)} style={ghostBtn}>
                Modifica
              </button>
              <button onClick={() => handleDelete(i)} style={dangerBtn}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <img
          src="https://nutsadv.it/wp-content/uploads/nuts_lettering_black.png"
          style={{ height: 20, opacity: 0.6 }}
        />
      </div>
    </div>
  </div>
);

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
  const ghostBtn = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "white",
  marginRight: 8,
  cursor: "pointer",
};

const dangerBtn = {
  ...ghostBtn,
  color: "red",
};
}
