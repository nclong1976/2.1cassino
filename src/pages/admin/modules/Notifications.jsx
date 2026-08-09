import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Send,
  Trash2,
  Users,
  User,
  Bell,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldAlert,
  Gift,
  Info,
  Clock,
  Eye,
  BarChart3,
  Search,
  RefreshCw,
} from "lucide-react";
import { Panel, TableWrap, Th, Td, Empty, Badge, inputCls } from "../ui";
import {
  sendToGroup,
  sendToUser,
  getAdminLog,
  removeAdminLog,
  getNotificationReadStats,
} from "@/lib/localNotifications";

export default function Notifications() {
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all"); // 'all' | 'active' | 'has_balance' | 'locked' | 'admins' | 'user'
  const [target, setTarget] = useState("");
  const [notifType, setNotifType] = useState("info"); // 'info' | 'promotion' | 'warning' | 'balance'
  const [searchTerm, setSearchTerm] = useState("");

  const load = () => {
    const rawList = getAdminLog();
    // Compute read statistics for each sent log
    const enriched = rawList.map((n) => {
      const stats = getNotificationReadStats(n.id);
      return {
        ...n,
        stats,
      };
    });
    setList(enriched);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle) {
      return toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề thông báo",
        variant: "destructive",
      });
    }

    const payload = {
      type: notifType,
      title: cleanTitle,
      body: cleanBody,
    };

    if (audience === "user") {
      if (!target.trim()) {
        return toast({
          title: "Thiếu thông tin người nhận",
          description: "Vui lòng nhập Username, UID hoặc Email người nhận",
          variant: "destructive",
        });
      }
      const ok = sendToUser(target.trim(), payload);
      if (!ok) {
        return toast({
          title: "Gửi thất bại",
          description: `Không tìm thấy người dùng [${target.trim()}]`,
          variant: "destructive",
        });
      }
      toast({
        title: "Gửi thông báo thành công",
        description: `Đã gửi thông báo đích danh tới [${target.trim()}]`,
      });
    } else {
      const count = sendToGroup(audience, payload);
      const groupLabels = {
        all: "Tất cả người dùng",
        active: "Người dùng đang hoạt động",
        has_balance: "Người dùng có số dư > $0",
        locked: "Tài khoản bị khóa",
        admins: "Ban Quản trị viên",
      };
      toast({
        title: "Đã phát thông báo nhóm",
        description: `Đã phát thành công tới ${count} tài khoản (${groupLabels[audience] || audience}).`,
      });
    }

    // Reset Form
    setTitle("");
    setBody("");
    setTarget("");
    load();
  };

  const handleRemove = (id) => {
    removeAdminLog(id);
    toast({ title: "Đã xóa bản ghi lịch sử thông báo" });
    load();
  };

  // Quick Template Apply
  const applyTemplate = (tplTitle, tplBody, type = "info") => {
    setTitle(tplTitle);
    setBody(tplBody);
    setNotifType(type);
  };

  const filteredList = list.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.body?.toLowerCase().includes(term) ||
      item.target?.toLowerCase().includes(term)
    );
  });

  // Analytics summary
  const totalSent = list.length;
  const totalDelivered = list.reduce((acc, curr) => acc + (curr.stats?.delivered || 0), 0);
  const totalRead = list.reduce((acc, curr) => acc + (curr.stats?.readCount || 0), 0);
  const overallReadRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Page Header & Stats Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-fuchsia-400" />
            Hệ Thống Thông Báo (Notifications Console)
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Tạo, gửi thông báo đẩy hàng loạt cho nhóm người dùng & theo dõi lượt đọc thời gian thực
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới dữ liệu
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Đã Phát</p>
            <p className="text-lg font-bold text-white font-mono">{totalSent} <span className="text-xs text-white/40 font-normal">chiến dịch</span></p>
          </div>
        </Panel>

        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Lượt Nhận</p>
            <p className="text-lg font-bold text-white font-mono">{totalDelivered} <span className="text-xs text-white/40 font-normal">tài khoản</span></p>
          </div>
        </Panel>

        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Đã Đọc</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">{totalRead} <span className="text-xs text-white/40 font-normal">lượt xem</span></p>
          </div>
        </Panel>

        <Panel className="p-3.5 bg-[#161936]/80 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Tỷ Lệ Đọc TB</p>
            <p className="text-lg font-bold text-amber-300 font-mono">{overallReadRate}%</p>
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Left Side: Compose Notification Form */}
        <Panel className="p-4 lg:col-span-5 space-y-4 h-fit bg-[#161936] border-white/15 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Tạo Thông Báo Mới (Broadcast)
            </h2>
            <span className="text-[11px] text-fuchsia-300 bg-fuchsia-500/15 px-2 py-0.5 rounded-full font-medium">
              Realtime Notification
            </span>
          </div>

          {/* Quick Templates Buttons */}
          <div className="space-y-1.5">
            <p className="text-xs text-white/60 font-medium">Mẫu tin nhắn nhanh (Quick Templates):</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    "🎉 Khuyến Mãi Nạp Tiền 100%",
                    "Tặng ngay 100% giá trị nạp tiền cho tất cả giao dịch nạp trong hôm nay! Đừng bỏ lỡ.",
                    "promotion"
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 transition-all flex items-center gap-1"
              >
                <Gift className="w-3 h-3" /> Thưởng Nạp
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    "🛠️ Thông Báo Bảo Trì Hệ Thống",
                    "Hệ thống sẽ tiến hành nâng cấp bảo trì định kỳ từ 02:00 - 04:00 sáng. Xin lỗi vì sự bất tiện này.",
                    "warning"
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" /> Bảo Trì
              </button>
              <button
                type="button"
                onClick={() =>
                  applyTemplate(
                    "🚀 Cập Nhật Sảnh Game Mới",
                    "Ra mắt sảnh cược Maymay 28 & Xổ Số PK10 với tỷ lệ trả thưởng cực hấp dẫn!",
                    "info"
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Sảnh Mới
              </button>
            </div>
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/70 font-medium block">Loại thông báo (Type):</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#0d102b] rounded-xl border border-white/10">
              {[
                { id: "info", label: "Thông tin", icon: Info, color: "text-blue-400" },
                { id: "promotion", label: "Khuyến mãi", icon: Gift, color: "text-fuchsia-400" },
                { id: "warning", label: "Cảnh báo", icon: ShieldAlert, color: "text-amber-400" },
                { id: "balance", label: "Số dư", icon: Zap, color: "text-emerald-400" },
              ].map((t) => {
                const Icon = t.icon;
                const active = notifType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNotifType(t.id)}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                      active
                        ? "bg-white/15 text-white shadow-sm border border-white/20"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Input Title */}
          <div className="space-y-1">
            <label className="text-xs text-white/70 font-medium block">
              Tiêu đề thông báo <span className="text-rose-400">*</span>
            </label>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo ngắn gọn..."
            />
          </div>

          {/* Form Input Body */}
          <div className="space-y-1">
            <label className="text-xs text-white/70 font-medium block">Nội dung thông báo</label>
            <textarea
              className={`${inputCls} h-24 py-2.5 resize-none leading-relaxed text-xs`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Nhập chi tiết nội dung thông báo gửi đến người dùng..."
            />
          </div>

          {/* Target Audience Selector */}
          <div className="space-y-2">
            <label className="text-xs text-white/70 font-medium block">Đối tượng nhận (Target Audience):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: "all", label: "Tất cả (All)", icon: Users },
                { id: "active", label: "Hoạt động", icon: CheckCircle2 },
                { id: "has_balance", label: "Có số dư > $0", icon: Zap },
                { id: "locked", label: "Bị khóa", icon: ShieldAlert },
                { id: "admins", label: "Ban QTV", icon: Users },
                { id: "user", label: "Đích danh", icon: User },
              ].map((g) => {
                const Icon = g.icon;
                const active = audience === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAudience(g.id)}
                    className={`h-9 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 px-2 transition-all ${
                      active
                        ? "border-fuchsia-500 bg-fuchsia-500/20 text-white shadow-md shadow-fuchsia-950/40"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={13} className={active ? "text-fuchsia-300" : "text-white/40"} />
                    <span className="truncate">{g.label}</span>
                  </button>
                );
              })}
            </div>

            {/* If specific user */}
            {audience === "user" && (
              <div className="pt-1">
                <input
                  className={inputCls}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Nhập Username / UID / Email người nhận..."
                />
              </div>
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold py-2.5 shadow-lg shadow-purple-900/30 rounded-xl"
            onClick={handleSend}
          >
            <Send size={16} className="mr-1.5" /> Phát Thông Báo Ngay
          </Button>
        </Panel>

        {/* Right Side: Notification Broadcast History & Read Count Dashboard */}
        <Panel className="lg:col-span-7 overflow-hidden bg-[#161936] border-white/15 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Lịch Sử Thông Báo Đã Phát (Broadcast Log & Read Tracking)
                </h2>
                <p className="text-xs text-white/40 mt-0.5">Theo dõi thời gian phát, đối tượng & số lượt người dùng đã đọc</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm lịch sử..."
                  className="w-full bg-[#0d102b] border border-white/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <TableWrap>
              <thead className="bg-white/[0.03]">
                <tr>
                  <Th>Thông Báo / Nội Dung</Th>
                  <Th>Đối Tượng</Th>
                  <Th>Tỷ Lệ Đọc (Read Count)</Th>
                  <Th>Thời Gian</Th>
                  <Th className="text-right">Xóa</Th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <Empty colSpan={5} text="Chưa có thông báo nào được phát hành" />
                ) : (
                  filteredList.map((n) => {
                    const delivered = n.stats?.delivered || 0;
                    const readCount = n.stats?.readCount || 0;
                    const readRate = n.stats?.readRate || 0;

                    const audienceBadge =
                      n.audience === "all" ? (
                        <Badge tone="purple">Tất cả</Badge>
                      ) : n.audience === "active" ? (
                        <Badge tone="green">Đang hoạt động</Badge>
                      ) : n.audience === "has_balance" ? (
                        <Badge tone="amber">Có số dư</Badge>
                      ) : n.audience === "locked" ? (
                        <Badge tone="red">Tài khoản khóa</Badge>
                      ) : n.audience === "admins" ? (
                        <Badge tone="purple">Ban QTV</Badge>
                      ) : (
                        <Badge tone="blue">{n.target || "Đích danh"}</Badge>
                      );

                    return (
                      <tr key={n.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <Td>
                          <div className="space-y-0.5">
                            <p className="text-white font-semibold text-xs flex items-center gap-1.5">
                              {n.type === "promotion" && <Gift className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />}
                              {n.type === "warning" && <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              {n.type === "balance" && <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              {n.type === "info" && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{n.body}</p>
                            )}
                          </div>
                        </Td>
                        <Td>{audienceBadge}</Td>
                        <Td>
                          <div className="space-y-1 min-w-[110px]">
                            <div className="flex justify-between items-center text-[11px] font-mono">
                              <span className="text-emerald-400 font-bold">{readCount}</span>
                              <span className="text-white/40">/ {delivered} người</span>
                              <span className="text-amber-300 font-bold">{readRate}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                style={{ width: `${Math.min(100, readRate)}%` }}
                              />
                            </div>
                          </div>
                        </Td>
                        <Td className="text-white/50 text-[11px] whitespace-nowrap">
                          {n.time ? new Date(n.time).toLocaleString("vi-VN") : "Gần đây"}
                        </Td>
                        <Td className="text-right">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                            onClick={() => handleRemove(n.id)}
                            title="Xóa thông báo này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </TableWrap>
          </div>
        </Panel>
      </div>
    </div>
  );
}
