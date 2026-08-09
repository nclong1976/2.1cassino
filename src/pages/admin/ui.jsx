import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Panel = ({ className = "", children, ...p }) => (
  <div className={`rounded-2xl bg-white/[0.04] border border-white/10 ${className}`} {...p}>{children}</div>
);

export const StatCard = ({ icon: Icon, label, value, accent = "purple" }) => {
  const grad = accent === "orange" ? "from-[#ffab40] to-[#e67e22]" : "from-[#7033ff] to-[#4b00ff]";
  return (
    <Panel className="p-3 sm:p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/55 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-white truncate">{value}</p>
      </div>
    </Panel>
  );
};

export const Th = ({ children, className = "" }) => (
  <th className={`text-left text-[11px] font-semibold text-white/55 uppercase tracking-wide px-3 py-2 ${className}`}>{children}</th>
);

export const Td = ({ children, className = "" }) => (
  <td className={`px-3 py-2.5 text-sm text-white/85 align-middle ${className}`}>{children}</td>
);

export const Badge = ({ tone = "neutral", children }) => {
  const tones = {
    neutral: "bg-white/10 text-white/70",
    green: "bg-emerald-500/20 text-emerald-300",
    red: "bg-red-500/20 text-red-300",
    amber: "bg-amber-500/20 text-amber-300",
    purple: "bg-[#7033ff]/25 text-[#b794ff]",
    blue: "bg-sky-500/20 text-sky-300",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${tones[tone] || tones.neutral}`}>{children}</span>;
};

export const inputCls = "h-9 w-full px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#7033ff]/60";

export const TableWrap = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[560px]">{children}</table>
  </div>
);

export const Empty = ({ colSpan, label = "Chưa có dữ liệu" }) => (
  <tr><td colSpan={colSpan} className="px-3 py-10 text-center text-white/40 text-sm">{label}</td></tr>
);

export const ConfirmDialog = ({ open, onOpenChange, title, desc, confirmText = "Xác nhận", onConfirm, tone = "danger" }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-[#161936] border-white/15 text-white max-w-sm">
      <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
      <p className="text-sm text-white/65">{desc}</p>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white">Huỷ</Button>
        {tone === "danger" ? (
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmText}</Button>
        ) : (
          <Button className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white" onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmText}</Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);