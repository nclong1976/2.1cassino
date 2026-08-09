import React from "react";
import { FolderOpen, ArrowRight } from "lucide-react";

export default function EmptyState({ title = "Chưa Có Dữ Liệu", description = "Tài khoản của bạn chưa có lịch sử nào. Hãy bắt đầu trải nghiệm ngay!", actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#bd9c59]/10 border border-[#bd9c59]/30 flex items-center justify-center mb-3">
        <FolderOpen className="w-8 h-8 text-[#bd9c59]" />
      </div>
      <h4 className="text-white font-semibold text-base mb-1">{title}</h4>
      <p className="text-white/60 text-xs max-w-xs mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#bd9c59] to-[#d4af37] text-[#1e1832] font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
