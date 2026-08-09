import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { getGameConfig, subscribeGameStore } from "@/lib/gameStore";

function AssetBadge({ initial }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20">
      <span className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700]/30 to-transparent border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] font-bold text-lg">
        {initial}
      </span>
    </div>
  );
}

export default function RoomCard({ game, tier, balance, onClick }) {
  const [config, setConfig] = useState(() => getGameConfig(game.gameId || game.id));

  useEffect(() => {
    setConfig(getGameConfig(game.gameId || game.id));
    const unsub = subscribeGameStore(() => {
      setConfig(getGameConfig(game.gameId || game.id));
    });
    return unsub;
  }, [game.gameId, game.id]);

  const currentStatus = config?.status || game.status || "active";
  const maintenance = currentStatus === "maintenance" || currentStatus === "disabled";
  const locked = !maintenance && balance < tier.minBalance;

  return (
    <motion.button
      whileTap={{ scale: maintenance ? 1 : 0.97 }}
      onClick={() => onClick?.({ ...game, status: currentStatus })}
      className="relative w-full h-[112px] rounded-2xl overflow-clip flex items-center text-left transition-shadow"
      style={{ background: tier.gradient, boxShadow: `0 0 12px ${tier.glow}55` }}
    >
      <div className="relative z-10 pl-5">
        <p className="text-white/60 text-[11px] mt-0.5">Tối thiểu ${tier.minBalance.toLocaleString()} USD</p>
      </div>

      {/* Right visual asset with 3D border + dropshadow */}
      <div className="absolute right-0 top-0 bottom-0 w-[30%] overflow-hidden border-l border-white/15 shadow-[inset_4px_0_8px_rgba(0,0,0,0.45)]">
        {game.bg ? (
          <img src={game.bg} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <AssetBadge initial={game.title.charAt(0)} />
        )}
      </div>

      {maintenance && (
        <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center flex-col gap-1">
          <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow">
            Đang bảo trì
          </span>
          <span className="text-[10px] text-amber-200 font-medium">Vui lòng quay lại sau</span>
        </div>
      )}

      {locked && (
        <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
          <Lock className="w-8 h-8 text-white/80" />
        </div>
      )}
    </motion.button>
  );
}