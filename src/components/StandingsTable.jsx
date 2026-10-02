import React, { useState, useEffect } from 'react';
import { Award, RefreshCw } from 'lucide-react';
import { fetchStandings } from '../services/api';

export default function StandingsTable({ competitions }) {
  const [selectedLeague, setSelectedLeague] = useState('TSL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetchStandings(selectedLeague);
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedLeague]);

  const activeCompetitions = competitions.filter(c => !c.isUpcoming);

  const tableData = data?.standings?.[0]?.table || [];

  return (
    <div className="glass-card" style={{ padding: 18 }}>
      {/* Header & Selector */}
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
          <Award size={22} style={{ color: 'var(--accent-green)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Puan Durumu</h3>
        </div>

        {/* League Selector */}
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
              {c.name} ({c.area?.name})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--accent-green)' }}>
          Puan durumu yükleniyor...
        </div>
      ) : tableData.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
          Bu lig için puan durumu verisi bulunamadı.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.88rem',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 40 }}>Sıra</th>
                <th style={{ padding: '10px 8px' }}>Takım</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>O</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>G</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>B</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>M</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>AG</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>YG</th>
                <th style={{ padding: '10px 6px', textAlign: 'center' }}>AV</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-green)' }}>P</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => {
                let posColor = 'transparent';
                if (row.position <= 4) posColor = 'rgba(0, 255, 117, 0.15)'; // Champions League
                else if (row.position === 5) posColor = 'rgba(52, 199, 89, 0.08)'; // Europa League
                else if (row.position >= tableData.length - 2) posColor = 'rgba(255, 71, 87, 0.1)'; // Relegation

                return (
                  <tr
                    key={row.team?.id || row.position}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: posColor,
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: row.position <= 4 ? 'var(--accent-green)' : 'inherit'
                    }}>
                      {row.position}
                    </td>

                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {row.team?.crest && (
                          <img src={row.team.crest} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                        )}
                        <span>{row.team?.shortName || row.team?.name}</span>
                      </div>
                    </td>

                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>{row.playedGames}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>{row.won}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>{row.draw}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>{row.lost}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', opacity: 0.8 }}>{row.goalsFor}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', opacity: 0.8 }}>{row.goalsAgainst}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600 }}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontWeight: 900,
                      fontSize: '1rem',
                      color: 'var(--accent-green)'
                    }}>
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 16,
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-green)' }}></span>
              <span>Şampiyonlar Ligi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-gold)' }}></span>
              <span>Avrupa Ligi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-red)' }}></span>
              <span>Düşme Hattı</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
