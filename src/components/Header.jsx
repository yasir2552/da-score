import React from 'react';
import { Volume2, VolumeX, Search, Sliders, Calendar } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  selectedDate,
  setSelectedDate,
  onOpenCustomization,
  liveCount
}) {
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const getOffsetDateISO = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const yesterdayISO = getOffsetDateISO(-1);
  const todayISO     = getTodayISO();
  const tomorrowISO  = getOffsetDateISO(1);

  const quickDates = [
    { label: 'Dün',   value: yesterdayISO },
    { label: 'Bugün', value: todayISO },
    { label: 'Yarın', value: tomorrowISO },
  ];

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Brand & Live Pulse Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.6rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ color: 'var(--accent-green)' }}>DA</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>SCORE</span>
          </div>

          <div className="live-badge">
            <span className="live-pulse"></span>
            <span>{liveCount} CANLI MAÇ</span>
          </div>
        </div>

        {/* Working Dün / Bugün / Yarın Date Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'var(--bg-primary)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid var(--border-color)'
        }}>
          {quickDates.map(qd => {
            const isActive = selectedDate === qd.value;
            return (
              <button
                key={qd.value}
                onClick={() => setSelectedDate(qd.value)}
                style={{
                  background: isActive ? 'var(--accent-green)' : 'transparent',
                  color: isActive ? '#000000' : 'var(--text-main)',
                  fontWeight: isActive ? 900 : 600,
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {qd.label}
              </button>
            );
          })}

          {/* Optional custom date picker */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 8px',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }} title="Tarih Seç">
            <Calendar size={15} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: 20,
                cursor: 'pointer'
              }}
            />
          </label>
        </div>

        {/* Search & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={15} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Takım, lig veya maç ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 20,
                padding: '7px 12px 7px 32px',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                outline: 'none',
                width: 170,
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.width = '210px'}
              onBlur={(e) => e.target.style.width = '170px'}
            />
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Gol Sesi Açık" : "Gol Sesi Kapalı"}
            style={{
              background: soundEnabled ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-primary)',
              border: `1px solid ${soundEnabled ? 'var(--accent-green)' : 'var(--border-color)'}`,
              color: soundEnabled ? 'var(--accent-green)' : 'var(--text-muted)',
              padding: 8,
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Customization & Theme Launcher */}
          <button
            onClick={onOpenCustomization}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '6px 14px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sliders size={16} style={{ color: 'var(--accent-green)' }} />
            <span>Özelleştir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
