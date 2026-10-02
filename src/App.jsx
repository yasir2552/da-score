import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MatchList from './components/MatchList';
import StandingsTable from './components/StandingsTable';
import TopScorers from './components/TopScorers';
import MatchDetailModal from './components/MatchDetailModal';
import CustomizationModal from './components/CustomizationModal';
import { fetchMatches, fetchCompetitions } from './services/api';
import { audioService } from './services/audio';

// Goal Notification Banner Component
function GoalBanner({ goals, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 450);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  if (!goals || goals.length === 0) return null;
  const g = goals[0];

  return (
    <div className={`goal-banner${visible ? '' : ' out'}`}>
      <span style={{ fontSize: '1.4rem' }}>⚽</span>
      <span>GOL! {g.team} — {g.scorer}</span>
      <span style={{ fontSize: '1.2rem' }}>🎉</span>
    </div>
  );
}

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('matches');
  const [matchFilter, setMatchFilter] = useState('all');

  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [goalNotification, setGoalNotification] = useState(null);

  // Customization (with localStorage)
  const [theme, setTheme] = useState(() => localStorage.getItem('da_theme') || 'skyblue');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('da_sound_enabled') !== 'false');
  const [soundType, setSoundType] = useState(() => localStorage.getItem('da_sound_type') || 'whistle');
  const [favoriteTeams, setFavoriteTeams] = useState(() => JSON.parse(localStorage.getItem('da_fav_teams') || '[]'));
  const [favoriteMatchIds, setFavoriteMatchIds] = useState(() => JSON.parse(localStorage.getItem('da_fav_matches') || '[]'));
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  const prevMatchesRef = useRef([]);

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('da_theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('da_sound_enabled', soundEnabled); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem('da_sound_type', soundType); }, [soundType]);
  useEffect(() => { localStorage.setItem('da_fav_teams', JSON.stringify(favoriteTeams)); }, [favoriteTeams]);
  useEffect(() => { localStorage.setItem('da_fav_matches', JSON.stringify(favoriteMatchIds)); }, [favoriteMatchIds]);

  // Load competitions
  useEffect(() => {
    fetchCompetitions().then(setCompetitions);
  }, []);

  // Load matches and detect goals
  const loadMatchesData = useCallback(async () => {
    const data = await fetchMatches(selectedDate);

    if (prevMatchesRef.current.length > 0) {
      const goals = [];

      data.forEach(newM => {
        const oldM = prevMatchesRef.current.find(m => m.id === newM.id);
        if (!oldM || oldM.status !== 'IN_PLAY') return;

        const oldHome = oldM.score?.fullTime?.home ?? 0;
        const oldAway = oldM.score?.fullTime?.away ?? 0;
        const newHome = newM.score?.fullTime?.home ?? 0;
        const newAway = newM.score?.fullTime?.away ?? 0;

        if (newHome > oldHome) {
          goals.push({ team: newM.homeTeam?.shortName || newM.homeTeam?.name, scorer: `${newHome}-${newAway}` });
        }
        if (newAway > oldAway) {
          goals.push({ team: newM.awayTeam?.shortName || newM.awayTeam?.name, scorer: `${newHome}-${newAway}` });
        }
      });

      if (goals.length > 0) {
        if (soundEnabled) audioService.playGoalSound(soundType);
        setGoalNotification(goals);
      }
    }

    prevMatchesRef.current = data;
    setMatches(data);
    setLoading(false);
  }, [selectedDate, soundEnabled, soundType]);

  useEffect(() => {
    setLoading(true);
    loadMatchesData();
  }, [selectedDate]);

  // Auto-refresh: every 6 seconds
  useEffect(() => {
    const interval = setInterval(loadMatchesData, 6000);
    return () => clearInterval(interval);
  }, [loadMatchesData]);

  const handleToggleFavorite = (matchId) => {
    setFavoriteMatchIds(prev =>
      prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );
  };

  const liveMatchesCount = matches.filter(m =>
    m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE'
  ).length;

  const displayMatches = activeTab === 'favorites'
    ? matches.filter(m =>
        favoriteMatchIds.includes(m.id) ||
        favoriteTeams.includes(m.homeTeam?.id) ||
        favoriteTeams.includes(m.awayTeam?.id)
      )
    : matches;

  return (
    <div className="app-root">
      {/* Goal Notification Banner */}
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
        liveCount={liveMatchesCount}
      />

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchFilter={matchFilter}
        setMatchFilter={setMatchFilter}
      />

      <main className="app-container">
        {loading ? (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Canlı futbol verileri yükleniyor...</p>
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
            {activeTab === 'scorers' && <TopScorers competitions={competitions} />}
          </>
        )}
      </main>

      {selectedMatchId && (
        <MatchDetailModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        soundType={soundType}
        setSoundType={setSoundType}
        favoriteTeams={favoriteTeams}
        setFavoriteTeams={setFavoriteTeams}
      />
    </div>
  );
}
