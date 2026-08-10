// Hệ thống auth cục bộ dùng localStorage — không gọi Base44 API.
// Lưu danh sách tài khoản + phiên hiện tại trực tiếp trong trình duyệt.

import { getUserData, saveUserData, updateUserData, defaultUserData } from "@/lib/userData";
import { base44 } from "@/api/base44Client";
import { spRegisterUser, spLoginUser, spAdjustBalance, spUpdateUser } from "@/lib/supabaseService";
import { isSupabaseConfigured } from "@/lib/supabase";

const USERS_KEY = "local_users";
const SESSION_KEY = "user";

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    try { window.dispatchEvent(new Event("local-users-changed")); } catch { /* ignore */ }
  } catch {
    /* ignore */
  }
};

// Seed tài khoản admin mặc định (admin / 121212) nếu chưa tồn tại.
const ensureSeedAdmin = () => {
  const users = readUsers();
  const hasAdmin = users.some((u) => u.account.toLowerCase() === "admin");
  if (!hasAdmin) {
    const admin = buildUser("admin", {
      password: "121212",
      payPassword: "121212",
      fullName: "Quản trị viên",
    });
    users.push(admin);
    writeUsers(users);
  }
};

const genId = () =>
  "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Quyết định role: tài khoản bắt đầu bằng "admin" → admin, còn lại user.
const roleFor = (account) => {
  const a = (account || "").trim().toLowerCase();
  return a === "admin" || a === "admin1" || a.startsWith("admin") ? "admin" : "user";
};

const buildUser = (account, extra = {}) => ({
  id: genId(),
  email: `${account.toLowerCase()}@app.internal`,
  full_name: extra.fullName || account,
  account: account.toLowerCase(),
  role: roleFor(account),
  created_date: new Date().toISOString(),
  ...extra,
});

const setSessionUser = (user) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  return user;
};

// Đăng ký tài khoản mới. Trả về user và tự lưu phiên.
export const localRegister = ({ account, password, payPassword, fullName }) => {
  const acc = (account || "").trim();
  const users = readUsers();
  if (users.some((u) => u.account.toLowerCase() === acc.toLowerCase())) {
    throw new Error("Tài khoản đã tồn tại");
  }
  const user = buildUser(acc, { password, payPassword, fullName, role: "user" });
  users.push(user);
  writeUsers(users);
  // Khởi tạo dữ liệu cá nhân ở trạng thái sạch (clean slate).
  saveUserData(user.id, defaultUserData());

  if (isSupabaseConfigured()) {
    spRegisterUser({ account: acc, password, payPassword, fullName }).catch((e) => {
      console.warn("Supabase register sync info:", e?.message);
    });
  }

  return setSessionUser(stripSecret(user));
};

// Danh sách tài khoản mặc định của hệ thống (luôn khả dụng kể cả khi chưa có trong localStorage).
const DEFAULT_ACCOUNTS = [
  { account: "admin", password: "121212", payPassword: "121212", fullName: "Quản trị viên" },
  { account: "admin1", password: "228386", payPassword: "228386", fullName: "Quản trị viên" },
];

const findDefault = (acc) =>
  DEFAULT_ACCOUNTS.find((d) => d.account.toLowerCase() === acc.toLowerCase());

// Đăng nhập bằng tài khoản + mật khẩu. Trả về user và tự lưu phiên.
// Tìm kiếm không phân biệt hoa/thường, ở cả localStorage lẫn danh sách mặc định.
export const localLogin = ({ account, password }) => {
  ensureSeedAdmin();
  const acc = (account || "").trim();
  const users = readUsers();
  const found = users.find((u) => u.account.toLowerCase() === acc.toLowerCase());
  const def = findDefault(acc);

  if (!found && !def) {
    throw new Error("Tài khoản không tồn tại");
  }
  if (found && found.password !== password) {
    throw new Error("Mật khẩu không chính xác");
  }
  if (!found && def && def.password !== password) {
    throw new Error("Mật khẩu không chính xác");
  }

  const base = found || buildUser(def.account, {
    password: def.password,
    payPassword: def.payPassword,
    fullName: def.fullName,
  });

  if (isSupabaseConfigured()) {
    spLoginUser({ account: acc, password }).catch((e) => {
      console.warn("Supabase login sync info:", e?.message);
    });
  }

  return setSessionUser(stripSecret(base));
};

