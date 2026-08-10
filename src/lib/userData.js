import { useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured } from "./supabase";
import { spGetUserProfile } from "./supabaseService";

// Kho dữ liệu cá nhân theo user (localStorage) — trạng thái sạch khi đăng ký.
const key = (userId) => `userdata_${userId}`;

export const defaultUserData = () => ({
  balance: 0,
  profit: 0,
  bets: [],
  txs: [],
  linked: [],
  turnover: 0,
  withdrawRequests: [], // Đơn rút tiền đang chờ admin duyệt
});

const listeners = new Set();

export const resolveUserId = (userId) => {
  if (userId) return String(userId);
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return String(u.id);
      if (u?.account) return String(u.account);
      if (u?.email) return String(u.email);
    }
  } catch { /* ignore */ }
  return "guest_user";
};

export const getUserData = (userId) => {
  const uid = resolveUserId(userId);
  try {
    const raw = localStorage.getItem(key(uid));
    if (!raw) {
      const d = defaultUserData();
      localStorage.setItem(key(uid), JSON.stringify(d));
      return d;
    }
    return { ...defaultUserData(), ...JSON.parse(raw) };
  } catch {
    return defaultUserData();
  }
};

export const saveUserData = (userId, data) => {
  const uid = resolveUserId(userId);
  try {
    localStorage.setItem(key(uid), JSON.stringify(data));
    try {
      window.dispatchEvent(new CustomEvent("user-data-changed", { detail: { userId: uid, data } }));
      window.dispatchEvent(new CustomEvent("FORCE_BALANCE_SYNC", { detail: { userId: uid, balance: data?.balance } }));
    } catch { /* ignore */ }
  } catch { /* ignore */ }
  listeners.forEach((l) => l(uid));
};

export const updateUserData = (userId, patch) => {
  const uid = resolveUserId(userId);
  const cur = getUserData(uid);
  let next = typeof patch === "function" ? patch(cur) : { ...cur, ...patch };
  if (next && next.balance !== undefined) {
    const rawBal = next.balance;
    const cleanBal = parseFloat(String(rawBal).replace(/[^0-9.-]+/g, "")) || 0;
    next.balance = Math.max(0, +cleanBal.toFixed(2));
  }
  saveUserData(uid, next);
  return next;
};

export const subscribeUserData = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// React hook tiện lợi cho component.
export const useUserData = (userId) => {
  const uid = resolveUserId(userId);
  const [data, setData] = useState(() => getUserData(uid));

  const refresh = useCallback(() => {
    const latest = getUserData(uid);
    setData((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(latest)) {
        return latest;
      }
      return prev;
    });
  }, [uid]);

  useEffect(() => {
    refresh();

    // 1. In-memory pub/sub
    const unsub = subscribeUserData((notifiedUid) => {
      if (!uid || notifiedUid === uid) refresh();
    });

    // 2. Realtime FORCE_BALANCE_SYNC event handler
    const handleForceSync = (e) => {
      if (!e.detail?.userId || e.detail.userId === uid) {
        refresh();
      }
    };
    window.addEventListener("FORCE_BALANCE_SYNC", handleForceSync);
    window.addEventListener("user-data-changed", handleForceSync);

    // 3. Cross-tab localStorage synchronization
    const handleStorage = (e) => {
      if (!e.key || e.key === key(uid)) {
        refresh();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Sync on window focus
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);

    // 5. Real-time polling mechanism & Supabase remote balance sync
    const timer = setInterval(() => {
      refresh();
      if (isSupabaseConfigured() && uid && uid !== 'guest_user') {
        spGetUserProfile(uid).then((spProfile) => {
          if (spProfile && typeof spProfile.balance === 'number') {
            const currentData = getUserData(uid);
            if (currentData.balance !== spProfile.balance) {
              updateUserData(uid, { balance: spProfile.balance });
            }
          }
        }).catch(() => {});
      }
    }, 2000);

    return () => {
      unsub();
      window.removeEventListener("FORCE_BALANCE_SYNC", handleForceSync);
      window.removeEventListener("user-data-changed", handleForceSync);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      clearInterval(timer);
    };
  }, [uid, refresh]);

  const update = useCallback((patch) => updateUserData(uid, patch), [uid]);
  return { data, update, refresh };
};