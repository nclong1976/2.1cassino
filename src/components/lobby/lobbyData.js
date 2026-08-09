// Tier config + category labels for the "Sảnh Chơi" (Game Lobby) page.

export const TIERS = [
  {
    id: "so-cap",
    label: "Sơ cấp",
    gradient: "linear-gradient(90deg,#0D2040,#1A4068)",
    glow: "#1A4068",
    minBalance: 100,
    chips: [10, 50, 100],
  },
  {
    id: "trung-cap",
    label: "Trung cấp",
    gradient: "linear-gradient(90deg,#241242,#4A207B)",
    glow: "#4A207B",
    minBalance: 1000,
    chips: [50, 200, 500],
  },
  {
    id: "cao-cap",
    label: "Cao cấp",
    gradient: "linear-gradient(90deg,#400D1A,#7A1B32)",
    glow: "#7A1B32",
    minBalance: 5000,
    chips: [200, 1000, 2000],
  },
  {
    id: "phong-vip",
    label: "Phòng VIP",
    gradient: "linear-gradient(90deg,#4A3500,#FFD700)",
    glow: "#FFD700",
    minBalance: 20000,
    chips: [1000, 5000, 10000],
  },
];

export const getTier = (id) => TIERS.find((t) => t.id === id);

// Pick the highest tier the user can afford, or fall back to the lowest.
export const resolveInitialTier = (balance) => {
  const affordable = TIERS.filter((t) => balance >= t.minBalance);
  return affordable.length ? affordable[affordable.length - 1].id : TIERS[0].id;
};

export const CAT_LABELS = {
  all: "Tất Cả",
  lucky28: "May Mắn 28",
  xoso: "Xổ Số",
  pk10: "PK10",
};

export const LOBBY_CATEGORIES = [
  { key: "all" },
  { key: "lucky28" },
  { key: "xoso" },
  { key: "pk10" },
];