import React from "react";
import { motion } from "framer-motion";

export default function QuickMenuCard({ onBetHistory, onTx, onLink }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="mx-[17px] mt-[18px] rounded-[18px] overflow-clip relative"
      style={{ minHeight: 283 }}
    >
      <img
        src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/d5f335296_8e184a500_31827890682bf99ef242db9726252475e5e0a261.png"
        alt="games background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="relative z-10 px-[18px] pt-[29px] pb-[24px] flex flex-col gap-3">
        <p className="text-[#8f60db]" style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, fontWeight: 400, lineHeight: "18px" }}>
          May man 28
        </p>

        <div className="flex flex-row items-center gap-2 flex-wrap">
          <p className="text-[#d1bde4] mr-1" style={{ fontFamily: "Mulish, sans-serif", fontSize: 19, fontWeight: 700, lineHeight: "22px" }}>
            Trò chơi
          </p>
          <div className="flex flex-row items-center gap-[2px]">
            <div className="relative w-[19px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/1b76daf08_46c9d2402_fd2fe92ebca7894c9e92126a9f7006a173549832.png" alt="icon" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-[#addbcb] text-[10px]" style={{ fontFamily: "Englebert, sans-serif" }}>T</span>
            </div>
            <div className="relative w-[19px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/d2e330924_8484088a1_c60105468d61e04da7593a04056b12faaabe62e4.png" alt="icon" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-[#f4d9ab] text-[13px] font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>β</span>
            </div>
            <div className="relative w-[19px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/7b84716a6_ae1350da7_637dbc3ef6b6b8cbf50134a0c3c6ba7ec8810bc3.png" alt="icon" className="w-full h-full object-cover" />
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/b1c195807_c26327315_86f48c5744acf5e7eb033f63fbe4a02b17619f1a.png" alt="icon-inner" className="absolute inset-0 m-auto w-[9px] h-3 object-cover" />
            </div>
            <div className="relative w-[19px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/1ba5350ea_0a7d50065_727ffcfb0809f8fc3ad0adfc661488f5d9aa6b86.png" alt="icon" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-[#f5e68e] text-[10px]" style={{ fontFamily: "Inter, sans-serif" }}>^*</span>
            </div>
            <div className="w-[19px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/3f5ab1c39_f0b10e2b3_82519e3c8ae7d7ad3f7c199c9ff261fe44fe3368.png" alt="icon" className="w-full h-full object-cover" />
            </div>
            <div className="w-[18px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/763b01837_f015ef52a_a614098d37f9e14a312501d24af6e0dba9c3cca0.png" alt="icon" className="w-full h-full object-cover" />
            </div>
            <div className="relative w-[18px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/a111a7ebc_745fabdad_3a58aaa65722566acc80205738725a088c538c2b.png" alt="icon" className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-[#a29570] text-[11px]" style={{ fontFamily: "Inter, sans-serif" }}>D</span>
            </div>
            <div className="relative w-[19px] min-h-[19px]">
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/8576aea5a_3b51a0e95_cbac7b2557b21c1ae66ed3d82a96dee7cd9f2cd0.png" alt="icon" className="w-full h-full object-cover" />
              <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/4d097b4f4_7c86d9c38_9c5ec82eba1042929e3fd4c483e419d4c715d882.png" alt="icon-inner" className="absolute inset-0 m-auto w-[11px] h-3 object-cover" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[7px] mt-1">
          <button onClick={onBetHistory} className="rounded-[8px] shadow-[inset_0_0_0_1px_#e9dff2] py-[15px] flex items-center justify-center active:scale-95 transition-transform" style={{ background: "rgba(40,28,60,0.7)" }}>
            <span className="text-[#d1bde4] text-[14px]" style={{ fontFamily: "Roboto, sans-serif" }}>Lịch Sử Đặt Cược</span>
          </button>
          <button onClick={() => onTx("deposit")} className="rounded-[8px] shadow-[inset_0_0_0_1px_#ebe2f1] py-[15px] flex items-center justify-center active:scale-95 transition-transform" style={{ background: "rgba(40,28,60,0.7)" }}>
            <span className="text-[14px]" style={{ fontFamily: "Roboto, sans-serif", color: "#d1bde4" }}>Hồ Sơ Nạp Tiền</span>
          </button>
          <button onClick={() => onTx("withdraw")} className="rounded-[8px] shadow-[inset_0_0_0_1px_#e8e1ed] py-[15px] flex items-center justify-center active:scale-95 transition-transform" style={{ background: "rgba(40,28,60,0.7)" }}>
            <span className="text-[14px]" style={{ fontFamily: "Roboto, sans-serif", color: "#d1bde4" }}>Hồ Sơ Rút Tiền</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-[7px]">
          <button onClick={() => onTx("both")} className="rounded-[7px] shadow-[inset_0_0_0_1px_#e8ddf0] py-[15px] flex items-center justify-center active:scale-95 transition-transform" style={{ background: "rgba(40,28,60,0.7)" }}>
            <span className="text-[14px]" style={{ fontFamily: "Roboto, sans-serif", color: "#d1bde4" }}>Hồ Sơ Nạp Rút</span>
          </button>
          <button onClick={onLink} className="rounded-[6px] shadow-[inset_0_0_0_1px_#e9dfef] py-[15px] flex items-center justify-center active:scale-95 transition-transform" style={{ background: "rgba(40,28,60,0.7)" }}>
            <span className="text-[14px]" style={{ fontFamily: "Roboto, sans-serif", color: "#d1bde4" }}>Liên Kết Tài Khoản</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}