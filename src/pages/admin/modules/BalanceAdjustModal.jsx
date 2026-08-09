import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { adminAdjustBalance } from "@/lib/localAuth";
import { getUserData } from "@/lib/userData";
import { pushNotification } from "@/lib/localNotifications";
import { Wallet, PlusCircle, MinusCircle, FileText } from "lucide-react";

const inputCls = "w-full bg-[#0d102b] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7033ff] transition-all";

export default function BalanceAdjustModal({ open, onOpenChange, user, onSaved, updateUserData: propUpdateUserData }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState("add"); // "add" | "sub"
  const [currentBalance, setCurrentBalance] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const uData = getUserData(user.id);
      const rawBal = uData.balance !== undefined ? uData.balance : (user.balance || 0);
      const cleanBal = parseFloat(String(rawBal).replace(/[^0-9.-]+/g, "")) || 0;
      setCurrentBalance(cleanBal);
      setAmount("");
      setReason("");
      setMode("add");
    }
  }, [user]);

  const handleAdjust = () => {
    if (!user) return;

    // 1. Sanitization & Validation: Làm sạch số tiền nhập bằng parseFloat
    const numAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Chưa nhập số tiền",
        description: "Vui lòng nhập số tiền hợp lệ lớn hơn 0 USD.",
        variant: "destructive",
      });
      return;
    }

    // 2. Làm sạch lý do: Nếu để trống, tự động gán mặc định "Admin điều chỉnh số dư"
    const cleanReason = reason.trim() || "Admin điều chỉnh số dư";

    // 3. Làm sạch số dư hiện tại bằng parseFloat
    const uData = getUserData(user.id);
    const rawCur = uData.balance !== undefined ? uData.balance : (user.balance || 0);
    const cleanCurBal = parseFloat(String(rawCur).replace(/[^0-9.-]+/g, "")) || 0;

    // 4. Tính toán số dư mới với Math.max(0, ...) để ngăn số dư âm
    const rawTarget = mode === "add" ? cleanCurBal + numAmount : Math.max(0, cleanCurBal - numAmount);
    const finalBalance = Math.max(0, parseFloat(rawTarget.toFixed(2)));

    setSaving(true);
    try {
      // Cập nhật CSDL local & lưu Transaction Audit Log
      const res = adminAdjustBalance(user.id, numAmount, cleanReason, mode);

      // Gọi updateUserData để kích hoạt event đồng bộ tức thì trên toàn ứng dụng
      if (propUpdateUserData) {
        propUpdateUserData(user.id, { balance: finalBalance });
      }

      // Gửi thông báo đến tài khoản người dùng
      try {
        pushNotification(user.id, {
          title: mode === "add" ? "Biến động số dư: + CỘNG TIỀN" : "Biến động số dư: - TRỪ TIỀN",
          body: `Tài khoản của bạn vừa được ${mode === "add" ? "cộng" : "trừ"} $${numAmount.toLocaleString()} USD. Lý do: ${cleanReason}. Số dư hiện tại: $${finalBalance.toLocaleString()} USD`,
          type: mode === "add" ? "deposit" : "withdraw",
        });
      } catch { /* ignore notification error */ }

      // Phản hồi Toast Notification thành công chuẩn yêu cầu
      const actionText = mode === "add" ? "cộng" : "trừ";
      const targetName = user.account || user.full_name || user.email || "người dùng";
      toast({
        title: "Đã cập nhật số dư thành công!",
        description: `Đã ${actionText} $${numAmount.toLocaleString()} USD cho ${targetName}. Số dư mới: $${(res?.newBalance ?? finalBalance).toLocaleString()} USD`,
      });

      // Reset form & đóng modal
      setAmount("");
      setReason("");
      setMode("add");
      if (onSaved) onSaved();
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Thao tác thất bại",
        description: e.message || "Không thể điều chỉnh số dư",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addQuickAmount = (val) => {
    const currentVal = parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
    setAmount(String(currentVal + val));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161936] border-white/15 text-white max-w-md rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#ebd39a]">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Nạp / Trừ Tiền Nhanh (Admin)
          </DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-4 py-2 text-sm">
            {/* User Overview */}
            <div className="bg-[#0d102b] p-3.5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-base">{user.full_name || user.account}</p>
                <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                  <span>UID: {user.id?.slice(0, 10)}</span>
                  <span>•</span>
                  <span>{user.email || user.account}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50 uppercase tracking-wider">Số dư hiện tại</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  ${currentBalance.toLocaleString()} <span className="text-xs font-normal text-white/60">USD</span>
                </p>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-2 p-1.5 bg-[#0d102b] rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  mode === "add"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <PlusCircle className="w-4 h-4" /> ➕ Cộng Tiền
              </button>
              <button
                type="button"
                onClick={() => setMode("sub")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  mode === "sub"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <MinusCircle className="w-4 h-4" /> ➖ Trừ Tiền
              </button>
            </div>

            {/* Input Amount */}
            <div className="space-y-2">
              <label className="text-xs text-white/70 font-medium flex items-center justify-between">
                <span>Nhập số tiền ($ USD)</span>
                {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                  <span className="text-emerald-400 text-xs font-bold font-mono">
                    = $ {parseFloat(amount).toLocaleString()} USD
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className={`${inputCls} pl-8 font-mono font-semibold text-base`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  autoFocus
                />
              </div>

              {/* Quick Select Buttons (Quick Amount Chips) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[100, 500, 1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addQuickAmount(val)}
                    className="text-xs bg-white/5 hover:bg-[#7033ff]/30 text-white/90 font-mono px-2.5 py-1 rounded-md border border-white/10 hover:border-[#7033ff]/50 transition-colors"
                  >
                    +${val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Audit Reason */}
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span>Lý do (Không bắt buộc)</span>
              </label>
              <input
                className={inputCls}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Admin điều chỉnh số dư (mặc định)"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-end pt-3 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Hủy
          </Button>
          <Button
            onClick={handleAdjust}
            disabled={saving}
            className={`font-bold px-6 ${
              mode === "add"
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/30"
                : "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-lg shadow-rose-900/30"
            }`}
          >
            {saving ? "Đang xử lý..." : mode === "add" ? "Xác Nhận Cộng" : "Xác Nhận Trừ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

