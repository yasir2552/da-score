import React, { useState, useEffect } from 'react';
import { X, Activity, BarChart2, MapPin, Calendar, Clock } from 'lucide-react';
import { fetchMatchDetail } from '../services/api';

function StatBar({ label, home, away }) {
  if (home === null || home === undefined || away === null || away === undefined) return null;
  const total = (home + away) || 1;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: 5 }}>
        <span style={{ color: 'var(--accent-green)' }}>{home}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</span>
        <span style={{ color: 'var(--accent-gold)' }}>{away}</span>
      </div>
      <div style={{ display: 'flex', height: 7, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${(home / total) * 100}%`, background: 'var(--accent-green)', transition: 'width 0.4s ease' }}></div>
        <div style={{ width: `${(away / total) * 100}%`, background: 'var(--accent-gold)', transition: 'width 0.4s ease' }}></div>
      </div>
    </div>
  );
}

export default function MatchDetailModal({ matchId, onClose }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchMatchDetail(matchId);
      if (isMounted) { setMatch(data); setLoading(false); }
    }
    if (matchId) load();
    return () => { isMounted = false; };
  }, [matchId]);

  if (!matchId) return null;

  const matchDate = match?.utcDate ? new Date(match.utcDate) : null;
  const dateStr = matchDate
    ? matchDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const timeStr = matchDate
    ? matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const hasStats = match?.stats && (
    match.stats.possession || match.stats.shotsOnTarget ||
    match.stats.fouls || match.stats.corners
  );

  const isLiveOrDone = match?.status === 'IN_PLAY' || match?.status === 'FINISHED' || match?.status === 'PAUSED';

  const TeamLogo = ({ crest, name, size = 54 }) => {
    const [err, setErr] = useState(false);
    if (crest && !err) {
      return <img src={crest} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, objectFit: 'contain' }} />;
    }
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--accent-green)', color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: size * 0.35
      }}>
        {(name || '?').charAt(0).toUpperCase()}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Maç Akışı', icon: Activity },
    { id: 'stats', label: 'İstatistikler', icon: BarChart2 },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%', maxWidth: 680,
          maxHeight: '92vh', display: 'flex',
          flexDirection: 'column', overflow: 'hidden',
          borderRadius: 18
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '12px 18px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              {match?.competition?.area?.emoji || '⚽'} {match?.competition?.name || 'Maç Detayı'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', borderRadius: '50%',
              width: 32, height: 32, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Yükleniyor...</p>
          </div>
        ) : !match ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Maç detayı yüklenemedi.
          </div>
        ) : (
          <>
            {/* Score Banner */}
            <div style={{
              background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
              padding: '20px 16px 14px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              {/* Teams & Score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {/* Home */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <TeamLogo crest={match.homeTeam?.crest} name={match.homeTeam?.name} size={52} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', textAlign: 'center' }}>
                    {match.homeTeam?.name}
                  </span>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'center', minWidth: 110 }}>
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: 3, color: 'var(--accent-green)', lineHeight: 1 }}>
                    {match.score?.fullTime?.home ?? '-'} : {match.score?.fullTime?.away ?? '-'}
                  </div>
                  <div style={{ marginTop: 6, fontSize: '0.82rem', fontWeight: 800 }}>
                    {match.status === 'IN_PLAY'
                      ? <span style={{ color: 'var(--accent-red)' }}>🔴 {match.minute ? `${match.minute}'` : 'CANLI'}</span>
                      : match.status === 'FINISHED'
                        ? <span style={{ color: 'var(--text-muted)' }}>⬛ Maç Sona Erdi</span>
                        : <span style={{ color: 'var(--accent-green)' }}>⏰ Başlamadı</span>
                    }
                  </div>
                </div>

                {/* Away */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <TeamLogo crest={match.awayTeam?.crest} name={match.awayTeam?.name} size={52} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', textAlign: 'center' }}>
                    {match.awayTeam?.name}
                  </span>
                </div>
              </div>

              {/* Date / Time / Venue Info */}
              <div style={{
                marginTop: 14, display: 'flex',
                flexWrap: 'wrap', justifyContent: 'center',
                gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)'
              }}>
                {dateStr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={13} />
                    <span>{dateStr}</span>
                  </div>
                )}
                {timeStr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} />
                    <span>{timeStr}</span>
                  </div>
                )}
                {match.venue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} />
                    <span>{match.venue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs - only show if there's content */}
            {isLiveOrDone && (
              <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                {tabs.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      style={{
                        flex: 1, padding: '11px 12px',
                        background: 'transparent', border: 'none',
                        borderBottom: `3px solid ${activeTab === t.id ? 'var(--accent-green)' : 'transparent'}`,
                        color: activeTab === t.id ? 'var(--accent-green)' : 'var(--text-muted)',
                        fontWeight: activeTab === t.id ? 800 : 600,
                        fontSize: '0.85rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 6
                      }}
                    >
                      <Icon size={15} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Content */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
              {/* If upcoming - show info message */}
              {!isLiveOrDone && (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>⏳</div>
                  <p style={{ fontWeight: 700 }}>Bu maç henüz başlamadı.</p>
                  {dateStr && <p style={{ fontSize: '0.85rem', marginTop: 6 }}>{dateStr} — {timeStr}</p>}
                </div>
              )}

              {/* Match Events */}
              {isLiveOrDone && activeTab === 'overview' && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 1 }}>
                    MAÇ AKIŞI
                  </div>
                  {match.events && match.events.length > 0 ? (
                    match.events.map((ev, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        background: 'var(--bg-primary)',
                        borderRadius: 8, marginBottom: 8,
                        borderLeft: `4px solid ${ev.type === 'GOAL' ? 'var(--accent-green)' : 'var(--accent-gold)'}`
                      }}>
                        <span style={{ fontWeight: 900, color: 'var(--accent-green)', minWidth: 36, fontSize: '0.88rem' }}>
                          {ev.time}
                        </span>
                        <span style={{ fontSize: '1.1rem' }}>{ev.type === 'GOAL' ? '⚽' : '🟨'}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ev.player}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>({ev.team})</span>
                        </div>
                        {ev.score && <span style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.88rem' }}>{ev.score}</span>}
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📋</div>
                      <p>Henüz maç olayı bulunmuyor.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              {isLiveOrDone && activeTab === 'stats' && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: 1 }}>
                    MAÇ İSTATİSTİKLERİ
                  </div>

                  {/* Team name headers */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontWeight: 800, fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent-green)' }}>{match.homeTeam?.shortName || match.homeTeam?.name}</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{match.awayTeam?.shortName || match.awayTeam?.name}</span>
                  </div>

                  {hasStats ? (
                    <>
                      <StatBar label="Topla Oynama (%)" home={match.stats?.possession?.[0]} away={match.stats?.possession?.[1]} />
                      <StatBar label="İsabetli Şut" home={match.stats?.shotsOnTarget?.[0]} away={match.stats?.shotsOnTarget?.[1]} />
                      <StatBar label="Faul" home={match.stats?.fouls?.[0]} away={match.stats?.fouls?.[1]} />
                      <StatBar label="Korner" home={match.stats?.corners?.[0]} away={match.stats?.corners?.[1]} />
                      <StatBar label="Sarı Kart" home={match.stats?.yellowCards?.[0]} away={match.stats?.yellowCards?.[1]} />
                      <StatBar label="Ofsayt" home={match.stats?.offsides?.[0]} away={match.stats?.offsides?.[1]} />
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📊</div>
                      <p>İstatistikler şu an mevcut değil.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
