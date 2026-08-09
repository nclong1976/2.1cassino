import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { localRegister } from "@/lib/localAuth";
import { useI18n } from "@/lib/I18nContext";

function genCaptcha() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function FieldBox({ icon, children, ring = "#c2c2c5" }) {
  return (
    <div className="bg-figma-primary-2 rounded-[22px] shadow-[inset_0_0_0_1px_var(--ring)] min-h-[49px] w-full flex items-center px-6 gap-[19px]" style={{ "--ring": ring }}>
      <img src={icon} className="w-[19px] h-[21px] shrink-0 object-cover" alt="" />
      {children}
    </div>
  );
}

const inputCls = "bg-transparent outline-none w-full font-normal font-paragraph leading-figma-23 text-[#1A1A1A] placeholder:text-[#1A1A1A]/55";
const inputStyle = { fontSize: "16px" };

export default function Register() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { t } = useI18n();
  const returnTo = safeReturnTo();
  const [fullName, setFullName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [payPw, setPayPw] = useState("");
  const [captcha, setCaptcha] = useState(genCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const u = account.trim();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast({ title: "Lỗi", description: "Vui lòng nhập họ tên (tối thiểu 2 ký tự)", variant: "destructive" });
      return;
    }
    if (!/^[A-Za-z0-9]{6,20}$/.test(u)) {
      toast({ title: "Lỗi", description: "Tên tài khoản 6–20 chữ cái và số", variant: "destructive" });
      return;
    }
    if (password.length < 6 || password.length > 20) {
      toast({ title: "Lỗi", description: "Mật khẩu 6–20 ký tự", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Lỗi", description: "Mật khẩu nhập lại không khớp", variant: "destructive" });
      return;
    }
    if (!/^\d{6}$/.test(payPw)) {
      toast({ title: "Lỗi", description: "Mật khẩu thanh toán phải đúng 6 số", variant: "destructive" });
      return;
    }
    if (captchaInput !== captcha) {
      toast({ title: "Lỗi", description: "Mã xác nhận không đúng", variant: "destructive" });
      return;
    }
    if (!agree) {
      toast({ title: "Lỗi", description: "Vui lòng đồng ý điều khoản", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const user = localRegister({ account: u, password, payPassword: payPw, fullName: fullName.trim() });
      setSession(user);
      toast.success(t("register_success"), "Tài khoản đã được tạo");
      // Tự đăng nhập sau đăng ký: chuyển về returnTo (mặc định /) để hỗ trợ luồng OAuth consent.
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast({ title: "Đăng ký thất bại", description: err.message || "Không thể tạo tài khoản", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md w-full mx-auto relative min-h-[100dvh] bg-figma-secondary-3 overflow-x-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute top-[45px] left-0 w-full h-[calc(100%-45px)] z-0">
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/4dd80120b_4b3ce3200_e7964c8e120626ed10fcc400a30d3bca65fddbd8.png"
          className="w-full h-full object-cover object-center"
          alt="" />
      </div>

      {/* Header */}
      <header className="relative h-11 flex items-center justify-center shrink-0 z-20">
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/c8398988f_476d19250_89c06e399be2b327fba9d232c9325ab941eaf9a2.png"
          className="absolute inset-0 w-full h-full object-cover object-center"
          alt="" />
        <button onClick={() => navigate("/login")} className="absolute left-[17px] w-[13px] h-[23px] flex items-center justify-center">
          <img
            src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/a369ab5a3_dce4b8d7e_827248fb5b533feaf5912946198e5f84b9136df9.png"
            className="w-full h-full object-cover object-center"
            alt="Back" />
        </button>
        <h1 className="text-figma-20 font-normal font-paragraph leading-figma-26 text-figma-text-10-6 relative z-10">
        {t("register_title")}
        </h1>
      </header>

      {/* Scrollable Content Area */}
      <div className="relative z-10 flex-1 flex flex-col w-full">

        {/* Tabs */}
        <div className="relative w-full mt-[clamp(16px,9.3vw,41px)] pl-[clamp(17px,25.2vw,111px)] flex">
          <div className="flex flex-col relative z-10 cursor-pointer" onClick={() => {}}>
            <span className="font-normal font-paragraph leading-figma-24 text-figma-text-2-6 text-xl">{t("register_title")}</span>
            <img
              src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/615d43741_8da15f2a9_164477a7c08cbfec61798d2849f83c251c9f0096.png"
              className="absolute -bottom-[29px] left-[4px] w-[85px] h-0.5 object-cover"
              alt="" />
          </div>
          <div className="flex flex-col ml-[9px] relative z-10 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/login")}>
            <span className="font-normal font-paragraph leading-figma-23 text-[#cbced4] text-xl">{t("login_title")}</span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={submit} className="flex flex-col px-[clamp(16px,7.5vw,33px)] mt-[clamp(20px,18vw,79px)] w-full">
          {/* Họ tên */}
          <div className="flex flex-col mb-[18px]">
            <FieldBox icon="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/0275c983d_f1d7826e6_1289de38208ea60c36c32778edfbdb4094cfc6d9.png">
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nhập họ tên" autoComplete="name" style={inputStyle} className={inputCls} />
            </FieldBox>
            <p className="text-figma-15 font-normal font-paragraph leading-figma-22 text-[#71717a] mt-[11px] pl-[19px]">
              Họ tên hiển thị để phân biệt người dùng
            </p>
          </div>

          {/* Username */}
          <div className="flex flex-col mb-[18px]">
            <FieldBox icon="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/bd0d05615_19ec634e4_10dd3f879bc68fcba43205803eb74f624a7771d6.png">
              <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Nhập tên tài khoản" autoComplete="username" style={inputStyle} className={inputCls} />
            </FieldBox>
            <p className="text-figma-15 font-normal font-paragraph leading-figma-22 text-[#71717a] mt-[11px] pl-[19px]">
              Vui lòng nhập 6~20 chữ cái, số hoặc tổ hợp
            </p>
          </div>

          {/* Password */}
          <div className="flex flex-col mb-[19px]">
            <FieldBox ring="#ababaf" icon="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/f0fa59815_8be341e11_d264746a50a0e82bd6a52a16eb98210a250e9a58.png">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" autoComplete="new-password" style={inputStyle} className={inputCls} />
            </FieldBox>
            <p className="text-figma-15 font-normal font-paragraph leading-figma-22 text-[#716f79] mt-[10px] pl-[19px]">
              Vui lòng nhập tổ hợp chữ cái và số từ 6 đến 20 chữ
            </p>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col mb-[20px]">
            <FieldBox ring="#ababaf" icon="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/a4f709b6d_52e2c5c5f_3a7042d0ce17dbf03d1843c797050c8ca5dce172.png">
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Vui lòng nhập lại mật khẩu" autoComplete="new-password" style={inputStyle} className={inputCls} />
            </FieldBox>
            <p className="text-figma-15 font-normal font-paragraph leading-figma-22 text-figma-text-1-6 mt-[11px] pl-[19px]">
              Vui lòng nhập tổ hợp chữ cái và số từ 6 đến 20 chữ
            </p>
          </div>

          {/* Payment Password */}
          <div className="flex flex-col mb-[20px]">
            <FieldBox ring="#adadb1" icon="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/296a3d6e5_bca9ac3f0_82409f63f89088c5588f898d6f179068f4fb603e.png">
              <input type="password" value={payPw} onChange={(e) => setPayPw(e.target.value)} placeholder="Đặt mật khẩu thanh toán" maxLength={6} inputMode="numeric" autoComplete="off" className={inputCls} />
            </FieldBox>
            <p className="text-figma-15 font-normal font-paragraph leading-figma-22 text-figma-text-1-6 mt-[10px] pl-[19px]">
              Mật khẩu thanh toán là 6 chữ số
            </p>
          </div>

          {/* CAPTCHA */}
          <div className="flex flex-col mb-[clamp(16px,9.8vw,43px)]">
            <div className="bg-figma-primary-2 rounded-[22px] shadow-[inset_0_0_0_1px_#b3b3b6] min-h-[49px] w-full flex items-center px-6 justify-between">
              <div className="flex items-center gap-[19px] overflow-clip flex-1">
                <img src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/4de2b698f_e80098454_2e25d5e0b55110b470b3fd40e10d1bb0a63bff43.png" className="w-[19px] h-[21px] shrink-0 object-cover" alt="" />
                <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Vui lòng nhập CAPTCHA" maxLength={4} className={`${inputCls} flex-1`} />
              </div>
              <button type="button" onClick={() => setCaptcha(genCaptcha())} title="Đổi mã" className="flex items-center gap-1 shrink-0 ml-2 select-none">
                {captcha.split("").map((d, i) => (
                  <span key={i} className="text-[15px] font-bold" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 9}deg)`, color: `hsl(${i * 47} 45% 35%)`, fontFamily: "monospace" }}>{d}</span>
                ))}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-[5px] pl-[1px] cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-[17px] h-[17px] mt-1 shrink-0 accent-[#fd4441]" />
            <p className="text-figma-15 font-normal font-paragraph leading-figma-23 text-[#625e67]">
              Tôi trên 18 tuổi và đồng ý chấp nhận{" "}
              <span className="font-figma-hanken-grotesk leading-figma-21 text-[#154eaa]">Điều khoản</span>{" "}
              <span className="leading-figma-21 text-[#164ea7]">đăng ký</span>
            </p>
          </label>

          {/* Submit */}
          <div className="mt-[clamp(16px,10.7vw,47px)] flex flex-col w-full">
            <div className="bg-figma-accent-3 w-full h-px mb-[21px]" />
            <button type="submit" disabled={loading} className="bg-figma-muted-2 rounded-[3px] shadow-[inset_0_0_0_1px_#d74747] w-full min-h-[48px] h-12 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] active:opacity-100 disabled:opacity-70">
              <span className="text-figma-18 font-normal font-paragraph leading-figma-24 text-figma-text-3-6">
                {loading ? t("processing") : t("register_btn")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}