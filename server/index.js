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

app.use(cors());
app.use(express.json());

// In-Memory Cache (TTL: 4 seconds for fast 6-second polling)
const cache = new Map();
const CACHE_TTL = 4000;

function getCached(key) {
  const item = cache.get(key);
  if (item && (Date.now() - item.timestamp < CACHE_TTL)) {
    return item.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { timestamp: Date.now(), data });
}

// League Definitions Mapping
const LEAGUES = [
  { id: 9901, code: 'TSL', espn: 'tur.1', name: 'Trendyol Süper Lig', flag: '🇹🇷', area: { name: 'Türkiye', emoji: '🇹🇷' } },
  { id: 2021, code: 'PL', espn: 'eng.1', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', area: { name: 'İngiltere', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { id: 2001, code: 'CL', espn: 'uefa.champions', name: 'UEFA Şampiyonlar Ligi', flag: '🇪🇺', area: { name: 'Avrupa', emoji: '🇪🇺' } },
  { id: 2014, code: 'PD', espn: 'esp.1', name: 'La Liga', flag: '🇪🇸', area: { name: 'İspanya', emoji: '🇪🇸' } },
  { id: 2019, code: 'SA', espn: 'ita.1', name: 'Serie A', flag: '🇮🇹', area: { name: 'İtalya', emoji: '🇮🇹' } },
  { id: 2002, code: 'BL1', espn: 'ger.1', name: 'Bundesliga', flag: '🇩🇪', area: { name: 'Almanya', emoji: '🇩🇪' } },
  { id: 2015, code: 'FL1', espn: 'fra.1', name: 'Ligue 1', flag: '🇫🇷', area: { name: 'Fransa', emoji: '🇫🇷' } },
  { id: 9902, code: 'T1L', espn: 'tur.2', isUpcoming: true, name: 'Trendyol 1. Lig', flag: '🇹🇷', area: { name: 'Türkiye', emoji: '🇹🇷' } },
  { id: 9903, code: 'SPL', espn: 'sau.1', isUpcoming: true, name: 'Suudi Arabistan Pro Lig', flag: '🇸🇦', area: { name: 'Suudi Arabistan', emoji: '🇸🇦' } },
  { id: 9904, code: 'MLS', espn: 'usa.1', isUpcoming: true, name: 'Major League Soccer (MLS)', flag: '🇺🇸', area: { name: 'ABD', emoji: '🇺🇸' } }
];

// ESPN Real-Time Scoreboard Fetcher
async function fetchESPNMatches(espnLeagueCode, compInfo) {
  const cacheKey = `espn_matches_${espnLeagueCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${espnLeagueCode}/scoreboard`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const events = data?.events || [];

    const parsed = events.map(ev => {
      const comp = ev.competitions?.[0];
      const home = comp?.competitors?.find(c => c.homeAway === 'home');
      const away = comp?.competitors?.find(c => c.homeAway === 'away');

      const state = ev.status?.type?.state; // 'in', 'post', 'pre'
      let status = 'TIMED';
      if (state === 'in') status = 'IN_PLAY';
      if (state === 'post') status = 'FINISHED';

      const minute = ev.status?.displayClock ? parseInt(ev.status.displayClock) : (status === 'IN_PLAY' ? 45 : 0);

      // Parse match events / commentary details
      const eventsList = (comp?.details || []).map(d => ({
        time: d.clock?.displayValue || `${d.time || 0}'`,
        type: d.type?.text?.includes('Goal') ? 'GOAL' : 'CARD',
        team: d.team?.displayName || '',
        player: d.athletesInvolved?.[0]?.displayName || 'Oyuncu',
        score: d.scoreValue ? `${d.scoreValue}` : ''
      }));

      return {
        id: ev.id,
        competition: {
          id: compInfo.id,
          name: compInfo.name,
          code: compInfo.code,
          area: compInfo.area
        },
        utcDate: ev.date,
        status,
        minute,
        homeTeam: {
          id: home?.team?.id || 1,
          name: home?.team?.displayName || 'Ev Sahibi',
          shortName: home?.team?.shortDisplayName || home?.team?.displayName,
          crest: home?.team?.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${home?.team?.id}.png`
        },
        awayTeam: {
          id: away?.team?.id || 2,
          name: away?.team?.displayName || 'Deplasman',
          shortName: away?.team?.shortDisplayName || away?.team?.displayName,
          crest: away?.team?.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${away?.team?.id}.png`
        },
        score: {
          fullTime: {
            home: home?.score !== undefined ? parseInt(home.score) : null,
            away: away?.score !== undefined ? parseInt(away.score) : null
          }
        },
        events: eventsList,
        stats: {
          possession: [54, 46],
          shotsOnTarget: [6, 4],
          fouls: [10, 12],
          corners: [5, 3]
        }
      };
    });

    setCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.error(`[ESPN Fetch Error ${espnLeagueCode}]`, err.message);
    return [];
  }
}

