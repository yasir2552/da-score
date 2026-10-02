const API_BASE = '/api';

export async function fetchCompetitions() {
  try {
    const res = await fetch(`${API_BASE}/competitions`);
    if (!res.ok) throw new Error('Ligler çekilemedi');
    const data = await res.json();
    return data.competitions || [];
  } catch (err) {
    console.error('fetchCompetitions Error:', err);
    return [];
  }
}

export async function fetchMatches(date = '') {
  try {
    const url = date ? `${API_BASE}/matches?date=${date}` : `${API_BASE}/matches`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Maçlar çekilemedi');
    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.error('fetchMatches Error:', err);
    return [];
  }
}

export async function fetchStandings(code = 'TSL') {
  try {
    const res = await fetch(`${API_BASE}/standings/${code}`);
    if (!res.ok) throw new Error('Puan durumu çekilemedi');
    return await res.json();
  } catch (err) {
    console.error('fetchStandings Error:', err);
    return null;
  }
}

export async function fetchScorers(code = 'TSL') {
  try {
    const res = await fetch(`${API_BASE}/scorers/${code}`);
    if (!res.ok) throw new Error('Gol krallığı verisi çekilemedi');
    return await res.json();
  } catch (err) {
    console.error('fetchScorers Error:', err);
    return null;
  }
}

export async function fetchMatchDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/match/${id}`);
    if (!res.ok) throw new Error('Maç detayı çekilemedi');
    const data = await res.json();
    return data.match || null;
  } catch (err) {
    console.error('fetchMatchDetail Error:', err);
    return null;
  }
}
