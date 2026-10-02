import React from 'react';
import MatchCard from './MatchCard';
import { Calendar, Clock } from 'lucide-react';

// Normalize Turkish characters for search
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

export default function MatchList({
  matches, competitions, matchFilter, searchQuery,
  favoriteMatchIds, onToggleFavorite, onSelectMatch
}) {
  const filteredMatches = matches.filter(m => {
    if (matchFilter === 'live' && !(m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE')) return false;
    if (matchFilter === 'finished' && m.status !== 'FINISHED') return false;
    if (matchFilter === 'upcoming' && (m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED')) return false;

    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      const hName = normalize(m.homeTeam?.name) + ' ' + normalize(m.homeTeam?.shortName);
      const aName = normalize(m.awayTeam?.name) + ' ' + normalize(m.awayTeam?.shortName);
      const cName = normalize(m.competition?.name);
      return hName.includes(q) || aName.includes(q) || cName.includes(q);
    }

    return true;
  });

  // Group by league
  const matchesByLeague = {};
  filteredMatches.forEach(m => {
    const leagueId = m.competition?.id || 'other';
    if (!matchesByLeague[leagueId]) {
      matchesByLeague[leagueId] = { info: m.competition, list: [] };
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
          <p style={{ fontSize: '0.85rem' }}>
            {searchQuery ? `"${searchQuery}" için sonuç yok. Türkçe veya İngilizce takım adı deneyebilirsiniz.` : 'Farklı bir tarih veya filtre deneyin.'}
          </p>
        </div>
      )}

      {Object.entries(matchesByLeague).map(([leagueId, group]) => (
        <div key={leagueId} style={{ marginBottom: 24 }}>
          {/* League Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: '10px 10px 0 0',
            marginBottom: 2,
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--accent-green)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>{group.info?.area?.emoji || '⚽'}</span>
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                {group.info?.name || 'Lig / Turnuva'}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {group.list.length} Maç
            </span>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Yakında Eklenecek Ligler</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {upcomingCompetitions.map(comp => (
              <div key={comp.id} className="glass-card" style={{
                padding: 14, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', opacity: 0.9
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{comp.area?.emoji || '⚽'}</span>
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
