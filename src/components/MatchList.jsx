import React from 'react';
import MatchCard from './MatchCard';
import { Calendar, Clock } from 'lucide-react';

export default function MatchList({
  matches,
  competitions,
  matchFilter,
  searchQuery,
  favoriteMatchIds,
  onToggleFavorite,
  onSelectMatch
}) {
  const filteredMatches = matches.filter(m => {
    if (matchFilter === 'live' && !(m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE')) return false;
    if (matchFilter === 'finished' && m.status !== 'FINISHED') return false;
    if (matchFilter === 'upcoming' && (m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hName = (m.homeTeam?.name || '').toLowerCase();
      const aName = (m.awayTeam?.name || '').toLowerCase();
      const cName = (m.competition?.name || '').toLowerCase();
      return hName.includes(q) || aName.includes(q) || cName.includes(q);
    }

    return true;
  });

  const matchesByLeague = {};
  filteredMatches.forEach(m => {
    const leagueId = m.competition?.id || 'other';
    if (!matchesByLeague[leagueId]) {
      matchesByLeague[leagueId] = {
        info: m.competition,
        list: []
      };
    }
    matchesByLeague[leagueId].list.push(m);
  });

  const upcomingCompetitions = competitions.filter(c => c.isUpcoming);

  return (
    <div>
      {Object.keys(matchesByLeague).length === 0 && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: 6 }}>Bu kriterlere uygun maç bulunamadı</h3>
          <p style={{ fontSize: '0.85rem' }}>Farklı bir tarih veya arama terimi deneyebilirsiniz.</p>
        </div>
      )}

      {Object.entries(matchesByLeague).map(([leagueId, group]) => (
        <div key={leagueId} style={{ marginBottom: 24 }}>
          {/* League Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            borderLeft: '4px solid var(--accent-green)',
            borderRadius: '10px 10px 0 0',
            marginBottom: 8,
            border: '1px solid var(--border-color)',
            borderLeftWidth: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>{group.info?.area?.emoji || "⚽"}</span>
              {group.info?.emblem && (
                <img
                  src={group.info.emblem}
                  alt=""
                  onError={(e) => e.target.style.display = 'none'}
                  style={{ width: 22, height: 22, objectFit: 'contain' }}
                />
              )}
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                {group.info?.name || 'Lig / Turnuva'}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {group.list.length} Maç
            </span>
          </div>

          <div>
            {group.list.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onSelectMatch={onSelectMatch}
                favoriteMatchIds={favoriteMatchIds}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      ))}

      {upcomingCompetitions.length > 0 && (
        <div style={{ marginTop: 40, borderTop: '1px dashed var(--border-color)', paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={18} style={{ color: 'var(--accent-gold)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Yakında Eklenecek Ligler & Sezon Önizlemeleri</h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12
          }}>
            {upcomingCompetitions.map(comp => (
              <div key={comp.id} className="glass-card" style={{
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0.9
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{comp.area?.emoji || "⚽"}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{comp.name}</span>
                </div>
                <span className="upcoming-tag">Yakında</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
