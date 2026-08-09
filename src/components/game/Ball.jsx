import React from "react";
import { BALL_COLORS } from "./gameConfig";

export default function Ball({ number, size = 36 }) {
  const color = BALL_COLORS[number % BALL_COLORS.length];
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.42 }}
    >
      {number}
    </div>
  );
}