import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/I18nContext";
import { useAuth } from "@/lib/AuthContext";
import LanguageSwitcher from "@/components/home/LanguageSwitcher";
import BottomNav from "@/components/BottomNav";

// Trang mở đầu (splash) / Video: chạm vào màn hình → chuyển sang /login hoặc /dashboard.
export default function Splash() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useI18n();
  const { isAuthenticated, authChecked } = useAuth();

  useEffect(() => {
    if (authChecked && isAuthenticated && !location.state?.allowVideoView) {
      navigate("/dashboard", { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate, location.state]);

  const enter = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <main
      onClick={enter}
      className="relative max-w-md w-full mx-auto min-h-[100dvh] overflow-hidden bg-[#0A0E1A] cursor-pointer select-none">
      
      {/* Nền video sảnh casino */}
      <video
        src="https://media.base44.com/videos/public/6a729d033f9d0f63f381a6c6/c8bcb15f5_6faa31b965e5d1deaeb62d0f29225b5b.mp4"
        poster="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/e57f331cd_708f7e507_e87283081c2ffaf4802a737a4f6e0a1d686d3b3c.png"
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/75" />

      {/* Bộ chuyển ngôn ngữ — chặn sự kiện click để không bị kích hoạt enter */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-20 left-0 right-0 z-10 flex justify-center">
        
        <LanguageSwitcher lang={lang} onChange={setLang} />
      </div>

      {isAuthenticated && <BottomNav />}
    </main>
  );
}