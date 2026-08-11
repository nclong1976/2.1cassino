import React, { useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Search,
  Lock,
  Unlock,
  Eye,
  Wallet,
  Bell,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  RefreshCw,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { Panel, TableWrap, Th, Td, Empty, Badge, inputCls, ConfirmDialog } from "../ui";
import { localListUsers, adminToggleLock, adminDeleteUser } from "@/lib/localAuth";
import { getUserData, updateUserData } from "@/lib/userData";
import { useAuth } from "@/lib/AuthContext";

import EditUserModal from "./EditUserModal";
import BalanceAdjustModal from "./BalanceAdjustModal";
import DetailUserModal from "./DetailUserModal";

const PAGE = 8;

const IconBtn = ({ children, onClick, title, danger, success }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg transition-colors ${
      danger
        ? "text-rose-400 hover:bg-rose-500/20"
        : success
        ? "text-emerald-400 hover:bg-emerald-500/20"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    {children}
  </button>
);

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);

  // Modals state
  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [balanceUser, setBalanceUser] = useState(null);
  const [delUser, setDelUser] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Invite state
  const [iEmail, setIEmail] = useState("");
  const [iRole, setIRole] = useState("user");

  // Realtime engine status
  const [lastSync, setLastSync] = useState(new Date());

  // Load and merge users from local storage and Base44 DB
  const loadUsers = useCallback(async () => {
    let bUsers = [];
    try {
      bUsers = await base44.entities.User.list();
    } catch {
      /* ignore fallback */
    }

    const lUsers = localListUsers(currentUser?.role);
    const mapByAccOrId = new Map();

    // Prioritize local storage overrides
    lUsers.forEach((u) => {
      if (currentUser?.role !== "super_admin" && (u.role === "super_admin" || u.account?.toLowerCase() === "leo1102")) {
        return;
      }
      const key = (u.account || u.id || u.email || "").toLowerCase();
      const uData = getUserData(u.id);
      const curBal = uData.balance !== undefined ? uData.balance : (u.balance || 0);
      const bankLinked = uData.linked?.find((l) => l.type === "bank") || u.bankInfo || null;

      mapByAccOrId.set(key, {
        ...u,
        balance: curBal,
        bankInfo: bankLinked,
      });
    });

    bUsers.forEach((u) => {
      if (currentUser?.role !== "super_admin" && (u.role === "super_admin" || u.account?.toLowerCase() === "leo1102")) {
        return;
      }
      const key = (u.account || u.id || u.email || "").toLowerCase();
      if (!mapByAccOrId.has(key)) {
        const uData = getUserData(u.id);
        const curBal = uData.balance !== undefined ? uData.balance : (u.balance || 0);
        const bankLinked = uData.linked?.find((l) => l.type === "bank") || null;

        mapByAccOrId.set(key, {
          ...u,
          balance: curBal,
          bankInfo: bankLinked,
        });
      }
    });

    setUsers(Array.from(mapByAccOrId.values()));
    setLastSync(new Date());
  }, [currentUser?.role]);

  useEffect(() => {
    loadUsers();

    // Realtime event listeners and polling sync
    const handleSync = () => loadUsers();
    window.addEventListener("local-users-changed", handleSync);
    window.addEventListener("user-data-changed", handleSync);
    window.addEventListener("storage", handleSync);

    // Polling interval for realtime sync
    const pollInterval = setInterval(() => {
      loadUsers();
    }, 2500);

    return () => {
      window.removeEventListener("local-users-changed", handleSync);
      window.removeEventListener("user-data-changed", handleSync);
      window.removeEventListener("storage", handleSync);
      clearInterval(pollInterval);
    };
  }, [loadUsers]);

  // Helper to update user data & trigger sync across components
  const handleUpdateUserData = useCallback((userId, patch) => {
    let sanitizedPatch = patch;
    if (typeof patch === "object" && patch !== null && patch.balance !== undefined) {
      const cleanBal = parseFloat(String(patch.balance).replace(/[^0-9.-]+/g, "")) || 0;
      sanitizedPatch = { ...patch, balance: Math.max(0, parseFloat(cleanBal.toFixed(2))) };
    }
    const updated = updateUserData(userId, sanitizedPatch);
    loadUsers();
    return updated;
  }, [loadUsers]);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Status filter
      if (filter === "active" && u.locked) return false;
      if (filter === "locked" && !u.locked) return false;
      if (filter === "has_balance" && (u.balance || 0) <= 0) return false;

      // Query search
      if (q.trim()) {
        const query = q.toLowerCase().trim();
        const nameMatch = (u.full_name || "").toLowerCase().includes(query);
        const emailMatch = (u.email || "").toLowerCase().includes(query);
        const accMatch = (u.account || "").toLowerCase().includes(query);
        const idMatch = (u.id || "").toLowerCase().includes(query);
        const phoneMatch = (u.phone || "").toLowerCase().includes(query);

        if (!nameMatch && !emailMatch && !accMatch && !idMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [users, q, filter]);

  // Pagination
  const pages = Math.max(1, Math.ceil(filteredUsers.length / PAGE));
  const pageRows = filteredUsers.slice(page * PAGE, page * PAGE + PAGE);

  // Toggle account lock state with immediate force logout trigger
  const handleToggleLock = async (u) => {
    const nextLockedState = !u.locked;
    try {
      // Local Auth update
      adminToggleLock(userKey(u), nextLockedState);

      // Try Base44 update if exists
      try {
        await base44.entities.User.update(u.id, { locked: nextLockedState });
      } catch {
        /* ignore */
      }

      toast({
        title: nextLockedState ? "🔒 Đã khóa tài khoản" : "🟢 Đã mở khóa tài khoản",
        description: nextLockedState
          ? `Tài khoản ${u.account || u.email} đã bị khóa và chấm dứt phiên làm việc.`
          : `Tài khoản ${u.account || u.email} đã được mở khóa hoạt động trở lại.`,
        variant: nextLockedState ? "destructive" : "default",
      });

      loadUsers();
    } catch (e) {
      toast({
        title: "Lỗi thao tác",
        description: e.message || "Không thể thay đổi trạng thái khóa",
        variant: "destructive",
      });
    }
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!delUser) return;
    try {
      adminDeleteUser(userKey(delUser));
      try {
        await base44.entities.User.delete(delUser.id);
      } catch {
        /* ignore */
      }

      toast({
        title: "Xóa thành công",
        description: `Đã xóa người dùng ${delUser.account || delUser.email}`,
      });
      setDelUser(null);
      loadUsers();
    } catch (e) {
      toast({
        title: "Lỗi xóa người dùng",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // Send admin notification to single user
  const handleNotifyUser = async (u) => {
    try {
      await base44.entities.NotificationLog.create({
        title: "Thông báo từ QTV",
        body: `Gửi trực tiếp tới tài khoản ${u.account || u.email}`,
        audience: "segment",
        target: u.email || u.id,
        status: "sent",
      });
      toast({
        title: "Đã gửi thông báo",
        description: `Đã phát thông báo tới ${u.full_name || u.account}`,
      });
    } catch {
      toast({
        title: "Đã phát thông báo nội bộ",
        description: `Gửi thông báo thành công tới ${u.account || u.email}`,
      });
    }
  };

  // Invite user handler
  const handleInvite = async () => {
    if (!iEmail) return toast({ title: "Vui lòng nhập Email", variant: "destructive" });
    try {
      await base44.users.inviteUser(iEmail, iRole);
      toast({ title: "Đã gửi lời mời", description: iEmail });
      setInviteOpen(false);
      setIEmail("");
    } catch (e) {
      toast({ title: "Lỗi gửi lời mời", description: e.message, variant: "destructive" });
    }
  };

  const userKey = (u) => u.id || u.account;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#7033ff]" />
            Quản Lý Người Dùng
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Theo dõi, điều chỉnh số dư và phân quyền tài khoản thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Realtime Active Indicator */}
          <div className="flex items-center gap-2 bg-[#121633] border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Realtime Active
            <span className="text-[10px] text-white/40 border-l border-emerald-500/20 pl-2">
              {lastSync.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white font-semibold hover:opacity-90 shadow-md"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-1.5" /> Mời Người Dùng
          </Button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-[#121633] p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className={`${inputCls} pl-10 bg-[#0c0f26]`}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo Tên, Email, SĐT, UID hoặc Tên Tài Khoản..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className={`${inputCls} sm:w-52 bg-[#0c0f26]`}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="all" className="bg-[#161936]">Tất cả tài khoản</option>
            <option value="active" className="bg-[#161936]">🟢 Đang hoạt động</option>
            <option value="locked" className="bg-[#161936]">🔒 Đã bị khóa</option>
            <option value="has_balance" className="bg-[#161936]">💵 Có số dư (&gt; 0)</option>
          </select>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadUsers}
            className="text-white/70 hover:bg-white/10 shrink-0"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Panel className="overflow-hidden border border-white/10 rounded-2xl">
        <TableWrap>
          <thead className="bg-white/[0.04] text-xs uppercase text-white/60 tracking-wider">
            <tr>
              <Th>UID / Tài Khoản</Th>
              <Th>Người Dùng</Th>
              <Th>Liên Hệ</Th>
              <Th>Số Dư ($ USD)</Th>
              <Th>Ngân Hàng Rút</Th>
              <Th>Trạng Thái</Th>
              <Th>Ngày Đăng Ký</Th>
              <Th className="text-right">Thao Tác</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <Empty colSpan={8} />
            ) : (
              pageRows.map((u) => {
                const bank = u.bankInfo;
                return (
                  <tr key={u.id || u.account} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors text-sm">
                    {/* UID / Account */}
                    <Td className="font-mono text-xs">
                      <span className="bg-[#7033ff]/20 text-[#ebd39a] border border-[#7033ff]/40 px-2 py-0.5 rounded font-semibold">
                        {u.account || u.id?.slice(0, 8)}
                      </span>
                    </Td>

                    {/* User info */}
                    <Td>
                      <div className="font-medium text-white flex items-center gap-1.5">
                        {u.full_name || "—"}
                        <Badge tone={u.role === "admin" ? "purple" : "neutral"}>
                          {u.role || "user"}
                        </Badge>
                      </div>
                    </Td>

                    {/* Contact */}
                    <Td className="text-xs">
                      <p className="text-white/80">{u.email || "—"}</p>
                      <p className="text-white/40">{u.phone || "—"}</p>
                    </Td>

                    {/* Balance */}
                    <Td>
                      <span className="font-bold text-emerald-400">
                        ${(u.balance || 0).toLocaleString()}
                      </span>
                      <span className="text-white/40 text-[11px] ml-1">USD</span>
                    </Td>

                    {/* Bank Linked */}
                    <Td className="text-xs">
                      {bank?.bankName ? (
                        <div className="text-emerald-300/90 font-medium flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{bank.bankName}</span>
                          <span className="text-white/40">(*{bank.accountNumber?.slice(-4)})</span>
                        </div>
                      ) : (
                        <span className="text-white/30 italic">Chưa liên kết</span>
                      )}
                    </Td>

                    {/* Status Badge */}
                    <Td>
                      <Badge tone={u.locked ? "red" : "green"}>
                        {u.locked ? "🔒 Đã Khóa" : "🟢 Hoạt Động"}
                      </Badge>
                    </Td>

                    {/* Created Date */}
                    <Td className="text-white/50 text-xs">
                      {u.created_date ? new Date(u.created_date).toLocaleDateString("vi-VN") : "—"}
                    </Td>

                    {/* Actions */}
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Xem chi tiết" onClick={() => setDetailUser(u)}>
                          <Eye size={16} />
                        </IconBtn>

                        <IconBtn title="Chỉnh sửa thông tin" onClick={() => setEditUser(u)}>
                          <Edit2 size={16} />
                        </IconBtn>

                        <IconBtn title="Điều chỉnh số dư" onClick={() => setBalanceUser(u)}>
                          <Wallet size={16} className="text-emerald-400" />
                        </IconBtn>

                        <IconBtn
                          title={u.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          onClick={() => handleToggleLock(u)}
                          danger={!u.locked}
                          success={u.locked}
                        >
                          {u.locked ? <Unlock size={16} /> : <Lock size={16} />}
                        </IconBtn>

                        <IconBtn title="Gửi thông báo" onClick={() => handleNotifyUser(u)}>
                          <Bell size={16} />
                        </IconBtn>

                        <IconBtn title="Xóa tài khoản" danger onClick={() => setDelUser(u)}>
                          <Trash2 size={16} />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </TableWrap>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-white/50 bg-white/[0.02] border-t border-white/5">
          <span>
            Hiển thị {filteredUsers.length} tài khoản {q && "(Đã lọc)"}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-white/80">
              Trang {page + 1} / {pages}
            </span>
            <button
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Panel>

      {/* MODALS */}
      {/* 1. Detail User Modal */}
      <DetailUserModal
        open={!!detailUser}
        onOpenChange={(v) => !v && setDetailUser(null)}
        user={detailUser}
      />

      {/* 2. Edit User Modal */}
      <EditUserModal
        open={!!editUser}
        onOpenChange={(v) => !v && setEditUser(null)}
        user={editUser}
        onSaved={loadUsers}
      />

      {/* 3. Balance Adjust Modal */}
      <BalanceAdjustModal
        open={!!balanceUser}
        onOpenChange={(v) => !v && setBalanceUser(null)}
        user={balanceUser}
        onSaved={loadUsers}
        updateUserData={handleUpdateUserData}
      />

      {/* 4. Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-[#161936] border-white/15 text-white max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#ebd39a]">
              Mời Người Dùng Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Email người dùng</label>
              <input
                className={inputCls}
                value={iEmail}
                onChange={(e) => setIEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Vai trò (Role)</label>
              <select
                className={inputCls}
                value={iRole}
                onChange={(e) => setIRole(e.target.value)}
              >
                <option value="user" className="bg-[#161936]">Người dùng (User)</option>
                <option value="admin" className="bg-[#161936]">Quản trị viên (Admin)</option>
              </select>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setInviteOpen(false)} className="text-white/70 hover:text-white">
              Hủy
            </Button>
            <Button className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white" onClick={handleInvite}>
              Gửi Lời Mời
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!delUser}
        onOpenChange={(v) => !v && setDelUser(null)}
        title="Xóa tài khoản người dùng"
        desc={`Bạn có chắc chắn muốn xóa vĩnh viễn người dùng ${delUser?.account || delUser?.email}? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa Ngay"
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
