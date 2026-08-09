import { useState, useEffect, useCallback, useRef } from "react";
import { GAMES, generateDraw, makePeriod } from "./gamesData";

// Simulated real-time feed via HTTP polling (the long-polling fallback path).
// A new draw for a random game is published every few seconds; updated cards
// get a transient `pulse` flag so the UI can flash them.
export function useLiveDraws(intervalMs = 5000) {
  const [draws, setDraws] = useState(() => {
    const map = {};
    GAMES.forEach((g, idx) => {
      const history = Array.from({ length: 12 }, (_, i) => ({
        period: makePeriod(12 - i),
        ...generateDraw(g.type),
        time: Date.now() - (12 - i) * 60000,
      }));
      map[g.gameId] = { history, latest: history[0], pulse: false, seq: idx };
    });
    return map;
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const clearPulse = (gameId) =>
    setDraws((prev) => ({ ...prev, [gameId]: { ...prev[gameId], pulse: false } }));

  useEffect(() => {
    const id = setInterval(() => {
      const g = GAMES[Math.floor(Math.random() * GAMES.length)];
      const cur = drawsRef.current[g.gameId];
      const draw = { period: makePeriod(0, cur.seq + 1), ...generateDraw(g.type), time: Date.now() };
      setDraws((prev) => {
        const c = prev[g.gameId];
        const history = [draw, ...c.history].slice(0, 20);
        return { ...prev, [g.gameId]: { history, latest: draw, pulse: true, seq: c.seq + 1 } };
      });
      setLastUpdate(Date.now());
      setTimeout(() => clearPulse(g.gameId), 1300);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  // keep a ref so the interval always reads latest seq without re-subscribing
  const drawsRef = useRef(draws);
  drawsRef.current = draws;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setDraws((prev) => {
      const next = { ...prev };
      GAMES.forEach((g) => {
        const c = prev[g.gameId];
        const draw = { period: makePeriod(0, c.seq + 1), ...generateDraw(g.type), time: Date.now() };
        next[g.gameId] = { history: [draw, ...c.history].slice(0, 20), latest: draw, pulse: true, seq: c.seq + 1 };
      });
      return next;
    });
    setLastUpdate(Date.now());
    setRefreshing(false);
    setTimeout(() => {
      setDraws((prev) => {
        const next = { ...prev };
        GAMES.forEach((g) => { next[g.gameId] = { ...next[g.gameId], pulse: false }; });
        return next;
      });
    }, 1300);
  }, []);

  return { draws, lastUpdate, refreshing, refresh };
}