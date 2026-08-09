import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BottomNav from "@/components/BottomNav";
import GameSection from "@/components/lobby/GameSection";
import { LOBBY_CATEGORIES, CAT_LABELS } from "@/components/lobby/lobbyData";
import { GAMES } from "@/components/home/homeData";
import { useAuth } from "@/lib/AuthContext";
import { useUserData } from "@/lib/userData";
import { getGameConfig } from "@/lib/gameStore";

export default function ContainerAug4CodiaStudio3() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data } = useUserData(user?.id);
  const balance = data?.balance ?? 0;

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  const games = category === "all" ? GAMES : GAMES.filter((g) => g.category === category);

  const handleClick = (game, tier) => {
    const cfg = getGameConfig(game.gameId || game.id);
    const status = game.status === "disabled" || cfg?.status === "disabled" ? "disabled" : (cfg?.status || game.status);

    if (status === "disabled") {
      toast({ title: "Trò chơi này đã bị tắt hoàn toàn", variant: "destructive" });
      return;
    }
    if (status === "maintenance") {
      toast({ title: "Game đang bảo trì, vui lòng quay lại sau", variant: "destructive" });
      return;
    }
    if (!isAuthenticated) {
      toast({ title: "Vui lòng đăng nhập để tham gia" });
      return;
    }
    if (balance < tier.minBalance) {
      toast({ title: "Số dư không đủ để vào phòng, vui lòng nạp tiền ngay", variant: "destructive" });
      return;
    }
    navigate(`/choi-game/${game.gameId}?tier=${tier.id}&g=${game.id}`);
  };

  return (
    <main className="w-full max-w-md mx-auto h-[100dvh] relative overflow-hidden bg-[#0A0E1A] flex flex-col font-sans">
      {/* Deep-space nebulae overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(124,199,255,0.12),transparent_42%),radial-gradient(circle_at_82%_24%,rgba(255,215,0,0.08),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(124,255,203,0.08),transparent_48%)]" />

      {/* Sticky header with title + real-time balance + category filters */}
      <header className="relative z-20 sticky top-0 bg-[#0A0E1A]/85 backdrop-blur-md border-b border-white/10">
        <div className="px-4 h-12 flex items-center justify-between">
          <h1 className="text-white font-bold text-base">Sảnh Chơi</h1>

          {/* Real-time Wallet Balance Badge */}
          <div className="flex items-center gap-1.5 bg-[#1e1832] border border-[#bd9c59]/40 rounded-full px-2.5 py-1 text-xs text-[#bd9c59] font-bold shadow-sm">
            <Wallet className="w-3.5 h-3.5 text-[#bd9c59]" />
            <span>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {LOBBY_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                category === c.key ? "bg-[#FFD700] text-[#0A0E1A] font-semibold" : "bg-white/10 text-white/70"
              }`}
            >
              {CAT_LABELS[c.key]}
            </button>
          ))}
        </div>
      </header>

      {/* Scrollable lobby */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-28 [&::-webkit-scrollbar]:hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {games.map((g) => (
            <GameSection key={g.id} game={g} balance={balance} onSelect={handleClick} loading={loading} />
          ))}
          {!loading && games.length === 0 && (
            <p className="text-center text-white/40 text-sm py-10">Chưa có game trong danh mục này</p>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </main>
  );
}