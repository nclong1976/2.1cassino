import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/socketQuerySync';
import { getGameConfigs, updateGameConfig, saveGameConfigs } from '@/lib/gameStore';
import { getUserData, updateUserData } from '@/lib/userData';
import { getChatMessages, addChatMessage } from '@/lib/localChat';
import { getBannerConfig, saveBannerConfig } from '@/lib/bannerStore';
import { emitSocketEvent } from '@/lib/socket';

// ── 1. Game Configs Query Hook ─────────────────────────────
export function useGameConfigsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.gameConfigs,
    queryFn: () => getGameConfigs(),
    staleTime: Infinity, // Real-time updated via Socket.io
  });
}

export function useUpdateGameConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameId, patch, adminMeta }) => {
      const updated = updateGameConfig(gameId, patch, adminMeta);
      const allConfigs = getGameConfigs();
      emitSocketEvent('game:config_change', { gameId, configs: allConfigs });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameConfigs });
    },
  });
}

// ── 2. User Data Query Hook ───────────────────────────────
export function useUserDataQuery(userId) {
  return useQuery({
    queryKey: QUERY_KEYS.userData(userId),
    queryFn: () => getUserData(userId),
    staleTime: Infinity, // Real-time updated via Socket.io
    enabled: Boolean(userId),
  });
}

export function useUpdateUserDataMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, patch }) => {
      const updated = updateUserData(userId, patch);
      emitSocketEvent('user:balance_change', { userId, data: updated });
      return updated;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(QUERY_KEYS.userData(variables.userId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userData(variables.userId) });
    },
  });
}

// ── 3. Chat Messages Query Hook ───────────────────────────
export function useChatQuery(userId, viewerRole) {
  return useQuery({
    queryKey: QUERY_KEYS.chatMessages(userId),
    queryFn: () => getChatMessages(viewerRole),
    staleTime: Infinity, // Real-time updated via Socket.io
  });
}

export function useSendChatMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messagePayload) => {
      const msg = addChatMessage(messagePayload);
      emitSocketEvent('chat:send_message', msg);
      return msg;
    },
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chatMessages(msg.userId) });
    },
  });
}

// ── 4. Banners Query Hook ──────────────────────────────────
export function useBannersQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.banners,
    queryFn: () => getBannerConfig(),
    staleTime: Infinity, // Real-time updated via Socket.io
  });
}

export function useUpdateBannersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newConfig) => {
      const saved = saveBannerConfig(newConfig);
      emitSocketEvent('banner:change', { config: saved });
      return saved;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.banners, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.banners });
    },
  });
}
