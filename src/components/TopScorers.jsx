import React, { useState, useEffect } from 'react';
import { Flame, Search } from 'lucide-react';
import { fetchScorers } from '../services/api';

// Normalize for search
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

export default function TopScorers({ competitions }) {
  const activeCompetitions = (competitions || []).filter(c => !c.isUpcoming);
  const defaultLeague = activeCompetitions[0]?.code || 'PL';

  const [selectedLeague, setSelectedLeague] = useState(defaultLeague);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetchScorers(selectedLeague);
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedLeague]);

  const rawScorers = data?.scorers || [];
  
  // Filter by player or team name
  const scorers = rawScorers.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = normalize(searchQuery);
    const pName = normalize(s.player?.name);
    const tName = normalize(s.team?.name);
    return pName.includes(q) || tName.includes(q);
  });

  return (
    <div className="glass-card" style={{ padding: 18 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flame size={22} style={{ color: 'var(--accent-gold)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Gol Krallığı</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Player & Team Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Oyuncu veya takım ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '6px 10px 6px 30px',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                outline: 'none',
                width: 180
              }}
            />
          </div>

          {/* League Selector */}
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '7px 12px',
              borderRadius: 10,
              fontSize: '0.88rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {activeCompetitions.map(c => (
              <option key={c.code || c.id} value={c.code || c.id}>
                {c.area?.emoji || '🏆'} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--accent-gold)' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: 10, fontWeight: 700 }}>Gerçek gol krallığı verileri yükleniyor...</p>
        </div>
      ) : scorers.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
          {searchQuery ? `"${searchQuery}" için oyuncu veya takım bulunamadı.` : 'Bu lig için gol krallığı verisi bulunamadı.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scorers.map((s, idx) => (
            <div
              key={s.player?.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Rank Badge */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: idx === 0 ? 'var(--accent-gold)' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--bg-primary)',
                  color: idx <= 2 ? '#000' : 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {s.team?.crest && (
                    <img
                      src={s.team.crest}
                      alt=""
                      onError={(e) => e.target.style.display = 'none'}
                      style={{ width: 22, height: 22, objectFit: 'contain' }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.player?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.team?.name}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {s.penalties !== null && s.penalties !== undefined && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Penaltı</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.penalties}</div>
                  </div>
                )}
                {s.assists !== null && s.assists !== undefined && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Asist</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.assists}</div>
                  </div>
                )}
                <div style={{ textAlign: 'center', minWidth: 35 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>Gol</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--accent-green)' }}>{s.goals}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
