import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, X, Check, Building2 } from "lucide-react";
import { VIETNAM_BANKS } from "./vietnamBanks";
import { useAuth } from "@/lib/AuthContext";

export default function LinkAccountModal({ open, onOpenChange, onAdd, linked }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("bank");
  const [bankSearch, setBankSearch] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [bank, setBank] = useState({
    bankName: "",
    accountNumber: "",
    holder: user?.full_name?.toUpperCase() || "",
  });
  const [crypto, setCrypto] = useState({ walletAddress: "" });

  // Reset holder khi mở lại
  const handleOpen = (v) => {
    if (v) setBank((b) => ({ ...b, holder: user?.full_name?.toUpperCase() || b.holder }));
    onOpenChange(v);
  };

  const filteredBanks = useMemo(() => {
    const q = bankSearch.toLowerCase();
    if (!q) return VIETNAM_BANKS;
    return VIETNAM_BANKS.filter(
      (b) => b.name.toLowerCase().includes(q) || b.fullName.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
    );
  }, [bankSearch]);

  const selectBank = (b) => {
    setBank((prev) => ({ ...prev, bankName: b.name }));
    setBankSearch("");
    setShowBankList(false);
  };

  const submit = () => {
    if (tab === "bank") {
      const holderName = (user?.full_name || user?.account || "CHỦ TÀI KHOẢN").toUpperCase();
      if (!bank.bankName || !bank.accountNumber) return;
      onAdd({ id: "L" + Date.now(), type: "bank", bankName: bank.bankName, accountNumber: bank.accountNumber, holder: holderName });
      setBank({ bankName: "", accountNumber: "", holder: holderName });
    } else {
      if (!crypto.walletAddress) return;
      onAdd({ id: "L" + Date.now(), type: "crypto", walletAddress: crypto.walletAddress, network: "USDT-TRC20" });
      setCrypto({ walletAddress: "" });
    }
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-[460px] w-[95vw] bg-[#1e1832] border-[#323b51] text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#bd9c59] flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Liên Kết Tài Khoản
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("bank")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "bank" ? "bg-gradient-to-r from-[#bd9c59] to-[#d4b870] text-[#1e1832] shadow-md" : "bg-[#2a2040] text-white/70 hover:bg-[#32294a]"}`}
          >
            🏦 Ngân hàng
          </button>
          <button
            onClick={() => setTab("crypto")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "crypto" ? "bg-gradient-to-r from-[#bd9c59] to-[#d4b870] text-[#1e1832] shadow-md" : "bg-[#2a2040] text-white/70 hover:bg-[#32294a]"}`}
          >
            ₿ Crypto
          </button>
        </div>

        {/* Danh sách đã liên kết */}
        {linked.length > 0 && (
          <div className="space-y-1.5 mb-4 max-h-28 overflow-y-auto no-scrollbar">
            <p className="text-[11px] text-white/50 font-medium">Đã liên kết:</p>
            {linked.map((a) => (
              <div key={a.id} className="text-xs bg-[#2a2040] rounded-lg px-3 py-2 flex justify-between items-center">
                <span className="text-white/80">
                  {a.type === "bank"
                    ? `${a.bankName} · ****${a.accountNumber.slice(-4)} · ${a.holder}`
                    : `${a.network} · ${a.walletAddress.slice(0, 12)}...`}
                </span>
                <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" />Đã liên kết</span>
              </div>
            ))}
          </div>
        )}

        {tab === "bank" ? (
          <div className="space-y-3">
            {/* Chọn ngân hàng với search */}
            <div>
              <Label className="text-xs text-white/70 mb-1.5 block">Ngân hàng <span className="text-red-400">*</span></Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBankList((v) => !v)}
                  className="w-full flex items-center justify-between bg-[#2a2040] border border-[#3a2d52] rounded-lg px-3 py-2.5 text-sm hover:border-[#bd9c59] transition-colors"
                >
                  <span className={bank.bankName ? "text-white" : "text-white/40"}>
                    {bank.bankName || "Chọn ngân hàng..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showBankList ? "rotate-180" : ""}`} />
                </button>

                {showBankList && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1530] border border-[#3a2d52] rounded-xl shadow-2xl overflow-hidden">
                    {/* Search trong danh sách */}
                    <div className="p-2 border-b border-[#3a2d52]">
                      <div className="flex items-center gap-2 bg-[#2a2040] rounded-lg px-2.5 py-1.5">
                        <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <input
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          placeholder="Tìm ngân hàng..."
                          className="bg-transparent outline-none text-sm text-white w-full placeholder:text-white/30"
                          style={{ fontSize: "16px" }}
                          autoFocus
                        />
                        {bankSearch && (
                          <button onClick={() => setBankSearch("")}><X className="w-3.5 h-3.5 text-white/40" /></button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {filteredBanks.length === 0 && (
                        <p className="text-center text-white/40 text-xs py-4">Không tìm thấy ngân hàng</p>
                      )}
                      {filteredBanks.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => selectBank(b)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#2a2040] transition-colors text-left"
                        >
                          <span className="text-[10px] font-bold text-[#bd9c59] bg-[#bd9c59]/10 px-1.5 py-0.5 rounded min-w-[42px] text-center">
                            {b.code}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{b.name}</p>
                            <p className="text-[10px] text-white/40 truncate">{b.fullName}</p>
                          </div>
                          {bank.bankName === b.name && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Số tài khoản */}
            <div>
              <Label className="text-xs text-white/70 mb-1.5 block">Số tài khoản <span className="text-red-400">*</span></Label>
              <Input
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value.replace(/\D/g, "") })}
                placeholder="Nhập số tài khoản"
                inputMode="numeric"
                className="bg-[#2a2040] border-[#3a2d52] focus:border-[#bd9c59] text-white"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Chủ tài khoản – tự động điền read-only từ tên đăng ký */}
            <div>
              <Label className="text-xs text-white/70 mb-1.5 flex items-center justify-between">
                <span>Chủ tài khoản (Tên đăng ký định danh) <span className="text-red-400">*</span></span>
              </Label>
              <Input
                value={(user?.full_name || user?.account || "CHỦ TÀI KHOẢN").toUpperCase()}
                readOnly
                disabled
                className="bg-[#151224] border-[#3a2d52] text-[#bd9c59] font-bold uppercase cursor-not-allowed"
                style={{ fontSize: "16px" }}
              />
              <p className="text-[10px] text-white/40 mt-1">Tự động điền theo thông tin đăng ký (không thể sửa để bảo mật)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-white/70 mb-1.5 block">Địa chỉ ví (USDT-TRC20)</Label>
              <Input
                value={crypto.walletAddress}
                onChange={(e) => setCrypto({ ...crypto, walletAddress: e.target.value })}
                placeholder="T..."
                className="bg-[#2a2040] border-[#3a2d52] focus:border-[#bd9c59] text-white"
                style={{ fontSize: "16px" }}
              />
              <p className="text-[11px] text-amber-400/80 mt-1.5">⚠ Chỉ hỗ trợ mạng TRC20. Kiểm tra kỹ trước khi lưu.</p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button
            onClick={submit}
            disabled={tab === "bank" ? (!bank.bankName || !bank.accountNumber || !bank.holder) : !crypto.walletAddress}
            className="w-full bg-gradient-to-r from-[#bd9c59] to-[#d4b870] text-[#1e1832] font-semibold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed h-11 rounded-xl"
          >
            Liên kết tài khoản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}