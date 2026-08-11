// Centralized Game Store: manages game statuses, countdown timers, payout odds, custom games list, and audit logs.
// Provides real-time synchronization across client and admin components.
import { emitSocketEvent } from './socket';
import { queryClientInstance } from './query-client';

const STORAGE_KEY = "sands_game_store_config";
const AUDIT_LOG_KEY = "sands_game_audit_log";
const GAMES_STORAGE_KEY = "sands_custom_games_list";

export const getCustomGames = (defaultGames) => {
  try {
    const raw = localStorage.getItem(GAMES_STORAGE_KEY);
    if (!raw) return defaultGames;
    return JSON.parse(raw);
  } catch {
    return defaultGames;
  }
};

export const saveCustomGames = (games) => {
  try {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("GAMES_LIST_UPDATED", { detail: games }));
  } catch {}
  if (realtimeChannel) {
    try {
      realtimeChannel.postMessage({ type: "GAMES_LIST_UPDATED", games });
    } catch {}
  }
};

// Default game configurations
const DEFAULT_GAME_CONFIGS = {
  "may-man-28": {
    gameId: "may-man-28",
    title: "Hàn Quốc may mắn 28",
    status: "active", // "active" | "maintenance" | "disabled"
    timerDuration: 299, // 04:59 in seconds
    intermission: 10,
    odds: {
      tai_xiu: 0.98,
      chan_le: 0.98,
      hoa: 95,
      cap_so: 12,
    },
    oddsSchedules: [],
  },
  xoso: {
    gameId: "xoso",
    title: "Thời gian Đài Loan",
    status: "active",
    timerDuration: 299,
    intermission: 10,
    odds: {
      tai_xiu: 0.98,
      chan_le: 0.98,
      hoa: 95,
      cap_so: 12,
    },
    oddsSchedules: [
      {
        id: "sched_xoso_vip",
        name: "Cấu hình Thưởng VIP Khung Tối",
        badgeText: "⭐ Thưởng Tỷ Lệ VIP",
        slots: [{ startTime: "18:00", endTime: "23:59" }],
        targetScope: "system",
        targetUsers: [],
        type: "manual",
        percentBoost: 0,
        odds: { tai_xiu: 1.02, chan_le: 1.02, hoa: 98, cap_so: 14 },
        active: true,
      },
    ],
  },
  pk10: {
    gameId: "pk10",
    title: "Đài Loan PK10",
    status: "active",
    timerDuration: 299,
    intermission: 10,
    odds: {
      tai_xiu: 0.98,
      chan_le: 0.98,
      hoa: 95,
      cap_so: 12,
    },
    oddsSchedules: [],
  },
};

const listeners = new Set();

// Create BroadcastChannel for cross-tab realtime sync
let realtimeChannel = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    realtimeChannel = new BroadcastChannel("sands_game_realtime_channel");
    realtimeChannel.onmessage = (e) => {
      if (e.data?.type === "GAME_HALL_CONFIG_UPDATED" && e.data?.configs) {
        listeners.forEach((cb) => cb(e.data.configs));
      }
    };
  } catch {
    /* ignore */
  }
}

// Cross-tab localStorage listener fallback
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      const current = getGameConfigs();
      listeners.forEach((cb) => cb(current));
    }
  });
}

export const getGameConfigs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GAME_CONFIGS;
    return { ...DEFAULT_GAME_CONFIGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GAME_CONFIGS;
  }
};

export const getGameConfig = (gameId) => {
  const configs = getGameConfigs();
  return configs[gameId] || {
    gameId,
    title: gameId,
    status: "active",
    timerDuration: 299,
    intermission: 10,
    odds: { tai_xiu: 0.98, chan_le: 0.98, hoa: 95, cap_so: 12 },
  };
};

export const saveGameConfigs = (configs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    /* ignore */
  }

  // 1. Notify in-memory subscribers
  listeners.forEach((cb) => cb(configs));

  // 2. Dispatch custom events
  try {
    window.dispatchEvent(new CustomEvent("GAME_HALL_CONFIG_UPDATED", { detail: configs }));
    window.dispatchEvent(new CustomEvent("game-status-changed", { detail: configs }));
  } catch {
    /* ignore */
  }

  // 3. Post message over BroadcastChannel for cross-tab sync
  if (realtimeChannel) {
    try {
      realtimeChannel.postMessage({ type: "GAME_HALL_CONFIG_UPDATED", configs });
    } catch {
      /* ignore */
    }
  }

  // 4. Update TanStack Query cache & Emit Socket.io Event
  try {
    queryClientInstance.setQueryData(['gameConfigs'], configs);
    queryClientInstance.invalidateQueries({ queryKey: ['gameConfigs'] });
    emitSocketEvent('game:config_change', { configs });
  } catch {
    /* ignore */
  }
};

