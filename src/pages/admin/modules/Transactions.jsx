import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, RefreshCw } from "lucide-react";
import { Panel, TableWrap, Th, Td, Empty, Badge, inputCls, ConfirmDialog } from "../ui";
import { localListUsers } from "@/lib/localAuth";
import { getUserData, updateUserData } from "@/lib/userData";
import { pushNotification } from "@/lib/localNotifications";

const STATUS = ["pending", "processing", "completed", "rejected"];

export default function Transactions() {
  const { toast } = useToast();
  const [txs, setTxs] = useState([]);
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [confirm, setConfirm] = useState(null);

  // Load cả Base44 API lẫn localStorage per-user withdrawRequests
  const load = async () => {
    let apiList = [];
    try {
      apiList = await base44.entities.Transaction.list("-created_date");
    } catch {
      apiList = [];
    }

    // Đọc tất cả đơn rút từ localStorage người dùng
    const localRequests = [];
    const users = localListUsers();
    users.forEach((u) => {
      const uData = getUserData(u.id);
      if (uData.withdrawRequests) {
        uData.withdrawRequests.forEach((req) => {
          localRequests.push({
            id: req.id,
            userEmail: u.account || u.email,
            userId: u.id,
            type: "withdraw",
            amount: req.amount,
            method: req.bank ? `${req.bank.bankName} (${req.bank.accountNumber})` : "Ngân hàng",
            status: req.status === "approved" ? "completed" : req.status,
            created_date: req.createdAt || new Date().toISOString(),
            rawReq: req,
          });
        });
      }
    });

    // Trộn và gộp danh sách
    const merged = [...localRequests, ...apiList];
    setTxs(merged);
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => txs.filter((t) => {
    if (fStatus !== "all" && t.status !== fStatus) return false;
    if (fType !== "all" && t.type !== fType) return false;
    return true;
  }), [txs, fStatus, fType]);

  const decide = async () => {
    if (!confirm) return;
    const { tx, status } = confirm;

    try {
      // 1. Cập nhật nếu là Base44 transaction
      if (tx.id && !tx.userId) {
        await base44.entities.Transaction.update(tx.id, { status });
      }

      // 2. Cập nhật nếu là local user withdraw request
      if (tx.userId) {
        updateUserData(tx.userId, (d) => {
          const updatedReqs = (d.withdrawRequests || []).map((r) => {
            if (r.id === tx.id) {
              return { ...r, status: status === "completed" ? "approved" : "rejected" };
            }
            return r;
          });

          // Khi người dùng gửi đơn rút, tiền đã bị trừ tạm thời.
          // Nếu Admin duyệt -> giữ nguyên bị trừ. Nếu Admin từ chối -> hoàn lại tiền vào ví người dùng (+tx.amount)!
          let nextBalance = d.balance;
          if (status === "rejected") {
            nextBalance = +(d.balance + tx.amount).toFixed(2);
          }

          return {
            ...d,
            balance: nextBalance,
            withdrawRequests: updatedReqs,
            txs: d.txs.map((t) => (t.txid === tx.id ? { ...t, status: status === "completed" ? "completed" : "rejected" } : t)),
          };
        });

        // Thông báo cho người dùng
        pushNotification(tx.userId, {
          type: "balance",
          title: status === "completed" ? "Đơn rút tiền đã được duyệt!" : "Đơn rút tiền bị từ chối",
          body: status === "completed"
            ? `Admin đã duyệt đơn rút $${tx.amount.toLocaleString()} USD. Tiền sẽ về tài khoản ngân hàng trong ít phút.`
            : `Đơn rút $${tx.amount.toLocaleString()} USD bị từ chối. Vui lòng liên hệ hỗ trợ để biết chi tiết.`,
        });
      }

      toast({
        title: status === "completed" ? "Đã duyệt đơn rút tiền" : "Đã từ chối đơn rút tiền",
        variant: status === "completed" ? "success" : "destructive",
      });
      setConfirm(null);
      load();
    } catch {
      toast({ title: "Có lỗi xảy ra", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Quản Lý Giao Dịch & Đơn Rút Tiền</h1>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Tải lại
        </button>
      </div>

      <Panel className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select className={inputCls} value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="all" className="bg-[#161936]">Tất cả loại</option>
            <option value="deposit" className="bg-[#161936]">Nạp</option>
            <option value="withdraw" className="bg-[#161936]">Rút</option>
          </select>
          <select className={inputCls} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="all" className="bg-[#161936]">Tất cả trạng thái</option>
            {STATUS.map((s) => <option key={s} value={s} className="bg-[#161936]">{s}</option>)}
          </select>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <TableWrap>
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Người dùng</Th>
              <Th>Loại</Th>
              <Th>Số tiền</Th>
              <Th>Ngân hàng / Phương thức</Th>
              <Th>Trạng thái</Th>
              <Th>Thời gian</Th>
              <Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <Empty colSpan={7} />
            ) : (
              rows.map((t) => (
                <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <Td className="font-semibold text-white">{t.userEmail}</Td>
                  <Td><Badge tone={t.type === "deposit" ? "green" : "amber"}>{t.type === "deposit" ? "Nạp" : "Rút"}</Badge></Td>
                  <Td className="font-bold text-[#bd9c59]">${t.amount?.toLocaleString()} USD</Td>
                  <Td className="text-white/70">{t.method}</Td>
                  <Td>
                    <Badge tone={t.status === "completed" ? "green" : t.status === "rejected" ? "red" : t.status === "processing" ? "blue" : "amber"}>
                      {t.status === "pending" ? "Đang chờ duyệt" : t.status === "completed" ? "Đã duyệt" : t.status === "rejected" ? "Từ chối" : t.status}
                    </Badge>
                  </Td>
                  <Td className="text-white/50 text-[12px]">{new Date(t.created_date).toLocaleString("vi-VN")}</Td>
                  <Td>
                    {t.status === "pending" && t.type === "withdraw" ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                          onClick={() => setConfirm({ tx: t, status: "completed" })}
                          title="Duyệt đơn rút tiền"
                        >
                          <Check size={14} /> Duyệt
                        </button>
                        <button
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                          onClick={() => setConfirm({ tx: t, status: "rejected" })}
                          title="Từ chối đơn rút"
                        >
                          <X size={14} /> Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Panel>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.status === "completed" ? "Duyệt đơn rút tiền" : "Từ chối đơn rút tiền"}
        desc={`${confirm?.tx?.userEmail} · $${confirm?.tx?.amount?.toLocaleString()} USD · ${confirm?.tx?.method}`}
        confirmText={confirm?.status === "completed" ? "Chấp nhận duyệt" : "Từ chối"}
        tone={confirm?.status === "completed" ? "primary" : "danger"}
        onConfirm={decide}
      />
    </div>
  );
}