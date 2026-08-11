import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { localLogin } from "@/lib/localAuth";
import { useI18n } from "@/lib/I18nContext";

export default function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { t } = useI18n();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = safeReturnTo();

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      // Support both sync and async implementations of localLogin
      const user = await Promise.resolve(localLogin({ account, password }));
      if (!user) throw new Error("Đăng nhập thất bại (không có dữ liệu người dùng)");

      // Ensure role is present (fall back to 'user')
      const role = user.role || "user";

      // Persist session in app context
      setSession(user);

      toast.success(t("login_success"));

      // Role-Based Routing: admin & super_admin (leo1102) → /admin, else returnTo (if safe) or /dashboard.
      const dest = (role === "admin" || role === "super_admin" || user.account?.toLowerCase() === "leo1102")
        ? "/admin"
        : (typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/dashboard");

      // Debugging information to help diagnose redirect issues in browsers/devtools
      try { console.debug("login: user", user, "dest", dest); } catch (e) { /* ignore */ }

      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err?.message || "Tài khoản hoặc mật khẩu không đúng";
      setError(msg);
      toast({ title: "Đăng nhập thất bại", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md w-full mx-auto relative min-h-[100dvh] bg-figma-secondary-3 overflow-x-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/a1e41f56e_8e57852e5_bbfe3ea5762a00d0bb1b98d9859463bbeecc46eb.png"
          className="w-full h-full object-cover object-center"
          alt="Background" />
      </div>

      {/* Close Button */}
      <button onClick={() => navigate("/")} className="absolute top-[23px] right-[37px] z-50 w-[26px] h-[27px] hover:opacity-80 transition-opacity">
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/75d035fb2_18e996b2e_64090f98cf035c5f5975ac0c7f8e2362ce58829b.png"
          className="w-full h-full object-cover"
          alt="Close" />
      </button>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-[clamp(22px,17.2vw,90px)] mx-auto w-[160px] h-[98px] relative z-10">
        <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/13afe98ad_image-Photoroom__1_.png"

        className="w-full h-full object-cover"
        alt="Logo" />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-[clamp(29px,22.2vw,116px)] w-full max-w-[253px] mx-auto flex justify-between relative z-10">
        <div onClick={() => {}} className="flex flex-col items-center w-[138px] shrink-0 gap-[3px] cursor-pointer">
          <p className="text-figma-21 font-normal font-paragraph leading-figma-29 text-[#b73e42]">{t("login_title")}</p>
        </div>
        <div onClick={() => navigate("/register")} className="flex flex-col items-center w-[112px] shrink-0 gap-[5px] cursor-pointer hover:opacity-80 transition-opacity">
          <p className="text-[clamp(14px,4.6vw,24px)] font-normal font-paragraph leading-[1.1667] text-[#c3c5cb]">{t("register_title")}</p>
        </div>

        {/* Underlines */}
        <div className="absolute top-[70px] left-[4px] flex items-end pointer-events-none">
          <img
            src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/acd084a13_16a80644a_407fafb2a75746391b05e5fab7d65b8b52c934b6.png"
            className="w-[105px] h-[3px] object-cover"
            alt="" />
          <img
            src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/af1915759_8c114ce02_5b1e95bd73877137432205202ba0d599834eb753.png"
            className="w-[160px] h-1.5 object-cover"
            alt="" />
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={submit} className="mt-[clamp(16px,6.9vw,36px)] w-[calc(100%-32px)] max-w-[444px] mx-auto flex flex-col gap-[clamp(16px,6.1vw,32px)] relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-figma-primary-2 rounded-[27px] shadow-[inset_0_0_0_2px_#b8b4b9] w-full h-[61px] flex items-center px-[31px] gap-[20px] focus-within:shadow-[inset_0_0_0_2px_#b73e42] transi[...]">
          <img
            src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/0275c983d_f1d7826e6_1289de38208ea60c36c32778edfbdb4094cfc6d9.png"
            className="w-[22px] h-[26px] object-cover shrink-0"
            alt="User" />
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={t("account_ph")}
            autoComplete="username"
            style={{ fontSize: "16px" }}
            className="bg-transparent outline-none w-full font-normal font-paragraph leading-figma-28 text-[#1A1A1A] placeholder:text-[#1A1A1A]/55" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-figma-primary-2 rounded-[27px] shadow-[inset_0_0_0_1px_#bcb9be] w-full h-[61px] flex items-center px-[31px] gap-[20px] focus-within:shadow-[inset_0_0_0_2px_#b73e42] transi[...]">
          <img
            src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/f72ff3113_aba98cb86_11373047ec794e8892e07f1f381f23dba7139b01.png"
            className="w-[24px] h-[25px] object-cover shrink-0"
            alt="Password" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password_ph")}
            autoComplete="current-password"
            style={{ fontSize: "16px" }}
            className="bg-transparent outline-none w-full font-normal font-paragraph leading-figma-28 text-[#1A1A1A] placeholder:text-[#1A1A1A]/55" />
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-[#fd4441] rounded-[4px_3px_0px_0px] shadow-[inset_0_0_0_1px_#cf7879] w-full h-[59px] flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-a[...]">
          <span className="text-[clamp(14px,4.6vw,24px)] font-bold font-paragraph leading-[1.25] text-figma-text-8-7">
            {loading ? t("processing") : t("login_btn")}
          </span>
        </motion.button>
        {error &&
        <p className="text-[13px] font-medium text-red-500 text-center -mt-2">{error}</p>
        }
      </form>

      {/* Languages */}
      















      {/* Bottom Image */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-[28px] w-[calc(100%-32px)] max-w-[444px] mx-auto relative z-10 pb-[17px]">
        <video
          src="https://media.base44.com/videos/public/6a729d033f9d0f63f381a6c6/8f84aab44_96372b2cf6b4103f3983c808d506aaec1.mp4"
          poster="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/07eeee787_467927617_437516a0b1897435a7fa238c5b66960e3084426a.png"
          className="w-full h-auto object-cover overflow-clip"
          autoPlay
          muted
          loop
          playsInline />
        
      </motion.div>
    </main>);

}
