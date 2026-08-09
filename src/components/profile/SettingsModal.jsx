import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Monitor, Tablet, ShieldCheck, KeyRound, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { updatePassword, updatePayPassword } from "@/lib/localAuth";

// Phát hiện thiết bị và trình duyệt thực tế hiện tại
const detectCurrentDevice = () => {
  const ua = navigator.userAgent;
  let os = "Thiết bị không xác định";
  let icon = Monitor;

  if (/android/i.test(ua)) {
    os = "Android Mobile";
    icon = Smartphone;
  } else if (/iPhone/i.test(ua)) {
    os = "iPhone (iOS)";
    icon = Smartphone;
  } else if (/iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    os = "iPad (iPadOS)";
    icon = Tablet;
  } else if (/Windows/i.test(ua)) {
    os = "Windows PC";
    icon = Monitor;
  } else if (/Macintosh|Mac OS/i.test(ua)) {
    os = "Mac (macOS)";
    icon = Monitor;
  } else if (/Linux/i.test(ua)) {
    os = "Linux PC";
    icon = Monitor;
  }

  let browser = "Web Browser";
  if (/edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Google Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Apple Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";

  return {
    id: "dev_current",
    name: `${os} · ${browser}`,
    icon,
    current: true,
    time: "Đang hoạt động",
  };
};

export default function SettingsModal({ open, onOpenChange, onToast }) {
  const { user } = useAuth();
  const [pw, setPw] = useState({ cur: "", new: "", confirm: "" });
  const [pin, setPin] = useState("");
  const [devices, setDevices] = useState([]);

  // Cập nhật danh sách thiết bị khi mở modal
  useEffect(() => {
    if (open) {
      const currentDev = detectCurrentDevice();
      setDevices([
        currentDev,
        { id: "dev_secondary", name: "Phiên đăng nhập khác (Web)", icon: Smartphone, current: false, time: "2 giờ trước" },
      ]);
    }
  }, [open]);

  const submitPw = () => {
    if (!pw.cur || !pw.new) return onToast({ title: "Vui lòng nhập đầy đủ mật khẩu", variant: "destructive" });
    if (pw.new.length < 6) return onToast({ title: "Mật khẩu mới tối thiểu 6 ký tự", variant: "destructive" });
    if (pw.new !== pw.confirm) return onToast({ title: "Mật khẩu xác nhận không khớp", variant: "destructive" });

    const res = updatePassword(user?.id, pw.cur, pw.new);
    if (!res.ok) return onToast({ title: res.msg || "Cập nhật mật khẩu thất bại", variant: "destructive" });

    onToast({ title: "Đổi mật khẩu đăng nhập thành công", variant: "success" });
    setPw({ cur: "", new: "", confirm: "" });
  };

  const submitPin = () => {
    if (!/^\d{6}$/.test(pin)) return onToast({ title: "PIN rút tiền phải đúng 6 chữ số", variant: "destructive" });

    const ok = updatePayPassword(user?.id, pin);
    if (!ok) return onToast({ title: "Cập nhật PIN thất bại", variant: "destructive" });

    onToast({ title: "Đổi PIN rút tiền thành công", variant: "success" });
    setPin("");
  };

  const revoke = (d) => {
    setDevices((ds) => ds.filter((x) => x.id !== d.id));
    onToast({ title: "Đã thu hồi phiên đăng nhập", description: d.name });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] w-[95vw] bg-[#1e1832] border-[#323b51] text-white rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/10">
          <DialogTitle className="text-[#bd9c59] flex items-center gap-2">
            <Lock className="w-4 h-4" /> Cài Đặt Cá Nhân
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar">

          {/* Đổi mật khẩu đăng nhập */}
          <div className="bg-[#2a2040] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#bd9c59]">
              <KeyRound className="w-4 h-4" /> Đổi mật khẩu đăng nhập
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={pw.cur}
                onChange={(e) => setPw({ ...pw, cur: e.target.value })}
                className="bg-[#1e1832] border-[#3a2d52] focus:border-[#bd9c59] text-white text-sm"
                style={{ fontSize: "16px" }}
              />
              <Input
                type="password"
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                value={pw.new}
                onChange={(e) => setPw({ ...pw, new: e.target.value })}
                className="bg-[#1e1832] border-[#3a2d52] focus:border-[#bd9c59] text-white text-sm"
                style={{ fontSize: "16px" }}
              />
              <Input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                className="bg-[#1e1832] border-[#3a2d52] focus:border-[#bd9c59] text-white text-sm"
                style={{ fontSize: "16px" }}
              />
            </div>
            <Button
              onClick={submitPw}
              className="w-full bg-[#bd9c59] text-[#1e1832] hover:bg-[#cfb06a] font-semibold h-10 rounded-lg text-sm"
            >
              Cập nhật mật khẩu
            </Button>
          </div>

          {/* Đổi PIN rút tiền */}
          <div className="bg-[#2a2040] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#bd9c59]">
              <ShieldCheck className="w-4 h-4" /> Đổi mật khẩu rút tiền (PIN 6 số)
            </div>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Nhập PIN mới (6 chữ số)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="bg-[#1e1832] border-[#3a2d52] focus:border-[#bd9c59] text-white text-center tracking-widest text-lg h-11"
              style={{ fontSize: "20px", letterSpacing: "0.4em" }}
            />
            <Button
              onClick={submitPin}
              className="w-full bg-[#bd9c59] text-[#1e1832] hover:bg-[#cfb06a] font-semibold h-10 rounded-lg text-sm"
            >
              Cập nhật PIN rút tiền
            </Button>
          </div>

          {/* Quản lý thiết bị đăng nhập thực tế */}
          <div className="bg-[#2a2040] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#bd9c59]">Quản lý thiết bị</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">Tự động phát hiện</span>
            </div>
            <div className="space-y-2">
              {devices.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.id} className="flex items-center gap-3 bg-[#1e1832] rounded-xl p-3 border border-white/5">
                    <div className="p-2 rounded-lg bg-[#bd9c59]/10 text-[#bd9c59]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate flex items-center gap-1.5">
                        {d.name}
                        {d.current && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/15 px-1.5 py-0.5 rounded">Hiện tại</span>
                        )}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">{d.time}</p>
                    </div>
                    {!d.current && (
                      <button
                        onClick={() => revoke(d)}
                        className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        Đăng xuất
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <DialogFooter className="px-5 py-3 border-t border-white/10">
          <DialogClose asChild>
            <Button variant="ghost" className="w-full text-white/70 hover:text-white">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}