// Bỏ trường mật khẩu khi trả ra phiên.
const stripSecret = (u) => {
  const { password, payPassword, ...rest } = u;
  return rest;
};

// Đọc phiên hiện tại từ localStorage (dùng lúc khởi động app).
export const localCurrentSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Xoá phiên hiện tại.
export const localClearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

// Danh sách người dùng cục bộ (bỏ mật khẩu) — dùng cho admin quản lý.
export const localListUsers = () => {
  return readUsers().map((u) => {
    const { password, payPassword, ...rest } = u;
    return rest;
  });
};

// Xác minh mật khẩu rút tiền (payPassword) cho user hiện tại.
export const verifyPayPassword = (userId, pin) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      // Thử tài khoản default
      const session = localCurrentSession();
      const def = DEFAULT_ACCOUNTS.find((d) => d.account.toLowerCase() === session?.account?.toLowerCase());
      if (def) return def.payPassword === pin;
      return false;
    }
    return user.payPassword === pin;
  } catch {
    return false;
  }
};

// Cập nhật mật khẩu rút tiền.
export const updatePayPassword = (userId, newPin) => {
  try {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    users[idx].payPassword = newPin;
    writeUsers(users);
    return true;
  } catch {
    return false;
  }
};

// Cập nhật mật khẩu đăng nhập.
export const updatePassword = (userId, currentPw, newPw) => {
  try {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId || u.account === userId);
    if (idx === -1) return { ok: false, msg: "Không tìm thấy tài khoản" };
    if (users[idx].password !== currentPw) return { ok: false, msg: "Mật khẩu hiện tại không đúng" };
    users[idx].password = newPw;
    writeUsers(users);
    return { ok: true };
  } catch {
    return { ok: false, msg: "Lỗi hệ thống" };
  }
};

// --- CÁC HÀM QUẢN TRỊ ADMIN CHO LOCAL AUTH ---

// Cập nhật thông tin tài khoản bởi Admin
export const adminUpdateUser = (userId, patch) => {
  try {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId || u.account === userId);
    if (idx === -1) {
      // Nếu chưa có trong local, build và thêm mới
      const newUser = buildUser(userId, patch);
      users.push(newUser);
      writeUsers(users);
      return newUser;
    }

    const current = users[idx];
    if (patch.password) {
      current.password = patch.password;
    }
    if (patch.full_name !== undefined) current.full_name = patch.full_name;
    if (patch.email !== undefined) current.email = patch.email;
    if (patch.phone !== undefined) current.phone = patch.phone;
    if (patch.locked !== undefined) current.locked = patch.locked;
    if (patch.adminNote !== undefined) current.adminNote = patch.adminNote;
    if (patch.balance !== undefined) current.balance = patch.balance;

    // Cập nhật ngân hàng nếu có
    if (patch.bankName || patch.bankAccount || patch.bankHolder) {
      current.bankInfo = {
        bankName: patch.bankName || current.bankInfo?.bankName || "",
        accountNumber: patch.bankAccount || current.bankInfo?.accountNumber || "",
        holder: patch.bankHolder || current.bankInfo?.holder || "",
      };

      // Cập nhật vào userData.linked
      try {
        const uData = getUserData(userId);
        let linked = uData.linked || [];
        // Lọc bỏ bank cũ nếu sửa
        linked = linked.filter((l) => l.type !== "bank");
        if (patch.bankName && patch.bankAccount) {
          linked.unshift({
            id: "bank_" + Date.now(),
            type: "bank",
            bankName: patch.bankName,
            accountNumber: patch.bankAccount,
            holder: patch.bankHolder || current.full_name || "",
          });
        }
        updateUserData(userId, { linked });
      } catch { /* ignore */ }
    }

    users[idx] = current;
    writeUsers(users);

    // Đồng bộ session nếu user đang đăng nhập
    const currentSession = localCurrentSession();
    if (currentSession && (currentSession.id === userId || currentSession.account === current.account)) {
      if (patch.locked) {
        localClearSession();
      } else {
        setSessionUser({ ...currentSession, ...stripSecret(current) });
      }
    }

    return stripSecret(current);
  } catch (e) {
    throw new Error(e.message || "Không thể cập nhật người dùng");
  }
};

