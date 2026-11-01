import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Cookie, Info, AlertTriangle } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'kvkk' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Modal her açıldığında talep edilen sekmeyle başlatılsın
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'kvkk', label: 'KVKK Aydınlatma', icon: ShieldCheck },
    { id: 'disclaimer', label: 'Yasal Uyarı & Bahis Reddi', icon: AlertTriangle },
    { id: 'cookies', label: 'Çerez Politikası', icon: Cookie },
    { id: 'terms', label: 'Kullanım Koşulları & Künye', icon: FileText },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 16,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} style={{ color: 'var(--accent-green)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Yasal Bilgilendirme & KVKK</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                DA/SCORE Hukuki Güvence, Çerez ve Veri Güvenliği Portalı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Kapat"
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

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex: '1 0 auto',
                  padding: '12px 14px',
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                  border: 'none',
                  borderBottom: `3px solid ${isActive ? 'var(--accent-green)' : 'transparent'}`,
                  color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{
          padding: '24px 22px',
          overflowY: 'auto',
          flex: 1,
          fontSize: '0.86rem',
          lineHeight: 1.65,
          color: 'var(--text-main)'
        }}>
          {/* TAB 1: KVKK Aydınlatma Metni */}
          {activeTab === 'kvkk' && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12, color: 'var(--accent-green)' }}>
                6698 Sayılı KVKK Kapsamında Aydınlatma Metni
              </h4>
              <p style={{ marginBottom: 12 }}>
                <strong>DA/SCORE</strong> (“Portal”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca,
                ziyaretçilerimizin kişisel verilerinin güvenliğine ve gizliliğine en üst düzeyde önem vermekteyiz.
              </p>

              <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 14 }}>
                <strong style={{ display: 'block', marginBottom: 6, color: 'var(--accent-gold)' }}>1. Hangi Verileri İşliyoruz?</strong>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li><strong>İşlem Güvenliği Verileri:</strong> IP adresiniz, erişim tarihi/saati, tarayıcı ve cihaz bilgileri (5651 sayılı Kanun gereği log kayıtları).</li>
                  <li><strong>Kullanıcı Tercih Verileri:</strong> Arayüz teması (açık/koyu), gol sesi tercihi ve favoriye aldığınız takımların listesi (tamamı yalnızca kendi tarayıcınızın <em>localStorage</em> alanında yerel olarak saklanır).</li>
                  <li><strong>Pazarlama ve Analitik Çerezleri:</strong> Google AdSense reklam ağı ve Google Analytics servisleri tarafından toplanan anonimleştirilmiş kullanım bilgileri.</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 14 }}>
                <strong style={{ display: 'block', marginBottom: 6, color: 'var(--accent-gold)' }}>2. Kişisel Verilerin İşlenme Amacı ve Hukuki Sebebi</strong>
                <p style={{ margin: 0 }}>
                  Verileriniz; portalın temel işlevselliğinin sağlanması, teknik güvenliğin tesisi, kullanıcı deneyiminin kişiselleştirilmesi (favoriler ve tema)
                  ve Google AdSense mevzuatına uygun reklam gösterimi amaçlarıyla; KVKK’nın 5. maddesinde belirtilen “veri sorumlusunun meşru menfaati”
                  ve “hukuki yükümlülüğün yerine getirilmesi” hukuki sebeplerine dayalı olarak otomatik yollarla işlenmektedir.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 14 }}>
                <strong style={{ display: 'block', marginBottom: 6, color: 'var(--accent-gold)' }}>3. Verilerin Aktarımı</strong>
                <p style={{ margin: 0 }}>
                  Kişisel verileriniz hiçbir üçüncü şahsa satılmaz veya ticari amaçla kiralanmaz. Yalnızca yasal zorunluluk halinde yetkili adli/idari mercilerle
                  veya teknik altyapı sağlayıcıları (Vercel sunucusuz altyapısı ve Google reklam ağları) ile sınırlı olarak paylaşılabilir.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <strong style={{ display: 'block', marginBottom: 6, color: 'var(--accent-gold)' }}>4. KVKK 11. Madde Kapsamındaki Haklarınız</strong>
                <p style={{ margin: 0 }}>
                  Dilediğiniz zaman tarafımıza başvurarak kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
                  verilerin silinmesini veya düzeltilmesini isteme haklarına sahipsiniz. Başvurularınızı iletişim kanallarımızdan bize iletebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Yasal Uyarı & Bahis Sorumluluk Reddi (Hukuki Koruma) */}
          {activeTab === 'disclaimer' && (
            <div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--accent-red)',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-red)', fontWeight: 800, marginBottom: 6 }}>
                  <AlertTriangle size={20} />
                  <span>ÖNEMLİ YASAL UYARI & BAHİS SORUMLULUK REDDİ (7258 SAYILI KANUN)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem' }}>
                  <strong>DA/SCORE</strong>, yalnızca futbol müsabakalarına ilişkin kamuya açık skor, takvim, fikstür ve istatistiki bilgileri sunan
                  <strong> bağımsız bir canlı skor ve spor enformasyon portalıdır</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h5 style={{ fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 4 }}>1. Bahis ve Kumar Oynatılmamaktadır</h5>
                  <p>
                    Sitemizde hiçbir surette yasal veya yasadışı bahis, kumar, canlı iddaa, çekiliş veya şans oyunu <strong>oynatılmamakta</strong>,
                    bahis kuponu düzenlenmemekte, bahis oynanmasına aracılık edilmemekte veya para transferi kabul edilmemektedir.
                    Portalımız, 7258 sayılı <em>Futbol ve Diğer Spor Müsabakalarında Bahis ve Şans Oyunları Düzenlenmesi Hakkında Kanun</em> ile
                    Türk Ceza Kanunu’nun 228. maddesi hükümlerine harfiyen riayet etmektedir. Yasadışı bahse teşvik edici herhangi bir içerik kesinlikle barındırılmaz.
                  </p>
                </div>

                <div>
                  <h5 style={{ fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 4 }}>2. Skor ve Veri Doğruluğu Feragatnamesi</h5>
                  <p>
                    Portalda gösterilen canlı maç sonuçları, dakikalar, istatistikler ve puan durumları uluslararası resmi veri sağlayıcılarından
                    anlık olarak derlenmektedir. İnternet kesintileri, veri kaynağı gecikmeleri veya teknik aksaklıklardan ötürü skor bilgilerinde
                    oluşabilecek gecikme ya da olası hatalardan dolayı <strong>DA/SCORE hiçbir hukuki veya maddi sorumluluk kabul etmez</strong>.
                    Kullanıcılar verileri yalnızca bilgilendirme amaçlı izlemeyi taahhüt eder.
                  </p>
                </div>

                <div>
                  <h5 style={{ fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 4 }}>3. Fikri Mülkiyet ve Marka / Logo Hakları (Adil Kullanım)</h5>
                  <p>
                    Sitede yer alan kulüp logoları, takım armaları, lig isimleri ve amblemleri ilgili kulüplerin ve federasyonların tescilli mülkiyetindedir.
                    Sitemizdeki gösterimleri yalnızca ilgili spor kulübünü ve müsabakayı kamuoyuna doğru tanıtmak amacıyla
                    <strong> adil kullanım (fair use) ve enformasyon prensipleri</strong> dahilinde kullanılmaktadır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Çerez Politikası */}
          {activeTab === 'cookies' && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12, color: 'var(--accent-green)' }}>
                Çerez (Cookie) ve Yerel Depolama Politikası
              </h4>
              <p style={{ marginBottom: 12 }}>
                DA/SCORE olarak, web sitemizin düzgün çalışmasını sağlamak, tercihlerinizi hatırlamak ve reklam ağları ile etkileşimde bulunmak amacıyla
                çerezler (cookies) ve HTML5 LocalStorage teknolojilerinden faydalanmaktayız.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--accent-green)' }}>Zorunlu ve Fonksiyonel Yerel Veriler:</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    Sitemizde seçtiğiniz renk teması (Karanlık, Açık, Mavi, AMOLED vb.), gol sesi tercihi, favori takım listesi ve çerez onayınız
                    tarayıcınızın yerel depolama (LocalStorage) alanında tutulur. Bu bilgiler sunucularımızda saklanmaz veya kimliğinizle eşleştirilmez.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--accent-gold)' }}>Google AdSense ve Üçüncü Taraf Reklam Çerezleri:</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    Sitemizde Google AdSense reklam teknolojisi kullanılmaktadır. Google, iş ortakları ve üçüncü taraf satıcılar; sitemize veya diğer internet
                    sitelerine yaptığınız önceki ziyaretlere dayalı olarak reklam sunmak için çerezlerden faydalanabilir.
                    Google reklam çerezlerini dilediğiniz zaman <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', textDecoration: 'underline' }}>Google Reklam Ayarları</a> sayfasından kişiselleştirilmiş reklamları kapatabilirsiniz.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Çerezleri Nasıl Yönetebilirsiniz?</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    Tarayıcınızın (Chrome, Safari, Firefox, Edge vb.) ayarlarından çerezleri dilediğiniz zaman silebilir veya tüm çerezleri engelleyebilirsiniz.
                    Ancak çerezleri devre dışı bırakmanız halinde ses ayarları ve tema tercihlerinizin her ziyarette sıfırlanabileceğini hatırlatırız.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Kullanım Koşulları & Künye */}
          {activeTab === 'terms' && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12, color: 'var(--accent-green)' }}>
                Kullanım Koşulları & Künye
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h5 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>1. Hizmetin Niteliği</h5>
                  <p>
                    DA/SCORE platformunu ziyaret eden her kullanıcı bu sayfadaki tüm koşulları kabul etmiş sayılır.
                    Hizmetimiz tamamen ücretsizdir ve futbolseverlere hızlı, kesintisiz skor takibi sağlamak üzere tasarlanmıştır.
                  </p>
                </div>

                <div>
                  <h5 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>2. Yasaklı Eylemler</h5>
                  <p>
                    Sitenin altyapısına zarar verebilecek otomatik botlar (DDoS, scraping, tersine mühendislik) kullanmak,
                    API endpoints üzerinde kötü niyetli sorgular çalıştırmak ve site içeriğini izinsiz kopyalamak yasaktır.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <h5 style={{ fontWeight: 800, color: 'var(--accent-green)', marginBottom: 8 }}>Künye & Yasal İletişim</h5>
                  <p style={{ margin: '2px 0' }}><strong>Platform:</strong> DA/SCORE Canlı Skor & Futbol Enformasyon Ağı</p>
                  <p style={{ margin: '2px 0' }}><strong>Yayın Amacı:</strong> Spor İstatistikleri & Fikstür Bilgilendirme</p>
                  <p style={{ margin: '2px 0' }}><strong>Resmi Sosyal Medya:</strong> <a href="https://www.instagram.com/dasporfutbolhaberleri/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)' }}>@dasporfutbolhaberleri</a></p>
                  <p style={{ margin: '2px 0' }}><strong>Telif ve Yasal Bildirim:</strong> İhlal veya KVKK bildirimleriniz için resmi Instagram kanalımız üzerinden derhal iletişime geçebilirsiniz. İlgili içerikler en geç 48 saat içinde incelenerek gereği yapılır.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <span>Yürürlük Tarihi: 2026 · Son Güncelleme: Kasım 2026</span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--accent-green)',
              color: '#000000',
              fontWeight: 800,
              border: 'none',
              padding: '6px 18px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Anladım & Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
