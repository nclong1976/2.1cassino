import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Ball from "@/components/game/Ball";
import { GAMES, generateHistory } from "@/components/awards/gamesData";

export default function ChartPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = GAMES.find((g) => g.gameId === gameId);
  const history = useMemo(() => generateHistory(game?.type || "lucky28", 50), [gameId]);

  const freq = useMemo(() => {
    const counts = Array.from({ length: 10 }, (_, i) => ({ digit: String(i), count: 0 }));
    history.forEach((d) => {
      if (d.isXoso) {
        d.special.split("").forEach((c) => {
          const n = Number(c);
          if (!isNaN(n)) counts[n].count++;
        });
      } else {
        d.numbers.forEach((n) => { counts[n].count++; });
      }
    });
    return counts;
  }, [history]);

  const max = freq.reduce((m, f) => Math.max(m, f.count), 0);
  const hot = [...freq].sort((a, b) => b.count - a.count)[0];
  const cold = [...freq].sort((a, b) => a.count - b.count)[0];

  return (
    <main className="max-w-[616px] w-full mx-auto relative min-h-[100dvh] bg-[#0A0E1A] flex flex-col font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_80%_15%,rgba(255,215,0,0.10),transparent_45%)]" />
      <header className="relative z-20 px-4 h-14 flex items-center gap-3 border-b border-white/10 bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0">
        <button onClick={() => navigate("/giai-thuong")} className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-white font-bold text-sm flex-1 truncate">Biểu Đồ · {game?.title}</h1>
      </header>

      <div className="relative z-10 flex-1 px-4 py-4 pb-28 space-y-4">
        <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
          <p className="text-white/70 text-xs mb-2">Tần suất xuất hiện (50 kỳ gần nhất)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={freq}>
              <XAxis dataKey="digit" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0A0E1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {freq.map((f, i) => <Cell key={i} fill={f.count === max && max > 0 ? "#FFD700" : "#7CC7FF"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-[#FFD700]">Nóng: {hot?.digit} ({hot?.count} lần)</span>
            <span className="text-blue-300">Lạnh: {cold?.digit} ({cold?.count} lần)</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
          <p className="text-white/70 text-xs mb-3">Lưới kỳ gần đây (heatmap)</p>
          <div className="space-y-1.5">
            {history.slice(0, 14).map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-white/40 text-[10px] w-24 truncate">{d.period}</span>
                <div className="flex gap-1 flex-wrap">
                  {d.isXoso ? (
                    <span className="px-2 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] text-xs tracking-widest">{d.special}</span>
                  ) : (
                    d.numbers.map((n, j) => <Ball key={j} number={n} size={20} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}