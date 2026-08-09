import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { BET_STATUS } from "./profileData";
import EmptyState from "@/components/common/EmptyState";

const FILTERS = [
  { key: "all", label: "Tất Cả" },
  { key: "pending", label: "Đang Chờ" },
  { key: "paid", label: "Đã Thanh Toán" },
  { key: "draw", label: "Mở Thưởng" },
];

export default function BetHistoryModal({ open, onOpenChange, bets = [] }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const safeBets = Array.isArray(bets) ? bets : [];

  const list = useMemo(
    () => safeBets.filter((b) =>
      (filter === "all" || String(b.status || "").toLowerCase() === filter.toLowerCase()) &&
      (!q || (b.gameId || "").toLowerCase().includes(q.toLowerCase()) || (b.game || "").toLowerCase().includes(q.toLowerCase()))
    ),
    [safeBets, filter, q]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] bg-[#1e1832] border-[#323b51] text-white rounded-2xl">
        <DialogHeader><DialogTitle className="text-[#bd9c59]">Lịch Sử Đặt Cược</DialogTitle></DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tra cứu theo Game ID..." className="pl-9 bg-[#2a2040] border-[#3a2d52]" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1 rounded-full text-xs ${filter === f.key ? "bg-[#bd9c59] text-[#1e1832]" : "bg-[#2a2040] text-white/70"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {list.length === 0 && (
            <EmptyState
              title="Chưa Có Đặt Cược"
              description="Tài khoản chưa có dữ liệu đặt cược. Hãy chọn trò chơi yêu thích để bắt đầu!"
            />
          )}
          {list.map((b) => {
            const s = BET_STATUS[b.status] || { label: String(b.status || "Đang chờ"), cls: "bg-gray-500/20 text-gray-300" };
            return (
              <div key={b.id || b.betId || Math.random()} className="bg-[#2a2040] rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{b.game || b.gameId || "Trò chơi"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-white/60">
                  <span>Kỳ: {b.period || "---"} · {b.label ? `${b.label} · ` : ""}{b.time || ""}</span>
                  <span className="text-[#bd9c59]">${b.amount} USD</span>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}