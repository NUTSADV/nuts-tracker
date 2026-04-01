import { useState } from "react";

const toDecimalHours = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const diff = endMin - startMin;
  return Math.round(diff / 30) / 2; // arrotonda a 0.5
};

export default function App() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [entries, setEntries] = useState([]);

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
    };

    setEntries([newEntry, ...entries]);
    setDate("");
  };

  return (
    <div style={{ padding: 40, fontFamily: "Poppins" }}>
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

        <button style={{ marginTop: 10 }} onClick={handleAdd}>
          Aggiungi giornata
        </button>
      </div>

      {/* LISTA */}
      <div style={{ marginTop: 40 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{e.date}</strong> — {e.hours} ore ({e.start} - {e.end})
          </div>
        ))}
      </div>
    </div>
  );
}
