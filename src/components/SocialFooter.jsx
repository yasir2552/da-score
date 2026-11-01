import React from 'react';
import { Instagram, Youtube, Video, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SocialFooter({ onOpenLegal }) {
  return (
    <footer style={{
      maxWidth: 1200,
      margin: '40px auto 20px',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-muted)',
      fontSize: '0.82rem'
    }}>
      {/* Top Row: Brand & Social Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1rem', letterSpacing: 0.5 }}>
            DA <span style={{ color: 'var(--accent-green)' }}>/</span> SCORE
          </span>
          <span style={{ opacity: 0.6 }}>· Canlı Futbol & Skor Portalı</span>
        </div>

        {/* Social Links on bottom right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
            <Instagram size={14} />
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
            <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>𝕏</span>
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
      </div>

      {/* Middle Row: Legal & KVKK Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        paddingTop: 12,
        borderTop: '1px dashed var(--border-color)',
        fontSize: '0.76rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenLegal && onOpenLegal('kvkk')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
              fontSize: '0.76rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          >
            KVKK Aydınlatma Metni
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('disclaimer')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              fontWeight: 700,
              padding: 0,
              fontSize: '0.76rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Yasal Uyarı & Bahis Reddi
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('cookies')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
              fontSize: '0.76rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          >
            Çerez Politikası
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
              fontSize: '0.76rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          >
            Kullanım Koşulları & Künye
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)' }}>
          <ShieldCheck size={14} />
          <span>KVKK ve GDPR Uyumlu</span>
        </div>
      </div>

      {/* Bottom Row: Strict Legal Disclaimer on Betting and Copyright */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '10px 14px',
        borderRadius: 8,
        border: '1px solid var(--border-color)',
        fontSize: '0.72rem',
        lineHeight: 1.5,
        color: 'var(--text-muted)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>YASAL UYARI:</strong> DA/SCORE sitesinde kesinlikle bahis, iddaa veya şans oyunu oynatılmamaktadır.
          Sitemiz 7258 sayılı Kanuna tam uyumlu olarak yalnızca kamuyu bilgilendirme amaçlı canlı skor ve istatistik sunar.
          Kulüp logoları ve lig amblemleri ilgili kurumların tescilli hakları olup yalnızca adil kullanım (fair use) kapsamında yer alır.
        </p>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.72rem', opacity: 0.6 }}>
        © {new Date().getFullYear()} DA/SCORE. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
