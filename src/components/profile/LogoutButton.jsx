import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="mx-[17px] mt-6 mb-2 w-[calc(100%-34px)] min-h-[48px] flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/85 hover:bg-red-600 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-md"
    >
      <LogOut className="w-4 h-4" /> Đăng Xuất
    </button>
  );
}