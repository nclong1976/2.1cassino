import React from "react";
import RoomCard from "./RoomCard";
import { TIERS } from "./lobbyData";

function SkeletonSection() {
  return (
    <div className="mb-7">
      <div className="h-6 w-40 rounded bg-white/10 animate-pulse mb-3" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[112px] rounded-2xl bg-white/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function GameSection({ game, balance, onSelect, loading }) {
  if (loading) return <SkeletonSection />;
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#FFD700] to-[#ffab40]" />
        <h2 className="text-white font-bold text-base sm:text-lg tracking-wide select-none leading-snug">
          {game.title}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {TIERS.map((tier) => (
          <RoomCard key={tier.id} game={game} tier={tier} balance={balance} onClick={() => onSelect(game, tier)} />
        ))}
      </div>
    </div>
  );
}