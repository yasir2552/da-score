import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MatchList from './components/MatchList';
import StandingsTable from './components/StandingsTable';
import TopScorers from './components/TopScorers';
import MatchDetailModal from './components/MatchDetailModal';
import CustomizationModal from './components/CustomizationModal';
import { fetchMatches, fetchCompetitions } from './services/api';
import { audioService } from './services/audio';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('matches');
  const [matchFilter, setMatchFilter] = useState('all');

  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Match Detail Modal State
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  // Customization States with LocalStorage Persistence
  // Default theme is 'skyblue' (Açık Mavi & Beyaz)
  const [theme, setTheme] = useState(() => localStorage.getItem('da_theme') || 'skyblue');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('da_sound_enabled') !== 'false');
  const [soundType, setSoundType] = useState(() => localStorage.getItem('da_sound_type') || 'whistle');
  const [favoriteTeams, setFavoriteTeams] = useState(() => JSON.parse(localStorage.getItem('da_fav_teams') || '[1001, 1002, 1003, 86]'));
  const [favoriteMatchIds, setFavoriteMatchIds] = useState(() => JSON.parse(localStorage.getItem('da_fav_matches') || '[]'));

  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  const prevMatchesRef = useRef([]);

  // Theme Sync Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('da_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('da_sound_enabled', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('da_sound_type', soundType);
  }, [soundType]);

  useEffect(() => {
    localStorage.setItem('da_fav_teams', JSON.stringify(favoriteTeams));
  }, [favoriteTeams]);

  useEffect(() => {
    localStorage.setItem('da_fav_matches', JSON.stringify(favoriteMatchIds));
  }, [favoriteMatchIds]);

  // Fetch Competitions on Mount
  useEffect(() => {
    async function loadComps() {
      const data = await fetchCompetitions();
      setCompetitions(data);
    }
    loadComps();
  }, []);

  // Fetch Matches for Selected Date
  const loadMatchesData = async () => {
    const data = await fetchMatches(selectedDate);

    // Detect score changes for live audio alert
    if (soundEnabled && prevMatchesRef.current.length > 0) {
      data.forEach(newM => {
        const oldM = prevMatchesRef.current.find(m => m.id === newM.id);
        if (oldM && oldM.status === 'IN_PLAY') {
          const oldHome = oldM.score?.fullTime?.home || 0;
          const oldAway = oldM.score?.fullTime?.away || 0;
          const newHome = newM.score?.fullTime?.home || 0;
          const newAway = newM.score?.fullTime?.away || 0;

          if (newHome > oldHome || newAway > oldAway) {
            console.log('[DA/SCORE] GOAL DETECTED!', newM.homeTeam?.name, 'vs', newM.awayTeam?.name);
            audioService.playGoalSound(soundType);
          }
        }
      });
    }

    prevMatchesRef.current = data;
    setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadMatchesData();
  }, [selectedDate]);

  // Auto-Refresh Interval: Hardcoded to 6 SECONDS (10 times per minute!)
  useEffect(() => {
    const interval = setInterval(() => {
      loadMatchesData();
    }, 6000); // 6 seconds = 10 updates / minute
    return () => clearInterval(interval);
  }, [selectedDate, soundEnabled, soundType]);

  const handleToggleFavorite = (matchId) => {
    if (favoriteMatchIds.includes(matchId)) {
      setFavoriteMatchIds(favoriteMatchIds.filter(id => id !== matchId));
    } else {
      setFavoriteMatchIds([...favoriteMatchIds, matchId]);
    }
  };

  const liveMatchesCount = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE').length;

  const displayMatches = activeTab === 'favorites'
    ? matches.filter(m => favoriteMatchIds.includes(m.id) || favoriteTeams.includes(m.homeTeam?.id) || favoriteTeams.includes(m.awayTeam?.id))
    : matches;

  return (
    <div className="app-root">
      {/* Header */}
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

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchFilter={matchFilter}
        setMatchFilter={setMatchFilter}
      />

      {/* Main View */}
      <main className="app-container">
        {loading ? (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: 'var(--accent-green)', fontWeight: 800 }}>
            Canlı futbol verileri yükleniyor...
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
                onSelectMatch={(id) => setSelectedMatchId(id)}
              />
            )}

            {activeTab === 'standings' && (
              <StandingsTable competitions={competitions} />
            )}

            {activeTab === 'scorers' && (
              <TopScorers competitions={competitions} />
            )}
          </>
        )}
      </main>

      {/* Match Detail Modal */}
      {selectedMatchId && (
        <MatchDetailModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {/* Customization Modal */}
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
