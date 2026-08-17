import { useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured } from "./supabase";
import {
    spGetUserProfile,
    spFetchUserTransactions,
    spFetchUserWithdrawRequests,
    spSubscribeUserProfile,
    spFetchUserBets,
} from "./supabaseService";
import { emitSocketEvent } from "./socket";
import { queryClientInstance } from "./query-client";

// Kho dữ liệu cá nhân theo user (localStorage cache + Supabase DB sync)
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

// Create BroadcastChannel for cross-tab user data synchronization
let userChannel = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
    try {
          userChannel = new BroadcastChannel("sands_user_realtime_channel");
          userChannel.onmessage = (e) => {
                  if (e.data?.type === "USER_DATA_UPDATED" && e.data?.userId) {
                            listeners.forEach((l) => l(e.data.userId));
                            try {
                                        queryClientInstance.invalidateQueries({ queryKey: ["userData", e.data.userId] });
                            } catch { /* ignore */ }
                  }
          };
    } catch { /* ignore */ }
}

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

    // Sync with TanStack Query, BroadcastChannel & Socket.io
    try {
          queryClientInstance.setQueryData(["userData", uid], data);
          queryClientInstance.invalidateQueries({ queryKey: ["userData", uid] });
          emitSocketEvent("user:balance_change", { userId: uid, data });
          if (userChannel) {
                  userChannel.postMessage({ type: "USER_DATA_UPDATED", userId: uid, data });
          }
    } catch { /* ignore */ }
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

