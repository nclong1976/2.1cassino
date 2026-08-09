import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import * as notif from "@/lib/localNotifications";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState(() => notif.getNotifications(userId));

  const refreshNotifs = useCallback(() => {
    if (!userId) return;
    const latest = notif.getNotifications(userId);
    setNotifications((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(latest)) {
        return latest;
      }
      return prev;
    });
  }, [userId]);

  useEffect(() => {
    refreshNotifs();
    if (!userId) return;

    const unsub = notif.subscribe(userId, () => refreshNotifs());

    const onCustomEvent = (e) => {
      if (!e.detail?.userId || e.detail.userId === userId) {
        refreshNotifs();
      }
    };
    const onStorage = (e) => {
      if (!e.key || e.key === `stargame_notif_${userId}`) refreshNotifs();
    };

    window.addEventListener("stargame_notif_update", onCustomEvent);
    window.addEventListener("storage", onStorage);

    const timer = setInterval(() => {
      refreshNotifs();
    }, 1000);

    return () => {
      unsub();
      window.removeEventListener("stargame_notif_update", onCustomEvent);
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }, [userId, refreshNotifs]);

  const push = useCallback((n) => (userId ? notif.pushNotification(userId, n) : null), [userId]);
  const markAllRead = useCallback(() => userId && notif.markAllRead(userId), [userId]);
  const markRead = useCallback((id) => userId && notif.markRead(userId, id), [userId]);
  const remove = useCallback((id) => userId && notif.removeNotification(userId, id), [userId]);
  const clear = useCallback(() => userId && notif.clearAll(userId), [userId]);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unread, push, markAllRead, markRead, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) return { notifications: [], unread: 0, push: () => {}, markAllRead: () => {}, markRead: () => {}, remove: () => {}, clear: () => {} };
  return ctx;
}