import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, AlertTriangle, Clock, XCircle, ArrowRight,
  Banknote, ListChecks, ChevronLeft
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { verifyPayPassword } from "@/lib/localAuth";
import { notifyAdmins } from "@/lib/localNotifications";
import { playWithdrawalSound } from "@/lib/soundEffects";
import EmptyState from "@/components/common/EmptyState";

const STATUS_MAP = {
  pending:   { label: "Đang chờ duyệt", cls: "bg-amber-500/20 text-amber-300",   icon: Clock },
  approved:  { label: "Đã duyệt",       cls: "bg-emerald-500/20 text-emerald-300", icon: CheckCircle2 },
  rejected:  { label: "Từ chối",         cls: "bg-red-500/20 text-red-300",        icon: XCircle },
  processing:{ label: "Đang xử lý",     cls: "bg-blue-500/20 text-blue-300",      icon: Clock },
};

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function WithdrawModal({ open, onOpenChange, balance, minTurnover, turnover, linked, onSubmit, withdrawRequests = [] }) {
  const { user } = useAuth();
  const [view, setView] = useState("form"); // "form" | "history"
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const bankAccounts = linked.filter((a) => a.type === "bank");
  const selected = bankAccounts.find((a) => a.id === bankId) || null;
  const numAmount = Number(amount) || 0;
  const canSubmit = selected && numAmount > 0 && numAmount <= balance && pin.length === 6 && turnover >= minTurnover;

  const handleSubmit = () => {
    setError("");
    if (!selected) return setError("Vui lòng chọn tài khoản ngân hàng");
    if (numAmount <= 0) return setError("Số tiền phải lớn hơn 0");
    if (numAmount > balance) return setError("Số dư không đủ");
    if (turnover < minTurnover) return setError(`Chưa đủ số vòng cược tối thiểu (${minTurnover})`);
    if (pin.length !== 6) return setError("Mật khẩu rút tiền phải đủ 6 số");

    // Xác minh PIN
    const pinOk = verifyPayPassword(user?.id, pin);
    if (!pinOk) return setError("Mật khẩu rút tiền không đúng");

    setSubmitting(true);
    // Tạo đơn rút tiền
    const reqId = "WD" + Date.now();
    const req = {
      id: reqId,
      amount: numAmount,
      bank: selected,
      status: "pending",
      time: new Date().toLocaleString("vi-VN"),
      createdAt: new Date().toISOString(),
    };

    // Thông báo cho admin
    notifyAdmins({
      type: "withdraw",
      title: "Yêu cầu rút tiền mới",
      body: `${user?.account || "Người dùng"} yêu cầu rút $${numAmount.toLocaleString()} USD → ${selected.bankName} · ${selected.accountNumber}`,
      requestId: reqId,
      userId: user?.id,
      userAccount: user?.account,
    });

    playWithdrawalSound();

    onSubmit({ amount: numAmount, bank: selected, pin, requestId: reqId, request: req });
    setSubmitting(false);
    setSuccess(true);

    // Reset sau 2s
    setTimeout(() => {
      setSuccess(false);
      setBankId(""); setAmount(""); setPin(""); setError("");
      setView("history");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setView("form"); setSuccess(false); } onOpenChange(v); }}>
      <DialogContent className="max-w-[460px] w-[95vw] bg-[#1e1832] border-[#323b51] text-white rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/10">
          <DialogTitle className="text-[#bd9c59] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {view === "history" && (
                <button onClick={() => setView("form")} className="mr-1 text-white/60 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <Banknote className="w-4 h-4" />
              {view === "form" ? "Rút Tiền" : "Lịch Sử Đơn Rút"}
            </div>
            {view === "form" && withdrawRequests.length > 0 && (
              <button
                onClick={() => setView("history")}
                className="text-xs text-white/50 hover:text-[#bd9c59] flex items-center gap-1 transition-colors"
              >
                <ListChecks className="w-3.5 h-3.5" /> Theo dõi đơn
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto no-scrollbar">

          {/* ── VIEW: FORM ─────────────────────────────────── */}
          {view === "form" && (
            <div className="space-y-4">
              {/* Success state */}
              {success && (
                <div className="flex flex-col items-center py-6 gap-3">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                  <p className="text-emerald-400 font-semibold text-base">Đã gửi yêu cầu rút tiền!</p>
                  <p className="text-white/50 text-sm text-center">Admin sẽ xét duyệt trong vòng 5–15 phút</p>
                </div>
              )}

              {!success && (
                <>
                  {/* Điều kiện */}
                  <div className="bg-[#2a2040] rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${balance > 0 ? "text-emerald-400" : "text-red-400"}`} />
                      <span>Số dư: <strong className="text-[#bd9c59]">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {turnover >= minTurnover
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                      <span>Vòng cược: <strong className={turnover >= minTurnover ? "text-emerald-400" : "text-amber-400"}>{turnover}/{minTurnover}</strong> {turnover >= minTurnover ? "✓" : "(chưa đủ)"}</span>
                    </div>
                  </div>

                  {/* Chọn ngân hàng */}
                  <div>
                    <Label className="text-xs text-white/70 mb-2 block">Tài khoản ngân hàng</Label>
                    {bankAccounts.length === 0 ? (
                      <p className="text-xs text-amber-400/80 bg-amber-500/10 px-3 py-2.5 rounded-lg">
                        ⚠ Chưa liên kết ngân hàng. Hãy liên kết trước khi rút tiền.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {bankAccounts.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setBankId(a.id)}
                            className={`w-full text-left rounded-xl px-3 py-2.5 text-sm transition-all border ${bankId === a.id ? "bg-[#bd9c59]/15 border-[#bd9c59] text-white" : "bg-[#2a2040] border-transparent text-white/80 hover:border-white/20"}`}
                          >
                            <p className="font-medium">{a.bankName}</p>
                            <p className="text-xs text-white/50">{a.accountNumber} · {a.holder}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Số tiền rút */}
                  <div>
                    <Label className="text-xs text-white/70 mb-2 block">Số tiền rút (USD)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="bg-[#2a2040] border-[#3a2d52] focus:border-[#bd9c59] text-white h-11"
                      style={{ fontSize: "16px" }}
                    />
                    {/* Quick amounts */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {QUICK_AMOUNTS.map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(String(q))}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${Number(amount) === q ? "bg-[#bd9c59] text-[#1e1832] font-semibold" : "bg-[#2a2040] text-white/60 hover:bg-[#32294a]"}`}
                        >
                          {q.toLocaleString()}
                        </button>
                      ))}
                      <button
                        onClick={() => setAmount(String(balance))}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[#2a2040] text-amber-400 hover:bg-[#32294a] transition-all"
                      >
                        Tất cả
                      </button>
                    </div>
                  </div>

                  {/* Mật khẩu rút tiền */}
                  <div>
                    <Label className="text-xs text-white/70 mb-2 block">Mật khẩu rút tiền (6 số)</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      className="bg-[#2a2040] border-[#3a2d52] focus:border-[#bd9c59] text-white h-11 tracking-widest text-center text-xl"
                      style={{ fontSize: "24px", letterSpacing: "0.5em" }}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="w-full h-12 bg-gradient-to-r from-[#bd9c59] to-[#d4b870] text-[#1e1832] font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Banknote className="w-4 h-4" />
                    {submitting ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── VIEW: HISTORY ──────────────────────────────── */}
          {view === "history" && (
            <div className="space-y-3">
              {withdrawRequests.length === 0 ? (
                <EmptyState
                  title="Chưa Có Đơn Rút Tiền"
                  description="Bạn chưa tạo đơn rút tiền nào. Tất cả yêu cầu rút tiền sẽ được hiển thị tại đây."
                />
              ) : (
                [...withdrawRequests].reverse().map((req) => {
                  const s = STATUS_MAP[req.status] || STATUS_MAP.pending;
                  const Icon = s.icon;
                  return (
                    <div key={req.id} className="bg-[#2a2040] rounded-xl p-3.5 border border-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">${req.amount?.toLocaleString()} USD</p>
                          <p className="text-xs text-white/50 mt-0.5">{req.bank?.bankName} · {req.bank?.accountNumber}</p>
                          <p className="text-[10px] text-white/30 mt-1">{req.time}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${s.cls}`}>
                          <Icon className="w-3 h-3" />
                          {s.label}
                        </div>
                      </div>
                      {req.adminNote && (
                        <p className="text-xs text-white/40 mt-2 border-t border-white/5 pt-2">Ghi chú: {req.adminNote}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}