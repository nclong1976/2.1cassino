import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getGameConfig, subscribeGameStore } from "@/lib/gameStore";

export default function GameCard({ game, onClick, t }) {
  const [ripples, setRipples] = useState([]);
  const [config, setConfig] = useState(() => getGameConfig(game.gameId || game.id));

  // Subscribe to real-time status changes from Admin (Hot-swapping)
  useEffect(() => {
    setConfig(getGameConfig(game.gameId || game.id));
    const unsub = subscribeGameStore(() => {
      setConfig(getGameConfig(game.gameId || game.id));
    });
    return unsub;
  }, [game.gameId, game.id]);

  const currentStatus = config?.status || game.status || "active";
  const isMaintenance = currentStatus === "maintenance";
  const isDisabled = currentStatus === "disabled";

  const handleTap = (e) => {
    if (isMaintenance || isDisabled) {
      onClick?.({ ...game, status: currentStatus });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 600);
    onClick?.({ ...game, status: currentStatus });
  };

  if (isDisabled) {
    return (
      <div className="relative w-full aspect-[130/162] rounded-xl overflow-hidden opacity-40 bg-black/40 flex flex-col justify-center items-center p-2 text-center border border-red-500/20 cursor-not-allowed">
        <span className="text-[10px] text-red-300 font-bold px-2 py-0.5 rounded-full bg-red-900/60 mb-1">
          {t("disabled_badge")}
        </span>
        <p className="text-[11px] text-white/60 font-medium truncate w-full">{game.title}</p>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleTap}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: isMaintenance ? 1 : 0.97 }}
      className="relative w-full aspect-[130/162] rounded-xl overflow-clip flex flex-col justify-end pb-3 items-center cursor-pointer group"
    >
      <img src={game.bg} alt={game.title} className="absolute inset-0 w-full h-full object-cover z-0" />
      {game.overlay && <img src={game.overlay.src} alt="" className={game.overlay.cls} />}

      {game.badge && !isMaintenance && (
        <span
          className={`absolute top-1 right-1 z-20 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            game.badge === "hot" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`}
        >
          {game.badge === "hot" ? t("badge_hot") : t("badge_new")}
        </span>
      )}

      {isMaintenance && (
        <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center p-1">
          <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full bg-amber-600/90 shadow">
            {t("maintenance_badge")}
          </span>
          <span className="text-[9px] text-amber-200/80 mt-1">Vui lòng quay lại sau</span>
        </div>
      )}

      {game.title && (
        <p className={`relative z-20 text-center px-1 ${game.titleClass}`}>{game.title}</p>
      )}

      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute rounded-full bg-white/60 z-30 pointer-events-none"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
        />
      ))}
    </motion.button>
  );
}