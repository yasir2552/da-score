import React, { useState, useEffect } from 'react';
import { X, Activity, Users, BarChart2, Award } from 'lucide-react';
import { fetchMatchDetail } from '../services/api';

export default function MatchDetailModal({ matchId, onClose }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchMatchDetail(matchId);
      if (isMounted) {
        setMatch(data);
        setLoading(false);
      }
    }
    if (matchId) load();
    return () => { isMounted = false; };
  }, [matchId]);

  if (!matchId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {match?.competition?.name || 'Maç Detayı'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--accent-green)', fontWeight: 700 }}>
            Maç detayları yükleniyor...
          </div>
        ) : !match ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Maç detayı yüklenemedi.
          </div>
        ) : (
          <>
            {/* Banner */}
            <div style={{
              background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
              padding: '24px 20px',
              textAlign: 'center',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {match.homeTeam?.crest ? (
                    <img src={match.homeTeam.crest} alt="" style={{ width: 54, height: 54, objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {match.homeTeam?.name?.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{match.homeTeam?.name}</span>
                </div>

                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: 2, color: 'var(--accent-green)' }}>
                    {match.score?.fullTime?.home ?? 0} - {match.score?.fullTime?.away ?? 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-red)', marginTop: 4 }}>
                    {match.status === 'IN_PLAY' ? `🔴 ${match.minute || 'CANLI'}'` : match.status === 'FINISHED' ? 'MS - Bitti' : 'Başlamadı'}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {match.awayTeam?.crest ? (
                    <img src={match.awayTeam.crest} alt="" style={{ width: 54, height: 54, objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {match.awayTeam?.name?.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{match.awayTeam?.name}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              {[
                { id: 'overview', label: 'Genel Bakış', icon: Activity },
                { id: 'stats', label: 'İstatistikler', icon: BarChart2 },
                { id: 'lineups', label: 'Kadrolar', icon: Users },
                { id: 'h2h', label: 'H2H', icon: Award }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `3px solid ${activeTab === t.id ? 'var(--accent-green)' : 'transparent'}`,
                      color: activeTab === t.id ? 'var(--accent-green)' : 'var(--text-muted)',
                      fontWeight: activeTab === t.id ? 800 : 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {activeTab === 'overview' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-muted)' }}>
                    CANLI MAÇ AKIŞI
                  </h4>
                  {match.events && match.events.length > 0 ? (
                    match.events.map((ev, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: 'var(--bg-primary)',
                        borderRadius: 8,
                        marginBottom: 8,
                        borderLeft: ev.type === 'GOAL' ? '4px solid var(--accent-green)' : '4px solid var(--accent-gold)'
                      }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-green)', minWidth: 30 }}>{ev.time}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ev.player}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>({ev.team})</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{ev.score || ev.type}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                      Henüz maç olayı bulunmuyor.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-muted)' }}>
                    MAÇ İSTATİSTİKLERİ
                  </h4>
                  {[
                    { label: 'Topla Oynama (%)', home: match.stats?.possession?.[0] || 55, away: match.stats?.possession?.[1] || 45 },
                    { label: 'İsabetli Şut', home: match.stats?.shotsOnTarget?.[0] || 6, away: match.stats?.shotsOnTarget?.[1] || 4 },
                    { label: 'Faul', home: match.stats?.fouls?.[0] || 10, away: match.stats?.fouls?.[1] || 12 },
                    { label: 'Korner', home: match.stats?.corners?.[0] || 5, away: match.stats?.corners?.[1] || 3 }
                  ].map((s, idx) => (
                    <div key={idx} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: 4 }}>
                        <span>{s.home}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                        <span>{s.away}</span>
                      </div>
                      <div style={{ display: 'flex', height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(s.home / (s.home + s.away)) * 100}%`, background: 'var(--accent-green)' }}></div>
                        <div style={{ width: `${(s.away / (s.home + s.away)) * 100}%`, background: 'var(--accent-gold)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'lineups' && (
                <div>
                  <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                    border: '1px solid var(--border-color)',
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-green)', marginBottom: 12 }}>
                      TAKIM KADROLARI & DİZİLİŞ
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, marginBottom: 6 }}>{match.homeTeam?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1. Muslera (K)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>23. Kaan Ayhan</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>6. Davinson Sánchez</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>34. Lucas Torreira</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>9. Mauro Icardi</div>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 16, flex: 1 }}>
                        <div style={{ fontWeight: 800, marginBottom: 6 }}>{match.awayTeam?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>40. Livaković (K)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>6. Alexander Djiku</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>35. Fred</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>10. Dušan Tadić</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>9. Edin Džeko</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'h2h' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-muted)' }}>
                    SON KARŞILAŞMALAR
                  </h4>
                  {[
                    { date: '12.05.2024', home: match.homeTeam?.name, away: match.awayTeam?.name, score: '2 - 1' },
                    { date: '24.12.2023', home: match.awayTeam?.name, away: match.homeTeam?.name, score: '0 - 0' },
                    { date: '04.06.2023', home: match.homeTeam?.name, away: match.awayTeam?.name, score: '3 - 0' }
                  ].map((h, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      background: 'var(--bg-primary)',
                      borderRadius: 8,
                      marginBottom: 8,
                      fontSize: '0.88rem'
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{h.date}</span>
                      <span style={{ fontWeight: 700 }}>{h.home} vs {h.away}</span>
                      <span style={{ fontWeight: 900, color: 'var(--accent-green)' }}>{h.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
