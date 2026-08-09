import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Ball from "@/components/game/Ball";
import { GAMES, generateHistory } from "@/components/awards/gamesData";

export default function DrawDetailsPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = GAMES.find((g) => g.gameId === gameId);
  const history = useMemo(() => generateHistory(game?.type || "lucky28", 40), [gameId]);

  return (
    <main className="max-w-[616px] w-full mx-auto relative min-h-[100dvh] bg-[#0A0E1A] flex flex-col font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_20%_15%,rgba(124,199,255,0.10),transparent_45%)]" />
      <header className="relative z-20 px-4 h-14 flex items-center gap-3 border-b border-white/10 bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0">
        <button onClick={() => navigate("/giai-thuong")} className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-white font-bold text-sm flex-1 truncate">Kết Quả · {game?.title}</h1>
      </header>

      <div className="relative z-10 flex-1 px-4 py-4 pb-28 space-y-2">
        {history.map((d, i) => {
          const many = !d.isXoso && d.numbers.length > 5;
          return (
            <div key={i} className="rounded-xl p-3 border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-[11px]">Kỳ {d.period}</span>
                {d.sum != null && <span className="text-white/80 text-xs">Tổng {d.sum}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {d.isXoso ? (
                  <span className="px-3 py-1 rounded-lg bg-[#FFD700]/15 text-[#FFD700] font-bold tracking-widest">{d.special}</span>
                ) : (
                  d.numbers.map((n, j) => <Ball key={j} number={n} size={many ? 22 : 28} />)
                )}
                <div className="ml-auto flex gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${d.big ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {d.big ? "Lớn" : "Nhỏ"}
                  </span>
                  {!d.isXoso && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${d.odd ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {d.odd ? "Lẻ" : "Chẵn"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </main>
  );
}