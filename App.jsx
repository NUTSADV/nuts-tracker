import { useState, useEffect, useRef } from "react";

const TOTAL_HOURS = 225;

const toTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function App() {
  const [startMin, setStartMin] = useState(600);
  const [endMin, setEndMin] = useState(1080);

  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

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

  useEffect(() => {
    const move = (e) => dragging && handleMove(e.clientX);
    const up = () => setDragging(null);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  });

  return (
    <div style={{ padding: 40, fontFamily: "Poppins" }}>
      <h1>Internship Tracker</h1>

      <div style={{ marginTop: 40 }}>
        <p>Orario</p>

        <div
          ref={trackRef}
          style={{
            position: "relative",
            height: 40,
            background: "#eee",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              height: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "black",
              left: `${((startMin - 420) / (1200 - 420)) * 100}%`,
              width: `${((endMin - startMin) / (1200 - 420)) * 100}%`,
            }}
          />

          <div
            onMouseDown={() => setDragging("start")}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              background: "black",
              borderRadius: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              left: `${((startMin - 420) / (1200 - 420)) * 100}%`,
              cursor: "pointer",
            }}
          />

          <div
            onMouseDown={() => setDragging("end")}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              background: "black",
              borderRadius: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              left: `${((endMin - 420) / (1200 - 420)) * 100}%`,
              cursor: "pointer",
            }}
          />
        </div>

        <p style={{ marginTop: 20 }}>
          {toTime(startMin)} - {toTime(endMin)}
        </p>
      </div>
    </div>
  );
}
//test
