import React from "react";
import { motion } from "framer-motion";

export default function ActionCards({ onSupport, onDeposit, onWithdraw }) {
  return (
    <div className="px-[17px] w-full flex flex-col gap-[18px] mt-[18px] box-border">
      {/* Hỗ trợ trực tuyến */}
      <motion.div
        onClick={onSupport}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-[18px_18px_6px_18px] shadow-[inset_0_0_0_1px_#205467] relative cursor-pointer box-border border-0 outline-none"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          overflow: "hidden",
          minHeight: 163,
          background: "rgba(20,90,90,0.85)",
        }}
      >
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/f654b7df8_9f1154d04_f4b858677542e7f8f34582a6f37b703125b14b67.png"
          alt="support bg"
          className="absolute right-0 top-0 h-full object-cover object-center border-0 outline-none pointer-events-none"
          style={{ width: "60%" }}
        />
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/f12b698f3_483299c31_d3286deb65aa30d4095971f3ea218a26758561fb.png"
          alt="support figure"
          className="absolute right-0 top-0 h-full object-cover object-right border-0 outline-none pointer-events-none"
          style={{ width: "37%" }}
        />
        <div className="relative z-10 px-[16px] py-[14px]">
          <p className="text-white font-bold" style={{ fontFamily: "Mulish, sans-serif", fontSize: "clamp(14px,4.77vw,24px)", lineHeight: 1.375 }}>
            Hỗ Trợ Trực Tuyến
          </p>
          <p className="text-white/70 text-xs mt-1" style={{ fontFamily: "Roboto, sans-serif" }}>CSKH 24/7 · Nhấn để chat</p>
        </div>
      </motion.div>

      {/* Nạp tiền */}
      <motion.div
        onClick={onDeposit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.15 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-[18px] relative cursor-pointer border-0 outline-none shadow-none bg-transparent box-border"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          overflow: "hidden",
          minHeight: 164,
        }}
      >
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/0f56d0d71_288b4204d_93df9e8ccba8ac6a6d7742b54bc83688650ff008.png"
          alt="deposit bg"
          className="absolute inset-0 w-full h-full object-cover object-center border-0 outline-none bg-transparent pointer-events-none"
        />
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/0289d46f5_ec0ae3e66_c0a890063a305a0ade91d27b45714c2e0c5254f5.png"
          alt="deposit figure"
          className="absolute right-0 top-0 h-full object-cover object-right border-0 outline-none bg-transparent pointer-events-none"
          style={{ width: "45%" }}
        />
        <div className="relative z-10 px-[16px] py-[16px]">
          <p className="text-white font-bold" style={{ fontFamily: "Oxygen, sans-serif", fontSize: "clamp(14px,4.97vw,25px)", lineHeight: 1.36 }}>
            Nạp Tiền
          </p>
          <p className="text-white/70 text-xs mt-1" style={{ fontFamily: "Roboto, sans-serif" }}>Chuyển đến Hỗ trợ trực tuyến (Liên hệ Admin)</p>
        </div>
      </motion.div>

      {/* Rút tiền mặt */}
      <motion.div
        onClick={onWithdraw}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-[18px] relative cursor-pointer border-0 outline-none shadow-none bg-transparent box-border"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          overflow: "hidden",
          minHeight: 171,
        }}
      >
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/87daee7e9_2e101cf56_614b177e0e8cd74d7326bb2b8156b41bc149fd3c.png"
          alt="withdraw bg"
          className="absolute inset-0 w-full h-full object-cover object-center border-0 outline-none bg-transparent pointer-events-none"
        />
        <div className="relative z-10 px-[20px] py-[19px]">
          <p className="text-white font-bold" style={{ fontFamily: "Mulish, sans-serif", fontSize: "clamp(14px,4.77vw,24px)", lineHeight: 1.375 }}>
            Rút Tiền Mặt
          </p>
          <p className="text-white/70 text-xs mt-1" style={{ fontFamily: "Roboto, sans-serif" }}>Kiểm tra điều kiện · Nhập PIN</p>
        </div>
      </motion.div>
    </div>
  );
}