export const updateGameConfig = (gameId, patch, adminMeta = {}) => {
  const configs = getGameConfigs();
  const oldConfig = configs[gameId] || getGameConfig(gameId);
  const newConfig = { ...oldConfig, ...patch };

  // Write Audit Log
  const diffs = [];
  if (patch.status !== undefined && patch.status !== oldConfig.status) {
    diffs.push({ field: "Trạng thái (Status)", old: oldConfig.status, new: patch.status });
  }
  if (patch.timerDuration !== undefined && patch.timerDuration !== oldConfig.timerDuration) {
    diffs.push({
      field: "Thời gian cược (Timer)",
      old: formatMMSS(oldConfig.timerDuration),
      new: formatMMSS(patch.timerDuration),
    });
  }
  if (patch.odds !== undefined) {
    Object.keys(patch.odds).forEach((k) => {
      if (oldConfig.odds?.[k] !== patch.odds[k]) {
        diffs.push({
          field: `Tỷ lệ cược (${k})`,
          old: `1:${oldConfig.odds?.[k] ?? 0.98}`,
          new: `1:${patch.odds[k]}`,
        });
      }
    });
  }

  if (diffs.length > 0) {
    addAuditLog({
      adminId: adminMeta.adminId || "Admin",
      ip: adminMeta.ip || "127.0.0.1",
      gameId,
      gameTitle: newConfig.title || gameId,
      diffs,
    });
  }

  const updatedConfigs = { ...configs, [gameId]: newConfig };
  saveGameConfigs(updatedConfigs);
  return newConfig;
};

export const subscribeGameStore = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// ── Audit Logs ──────────────────────────────────────────────
export const getAuditLogs = () => {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addAuditLog = (entry) => {
  const logItem = {
    id: "log_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toLocaleString("vi-VN"),
    isoTime: new Date().toISOString(),
    adminId: entry.adminId || "Admin",
    ip: entry.ip || "127.0.0.1",
    gameId: entry.gameId,
    gameTitle: entry.gameTitle,
    diffs: entry.diffs || [],
  };

  const logs = getAuditLogs();
  const nextLogs = [logItem, ...logs].slice(0, 200); // Keep last 200 logs
  try {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(nextLogs));
  } catch {
    /* ignore */
  }
  return logItem;
};

// Utility: format seconds into MM:SS
export const formatMMSS = (totalSeconds) => {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Utility: parse MM:SS string into seconds
export const parseMMSS = (str) => {
  if (!str) return 299;
  const parts = str.split(":");
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10) || 0;
    const s = parseInt(parts[1], 10) || 0;
    return m * 60 + s;
  }
  return parseInt(str, 10) || 299;
};

// ── Automated Odds Scheduler Engine ─────────────────────────

/**
 * Checks whether the current time (or given Date) falls within any of the scheduled slots.
 */
export const isTimeInSlots = (slots, now = new Date()) => {
  if (!slots || !Array.isArray(slots) || slots.length === 0) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.some((slot) => {
    if (!slot.startTime || !slot.endTime) return false;
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes <= endTotal;
    } else {
      // Crosses midnight (e.g. 23:00 to 02:00)
      return currentMinutes >= startTotal || currentMinutes <= endTotal;
    }
  });
};

/**
 * Calculates effective odds and active event rule for a given user & game in real-time.
 */
