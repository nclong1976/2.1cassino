import React, { useState } from "react";
import { LayoutDashboard, Users, Gamepad2, Ticket, ArrowLeftRight, Bell, Settings, LogOut, Menu, Shield, MessageSquare, Video } from "lucide-react";

const NAV = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "halls", label: "Sảnh chơi", icon: Gamepad2 },
  { id: "bets", label: "Đặt cược", icon: Ticket },
  { id: "transactions", label: "Giao dịch", icon: ArrowLeftRight },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "banners", label: "Quản lý Banner", icon: Video },
  { id: "chat", label: "Nhắn tin", icon: MessageSquare },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export default function AdminShell({ active, onNavigate, user, onLogout, unread, children }) {
  const [open, setOpen] = useState(false);
  const go = (id) => { onNavigate(id); setOpen(false); };

  const SidebarInner = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7033ff] to-[#4b00ff] flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold leading-none">Sands</p>
          <p className="text-[10px] text-white/50 mt-0.5">Admin Console</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((n) => {
          const Icon = n.icon;
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${on ? "bg-gradient-to-r from-[#7033ff]/30 to-[#4b00ff]/20 text-white border border-[#7033ff]/40" : "text-white/65 hover:bg-white/5 hover:text-white border border-transparent"}`}>
              <Icon className="w-4 h-4" />
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10 shrink-0">
        <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/65 hover:bg-white/5 hover:text-white"><LogOut className="w-4 h-4" /> Đăng xuất</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#0f1225] text-white flex">
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/10 bg-[#0c0e1f] sticky top-0 h-[100dvh]">{SidebarInner}</aside>

      {open && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-[#0c0e1f] border-r border-white/10">{SidebarInner}</aside>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-white/10 bg-[#0f1225]/90 backdrop-blur-md">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
          <p className="text-sm text-white/50 hidden sm:block">Xin chào, <span className="text-white font-medium">{user?.full_name || user?.email || "Admin"}</span></p>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/10"><Bell className="w-5 h-5 text-white/70" />{unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ffab40]" />}</button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffab40] to-[#e67e22] flex items-center justify-center font-bold text-white text-sm">{(user?.full_name || user?.email || "A").charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}