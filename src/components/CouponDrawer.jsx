import React, { useState } from 'react';
import { Ticket, X, Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';

export default function CouponDrawer({ selections, onRemoveSelection, onClearCoupon, isOpen, onClose }) {
  const [stake, setStake] = useState(100);
  const [isSaved, setIsSaved] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isOpen && selections.length === 0) return null;

  // Calculate Total Combined Odds
  const totalOdds = selections.reduce((acc, curr) => acc * curr.value, 1);
  const potentialPayout = Math.round(stake * totalOdds);

  const handleSaveCoupon = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClearCoupon();
      onClose();
    }, 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: isCollapsed ? '280px' : '360px',
      maxWidth: 'calc(100vw - 32px)',
      background: 'var(--bg-card)',
      border: '1px solid var(--accent-green)',
      borderRadius: 'var(--card-radius)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      zIndex: 990,
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    }}>
      {/* Coupon Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          background: 'var(--bg-secondary)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ticket size={18} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Kupon Simülatörü</span>
          <span style={{
            background: 'var(--accent-green)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: 12
          }}>
            {selections.length} Seçim
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Coupon Body (if expanded) */}
      {!isCollapsed && (
        <div style={{ padding: 14 }}>
          {isSaved ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={44} style={{ marginBottom: 8 }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Kupon Başarıyla Kaydedildi!</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Tahmini Kazanç: {potentialPayout} ₺</p>
            </div>
          ) : selections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Henüz oran seçimi yapılmadı. Maç listesindeki oran butonlarına tıklayarak kupon oluşturabilirsiniz.
            </div>
          ) : (
            <>
              {/* Selections List */}
              <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12, paddingRight: 4 }}>
                {selections.map((item, idx) => (
                  <div
                    key={`${item.matchId}-${item.type}-${idx}`}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 2 }}>{item.matchName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                        Seçim: {item.label}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-gold)' }}>
                        {item.value.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onRemoveSelection(item.matchId, item.type)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stake & Calculations */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Toplam Oran:</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{totalOdds.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Miktar (₺):</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[50, 100, 250, 500].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setStake(amt)}
                        style={{
                          background: stake === amt ? 'var(--accent-green)' : 'var(--bg-primary)',
                          color: stake === amt ? '#000' : 'var(--text-main)',
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {amt}₺
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 700 }}>Tahmini Kazanç:</span>
                  <span style={{ fontWeight: 900, color: 'var(--accent-green)', fontSize: '1rem' }}>
                    {potentialPayout.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={onClearCoupon}
                  style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Temizle
                </button>
                <button
                  onClick={handleSaveCoupon}
                  style={{
                    flex: 1,
                    background: 'var(--accent-green)',
                    color: '#000',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Kuponu Kaydet
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
