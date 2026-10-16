/**
 * useFootballData – Custom React Hook
 * ─────────────────────────────────────────────────────────────────
 * Sayfa yüklendiğinde bugünün maçlarını football-data.org'dan çeker
 * ve her 60 saniyede bir arka planda otomatik yeniler (polling).
 *
 * Bağımlılık: Hiçbir AI/chat servisi kullanmaz.
 * Veri: /api/matches endpoint üzerinden kendi Express sunucumuzdan gelir.
 *       Sunucu, football-data.org API'sini 50s cache ile proxy'ler.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL_MS = 60_000; // 60 saniye

export function useFootballData({ date, soundEnabled, soundType, audioService }) {
  const [matches,      setMatches]      = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [goalEvents,   setGoalEvents]   = useState([]);

  const prevMatchesRef = useRef([]);
  const timerRef       = useRef(null);

  // ── Load competitions once ──────────────────────────────────────
  useEffect(() => {
    fetch('/api/competitions')
      .then(r => r.json())
      .then(d => setCompetitions(d.competitions || []))
      .catch(() => {});
  }, []);

  // ── Core fetch function ─────────────────────────────────────────
  const fetchMatches = useCallback(async (isInitial = false) => {
    try {
      const url = date ? `/api/matches?date=${date}` : '/api/matches';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const incoming = data.matches || [];

      // ── Goal detection ────────────────────────────────────────
      const newGoals = [];
      if (!isInitial && prevMatchesRef.current.length > 0) {
        incoming.forEach(newM => {
          const oldM = prevMatchesRef.current.find(m => m.id === newM.id);
          if (!oldM) return;
          if (oldM.status !== 'IN_PLAY' && oldM.status !== 'PAUSED') return;

          const oldHome = oldM.score?.fullTime?.home ?? 0;
          const oldAway = oldM.score?.fullTime?.away ?? 0;
          const newHome = newM.score?.fullTime?.home ?? 0;
          const newAway = newM.score?.fullTime?.away ?? 0;

          if (newHome > oldHome) {
            newGoals.push({
              team:  newM.homeTeam?.shortName || newM.homeTeam?.name,
              score: `${newHome}–${newAway}`,
              comp:  newM.competition?.name,
            });
          }
          if (newAway > oldAway) {
            newGoals.push({
              team:  newM.awayTeam?.shortName || newM.awayTeam?.name,
              score: `${newHome}–${newAway}`,
              comp:  newM.competition?.name,
            });
          }
        });
      }

      prevMatchesRef.current = incoming;
      setMatches(incoming);
      setLastUpdated(new Date());
      if (isInitial) setLoading(false);

      if (newGoals.length > 0) {
        setGoalEvents(newGoals);
        if (soundEnabled && audioService) audioService.playGoalSound(soundType);
      }
    } catch (err) {
      console.error('[useFootballData] fetch error:', err.message);
      if (isInitial) setLoading(false);
    }
  }, [date, soundEnabled, soundType, audioService]);

  // ── Initial load + polling every 60 s ──────────────────────────
  useEffect(() => {
    setLoading(true);
    prevMatchesRef.current = [];
    fetchMatches(true); // ilk yükleme

    timerRef.current = setInterval(() => {
      fetchMatches(false); // arka plan yenileme
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [fetchMatches]);

  // ── Clear goal events after consumer reads them ─────────────────
  const clearGoalEvents = useCallback(() => setGoalEvents([]), []);

  return {
    matches,
    competitions,
    loading,
    lastUpdated,
    goalEvents,
    clearGoalEvents,
    refetch: () => fetchMatches(false),
  };
}
