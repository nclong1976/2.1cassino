import { useEffect } from 'react';
import { queryClientInstance } from './query-client';
import { getSocket } from './socket';
import { getGameConfigs } from './gameStore';
import { getUserData } from './userData';
import { getChatMessages } from './localChat';
import { getBannerConfig } from './bannerStore';

export const QUERY_KEYS = {
  gameConfigs: ['gameConfigs'],
  userData: (userId) => ['userData', userId || 'guest_user'],
  chatMessages: (userId) => ['chatMessages', userId || 'all'],
  banners: ['banners'],
  auditLogs: ['auditLogs'],
};

/**
 * Initializes real-time Socket.io listeners that automatically keep TanStack Query cache updated across the system.
 */
export const useSocketQuerySync = (userId, role) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Helper: Safely invalidate or update TanStack Query cache
    const updateCache = (queryKey, newDataOrFetcher) => {
      if (typeof newDataOrFetcher === 'function') {
        queryClientInstance.setQueryData(queryKey, newDataOrFetcher);
      } else if (newDataOrFetcher !== undefined) {
        queryClientInstance.setQueryData(queryKey, newDataOrFetcher);
      }
      queryClientInstance.invalidateQueries({ queryKey });
    };

    // 1. Game Configurations & Odds Sync
    const handleGameConfigsUpdated = (payload) => {
      console.log('🔄 [TanStack Query Sync] Updating gameConfigs cache from Socket');
      const latest = payload?.configs || getGameConfigs();
      updateCache(QUERY_KEYS.gameConfigs, latest);
    };

    // 2. User State, Balance & Bet Settlements Sync
    const handleUserStateUpdated = (payload) => {
      const targetUserId = payload?.userId || userId;
      console.log(`🔄 [TanStack Query Sync] Updating userData cache for ${targetUserId} from Socket`);
      const latest = payload?.data || getUserData(targetUserId);
      updateCache(QUERY_KEYS.userData(targetUserId), latest);
    };

    // 3. Customer Support Live Chat Sync
    const handleNewChatMessage = (payload) => {
      console.log('🔄 [TanStack Query Sync] Updating chatMessages cache from Socket');
      const targetUserId = payload?.userId || userId;
      const latest = getChatMessages(role);
      updateCache(QUERY_KEYS.chatMessages(targetUserId), latest);
    };

    // 4. System Banners Sync
    const handleBannerUpdated = (payload) => {
      console.log('🔄 [TanStack Query Sync] Updating banners cache from Socket');
      const latest = payload?.config || getBannerConfig();
      updateCache(QUERY_KEYS.banners, latest);
    };

    // 5. Admin Audit Log Sync
    const handleAuditLogged = () => {
      console.log('🔄 [TanStack Query Sync] Invalidating auditLogs cache from Socket');
      queryClientInstance.invalidateQueries({ queryKey: QUERY_KEYS.auditLogs });
    };

    // Bind Socket.io listeners
    socket.on('game:configs_updated', handleGameConfigsUpdated);
    socket.on('user:state_updated', handleUserStateUpdated);
    socket.on('chat:new_message', handleNewChatMessage);
    socket.on('banner:updated', handleBannerUpdated);
    socket.on('admin:audit_logged', handleAuditLogged);

    return () => {
      socket.off('game:configs_updated', handleGameConfigsUpdated);
      socket.off('user:state_updated', handleUserStateUpdated);
      socket.off('chat:new_message', handleNewChatMessage);
      socket.off('banner:updated', handleBannerUpdated);
      socket.off('admin:audit_logged', handleAuditLogged);
    };
  }, [userId, role]);
};
