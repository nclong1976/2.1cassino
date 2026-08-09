import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, User } from "lucide-react";

export default function GameHeader({ gameName }) {
  const navigate = useNavigate();
  return (
    <header className="relative w-full min-h-[65px] flex items-center justify-between px-[22px] shrink-0 z-50">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover object-center"
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/e3eaf9faa_2874b56c2_263359f6c74925fbcefa670078a0b451d7d72a11.png"
          alt="Header Background"
        />
      </div>
      <button onClick={() => navigate("/dashboard")} className="relative z-10 flex items-center justify-center hover:opacity-80 transition-opacity">
        <ChevronLeft className="w-6 h-6 text-[#d4d6d9]" />
      </button>
      <h1 className="text-[clamp(14px,3.88vw,24px)] font-bold font-figma-noto-sans leading-[1.5] text-[#d4d6d9] relative z-10 text-center flex-1 truncate px-2">
        {gameName}
      </h1>
      <div className="flex items-center gap-[18px] relative z-10">
        <button className="hover:opacity-80 transition-opacity"><Search className="w-6 h-6 text-[#d4d6d9]" /></button>
        <button className="hover:opacity-80 transition-opacity"><User className="w-6 h-6 text-[#d4d6d9]" /></button>
      </div>
    </header>
  );
}