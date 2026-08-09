import React, { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, refreshing, children }) {
  const [pull, setPull] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  const onStart = (e) => {
    if (e.currentTarget.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };
  const onMove = (e) => {
    if (!pulling.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(dy * 0.5, THRESHOLD + 24));
  };
  const onEnd = () => {
    if (pulling.current && pull >= THRESHOLD) onRefresh();
    pulling.current = false;
    setPull(0);
  };

  return (
    <div
      className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      <div style={{ height: pull }} className="flex items-center justify-center text-white/50 text-[11px] overflow-hidden">
        {(pull > 0 || refreshing) && (
          <>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Đang làm mới..." : pull >= THRESHOLD ? "Thả để làm mới" : "Kéo xuống để làm mới"}
          </>
        )}
      </div>
      {children}
    </div>
  );
}