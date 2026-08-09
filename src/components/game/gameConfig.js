// Dynamic game configuration for the betting template.
// Each game defines its name, draw rules, betting tabs and grid (odds).

const genNumbers = (n, odds, start = 0) =>
  Array.from({ length: n }, (_, i) => {
    const val = String(start + i);
    return { key: `NUM_${val}`, label: val, odds };
  });

export const GAME_CONFIGS = {
  "may-man-28": {
    name: "Hàn Quốc may mắn 28",
    gameType: "lucky28",
    drawCount: 3,
    bigThreshold: 13,
    roundSeconds: 60,
    tabs: [
      {
        id: "tron",
        label: "Trôn",
        sections: [
          {
            columns: 2,
            items: [
              { key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" },
              { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" },
              { key: "LON_DON", label: "Đơn hàng lớn", odds: "3.98" }, { key: "LON_DOI", label: "Đôi lớn", odds: "3.98" },
              { key: "NHO_DON", label: "Danh sách nhỏ", odds: "3.98" }, { key: "NHO_DOI", label: "Đôi nhỏ", odds: "3.98" },
            ],
          },
          {
            columns: 3,
            items: [
              { key: "LON_EXTREME", label: "Cực Lớn", odds: "13" }, { key: "NHO_EXTREME", label: "Cực nhỏ", odds: "13" }, { key: "BAO", label: "Báo", odds: "60" },
              { key: "RED_WAVE", label: "Sóng đỏ", odds: "2.9" }, { key: "GREEN_WAVE", label: "Sóng xanh", odds: "2.9" }, { key: "BLUE_WAVE", label: "Sóng xanh dương", odds: "2.9" },
            ],
          },
        ],
      },
      { id: "ma-dac-biet", label: "Mã đặc biệt", sections: [{ columns: 2, items: genNumbers(10, "9.9") }] },
    ],
  },
  "pk10": {
    name: "Đài Loan PK10",
    gameType: "pk10",
    drawCount: 10,
    bigThreshold: 45,
    roundSeconds: 90,
    tabs: [
      {
        id: "champion",
        label: "Vô địch",
        sections: [
          { columns: 2, items: [{ key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }] },
          { columns: 5, items: genNumbers(10, "9.9") },
        ],
      },
      { id: "top3", label: "Top 3", sections: [{ columns: 5, items: genNumbers(10, "9.9") }] },
      { id: "sum", label: "Tổng điểm", sections: [{ columns: 2, items: [{ key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }] }] },
    ],
  },
  "xoso": {
    name: "Thời gian Đài Loan",
    gameType: "xoso",
    drawCount: 1,
    bigThreshold: 5,
    roundSeconds: 300,
    tabs: [
      {
        id: "dac-biet",
        label: "Đặc biệt",
        sections: [
          { columns: 2, items: [{ key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }, { key: "BAO_LO", label: "Bao lô", odds: "3.98" }] },
          { columns: 5, items: genNumbers(10, "9.9") },
        ],
      },
      { id: "nhat", label: "Giải nhất", sections: [{ columns: 2, items: [{ key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }] }] },
      { id: "nhi", label: "Giải nhì", sections: [{ columns: 2, items: [{ key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }] }] },
    ],
  },
  "casino": {
    name: "Casino",
    gameType: "casino",
    drawCount: 3,
    bigThreshold: 4,
    roundSeconds: 45,
    tabs: [
      { id: "baccarat", label: "Baccarat", sections: [{ columns: 3, items: [{ key: "PLAYER", label: "Player", odds: "1.98" }, { key: "BANKER", label: "Banker", odds: "1.98" }, { key: "TIE", label: "Tie", odds: "8" }, { key: "PLAYER_PAIR", label: "Player Pair", odds: "11" }, { key: "BANKER_PAIR", label: "Banker Pair", odds: "11" }, { key: "LUCKY_6", label: "Lucky 6", odds: "12" }] }] },
      { id: "roulette", label: "Roulette", sections: [{ columns: 3, items: [{ key: "RED", label: "Đỏ", odds: "1.98" }, { key: "BLACK", label: "Đen", odds: "1.98" }, { key: "GREEN", label: "Xanh", odds: "8" }, { key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }] }] },
      { id: "dragon-tiger", label: "Rồng Hổ", sections: [{ columns: 3, items: [{ key: "DRAGON", label: "Rồng", odds: "1.98" }, { key: "TIGER", label: "Hổ", odds: "1.98" }, { key: "TIE", label: "Hòa", odds: "8" }] }] },
    ],
  },
  "slot": {
    name: "Slot",
    gameType: "slot",
    drawCount: 3,
    bigThreshold: 14,
    roundSeconds: 30,
    tabs: [
      { id: "classic", label: "Cổ điển", sections: [{ columns: 2, items: [{ key: "LON_NORMAL", label: "Lớn", odds: "1.98" }, { key: "NHO_NORMAL", label: "Nhỏ", odds: "1.98" }, { key: "DON_NORMAL", label: "Đơn", odds: "1.98" }, { key: "DOI_NORMAL", label: "Đôi", odds: "1.98" }] }] },
      { id: "jackpot", label: "Jackpot", sections: [{ columns: 3, items: [{ key: "BAR3", label: "3 BAR", odds: "20" }, { key: "CHERRY3", label: "3 Cherry", odds: "8" }, { key: "SEVEN3", label: "3 Seven", odds: "15" }, { key: "ANY", label: "Bất kỳ", odds: "1.5" }] }] },
      { id: "bonus", label: "Bonus", sections: [{ columns: 2, items: [{ key: "BONUS_LON", label: "Bonus Lớn", odds: "3.98" }, { key: "BONUS_NHO", label: "Bonus Nhỏ", odds: "3.98" }] }] },
    ],
  },
};

export const getGameConfig = (gameId) => GAME_CONFIGS[gameId] || GAME_CONFIGS["may-man-28"];

export const BALL_COLORS = ["#e23b3b", "#2e7d32", "#d81b60", "#1565c0", "#f9a825", "#6a1b9a", "#00838f", "#bf360c", "#455a64", "#ad1457"];

export const computeDrawLabels = (drawn, threshold) => {
  const sum = (drawn || []).reduce((a, b) => a + b, 0);
  return {
    sum,
    big: sum >= threshold ? "Lớn" : "Nhỏ",
    parity: sum % 2 === 1 ? "Đơn" : "Đôi",
  };
};

export const CHIPS = [1, 5, 10, 50, 100, 500];