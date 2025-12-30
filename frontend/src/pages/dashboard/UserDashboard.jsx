import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  BookOpen, CheckCircle, FileText, Menu, Home, LogOut, Settings, 
  User, Award, ArrowRightCircle 
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]); // List challenge lain
  const [loading, setLoading] = useState(true);
  
  // --- STATE LAYOUT ---
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  // --- STATE CHAT AI ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Halo! Saya Dokter AI Jates9. Ada yang bisa saya bantu terkait program kesehatan Anda?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    
    fetchData();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen]);

  const fetchData = async () => {
    try {
      // 1. Ambil Overview User
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);

      // 2. Ambil Daftar Challenge (Untuk Rekomendasi)
      const challengeRes = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(challengeRes.data);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC GANTI CHALLENGE ---
  const handleSwitchChallenge = async (challengeId) => {
    const confirmSwitch = window.confirm("Apakah Anda yakin ingin mengikuti tantangan ini? Anda akan diarahkan ke kuis kesehatan baru.");
    if (!confirmSwitch) return;

    try {
      // Set Challenge ID baru
      await axios.post(
        `${BACKEND_URL}/api/user/select-challenge`, 
        { challenge_id: challengeId },
        { headers: getAuthHeader() }
      );
      
      // Arahkan ke Quiz untuk isi assessment challenge baru
      window.location.href = '/quiz'; 

    } catch (error) {
      alert("Gagal memilih challenge.");
    }
  };

  // --- LOGIC CHAT AI ---
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chat/send`,
        { message: userMsg },
        { headers: getAuthHeader() }
      );
      setChatHistory(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Maaf, koneksi terganggu." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
      
      {/* --- SIDEBAR (Fixed Mobile / Static Desktop) --- */}
      {/* Overlay Mobile */}
      {!isDesktop && isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>
      )}

      <aside style={{
        width: '260px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
        position: isDesktop ? 'sticky' : 'fixed', // Sticky biar diam saat scroll di desktop
        top: 0, left: 0,
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.3s ease',
        transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
        flexShrink: 0 // Mencegah sidebar mengecil
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>JATES9</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Member Area</p>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className="nav-item active" style={navItemStyle(true)}><Home size={20} /> Dashboard</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => window.location.href='/dashboard/checkin'}><Activity size={20} /> Check-in Harian</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => window.location.href='/dashboard/health-report'}><FileText size={20} /> Rapor Kesehatan</button></li>
            {/* Tombol Chat di Sidebar (Opsional) */}
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => setIsChatOpen(true)}><MessageCircle size={20} /> Dokter AI</button></li>
            <li><button className="nav-item" style={navItemStyle(false)}><Settings size={20} /> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ ...navItemStyle(false), color: '#ef4444' }}>
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Toggle Mobile Menu */}
        {!isDesktop && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Menu size={24} />
            </button>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>JATES9</span>
          </div>
        )}

        {/* --- SECTION 1: PROFILE CARD --- */}
        <Card style={{ background: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '2rem', backgroundImage: 'var(--gradient-hero)' }}>
          <CardContent style={{ padding: '2rem', display: 'flex', flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <User size={40} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ textAlign: isDesktop ? 'left' : 'center', flex: 1 }}>
              <h2 className="heading-2" style={{ marginBottom: '0.25rem' }}>{overview?.user?.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: isDesktop ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.6)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                  📞 {overview?.user?.phone}
                </span>
                <span style={{ background: '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', border: '1px solid #86efac' }}>
                  Kategori: Tipe {overview?.user?.group || '-'}
                </span>
              </div>
            </div>
            {/* Referral Info Mini */}
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>KODE REFERRAL</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--primary)' }}>{overview?.user?.referral_code}</p>
            </div>
          </CardContent>
        </Card>

        {/* --- SECTION 2: TUTORIAL (Panduan) --- */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} /> Panduan Program
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Card style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => window.location.href='/dashboard/checkin'}>
              <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: '#ecfdf5', padding: '0.8rem', borderRadius: '12px', color: '#059669' }}><CheckCircle size={24}/></div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#0f172a' }}>1. Check-in Harian</div>
                  <p className="body-small" style={{ color: '#64748b' }}>Isi jurnal harian untuk pantau progress.</p>
                </div>
              </CardContent>
            </Card>
            <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: '#eff6ff', padding: '0.8rem', borderRadius: '12px', color: '#2563eb' }}><Activity size={24}/></div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#0f172a' }}>2. Konsumsi Produk</div>
                  <p className="body-small" style={{ color: '#64748b' }}>Minum Jates9 pagi & malam rutin.</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}
              onClick={() => setIsChatOpen(true)}
            >
              <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: '#fff7ed', padding: '0.8rem', borderRadius: '12px', color: '#ea580c' }}><MessageCircle size={24}/></div>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#0f172a' }}>3. Konsultasi AI</div>
                  <p className="body-small" style={{ color: '#64748b' }}>Tanya Dokter AI jika ada keluhan.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- SECTION 3: STATISTIK --- */}
        <div className="ai-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Card className="product-card">
            <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 className="heading-3">{overview?.challenge?.current_day || 1}</h3>
              <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Hari Challenge</p>
            </CardContent>
          </Card>
          <Card className="product-card">
            <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 className="heading-3">{overview?.financial?.total_referrals || 0}</h3>
              <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Referral</p>
            </CardContent>
          </Card>
          <Card className="product-card">
            <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 className="heading-3">Rp {(overview?.financial?.commission_approved || 0).toLocaleString('id-ID')}</h3>
              <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi</p>
            </CardContent>
          </Card>
        </div>

        {/* --- SECTION 4: REKOMENDASI CHALLENGE LAIN --- */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} /> Tantangan Lainnya
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {challenges
              .filter(c => c.id !== overview?.user?.challenge_id) // Filter yang sedang diikuti
              .map((c) => (
              <Card key={c.id} style={{ background: 'white', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <CardContent style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{c.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{c.description}</p>
                  </div>
                  <button 
                    onClick={() => handleSwitchChallenge(c.id)}
                    style={{ 
                      marginTop: 'auto', width: '100%', padding: '0.75rem', 
                      background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)',
                      borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    Ikuti Tantangan Ini <ArrowRightCircle size={18} />
                  </button>
                </CardContent>
              </Card>
            ))}
            {challenges.filter(c => c.id !== overview?.user?.challenge_id).length === 0 && (
              <p className="body-small" style={{ color: '#94a3b8' }}>Tidak ada tantangan lain saat ini.</p>
            )}
          </div>
        </div>

        {/* --- SECTION 5: HEALTH REPORT & ARTIKEL --- */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          {/* Health Report Card */}
          <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardHeader>
              <CardTitle className="heading-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Evaluasi Kesehatan</span>
                <button onClick={() => window.location.href='/dashboard/health-report'} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Lihat Detail</button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #dcfce7', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#166534', fontWeight: 'bold' }}>
                  <Activity size={18} /> Kondisi: Tipe {overview?.user?.group || '-'}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#15803d', marginTop: '0.5rem' }}>
                  Berdasarkan evaluasi kuis terakhir, program Anda disesuaikan untuk tipe ini. Pantau terus perubahan harian.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Artikel Kesehatan */}
          <Card style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardHeader>
              <CardTitle className="heading-3">Artikel Untuk Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ width: '60px', height: '60px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>5 Makanan Pereda Asam Lambung</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 3 menit</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ width: '60px', height: '60px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>Gerakan Yoga untuk Pencernaan</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 5 menit</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </main>

      {/* --- MODAL CHAT DOKTER AI --- */}
      {isChatOpen && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 100, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <Card style={{ width: '100%', maxWidth: '450px', height: '600px', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                Dokter AI Jates9
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--primary)' : 'white',
                  color: msg.role === 'user' ? 'white' : '#334155',
                  padding: '0.8rem', borderRadius: '12px', maxWidth: '80%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem'
                }}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem' }}>Sedang mengetik...</div>}
              <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', background: 'white', borderRadius: '0 0 8px 8px' }}>
              <input 
                type="text" 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)} 
                placeholder="Tulis keluhan kesehatan..." 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
              <button type="submit" disabled={chatLoading} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={20} />
              </button>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};

// Style Helper
const navItemStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  width: '100%', padding: '0.75rem 1rem',
  background: isActive ? 'var(--accent-wash)' : 'transparent',
  color: isActive ? 'var(--primary)' : '#475569',
  borderRadius: '8px', border: 'none', cursor: 'pointer',
  fontSize: '0.95rem', fontWeight: isActive ? '600' : '400',
  marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.2s'
});

export default UserDashboard;
