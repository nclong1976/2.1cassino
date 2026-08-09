import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AnnouncementBar({ announcements }) {
  const [open, setOpen] = useState(null);

  return (
    <>
      <div className="flex items-center px-4 mt-[27px] gap-3 shrink-0">
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/d6fe3fa1c_5922cc67d_b8fb578590ee1be3aa29b51c4562c84411e57cba.png"
          alt="speaker"
          className="w-[15px] h-[13px] shrink-0"
        />
        <div className="flex-1 overflow-clip relative h-4 flex items-center">
          <motion.div
            className="absolute whitespace-nowrap flex items-center"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          >
            {announcements.map((a) => (
              <button
                key={a.id}
                onClick={() => setOpen(a)}
                className="mr-12 text-figma-11 font-normal font-paragraph leading-figma-16 text-[#2a6873] hover:text-[#1c4a52] transition-colors text-left"
              >
                {a.title}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-[440px] bg-[#1e1832] border-[#323b51] text-white rounded-2xl">
          <DialogHeader><DialogTitle className="text-[#bd9c59] text-base">Thông báo</DialogTitle></DialogHeader>
          <p className="text-sm font-semibold text-[#d3d6da]">{open?.title}</p>
          <p className="text-sm text-white/70 leading-relaxed">{open?.detail}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}