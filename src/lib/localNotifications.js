// Hệ thống thông báo cục bộ per-user (localStorage) — clean slate khi đăng ký.
import { localListUsers } from "@/lib/localAuth";
import { toast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

const inboxKey = (userId) => `stargame_notif_${userId}`;
const ADMIN_LOG_KEY = "stargame_notif_adminlog";

const listeners = new Map(); // userId -> Set<cb>

const read = (userId) => {
  if (!userId) return [];
  try { return JSON.parse(localStorage.getItem(inboxKey(userId))) || []; } catch { return []; }
};
const write = (userId, list) => {
  try { localStorage.setItem(inboxKey(userId), JSON.stringify(list.slice(0, 100))); } catch { /* ignore */ }
  emit(userId);
  try {
    queryClientInstance.invalidateQueries({ queryKey: ["notifications", userId] });
    queryClientInstance.invalidateQueries({ queryKey: ["userData", userId] });
  } catch { /* ignore */ }
};
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const emit = (userId) => {
  listeners.get(userId)?.forEach((cb) => cb());
  try {
    window.dispatchEvent(new CustomEvent("stargame_notif_update", { detail: { userId } }));
  } catch { /* ignore */ }
};

export const getNotifications = (userId) => read(userId);

export const pushNotification = (userId, n) => {
  if (!userId) return null;
  const item = { id: genId(), time: new Date().toISOString(), read: false, type: "info", ...n };
  write(userId, [item, ...read(userId)]);

  try {
    const isWin = n.type === "result" && (n.title?.includes("Thắng") || n.title?.includes("Cộng"));
    toast({
      title: n.title || "Thông báo",
      description: n.body || "",
      variant: isWin ? "success" : n.type === "destructive" ? "destructive" : "default",
    });
  } catch {
    /* ignore if called outside react tree */
  }

  return item.id;
};

export const markRead = (userId, id) =>
  write(userId, read(userId).map((n) => (n.id === id ? { ...n, read: true } : n)));
export const markAllRead = (userId) =>
  write(userId, read(userId).map((n) => ({ ...n, read: true })));
export const removeNotification = (userId, id) =>
  write(userId, read(userId).filter((n) => n.id !== id));
export const clearAll = (userId) => write(userId, []);

// Gửi tới nhóm người dùng cụ thể (Group Broadcast).
export const sendToGroup = (group, n) => {
  const users = localListUsers();
  let targets = [];

  if (group === "all") {
    targets = users;
  } else if (group === "active") {
    targets = users.filter((u) => !u.locked);
  } else if (group === "has_balance") {
    targets = users.filter((u) => (u.balance || 0) > 0);
  } else if (group === "locked") {
    targets = users.filter((u) => u.locked);
  } else if (group === "admins") {
    targets = users.filter((u) => u.role === "admin");
  } else {
    targets = users;
  }

  const logEntry = logAdmin({
    ...n,
    audience: group,
    target: group === "all" ? "Tất cả" : group,
    recipientCount: targets.length,
  });

  targets.forEach((u) => {
    pushNotification(u.id, {
      ...n,
      broadcastId: logEntry.id,
      audience: group,
    });
  });

  return targets.length;
};

// Gửi tới mọi người dùng (broadcast).
export const broadcastNotification = (n) => {
  return sendToGroup("all", n);
};

// Gửi đích danh theo username (account).
export const sendToUser = (account, n) => {
  const acc = String(account || "").trim().toLowerCase();
  const u = localListUsers().find((x) => x.account.toLowerCase() === acc || x.id === account || x.email?.toLowerCase() === acc);
  if (!u) return false;

  const logEntry = logAdmin({
    ...n,
    audience: "user",
    target: u.account || u.email || u.id,
    recipientCount: 1,
  });

  pushNotification(u.id, {
    ...n,
    broadcastId: logEntry.id,
    audience: "user",
  });

  return true;
};

// Thông báo cho các tài khoản quản trị (dùng khi người dùng nạp tiền…).
export const notifyAdmins = (n) => {
  return sendToGroup("admins", n);
};

// Lấy thống kê số lượt đã đọc (Read Counts & Rate) cho 1 bản ghi thông báo
export const getNotificationReadStats = (broadcastId) => {
  const users = localListUsers();
  let delivered = 0;
  let readCount = 0;

  users.forEach((u) => {
    const userNotifs = read(u.id);
    const match = userNotifs.find((x) => x.broadcastId === broadcastId);
    if (match) {
      delivered++;
      if (match.read) {
        readCount++;
      }
    }
  });

  const readRate = delivered > 0 ? Math.round((readCount / delivered) * 100) : 0;
  return { delivered, readCount, readRate };
};

// Nhật ký thông báo admin đã gửi.
export const getAdminLog = () => {
  try { return JSON.parse(localStorage.getItem(ADMIN_LOG_KEY)) || []; } catch { return []; }
};
const logAdmin = (entry) => {
  const item = { id: genId(), time: new Date().toISOString(), ...entry };
  const list = getAdminLog();
  try { localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify([item, ...list].slice(0, 100))); } catch { /* ignore */ }
  return item;
};
export const removeAdminLog = (id) => {
  const list = getAdminLog().filter((n) => n.id !== id);
  try { localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

// Lắng nghe thay đổi inbox của một user.
export const subscribe = (userId, cb) => {
  if (!userId) return () => {};
  if (!listeners.has(userId)) listeners.set(userId, new Set());
  listeners.get(userId).add(cb);
  return () => listeners.get(userId)?.delete(cb);
};