import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const listeners = new Set();
let items = [];
let seq = 0;

function emit() {
  listeners.forEach((l) => l(items));
}

// Toast chữ-only, không nền, tự ẩn sau 1 giây.
export function textToast({ title, body }) {
  const id = ++seq;
  items = [...items, { id, title, body }];
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 1000);
  return id;
}

export function TextToaster() {
  const [list, setList] = useState(items);
  useEffect(() => {
    const l = (v) => setList(v);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[120] flex flex-col items-center gap-1 pointer-events-none">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-center max-w-[90vw]"
          >
            {t.title && (
              <p className="text-white font-bold text-[15px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">{t.title}</p>
            )}
            {t.body && (
              <p className="text-white/85 text-[12px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">{t.body}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}