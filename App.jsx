import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";

const TOTAL_HOURS = 225;

const ACTIVITY_TYPES = [
  "Video Production",
  "Video Post",
  "Graphic Design",
  "Web Design",
  "Social",
  "Blogging",
  "Photo",
  "Altro",
];

const toTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const toMin = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("it-IT", { weekday: "long" });
};

const getMonthName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("it-IT", { month: "long" }).toUpperCase();
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState("");
  const [startMin, setStartMin] = useState(600);
  const [endMin, setEndMin] = useState(1080);
  const [type, setType] = useState("");
  const [activity, setActivity] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState(false);
  const [filterMonth, setFilterMonth] = useState("ALL");

  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("nuts_tracker");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("nuts_tracker", JSON.stringify(entries));
  }, [entries]);

  const calcHours = () => Math.round(((endMin - startMin) / 60) * 2) / 2;

  const handleMove = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const percent = (clientX - rect.left) / rect.width;
    const min = 420 + percent * (1200 - 420);
    const snapped = Math.round(min / 30) * 30;

    if (dragging === "start") {
      setStartMin(Math.min(snapped, endMin - 30));
    }
    if (dragging === "end") {
      setEndMin(Math.max(snapped, startMin + 30));
    }
  };

  const handleMouseMove = (e) => dragging && handleMove(e.clientX);
  const handleTouchMove = (e) => dragging && handleMove(e.touches[0].clientX);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", () => setDragging(null));
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", () => setDragging(null));
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  });

  const formatDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const addEntry = () => {
    if (!date) {
      setError(true);
      return;
    }

    setError(false);

    const newEntry = {
      date,
      start: toTime(startMin),
      end: toTime(endMin),
      hours: calcHours(),
      type,
      activity,
    };

    let updated = editIndex !== null ? [...entries] : [...entries, newEntry];

    if (editIndex !== null) {
      updated[editIndex] = newEntry;
      setEditIndex(null);
    }

    updated.sort((a, b) => new Date(a.date) - new Date(b.date));

    setEntries(updated);
    resetForm();
  };

  const resetForm = () => {
    setDate("");
    setStartMin(600);
    setEndMin(1080);
    setType("");
    setActivity("");
  };

  const editEntry = (i) => {
    const e = entries[i];
    setDate(e.date);
    setStartMin(toMin(e.start));
    setEndMin(toMin(e.end));
    setType(e.type);
    setActivity(e.activity);
    setEditIndex(i);
  };

  const totalDone = entries.reduce((acc, e) => acc + e.hours, 0);
  const percentage = Math.min((totalDone / TOTAL_HOURS) * 100, 100);
  const remaining = TOTAL_HOURS - totalDone;

  const filteredEntries = filterMonth === "ALL"
    ? entries
    : entries.filter(e => getMonthName(e.date) === filterMonth);

  const grouped = filteredEntries.reduce((acc, entry) => {
    const month = getMonthName(entry.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-neutral-100 text-black p-4 font-[Poppins]">
      <div className="max-w-2xl mx-auto space-y-4">

        <div className="flex items-center gap-3">
          <img src="https://nutsadv.it/wp-content/uploads/2018/02/600X600_LOGO_PNG_NERO.png" className="w-20" />
          <h1 className="text-2xl font-bold">Internship Tracker</h1>
        </div>

        <Card className={`bg-white ${editIndex !== null ? "ring-2 ring-black" : ""}`}>
          <CardContent className="p-4 space-y-4">

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={error ? "border-red-500" : ""}
            />

            {/* TRUE DRAG SLIDER */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Orario</p>

              <div ref={trackRef} className="relative h-10">
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full" />

                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-black rounded-full"
                  style={{
                    left: `${((startMin - 420) / (1200 - 420)) * 100}%`,
                    width: `${((endMin - startMin) / (1200 - 420)) * 100}%`
                  }}
                />

                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full cursor-pointer"
                  style={{ left: `${((startMin - 420) / (1200 - 420)) * 100}%` }}
                  onMouseDown={() => setDragging("start")}
                  onTouchStart={() => setDragging("start")}
                />

                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full cursor-pointer"
                  style={{ left: `${((endMin - 420) / (1200 - 420)) * 100}%` }}
                  onMouseDown={() => setDragging("end")}
                  onTouchStart={() => setDragging("end")}
                />
              </div>

              <div className="flex justify-between text-sm font-medium">
                <span>{toTime(startMin)}</span>
                <span>{toTime(endMin)} ({calcHours()}h)</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => {setStartMin(600); setEndMin(1080)}}>+8h</Button>
                <Button size="sm" onClick={() => {setStartMin(840); setEndMin(1080)}}>+4h</Button>
              </div>
            </div>

            <Select onValueChange={setType} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo attività" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Dettaglio attività (opzionale)"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />

            <Button onClick={addEntry}>
              {editIndex !== null ? "Salva modifica" : "Aggiungi giornata"}
            </Button>

          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <p>Avanzamento</p>
              <p className="font-bold">{percentage.toFixed(1)}%</p>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-black" animate={{ width: `${percentage}%` }} />
            </div>

            <div className="flex justify-between">
              <p>Fatte: {totalDone}h</p>
              <p className="font-bold">Restano: {remaining}h</p>
            </div>
          </CardContent>
        </Card>

        <Select onValueChange={setFilterMonth} value={filterMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Filtra mese" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tutti</SelectItem>
            {[...new Set(entries.map(e => getMonthName(e.date)))].map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-6">
          {Object.keys(grouped).map(month => (
            <div key={month}>
              <h2 className="text-xl font-bold">{month}</h2>

              <div className="space-y-2 mt-2">
                {grouped[month].map((e, i) => (
                  <Card key={i} className={`bg-white ${e.hours > 7 ? "border-2 border-black" : ""}`}>
                    <CardContent className="p-4 flex justify-between items-center">

                      <div>
                        <p className="text-sm text-gray-500 capitalize">{getDayName(e.date)}</p>
                        <p className="font-bold">{formatDate(e.date)}</p>
                        <p className="text-sm font-semibold text-gray-800">{e.type}</p>
                        <p className="text-sm text-gray-500">{e.activity}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">{e.hours}h</p>
                        <p className="text-sm text-gray-500">{e.start} - {e.end}</p>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <img src="https://nutsadv.it/wp-content/uploads/nuts_lettering_black.png" className="h-6 opacity-70" />
        </div>

      </div>
    </div>
  );
}
