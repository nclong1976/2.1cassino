import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Shield, RefreshCw } from "lucide-react";
import { getAuditLogs } from "@/lib/gameStore";

export default function AuditLogModal({ open, onOpenChange }) {
  const [logs, setLogs] = useState([]);

  const reload = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    if (open) reload();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12142d] border-white/15 text-white max-w-2xl w-[95vw] rounded-2xl p-5">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
          <DialogTitle className="text-base font-bold text-[#bd9c59] flex items-center gap-2">
            <History className="w-4 h-4" /> Nhật ký thao tác (Audit Log)
          </DialogTitle>
          <button
            onClick={reload}
            className="text-xs text-white/60 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Tải lại
          </button>
        </DialogHeader>

        <div className="py-2 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-center text-white/40 py-10 text-sm">Chưa có nhật ký thao tác nào</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-white/60">
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {log.adminId} ({log.ip})
                  </span>
                  <span className="text-[11px] text-white/40">{log.timestamp}</span>
                </div>
                <p className="font-semibold text-white text-sm">Trò chơi: {log.gameTitle}</p>

                <div className="space-y-1.5 pt-1">
                  {log.diffs?.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-black/20 rounded px-2.5 py-1 text-[11px]">
                      <span className="text-white/70">{d.field}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-red-400 line-through opacity-80">{d.old}</span>
                        <span className="text-white/40">→</span>
                        <span className="text-emerald-400 font-bold">{d.new}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
