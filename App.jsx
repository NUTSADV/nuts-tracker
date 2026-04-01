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
    if (!date) return;

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
    <div style={{padding:40, fontFamily:"Poppins, sans-serif", background:"#f6f6f6"}}>
      
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <img src="https://nutsadv.it/wp-content/uploads/2018/02/600X600_LOGO_PNG_NERO.png" style={{width:80}}/>
        <div style={{textAlign:"right", fontSize:12}}>
          <b>Ultimo aggiornamento</b><br/>{lastUpdate}
        </div>
      </div>

      <h1>Internship Tracker</h1>

      <div style={{background:"#fff", padding:20, borderRadius:12}}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%", marginBottom:10}}/>

        <div style={{display:"flex", gap:10}}>
          <input type="time" value={start} onChange={e=>setStart(e.target.value)}/>
          <input type="time" value={end} onChange={e=>setEnd(e.target.value)}/>
        </div>

        <div style={{marginTop:10}}>
          <button onClick={()=>{setStart("10:00"); setEnd("18:00")}}>+8h</button>
          <button onClick={()=>{setStart("14:00"); setEnd("18:00")}}>+4h</button>
        </div>

        <select value={type} onChange={e=>setType(e.target.value)} style={{width:"100%", marginTop:10}}>
          <option value="">Tipo attività</option>
          <option>Video Production</option>
          <option>Graphic Design</option>
          <option>Web Design</option>
          <option>Social</option>
          <option>Blogging</option>
          <option>Photo</option>
          <option>Altro</option>
        </select>

        <textarea placeholder="Dettaglio attività" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%", marginTop:10}}/>

        <button onClick={handleSubmit} style={{marginTop:10, width:"100%"}}>
          {editingId ? "Salva modifica" : "Aggiungi giornata"}
        </button>
      </div>

      <div style={{marginTop:20, background:"#fff", padding:20, borderRadius:12}}>
        <b>Avanzamento {progress.toFixed(1)}%</b>
        <div style={{height:6, background:"#ddd", margin:"10px 0"}}>
          <div style={{width:`${progress}%`, height:6, background:"#000"}}></div>
        </div>

        <div style={{display:"flex", justifyContent:"space-between"}}>
          <div><b>Svolte</b><br/>{totalHours}h</div>
          <div><b>Rimangono</b><br/>{remaining}h</div>
        </div>
      </div>

      {orderedKeys.map(key=>{
        const [year, month] = key.split("-");
        return (
          <div key={key}>
            <h3 style={{marginTop:30}}>
              {mesiIT[month]} {year}
            </h3>

            {grouped[key].map(e=>(
              <div key={e.id} style={{
                background:"#fff",
                padding:20,
                borderRadius:12,
                marginTop:10,
                border: editingId === e.id ? "2px solid red" : "none"
              }}>
                <div style={{display:"flex", justifyContent:"space-between"}}>
                  <div>
                    <div style={{color:"#777"}}>{formatDate(e.date)}</div>
                    <b>{e.type}</b><br/>
                    {e.note}
                  </div>

                  <div style={{textAlign:"right"}}>
                    <h2>{e.hours}h</h2>
                    <div style={{fontSize:12}}>
                      {e.start} - {e.end}
                    </div>
                  </div>
                </div>

                <div style={{marginTop:10}}>
                  <button onClick={()=>handleEdit(e)}>Modifica</button>
                  <button onClick={()=>handleDelete(e.id)} style={{color:"red"}}>Elimina</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div style={{textAlign:"center", marginTop:40}}>
        <img src="https://nutsadv.it/wp-content/uploads/nuts_lettering_black.png" style={{width:120}}/>
      </div>

    </div>
  );
}
