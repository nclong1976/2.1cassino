import React, { useEffect, useMemo, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Send, Search } from "lucide-react";
import { Panel, inputCls } from "../ui";
import { Image as Img } from "@/components/ui/image";
import { getChatMessages, getConversations, addChatMessage, subscribeChat } from "@/lib/localChat";
import { localListUsers } from "@/lib/localAuth";

export default function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");
  const fileRef = useRef(null);
  const endRef = useRef(null);

  const load = () => {
    setMessages(getChatMessages());
    setUsers(localListUsers());
  };

  useEffect(() => {
    load();
    const unsub = subscribeChat(load);
    return () => unsub && unsub();
  }, []);

  const conversations = useMemo(() => getConversations(), [messages]);

  const filteredUsers = useMemo(
    () => users.filter((u) => !q || (u.full_name || u.email || u.account || "").toLowerCase().includes(q.toLowerCase())),
    [users, q]
  );

  const thread = useMemo(
    () => messages.filter((m) => m.userId === activeUser?.id).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages, activeUser]
  );

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread.length, activeUser]);

  const send = () => {
    if (!activeUser || !text.trim()) return;
    addChatMessage({
      userId: activeUser.id,
      userEmail: activeUser.email,
      userName: activeUser.full_name || activeUser.account,
      senderRole: "admin",
      body: text.trim(),
    });
    setText("");
  };

  const sendImage = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !activeUser) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      addChatMessage({
        userId: activeUser.id,
        userEmail: activeUser.email,
        userName: activeUser.full_name || activeUser.account,
        senderRole: "admin",
        image: reader.result,
      });
      setUploading(false);
    };
    reader.onerror = () => { setUploading(false); toast({ title: "Lỗi gửi ảnh", variant: "destructive" }); };
    reader.readAsDataURL(f);
  };

  const ADMIN_QUICK_TEMPLATES = [
    {
      label: "🎁 Khuyến Mãi MBS Tri Án",
      text: `Xin chào! 👋\n\nTrân trọng gửi đến bạn chương trình "KHUYẾN MÃI TRI ÁN ĐẶC BIỆT" từ Marina Bay Sands MBS!\n⏰ Thời gian áp dụng: 01/08/2026 - 31/08/2026\n\n🎁 NỘI DUNG KHUYẾN MÃI:\n• Nạp 3,000$ -> Nhận ngay 288$\n• Nạp 5,000$ -> Nhận ngay 388$\n• Nạp 10,000$ -> Nhận ngay 888$\n• Nạp 50,000$ -> Nhận ngay 3,888$\n• Nạp 100,000$ -> Nhận ngay 8,888$\n• Nạp đến 10,000,000$ -> Thưởng tối đa 588,888$\n\n💡 VÍ DỤ: Bạn đã nạp 3,000$ và nhận 288$. Sau đó nạp thêm 7,000$ đạt mốc 10,000$, bạn sẽ nhận tổng cộng: 288$ + 388$ + 588$ = 888$!\n\n⚠️ Lưu ý: Nếu bạn đã nhận thưởng và rút tiền, bạn sẽ không thể tiếp tục tham gia chương trình tích lũy này.`
    },
    {
      label: "👋 Lời Chào CSKH",
      text: "Xin chào quý khách! CSKH 24/7 hân hạnh được phục vụ bạn. Bạn cần hỗ trợ về Nạp/Rút tiền hay thắc mắc dịch vụ nào ạ?"
    },
    {
      label: "💳 Hướng Dẫn Nạp",
      text: "Để nạp tiền nhanh chóng, quý khách vui lòng vào mục Nạp Tiền -> Chọn Ngân hàng/Crypto USDT -> Chuyển khoản theo mã QR và nội dung chỉ định. Tiền sẽ vào tài khoản tự động trong 1-3 phút!"
    },
    {
      label: "💸 Hướng Dẫn Rút",
      text: "Để rút tiền, bạn vào mục Rút Tiền -> Điền số tiền & thông tin Ngân hàng chính chủ -> Bấm Xác nhận. Admin sẽ xét duyệt đơn rút tiền của bạn trong ít phút."
    }
  ];

  const sendQuickTemplate = (templateText) => {
    if (!activeUser) return;
    addChatMessage({
      userId: activeUser.id,
      userEmail: activeUser.email,
      userName: activeUser.full_name || activeUser.account,
      senderRole: "admin",
      body: templateText,
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Quản Lý Tin Nhắn / Hỗ Trợ Client</h1>
      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100dvh-180px)] min-h-[420px]">
        <Panel className="lg:col-span-1 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input className={`${inputCls} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm người dùng…" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 && <p className="px-3 pt-2 pb-1 text-[10px] uppercase text-white/40">Cuộc hội thoại</p>}
            {conversations.map((c) => (
              <button key={c.userId} onClick={() => setActiveUser({ id: c.userId, email: c.userEmail, full_name: c.userName })} className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 ${activeUser?.id === c.userId ? "bg-white/10" : ""}`}>
                <p className="text-sm text-white truncate">{c.userName || c.userEmail}</p>
                <p className="text-[11px] text-white/45 truncate">{c.lastBody}</p>
              </button>
            ))}
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase text-white/40">Tất cả người dùng</p>
            {filteredUsers.map((u) => (
              <button key={u.id} onClick={() => setActiveUser(u)} className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 ${activeUser?.id === u.id ? "bg-white/10" : ""}`}>
                <p className="text-sm text-white truncate">{u.full_name || u.account}</p>
                <p className="text-[11px] text-white/45 truncate">{u.email}</p>
              </button>
            ))}
            {filteredUsers.length === 0 && conversations.length === 0 && (
              <p className="px-3 py-4 text-xs text-white/40">Chưa có người dùng nào.</p>
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-2 overflow-hidden flex flex-col">
          {activeUser ? (
            <>
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white">{activeUser.full_name || activeUser.email}</p>
                <p className="text-[11px] text-white/45">{activeUser.email}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {thread.length === 0 && <p className="text-center text-white/40 text-sm py-8">Chưa có tin nhắn. Hãy gửi lời chào!</p>}
                {thread.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.senderRole === "admin" ? "bg-gradient-to-br from-[#7033ff] to-[#4b00ff] text-white" : "bg-white/10 text-white"}`}>
                       {m.image ? <Img src={m.image} alt="" fittingType="fit" className="rounded-xl w-full max-w-[280px] sm:max-w-[340px] max-h-[350px] object-cover" /> : <div className="whitespace-pre-wrap leading-relaxed">{m.body || ""}</div>}
                    </div>
                  </div>
                ))}
                {uploading && <p className="text-center text-xs text-white/50">Đang gửi ảnh...</p>}
                <div ref={endRef} />
              </div>
              {/* Quick Template Chips for Admin */}
              <div className="px-3 py-2 bg-white/5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-medium text-[#ffab40] shrink-0">Mẫu Nhanh:</span>
                {ADMIN_QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendQuickTemplate(tmpl.text)}
                    className="shrink-0 text-xs bg-white/10 hover:bg-[#ffab40] text-white/90 hover:text-black font-medium px-2.5 py-1 rounded-md border border-white/10 transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 px-3 py-3 border-t border-white/10">
                <button onClick={() => fileRef.current?.click()} disabled={uploading} className="p-2 text-[#ffab40] disabled:opacity-50"><ImageIcon className="w-5 h-5" /></button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={sendImage} />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Nhập tin nhắn (Shift+Enter để xuống dòng)..."
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#ffab40] focus:ring-1 focus:ring-[#ffab40] rounded-xl text-sm px-3 py-2 resize-none max-h-24 min-h-[38px]"
                />
                <button onClick={send} className="h-9 px-3 rounded-lg bg-gradient-to-r from-[#ffab40] to-[#e67e22] text-white flex items-center gap-1 text-sm shrink-0"><Send size={16} /></button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">Chọn một người dùng để bắt đầu trò chuyện</div>
          )}
        </Panel>
      </div>
    </div>
  );
}