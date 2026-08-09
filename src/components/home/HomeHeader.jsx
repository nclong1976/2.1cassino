import React from "react";
import { Headphones, Wallet } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/AuthContext";
import { useUserData } from "@/lib/userData";

export default function HomeHeader({ onChat, onRefresh }) {
  const { user } = useAuth();
  const { data, refresh } = useUserData(user?.id);
  const balance = data?.balance ?? 0;

  const handleHeaderRefresh = () => {
    refresh();
    if (onRefresh) onRefresh();
  };

  return (
    <header className="relative w-full min-h-[42px] flex items-center justify-between px-3 shrink-0 py-1 z-20">
      <img
        src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/113475db5_42023f32b_8814f9fc52211a9a6147fc0078db9f9503eba721.png"
        alt="Header Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Real-time Wallet Balance Badge */}
      <div className="relative z-20 flex items-center gap-1.5 bg-[#0A0E1A]/80 border border-[#bd9c59]/40 backdrop-blur-md rounded-full px-2.5 py-1 text-xs text-[#bd9c59] font-bold shadow-sm">
        <Wallet className="w-3.5 h-3.5 text-[#bd9c59]" />
        <span>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
      </div>

      <button onClick={handleHeaderRefresh} className="relative z-10 flex flex-col items-center active:scale-95 transition-transform">
        <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/eb69c374c_645c88250_4e121c95b33117e8ce7ec88128a7f79b89007876.png" alt="Crown Logo" className="w-[24px] h-[12px] object-cover" />
        <p className="text-[13px] font-bold font-heading leading-tight text-[#7f7161] mt-0.5">Sands</p>
      </button>

      <div className="relative z-20 flex items-center gap-1">
        <NotificationBell iconColor="text-[#7f7161]" />
        <button onClick={onChat} aria-label="Hỗ trợ" className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#7f7161] transition-colors">
          <Headphones className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}