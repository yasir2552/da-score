import React, { useState } from 'react';
import { Star, Shield } from 'lucide-react';

export default function MatchCard({
  match,
  onSelectMatch,
  favoriteMatchIds,
  onToggleFavorite
}) {
  const isFavorite = favoriteMatchIds.includes(match.id);
  const [homeCrestError, setHomeCrestError] = useState(false);
  const [awayCrestError, setAwayCrestError] = useState(false);

  const getStatusBadge = () => {
    const s = match.status;
    if (s === 'IN_PLAY' || s === 'PAUSED' || s === 'LIVE') {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--accent-red)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '3px 10px',
          borderRadius: 12,
          fontSize: '0.78rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }}>
          <span className="live-pulse"></span>
          <span>{match.minute ? `${match.minute}'` : 'CANLI'}</span>
        </div>
      );
    }
    if (s === 'FINISHED') {
      return (
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          fontWeight: 800,
          background: 'rgba(0, 0, 0, 0.06)',
          padding: '3px 10px',
          borderRadius: 12
        }}>
          MS
        </span>
      );
    }

    const dateObj = new Date(match.utcDate);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <span style={{
        color: 'var(--accent-green)',
        fontSize: '0.85rem',
        fontWeight: 800
      }}>
        {timeStr}
      </span>
    );
  };

  const homeName = match.homeTeam?.shortName || match.homeTeam?.name || 'Ev Sahibi';
  const awayName = match.awayTeam?.shortName || match.awayTeam?.name || 'Deplasman';

  return (
    <div
      onClick={() => onSelectMatch(match.id)}
      className="glass-card"
      style={{
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-green)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(match.id); }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: isFavorite ? 'var(--accent-gold)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 4
          }}
        >
          <Star size={18} fill={isFavorite ? 'var(--accent-gold)' : 'none'} />
        </button>

        {/* Teams & Logos */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Home Team */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {match.homeTeam?.crest && !homeCrestError ? (
                <img
                  src={match.homeTeam.crest}
                  alt=""
                  onError={() => setHomeCrestError(true)}
                  style={{ width: 22, height: 22, objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 900
                }}>
                  {homeName.charAt(0)}
                </div>
              )}
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{homeName}</span>
            </div>

            <span style={{
              fontWeight: 900,
              fontSize: '1.05rem',
              color: match.score?.fullTime?.home !== null ? 'var(--accent-green)' : 'var(--text-muted)'
            }}>
              {match.score?.fullTime?.home ?? '-'}
            </span>
          </div>

          {/* Away Team */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {match.awayTeam?.crest && !awayCrestError ? (
                <img
                  src={match.awayTeam.crest}
                  alt=""
                  onError={() => setAwayCrestError(true)}
                  style={{ width: 22, height: 22, objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 900
                }}>
                  {awayName.charAt(0)}
                </div>
              )}
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{awayName}</span>
            </div>

            <span style={{
              fontWeight: 900,
              fontSize: '1.05rem',
              color: match.score?.fullTime?.away !== null ? 'var(--accent-green)' : 'var(--text-muted)'
            }}>
              {match.score?.fullTime?.away ?? '-'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ minWidth: 65, textAlign: 'right' }}>
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
}
