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
  return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 30) / 2;
};

const formatDateFull = (dateStr) => {
  const d = new Date(dateStr);

  const giorno = d.toLocaleDateString("it-IT", { weekday: "long" });
  const data = d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return {
    giorno: giorno.charAt(0).toUpperCase() + giorno.slice(1),
    data,
    meseKey: dateStr.slice(0, 7),
  };
};

export default function App() {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [activity, setActivity] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("nuts-tracker");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("nuts-tracker", JSON.stringify(entries));
  }, [entries]);

  const handleAdd = () => {
    if (!date) {
      alert("Inserisci la data");
      return;
    }

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

  const grouped = entries
    .filter(e => filterMonth === "all" || e.date.startsWith(filterMonth))
    .reduce((acc, e) => {
      const key = e.date.slice(0, 7);
      if (!acc[key]) acc[key] = [];
      acc[key].push(e);
      return acc;
    }, {});

  return (
    <div style={wrapper}>
      <div style={container}>

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
        <div style={card}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              ...input,
              border: !date ? "1px solid red" : "1px solid #ddd",
            }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={input}/>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={input}/>
          </div>

          {/* QUICK BUTTONS */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                const [h, m] = start.split(":").map(Number);
                const d = new Date();
                d.setHours(h + 8);
                d.setMinutes(m);
                setEnd(d.toTimeString().slice(0,5));
              }}
              style={ghostBtn}
            >
              +8h
            </button>

            <button
              onClick={() => {
                const [h, m] = start.split(":").map(Number);
                const d = new Date();
                d.setHours(h + 4);
                d.setMinutes(m);
                setEnd(d.toTimeString().slice(0,5));
              }}
              style={ghostBtn}
            >
              +4h
            </button>
          </div>

          <select value={activity} onChange={(e) => setActivity(e.target.value)} style={input}>
            <option value="">Tipo attività</option>
            {activities.map((a) => <option key={a}>{a}</option>)}
          </select>

          <textarea
            placeholder="Dettaglio attività"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ ...input, minHeight: 80 }}
          />

          <button onClick={handleAdd} style={mainBtn}>
            {editingIndex !== null ? "Salva modifica" : "Aggiungi giornata"}
          </button>
        </div>

        {/* PROGRESS */}
        <div style={card}>
          <div style={{ fontWeight: 600 }}>
            Avanzamento {progress.toFixed(1)}%
          </div>

          <div style={progressBg}>
            <div style={{ ...progressFill, width: `${progress}%` }} />
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>{totalWorked}h</strong> — <strong>{remaining}h</strong>
          </div>
        </div>

        {/* FILTRO */}
        <div style={{ marginTop: 20 }}>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={input}>
            <option value="all">Tutti i mesi</option>
            {[...new Set(entries.map(e => e.date.slice(0,7)))].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* LISTA */}
        {Object.entries(grouped).map(([mese, items]) => (
          <div key={mese}>
            <div style={{ marginTop: 30, fontWeight: 700, fontSize: 18 }}>
              {new Date(mese + "-01").toLocaleDateString("it-IT", {
                month: "long",
                year: "numeric"
              })}
            </div>

            {items.map((e, i) => {
              const { giorno, data } = formatDateFull(e.date);

              return (
                <div key={i} style={{
                  ...card,
                  border: editingIndex === i ? "2px solid #111" : "1px solid transparent"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>

                    <div>
                      <div style={{ fontSize: 13, color: "#888" }}>{giorno}</div>
                      <div style={{ fontSize: 16, marginBottom: 10 }}>{data}</div>

                      <div style={{ fontWeight: 600 }}>{e.activity}</div>
                      <div style={{ color: "#666", marginBottom: 10 }}>{e.note}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{e.hours}h</div>
                      <div style={{ fontSize: 12 }}>{e.start} - {e.end}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => handleEdit(i)} style={ghostBtn}>Modifica</button>
                    <button onClick={() => handleDelete(i)} style={dangerBtn}>Elimina</button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <img
            src="https://nutsadv.it/wp-content/uploads/nuts_lettering_black.png"
            style={{ height: 22, opacity: 0.6 }}
          />
        </div>

      </div>
    </div>
  );
}

/* STILI */

const wrapper = {
  fontFamily: "Poppins, sans-serif",
  background: "#f7f7f7",
  minHeight: "100vh",
  padding: 20,
};

const container = {
  maxWidth: 900,
  margin: "0 auto",
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  marginTop: 20,
  boxShadow: "0 6px 30px rgba(0,0,0,0.06)",
};

const input = {
  width: "100%",
  marginTop: 12,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 14,
  boxSizing: "border-box",
};

const mainBtn = {
  marginTop: 10,
  width: "100%",
  padding: 12,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
};

const ghostBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  marginRight: 8,
  cursor: "pointer",
};

const dangerBtn = {
  ...ghostBtn,
  color: "red",
};

const progressBg = {
  height: 10,
  background: "#eee",
  borderRadius: 10,
  marginTop: 10,
};

const progressFill = {
  height: "100%",
  background: "#111",
};
