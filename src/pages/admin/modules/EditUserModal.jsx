import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { adminUpdateUser } from "@/lib/localAuth";
import { getUserData } from "@/lib/userData";
import { base44 } from "@/api/base44Client";
import { User, CreditCard, StickyNote } from "lucide-react";
import { VIETNAM_BANKS } from "@/components/profile/vietnamBanks";

const inputCls = "w-full bg-[#0d102b] border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7033ff]";

export default function EditUserModal({ open, onOpenChange, user, onSaved }) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.account || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setNewPassword("");
      setAdminNote(user.adminNote || "");

      // Lấy thông tin ngân hàng đã liên kết
      const uData = getUserData(user.id);
      const bankLinked = uData.linked?.find((l) => l.type === "bank") || user.bankInfo || {};
      setBankName(bankLinked.bankName || "");
      setBankAccount(bankLinked.accountNumber || "");
      setBankHolder(bankLinked.holder || user.full_name || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Cập nhật local auth
      adminUpdateUser(user.id, {
        full_name: fullName,
        phone,
        email,
        password: newPassword || undefined,
        bankName,
        bankAccount,
        bankHolder,
        adminNote,
      });

      // 2. Thử cập nhật trên Base44 DB nếu có record
      try {
        await base44.entities.User.update(user.id, {
          full_name: fullName,
          email,
        });
      } catch { /* ignore base44 fallback */ }

      toast({
        title: "Cập nhật thành công",
        description: `Đã lưu thông tin tài khoản ${user.account || user.email}`,
      });

      if (onSaved) onSaved();
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Lỗi cập nhật",
        description: e.message || "Không thể lưu thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161936] border-white/15 text-white max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#ebd39a]">
            <User className="w-5 h-5 text-[#7033ff]" />
            Chỉnh Sửa Tài Khoản: {user?.account || user?.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Thông tin cá nhân */}
          <div className="space-y-2 bg-[#0f122c] p-3.5 rounded-xl border border-white/10">
            <h3 className="text-xs font-semibold text-[#bd9c59] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Thông Tin Cá Nhân
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Tên hiển thị (Họ Tên)</label>
                <input
                  className={inputCls}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Số điện thoại</label>
                <div className="relative">
                  <input
                    className={inputCls}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-white/60 mb-1 block">Email liên hệ</label>
                <input
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-white/60 mb-1 block flex items-center justify-between">
                  <span>Đặt lại mật khẩu đăng nhập (Reset Password)</span>
                  <span className="text-[10px] text-amber-400/80">Bỏ trống nếu giữ nguyên</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>
            </div>
          </div>

          {/* Quản lý Ngân Hàng / Ví */}
          <div className="space-y-2 bg-[#0f122c] p-3.5 rounded-xl border border-white/10">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Thông Tin Ngân Hàng Rút Tiền
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="text-xs text-white/60 mb-1 block">Chọn Ngân Hàng</label>
                <select
                  className={inputCls}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="" className="bg-[#161936]">-- Chọn ngân hàng --</option>
                  {VIETNAM_BANKS.map((b) => (
                    <option key={b.code} value={b.name} className="bg-[#161936]">
                      {b.name} - {b.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Số Tài Khoản</label>
                <input
                  className={inputCls}
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="STK Ngân hàng"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Tên Chủ Tài Khoản</label>
                <input
                  className={inputCls}
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value.toUpperCase())}
                  placeholder="NGUYEN VAN A"
                />
              </div>
            </div>
          </div>

          {/* Ghi chú Admin */}
          <div className="space-y-1 bg-[#0f122c] p-3.5 rounded-xl border border-white/10">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <StickyNote className="w-3.5 h-3.5" /> Ghi Chú Nội Bộ Admin (Admin Note)
            </label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú hoặc đánh giá tài khoản..."
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-white/10">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white">
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white font-semibold"
          >
            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
