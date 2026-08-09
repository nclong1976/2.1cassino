import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Percent,
  ShieldAlert,
  ArrowRight,
  Save,
  Calendar,
  Plus,
  Trash2,
  Pencil,
  Users,
  Globe,
  Sparkles,
  Sliders
} from "lucide-react";
import {
  formatMMSS,
  parseMMSS,
  updateGameConfig,
  getGameConfig,
  addOddsScheduleRule,
  updateOddsScheduleRule,
  deleteOddsScheduleRule,
  toggleOddsScheduleRule,
  isTimeInSlots
} from "@/lib/gameStore";
import { useToast } from "@/components/ui/use-toast";

export default function GameConfigModal({ open, onOpenChange, game, onSaved }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general"); // "general" | "scheduler"

  // Base config states
  const [timerStr, setTimerStr] = useState("04:59");
  const [intermission, setIntermission] = useState(10);
  const [odds, setOdds] = useState({
    tai_xiu: 0.98,
    chan_le: 0.98,
    hoa: 95,
    cap_so: 12,
  });

  // Diff confirmation state
  const [showDiffConfirm, setShowDiffConfirm] = useState(false);
  const [diffs, setDiffs] = useState([]);

  // Scheduler Rules List State
  const [currentGameConfig, setCurrentGameConfig] = useState(null);

  // Sub-modal for Add/Edit Rule
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleName, setRuleName] = useState("");
  const [badgeText, setBadgeText] = useState("🔥 Thưởng Đặc Biệt");
  const [slots, setSlots] = useState([{ startTime: "12:00", endTime: "14:00" }]);
  const [targetScope, setTargetScope] = useState("system"); // "system" | "users"
  const [targetUsersStr, setTargetUsersStr] = useState("");
  const [ruleType, setRuleType] = useState("percent"); // "percent" | "manual"
  const [percentBoost, setPercentBoost] = useState(10);
  const [manualOdds, setManualOdds] = useState({
    tai_xiu: 1.08,
    chan_le: 1.08,
    hoa: 105,
    cap_so: 15,
  });
  const [ruleActive, setRuleActive] = useState(true);

  // Load game data on open
  useEffect(() => {
    if (game && open) {
      const gId = game.gameId || game.id;
      const freshConfig = getGameConfig(gId);
      setCurrentGameConfig(freshConfig);

      setTimerStr(formatMMSS(freshConfig.timerDuration || 299));
      setIntermission(freshConfig.intermission || 10);
      setOdds({
        tai_xiu: freshConfig.odds?.tai_xiu ?? 0.98,
        chan_le: freshConfig.odds?.chan_le ?? 0.98,
        hoa: freshConfig.odds?.hoa ?? 95,
        cap_so: freshConfig.odds?.cap_so ?? 12,
      });
      setShowDiffConfirm(false);
      setActiveTab("general");
    }
  }, [game, open]);

  const refreshConfigState = () => {
    if (!game) return;
    const gId = game.gameId || game.id;
    const fresh = getGameConfig(gId);
    setCurrentGameConfig(fresh);
    onSaved?.(fresh);
  };

  // Review base changes
  const handleReviewChanges = () => {
    const newTimerSeconds = parseMMSS(timerStr);
    const oldTimerSeconds = currentGameConfig?.timerDuration || 299;

    const computedDiffs = [];
    if (newTimerSeconds !== oldTimerSeconds) {
      computedDiffs.push({
        label: "Thời gian ván cược (Timer)",
        oldVal: formatMMSS(oldTimerSeconds),
        newVal: formatMMSS(newTimerSeconds),
      });
    }
    if (Number(intermission) !== (currentGameConfig?.intermission || 10)) {
      computedDiffs.push({
        label: "Thời gian nghỉ chuyển ván (Cooldown)",
        oldVal: `${currentGameConfig?.intermission || 10} giây`,
        newVal: `${intermission} giây`,
      });
    }

    const currentOdds = currentGameConfig?.odds || { tai_xiu: 0.98, chan_le: 0.98, hoa: 95, cap_so: 12 };
    if (Number(odds.tai_xiu) !== currentOdds.tai_xiu) {
      computedDiffs.push({
        label: "Tỷ lệ cược (Tài/Xỉu)",
        oldVal: `1:${currentOdds.tai_xiu}`,
        newVal: `1:${odds.tai_xiu}`,
      });
    }
    if (Number(odds.chan_le) !== currentOdds.chan_le) {
      computedDiffs.push({
        label: "Tỷ lệ cược (Chẵn/Lẻ)",
        oldVal: `1:${currentOdds.chan_le}`,
        newVal: `1:${odds.chan_le}`,
      });
    }
    if (Number(odds.hoa) !== currentOdds.hoa) {
      computedDiffs.push({
        label: "Tỷ lệ cược (Cửa Hòa)",
        oldVal: `1:${currentOdds.hoa}`,
        newVal: `1:${odds.hoa}`,
      });
    }
    if (Number(odds.cap_so) !== currentOdds.cap_so) {
      computedDiffs.push({
        label: "Tỷ lệ cược (Cặp số)",
        oldVal: `1:${currentOdds.cap_so}`,
        newVal: `1:${odds.cap_so}`,
      });
    }

    if (computedDiffs.length === 0) {
      onOpenChange(false);
      return;
    }

    setDiffs(computedDiffs);
    setShowDiffConfirm(true);
  };

  const handleConfirmSave = () => {
    const newTimerSeconds = parseMMSS(timerStr);
    const gId = game.gameId || game.id;
    const updated = updateGameConfig(
      gId,
      {
        timerDuration: newTimerSeconds,
        intermission: Number(intermission),
        odds: {
          tai_xiu: Number(odds.tai_xiu),
          chan_le: Number(odds.chan_le),
          hoa: Number(odds.hoa),
          cap_so: Number(odds.cap_so),
        },
      },
      { adminId: "Admin_Principal", ip: "127.0.0.1" }
    );

    toast({
      title: "Thành công",
      description: "Đã cập nhật cấu hình sảnh và áp dụng tới toàn bộ người chơi thời gian thực!",
      variant: "success",
    });

    setShowDiffConfirm(false);
    onOpenChange(false);
    onSaved?.(updated);
  };

  // Rule Form Handlers
  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleName("Khung Giờ Thưởng Đặc Biệt");
    setBadgeText("🔥 Thưởng Đặc Biệt");
    setSlots([{ startTime: "12:00", endTime: "14:00" }, { startTime: "20:00", endTime: "23:00" }]);
    setTargetScope("system");
    setTargetUsersStr("");
    setRuleType("percent");
    setPercentBoost(10);
    setManualOdds({
      tai_xiu: (odds.tai_xiu * 1.1).toFixed(2),
      chan_le: (odds.chan_le * 1.1).toFixed(2),
      hoa: odds.hoa + 10,
      cap_so: odds.cap_so + 3,
    });
    setRuleActive(true);
    setShowRuleModal(true);
  };

  const handleOpenEditRule = (rule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name || "");
    setBadgeText(rule.badgeText || "🔥 Thưởng Đặc Biệt");
    setSlots(rule.slots && rule.slots.length ? rule.slots : [{ startTime: "12:00", endTime: "14:00" }]);
    setTargetScope(rule.targetScope || "system");
    setTargetUsersStr(Array.isArray(rule.targetUsers) ? rule.targetUsers.join(", ") : "");
    setRuleType(rule.type || "percent");
    setPercentBoost(rule.percentBoost ?? 10);
    setManualOdds({
      tai_xiu: rule.odds?.tai_xiu ?? 1.08,
      chan_le: rule.odds?.chan_le ?? 1.08,
      hoa: rule.odds?.hoa ?? 105,
      cap_so: rule.odds?.cap_so ?? 15,
    });
    setRuleActive(rule.active !== undefined ? rule.active : true);
    setShowRuleModal(true);
  };

  const handleAddSlot = () => {
    setSlots([...slots, { startTime: "18:00", endTime: "21:00" }]);
  };

  const handleRemoveSlot = (idx) => {
    if (slots.length <= 1) return;
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const handleSlotChange = (idx, field, val) => {
    setSlots(
      slots.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleSaveRule = () => {
    if (!ruleName.trim()) {
      toast({ title: "Thiếu tên quy tắc", description: "Vui lòng nhập tên nhãn sự kiện", variant: "destructive" });
      return;
    }

    const gId = game.gameId || game.id;
    const targetUsersList = targetUsersStr
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const ruleData = {
      name: ruleName,
      badgeText,
      slots,
      targetScope,
      targetUsers: targetUsersList,
      type: ruleType,
      percentBoost: Number(percentBoost),
      odds: {
        tai_xiu: Number(manualOdds.tai_xiu),
        chan_le: Number(manualOdds.chan_le),
        hoa: Number(manualOdds.hoa),
        cap_so: Number(manualOdds.cap_so),
      },
      active: ruleActive,
    };

    if (editingRuleId) {
      updateOddsScheduleRule(gId, editingRuleId, ruleData);
    } else {
      addOddsScheduleRule(gId, ruleData);
    }

    toast({
      title: "Thành công",
      description: "Đã thiết lập lịch tự động đổi tỷ lệ trả thưởng theo khung giờ thành công!",
      variant: "success",
    });

    setShowRuleModal(false);
    refreshConfigState();
  };

  const handleToggleRule = (ruleId) => {
    const gId = game.gameId || game.id;
    toggleOddsScheduleRule(gId, ruleId);
    refreshConfigState();
    toast({
      title: "Đã đổi trạng thái quy tắc",
      description: "Dữ liệu được phát sóng tới toàn bộ khách hàng thời gian thực!",
    });
  };

  const handleDeleteRule = (ruleId) => {
    const gId = game.gameId || game.id;
    deleteOddsScheduleRule(gId, ruleId);
    refreshConfigState();
    toast({
      title: "Đã xóa quy tắc lập lịch",
      description: "Quy tắc đã bị xóa khỏi hệ thống.",
      variant: "destructive",
    });
  };

  if (!game) return null;

  const schedules = currentGameConfig?.oddsSchedules || [];

  return (
    <>
      {/* Primary Modal */}
      <Dialog open={open && !showDiffConfirm && !showRuleModal} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#161936] border-white/15 text-white max-w-2xl w-[95vw] rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold text-[#bd9c59] flex items-center gap-2">
                <Sliders className="w-5 h-5" /> Cấu hình & Lập lịch Tỷ lệ: {game.title || game.name}
              </DialogTitle>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-3 pt-1">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "general"
                    ? "bg-[#bd9c59] text-black shadow-md"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Cơ Bản & Payout Mặc Định
              </button>

              <button
                onClick={() => setActiveTab("scheduler")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "scheduler"
                    ? "bg-[#bd9c59] text-black shadow-md"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Lập Lịch Tỷ Lệ Thưởng (Scheduler)
                {schedules.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-bold text-white">
                    {schedules.length}
                  </span>
                )}
              </button>
            </div>
          </DialogHeader>

          {/* TAB 1: GENERAL & BASE ODDS */}
          {activeTab === "general" && (
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
              {/* Countdown Timer MM:SS */}
              <div className="bg-white/5 p-3.5 rounded-xl space-y-2 border border-white/10">
                <p className="text-xs font-semibold text-[#bd9c59] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Thời gian ván cược (MM:SS)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-white/60">Thời gian đếm ngược (Format MM:SS)</Label>
                    <Input
                      value={timerStr}
                      onChange={(e) => setTimerStr(e.target.value)}
                      placeholder="04:59"
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono text-center text-lg h-10 mt-1"
                    />
                    <p className="text-[10px] text-white/40 mt-1">Mặc định: 04:59 (299 giây)</p>
                  </div>
                  <div>
                    <Label className="text-[11px] text-white/60">Thời gian nghỉ (Giây)</Label>
                    <Input
                      type="number"
                      value={intermission}
                      onChange={(e) => setIntermission(e.target.value)}
                      placeholder="10"
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono text-center text-lg h-10 mt-1"
                    />
                    <p className="text-[10px] text-white/40 mt-1">Nghỉ giữa 2 ván cược</p>
                  </div>
                </div>
              </div>

              {/* Payout Rates (Manual Odds) */}
              <div className="bg-white/5 p-3.5 rounded-xl space-y-2 border border-white/10">
                <p className="text-xs font-semibold text-[#bd9c59] flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" /> Tỷ lệ trả thưởng Mặc định (Base Odds)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-white/60">Cửa Tài / Xỉu (1:x)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={odds.tai_xiu}
                      onChange={(e) => setOdds({ ...odds, tai_xiu: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-white/60">Cửa Chẵn / Lẻ (1:x)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={odds.chan_le}
                      onChange={(e) => setOdds({ ...odds, chan_le: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-white/60">Cửa Hòa (1:x)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={odds.hoa}
                      onChange={(e) => setOdds({ ...odds, hoa: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-white/60">Cửa Cặp số (1:x)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={odds.cap_so}
                      onChange={(e) => setOdds({ ...odds, cap_so: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-9 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ODDS SCHEDULER ENGINE */}
          {activeTab === "scheduler" && (
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Automated Realtime Odds Scheduler Engine
                  </p>
                  <p className="text-[11px] text-white/70">
                    Tự động chuyển đổi tỷ lệ thưởng theo khung giờ và nhóm người dùng realtime.
                  </p>
                </div>
                <Button
                  onClick={handleOpenAddRule}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1 shadow-md shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo Lịch Mới
                </Button>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <Calendar className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="text-xs text-white/60">Chưa có khung giờ lập lịch nào cho sảnh game này.</p>
                  <Button
                    onClick={handleOpenAddRule}
                    size="sm"
                    variant="outline"
                    className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                  >
                    + Lập Lịch Tỷ Lệ Ngay
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {schedules.map((rule) => {
                    const currentlyActive = rule.active && isTimeInSlots(rule.slots);
                    return (
                      <div
                        key={rule.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                          currentlyActive
                            ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5"
                            : rule.active
                            ? "bg-white/5 border-white/15"
                            : "bg-white/2 border-white/5 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-white">{rule.name}</span>
                              {rule.badgeText && (
                                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] shadow">
                                  {rule.badgeText}
                                </span>
                              )}
                              {currentlyActive && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] animate-pulse">
                                  ● Đang kích hoạt ngay
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-white/70 flex-wrap">
                              <span className="flex items-center gap-1 font-mono text-amber-300/90">
                                <Clock className="w-3 h-3" />
                                {rule.slots?.map((s) => `${s.startTime}-${s.endTime}`).join(", ")}
                              </span>

                              <span className="flex items-center gap-1">
                                {rule.targetScope === "users" ? (
                                  <>
                                    <Users className="w-3 h-3 text-cyan-400" />
                                    <span className="text-cyan-300 font-medium">
                                      Chỉ định ({rule.targetUsers?.length || 0} UID)
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 text-emerald-400" />
                                    <span>Toàn hệ thống</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Switch
                              checked={rule.active}
                              onCheckedChange={() => handleToggleRule(rule.id)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenEditRule(rule)}
                              className="w-7 h-7 text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Odds adjustment details preview */}
                        <div className="pt-2 border-t border-white/10 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                          <div className="bg-black/30 p-1.5 rounded text-center">
                            <span className="text-white/50 block text-[9px]">Tài/Xỉu</span>
                            <span className="text-emerald-400 font-bold">
                              1:
                              {rule.type === "percent"
                                ? (odds.tai_xiu * (1 + (rule.percentBoost || 0) / 100)).toFixed(2)
                                : rule.odds?.tai_xiu ?? odds.tai_xiu}
                            </span>
                          </div>

                          <div className="bg-black/30 p-1.5 rounded text-center">
                            <span className="text-white/50 block text-[9px]">Chẵn/Lẻ</span>
                            <span className="text-emerald-400 font-bold">
                              1:
                              {rule.type === "percent"
                                ? (odds.chan_le * (1 + (rule.percentBoost || 0) / 100)).toFixed(2)
                                : rule.odds?.chan_le ?? odds.chan_le}
                            </span>
                          </div>

                          <div className="bg-black/30 p-1.5 rounded text-center">
                            <span className="text-white/50 block text-[9px]">Cửa Hòa</span>
                            <span className="text-amber-400 font-bold">
                              1:
                              {rule.type === "percent"
                                ? (odds.hoa * (1 + (rule.percentBoost || 0) / 100)).toFixed(0)
                                : rule.odds?.hoa ?? odds.hoa}
                            </span>
                          </div>

                          <div className="bg-black/30 p-1.5 rounded text-center">
                            <span className="text-white/50 block text-[9px]">Cặp Số</span>
                            <span className="text-purple-400 font-bold">
                              1:
                              {rule.type === "percent"
                                ? (odds.cap_so * (1 + (rule.percentBoost || 0) / 100)).toFixed(0)
                                : rule.odds?.cap_so ?? odds.cap_so}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60">
              Đóng
            </Button>
            {activeTab === "general" && (
              <Button
                onClick={handleReviewChanges}
                className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white font-semibold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Xem thay đổi (Diff)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-modal: Rule Config Form (Add/Edit) */}
      <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
        <DialogContent className="bg-[#12142d] border-emerald-500/30 text-white max-w-lg w-[95vw] rounded-2xl p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {editingRuleId ? "Chỉnh Sửa Lịch Tỷ Lệ" : "Thiết Lập Lịch Tỷ Lệ Thưởng Mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 py-2 max-h-[65vh] overflow-y-auto pr-1">
            {/* Rule Name & Badge */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[11px] text-white/70">Tên sự kiện / Quy tắc</Label>
                <Input
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Ví dụ: Giờ Vàng X2 Thưởng Khung 12h"
                  className="bg-[#0A0E1A] border-white/15 text-white h-9 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] text-white/70">Nhãn Badge khách hàng</Label>
                <Input
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="Ví dụ: 🔥 Giờ Vàng X2 Thưởng"
                  className="bg-[#0A0E1A] border-white/15 text-amber-300 font-bold h-9 text-xs mt-1"
                />
              </div>
            </div>

            {/* Time slots picker */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Khung giờ hoạt động trong ngày (Time Slots)
                </Label>
                <Button
                  onClick={handleAddSlot}
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] border-amber-500/40 text-amber-300 hover:bg-amber-500/10 px-2"
                >
                  + Thêm khung giờ
                </Button>
              </div>

              <div className="space-y-1.5">
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] text-white/50 w-12 shrink-0">Khung {idx + 1}:</span>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleSlotChange(idx, "startTime", e.target.value)}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-8 text-xs text-center"
                    />
                    <span className="text-white/40 text-xs">đến</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleSlotChange(idx, "endTime", e.target.value)}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-8 text-xs text-center"
                    />
                    {slots.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveSlot(idx)}
                        className="w-8 h-8 text-red-400 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scope Selection */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
              <Label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Cài đặt Phạm vi áp dụng (Target Scope)
              </Label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetScope("system")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    targetScope === "system"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-black/20 border-white/10 text-white/70"
                  }`}
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs">Toàn bộ người chơi</p>
                    <p className="text-[9px] text-white/50">System-Wide</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetScope("users")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    targetScope === "users"
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-black/20 border-white/10 text-white/70"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs">Người dùng chỉ định</p>
                    <p className="text-[9px] text-white/50">Target User UIDs</p>
                  </div>
                </button>
              </div>

              {targetScope === "users" && (
                <div className="pt-1">
                  <Label className="text-[11px] text-cyan-200">
                    Danh sách UID / Email (Phân tách bằng dấu phẩy):
                  </Label>
                  <Textarea
                    value={targetUsersStr}
                    onChange={(e) => setTargetUsersStr(e.target.value)}
                    placeholder="Ví dụ: u_msj7zz8j, admin_demo, vip_001@app.com"
                    className="bg-[#0A0E1A] border-white/15 text-white text-xs mt-1 h-16 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Odds Adjustment Mode */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
              <Label className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" /> Điều chỉnh Tỷ lệ Trả thưởng (Odds Matrix)
              </Label>

              <div className="flex gap-3 text-xs mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ruleType"
                    checked={ruleType === "percent"}
                    onChange={() => setRuleType("percent")}
                    className="accent-purple-500"
                  />
                  <span>Tăng theo phần trăm hàng loạt (%)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ruleType"
                    checked={ruleType === "manual"}
                    onChange={() => setRuleType("manual")}
                    className="accent-purple-500"
                  />
                  <span>Chỉnh thủ công từng ô</span>
                </label>
              </div>

              {ruleType === "percent" ? (
                <div>
                  <Label className="text-[11px] text-white/70">% Tăng thưởng hàng loạt</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={percentBoost}
                      onChange={(e) => setPercentBoost(e.target.value)}
                      placeholder="10"
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono text-center font-bold text-base h-9 w-28"
                    />
                    <span className="text-xs text-emerald-400 font-semibold">
                      (+{percentBoost}% cho tất cả tỷ lệ cược)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="text-[10px] text-white/60">Tài/Xỉu (1:x)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={manualOdds.tai_xiu}
                      onChange={(e) => setManualOdds({ ...manualOdds, tai_xiu: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-8 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-white/60">Chẵn/Lẻ (1:x)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={manualOdds.chan_le}
                      onChange={(e) => setManualOdds({ ...manualOdds, chan_le: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-8 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-white/60">Cửa Hòa (1:x)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={manualOdds.hoa}
                      onChange={(e) => setManualOdds({ ...manualOdds, hoa: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-8 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-white/60">Cặp số (1:x)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={manualOdds.cap_so}
                      onChange={(e) => setManualOdds({ ...manualOdds, cap_so: e.target.value })}
                      className="bg-[#0A0E1A] border-white/15 text-white font-mono h-8 text-xs mt-0.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-semibold text-white">Kích hoạt quy tắc này ngay</span>
              <Switch checked={ruleActive} onCheckedChange={setRuleActive} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowRuleModal(false)} className="text-white/60">
              Hủy
            </Button>
            <Button
              onClick={handleSaveRule}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu Quy Tắc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diff Confirmation Pop-up */}
      <Dialog open={showDiffConfirm} onOpenChange={setShowDiffConfirm}>
        <DialogContent className="bg-[#12142d] border-amber-500/30 text-white max-w-md w-[95vw] rounded-2xl p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Xác nhận lưu cấu hình (Diff View)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-white/70">
              Vui lòng kiểm tra lại các thông số thay đổi bên dưới trước khi áp dụng lên hệ thống:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {diffs.map((d, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs space-y-1">
                  <p className="font-semibold text-white/90">{d.label}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-red-400/90 font-mono bg-red-500/10 px-2 py-0.5 rounded">
                      Cũ: {d.oldVal}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      Mới: {d.newVal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-white/40 italic">
              * Thao tác này sẽ tự động ghi lại lịch sử vào Nhật ký thao tác (Audit Log).
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDiffConfirm(false)} className="text-white/60">
              Quay lại chỉnh sửa
            </Button>
            <Button
              onClick={handleConfirmSave}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu & Ghi Audit Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
