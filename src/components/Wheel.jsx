// src/components/Wheel.jsx
import { useState, useRef, useEffect } from "react";

// Default animation duration (ms) -- can be overridden via prop `animationMs`.
const DEFAULT_ANIMATION_MS = 4000;

const DEFAULT_PRIZES = [
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

export default function Wheel({
  options = null,
  animationMs = DEFAULT_ANIMATION_MS,
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);

  // Modal animation duration (ms)
  const MODAL_ANIMATION_MS = 220;

  const radius = 150;
  const center = 150;
  const items =
    Array.isArray(options) && options.length >= 2 ? options : DEFAULT_PRIZES;
  const sliceAngle = 360 / items.length;

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
    // Clear previous prize while spinning
    setPrize("");
    // Choose random prize index
    const prizeIndex = Math.floor(Math.random() * items.length);

    // Calculate final rotation so the arrow points to the center of the chosen slice.
    // We keep the wheel rotating clockwise (positive degrees) and add extra full spins
    // for a nicer animation. Because the SVG element itself is rotated, we need to
    // compute the angle that places the slice center at the top (0deg) where the arrow is.
    const spins = 4; // number of full rotations

    // Angle to bring chosen slice center to 0deg (top). We compute the center angle of the slice
    // measured from the positive X axis (to the right) increasing clockwise, then convert so that
    // 0deg is at the top. The slice center (in degrees from 0 at right, clockwise) is:
    // sliceCenter = prizeIndex * sliceAngle + sliceAngle/2
    const sliceCenter = prizeIndex * sliceAngle + sliceAngle / 2;

    // The wheel's rotation is applied as CSS rotate(deg) and rotates the whole SVG. To place the
    // slice center at the top (where the arrow is pointing), the wheel needs to rotate so that
    // the sliceCenter is at -90deg (SVG 0deg is to the right). Therefore targetAngle = 270 - sliceCenter
    // (since -90deg == 270deg). Normalize to [0,360)
    let targetAngle = 270 - sliceCenter;
    targetAngle = ((targetAngle % 360) + 360) % 360;

    // We'll compute the delta rotation relative to the current accumulated rotation
    // so each spin lands correctly even when rotation is non-zero.
    pendingPrizeRef.current = prizeIndex;

    // Use a small epsilon to avoid landing exactly on a border due to float precision
    const epsilon = 0.0001;

    setRotation((prev) => {
      // Normalize current rotation to [0,360)
      const current = ((prev % 360) + 360) % 360;
      // Compute the minimal positive delta to move current -> targetAngle
      const needed = (targetAngle - current + 360) % 360;
      const totalDelta = spins * 360 + needed + epsilon;
      return prev + totalDelta;
    });

    // The rest of the finishing logic is handled in the transitionend handler
  };

  // Refs to coordinate end of transition and chosen prize
  const svgRef = useRef(null);
  const pendingPrizeRef = useRef(null);
  const closeBtnRef = useRef(null);
  const spinBtnRef = useRef(null);
  // (no modalRef needed currently)
  const modalTimeoutRef = useRef(null);

  // Open modal with mount animation
  const openModal = () => {
    // mount first so we can animate in
    setModalMounted(true);
    // lock body scroll
    document.body.style.overflow = "hidden";
    // allow mount -> then start enter animation
    setTimeout(() => {
      setShowModal(true);
      // focus close button after the modal finishes entering
      setTimeout(() => closeBtnRef.current?.focus(), MODAL_ANIMATION_MS);
    }, 20);
  };

  const closeModal = () => {
    // start exit animation
    setShowModal(false);
    // after animation, unmount and restore
    if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    modalTimeoutRef.current = setTimeout(() => {
      setModalMounted(false);
      // restore body scroll
      document.body.style.overflow = "";
      // return focus to spin
      spinBtnRef.current?.focus();
    }, MODAL_ANIMATION_MS + 10);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
      document.body.style.overflow = "";
    };
  }, [items]);

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    const handleTransitionEnd = (e) => {
      // Only handle transform transitions coming from the svg element itself
      if (e.propertyName !== "transform") return;
      // Ensure the listener's currentTarget is the svg node (robust against child events)
      if (e.currentTarget !== node) return;

      const prizeIndex = pendingPrizeRef.current;
      if (typeof prizeIndex === "number") {
        setPrize(items[prizeIndex]);
        pendingPrizeRef.current = null;
        // Open modal to show prize (animated)
        openModal();
      }
      setSpinning(false);
    };

    node.addEventListener("transitionend", handleTransitionEnd);
    return () => node.removeEventListener("transitionend", handleTransitionEnd);
  }, [items]);

  return (
    <div className="flex flex-col items-center mt-8 relative">
      {/* Flecha */}
      <div
        className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-4xl z-20"
        aria-hidden="true"
      >
        🔻
      </div>

      {/* Ruleta */}
      <svg
        ref={svgRef}
        role="img"
        aria-label="Prize wheel"
        tabIndex={0}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        onKeyDown={(e) => {
          // allow Enter/Space to trigger spin
          if ((e.key === "Enter" || e.key === " ") && !spinning) {
            e.preventDefault();
            spin();
          }
        }}
        width={2 * center}
        height={2 * center}
        // Use inline transition so duration is driven by JS prop
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${animationMs}ms ease-out`,
          outline: "none",
          transformOrigin: "50% 50%",
          transformBox: "fill-box",
          pointerEvents: "none", // allow clicks to pass through to button below
        }}
      >
        {items.map((p, i) => {
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
        ref={spinBtnRef}
        type="button"
        onClick={spin}
        aria-disabled={spinning}
        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {/* Mensaje del premio */}
      {/* Modal for prize result */}
      {modalMounted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prize-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              closeModal();
            }
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              transition: `opacity ${MODAL_ANIMATION_MS}ms ease`,
              opacity: showModal ? 1 : 0,
            }}
            onClick={() => {
              closeModal();
            }}
          />

          {/* Dialog */}
          <div
            className="relative bg-white rounded-lg p-6 max-w-sm mx-4 text-center"
            style={{
              transition: `opacity ${MODAL_ANIMATION_MS}ms ease, transform ${MODAL_ANIMATION_MS}ms ease`,
              opacity: showModal ? 1 : 0,
              transform: showModal
                ? "translateY(0) scale(1)"
                : "translateY(8px) scale(0.98)",
            }}
          >
            <h2 id="prize-title" className="text-xl font-semibold mb-4">
              You won!
            </h2>
            <p className="mb-6 text-lg">{prize}</p>
            <button
              ref={closeBtnRef}
              type="button"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={() => {
                closeModal();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
