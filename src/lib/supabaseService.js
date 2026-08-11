import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Register user in Supabase CSDL (users_profile table)
 */
export const spRegisterUser = async ({ account, password, payPassword, fullName }) => {
  if (!isSupabaseConfigured()) return null;

  const acc = (account || '').trim().toLowerCase();
  const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const role = acc === 'admin' || acc === 'admin1' || acc.startsWith('admin') ? 'admin' : 'user';

  // Check if account exists
  const { data: existing } = await supabase
    .from('users_profile')
    .select('id')
    .eq('account', acc)
    .maybeSingle();

  if (existing) {
    throw new Error('Tài khoản đã tồn tại trên cơ sở dữ liệu Supabase');
  }

  const newUser = {
    id,
    account: acc,
    email: `${acc}@app.internal`,
    full_name: fullName || acc,
    password_hash: password,
    pay_password: payPassword,
    role,
    balance: 0,
    locked: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('users_profile')
    .insert([newUser])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Lỗi khi đăng ký tài khoản trên Supabase');
  }

  return data;
};

/**
 * Login user via Supabase CSDL
 */
export const spLoginUser = async ({ account, password }) => {
  if (!isSupabaseConfigured()) return null;

  const acc = (account || '').trim().toLowerCase();

  const { data: user, error } = await supabase
    .from('users_profile')
    .select('*')
    .eq('account', acc)
    .maybeSingle();

  if (error || !user) {
    throw new Error('Tài khoản không tồn tại trên Supabase');
  }

  if (user.password_hash !== password) {
    throw new Error('Mật khẩu không chính xác');
  }

  if (user.locked) {
    throw new Error('Tài khoản đã bị tạm khóa bởi QTV');
  }

  return user;
};

/**
 * Fetch all users profile for Admin
 */
export const spListUsers = async () => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('users_profile')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return null;
  return data;
};

/**
 * Fetch single user profile by ID or Account
 */
export const spGetUserProfile = async (userIdOrAccount) => {
  if (!isSupabaseConfigured() || !userIdOrAccount) return null;

  const { data, error } = await supabase
    .from('users_profile')
    .select('*')
    .or(`id.eq.${userIdOrAccount},account.eq.${userIdOrAccount}`)
    .maybeSingle();

  if (error) return null;
  return data;
};

/**
 * Update User Balance & Record Audit Transaction in Supabase
 */
export const spAdjustBalance = async (userId, newBalance, txData = null) => {
  if (!isSupabaseConfigured()) return null;

  const { data: user, error: uErr } = await supabase
    .from('users_profile')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (uErr) {
    console.error('Supabase balance update error:', uErr);
  }

  if (txData) {
    await supabase.from('transactions').insert([
      {
        id: txData.id || 'TX_' + Date.now().toString(36),
        user_id: userId,
        type: txData.type || 'ADMIN_ADJUST',
        amount: txData.amount,
        status: txData.status || 'completed',
        method: txData.method || 'System',
        reason: txData.reason || '',
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return user;
};

/**
 * Update user details in Supabase
 */
export const spUpdateUser = async (userId, patch) => {
  if (!isSupabaseConfigured()) return null;

  const updateData = { updated_at: new Date().toISOString() };
  if (patch.password) updateData.password_hash = patch.password;
  if (patch.payPassword) updateData.pay_password = patch.payPassword;
  if (patch.full_name !== undefined) updateData.full_name = patch.full_name;
  if (patch.email !== undefined) updateData.email = patch.email;
  if (patch.phone !== undefined) updateData.phone = patch.phone;
  if (patch.locked !== undefined) updateData.locked = patch.locked;
  if (patch.adminNote !== undefined) updateData.admin_note = patch.adminNote;
  if (patch.balance !== undefined) updateData.balance = patch.balance;
  if (patch.bankInfo !== undefined) updateData.bank_info = patch.bankInfo;

  const { data, error } = await supabase
    .from('users_profile')
    .update(updateData)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Supabase update user error:', error);
  }
  return data;
};

/**
 * Realtime Chat Support
 */
export const spFetchChatMessages = async (limit = 50) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data ? data.reverse() : [];
};

export const spSendChatMessage = async (msg) => {
  if (!isSupabaseConfigured()) return null;

  const newMsg = {
    id: msg.id || 'msg_' + Date.now().toString(36),
    user_id: msg.userId || 'guest',
    username: msg.username || msg.sender || 'Khách',
    message: msg.text || msg.message || '',
    avatar: msg.avatar || '',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('chat_messages')
    .insert([newMsg])
    .select()
    .single();

  if (error) {
    console.error('Supabase send chat error:', error);
  }
  return data;
};

export const spSubscribeChat = (onNewMessage) => {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel('public:chat_messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (payload) => {
        if (payload.new) {
          onNewMessage(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Banners Support
 */
export const spFetchBanners = async () => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) return null;
  return data;
};

/**
 * Realtime User Profile Subscription
 */
export const spSubscribeUserProfile = (userId, onProfileChange) => {
  if (!isSupabaseConfigured() || !supabase || !userId) return () => {};

  const channel = supabase
    .channel(`public:users_profile:${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users_profile' },
      (payload) => {
        if (payload.new && (payload.new.id === userId || payload.new.account === userId)) {
          onProfileChange(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Transactions Sync
 */
export const spFetchUserTransactions = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return null;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return null;
  return data;
};

/**
 * Withdraw Requests Sync
 */
export const spFetchUserWithdrawRequests = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return null;

  const { data, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return null;
  return data;
};

export const spCreateWithdrawRequest = async (req) => {
  if (!isSupabaseConfigured() || !req) return null;

  const newReq = {
    id: req.id || 'WR_' + Date.now().toString(36),
    user_id: req.userId,
    account: req.account || '',
    full_name: req.fullName || '',
    amount: req.amount,
    bank_info: req.bankInfo || {},
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('withdraw_requests')
    .insert([newReq])
    .select()
    .single();

  if (error) {
    console.error('Supabase create withdraw request error:', error);
  }
  return data;
};
