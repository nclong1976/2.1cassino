import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Video, Home, Gamepad2, Trophy, User } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";

const triggerHaptic = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(15);
    } catch {
      /* ignore vibration permission error */
    }
  }
};

const navItems = [
  { key: "nav_video", icon: Video, path: "/", match: ["/"] },
  { key: "nav_home", icon: Home, path: "/dashboard", match: ["/dashboard"] },
  { key: "nav_lobby", icon: Gamepad2, path: "/sanh-choi", match: ["/sanh-choi", "/choi-game"] },
  { key: "nav_awards", icon: Trophy, path: "/giai-thuong", match: ["/giai-thuong", "/bieu-do", "/ket-qua"] },
  { key: "nav_profile", icon: User, path: "/cua-toi", match: ["/cua-toi"] },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const p = location.pathname;

  const isActive = (item) => {
    if (item.path === "/") return p === "/";
    return item.match.some((m) => (m === "/dashboard" ? p === "/dashboard" : p.startsWith(m)));
  };

  const handleNav = (item) => {
    triggerHaptic();
    navigate(item.path, { state: { allowVideoView: true } });
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#0A0E1A]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-safe">
      <div className="grid grid-cols-5 h-[62px] items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item)}
              className="relative flex flex-col items-center justify-center py-1.5 focus:outline-none transition-all active:scale-90 rounded-xl hover:bg-white/5"
            >
              {active && (
                <span className="absolute top-0 w-7 h-[3px] bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700]" />
              )}
              <Icon
                className={`w-5 h-5 transition-all ${
                  active ? "text-[#FFD700] scale-110" : "text-white/50"
                }`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[10px] font-medium leading-tight mt-1 transition-colors ${
                  active ? "text-[#FFD700] font-semibold" : "text-white/50"
                }`}
              >
                {t(item.key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}