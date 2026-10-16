import React from 'react';
import { Instagram, Youtube, Video } from 'lucide-react';

export default function SocialFooter() {
  return (
    <footer style={{
      maxWidth: 1200,
      margin: '40px auto 20px',
      padding: '20px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 800, color: 'var(--text-main)', letterSpacing: 0.5 }}>DA / SCORE</span>
        <span>· Canlı Futbol & Skor Portalı</span>
      </div>

      {/* Social Links on bottom right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Instagram - Active */}
        <a
          href="https://www.instagram.com/dasporfutbolhaberleri/"
          target="_blank"
          rel="noopener noreferrer"
          title="DA Spor Instagram"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: 20,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            boxShadow: '0 2px 10px rgba(220, 39, 67, 0.25)',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Instagram size={15} />
          <span>Instagram</span>
        </a>

        {/* X (Twitter) - Yakında */}
        <div
          title="X (Twitter) - Yakında"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'default',
            opacity: 0.8
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>𝕏</span>
          <span>(Yakında)</span>
        </div>

        {/* YouTube - Yakında */}
        <div
          title="YouTube - Yakında"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'default',
            opacity: 0.8
          }}
        >
          <Youtube size={14} style={{ color: '#ff0000' }} />
          <span>(Yakında)</span>
        </div>

        {/* TikTok - Yakında */}
        <div
          title="TikTok - Yakında"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'default',
            opacity: 0.8
          }}
        >
          <Video size={13} />
          <span>TikTok (Yakında)</span>
        </div>
      </div>
    </footer>
  );
}
