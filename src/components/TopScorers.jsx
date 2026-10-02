import React, { useState, useEffect } from 'react';
import { Flame, User } from 'lucide-react';
import { fetchScorers } from '../services/api';

export default function TopScorers({ competitions }) {
  const [selectedLeague, setSelectedLeague] = useState('TSL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const activeCompetitions = competitions.filter(c => !c.isUpcoming);
  const scorers = data?.scorers || [];

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

        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: '0.88rem',
            fontWeight: 700,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {activeCompetitions.map(c => (
            <option key={c.code || c.id} value={c.code || c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--accent-gold)' }}>
          Gol krallığı verileri yükleniyor...
        </div>
      ) : scorers.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
          Gol krallığı verisi bulunamadı.
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
                borderRadius: 10
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
                  fontSize: '0.85rem'
                }}>
                  {idx + 1}
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.player?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.team?.name}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {s.assists !== undefined && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Asist</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.assists}</div>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>Gol</div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-green)' }}>{s.goals}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
