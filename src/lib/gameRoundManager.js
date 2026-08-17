import { computeDrawLabels } from "@/components/game/gameConfig";
import { getGameConfig } from "@/lib/gameStore";
import { getUserData, updateUserData } from "./userData";
import { pushNotification } from "./localNotifications";
import { isSupabaseConfigured } from "./supabase";
import { spSettleBets, spSyncBalanceState } from "./supabaseService";

// Fixed anchor epoch in seconds (e.g. 2026-01-01 00:00:00 UTC)
const ANCHOR_TIME = 1767225600;
const BASE_PERIOD = 1897400;

/**
 * Calculates current period number and remaining seconds in real-time.
 */
export function getCurrentRoundInfo(gameId) {
    const config = getGameConfig(gameId);
    const roundSec = config.timerDuration || config.roundSeconds || 60;
    const nowSec = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, nowSec - ANCHOR_TIME);
    const roundIndex = Math.floor(elapsed / roundSec);
    const currentPeriod = BASE_PERIOD + roundIndex;
    const secondsInRound = elapsed % roundSec;
    const remainingSeconds = roundSec - secondsInRound;

  return {
        currentPeriod,
        remainingSeconds,
        roundSeconds: roundSec,
  };
}

/**
 * Deterministically generates draw numbers for a specific game and period.
 */
