import React from 'react';
import { X, Sliders, Volume2, Palette, Star, Play } from 'lucide-react';
import { audioService } from '../services/audio';

export default function CustomizationModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  soundType,
  setSoundType,
  favoriteTeams,
  setFavoriteTeams
}) {
  if (!isOpen) return null;

  const availableTeams = [
    { id: 1001, name: 'Galatasaray SK', flag: '🇹🇷' },
    { id: 1002, name: 'Fenerbahçe SK', flag: '🇹🇷' },
    { id: 1003, name: 'Beşiktaş JK', flag: '🇹🇷' },
    { id: 1004, name: 'Trabzonspor', flag: '🇹🇷' },
    { id: 86, name: 'Real Madrid', flag: '🇪🇸' },
    { id: 81, name: 'FC Barcelona', flag: '🇪🇸' },
    { id: 65, name: 'Manchester City', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 57, name: 'Arsenal FC', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 5, name: 'Bayern München', flag: '🇩🇪' },
    { id: 108, name: 'Inter Milan', flag: '🇮🇹' }
  ];

  const toggleFavoriteTeam = (teamId) => {
    if (favoriteTeams.includes(teamId)) {
      setFavoriteTeams(favoriteTeams.filter(id => id !== teamId));
    } else {
      setFavoriteTeams([...favoriteTeams, teamId]);
    }
  };

  const handleTestSound = () => {
    audioService.playGoalSound(soundType);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1050,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 560,
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={20} style={{ color: 'var(--accent-green)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Uygulama Özelleştirme & Tema</h3>
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

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SECTION 1: Theme Picker */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Palette size={18} style={{ color: 'var(--accent-green)' }} />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Renk Temaları</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { id: 'skyblue', label: 'Açık Mavi & Beyaz', desc: 'Ferah Gökyüzü Mavisi', color: '#0284c7' },
                { id: 'dascore', label: 'DA/SCORE Yeşil', desc: 'Koyu Yeşil & Siyah', color: '#00ff75' },
                { id: 'amoled', label: 'Gece Siyahı', desc: 'AMOLED Siyah & Kırmızı', color: '#ff3b30' },
                { id: 'gold', label: 'Siber Gold', desc: 'Lüks Siyah & Altın', color: '#e5c158' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{
                    background: theme === t.id ? 'var(--bg-hover)' : 'var(--bg-primary)',
                    border: `2px solid ${theme === t.id ? t.color : 'var(--border-color)'}`,
                    borderRadius: 10,
                    padding: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>{t.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: t.color }}></div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Goal Audio Notification */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Volume2 size={18} style={{ color: 'var(--accent-green)' }} />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Gol Sesi Bildirimi</h4>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-green)', width: 18, height: 18 }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{soundEnabled ? 'Açık' : 'Kapalı'}</span>
              </label>
            </div>

            {soundEnabled && (
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: 14
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>Ses Tipi Seçin:</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[
                    { id: 'whistle', label: 'Hakem Düdüğü' },
                    { id: 'stadium', label: 'Stadyum Tezahüratı' },
                    { id: 'digital', label: 'Dijital Bip' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSoundType(st.id)}
                      style={{
                        flex: 1,
                        background: soundType === st.id ? 'var(--accent-green)' : 'var(--bg-secondary)',
                        color: soundType === st.id ? '#ffffff' : 'var(--text-main)',
                        border: 'none',
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTestSound}
                  style={{
                    width: '100%',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--accent-green)',
                    color: 'var(--accent-green)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Play size={15} />
                  <span>Ses Test Et (Dinle)</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: Favorite Teams */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Star size={18} style={{ color: 'var(--accent-gold)' }} />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Favori Takımlarım (Sabitleme)</h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableTeams.map(t => {
                const fav = favoriteTeams.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleFavoriteTeam(t.id)}
                    style={{
                      background: fav ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)',
                      border: `1px solid ${fav ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                      color: fav ? 'var(--accent-gold)' : 'var(--text-main)',
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>{t.flag}</span>
                    <span>{t.name}</span>
                    <Star size={14} fill={fav ? 'var(--accent-gold)' : 'none'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