export const getEffectiveGameOdds = (gameId, userId = null, userAccount = null, now = new Date()) => {
  const config = getGameConfig(gameId);
  const baseOdds = config.odds || { tai_xiu: 0.98, chan_le: 0.98, hoa: 95, cap_so: 12 };
  const schedules = config.oddsSchedules || [];

  const activeSchedules = schedules.filter((s) => s.active && isTimeInSlots(s.slots, now));

  if (activeSchedules.length === 0) {
    return {
      odds: baseOdds,
      activeRule: null,
      isBoosted: false,
    };
  }

  // Priority 1: User specific target rule
  let matchedRule = null;
  if (userId || userAccount) {
    matchedRule = activeSchedules.find((s) => {
      if (s.targetScope !== "users" || !Array.isArray(s.targetUsers)) return false;
      return s.targetUsers.some((u) => {
        const cleanU = String(u).trim().toLowerCase();
        return (
          (userId && String(userId).toLowerCase() === cleanU) ||
          (userAccount && String(userAccount).toLowerCase() === cleanU)
        );
      });
    });
  }

  // Priority 2: System-wide rule
  if (!matchedRule) {
    matchedRule = activeSchedules.find((s) => s.targetScope === "system");
  }

  if (!matchedRule) {
    return {
      odds: baseOdds,
      activeRule: null,
      isBoosted: false,
    };
  }

  // Compute calculated odds
  let calculatedOdds = { ...baseOdds };

  if (matchedRule.type === "percent") {
    const boostMult = 1 + (Number(matchedRule.percentBoost) || 0) / 100;
    Object.keys(baseOdds).forEach((key) => {
      calculatedOdds[key] = +(baseOdds[key] * boostMult).toFixed(2);
    });
  } else if (matchedRule.type === "manual" && matchedRule.odds) {
    Object.keys(matchedRule.odds).forEach((key) => {
      if (matchedRule.odds[key] !== undefined && matchedRule.odds[key] !== null) {
        calculatedOdds[key] = Number(matchedRule.odds[key]);
      }
    });
  }

  return {
    odds: calculatedOdds,
    activeRule: matchedRule,
    isBoosted: true,
  };
};

/**
 * Add a new odds schedule rule to a game
 */
export const addOddsScheduleRule = (gameId, ruleData) => {
  const configs = getGameConfigs();
  const config = configs[gameId] || getGameConfig(gameId);
  const currentSchedules = config.oddsSchedules || [];

  const newRule = {
    id: "sched_" + Date.now().toString(36),
    name: ruleData.name || "Lịch Đổi Tỷ Lệ Mới",
    badgeText: ruleData.badgeText || "🔥 Giờ Vàng X2 Thưởng",
    slots: ruleData.slots || [{ startTime: "12:00", endTime: "14:00" }],
    targetScope: ruleData.targetScope || "system", // "system" | "users"
    targetUsers: Array.isArray(ruleData.targetUsers) ? ruleData.targetUsers : [],
    type: ruleData.type || "percent", // "percent" | "manual"
    percentBoost: Number(ruleData.percentBoost) || 10,
    odds: ruleData.odds || { tai_xiu: 1.08, chan_le: 1.08, hoa: 105, cap_so: 15 },
    active: ruleData.active !== undefined ? ruleData.active : true,
  };

  const updatedSchedules = [newRule, ...currentSchedules];
  const updatedConfig = { ...config, oddsSchedules: updatedSchedules };

  const updatedConfigs = { ...configs, [gameId]: updatedConfig };
  saveGameConfigs(updatedConfigs);
  return updatedConfig;
};

/**
 * Update an existing odds schedule rule
 */
export const updateOddsScheduleRule = (gameId, ruleId, patch) => {
  const configs = getGameConfigs();
  const config = configs[gameId] || getGameConfig(gameId);
  const currentSchedules = config.oddsSchedules || [];

  const updatedSchedules = currentSchedules.map((rule) => {
    if (rule.id === ruleId) {
      return { ...rule, ...patch };
    }
    return rule;
  });

  const updatedConfig = { ...config, oddsSchedules: updatedSchedules };

  const updatedConfigs = { ...configs, [gameId]: updatedConfig };
  saveGameConfigs(updatedConfigs);
  return updatedConfig;
};

/**
 * Delete an odds schedule rule
 */
export const deleteOddsScheduleRule = (gameId, ruleId) => {
  const configs = getGameConfigs();
  const config = configs[gameId] || getGameConfig(gameId);
  const currentSchedules = config.oddsSchedules || [];

  const updatedSchedules = currentSchedules.filter((r) => r.id !== ruleId);
  const updatedConfig = { ...config, oddsSchedules: updatedSchedules };

  const updatedConfigs = { ...configs, [gameId]: updatedConfig };
  saveGameConfigs(updatedConfigs);
  return updatedConfig;
};

/**
 * Toggle active state of a schedule rule
 */
export const toggleOddsScheduleRule = (gameId, ruleId) => {
  const configs = getGameConfigs();
  const config = configs[gameId] || getGameConfig(gameId);
  const currentSchedules = config.oddsSchedules || [];

  const updatedSchedules = currentSchedules.map((rule) => {
    if (rule.id === ruleId) {
      return { ...rule, active: !rule.active };
    }
    return rule;
  });

  const updatedConfig = { ...config, oddsSchedules: updatedSchedules };

  const updatedConfigs = { ...configs, [gameId]: updatedConfig };
  saveGameConfigs(updatedConfigs);
  return updatedConfig;
};
