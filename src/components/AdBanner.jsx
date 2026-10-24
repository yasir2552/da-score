import React, { useEffect } from 'react';

export default function AdBanner({ slotId = null, format = 'auto', responsive = 'true' }) {
  const adsenseId = import.meta.env.VITE_ADSENSE_ID || import.meta.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    // Sadece gerçek bir AdSense ID tanımlıysa reklam isteği at
    if (adsenseId && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense hatası:', e);
      }
    }
  }, [adsenseId]);

  // Eğer AdSense ID tanımlı değilse responsive şık bir placeholder gösterilir
  if (!adsenseId) {
    return (
      <div style={{
        maxWidth: 1200,
        margin: '20px auto 10px',
        padding: '16px',
        background: 'var(--bg-secondary)',
        border: '1px dashed var(--border-color)',
        borderRadius: 12,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        gap: 4
      }}>
        <span style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6, fontSize: '0.72rem' }}>
          REKLAM ALANI
        </span>
        <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
          Google AdSense ID eklendiğinde burada otomatik reklam gösterilecektir.
        </span>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1200,
      margin: '20px auto 10px',
      textAlign: 'center',
      overflow: 'hidden',
      borderRadius: 12,
      background: 'var(--bg-secondary)'
    }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 90 }}
        data-ad-client={adsenseId}
        data-ad-slot={slotId || ''}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
