import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download } from "lucide-react";
import { Panel, TableWrap, Th, Td, Empty, Badge, inputCls } from "../ui";

const TIERS = ["Sơ cấp", "Trung cấp", "Cao cấp", "Siêu cấp"];

export default function Bets() {
  const [bets, setBets] = useState([]);
  const [halls, setHalls] = useState([]);
  const [fHall, setFHall] = useState("all");
  const [fTier, setFTier] = useState("all");
  const [fRes, setFRes] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    base44.entities.Bet.list().then(setBets).catch(() => {});
    base44.entities.GameHall.list().then(setHalls).catch(() => {});
  }, []);

  const rows = useMemo(() => bets.filter((b) => {
    if (fHall !== "all" && b.hallName !== fHall) return false;
    if (fTier !== "all" && b.tier !== fTier) return false;
    if (fRes !== "all" && b.result !== fRes) return false;
    if (from && new Date(b.created_date) < new Date(from)) return false;
    if (to && new Date(b.created_date) > new Date(to + "T23:59")) return false;
    return true;
  }), [bets, fHall, fTier, fRes, from, to]);

  const csv = () => {
    const head = ["User", "Hall", "Tier", "Amount", "Result", "Period", "Time"];
    const lines = rows.map((b) => [b.userEmail, b.hallName, b.tier, b.amount, b.result, b.period, new Date(b.created_date).toLocaleString("vi-VN")].join(","));
    const blob = new Blob([head.join(",") + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "bets.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Lịch Sử Đặt Cược</h1>
        <button onClick={csv} className="ml-auto h-9 px-3 rounded-lg bg-gradient-to-r from-[#ffab40] to-[#e67e22] text-white text-sm font-medium flex items-center gap-1.5"><Download size={16} /> Xuất CSV</button>
      </div>

      <Panel className="p-3">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <select className={inputCls} value={fHall} onChange={(e) => setFHall(e.target.value)}><option value="all" className="bg-[#161936]">Tất cả sảnh</option>{halls.map((h) => <option key={h.id} value={h.name} className="bg-[#161936]">{h.name}</option>)}</select>
          <select className={inputCls} value={fTier} onChange={(e) => setFTier(e.target.value)}><option value="all" className="bg-[#161936]">Tất cả cấp</option>{TIERS.map((t) => <option key={t} value={t} className="bg-[#161936]">{t}</option>)}</select>
          <select className={inputCls} value={fRes} onChange={(e) => setFRes(e.target.value)}><option value="all" className="bg-[#161936]">Tất cả kết quả</option><option value="win" className="bg-[#161936]">Thắng</option><option value="loss" className="bg-[#161936]">Thua</option><option value="pending" className="bg-[#161936]">Chờ</option></select>
          <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <TableWrap>
          <thead className="bg-white/[0.03]"><tr><Th>Người dùng</Th><Th>Sảnh</Th><Th>Cấp</Th><Th>Số tiền</Th><Th>Kết quả</Th><Th>Kỳ</Th><Th>Thời gian</Th></tr></thead>
          <tbody>
            {rows.length === 0 ? <Empty colSpan={7} /> : rows.map((b) => (
              <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <Td>{b.userEmail}</Td>
                <Td>{b.hallName}</Td>
                <Td><Badge tone="purple">{b.tier}</Badge></Td>
                <Td>${b.amount} <span className="text-white/40 text-[11px]">USD</span></Td>
                <Td><Badge tone={b.result === "win" ? "green" : b.result === "loss" ? "red" : "amber"}>{b.result === "win" ? "Thắng" : b.result === "loss" ? "Thua" : "Chờ"}</Badge></Td>
                <Td className="text-white/50 text-[12px]">{b.period}</Td>
                <Td className="text-white/50 text-[12px]">{new Date(b.created_date).toLocaleString("vi-VN")}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>
    </div>
  );
}