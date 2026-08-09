import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Send, Headphones, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";
import { getChatMessages, addChatMessage, subscribeChat } from "@/lib/localChat";
import { playChatMessageSound } from "@/lib/soundEffects";

const QUICK_REPLIES = [
  "🎁 Khuyến mãi Tri Án MBS 2026",
  "💳 Nạp tiền ngân hàng / QR",
  "💸 Hướng dẫn rút tiền",
  "❓ Báo lỗi trò chơi",
];

export default function SupportChat({ open, onOpenChange }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);

  const loadAndCheckGreeting = () => {
    if (!user) return;
    const allMsgs = getChatMessages();
    let mine = allMsgs
      .filter((m) => m.userId === user.id)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    // Check if an admin greeting already exists for this user thread
    const hasAdminGreeting = mine.some((m) => m.senderRole === "admin");

    if (!hasAdminGreeting) {
      const userName = user.full_name || user.account || user.email?.split("@")[0] || "Quý khách";
      const greetingText = `Xin chào ${userName}! 👋\nCảm ơn bạn đã liên hệ bộ phận Hỗ Trợ Khách Hàng 24/7.\n\nChúng tôi có thể giúp gì cho bạn hôm nay? Nếu bạn cần Nạp / Rút tiền hoặc hỗ trợ kỹ thuật, vui lòng gửi tin nhắn hoặc hình ảnh đính kèm tại đây. Chuyên viên CSKH sẽ phản hồi ngay lập tức!`;

      addChatMessage({
        userId: user.id,
        userEmail: user.email,
        userName: "Admin CSKH",
        senderRole: "admin",
        body: greetingText,
        isGreeting: true,
      });

      // Reload updated messages
      mine = getChatMessages()
        .filter((m) => m.userId === user.id)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    }

    setMessages(mine);
  };

  useEffect(() => {
    if (open && user) {
      loadAndCheckGreeting();
    } else if (user) {
      const mine = getChatMessages()
        .filter((m) => m.userId === user.id)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setMessages(mine);
    }
    const unsub = subscribeChat(() => {
      if (!user) return;
      const mine = getChatMessages()
        .filter((m) => m.userId === user.id)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setMessages(mine);
    });
    return () => unsub && unsub();
  }, [user, open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, open]);

  const sendText = (overrideText) => {
    const msgToSend = typeof overrideText === "string" ? overrideText : text;
    if (!msgToSend.trim() || !user) return;

    addChatMessage({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name || user.account,
      senderRole: "user",
      body: msgToSend.trim(),
    });
    playChatMessageSound();
    if (typeof overrideText !== "string") {
      setText("");
    }

    // Auto-reply logic for quick reply chips if applicable
    if (msgToSend.includes("Khuyến mãi") || msgToSend.includes("Tri Án")) {
      setTimeout(() => {
        addChatMessage({
          userId: user.id,
          userEmail: user.email,
          userName: "Admin CSKH",
          senderRole: "admin",
          body: `TRÂN TRỌNG GỬI QUÝ KHÁCH CHƯƠNG TRÌNH KHUYẾN MÃI TRI ÁN ĐẶC BIỆT MARINA BAY SANDS MBS 👑\n\n⏰ Thời gian: 01/08/2026 - 31/08/2026\n\n💰 BẢNG PHẦN THƯỞNG TÍCH LŨY TIỀN NẠP:\n• Nạp 3,000$ ➔ Thưởng 288$\n• Nạp 5,000$ ➔ Thưởng 388$\n• Nạp 8,000$ ➔ Thưởng 588$\n• Nạp 10,000$ ➔ Thưởng 888$\n• Nạp 20,000$ ➔ Thưởng 1,888$\n• Nạp 50,000$ ➔ Thưởng 3,888$\n• Nạp 100,000$ ➔ Thưởng 8,888$\n• Nạp 500,000$ ➔ Thưởng 38,888$\n• Nạp 1,000,000$ ➔ Thưởng 88,888$\n• Nạp 10,000,000$ ➔ Thưởng 588,888$\n\n💡 Ví dụ: Khi bạn nạp 3,000$ nhận 288$. Sau đó nạp thêm 7,000$ đạt mốc 10,000$, tổng phần thưởng bạn nhận được là: 288$ + 388$ + 588$ = 888$!\n\n⚠️ Lưu ý: Nếu đã nhận thưởng và rút tiền, bạn sẽ không tiếp tục tích lũy mốc tiếp theo.`,
        });
      }, 600);
    } else if (msgToSend.includes("Nạp tiền")) {
      setTimeout(() => {
        addChatMessage({
          userId: user.id,
          userEmail: user.email,
          userName: "Admin CSKH",
          senderRole: "admin",
          body: `Dạ chào bạn, để Nạp tiền vào tài khoản (Mã UID: ${user.id}), bạn hãy gửi số tiền hoặc chuẩn bị bill chuyển khoản để CSKH hỗ trợ bạn duyệt nhanh nhất nhé!`,
        });
      }, 600);
    } else if (msgToSend.includes("rút tiền")) {
      setTimeout(() => {
        addChatMessage({
          userId: user.id,
          userEmail: user.email,
          userName: "Admin CSKH",
          senderRole: "admin",
          body: `Dạ chào bạn, bạn có thể gửi yêu cầu rút tiền trực tiếp tại mục "Rút Tiền" trên trang cá nhân. Đảm bảo tài khoản ngân hàng chính chủ để tiền về nhanh nhất ạ!`,
        });
      }, 600);
    } else if (msgToSend.includes("Báo lỗi")) {
      setTimeout(() => {
        addChatMessage({
          userId: user.id,
          userEmail: user.email,
          userName: "Admin CSKH",
          senderRole: "admin",
          body: `Dạ bạn vui lòng mô tả chi tiết sự cố hoặc gửi ảnh chụp màn hình (bấm nút chọn ảnh 📷 bên dưới) để kỹ thuật viên hỗ trợ kiểm tra ạ.`,
        });
      }, 600);
    }
  };

  const sendImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      addChatMessage({
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name || user.account,
        senderRole: "user",
        image: reader.result,
      });
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#181428] border-[#2f2748] text-white rounded-t-2xl p-0 h-[82vh] max-w-2xl mx-auto flex flex-col shadow-2xl">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-[#2f2748] bg-[#1d1830]/90 backdrop-blur-md flex flex-row items-center justify-between text-left rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#bd9c59] to-[#ebd39a] p-[2px] shadow-md">
                <div className="w-full h-full rounded-full bg-[#181428] flex items-center justify-center text-[#bd9c59]">
                  <Headphones className="w-5 h-5" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#181428] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <SheetTitle className="text-white text-sm font-bold tracking-wide">
                  Admin CSKH 24/7
                </SheetTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span className="bg-[#bd9c59]/20 text-[#ebd39a] text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#bd9c59]/40">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Hỗ Trợ Trực Tuyến · Đang hoạt động
              </p>
            </div>
          </div>
        </SheetHeader>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-[#bd9c59]/50" />
            <p className="text-sm text-white/70">Vui lòng đăng nhập để nhắn tin với bộ phận hỗ trợ CSKH.</p>
            <Button
              className="bg-gradient-to-r from-[#bd9c59] to-[#d4b574] text-[#1e1832] font-bold hover:opacity-90"
              onClick={() => { onOpenChange?.(false); }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-[#141022]">
              {messages.map((m) => {
                const isAdmin = m.senderRole === "admin";
                return (
                  <div key={m.id} className={`flex items-end gap-2 ${isAdmin ? "justify-start" : "justify-end"}`}>
                    {isAdmin && (
                      <div className="w-7 h-7 rounded-full bg-[#bd9c59]/20 border border-[#bd9c59]/40 flex items-center justify-center text-[#bd9c59] shrink-0 mb-1">
                        <Headphones className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm shadow-md ${
                      isAdmin
                        ? "bg-[#231b38] text-white/90 border border-[#372b54] rounded-bl-xs"
                        : "bg-gradient-to-r from-[#bd9c59] to-[#cba35d] text-[#181226] font-medium rounded-br-xs"
                    }`}>
                      {isAdmin && (
                        <div className="text-[11px] font-bold text-[#ebd39a] mb-1 flex items-center gap-1">
                          Admin CSKH <Sparkles className="w-3 h-3 text-[#bd9c59]" />
                        </div>
                      )}
                      {m.image ? (
                        <Image src={m.image} alt="chat attachment" fittingType="fit" className="rounded-xl w-full max-w-[280px] sm:max-w-[340px] max-h-[350px] object-cover" />
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
                      )}
                      <div className={`text-[10px] mt-1 text-right ${isAdmin ? "text-white/40" : "text-[#181226]/60 font-semibold"}`}>
                        {formatTime(m.created_date)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {uploading && (
                <div className="flex justify-end">
                  <div className="bg-[#bd9c59]/30 text-white/70 text-xs px-3 py-1.5 rounded-full animate-pulse">
                    Đang tải ảnh lên...
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Reply Chips */}
            <div className="px-3 py-2 bg-[#1b162c] border-t border-[#2a2242] flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-[#bd9c59] shrink-0 flex items-center gap-1">
                Gợi ý nhanh:
              </span>
              {QUICK_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendText(reply)}
                  className="shrink-0 text-xs bg-[#271f3f] hover:bg-[#bd9c59] text-white/90 hover:text-[#181226] font-medium px-2.5 py-1.5 rounded-full border border-[#3b2f5c] hover:border-[#bd9c59] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#181428] border-t border-[#2f2748]">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="p-2 text-[#bd9c59] hover:text-[#ebd39a] hover:bg-[#bd9c59]/10 rounded-full transition-colors disabled:opacity-50"
                title="Gửi ảnh đính kèm"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={sendImage} />

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
                rows={1}
                placeholder="Nhập tin nhắn hỗ trợ (Shift+Enter để xuống dòng)..."
                className="flex-1 bg-[#241c3b] border border-[#382b58] text-white placeholder:text-white/40 focus:border-[#bd9c59] focus:ring-1 focus:ring-[#bd9c59] rounded-xl text-sm px-3 py-2 resize-none max-h-24 min-h-[38px]"
              />

              <Button
                type="button"
                onClick={() => sendText()}
                size="icon"
                className="bg-gradient-to-r from-[#bd9c59] to-[#d4b574] text-[#181226] hover:opacity-90 rounded-xl shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
