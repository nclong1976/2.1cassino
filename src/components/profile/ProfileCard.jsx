import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy } from "lucide-react";

export default function ProfileCard({ user, balance, profit, hidden, onToggleHidden, onCopyId, onSettings }) {
  const displayId = user?.id ? user.id.slice(-6) : "000000";
  const name = user?.full_name || user?.email?.split("@")[0] || "Khách";
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="mx-[17px] mt-[clamp(16px,10.9vw,55px)] rounded-[18px] shadow-[inset_0_0_0_1px_#323b51] overflow-clip"
      style={{ background: "rgba(30,24,50,0.82)", minHeight: 155 }}
    >
      <div className="flex flex-row items-center px-4 py-4 gap-3 relative">
        <div className="shrink-0 w-[63px] min-h-[87px] flex items-center justify-center">
          <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/1cec4ca21_d9792f60d_44ea36443d96080bcf8c902ed27ff8150a287082.png" alt="avatar" className="w-full h-full object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center flex-1 gap-1">
          <p className="text-[#bd9c59] leading-[1.55]" style={{ fontFamily: "Roboto, sans-serif", fontSize: 20, fontWeight: 400 }}>
            Người Dùng: {name}
            <br />
            ID: {displayId}{" "}
            <button onClick={onCopyId} className="inline-flex items-center align-middle text-[#947e96] hover:text-white transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </p>
          <p className="text-[#947e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: 22, fontWeight: 400, lineHeight: "26px" }}>
            Tổng Tài Khoản: {hidden ? "••••" : balance.toFixed(2)}
          </p>
          <p className="text-[#d3d6da]" style={{ fontFamily: "Epilogue, sans-serif", fontSize: 21, fontWeight: 700, lineHeight: "30px" }}>
            Lợi Nhuận Hôm Nay: {hidden ? "••••" : `${profit >= 0 ? "+" : ""}${profit.toFixed(2)}`}
          </p>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button onClick={onToggleHidden} className="text-[#947e96] hover:text-white transition-colors" aria-label="Ẩn/hiện số tiền">
            {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button onClick={onSettings} className="w-[31px] min-h-[31px] hover:opacity-80 transition-opacity" aria-label="Cài đặt">
            <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/48526e657_f8534feb2_48313d915c3ffd96882eb9905a24d32016970851.png" alt="settings" className="w-full h-full object-cover object-center" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}