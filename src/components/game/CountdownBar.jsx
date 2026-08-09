import React, { useState } from "react";
import { History } from "lucide-react";
import Ball from "./Ball";
import { computeDrawLabels } from "./gameConfig";

export default function CountdownBar({ currentPeriod, countdown, history, threshold }) {
  const [open, setOpen] = useState(false);
  const mm = String(Math.floor(countdown / 60)).padStart(1, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  return (
    <section className="relative z-20 w-full min-h-[60px] flex items-center px-2.5 mt-2">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/3d894f8cc_36538ee6e_8632b15db8afba0b38df5ed344a581181d097203.png"
          alt="Bar Background"
        />
      </div>
      <div className="relative z-10 flex items-center w-full">
        <p className="text-figma-23 font-normal font-figma-roboto-flex leading-figma-27 text-[#bd5c60]">{currentPeriod}</p>
        <p className="text-[clamp(14px,3.88vw,24px)] font-normal font-figma-inter leading-[1.1667] text-[#514f4e] ml-1">Giai đoạn</p>
        <div className="bg-[#ca0a1b] rounded-[7px] shadow-[inset_0_0_0_1px_#c50b0e] w-[70px] min-h-[35px] flex items-center justify-center ml-[7px]">
          <p className="text-[clamp(15px,4.52vw,28px)] font-normal font-figma-beiruti leading-[0.8214] text-[#dfa7ab] tabular-nums">{mm}:{ss}</p>
        </div>
        <p className="text-figma-22 font-normal font-figma-inter leading-figma-26 text-[#434243] ml-[18px]">Đặt cược</p>
        <button onClick={() => setOpen((v) => !v)} className="ml-auto flex items-center gap-1.5 hover:opacity-80 transition-opacity pr-1">
          <p className="text-[clamp(14px,4.04vw,25px)] font-normal font-figma-pt-sans leading-[1.04] text-[#e38541]">Historical draw</p>
          <History className="w-5 h-4 text-[#e38541]" />
        </button>
      </div>

      {open && (
        <div className="absolute top-[62px] right-2 z-30 w-[230px] max-h-[260px] overflow-y-auto bg-[#1b1b3a]/95 rounded-lg border border-white/10 p-2 space-y-2 backdrop-blur-md">
          {history.length === 0 && <p className="text-white/60 text-xs text-center py-2">Chưa có lịch sử</p>}
          {history.map((h, i) => {
            const l = computeDrawLabels(h.drawn, threshold);
            return (
              <div key={i} className="flex items-center gap-2 bg-white/5 rounded-md p-2">
                <span className="text-[#f0a0a4] text-[11px] shrink-0 w-[70px] truncate">{h.period}</span>
                <div className="flex gap-1 flex-wrap">
                  {h.drawn.map((n, j) => <Ball key={j} number={n} size={20} />)}
                </div>
                <span className="text-[#e39662] text-[11px] ml-auto">{l.big} · {l.parity}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}