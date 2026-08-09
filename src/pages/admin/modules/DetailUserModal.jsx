import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui";
import { getUserData } from "@/lib/userData";
import { Eye, User, CreditCard, StickyNote } from "lucide-react";

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center gap-3 py-2 border-b border-white/5">
    <span className="text-white/50 text-xs sm:text-sm font-medium">{label}</span>
    <span className="text-white text-xs sm:text-sm text-right font-semibold">{value}</span>
  </div>
);

export default function DetailUserModal({ open, onOpenChange, user }) {
  if (!user) return null;

  const uData = getUserData(user.id);
  const currentBalance = uData.balance !== undefined ? uData.balance : (user.balance || 0);
  const bankLinked = uData.linked?.find((l) => l.type === "bank") || user.bankInfo || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161936] border-white/15 text-white max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#ebd39a]">
            <Eye className="w-5 h-5 text-[#7033ff]" />
            Chi Tiết Tài Khoản Người Dùng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Top card */}
          <div className="bg-[#0f122c] p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-white flex items-center gap-1.5">
                {user.full_name || user.account}
                <Badge tone={user.role === "admin" ? "purple" : "neutral"}>{user.role || "user"}</Badge>
              </p>
              <p className="text-xs text-white/50 mt-0.5">Mã UID: {user.id}</p>
            </div>
            <div className="text-right">
              <Badge tone={user.locked ? "red" : "green"}>
                {user.locked ? "🔒 Đã Khóa" : "🟢 Đang Hoạt Động"}
              </Badge>
            </div>
          </div>

          {/* Details list */}
          <div className="bg-[#0f122c] p-3.5 rounded-xl border border-white/10 space-y-0 text-sm">
            <h4 className="text-xs font-semibold text-[#bd9c59] uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Thông Tin Cơ Bản
            </h4>
            <Row label="Tên tài khoản (Account)" value={user.account || "—"} />
            <Row label="Họ và tên" value={user.full_name || "—"} />
            <Row label="Email" value={user.email || "—"} />
            <Row label="Số điện thoại" value={user.phone || "—"} />
            <Row label="Số dư tài khoản" value={`$${currentBalance.toLocaleString()} USD`} />
            <Row
              label="Ngày đăng ký"
              value={user.created_date ? new Date(user.created_date).toLocaleString("vi-VN") : "—"}
            />
          </div>

          {/* Bank Info */}
          <div className="bg-[#0f122c] p-3.5 rounded-xl border border-white/10 space-y-0 text-sm">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Ngân Hàng Rút Tiền
            </h4>
            {bankLinked ? (
              <>
                <Row label="Tên Ngân Hàng" value={bankLinked.bankName || "—"} />
                <Row label="Số Tài Khoản" value={bankLinked.accountNumber || "—"} />
                <Row label="Chủ Tài Khoản" value={bankLinked.holder || "—"} />
              </>
            ) : (
              <p className="text-xs text-white/40 py-2">Chưa liên kết ngân hàng</p>
            )}
          </div>

          {/* Admin Note */}
          {user.adminNote && (
            <div className="bg-[#0f122c] p-3.5 rounded-xl border border-white/10 text-sm">
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <StickyNote className="w-3.5 h-3.5" /> Ghi Chú Admin
              </h4>
              <p className="text-xs text-white/80 bg-[#161936] p-2 rounded-lg mt-1 border border-white/5">
                {user.adminNote}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
