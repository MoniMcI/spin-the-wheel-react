// src/components/Wheel.jsx
import { useState } from "react";

export default function Wheel() {
  const prizes = [
    "Prize 1 🎁",
    "Prize 2 🎉",
    "Prize 3 🍀",
    "Prize 4 💎",
    "Prize 5 🎈",
    "Prize 6 🥳",
  ];

  const colors = [
    "#FF6B6B",
    "#6BCB77",
    "#4D96FF",
    "#FFD93D",
    "#FF6EC7",
    "#845EC2",
  ];

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState("");

  const radius = 150;
  const center = 150;
  const sliceAngle = 360 / prizes.length;

  const createSlice = (index) => {
    const startAngle = sliceAngle * index;
    const endAngle = sliceAngle * (index + 1);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
    const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
    const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
    const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

    return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    // Elegir premio aleatorio
    const prizeIndex = Math.floor(Math.random() * prizes.length);

    // Calcular rotación final para que la flecha quede centrada
    const spins = 3; // vueltas completas
    const targetAngle = 360 - (prizeIndex * sliceAngle + sliceAngle / 2);
    const finalRotation = spins * 360 + targetAngle;

    setRotation((prev) => prev + finalRotation);

    setTimeout(() => {
      setPrize(prizes[prizeIndex]);
      setSpinning(false);
    }, 4000); // duración de la animación
  };

  return (
    <div className="flex flex-col items-center mt-8 relative">
      {/* Flecha */}
      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-4xl z-20">
        🔻
      </div>

      {/* Ruleta */}
      <svg
        width={2 * center}
        height={2 * center}
        className="transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {prizes.map((p, i) => {
          const angle = sliceAngle * i + sliceAngle / 2;
          const rad = (angle * Math.PI) / 180;
          const textRadius = radius * 0.65;
          const x = center + textRadius * Math.cos(rad);
          const y = center + textRadius * Math.sin(rad);

          return (
            <g key={i}>
              <path
                d={createSlice(i)}
                fill={colors[i % colors.length]}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                fill="white"
                fontSize="14"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${angle} ${x} ${y})`}
              >
                {p}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Botón Spin */}
      <button
        onClick={spin}
        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {/* Mensaje del premio */}
      {prize && !spinning && (
        <div className="mt-4 text-xl font-bold text-green-700">
          You won {prize}!
        </div>
      )}
    </div>
  );
}