export function getPeriodDraw(gameId, period) {
    const config = getGameConfig(gameId);
    const drawCount = config.drawCount || 3;
    let str = `${gameId}_period_${period}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
    }

  const drawn = [];
    for (let i = 0; i < drawCount; i++) {
          hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b);
          hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
          hash ^= hash >>> 16;
          drawn.push(Math.abs(hash) % 10);
    }
    return drawn;
}

/**
 * Evaluates whether a bet label matches a draw result.
 */
export function evaluateBetWin(itemLabel, drawn, config, itemKey) {
    const labels = computeDrawLabels(drawn, config.bigThreshold);
    const sum = labels.sum;

  // Extreme Big/Small
  if (itemKey === "LON_EXTREME" || itemLabel === "Cực Lớn" || itemLabel === "Lớn (Cực)") return sum >= 22;
    if (itemKey === "NHO_EXTREME" || itemLabel === "Cực nhỏ" || itemLabel === "Nhỏ (Cực)") return sum <= 5;

  // Normal Big/Small
  if (itemKey === "LON_NORMAL" || itemLabel === "Lớn") return labels.big === "Lớn";
    if (itemKey === "NHO_NORMAL" || itemLabel === "Nhỏ") return labels.big === "Nhỏ";

  // Parity
  if (itemKey === "DON_NORMAL" || itemLabel === "Đơn") return labels.parity === "Đơn";
    if (itemKey === "DOI_NORMAL" || itemLabel === "Đôi") return labels.parity === "Đôi";

  // Combo
  if (itemKey === "LON_DON" || itemLabel === "Đơn hàng lớn") return labels.big === "Lớn" && labels.parity === "Đơn";
    if (itemKey === "LON_DOI" || itemLabel === "Đôi lớn") return labels.big === "Lớn" && labels.parity === "Đôi";
    if (itemKey === "NHO_DON" || itemLabel === "Danh sách nhỏ") return labels.big === "Nhỏ" && labels.parity === "Đơn";
    if (itemKey === "NHO_DOI" || itemLabel === "Đôi nhỏ") return labels.big === "Nhỏ" && labels.parity === "Đôi";

  // Waves & Bao
  if (itemKey === "RED_WAVE" || itemLabel === "Sóng đỏ") return [3, 6, 9, 12, 15, 18, 21, 24].includes(sum);
    if (itemKey === "GREEN_WAVE" || itemLabel === "Sóng xanh") return [1, 4, 7, 10, 16, 19, 22, 25].includes(sum);
    if (itemKey === "BLUE_WAVE" || itemLabel === "Sóng xanh dương") return [2, 5, 8, 11, 17, 20, 23, 26].includes(sum);
    if (itemKey === "BAO" || itemLabel === "Báo") return drawn.length >= 3 && drawn[0] === drawn[1] && drawn[1] === drawn[2];

  // Bonus
  if (itemKey === "BONUS_LON" || itemLabel === "Bonus Lớn") return sum >= (config.bigThreshold || 14) + 2;
    if (itemKey === "BONUS_NHO" || itemLabel === "Bonus Nhỏ") return sum <= (config.bigThreshold || 14) - 2;

  // Casino / Table games
  if (itemLabel === "Player") return drawn[0] > drawn[1];
    if (itemLabel === "Banker") return drawn[1] > drawn[0];
    if (itemLabel === "Tie" || itemLabel === "Hòa") return drawn[0] === drawn[1];
    if (itemLabel === "Rồng") return drawn[0] > drawn[1];
    if (itemLabel === "Hổ") return drawn[1] > drawn[0];

  // Number match
  if (!isNaN(itemLabel)) {
        const num = Number(itemLabel);
        return drawn.includes(num) || sum === num;
  }

  return false;
}

/**
 * Settles all expired pending bets for a user atomically with idempotency control and locked odds snapshots.
 */
export function settlePendingBets(userId) {
    if (!userId) return;
    const initialUserData = getUserData(userId);
    if (!initialUserData || !initialUserData.bets || initialUserData.bets.length === 0) return;

  const hasPending = initialUserData.bets.some(
        (b) => b.status === "PENDING" || b.status === "pending"
      );
    if (!hasPending) return;

  let notificationsToSend = [];
    let settledBetsForSync = [];
    let syncBalance = null;
    let syncProfit = null;

  updateUserData(userId, (latestDB) => {
        if (!latestDB || !latestDB.bets || latestDB.bets.length === 0) return latestDB;

                     let hasChanges = false;
        let totalWinnings = 0;
        let profitAdd = 0;
        const newTxLogs = [];
        notificationsToSend = [];

                     const updatedBets = latestDB.bets.map((bet) => {
                             const isPending = bet.status === "PENDING" || bet.status === "pending";
                             if (!isPending) return bet;

                                                                 const gameId = bet.gameId || "may-man-28";
                             const roundInfo = getCurrentRoundInfo(gameId);

                                                                 if (roundInfo.currentPeriod > bet.period) {
                                                                           hasChanges = true;
                                                                           const config = getGameConfig(gameId);
                                                                           const drawn = getPeriodDraw(gameId, bet.period);
                                                                           const won = evaluateBetWin(bet.label, drawn, config, bet.key);
                                                                           const lockedOdds = Number(bet.lockedOdds ?? bet.odds ?? 1.98);

                               if (won) {
                                           const payout = +(bet.amount * lockedOdds).toFixed(2);
                                           totalWinnings += payout;
                                           profitAdd += (payout - bet.amount);

                                                                             notificationsToSend.push({
                                                                                           type: "result",
                                                                                           title: `Thắng Cược Kỳ ${bet.period}`,
                                                                                           body: `Cộng +$${payout} USD tại ${bet.game || gameId} (${bet.label})`,
                                                                             });

                                                                             newTxLogs.push({
                                                                                           id: `tx_payout_${bet.id || bet.betId || Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                                                                                           type: "payout",
                                                                                           title: `Thắng Cược Kỳ ${bet.period}`,
                                                                                           body: `+$${payout} USD · ${bet.game || gameId} (${bet.label})`,
                                                                                           amount: payout,
                                                                                           method: "Trả thưởng",
                                                                                           status: "completed",
                                                                                           time: new Date().toLocaleString("vi-VN"),
                                                                             });

                                                                             return {
                                                                                           ...bet,
                                                                                           lockedOdds,
                                                                                           status: "SETTLED_WIN",
                                                                                           result: "win",
                                                                                           winAmount: payout,
                                                                                           settledAt: new Date().toISOString(),
                                                                             };
                               } else {
                                           profitAdd -= bet.amount;
                                           notificationsToSend.push({
                                                         type: "result",
                                                         title: `Kết Quả Kỳ ${bet.period}`,
                                                         body: `Thua $${bet.amount} USD tại ${bet.game || gameId} (${bet.label})`,
                                           });

                                                                             return {
                                                                                           ...bet,
                                                                                           lockedOdds,
                                                                                           status: "SETTLED_LOSE",
                                                                                           result: "loss",
                                                                                           winAmount: 0,
                                                                                           settledAt: new Date().toISOString(),
                                                                             };
                               }
                                                                 }

                                                                 return bet;
                     });

                     if (!hasChanges) return latestDB;

                     const currentDBBalance = latestDB?.balance ?? 0;
        const newBalance = +(currentDBBalance + totalWinnings).toFixed(2);
        const newProfit = +((latestDB?.profit ?? 0) + profitAdd).toFixed(2);
        settledBetsForSync = updatedBets.filter((b, i) => b !== latestDB.bets[i]);
        syncBalance = newBalance;
        syncProfit = newProfit;

                     return {
                             ...latestDB,
                             balance: newBalance,
                             profit: newProfit,
                             bets: updatedBets,
                             txs: [...newTxLogs, ...(latestDB?.txs || [])],
                     };
  });

  // Cross-device sync: push settlement result (win/loss + payout) and the
  // updated balance/profit to Supabase so other devices on the same account
  // pick up the outcome instead of only settling it locally on this device.
  if (isSupabaseConfigured() && settledBetsForSync.length > 0) {
        spSettleBets(settledBetsForSync).catch((e) => console.warn("Supabase settle sync info:", e?.message));
        spSyncBalanceState(userId, { balance: syncBalance, profit: syncProfit }).catch((e) =>
                console.warn("Supabase balance sync info:", e?.message)
                                                                                           );
  }

  if (notificationsToSend.length > 0) {
        try {
                window.dispatchEvent(new CustomEvent("FORCE_BALANCE_SYNC", { detail: { userId } }));
        } catch { /* ignore */ }

      notificationsToSend.forEach((notif) => {
              pushNotification(userId, notif);
      });
  }
}
