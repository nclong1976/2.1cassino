import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useNotifications } from "@/lib/NotificationContext";
import { useAuth } from "@/lib/AuthContext";
import { useUserData } from "@/lib/userData";
import { handleDepositRequest } from "@/lib/depositHandler";
import NotificationBell from "@/components/NotificationBell";
import BottomNav from "@/components/BottomNav";
import ProfileCard from "@/components/profile/ProfileCard";
import QuickMenuCard from "@/components/profile/QuickMenuCard";
import ActionCards from "@/components/profile/ActionCards";
import LogoutButton from "@/components/profile/LogoutButton";
import SettingsModal from "@/components/profile/SettingsModal";
import BetHistoryModal from "@/components/profile/BetHistoryModal";
import TxHistoryModal from "@/components/profile/TxHistoryModal";
import LinkAccountModal from "@/components/profile/LinkAccountModal";
import SupportChat from "@/components/profile/SupportChat";
import WithdrawModal from "@/components/profile/WithdrawModal";
import DepositModal from "@/components/profile/DepositModal";
import { notifyAdmins } from "@/lib/localNotifications";
import { MIN_TURNOVER } from "@/components/profile/profileData";
import { Sparkles } from "lucide-react";

export default function ContainerAug4CodiaStudio2() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { push } = useNotifications();
  const { user } = useAuth();
  const { data, update } = useUserData(user?.id);

  const handleDeposit = () => {
    handleDepositRequest({
      user,
      navigate,
      toast,
      openChat: () => setOpenChat(true),
    });
  };

  const [hidden, setHidden] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openBet, setOpenBet] = useState(false);
  const [txMode, setTxMode] = useState(null);
  const [openLink, setOpenLink] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [openDeposit, setOpenDeposit] = useState(false);

  const balance = data.balance;
  const profit = data.profit;
  const bets = data.bets;
  const txs = data.txs;
  const linked = data.linked;
  const turnover = data.turnover;

  const handleClaimReward = () => {
    const rewardAmt = 50;
    update((d) => ({
      ...d,
      balance: +(d.balance + rewardAmt).toFixed(2),
      txs: [{
        txid: "RW" + Date.now(),
        type: "reward",
        amount: rewardAmt,
        method: "Nhiệm vụ điểm danh",
        status: "completed",
        time: new Date().toLocaleString("vi-VN"),
      }, ...d.txs],
    }));
    toast.success("Nhận Thưởng Thành Công", `Bạn đã nhận +$${rewardAmt} USD thưởng điểm danh!`);
    push({ type: "balance", title: "Nhận Thưởng Thành Công", body: `+$${rewardAmt} USD phần thưởng điểm danh` });
  };

  const copyId = async () => {
    const id = user?.id ? user.id.slice(-6) : "000000";
    try {
      await navigator.clipboard.writeText(id);
      toast({ title: "Đã sao chép ID", description: id });
    } catch {
      toast({ title: "Không thể sao chép ID", variant: "destructive" });
    }
  };

  const addLinked = (acct) => {
    update((d) => ({ ...d, linked: [acct, ...d.linked] }));
    toast({ title: "Liên kết tài khoản thành công" });
  };

  const submitWithdraw = ({ amount, bank, pin, requestId, request }) => {
    if (amount > balance) return toast({ title: "Số dư không đủ", variant: "destructive" });
    if (turnover < MIN_TURNOVER) return toast({ title: "Chưa đủ số vòng cược tối thiểu", variant: "destructive" });

    const newReq = request || {
      id: requestId || "WD" + Date.now(),
      amount,
      bank,
      status: "pending",
      time: new Date().toLocaleString("vi-VN"),
    };

    update((d) => ({
      ...d,
      balance: +(d.balance - amount).toFixed(2),
      withdrawRequests: [newReq, ...(d.withdrawRequests || [])],
      txs: [{
        txid: newReq.id,
        type: "withdraw",
        amount,
        bank: bank?.bankName,
        status: "processing",
        time: new Date().toLocaleString("vi-VN"),
      }, ...d.txs],
    }));
    toast({ title: "Gửi yêu cầu rút tiền thành công", description: `$${amount} USD · ${bank?.bankName}` });
    push({ type: "balance", title: "Yêu cầu rút tiền đã gửi", body: `$${amount} USD · Đang chờ admin duyệt` });
  };

  // Nạp tiền thành công: cộng dư, ghi giao dịch, toast xanh + thông báo cho người dùng và admin.
  const submitDeposit = ({ amount, method }) => {
    update((d) => ({
      ...d,
      balance: +(d.balance + amount).toFixed(2),
      txs: [{
        txid: "DP" + Date.now(),
        type: "deposit",
        amount,
        method: method === "crypto" ? "USDT" : "Ngân hàng",
        status: "completed",
        time: new Date().toLocaleString("vi-VN"),
      }, ...d.txs],
    }));
    toast({ title: "Nạp tiền thành công", description: `+$${amount} USD`, variant: "success" });
    push({ type: "balance", title: "Nạp tiền thành công", body: `+$${amount} USD · ${method === "crypto" ? "USDT" : "Ngân hàng"}` });
    notifyAdmins({
      type: "admin",
      title: "Yêu cầu nạp tiền thành công",
      body: `${user?.account || "Người dùng"} vừa nạp +$${amount} USD (${method === "crypto" ? "USDT" : "Ngân hàng"})`,
    });
  };

  return (
    <main className="max-w-md w-full mx-auto relative min-h-[100dvh] bg-[#0A0E1A] overflow-x-hidden" style={{ fontFamily: "Roboto, sans-serif" }}>
      <div className="relative w-full">
        <img
          src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/61e389800_9bfeffd96_07a3de8dd600878de86f2c73376a64fa24558e67.png"
          alt="background"
          className="w-full object-cover object-center absolute inset-0 h-full"
          style={{ zIndex: 0 }}
        />

        <div className="relative z-10 flex flex-col w-full pb-24">
          <div className="absolute top-2 right-2 z-30"><NotificationBell /></div>
          <ProfileCard
            user={user}
            balance={balance}
            profit={profit}
            hidden={hidden}
            onToggleHidden={() => setHidden((h) => !h)}
            onCopyId={copyId}
            onSettings={() => setOpenSettings(true)}
          />

          <QuickMenuCard
            onBetHistory={() => setOpenBet(true)}
            onTx={(mode) => setTxMode(mode)}
            onLink={() => setOpenLink(true)}
          />

          {bets.length === 0 && txs.length === 0 && (
            <div className="mx-4 mt-3 p-4 rounded-xl bg-[#1e1832]/80 border border-[#bd9c59]/40 text-center flex flex-col items-center shadow-lg">
              <Sparkles className="w-6 h-6 text-[#bd9c59] mb-1 animate-pulse" />
              <h4 className="text-white text-sm font-bold">Chào Mừng Thành Viên Mới!</h4>
              <p className="text-white/70 text-xs mt-1 leading-relaxed">Tài khoản vừa khởi tạo chưa có lịch sử đặt cược hay giao dịch. Nhấn <strong>"Nạp Tiền"</strong> để bắt đầu trải nghiệm ngay!</p>
            </div>
          )}

          <ActionCards
            onSupport={() => setOpenChat(true)}
            onDeposit={handleDeposit}
            onWithdraw={() => setOpenWithdraw(true)}
          />

          <LogoutButton />
        </div>

        <BottomNav />
      </div>

      <SettingsModal open={openSettings} onOpenChange={setOpenSettings} onToast={toast} />
      <BetHistoryModal open={openBet} onOpenChange={setOpenBet} bets={bets} />
      <TxHistoryModal open={!!txMode} onOpenChange={(v) => !v && setTxMode(null)} txs={txs} mode={txMode || "both"} />
      <LinkAccountModal open={openLink} onOpenChange={setOpenLink} onAdd={addLinked} linked={linked} />
      <SupportChat open={openChat} onOpenChange={setOpenChat} />
      <WithdrawModal
        open={openWithdraw}
        onOpenChange={setOpenWithdraw}
        balance={balance}
        minTurnover={MIN_TURNOVER}
        turnover={turnover}
        linked={linked}
        withdrawRequests={data.withdrawRequests || []}
        onSubmit={submitWithdraw}
      />
      <DepositModal open={openDeposit} onOpenChange={setOpenDeposit} onOpenChat={() => setOpenChat(true)} />
    </main>
  );
}