// Hàm đồng bộ toàn diện trạng thái tài khoản người dùng từ Supabase DB (Balance, Bank, Txs, WithdrawRequests)
export const syncFullAccountState = async (userId) => {
    if (!isSupabaseConfigured() || !userId || userId === "guest_user") return;

    try {
          const uid = resolveUserId(userId);
          const spProfile = await spGetUserProfile(uid);

      if (spProfile) {
              const curData = getUserData(uid);
              const patch = {};

            // 1. Đồng bộ Số Dư (Balance), Doanh số (Turnover) và Lợi nhuận (Profit)
            if (typeof spProfile.balance === "number" && curData.balance !== spProfile.balance) {
                      patch.balance = spProfile.balance;
            }
              if (typeof spProfile.turnover === "number" && curData.turnover !== spProfile.turnover) {
                        patch.turnover = spProfile.turnover;
              }
              if (typeof spProfile.profit === "number" && curData.profit !== spProfile.profit) {
                        patch.profit = spProfile.profit;
              }

            // 2. Đồng bộ Thông tin Ngân hàng đã liên kết (Bank Info)
            if (spProfile.bank_info && spProfile.bank_info.bankName) {
                      const bankObj = {
                                  id: "bank_sp_" + (spProfile.id || uid),
                                  type: "bank",
                                  bankName: spProfile.bank_info.bankName,
                                  accountNumber: spProfile.bank_info.accountNumber || "",
                                  holder: spProfile.bank_info.holder || spProfile.full_name || "",
                      };
                      const existingLinked = curData.linked || [];
                      const hasBank = existingLinked.some((l) => l.type === "bank" && l.accountNumber === bankObj.accountNumber);
                      if (!hasBank) {
                                  const filtered = existingLinked.filter((l) => l.type !== "bank");
                                  patch.linked = [bankObj, ...filtered];
                      }
            }

            if (Object.keys(patch).length > 0) {
                      updateUserData(uid, patch);
            }
      }

      // 3. Đồng bộ Lịch sử Giao dịch (Transactions)
      const spTxs = await spFetchUserTransactions(uid);
          if (spTxs && Array.isArray(spTxs) && spTxs.length > 0) {
                  const curData = getUserData(uid);
                  const localTxs = curData.txs || [];
                  const mergedMap = new Map();

            // Thêm giao dịch local trước
            localTxs.forEach((tx) => mergedMap.set(tx.id, tx));

            // Merge giao dịch từ Supabase
            spTxs.forEach((tx) => {
                      mergedMap.set(tx.id, {
                                  id: tx.id,
                                  type: tx.type,
                                  amount: Number(tx.amount),
                                  status: tx.status || "completed",
                                  method: tx.method || "System",
                                  reason: tx.reason || "",
                                  time: new Date(tx.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + new Date(tx.created_at).toLocaleDateString("vi-VN"),
                                  created_date: tx.created_at,
                      });
            });
                  const mergedList = Array.from(mergedMap.values()).sort(
                            (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)
                          );

            if (JSON.stringify(localTxs) !== JSON.stringify(mergedList)) {
                      updateUserData(uid, { txs: mergedList });
            }
          }

      // 4. Đồng bộ Đơn rút tiền (Withdraw Requests)
      const spWRs = await spFetchUserWithdrawRequests(uid);
          if (spWRs && Array.isArray(spWRs) && spWRs.length > 0) {
                  const curData = getUserData(uid);
                  const localWRs = curData.withdrawRequests || [];
                  const wrMap = new Map();

            localWRs.forEach((w) => wrMap.set(w.id, w));
                  spWRs.forEach((w) => {
                            wrMap.set(w.id, {
                                        id: w.id,
                                        userId: w.user_id,
                                        account: w.account,
                                        amount: Number(w.amount),
                                        bankInfo: w.bank_info || {},
                                        status: w.status,
                                        created_at: w.created_at,
                            });
                  });

            const mergedWRs = Array.from(wrMap.values()).sort(
                      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
                    );

            if (JSON.stringify(localWRs) !== JSON.stringify(mergedWRs)) {
                      updateUserData(uid, { withdrawRequests: mergedWRs });
            }
          }

      // 5. Đồng bộ Lịch sử Cược (Bets) — khắc phục mất dữ liệu cược khi đổi thiết bị
      const spBets = await spFetchUserBets(uid);
          if (spBets && Array.isArray(spBets) && spBets.length > 0) {
                  const curData = getUserData(uid);
                  const localBets = curData.bets || [];
                  const localMap = new Map(localBets.map((b) => [String(b.id || b.betId), b]));
                  const statusMap = { win: "SETTLED_WIN", loss: "SETTLED_LOSE", pending: "PENDING", cancelled: "CANCELLED" };

            spBets.forEach((rb) => {
                      const rid = String(rb.id);
                      const existing = localMap.get(rid);
                      const remoteIsPending = rb.status === "pending";
                      const localIsUnsettled = !existing || existing.status === "PENDING" || existing.status === "pending";

                                   if (!existing) {
                                               // Cược chưa từng thấy trên thiết bị này (được đặt/quyết toán ở thiết bị khác)
                        const base = rb.details && typeof rb.details === "object" ? rb.details : {};
                                               localMap.set(rid, {
                                                             ...base,
                                                             id: rid,
                                                             betId: rid,
                                                             gameId: rb.game_type,
                                                             amount: Number(rb.amount),
                                                             status: statusMap[rb.status] || base.status || "PENDING",
                                                             result: rb.status === "win" ? "win" : rb.status === "loss" ? "loss" : base.result,
                                                             winAmount: Number(rb.payout) || 0,
                                               });
                                   } else if (localIsUnsettled && !remoteIsPending) {
                                               // Thiết bị khác đã quyết toán cược này rồi -> nhận trạng thái đó, không tự tính lại (tránh cộng tiền 2 lần)
                        localMap.set(rid, {
                                      ...existing,
                                      status: statusMap[rb.status] || existing.status,
                                      result: rb.status === "win" ? "win" : "loss",
                                      winAmount: Number(rb.payout) || 0,
                        });
                                   }
            });

            const mergedBets = Array.from(localMap.values()).sort(
                      (a, b) => new Date(a.created_date || a.timestamp || 0) - new Date(b.created_date || b.timestamp || 0)
                    );

            if (JSON.stringify(localBets) !== JSON.stringify(mergedBets)) {
                      updateUserData(uid, { bets: mergedBets });
            }
          }
    } catch (e) {
          console.warn("Cross-device sync info:", e?.message);
    }
};
// React hook tiện lợi cho component với Realtime Supabase Sync
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

                  // 1. Initial full account state sync from Supabase DB
                  if (isSupabaseConfigured() && uid && uid !== "guest_user") {
                          syncFullAccountState(uid);
                  }

                  // 2. In-memory pub/sub
                  const unsub = subscribeUserData((notifiedUid) => {
                          if (!uid || notifiedUid === uid) refresh();
                  });

                  // 3. Realtime FORCE_BALANCE_SYNC event handler
                  const handleForceSync = (e) => {
                          if (!e.detail?.userId || e.detail.userId === uid) {
                                    refresh();
                          }
                  };
          window.addEventListener("FORCE_BALANCE_SYNC", handleForceSync);
          window.addEventListener("user-data-changed", handleForceSync);

                  // 4. Cross-tab localStorage synchronization
                  const handleStorage = (e) => {
                          if (!e.key || e.key === key(uid)) {
                                    refresh();
                          }
                  };
          window.addEventListener("storage", handleStorage);

                  // 5. Sync on window focus
                  const handleFocus = () => {
                          refresh();
                          if (isSupabaseConfigured() && uid && uid !== "guest_user") {
                                    syncFullAccountState(uid);
                          }
                  };
          window.addEventListener("focus", handleFocus);

                  // 6. Supabase Realtime User Profile Listener (Instant push across devices)
                  let unsubRealtime = () => {};
          if (isSupabaseConfigured() && uid && uid !== "guest_user") {
                  unsubRealtime = spSubscribeUserProfile(uid, (spProfile) => {
                            if (spProfile) {
                                        if (typeof spProfile.balance === "number") {
                                                      updateUserData(uid, { balance: spProfile.balance });
                                        }
                                        if (spProfile.locked) {
                                                      window.dispatchEvent(new Event("local-users-changed"));
                                        }
                            }
                  });
          }

                  // 7. Interval background sync (every 2.5 seconds)
                  const timer = setInterval(() => {
                          refresh();
                          if (isSupabaseConfigured() && uid && uid !== "guest_user") {
                                    syncFullAccountState(uid);
                          }
                  }, 2500);

                  return () => {
                          unsub();
                          unsubRealtime();
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
