import { triggerAdminNotification } from "@/lib/adminNotifications";
import { isSupabaseConfigured } from "./supabase";
import { spSendChatMessage, spSubscribeChat, spFetchChatMessages } from "./supabaseService";

// Kho chat local (localStorage) — trao đổi tin nhắn giữa User và Admin.
// Chạy hoàn toàn trong trình duyệt, realtime qua in-memory + storage event.

const CHAT_KEY = "local_chat";
const listeners = new Set();

const read = () => {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (msgs) => {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs)); } catch { /* ignore */ }
  listeners.forEach((l) => l(read()));
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CHAT_KEY) listeners.forEach((l) => l(read()));
  });
}

export const getChatMessages = () => read();

export const getThread = (userId) =>
  read()
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

export const getConversations = () => {
  const msgs = read();
  const map = new Map();
  msgs.forEach((m) => {
    const ex = map.get(m.userId);
    if (!ex || new Date(m.created_date) > new Date(ex.last)) {
      map.set(m.userId, {
        userId: m.userId,
        userEmail: m.userEmail,
        userName: m.userName,
        last: m.created_date,
        lastBody: m.body || (m.image ? "📷 Hình ảnh" : ""),
      });
    }
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.last) - new Date(a.last));
};

export const addChatMessage = ({ userId, userEmail, userName, senderRole, body, image }) => {
  const msg = {
    id: "m_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userId,
    userEmail: userEmail || "",
    userName: userName || "",
    senderRole,
    body: body || "",
    image: image || "",
    created_date: new Date().toISOString(),
  };
  const msgs = read();
  msgs.push(msg);
  write(msgs);

  if (isSupabaseConfigured()) {
    spSendChatMessage({
      id: msg.id,
      userId: userId,
      username: userName || userEmail || 'User',
      message: body || (image ? '[Hình ảnh]' : ''),
    }).catch(() => {});
  }

  if (senderRole === "user") {
    try {
      triggerAdminNotification(
        "chat",
        `Tin nhắn mới từ ${userName || userEmail || "Người dùng"}`,
        body || (image ? "[Hình ảnh đính kèm]" : "Đã gửi tin nhắn hỗ trợ")
      );
    } catch {}
  }

  return msg;
};

export const subscribeChat = (cb) => {
  listeners.add(cb);

  let unsubSupabase = () => {};
  if (isSupabaseConfigured()) {
    unsubSupabase = spSubscribeChat((spMsg) => {
      if (spMsg) {
        const msgs = read();
        if (!msgs.some((m) => m.id === spMsg.id)) {
          msgs.push({
            id: spMsg.id,
            userId: spMsg.user_id,
            userName: spMsg.username,
            body: spMsg.message,
            created_date: spMsg.created_at,
          });
          write(msgs);
        }
      }
    });
  }

  return () => {
    listeners.delete(cb);
    unsubSupabase();
  };
};