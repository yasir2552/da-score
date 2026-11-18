import React from 'react';
import { Volume2, VolumeX, Search, Sliders, Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

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

  // Günleri 1 gün geri / ileri kaydırma (Maçkolik tarzı)
  const stepDate = (days) => {
    const base = selectedDate || todayISO;
    const [y, m, d] = base.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Tarih etiketini Türkçe formatlama
  const formatCustomDateLabel = (dateStr) => {
    if (!dateStr) return 'Bugün';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
  };

  const isQuickDate = selectedDate === yesterdayISO || selectedDate === todayISO || selectedDate === tomorrowISO;

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

        {/* Maçkolik Tarzı Tarih Seçici (Önceki Gün / Takvim / Sonraki Gün) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'var(--bg-primary)',
          padding: '3px 6px',
          borderRadius: 12,
          border: '1px solid var(--border-color)'
        }}>
          {/* Önceki Gün Butonu (◀) */}
          <button
            onClick={() => stepDate(-1)}
            title="Önceki Günün Maçları"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '6px 6px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dün / Bugün / Yarın Butonları */}
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
                  padding: '5px 12px',
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

          {/* Eğer Dün/Bugün/Yarın harici eski veya ileri bir tarih seçildiyse onu göster */}
          {!isQuickDate && (
            <div style={{
              background: 'rgba(0, 255, 117, 0.15)',
              color: 'var(--accent-green)',
              border: '1px solid var(--accent-green)',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>{formatCustomDateLabel(selectedDate)}</span>
              <button
                onClick={() => setSelectedDate(todayISO)}
                title="Bugüne Dön"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
              >
                <RotateCcw size={13} />
              </button>
            </div>
          )}

          {/* Sonraki Gün Butonu (▶) */}
          <button
            onClick={() => stepDate(1)}
            title="Sonraki Günün Maçları"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '6px 6px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ChevronRight size={18} />
          </button>

          {/* Takvimden Tarih Seç (İstediğin Eski veya Gelecek Güne Atla) */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 8px',
            cursor: 'pointer',
            color: isQuickDate ? 'var(--text-muted)' : 'var(--accent-green)',
            position: 'relative'
          }} title="Takvimden Tarih Seç (Eski veya Gelecek Maçlar)">
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                width: '100%',
                height: '100%',
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
