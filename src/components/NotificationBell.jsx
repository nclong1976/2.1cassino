import React, { useState, useRef, useEffect } from "react";
import { Bell, Trash2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/lib/NotificationContext";

const DOT = { result: "bg-[#FFD700]", balance: "bg-emerald-400", info: "bg-sky-400", admin: "bg-fuchsia-400", success: "bg-emerald-400", warning: "bg-amber-400" };

export default function NotificationBell({ iconColor = "text-white/85" }) {
  const { notifications, unread, markAllRead, markRead, remove, clear } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all shadow-sm border border-white/10 flex items-center justify-center group"
        aria-label="Thông báo hệ thống"
      >
        <Bell className={`w-4 h-4 ${iconColor} group-hover:scale-110 transition-transform`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-14 z-[99999] w-[320px] sm:w-[350px] max-h-[440px] overflow-y-auto rounded-2xl bg-[#161936] border border-[#bd9c59]/55 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[#161936]/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#bd9c59]" />
                <p className="text-white text-[14px] font-bold">Thông Báo Hệ Thống</p>
                {unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[11px] font-bold">{unread} mới</span>}
              </div>
              <div className="flex items-center gap-2.5">
                {unread > 0 && (
                  <button onClick={markAllRead} title="Đánh dấu tất cả đã đọc" className="text-white/60 hover:text-white text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clear} title="Xoá tất cả" className="text-white/60 hover:text-red-400 text-xs">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="w-8 h-8 text-white/20 mx-auto" />
                <p className="text-white/40 text-[13px]">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, x: 100, height: 0 }}
                      className={`p-3.5 transition-colors hover:bg-white/[0.04] ${!n.read ? "bg-white/[0.02]" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT[n.type] || DOT.info}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-white text-[13px] font-semibold truncate">{n.title}</p>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                          </div>
                          {n.body && <p className="text-white/70 text-[12px] mt-1 leading-relaxed">{n.body}</p>}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                            <span className="text-white/40 text-[10px]">{new Date(n.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                            {!n.read && (
                              <button onClick={() => markRead(n.id)} className="text-[#bd9c59] text-[11px] font-medium hover:underline">
                                Đã đọc
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}