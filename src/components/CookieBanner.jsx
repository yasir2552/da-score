import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';

export default function CookieBanner({ onOpenLegal }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('da_cookie_consent');
    if (!consent) {
      // 1 saniye sonra yumuşakça görünsün
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('da_cookie_consent', 'all');
    setShow(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('da_cookie_consent', 'essential');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 16,
      right: 16,
      maxWidth: 820,
      margin: '0 auto',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 14,
      padding: '16px 20px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
      zIndex: 1500,
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0, 255, 117, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)',
            flexShrink: 0
          }}>
            <Cookie size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Çerezler ve KVKK Bilgilendirmesi
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Daha iyi bir deneyim, tercihlerinizi (tema, favoriler, gol sesi) saklamak ve yasal reklam standartları (Google AdSense) için çerezler kullanmaktayız.
            </p>
          </div>
        </div>

        <button
          onClick={handleAcceptEssential}
          title="Kapat"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        paddingTop: 8,
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onOpenLegal('kvkk')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-green)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            KVKK Aydınlatma
          </button>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <button
            onClick={() => onOpenLegal('cookies')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-green)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            Çerez Politikası
          </button>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <button
            onClick={() => onOpenLegal('disclaimer')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            Bahis & Yasal Uyarı
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleAcceptEssential}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Yalnızca Gerekli Olanlar
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              background: 'var(--accent-green)',
              color: '#000000',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Check size={14} />
            <span>Tümünü Kabul Et</span>
          </button>
        </div>
      </div>
    </div>
  );
}
