import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TX_STATUS } from "./profileData";
import EmptyState from "@/components/common/EmptyState";

const TITLE = { deposit: "Hồ Sơ Nạp Tiền", withdraw: "Hồ Sơ Rút Tiền", both: "Hồ Sơ Nạp / Rút" };

export default function TxHistoryModal({ open, onOpenChange, txs, mode }) {
  const list = useMemo(
    () => (Array.isArray(txs) ? txs.filter((t) => t && (mode === "both" || t.type === mode)) : []),
    [txs, mode]
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] bg-[#1e1832] border-[#323b51] text-white rounded-2xl">
        <DialogHeader><DialogTitle className="text-[#bd9c59]">{TITLE[mode] || "Lịch Sử Giao Dịch"}</DialogTitle></DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {list.length === 0 && (
            <EmptyState
              title="Chưa Có Giao Dịch"
              description="Chưa tìm thấy lịch sử nạp hoặc rút tiền nào cho tài khoản này."
            />
          )}
          {list.map((t, i) => {
            const s = TX_STATUS[t.status] || { label: t.status || "—", cls: "bg-white/10 text-white/70" };
            const channel = t.bank || t.method || "—";
            const amount = Number.isFinite(Number(t.amount)) ? Number(t.amount) : 0;
            const isDeposit = t.type === "deposit";
            return (
              <div key={t.txid || i} className="bg-[#2a2040] rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{t.txid || "—"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">{isDeposit ? "Nạp" : "Rút"} · {channel}</span>
                  <span className={`text-sm font-semibold ${isDeposit ? "text-emerald-400" : "text-amber-400"}`}>
                    {isDeposit ? "+" : "-"}{amount}
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">{t.time || ""}{t.status === "rejected" && t.reason ? ` · ${t.reason}` : ""}</div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}