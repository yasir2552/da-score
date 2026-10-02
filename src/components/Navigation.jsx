import React from 'react';
import { Calendar, Radio, Award, Star, Settings, Flame } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, matchFilter, setMatchFilter }) {
  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: 20
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {/* Main Section Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'matches' ? 'var(--accent-green)' : 'transparent'}`,
              color: activeTab === 'matches' ? 'var(--accent-green)' : 'var(--text-muted)',
              fontWeight: activeTab === 'matches' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Calendar size={18} />
            <span>Maçlar</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'standings' ? 'var(--accent-green)' : 'transparent'}`,
              color: activeTab === 'standings' ? 'var(--accent-green)' : 'var(--text-muted)',
              fontWeight: activeTab === 'standings' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Award size={18} />
            <span>Puan Durumu</span>
          </button>

          <button
            onClick={() => setActiveTab('scorers')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'scorers' ? 'var(--accent-green)' : 'transparent'}`,
              color: activeTab === 'scorers' ? 'var(--accent-green)' : 'var(--text-muted)',
              fontWeight: activeTab === 'scorers' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Flame size={18} />
            <span>Gol Krallığı</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'favorites' ? 'var(--accent-gold)' : 'transparent'}`,
              color: activeTab === 'favorites' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontWeight: activeTab === 'favorites' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Star size={18} fill={activeTab === 'favorites' ? 'var(--accent-gold)' : 'none'} />
            <span>Favoriler</span>
          </button>
        </div>

        {/* Sub Match Status Filter Pills (Visible when matches tab active) */}
        {activeTab === 'matches' && (
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '8px 0'
          }}>
            {[
              { id: 'all', label: 'Hepsi' },
              { id: 'live', label: '🔴 Canlı' },
              { id: 'finished', label: 'Biten' },
              { id: 'upcoming', label: 'Başlamadı' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setMatchFilter(f.id)}
                style={{
                  background: matchFilter === f.id ? 'var(--bg-hover)' : 'transparent',
                  color: matchFilter === f.id ? 'var(--accent-green)' : 'var(--text-muted)',
                  border: `1px solid ${matchFilter === f.id ? 'var(--accent-green)' : 'transparent'}`,
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
