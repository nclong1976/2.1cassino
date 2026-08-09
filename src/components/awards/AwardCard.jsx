import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, BarChart3 } from "lucide-react";
import Ball from "@/components/game/Ball";

export default function AwardCard({ game, data, onClickChart, onClickDetails }) {
  const latest = data?.latest;
  const many = latest && !latest.isXoso && latest.numbers.length > 5;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-2xl p-4 backdrop-blur-md border bg-white/5 overflow-hidden transition-shadow ${
        data?.pulse ? "border-[#FFD700]/40 shadow-[0_0_24px_rgba(255,215,0,0.35)]" : "border-white/10"
      }`}
    >
      {data?.pulse && (
        <motion.div
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.3 }}
          className="absolute inset-0 rounded-2xl ring-2 ring-[#FFD700]/50 pointer-events-none"
        />
      )}

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFD700]/30 to-[#0A0E1A] border border-[#FFD700]/40 shadow-[0_0_12px_rgba(255,215,0,0.25)]">
          <span className="text-[#FFD700] font-bold text-sm">{game.title.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{game.title}</p>
          {latest && <p className="text-white/40 text-[11px]">Kỳ {latest.period}</p>}
        </div>
      </div>

      {latest && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {latest.isXoso ? (
            <span className="px-3 py-1 rounded-lg bg-[#FFD700]/15 text-[#FFD700] font-bold tracking-widest text-sm">{latest.special}</span>
          ) : (
            latest.numbers.map((n, i) => <Ball key={i} number={n} size={many ? 22 : 30} />)
          )}
          {latest.sum != null && (
            <div className="ml-auto flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">Tổng {latest.sum}</span>
              <span className={`px-2 py-0.5 rounded-full ${latest.big ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"}`}>
                {latest.big ? "Lớn" : "Nhỏ"}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${latest.odd ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                {latest.odd ? "Lẻ" : "Chẵn"}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 h-px bg-white/10" />

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          onClick={() => onClickChart(game)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[#FFD700] text-xs font-medium hover:bg-[#FFD700]/10 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" /> Biểu đồ <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onClickDetails(game)}
          className="px-3 py-1.5 rounded-lg text-white/80 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          Vào xem Giải Thưởng
        </button>
      </div>
    </motion.div>
  );
}