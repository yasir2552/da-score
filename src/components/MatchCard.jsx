import React, { useState, useEffect, useRef } from 'react';
import { Star, Shield } from 'lucide-react';

// Normalize Turkish characters for search
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

export default function MatchCard({ match, onSelectMatch, favoriteMatchIds, onToggleFavorite, isGoal }) {
  const isFavorite = favoriteMatchIds.includes(match.id);
  const [homeCrestError, setHomeCrestError] = useState(false);
  const [awayCrestError, setAwayCrestError] = useState(false);
  const [flash, setFlash] = useState(false);
  const [homeScorePop, setHomeScorePop] = useState(false);
  const [awayScorePop, setAwayScorePop] = useState(false);

  const prevHomeScore = useRef(match.score?.fullTime?.home);
  const prevAwayScore = useRef(match.score?.fullTime?.away);

  // Detect goal and trigger animations
  useEffect(() => {
    const newHome = match.score?.fullTime?.home;
    const newAway = match.score?.fullTime?.away;
    let scored = false;

    if (prevHomeScore.current !== null && newHome !== null && newHome > prevHomeScore.current) {
      setHomeScorePop(false);
      requestAnimationFrame(() => setHomeScorePop(true));
      scored = true;
    }
    if (prevAwayScore.current !== null && newAway !== null && newAway > prevAwayScore.current) {
      setAwayScorePop(false);
      requestAnimationFrame(() => setAwayScorePop(true));
      scored = true;
    }

    if (scored) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
    }

    prevHomeScore.current = newHome;
    prevAwayScore.current = newAway;
  }, [match.score?.fullTime?.home, match.score?.fullTime?.away]);

  const getStatusBadge = () => {
    const s = match.status;
    if (s === 'IN_PLAY' || s === 'PAUSED' || s === 'LIVE') {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--accent-red)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '3px 10px', borderRadius: 12,
          fontSize: '0.78rem', fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', gap: 5
        }}>
          <span className="live-pulse"></span>
          <span>{match.minute ? `${match.minute}'` : 'CANLI'}</span>
        </div>
      );
    }
    if (s === 'FINISHED') {
      return (
        <span style={{
          color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 800,
          background: 'rgba(0,0,0,0.06)', padding: '3px 10px', borderRadius: 12
        }}>MS</span>
      );
    }
    const dateObj = new Date(match.utcDate);
    const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return (
      <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 800 }}>
        {timeStr}
      </span>
    );
  };

  const homeName = match.homeTeam?.shortName || match.homeTeam?.name || 'Ev Sahibi';
  const awayName = match.awayTeam?.shortName || match.awayTeam?.name || 'Deplasman';

  const TeamLogo = ({ crest, hasError, onError, name }) => {
    if (crest && !hasError) {
      return (
        <img
          src={crest}
          alt={name}
          onError={onError}
          style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }}
        />
      );
    }
    return (
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'var(--accent-green)', color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 900, flexShrink: 0
      }}>
        {(name || '?').charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelectMatch(match.id)}
      className={`glass-card${flash ? ' goal-flash' : ''}`}
      style={{ padding: '14px 16px', marginBottom: 10, cursor: 'pointer', position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(match.id); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer',
            color: isFavorite ? 'var(--accent-gold)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', padding: 4, flexShrink: 0 }}
        >
          <Star size={18} fill={isFavorite ? 'var(--accent-gold)' : 'none'} />
        </button>

        {/* Teams */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          {/* Home */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <TeamLogo
                crest={match.homeTeam?.crest}
                hasError={homeCrestError}
                onError={() => setHomeCrestError(true)}
                name={homeName}
              />
              <span style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{homeName}</span>
            </div>
            <span
              key={`h-${match.score?.fullTime?.home}`}
              className={homeScorePop ? 'score-pop' : ''}
              style={{ fontWeight: 900, fontSize: '1.1rem',
                color: match.score?.fullTime?.home !== null ? 'var(--accent-green)' : 'var(--text-muted)',
                flexShrink: 0
              }}
            >
              {match.score?.fullTime?.home ?? '-'}
            </span>
          </div>

          {/* Away */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <TeamLogo
                crest={match.awayTeam?.crest}
                hasError={awayCrestError}
                onError={() => setAwayCrestError(true)}
                name={awayName}
              />
              <span style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{awayName}</span>
            </div>
            <span
              key={`a-${match.score?.fullTime?.away}`}
              className={awayScorePop ? 'score-pop' : ''}
              style={{ fontWeight: 900, fontSize: '1.1rem',
                color: match.score?.fullTime?.away !== null ? 'var(--accent-green)' : 'var(--text-muted)',
                flexShrink: 0
              }}
            >
              {match.score?.fullTime?.away ?? '-'}
            </span>
          </div>
        </div>

        {/* Status */}
        <div style={{ minWidth: 65, textAlign: 'right', flexShrink: 0 }}>
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
}