// Điều chỉnh số dư bởi Admin kèm lý do & tạo lịch sử giao dịch
export const adminAdjustBalance = (userId, amountInput, reasonInput = "", mode = "add") => {
  try {
    const amount = Number(amountInput);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
    }

    const cleanReason = String(reasonInput).trim();
    if (!cleanReason) {
      throw new Error("Vui lòng nhập lý do điều chỉnh số dư");
    }

    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId || u.account === userId);

    let rawBal = 0;
    if (idx !== -1) {
      rawBal = users[idx].balance || 0;
    }

    const uData = getUserData(userId);
    if (uData.balance !== undefined) {
      rawBal = uData.balance;
    }

    // 1. Làm sạch chuỗi số dư hiện tại của người dùng trước khi tính
    const currentBalance = parseFloat(String(rawBal).replace(/[^0-9.-]+/g, "")) || 0;

    // 2. Tính toán số dư mới
    const isAdd = mode === "add";
    let newBalance = isAdd
      ? currentBalance + amount
      : Math.max(0, currentBalance - amount);
    newBalance = +newBalance.toFixed(2);

    // Cập nhật trong local_users
    if (idx !== -1) {
      users[idx].balance = newBalance;
      writeUsers(users);
    } else {
      // Nếu user chưa có trong local_users, tự tạo mới bản ghi với đầy đủ thông tin chuẩn
      const newUser = buildUser(userId, {
        balance: newBalance,
      });
      users.push(newUser);
      writeUsers(users);
    }

    // Đồng bộ session nếu là tài khoản đang đăng nhập hiện tại
    const currentSession = localCurrentSession();
    if (currentSession && (currentSession.id === userId || currentSession.account === userId || currentSession.email === userId)) {
      setSessionUser({ ...currentSession, balance: newBalance });
    }

    // 3. Tự động chèn 1 bản ghi lịch sử giao dịch (Transaction Audit Log)
    const txType = isAdd ? "ADMIN_DEPOSIT" : "ADMIN_WITHDRAW";
    const auditReason = `[Admin Adjustment] ${cleanReason}`;
    const newTx = {
      id: "TX_ADM_" + Date.now().toString(36),
      type: txType,
      amount: amount,
      status: "completed",
      method: "Hệ thống Admin",
      reason: auditReason,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("vi-VN"),
      created_date: new Date().toISOString(),
    };

    updateUserData(userId, (prev) => ({
      ...prev,
      balance: newBalance,
      txs: [newTx, ...(prev.txs || [])],
    }));

    // Cố gắng đồng bộ lên CSDL Supabase
    if (isSupabaseConfigured()) {
      spAdjustBalance(userId, newBalance, {
        id: newTx.id,
        type: txType,
        amount: amount,
        status: "completed",
        method: "Hệ thống Admin",
        reason: auditReason,
      }).catch(() => {});
    }

    // Cố gắng đồng bộ lên CSDL Base44 nếu tài khoản tồn tại
    try {
      base44.entities.User.update(userId, { balance: newBalance }).catch(() => {});
    } catch {
      /* ignore base44 sync error */
    }

    return {
      newBalance,
      currentBalance,
      amount,
      isAdd,
      txType,
      reason: cleanReason,
    };
  } catch (e) {
    throw new Error(e.message || "Lỗi điều chỉnh số dư");
  }
};

// Khóa hoặc mở khóa người dùng
export const adminToggleLock = (userId, lockedState) => {
  return adminUpdateUser(userId, { locked: lockedState });
};

// Xóa người dùng
export const adminDeleteUser = (userId) => {
  try {
    let users = readUsers();
    users = users.filter((u) => u.id !== userId && u.account !== userId && u.email !== userId);
    writeUsers(users);

    const currentSession = localCurrentSession();
    if (currentSession && (currentSession.id === userId || currentSession.email === userId)) {
      localClearSession();
    }
    return true;
  } catch (e) {
    throw new Error(e.message || "Lỗi xóa người dùng");
  }
};
