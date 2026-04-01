import { useState, useEffect } from "react";

const ORE_TOTALI = 225;

const mesiIT = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
];

const giorniIT = [
  "Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"
];

export default function App() {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nuts_entries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("nuts_entries", JSON.stringify(entries));
  }, [entries]);

  const calcHours = () => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return Math.max(0, Math.round(diff * 2) / 2);
  };

  const handleSubmit = () => {
    if (!date) {
      setError(true);
      return;
    }

    const newEntry = {
      id: editingId || Date.now(),
      date,
      start,
      end,
      type,
      note,
      hours: calcHours()
    };

    if (editingId) {
      setEntries(entries.map(e => e.id === editingId ? newEntry : e));
      setEditingId(null);
    } else {
      setEntries([...entries, newEntry]);
    }

    setDate("");
    setStart("10:00");
    setEnd("18:00");
    setType("");
    setNote("");
    setError(false);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setDate(entry.date);
    setStart(entry.start);
    setEnd(entry.end);
    setType(entry.type);
    setNote(entry.note);
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const remaining = ORE_TOTALI - totalHours;
  const progress = (totalHours / ORE_TOTALI) * 100;

  const sorted = [...entries].sort((a,b)=> new Date(a.date) - new Date(b.date));

  const grouped = sorted.reduce((acc, entry) => {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const orderedKeys = Object.keys(grouped).sort((a,b)=>{
    const [ay, am] = a.split("-");
    const [by, bm] = b.split("-");
    return new Date(ay, am) - new Date(by, bm);
  });

  const formatDate = (d) => {
    const dateObj = new Date(d);
    return `${giorniIT[dateObj.getDay()]} ${dateObj.getDate()} ${mesiIT[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  };

  const lastUpdate = new Date().toLocaleString("it-IT");

  return (
    <div style={{padding:40, fontFamily:"Poppins, sans-serif", background:"#f5f5f5"}}>
      
      {/* HEADER */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <img src="https://nutsadv.it/wp-content/uploads/2018/02/600X600_LOGO_PNG_NERO.png" style={{width:90}}/>
        <div style={{textAlign:"right", fontSize:12}}>
          <b>Ultimo aggiornamento</b><br/>{lastUpdate}
        </div>
      </div>

      <h1 style={{marginBottom:20}}>Internship Tracker</h1>

      {/* FORM */}
      <div style={{
        background:"#fff",
        padding:24,
        borderRadius:16,
        boxShadow:"0 4px 20px rgba(0,0,0,0.05)",
        border: editingId ? "2px solid #000" : "1px solid #eee"
      }}>

        <input
          type="date"
          style={{
    ...inputStyle,
    border: error ? "2px solid red" : "1px solid #ddd"
  }}
          value={date}
          onChange={e=>{setDate(e.target.value); setError(false)}}
          style={{
            width:"100%",
            padding:12,
            borderRadius:10,
            border: error ? "2px solid red" : "1px solid #ddd",
            marginBottom:12
          }}
        />

        <div style={{display:"flex", gap:12}}>
          <input type="time" value={start} onChange={e=>setStart(e.target.value)} style={inputStyle}/>
          <input type="time" value={end} onChange={e=>setEnd(e.target.value)} style={inputStyle}/>
        </div>

        <div style={{marginTop:12, display:"flex", gap:10}}>
          <button style={ghostBtn} onClick={()=>{setStart("10:00"); setEnd("18:00")}}>+8h</button>
          <button style={ghostBtn} onClick={()=>{setStart("14:00"); setEnd("18:00")}}>+4h</button>
        </div>

        <select value={type} onChange={e=>setType(e.target.value)} style={{...inputStyle, marginTop:12}}>
          <option value="">Tipo attività</option>
          <option>Video Production</option>
          <option>Graphic Design</option>
          <option>Web Design</option>
          <option>Social</option>
          <option>Blogging</option>
          <option>Photo</option>
          <option>Altro</option>
        </select>

        <textarea
          placeholder="Dettaglio attività"
          value={note}
          onChange={e=>setNote(e.target.value)}
          style={{...inputStyle, marginTop:12, minHeight:80}}
        />

        <button style={primaryBtn} onClick={handleSubmit}>
          {editingId ? "Salva modifica" : "Aggiungi giornata"}
        </button>
      </div>

      {/* PROGRESS */}
      <div style={cardStyle}>
        <b>Avanzamento {progress.toFixed(1)}%</b>

        <div style={{height:6, background:"#eee", margin:"10px 0", borderRadius:10}}>
          <div style={{width:`${progress}%`, height:6, background:"#000", borderRadius:10}}></div>
        </div>

        <div style={{display:"flex", justifyContent:"space-between"}}>
          <div><span style={{fontSize:12}}>Svolte</span><br/><b>{totalHours}h</b></div>
          <div style={{textAlign:"right"}}><span style={{fontSize:12}}>Rimangono</span><br/><b>{remaining}h</b></div>
        </div>
      </div>

      {/* LISTA */}
      {orderedKeys.map(key=>{
        const [year, month] = key.split("-");
        return (
          <div key={key}>
            <h3 style={{marginTop:30}}>
              {mesiIT[month]} {year}
            </h3>

            {grouped[key].map(e=>(
              <div key={e.id} style={cardStyle}>
                <div style={{display:"flex", justifyContent:"space-between"}}>
                  <div>
                    <div style={{color:"#777", fontSize:13}}>
                      {formatDate(e.date)}
                    </div>

                    <div style={{marginTop:6}}>
                      <b>{e.type}</b>
                    </div>

                    <div style={{color:"#666", marginTop:4}}>
                      {e.note}
                    </div>
                  </div>

                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:28, fontWeight:600}}>
                      {e.hours}h
                    </div>
                    <div style={{fontSize:12, color:"#777"}}>
                      {e.start} - {e.end}
                    </div>
                  </div>
                </div>

                <div style={{marginTop:12, display:"flex", gap:10}}>
                  <button style={ghostBtn} onClick={()=>handleEdit(e)}>Modifica</button>
                  <button style={dangerBtn} onClick={()=>handleDelete(e.id)}>Elimina</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* FOOTER */}
      <div style={{textAlign:"center", marginTop:40}}>
        <img src="https://nutsadv.it/wp-content/uploads/nuts_lettering_black.png" style={{width:140, opacity:0.6}}/>
      </div>

    </div>
  );
}

/* STILI */

const inputStyle = {
  width:"100%",
  padding:"12px 14px",
  borderRadius:10,
  border:"1px solid #ddd",
  fontFamily:"Poppins, sans-serif",
  fontSize:14,
  boxSizing:"border-box"
};

const cardStyle = {
  background:"#fff",
  padding:20,
  borderRadius:16,
  marginTop:12,
  boxShadow:"0 4px 20px rgba(0,0,0,0.05)"
};

const primaryBtn = {
  marginTop:16,
  width:"100%",
  padding:14,
  borderRadius:12,
  border:"none",
  background:"#000",
  color:"#fff",
  fontWeight:600,
  cursor:"pointer"
};

const ghostBtn = {
  padding:"8px 14px",
  borderRadius:10,
  border:"1px solid #ddd",
  background:"#fff",
  cursor:"pointer"
};

const dangerBtn = {
  padding:"8px 14px",
  borderRadius:10,
  border:"1px solid #ff4d4d",
  background:"#fff",
  color:"#ff4d4d",
  cursor:"pointer"
};
