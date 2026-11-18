import express from 'express';
import cors from 'cors';

const app = express();

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
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
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

// ─── API Kaynakları Konfigürasyonu ───────────────────────────────────────────
// Kaynak 1: football-data.org (Avrupa Ligleri)
const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY || '6ded839f7c8444fa9088924e586414e8';
const FD_BASE    = 'https://api.football-data.org/v4';
const FD_HEADERS = { 'X-Auth-Token': FD_API_KEY };

// Kaynak 2: ESPN Public Soccer API (Türkiye Ligleri, Suudi Arabistan, MLS & Yedek)
const ESPN_BASE  = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const ESPN_V2    = 'https://site.api.espn.com/apis/v2/sports/soccer';

// ─── In-Memory Cache (50 s TTL) ──────────────────────────────────────────────
const cache    = new Map();
const CACHE_TTL = 50_000;

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.ts < CACHE_TTL) return item.data;
  return null;
}
function setCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

// ─── Ligler / Turnuvalar (TÜMÜ CANLI & AKTİF) ─────────────────────────────────
const COMPETITIONS = [
  // Türkiye Ligleri (ESPN)
  { id: 9901, code: 'TSL', name: 'Trendyol Süper Lig',        area: { name: 'Türkiye',      emoji: '🇹🇷' }, source: 'espn', espn: 'tur.1' },
  { id: 9902, code: 'T1L', name: 'Trendyol 1. Lig',           area: { name: 'Türkiye',      emoji: '🇹🇷' }, source: 'espn', espn: 'tur.2' },

  // Büyük Avrupa Ligleri (Football-Data.org + ESPN Fallback)
  { fd: 2021, code: 'PL',  name: 'Premier League',            area: { name: 'İngiltere',    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, source: 'fd',   espn: 'eng.1' },
  { fd: 2001, code: 'CL',  name: 'UEFA Şampiyonlar Ligi',     area: { name: 'Avrupa',       emoji: '🇪🇺' }, source: 'fd',   espn: 'uefa.champions' },
  { fd: 2014, code: 'PD',  name: 'La Liga',                   area: { name: 'İspanya',      emoji: '🇪🇸' }, source: 'fd',   espn: 'esp.1' },
  { fd: 2019, code: 'SA',  name: 'Serie A',                   area: { name: 'İtalya',       emoji: '🇮🇹' }, source: 'fd',   espn: 'ita.1' },
  { fd: 2002, code: 'BL1', name: 'Bundesliga',                area: { name: 'Almanya',      emoji: '🇩🇪' }, source: 'fd',   espn: 'ger.1' },
  { fd: 2015, code: 'FL1', name: 'Ligue 1',                  area: { name: 'Fransa',     emoji: '🇫🇷' }, source: 'fd',   espn: 'fra.1' },
  { fd: 2003, code: 'EL',  name: 'UEFA Avrupa Ligi',          area: { name: 'Avrupa',     emoji: '🇪🇺' }, source: 'fd',   espn: 'uefa.europa' },
  { fd: 2018, code: 'EL2', name: 'UEFA Konferans Ligi',       area: { name: 'Avrupa',     emoji: '🇪🇺' }, source: 'fd',   espn: 'uefa.europa.conf' },
  { fd: 2017, code: 'PPL', name: 'Primeira Liga',             area: { name: 'Portekiz',   emoji: '🇵🇹' }, source: 'fd',   espn: 'por.1' },
  { fd: 2016, code: 'ELC', name: 'Championship',              area: { name: 'İngiltere',  emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, source: 'fd',   espn: 'eng.2' },
  { fd: 2013, code: 'BSA', name: 'Brasileirão Série A',       area: { name: 'Brezilya',   emoji: '🇧🇷' }, source: 'fd',   espn: 'bra.1' },
  { fd: 2000, code: 'WC',  name: 'FIFA Dünya Kupası',         area: { name: 'Dünya',      emoji: '🌍' }, source: 'fd' },

  // Popüler Dünya Ligleri (ESPN)
  { id: 9903, code: 'SPL', name: 'Suudi Arabistan Pro Lig',   area: { name: 'S. Arabistan', emoji: '🇸🇦' }, source: 'espn', espn: 'ksa.1' },
  { id: 9904, code: 'MLS', name: 'Major League Soccer (MLS)', area: { name: 'ABD',          emoji: '🇺🇸' }, source: 'espn', espn: 'usa.1' },
];

const UPCOMING = [];

function areaEmoji(code) {
  const map = {
    ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', ITA: '🇮🇹', DEU: '🇩🇪', FRA: '🇫🇷',
    PRT: '🇵🇹', BRA: '🇧🇷', USA: '🇺🇸', TUR: '🇹🇷', EUR: '🇪🇺', WLD: '🌍', KSA: '🇸🇦',
  };
  return map[code] || '⚽';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  KAYNAK 1: football-data.org Fonksiyonları
// ═══════════════════════════════════════════════════════════════════════════════
async function fdFetch(path) {
  const res = await fetch(`${FD_BASE}${path}`, { headers: FD_HEADERS });
  if (!res.ok) throw new Error(`football-data API ${res.status}: ${path}`);
  return res.json();
}

function normaliseFDMatch(m) {
  const comp = COMPETITIONS.find(c => c.fd === m.competition?.id) || {
    fd:   m.competition?.id,
    code: m.competition?.code || 'UNK',
    name: m.competition?.name || 'Bilinmeyen Lig',
    area: { name: m.area?.name || '', emoji: areaEmoji(m.area?.code) }
  };

  return {
    id:     m.id,
    competition: { id: comp.fd || comp.id, code: comp.code, name: comp.name, area: comp.area },
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

async function fetchTodayMatchesFD(dateStr) {
  const key = `fd_matches_${dateStr}`;
  const hit = getCached(key);
  if (hit) return hit;

  try {
    const data = await fdFetch(`/matches?date=${dateStr}`);
    const matches = (data.matches || []).map(normaliseFDMatch);
    setCache(key, matches);
    return matches;
  } catch (err) {
    console.error('[FD Matches Error]', err.message);
    return [];
  }
}

async function fetchStandingsFD(compId, compInfo) {
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

async function fetchScorersFD(compId, compInfo) {
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

// ═══════════════════════════════════════════════════════════════════════════════
//  KAYNAK 2: ESPN Public Soccer API Fonksiyonları
// ═══════════════════════════════════════════════════════════════════════════════
function normaliseESPNMatch(ev, compInfo) {
  const comp = ev.competitions?.[0];
  const home = comp?.competitors?.find(c => c.homeAway === 'home');
  const away = comp?.competitors?.find(c => c.homeAway === 'away');

  const state = ev.status?.type?.state;
  let status = 'TIMED';
  if (state === 'in') status = 'IN_PLAY';
  if (state === 'post') status = 'FINISHED';

  const minute = ev.status?.displayClock
    ? parseInt(ev.status.displayClock)
    : (status === 'IN_PLAY' ? 45 : null);

  const homeId = home?.team?.id;
  const awayId = away?.team?.id;

  return {
    id: `espn_${ev.id}`,
    competition: {
      id: compInfo.id || 9901,
      code: compInfo.code,
      name: compInfo.name,
      area: compInfo.area,
    },
    utcDate: ev.date,
    status,
    minute,
    venue: comp?.venue?.fullName || comp?.venue?.displayName || null,
    homeTeam: {
      id: homeId ? `espn_${homeId}` : 1,
      name: home?.team?.displayName || 'Ev Sahibi',
      shortName: home?.team?.shortDisplayName || home?.team?.abbreviation || home?.team?.displayName,
      crest: home?.team?.logo || (homeId ? `https://a.espncdn.com/i/teamlogos/soccer/500/${homeId}.png` : null)
    },
    awayTeam: {
      id: awayId ? `espn_${awayId}` : 2,
      name: away?.team?.displayName || 'Deplasman',
      shortName: away?.team?.shortDisplayName || away?.team?.abbreviation || away?.team?.displayName,
      crest: away?.team?.logo || (awayId ? `https://a.espncdn.com/i/teamlogos/soccer/500/${awayId}.png` : null)
    },
    score: {
      fullTime: {
        home: home?.score !== undefined ? parseInt(home.score) : null,
        away: away?.score !== undefined ? parseInt(away.score) : null,
      },
      halfTime: {
        home: null,
        away: null,
      },
      winner: null,
    },
    stats: null,
    events: [],
  };
}

async function fetchESPNMatches(espnLeagueCode, compInfo, dateStr) {
  const espnDate = dateStr ? dateStr.replace(/-/g, '') : '';
  const cacheKey = `espn_matches_${espnLeagueCode}_${espnDate}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  try {
    const url = espnDate
      ? `${ESPN_BASE}/${espnLeagueCode}/scoreboard?dates=${espnDate}`
      : `${ESPN_BASE}/${espnLeagueCode}/scoreboard`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const events = data?.events || [];
    const parsed = events.map(ev => normaliseESPNMatch(ev, compInfo));

    setCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.error(`[ESPN Matches Error: ${espnLeagueCode}]`, err.message);
    return [];
  }
}

async function fetchESPNStandings(espnLeagueCode, compInfo) {
  const cacheKey = `espn_standings_${espnLeagueCode}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  try {
    const url = `${ESPN_V2}/${espnLeagueCode}/standings`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const group = data?.children?.[0]?.standings || data?.standings;
    const entries = group?.entries || [];

    const table = entries.map((e, idx) => {
      const getStat = (name) => {
        const item = e.stats?.find(s => s.name === name);
        return item ? parseInt(item.value) : 0;
      };

      const teamId = e.team?.id || idx + 1;
      return {
        position: idx + 1,
        team: {
          id: `espn_${teamId}`,
          name: e.team?.displayName || e.team?.name,
          shortName: e.team?.shortDisplayName || e.team?.name,
          crest: e.team?.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`
        },
        playedGames: getStat('gamesPlayed'),
        won: getStat('wins'),
        draw: getStat('ties'),
        lost: getStat('losses'),
        goalsFor: getStat('pointsFor'),
        goalsAgainst: getStat('pointsAgainst'),
        goalDifference: getStat('pointDifferential'),
        points: getStat('points')
      };
    });

    const result = {
      competition: compInfo,
      standings: [{ stage: 'REGULAR_SEASON', type: 'TOTAL', table }]
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[ESPN Standings Error: ${espnLeagueCode}]`, err.message);
    return null;
  }
}

async function fetchESPNScorers(espnLeagueCode, compInfo) {
  const cacheKey = `espn_scorers_${espnLeagueCode}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  try {
    const url = `${ESPN_V2}/${espnLeagueCode}/leaders`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const goalLeaders = data?.leaders?.find(l =>
      l.name === 'goals' || l.abbreviation === 'G' || l.displayName?.toLowerCase().includes('goal')
    );
    const assistLeaders = data?.leaders?.find(l =>
      l.name === 'assists' || l.abbreviation === 'A' || l.displayName?.toLowerCase().includes('assist')
    );

    const goalEntries = goalLeaders?.leaders || [];
    const assistEntries = assistLeaders?.leaders || [];

    const assistMap = {};
    assistEntries.forEach(a => {
      const id = a.athlete?.id;
      if (id) assistMap[id] = parseInt(a.value) || 0;
    });

    const scorers = goalEntries.slice(0, 20).map((entry, idx) => ({
      player: {
        id: entry.athlete?.id || 800 + idx,
        name: entry.athlete?.displayName || entry.athlete?.fullName || `Oyuncu ${idx + 1}`,
      },
      team: {
        id: entry.team?.id,
        name: entry.team?.displayName || entry.team?.name || '',
        crest: entry.team?.logo || (entry.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${entry.team.id}.png` : null)
      },
      goals: parseInt(entry.value) || 0,
      assists: assistMap[entry.athlete?.id] ?? null,
      penalties: null,
    }));

    const result = { competition: compInfo, scorers };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[ESPN Scorers Error: ${espnLeagueCode}]`, err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ÇOKLU API BİRLEŞTİRİCİ & YEDEKLEYİCİ (Multi-Source Match Aggregator)
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchAllMatches(dateStr) {
  const key = `all_matches_${dateStr}`;
  const hit = getCached(key);
  if (hit) return hit;

  // 1. Kaynak: football-data.org (Avrupa Ligleri)
  let fdMatches = [];
  try {
    fdMatches = await fetchTodayMatchesFD(dateStr);
  } catch (e) {
    console.error('[Primary API: Football-Data hatası]', e.message);
  }

  // 2. Kaynak: ESPN API (Trendyol Süper Lig, 1. Lig, Suudi Ligi, MLS)
  let espnMatches = [];
  try {
    const espnComps = COMPETITIONS.filter(c => c.source === 'espn' && c.espn);
    const espnPromises = espnComps.map(c => fetchESPNMatches(c.espn, c, dateStr));
    const espnResults = await Promise.all(espnPromises);
    espnMatches = espnResults.flat();
  } catch (e) {
    console.error('[Secondary API: ESPN hatası]', e.message);
  }

  // 3. Otomatik Fallback (Yedek Devreye Girme):
  if (fdMatches.length === 0) {
    try {
      const fallbackComps = COMPETITIONS.filter(c => c.source === 'fd' && c.espn);
      const fallbackPromises = fallbackComps.slice(0, 4).map(c => fetchESPNMatches(c.espn, c, dateStr));
      const fallbackResults = await Promise.all(fallbackPromises);
      fdMatches = fallbackResults.flat();
    } catch (fbErr) {
      console.error('[Fallback ESPN hatası]', fbErr.message);
    }
  }

  const allMatches = [...espnMatches, ...fdMatches];
  setCache(key, allMatches);
  return allMatches;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  API Routes
// ═══════════════════════════════════════════════════════════════════════════════
const router = express.Router();

router.get('/competitions', (_req, res) => {
  const all = [
    ...COMPETITIONS.map(c => ({ ...c, id: c.fd || c.id })),
    ...UPCOMING,
  ];
  res.json({ competitions: all });
});

router.get('/matches', async (req, res) => {
  const today   = new Date().toISOString().split('T')[0];
  const dateStr = req.query.date || today;

  const matches = await fetchAllMatches(dateStr);
  res.json({ count: matches.length, matches });
});

router.get('/standings/:code', async (req, res) => {
  const comp = COMPETITIONS.find(c => c.code === req.params.code);
  if (!comp) return res.status(404).json({ error: 'Lig bulunamadı.' });

  let result = null;

  if (comp.source === 'espn' && comp.espn) {
    result = await fetchESPNStandings(comp.espn, comp);
  } else {
    if (comp.fd) {
      result = await fetchStandingsFD(comp.fd, comp);
    }
    if (!result && comp.espn) {
      result = await fetchESPNStandings(comp.espn, comp);
    }
  }

  if (!result) return res.status(502).json({ error: 'Puan durumu yüklenemedi.' });
  res.json(result);
});

router.get('/scorers/:code', async (req, res) => {
  const comp = COMPETITIONS.find(c => c.code === req.params.code);
  if (!comp) return res.status(404).json({ error: 'Lig bulunamadı.' });

  let result = null;

  if (comp.source === 'espn' && comp.espn) {
    result = await fetchESPNScorers(comp.espn, comp);
  } else {
    if (comp.fd) {
      result = await fetchScorersFD(comp.fd, comp);
    }
    if (!result && comp.espn) {
      result = await fetchESPNScorers(comp.espn, comp);
    }
  }

  if (!result) return res.status(502).json({ error: 'Gol krallığı yüklenemedi.' });
  res.json(result);
});

router.get('/match/:id', async (req, res) => {
  const { id } = req.params;

  const today = new Date().toISOString().split('T')[0];
  const all = await fetchAllMatches(today);
  const found = all.find(m => String(m.id) === String(id));
  if (found) return res.json({ match: found });

  if (!String(id).startsWith('espn_')) {
    try {
      const data = await fdFetch(`/matches/${id}`);
      return res.json({ match: normaliseFDMatch(data) });
    } catch {
      // ignore
    }
  }

  res.status(404).json({ error: 'Maç bulunamadı.' });
});

app.use('/api', router);
app.use('/', router);

export default app;
