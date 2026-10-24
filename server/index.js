import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Güvenlik: CORS Kısıtlaması ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com');
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error('CORS kuralı gereği bu kaynağa erişim engellendi.'));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// ─── football-data.org Config ────────────────────────────────────────────────
const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY || '6ded839f7c8444fa9088924e586414e8';
const FD_BASE    = 'https://api.football-data.org/v4';
const FD_HEADERS = { 'X-Auth-Token': FD_API_KEY };

// ─── In-Memory Cache (50 s TTL – API kotasını korumak için Rate Limiting) ───
const cache    = new Map();
const CACHE_TTL = 50_000; // 50 saniye

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.ts < CACHE_TTL) return item.data;
  return null;
}
function setCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

// ─── Ligler / Turnuvalar ─────────────────────────────────────────────────────
const COMPETITIONS = [
  { fd: 2021, code: 'PL',  name: 'Premier League',           area: { name: 'İngiltere',  emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { fd: 2001, code: 'CL',  name: 'UEFA Şampiyonlar Ligi',    area: { name: 'Avrupa',     emoji: '🇪🇺' } },
  { fd: 2014, code: 'PD',  name: 'La Liga',                  area: { name: 'İspanya',    emoji: '🇪🇸' } },
  { fd: 2019, code: 'SA',  name: 'Serie A',                  area: { name: 'İtalya',     emoji: '🇮🇹' } },
  { fd: 2002, code: 'BL1', name: 'Bundesliga',               area: { name: 'Almanya',    emoji: '🇩🇪' } },
  { fd: 2015, code: 'FL1', name: 'Ligue 1',                  area: { name: 'Fransa',     emoji: '🇫🇷' } },
  { fd: 2003, code: 'EL',  name: 'UEFA Avrupa Ligi',         area: { name: 'Avrupa',     emoji: '🇪🇺' } },
  { fd: 2018, code: 'EL2', name: 'UEFA Konferans Ligi',      area: { name: 'Avrupa',     emoji: '🇪🇺' } },
  { fd: 2017, code: 'PPL', name: 'Primeira Liga',            area: { name: 'Portekiz',   emoji: '🇵🇹' } },
  { fd: 2016, code: 'ELC', name: 'Championship',             area: { name: 'İngiltere',  emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { fd: 2013, code: 'BSA', name: 'Brasileirão Série A',      area: { name: 'Brezilya',   emoji: '🇧🇷' } },
  { fd: 2000, code: 'WC',  name: 'FIFA Dünya Kupası',        area: { name: 'Dünya',      emoji: '🌍' } },
];

const UPCOMING = [
  { code: 'TSL',  name: 'Trendyol Süper Lig',           area: { name: 'Türkiye',      emoji: '🇹🇷' }, isUpcoming: true },
  { code: 'T1L',  name: 'Trendyol 1. Lig',              area: { name: 'Türkiye',      emoji: '🇹🇷' }, isUpcoming: true },
  { code: 'SPL',  name: 'Suudi Arabistan Pro Lig',       area: { name: 'S. Arabistan', emoji: '🇸🇦' }, isUpcoming: true },
  { code: 'MLS',  name: 'Major League Soccer',           area: { name: 'ABD',          emoji: '🇺🇸' }, isUpcoming: true },
];

async function fdFetch(path) {
  const res = await fetch(`${FD_BASE}${path}`, { headers: FD_HEADERS });
  if (!res.ok) throw new Error(`football-data API ${res.status}: ${path}`);
  return res.json();
}

function normaliseMatch(m) {
  const comp = COMPETITIONS.find(c => c.fd === m.competition?.id) || {
    fd:   m.competition?.id,
    code: m.competition?.code || 'UNK',
    name: m.competition?.name || 'Bilinmeyen Lig',
    area: { name: m.area?.name || '', emoji: areaEmoji(m.area?.code) }
  };

  return {
    id:     m.id,
    competition: { id: comp.fd, code: comp.code, name: comp.name, area: comp.area },
    utcDate: m.utcDate,
    status:  m.status,
    minute:  m.minute ?? null,
    venue:   m.venue ?? null,
    homeTeam: {
      id:        m.homeTeam?.id,
      name:      m.homeTeam?.name      || 'Ev Sahibi',
      shortName: m.homeTeam?.shortName || m.homeTeam?.tla || m.homeTeam?.name,
      crest:     m.homeTeam?.crest     || null,
    },
    awayTeam: {
      id:        m.awayTeam?.id,
      name:      m.awayTeam?.name      || 'Deplasman',
      shortName: m.awayTeam?.shortName || m.awayTeam?.tla || m.awayTeam?.name,
      crest:     m.awayTeam?.crest     || null,
    },
    score: {
      fullTime: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null,
      },
      halfTime: {
        home: m.score?.halfTime?.home ?? null,
        away: m.score?.halfTime?.away ?? null,
      },
      winner: m.score?.winner ?? null,
    },
    stats: null,
    events: [],
  };
}

function areaEmoji(code) {
  const map = {
    ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', ITA: '🇮🇹', DEU: '🇩🇪', FRA: '🇫🇷',
    PRT: '🇵🇹', BRA: '🇧🇷', USA: '🇺🇸', TUR: '🇹🇷', EUR: '🇪🇺', WLD: '🌍',
  };
  return map[code] || '⚽';
}

async function fetchTodayMatches(dateStr) {
  const key = `fd_matches_${dateStr}`;
  const hit = getCached(key);
  if (hit) return hit;

  try {
    const data = await fdFetch(`/matches?date=${dateStr}`);
    const matches = (data.matches || []).map(normaliseMatch);
    setCache(key, matches);
    return matches;
  } catch (err) {
    console.error('[FD Matches Error]', err.message);
    return [];
  }
}

async function fetchStandings(compId, compInfo) {
  const key = `fd_standings_${compId}`;
  const hit = getCached(key);
  if (hit) return hit;

  try {
    const data = await fdFetch(`/competitions/${compId}/standings`);
    const raw  = data.standings?.[0]?.table || [];

    const table = raw.map(row => ({
      position:       row.position,
      team: {
        id:        row.team?.id,
        name:      row.team?.name,
        shortName: row.team?.shortName || row.team?.tla || row.team?.name,
        crest:     row.team?.crest || null,
      },
      playedGames:    row.playedGames,
      won:            row.won,
      draw:           row.draw,
      lost:           row.lost,
      goalsFor:       row.goalsFor,
      goalsAgainst:   row.goalsAgainst,
      goalDifference: row.goalDifference,
      points:         row.points,
    }));

    const result = {
      competition: compInfo,
      standings: [{ stage: 'REGULAR_SEASON', type: 'TOTAL', table }]
    };
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[FD Standings Error ${compId}]`, err.message);
    return null;
  }
}

async function fetchScorers(compId, compInfo) {
  const key = `fd_scorers_${compId}`;
  const hit = getCached(key);
  if (hit) return hit;

  try {
    const data = await fdFetch(`/competitions/${compId}/scorers?limit=20`);
    const scorers = (data.scorers || []).map(s => ({
      player: { id: s.player?.id, name: s.player?.name },
      team:   { id: s.team?.id, name: s.team?.name, crest: s.team?.crest || null },
      goals:   s.goals   ?? 0,
      assists: s.assists  ?? null,
      penalties: s.penalties ?? null,
    }));

    const result = { competition: compInfo, scorers };
    setCache(key, result);
    return result;
  } catch (err) {
    console.error(`[FD Scorers Error ${compId}]`, err.message);
    return null;
  }
}

async function fetchMatchDetail(matchId) {
  const key = `fd_match_${matchId}`;
  const hit = getCached(key);
  if (hit) return hit;

  try {
    const data = await fdFetch(`/matches/${matchId}`);
    const m = normaliseMatch(data);
    setCache(key, m);
    return m;
  } catch (err) {
    console.error(`[FD Match Error ${matchId}]`, err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  API Routes
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/competitions', (_req, res) => {
  const all = [
    ...COMPETITIONS.map(c => ({ ...c, id: c.fd })),
    ...UPCOMING,
  ];
  res.json({ competitions: all });
});

app.get('/api/matches', async (req, res) => {
  const today   = new Date().toISOString().split('T')[0];
  const dateStr = req.query.date || today;

  const matches = await fetchTodayMatches(dateStr);
  res.json({ count: matches.length, matches });
});

app.get('/api/standings/:code', async (req, res) => {
  const comp = COMPETITIONS.find(c => c.code === req.params.code);
  if (!comp) return res.status(404).json({ error: 'Lig bulunamadı.' });

  const result = await fetchStandings(comp.fd, comp);
  if (!result) return res.status(502).json({ error: 'Puan durumu yüklenemedi.' });
  res.json(result);
});

app.get('/api/scorers/:code', async (req, res) => {
  const comp = COMPETITIONS.find(c => c.code === req.params.code);
  if (!comp) return res.status(404).json({ error: 'Lig bulunamadı.' });

  const result = await fetchScorers(comp.fd, comp);
  if (!result) return res.status(502).json({ error: 'Gol krallığı yüklenemedi.' });
  res.json(result);
});

app.get('/api/match/:id', async (req, res) => {
  const match = await fetchMatchDetail(req.params.id);
  if (!match) return res.status(404).json({ error: 'Maç bulunamadı.' });
  res.json({ match });
});

// ─── Serve React build ────────────────────────────────────────────────────────
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[DA/SCORE] Server running on http://localhost:${PORT}`);
  console.log(`[DA/SCORE] Data source: football-data.org (protected proxy)`);
});
