// Game index + draw generators for the "Giải Thưởng" (Results & Live Draws) section.

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, w = 2) => String(n).padStart(w, "0");

export const GAMES = [
  { gameId: "may-man-28", title: "May mắn 28", type: "lucky28" },
  { gameId: "lucky28-nz", title: "New Zealand May Mắn 28", type: "lucky28" },
  { gameId: "lucky28-kr", title: "Hàn Quốc May Mắn 28", type: "lucky28" },
  { gameId: "xoso-tw", title: "Thời Gian Đài Loan", type: "xoso" },
  { gameId: "xoso-kr", title: "Thời Gian Hàn Quốc", type: "xoso" },
  { gameId: "xoso-nz", title: "Thời Gian New Zealand", type: "xoso" },
  { gameId: "pk10-tw", title: "Đài Loan PK10", type: "pk10" },
  { gameId: "pk10-kr", title: "Hàn Quốc PK10", type: "pk10" },
  { gameId: "pk10-vn", title: "Việt Nam PK10", type: "pk10" },
];

export function getGame(gameId) {
  return GAMES.find((g) => g.gameId === gameId);
}

export function makePeriod(offsetMin = 0, seq = 0) {
  const d = new Date(Date.now() - offsetMin * 60000);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(seq, 3)}`;
}

export function generateDraw(type) {
  if (type === "lucky28") {
    const nums = [rnd(0, 9), rnd(0, 9), rnd(0, 9)];
    const sum = nums.reduce((a, b) => a + b, 0);
    return { numbers: nums, sum, big: sum >= 14, odd: sum % 2 === 1 };
  }
  if (type === "pk10") {
    const nums = Array.from({ length: 10 }, () => rnd(0, 9));
    const sum = nums.reduce((a, b) => a + b, 0);
    return { numbers: nums, sum, big: sum >= 45, odd: sum % 2 === 1 };
  }
  // xoso
  const special = String(rnd(0, 99999)).padStart(5, "0");
  const lastDigit = Number(special.slice(-1));
  return { numbers: [special], isXoso: true, special, lastDigit, big: lastDigit >= 5, odd: lastDigit % 2 === 1 };
}

export function generateHistory(type, n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    period: makePeriod(n - i),
    ...generateDraw(type),
    time: Date.now() - (n - i) * 60000,
  }));
}