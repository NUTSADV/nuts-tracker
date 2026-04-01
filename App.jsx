import { useState, useEffect } from "react";

const TOTAL_HOURS = 225;

const activities = [
  "Video Production","Video Post","Graphic Design","Web Design",
  "Social","Blogging","Photo","Altro"
];

const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
};

const timeToMinutes = (t) => {
  const [h,m] = t.split(":").map(Number);
  return h*60+m;
};

export default function App(){

  const [date,setDate]=useState("");
  const [start,setStart]=useState("10:00");
  const [end,setEnd]=useState("18:00");
  const [activity,setActivity]=useState("");
  const [note,setNote]=useState("");
  const [entries,setEntries]=useState([]);
  const [editingId,setEditingId]=useState(null);
  const [filterMonth,setFilterMonth]=useState("all");

  const [startMin,setStartMin]=useState(600);
  const [endMin,setEndMin]=useState(1080);

  useEffect(()=>{
    const saved=localStorage.getItem("nuts");
    if(saved) setEntries(JSON.parse(saved));
  },[]);

  useEffect(()=>{
    localStorage.setItem("nuts",JSON.stringify(entries));
  },[entries]);

  useEffect(()=>{
    setStartMin(timeToMinutes(start));
    setEndMin(timeToMinutes(end));
  },[start,end]);

  const handleAdd=()=>{
    if(!date) return alert("Inserisci la data");

    const hours=Math.round((endMin-startMin)/30)/2;

    const newEntry={
      id: editingId ?? Date.now(),
      date,
      start: minutesToTime(startMin),
      end: minutesToTime(endMin),
      hours,
      activity,
      note
    };

    if(editingId){
      setEntries(entries.map(e=>e.id===editingId?newEntry:e));
      setEditingId(null);
    }else{
      setEntries([...entries,newEntry]);
    }
  };

  const handleEdit=(e)=>{
    setDate(e.date);
    setStart(e.start);
    setEnd(e.end);
    setStartMin(timeToMinutes(e.start));
    setEndMin(timeToMinutes(e.end));
    setActivity(e.activity);
    setNote(e.note);
    setEditingId(e.id);
  };

  const handleDelete=(id)=>{
    setEntries(entries.filter(e=>e.id!==id));
  };

  const sorted=[...entries].sort((a,b)=>new Date(a.date)-new Date(b.date));

  const grouped=sorted.reduce((acc,e)=>{
    const key=e.date.slice(0,7);
    if(!acc[key]) acc[key]=[];
    acc[key].push(e);
    return acc;
  },{});

  const months=Object.keys(grouped).sort();

  const total=entries.reduce((a,e)=>a+e.hours,0);
  const remaining=TOTAL_HOURS-total;
  const progress=(total/TOTAL_HOURS)*100;

  const lastUpdate=new Date().toLocaleString("it-IT");

  return(
    <div style={{fontFamily:"Poppins, sans-serif",background:"#f6f6f6",padding:20}}>

      <div style={{maxWidth:900,margin:"0 auto"}}>

        {/* HEADER */}
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <img src="https://nutsadv.it/wp-content/uploads/2018/02/600X600_LOGO_PNG_NERO.png" style={{width:80}}/>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:600}}>Ultimo aggiornamento</div>
            <div style={{fontSize:12}}>{lastUpdate}</div>
          </div>
        </div>

        <h1>Internship Tracker</h1>

        {/* FORM */}
        <div style={card}>

          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={input}/>

          <div style={{display:"flex",gap:10}}>
            <input type="time" value={start} onChange={e=>setStart(e.target.value)} style={input}/>
            <input type="time" value={end} onChange={e=>setEnd(e.target.value)} style={input}/>
          </div>

          {/* SLIDER */}
          <div style={{marginTop:20}}>
            <input type="range" min={0} max={1440} value={startMin}
              onChange={e=>setStartMin(Math.min(Number(e.target.value),endMin-30))}
              style={{width:"100%"}}/>
            <input type="range" min={0} max={1440} value={endMin}
              onChange={e=>setEndMin(Math.max(Number(e.target.value),startMin+30))}
              style={{width:"100%"}}/>
            <div>{minutesToTime(startMin)} → {minutesToTime(endMin)}</div>
          </div>

          <div style={{marginTop:10}}>
            <button onClick={()=>setEndMin(startMin+480)}>+8h</button>
            <button onClick={()=>setEndMin(startMin+240)}>+4h</button>
          </div>

          <select value={activity} onChange={e=>setActivity(e.target.value)} style={input}>
            <option>Tipo attività</option>
            {activities.map(a=><option key={a}>{a}</option>)}
          </select>

          <textarea value={note} onChange={e=>setNote(e.target.value)} style={input}/>

          <button onClick={handleAdd} style={mainBtn}>Aggiungi giornata</button>

        </div>

        {/* PROGRESS */}
        <div style={card}>
          <div>Avanzamento {progress.toFixed(1)}%</div>

          <div style={bar}>
            <div style={{...fill,width:`${progress}%`}}/>
          </div>

          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={label}>Svolte</div>
              <strong>{total}h</strong>
            </div>

            <div style={{textAlign:"right"}}>
              <div style={label}>Rimangono</div>
              <strong>{remaining}h</strong>
            </div>
          </div>
        </div>

        {/* FILTRO */}
        <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={input}>
          <option value="all">Tutti i mesi</option>
          {months.map(m=>{
            const d=new Date(m+"-01");
            return <option key={m} value={m}>
              {d.toLocaleDateString("it-IT",{month:"long",year:"numeric"})}
            </option>
          })}
        </select>

        {/* LISTA */}
        {months
          .filter(m=>filterMonth==="all"||m===filterMonth)
          .map(m=>{

          const d=new Date(m+"-01");

          return(
            <div key={m}>
              <h3>{d.toLocaleDateString("it-IT",{month:"long",year:"numeric"})}</h3>

              {grouped[m].map(e=>{

                const day=new Date(e.date).toLocaleDateString("it-IT",{weekday:"long"});
                const fullDate=new Date(e.date).toLocaleDateString("it-IT");

                return(
                  <div key={e.id} style={{
                    ...card,
                    border: editingId===e.id?"2px solid black":"none"
                  }}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>

                      <div>
                        <div style={{fontSize:12,color:"#777"}}>
                          {day.charAt(0).toUpperCase()+day.slice(1)}
                        </div>
                        <div>{fullDate}</div>

                        <div style={{fontWeight:600}}>{e.activity}</div>
                        <div>{e.note}</div>
                      </div>

                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:28,fontWeight:700}}>{e.hours}h</div>
                        <div>{e.start} - {e.end}</div>
                      </div>

                    </div>

                    <div style={{marginTop:10}}>
                      <button onClick={()=>handleEdit(e)}>Modifica</button>
                      <button onClick={()=>handleDelete(e.id)} style={{color:"red"}}>Elimina</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div style={{textAlign:"center",marginTop:40}}>
          <img src="https://nutsadv.it/wp-content/uploads/nuts_lettering_black.png" style={{height:20}}/>
        </div>

      </div>
    </div>
  );
}

const card={background:"#fff",padding:20,borderRadius:16,marginTop:20};
const input={width:"100%",marginTop:10,padding:12,borderRadius:10,border:"1px solid #ddd"};
const mainBtn={marginTop:10,width:"100%",padding:12,background:"#111",color:"#fff",border:"none",borderRadius:10};
const bar={height:10,background:"#eee",marginTop:10};
const fill={height:"100%",background:"#111"};
const label={fontSize:12,color:"#777"};
