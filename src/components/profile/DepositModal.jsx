import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { handleDepositRequest } from "@/lib/depositHandler";
import { Headphones } from "lucide-react";

export default function DepositModal({ open, onOpenChange, onOpenChat }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConnectCSKH = () => {
    onOpenChange(false);
    handleDepositRequest({
      user,
      navigate,
      toast,
      openChat: onOpenChat,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121829] border-[#202c42] text-white max-w-[420px] rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#bd9c59] text-lg font-bold flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#bd9c59]" />
            Nạp Tiền Qua CSKH 24/7
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-white/80 text-sm leading-relaxed">
            Quy trình nạp tiền được hỗ trợ trực tiếp qua bộ phận Chăm Sóc Khách Hàng.
          </p>
          <div className="bg-[#1b2438] border border-[#bd9c59]/30 rounded-xl p-3 text-xs text-[#e2d5b8] space-y-1">
            <p className="font-semibold text-[#bd9c59]">Chuyển đến Hỗ trợ trực tuyến:</p>
            <p className="text-white/70">
              Nhấn nút bên dưới để chuyển thẳng đến khung chat CSKH và nhận hướng dẫn nạp tiền từ nhân viên hỗ trợ.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70 hover:bg-white/10 hover:text-white">
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleConnectCSKH}
            className="bg-gradient-to-r from-[#bd9c59] to-[#d4b574] text-[#1e1832] font-bold hover:opacity-90 transition-opacity"
          >
            Chuyển đến CSKH ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
