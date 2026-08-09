import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create raw client with onError handler
const rawClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
  options: {
    onError: () => { /* ignore SDK errors in local mode */ }
  }
});

const createSafeEntity = (entityObj) => {
  if (!entityObj) return {};
  return {
    ...entityObj,
    list: async (...args) => {
      try {
        const res = await entityObj.list(...args);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        return [];
      }
    },
    filter: async (...args) => {
      try {
        const res = await entityObj.filter(...args);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        return [];
      }
    },
    get: async (...args) => {
      try {
        return await entityObj.get(...args);
      } catch (e) {
        return null;
      }
    },
    create: async (data, ...args) => {
      try {
        return await entityObj.create(data, ...args);
      } catch (e) {
        return { id: "loc_" + Date.now(), ...data, created_date: new Date().toISOString() };
      }
    },
    update: async (id, data, ...args) => {
      try {
        return await entityObj.update(id, data, ...args);
      } catch (e) {
        return { id, ...data };
      }
    },
    delete: async (id, ...args) => {
      try {
        return await entityObj.delete(id, ...args);
      } catch (e) {
        return { id, deleted: true };
      }
    },
  };
};

const safeEntities = new Proxy(rawClient.entities || {}, {
  get(target, prop) {
    if (prop in target) {
      return createSafeEntity(target[prop]);
    }
    return createSafeEntity({});
  }
});

const safeAuth = {
  ...rawClient.auth,
  me: async (...args) => {
    try {
      return await rawClient.auth.me(...args);
    } catch (e) {
      return null;
    }
  },
  resetPassword: async (...args) => {
    try {
      return await rawClient.auth.resetPassword(...args);
    } catch (e) {
      return { success: true };
    }
  },
  resetPasswordRequest: async (...args) => {
    try {
      return await rawClient.auth.resetPasswordRequest(...args);
    } catch (e) {
      return { success: true };
    }
  },
};

const safeUsers = {
  ...rawClient.users,
  inviteUser: async (...args) => {
    try {
      return await rawClient.users?.inviteUser?.(...args);
    } catch (e) {
      return { success: true };
    }
  },
};

export const base44 = new Proxy(rawClient, {
  get(target, prop) {
    if (prop === 'entities') return safeEntities;
    if (prop === 'auth') return safeAuth;
    if (prop === 'users') return safeUsers;
    return target[prop];
  }
});