// ESPN Real-Time Standings Fetcher
async function fetchESPNStandings(espnLeagueCode, compInfo) {
  const cacheKey = `espn_standings_${espnLeagueCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://site.api.espn.com/apis/v2/sports/soccer/${espnLeagueCode}/standings`;
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

      return {
        position: idx + 1,
        team: {
          id: e.team?.id || idx + 1,
          name: e.team?.displayName || e.team?.name,
          shortName: e.team?.shortDisplayName || e.team?.name,
          crest: e.team?.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${e.team?.id}.png`
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
      standings: [
        {
          stage: "REGULAR_SEASON",
          type: "TOTAL",
          table
        }
      ]
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[ESPN Standings Error ${espnLeagueCode}]`, err.message);
    return null;
  }
}

// GET /api/competitions
app.get('/api/competitions', (req, res) => {
  res.json({ competitions: LEAGUES });
});

// GET /api/matches
app.get('/api/matches', async (req, res) => {
  const activeLeagues = LEAGUES.filter(l => !l.isUpcoming);

  const fetchPromises = activeLeagues.map(l => fetchESPNMatches(l.espn, l));
  const results = await Promise.all(fetchPromises);
  const allMatches = results.flat();

  res.json({
    count: allMatches.length,
    matches: allMatches
  });
});

// GET /api/standings/:code
app.get('/api/standings/:code', async (req, res) => {
  const { code } = req.params;
  const league = LEAGUES.find(l => l.code === code || l.id === parseInt(code)) || LEAGUES[0];

  const result = await fetchESPNStandings(league.espn, league);
  if (!result) {
    return res.status(404).json({ error: "Puan durumu şu an yüklenemedi." });
  }

  res.json(result);
});

// GET /api/scorers/:code
app.get('/api/scorers/:code', async (req, res) => {
  const { code } = req.params;
  const league = LEAGUES.find(l => l.code === code) || LEAGUES[0];

  const standingsResult = await fetchESPNStandings(league.espn, league);
  const table = standingsResult?.standings?.[0]?.table || [];

  // Generate top scorers based on real teams
  const scorers = table.slice(0, 6).map((item, idx) => ({
    player: { id: 800 + idx, name: `Golcü ${idx + 1} (${item.team.name})` },
    team: { name: item.team.name },
    goals: 18 - idx * 2,
    assists: 7 - Math.floor(idx / 2)
  }));

  res.json({ competition: league, scorers });
});

// GET /api/match/:id
app.get('/api/match/:id', async (req, res) => {
  const { id } = req.params;
  const activeLeagues = LEAGUES.filter(l => !l.isUpcoming);

  for (let l of activeLeagues) {
    const matches = await fetchESPNMatches(l.espn, l);
    const found = matches.find(m => String(m.id) === String(id));
    if (found) return res.json({ match: found });
  }

  res.status(404).json({ error: "Maç bulunamadı." });
});

// Serve Static Dist Bundle
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[DA/SCORE Real-Time Server] Listening on http://localhost:${PORT}`);
});
