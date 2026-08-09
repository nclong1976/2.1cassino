import React from "react";
import GameCard from "./GameCard";

export default function GameGrid({ games, loading, onClick, t }) {
  const cls = "grid grid-cols-3 gap-x-[19px] gap-y-[19px] px-[clamp(16px,6.4vw,33px)]";
  if (loading) {
    return (
      <div className={cls}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[130/162] rounded-xl bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }
  if (games.length === 0) {
    return <p className="text-center text-white/40 text-sm py-8">{t("search")} · ∅</p>;
  }
  return (
    <div className={cls}>
      {games.map((g) => (
        <GameCard key={g.id} game={g} onClick={onClick} t={t} />
      ))}
    </div>
  );
}