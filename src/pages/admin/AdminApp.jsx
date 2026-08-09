import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import Overview from "./modules/Overview";
import Users from "./modules/Users";
import GameHalls from "./modules/GameHalls";
import Bets from "./modules/Bets";
import Transactions from "./modules/Transactions";
import Notifications from "./modules/Notifications";
import Settings from "./modules/Settings";
import Chat from "./modules/Chat";
import Banners from "./modules/Banners";

const MODULES = {
  overview: Overview,
  users: Users,
  halls: GameHalls,
  bets: Bets,
  transactions: Transactions,
  notifications: Notifications,
  banners: Banners,
  settings: Settings,
  chat: Chat,
};

export default function AdminApp() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("overview");
  const Mod = MODULES[active] || Overview;

  const handleLogout = () => {
    logout("/login");
  };

  return (
    <AdminShell active={active} onNavigate={setActive} user={user} onLogout={handleLogout} unread={0}>
      <Mod />
    </AdminShell>
  );
}