import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MatchList from './components/MatchList';
import StandingsTable from './components/StandingsTable';
import TopScorers from './components/TopScorers';
import MatchDetailModal from './components/MatchDetailModal';
import CustomizationModal from './components/CustomizationModal';
import { useFootballData } from './hooks/useFootballData';
import { audioService } from './services/audio';
import SocialFooter from './components/SocialFooter';

// ── Goal Notification Banner ──────────────────────────────────────────────────
function GoalBanner({ goals, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 450);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  if (!goals?.length) return null;
  const g = goals[0];

  return (
    <div className={`goal-banner${visible ? '' : ' out'}`}>
      <span style={{ fontSize: '1.4rem' }}>⚽</span>
      <span>GOL! {g.team} — {g.score}</span>
      <span style={{ fontSize: '1.2rem' }}>🎉</span>
    </div>
  );
}

// ── Last Updated indicator ────────────────────────────────────────────────────
function LastUpdatedBadge({ lastUpdated }) {
  if (!lastUpdated) return null;
  const t = lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div style={{
      textAlign: 'center', fontSize: '0.72rem',
      color: 'var(--text-muted)', padding: '4px 0 8px',
      opacity: 0.7
    }}>
      Son güncelleme: {t} · Her 60 saniyede otomatik yenilenir
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate,       setSelectedDate]       = useState(todayStr);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [activeTab,          setActiveTab]          = useState('matches');
  const [matchFilter,        setMatchFilter]        = useState('all');
  const [selectedMatchId,    setSelectedMatchId]    = useState(null);
  const [goalNotification,   setGoalNotification]   = useState(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  // ── Persisted preferences ─────────────────────────────────────────────────
  const [theme,         setTheme]         = useState(() => localStorage.getItem('da_theme')         || 'skyblue');
  const [soundEnabled,  setSoundEnabled]  = useState(() => localStorage.getItem('da_sound_enabled') !== 'false');
  const [soundType,     setSoundType]     = useState(() => localStorage.getItem('da_sound_type')    || 'whistle');
  const [favoriteTeams, setFavoriteTeams] = useState(() => JSON.parse(localStorage.getItem('da_fav_teams')   || '[]'));
  const [favoriteMatchIds, setFavoriteMatchIds] = useState(() => JSON.parse(localStorage.getItem('da_fav_matches') || '[]'));

  // ── Theme sync ────────────────────────────────────────────────────────────
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('da_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('da_sound_enabled', soundEnabled); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem('da_sound_type', soundType); }, [soundType]);
  useEffect(() => { localStorage.setItem('da_fav_teams', JSON.stringify(favoriteTeams)); }, [favoriteTeams]);
  useEffect(() => { localStorage.setItem('da_fav_matches', JSON.stringify(favoriteMatchIds)); }, [favoriteMatchIds]);

  // ── Data via custom hook (football-data.org, 60s polling) ─────────────────
  const {
    matches,
    competitions,
    loading,
    lastUpdated,
    goalEvents,
    clearGoalEvents,
  } = useFootballData({
    date: selectedDate,
    soundEnabled,
    soundType,
    audioService,
  });

  // ── Show goal banner when new goals arrive ────────────────────────────────
  useEffect(() => {
    if (goalEvents.length > 0) {
      setGoalNotification(goalEvents);
      clearGoalEvents();
    }
  }, [goalEvents, clearGoalEvents]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const liveCount = matches.filter(m =>
    m.status === 'IN_PLAY' || m.status === 'PAUSED'
  ).length;

  const displayMatches = activeTab === 'favorites'
    ? matches.filter(m =>
        favoriteMatchIds.includes(m.id) ||
        favoriteTeams.includes(m.homeTeam?.id) ||
        favoriteTeams.includes(m.awayTeam?.id)
      )
    : matches;

  const handleToggleFavorite = (matchId) => {
    setFavoriteMatchIds(prev =>
      prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      {/* Goal Banner */}
      {goalNotification && (
        <GoalBanner
          goals={goalNotification}
          onDone={() => setGoalNotification(null)}
        />
      )}

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenCustomization={() => setIsCustomizationOpen(true)}
        liveCount={liveCount}
      />

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchFilter={matchFilter}
        setMatchFilter={setMatchFilter}
      />

      <main className="app-container">
        {/* Last updated timestamp */}
        {!loading && <LastUpdatedBadge lastUpdated={lastUpdated} />}

        {loading ? (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginTop: 8 }}>
              football-data.org'dan güncel maçlar yükleniyor…
            </p>
          </div>
        ) : (
          <>
            {(activeTab === 'matches' || activeTab === 'favorites') && (
              <MatchList
                matches={displayMatches}
                competitions={competitions}
                matchFilter={matchFilter}
                searchQuery={searchQuery}
                favoriteMatchIds={favoriteMatchIds}
                onToggleFavorite={handleToggleFavorite}
                onSelectMatch={setSelectedMatchId}
              />
            )}
            {activeTab === 'standings' && <StandingsTable competitions={competitions} />}
            {activeTab === 'scorers'   && <TopScorers   competitions={competitions} />}
          </>
        )}
      </main>

      <SocialFooter />

      {selectedMatchId && (
        <MatchDetailModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        theme={theme} setTheme={setTheme}
        soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
        soundType={soundType} setSoundType={setSoundType}
        favoriteTeams={favoriteTeams} setFavoriteTeams={setFavoriteTeams}
      />
    </div>
  );
}
