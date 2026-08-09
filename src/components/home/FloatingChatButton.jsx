import React, { useRef, useState, useEffect } from "react";
import chatIcon from "@/assets/images/regenerated_image_1786124086941.png";

/**
 * FloatingChatButton – có thể kéo di chuyển tự do trên màn hình.
 * Vị trí được lưu vào localStorage để nhớ sau khi reload.
 */
const STORAGE_KEY = "floating_chat_pos";

export default function FloatingChatButton({ onClick, unread = 0 }) {
  const ref = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const getDefault = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return { x: vw - 72, y: vh - 180 };
  };

  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return getDefault();
  });

  // Clamp vị trí trong viewport khi resize
  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: Math.min(Math.max(p.x, 0), window.innerWidth - 60),
        y: Math.min(Math.max(p.y, 0), window.innerHeight - 80),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const savePos = (p) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  };

  // ── Touch handlers ──────────────────────────────────────────
  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragRef.current = { dragging: true, startX: t.clientX, startY: t.clientY, origX: pos.x, origY: pos.y, moved: false };
  };

  const onTouchMove = (e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - d.startX;
    const dy = t.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    e.preventDefault();
    const newX = Math.min(Math.max(d.origX + dx, 0), window.innerWidth - 60);
    const newY = Math.min(Math.max(d.origY + dy, 0), window.innerHeight - 80);
    setPos({ x: newX, y: newY });
  };

  const onTouchEnd = () => {
    const d = dragRef.current;
    dragRef.current.dragging = false;
    savePos(pos);
    // Nếu không di chuyển → mở chat
    if (!d.moved) onClick?.();
  };

  // ── Mouse handlers ──────────────────────────────────────────
  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };

    const onMouseMove = (ev) => {
      const d = dragRef.current;
      if (!d.dragging) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
      const newX = Math.min(Math.max(d.origX + dx, 0), window.innerWidth - 60);
      const newY = Math.min(Math.max(d.origY + dy, 0), window.innerHeight - 80);
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      dragRef.current.dragging = false;
      savePos(pos);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (!dragRef.current.moved) onClick?.();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <button
      ref={ref}
      aria-label="Hỗ trợ trực tuyến"
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 9999, touchAction: "none", cursor: "grab" }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="select-none"
    >
      {/* Glow ring animation */}
      <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/30 pointer-events-none" style={{ borderRadius: "50%" }} />

      {/* Main button */}
      <span className="relative flex flex-col items-center gap-0.5">
        <img
          src={chatIcon}
          alt="Hỗ trợ"
          className="w-[52px] h-[48px] object-cover drop-shadow-[0_4px_12px_rgba(255,180,0,0.5)]"
          draggable={false}
        />
        <span className="text-[9px] font-bold text-amber-300 drop-shadow leading-none">
          Hỗ trợ
        </span>
      </span>

      {/* Unread badge */}
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[#0A0E1A] animate-bounce">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}