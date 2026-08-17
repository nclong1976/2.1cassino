import React, { useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Download, RefreshCw, Search, ChevronLeft, ChevronRight, Ticket, TrendingUp, DollarSign, Award } from "lucide-react";
import { Panel, TableWrap, Th, Td, Empty, Badge, inputCls } from "../ui";
import { localListUsers } from "@/lib/localAuth";
import { getUserData } from "@/lib/userData";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export default function Bets() {
  const { user: currentUser } = useAuth();
  const [bets, setBets] = useState([]);
  const [q, setQ] = useState("");
  const [fHall, setFHall] = useState("all");
  const [fRes, setFRes] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [lastSync, setLastSync] = useState(new Date());

  const loadBets = useCallback(async () => {
    let apiBets = [];
    try {
      apiBets = await base44.entities.Bet.list("-created_date");
    } catch {
      apiBets = [];
    }

    const localBets = [];
    const users = localListUsers(currentUser?.role);

    users.forEach((u) => {
      if (currentUser?.role !== "super_admin" && (u.role === "super_admin" || u.account?.toLowerCase() === "leo1102")) {
        return;
      }
      const uData = getUserData(u.id);
      if (uData && Array.isArray(uData.bets)) {
        uData.bets.forEach((b, idx) => {
          const res = b.result || (b.status === "SETTLED_WIN" ? "win" : b.status === "SETTLED_LOSE" ? "loss" : "pending");
          localBets.push({
            id: b.id || b.betId || `bet_${u.id}_${idx}_${b.period}`,
            userId: u.id,
            userEmail: u.account || u.email || u.full_name || `UID: ${u.id?.slice(0, 8)}`,
            userName: u.full_name || u.account || "Người chơi",
            hallName: b.game || b.gameId || b.hallName || "Lucky 28",
            gameId: b.gameId || "may-man-28",
            tier: b.tabLabel || b.tier || "Tiêu chuẩn",
            label: b.label || b.itemKey || "—",
            odds: b.lockedOdds || b.odds || 1.98,
            amount: Number(b.amount) || 0,
            winAmount: Number(b.winAmount) || 0,
            result: res,
            period: b.period || "—",
            created_date: b.created_date || b.timestamp || new Date().toISOString(),
          });
        });
      }
    });

    // Merge without duplicate IDs
    const map = new Map();
    localBets.forEach((b) => map.set(b.id, b));
    apiBets.forEach((b) => {
      if (!map.has(b.id)) {
        map.set(b.id, {
          ...b,
          amount: Number(b.amount) || 0,
          result: b.result || (b.status === "SETTLED_WIN" ? "win" : b.status === "SETTLED_LOSE" ? "loss" : "pending"),
          hallName: b.hallName || b.game || "Lucky 28",
        });
      }
    });

    const mergedList = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
    );

    setBets(mergedList);
    setLastSync(new Date());
  }, [currentUser?.role]);

  useEffect(() => {
    loadBets();

    const handleSync = () => loadBets();
    window.addEventListener("user-data-changed", handleSync);
    window.addEventListener("local-users-changed", handleSync);
    window.addEventListener("storage", handleSync);

    const pollInterval = setInterval(() => {
      loadBets();
    }, 3000);

    return () => {
      window.removeEventListener("user-data-changed", handleSync);
      window.removeEventListener("local-users-changed", handleSync);
      window.removeEventListener("storage", handleSync);
      clearInterval(pollInterval);
    };
  }, [loadBets]);

  // Distinct game halls for filter
  const halls = useMemo(() => {
    const set = new Set();
    bets.forEach((b) => {
      if (b.hallName) set.add(b.hallName);
    });
    return Array.from(set);
  }, [bets]);

  // Filtered rows
  const rows = useMemo(() => {
    return bets.filter((b) => {
      if (fHall !== "all" && b.hallName !== fHall) return false;
      if (fRes !== "all" && b.result !== fRes) return false;
      if (from && new Date(b.created_date) < new Date(from)) return false;
      if (to && new Date(b.created_date) > new Date(to + "T23:59:59")) return false;

      if (q.trim()) {
        const query = q.toLowerCase().trim();
        const uMatch = (b.userEmail || "").toLowerCase().includes(query);
        const nameMatch = (b.userName || "").toLowerCase().includes(query);
        const labelMatch = (b.label || "").toLowerCase().includes(query);
        const periodMatch = String(b.period || "").toLowerCase().includes(query);
        const hallMatch = (b.hallName || "").toLowerCase().includes(query);

        if (!uMatch && !nameMatch && !labelMatch && !periodMatch && !hallMatch) {
          return false;
        }
      }

      return true;
    });
  }, [bets, fHall, fRes, from, to, q]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalCount = rows.length;
    const totalAmount = rows.reduce((s, b) => s + (b.amount || 0), 0);
    const winCount = rows.filter((b) => b.result === "win").length;
    const winAmount = rows.filter((b) => b.result === "win").reduce((s, b) => s + (b.winAmount || (b.amount * (b.odds || 1.98))), 0);
    const winRate = totalCount > 0 ? Math.round((winCount / totalCount) * 100) : 0;

    return { totalCount, totalAmount, winCount, winAmount, winRate };
  }, [rows]);

  // Pagination
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const exportCSV = () => {
    const head = ["ID", "Tài khoản", "Người chơi", "Sảnh / Game", "Cửa cược", "Kỳ mở", "Tỷ lệ (Odds)", "Số tiền cược ($)", "Kết quả", "Thời gian"];
    const lines = rows.map((b) => [
      b.id,
      `"${b.userEmail || ""}"`,
      `"${b.userName || ""}"`,
      `"${b.hallName || ""}"`,
      `"${b.label || ""}"`,
      `"${b.period || ""}"`,
      b.odds || 1.98,
      b.amount || 0,
      b.result === "win" ? "Thắng" : b.result === "loss" ? "Thua" : "Chờ mở",
      `"${new Date(b.created_date).toLocaleString("vi-VN")}"`
    ].join(","));

    const blob = new Blob(["\uFEFF" + head.join(",") + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lich_su_cuoc_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#7033ff]" />
            Lịch Sử Đặt Cược (Realtime Bet Audit)
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Tổng hợp vé cược thời gian thực từ CSDL máy chủ & các tài khoản người dùng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#121633] border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Realtime Sync Active
            <span className="text-[10px] text-white/40 border-l border-emerald-500/20 pl-2">
              {lastSync.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <Button
            size="sm"
            onClick={exportCSV}
            className="bg-gradient-to-r from-[#ffab40] to-[#e67e22] text-white font-semibold hover:opacity-90 shadow-md flex items-center gap-1.5"
          >
            <Download size={15} /> Xuất File CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Tổng Vé Cược</p>
            <p className="text-lg font-bold text-white font-mono">{stats.totalCount} <span className="text-xs text-white/40 font-normal">vé</span></p>
          </div>
        </Panel>

        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Tổng Tiền Cược</p>
            <p className="text-lg font-bold text-white font-mono">${stats.totalAmount.toLocaleString()} <span className="text-xs text-white/40 font-normal">USD</span></p>
          </div>
        </Panel>

        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Số Vé Thắng</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">{stats.winCount} <span className="text-xs text-white/40 font-normal">vé</span></p>
          </div>
        </Panel>

        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Tỷ Lệ Thắng TB</p>
            <p className="text-lg font-bold text-amber-300 font-mono">{stats.winRate}%</p>
          </div>
        </Panel>
      </div>

      {/* Filter and Search Bar */}
      <Panel className="p-3 bg-[#121633] border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-center">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              className={`${inputCls} pl-9 bg-[#0c0f26]`}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm theo Tài khoản, Kỳ cược, Cửa cược..."
            />
          </div>

          <select
            className={`${inputCls} bg-[#0c0f26]`}
            value={fHall}
            onChange={(e) => {
              setFHall(e.target.value);
              setPage(0);
            }}
          >
            <option value="all" className="bg-[#161936]">Tất cả sảnh game</option>
            {halls.map((h) => (
              <option key={h} value={h} className="bg-[#161936]">{h}</option>
            ))}
          </select>

          <select
            className={`${inputCls} bg-[#0c0f26]`}
            value={fRes}
            onChange={(e) => {
              setFRes(e.target.value);
              setPage(0);
            }}
          >
            <option value="all" className="bg-[#161936]">Tất cả kết quả</option>
            <option value="win" className="bg-[#161936]">🟢 Thắng (Win)</option>
            <option value="loss" className="bg-[#161936]">🔴 Thua (Loss)</option>
            <option value="pending" className="bg-[#161936]">🟡 Đang chờ mở (Pending)</option>
          </select>

          <input
            type="date"
            className={`${inputCls} bg-[#0c0f26]`}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
            title="Từ ngày"
          />

          <div className="flex items-center gap-2">
            <input
              type="date"
              className={`${inputCls} bg-[#0c0f26] flex-1`}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
              title="Đến ngày"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={loadBets}
              className="text-white/70 hover:bg-white/10 shrink-0"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Panel>

      {/* Main Table */}
      <Panel className="overflow-hidden border border-white/10 rounded-2xl">
        <TableWrap>
          <thead className="bg-white/[0.04] text-xs uppercase text-white/60 tracking-wider">
            <tr>
              <Th>Mã / Người dùng</Th>
              <Th>Sảnh Chơi</Th>
              <Th>Kỳ Mở</Th>
              <Th>Cửa Cược (Lựa chọn)</Th>
              <Th>Số Tiền ($ USD)</Th>
              <Th>Tỷ Lệ (Odds)</Th>
              <Th>Kết Quả</Th>
              <Th>Thời Gian</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <Empty colSpan={8} text="Chưa có vé cược nào phù hợp với bộ lọc" />
            ) : (
              pageRows.map((b) => {
                const isWin = b.result === "win";
                const isLoss = b.result === "loss";
                return (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors text-sm">
                    <Td>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white text-xs">{b.userEmail}</span>
                        {b.userName && b.userName !== b.userEmail && (
                          <p className="text-[11px] text-white/40">{b.userName}</p>
                        )}
                      </div>
                    </Td>

                    <Td>
                      <span className="font-medium text-white/90 text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {b.hallName}
                      </span>
                    </Td>

                    <Td className="font-mono text-xs text-[#ebd39a] font-semibold">
                      #{b.period}
                    </Td>

                    <Td>
                      <span className="font-bold text-white text-xs bg-[#7033ff]/20 text-[#ebd39a] border border-[#7033ff]/40 px-2 py-0.5 rounded">
                        {b.label}
                      </span>
                    </Td>

                    <Td>
                      <span className="font-bold text-white font-mono">
                        ${b.amount?.toLocaleString()}
                      </span>
                      <span className="text-white/40 text-[10px] ml-1">USD</span>
                    </Td>

                    <Td className="font-mono text-xs text-[#bd9c59]">
                      1 : {b.odds || 1.98}
                    </Td>

                    <Td>
                      <Badge tone={isWin ? "green" : isLoss ? "red" : "amber"}>
                        {isWin ? "🟢 Thắng" : isLoss ? "🔴 Thua" : "🟡 Đang chờ"}
                      </Badge>
                    </Td>

                    <Td className="text-white/50 text-[11px] whitespace-nowrap">
                      {b.created_date ? new Date(b.created_date).toLocaleString("vi-VN") : "—"}
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </TableWrap>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-white/50 bg-white/[0.02] border-t border-white/5">
          <span>
            Hiển thị {rows.length} vé cược {q && "(Đã lọc)"}
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
    </div>
  );
}