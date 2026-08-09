// Mock data + helpers for the "Của Tôi" (Profile) page.

export const MIN_TURNOVER = 1000;

export const seedBets = () => [
  { id: "B1001", gameId: "may-man-28", game: "Hàn Quốc may mắn 28", amount: 50, status: "pending", time: "09:20 05/08" },
  { id: "B1002", gameId: "pk10", game: "Đài Loan PK10", amount: 100, status: "paid", time: "09:05 05/08" },
  { id: "B1003", gameId: "xoso", game: "Thời gian Đài Loan", amount: 20, status: "draw", time: "08:40 05/08" },
  { id: "B1004", gameId: "pk10", game: "Hàn Quốc PK10", amount: 200, status: "pending", time: "08:10 05/08" },
  { id: "B1005", gameId: "may-man-28", game: "New Zealand may mắn 28", amount: 80, status: "paid", time: "07:50 05/08" },
];

export const seedTxs = () => [
  { txid: "TX20260805-001", type: "deposit", amount: 500, bank: "Vietcombank", status: "success", time: "08:00 05/08" },
  { txid: "TX20260805-002", type: "withdraw", amount: 200, bank: "Techcombank", status: "processing", time: "08:30 05/08" },
  { txid: "TX20260804-009", type: "withdraw", amount: 1000, bank: "ACB", status: "rejected", reason: "Chưa đủ số vòng cược", time: "21:10 04/08" },
  { txid: "TX20260804-005", type: "deposit", amount: 1000, bank: "USDT-TRC20", status: "success", time: "15:20 04/08" },
];

export const seedLinked = () => [
  { id: "L1", type: "bank", bankName: "Vietcombank", accountNumber: "0123456789", holder: "NGUYEN VAN A" },
  { id: "L2", type: "crypto", walletAddress: "TXYZ123abc456def789ghi012jkl345mno678", network: "USDT-TRC20" },
];

export const BET_STATUS = {
  pending: { label: "Đang chờ", cls: "bg-amber-500/20 text-amber-300" },
  PENDING: { label: "Đang chờ", cls: "bg-amber-500/20 text-amber-300" },
  paid: { label: "Đã thanh toán", cls: "bg-blue-500/20 text-blue-300" },
  PAID: { label: "Đã thanh toán", cls: "bg-blue-500/20 text-blue-300" },
  draw: { label: "Mở thưởng", cls: "bg-emerald-500/20 text-emerald-300" },
  DRAW: { label: "Mở thưởng", cls: "bg-emerald-500/20 text-emerald-300" },
  settled: { label: "Đã quyết toán", cls: "bg-emerald-500/20 text-emerald-300" },
  SETTLED: { label: "Đã quyết toán", cls: "bg-emerald-500/20 text-emerald-300" },
  won: { label: "Thắng", cls: "bg-emerald-500/20 text-emerald-300" },
  WON: { label: "Thắng", cls: "bg-emerald-500/20 text-emerald-300" },
  lost: { label: "Thua", cls: "bg-rose-500/20 text-rose-300" },
  LOST: { label: "Thua", cls: "bg-rose-500/20 text-rose-300" },
};

export const TX_STATUS = {
  processing: { label: "Đang xử lý", cls: "bg-amber-500/20 text-amber-300" },
  success: { label: "Thành công", cls: "bg-emerald-500/20 text-emerald-300" },
  completed: { label: "Thành công", cls: "bg-emerald-500/20 text-emerald-300" },
  rejected: { label: "Từ chối", cls: "bg-red-500/20 text-red-300" },
};