import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  BookOpen, CheckCircle, FileText, Menu, Home, LogOut, Settings, 
  User, Award, ArrowRightCircle, Bell, Lightbulb, ThumbsUp 
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- STATE UI ---
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [showTutorial, setShowTutorial] = useState(true);
  const [dailyTip, setDailyTip] = useState("");

  // --- STATE CHAT AI ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Halo! Saya Dokter AI Jates9. Ada keluhan kesehatan hari ini?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    // Cek preferensi tutorial user
    const isTutorialHidden = localStorage.getItem('hide_tutorial');
    if (isTutorialHidden) setShowTutorial(false);

    const handleResize = () => {
        const desktop = window.innerWidth > 1024;
        setIsDesktop(desktop);
        if(desktop) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    
    fetchData();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen]);

  const fetchData = async () => {
    try {
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);
      
      generateDailyTip(overviewRes.data.user?.group || 'Sehat');

      const challengeRes = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(challengeRes.data);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTip = (group) => {
    const tips = {
      'A': "Tipe A (Sembelit): Fokus perbanyak air hangat 2 gelas saat bangun tidur dan konsumsi serat tinggi hari ini.",
      'B': "Tipe B (Kembung): Hindari makanan bersantan dan pedas hari ini. Jaga pola makan teratur.",
      'C': "Tipe C (GERD): Jangan terlambat makan siang. Hindari kopi dan teh pekat agar asam lambung aman.",
      'Sehat': "Kondisi stabil. Pertahankan dengan olahraga ringan 15 menit dan tidur cukup."
    };
    setDailyTip(tips[group] || tips['Sehat']);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hide_tutorial', 'true'); 
  };

  const handleSwitchChallenge = async (challengeId) => {
    if(!window.confirm("Pindah tantangan akan mereset progress kuis. Lanjut?")) return;
    try {
      await axios.post(`${BACKEND_URL}/api/user/select-challenge`, { challenge_id: challengeId }, { headers: getAuthHeader() });
      window.location.href = '/quiz'; 
    } catch (error) { alert("Gagal."); }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setChatMessage("");
    setChatLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/chat/send`, { message: userMsg }, { headers: getAuthHeader() });
      setChatHistory(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Maaf, koneksi terganggu." }]);
    } finally { setChatLoading(false); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    // [FIX UTAMA] Container Full Screen Fixed agar menutupi Header Bawaan
    <div style={{ 
      display: 'flex', 
      background: '#f8fafc', 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed', // Kunci posisi agar menutupi elemen lain
      top: 0, 
      left: 0, 
      zIndex: 9999, // Pastikan di atas segalanya
      overflow: 'hidden' // Scroll diurus oleh children
    }}>
      
      {/* OVERLAY MOBILE */}
      {!isDesktop && isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside style={{
        width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh',
        position: isDesktop ? 'relative' : 'fixed', // Di desktop relative agar tidak melayang aneh
        top: 0, left: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease',
        transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', flexShrink: 0
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>JATES9</h2><p style={{ fontSize: '0.8rem', color: '#64748b' }}>Member Area</p></div>
          {!isDesktop && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>}
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className="nav-item active" style={navItemStyle(true)}><Home size={20} /> Dashboard</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => window.location.href='/dashboard/checkin'}><Activity size={20} /> Check-in Harian</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => window.location.href='/dashboard/health-report'}><FileText size={20} /> Rapor Kesehatan</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => { setSidebarOpen(false); setIsChatOpen(true); }}><MessageCircle size={20} /> Dokter AI</button></li>
            <li><button className="nav-item" style={navItemStyle(false)}><Settings size={20} /> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ ...navItemStyle(false), color: '#ef4444' }}><LogOut size={20} /> Keluar</button>
        </div>
      </aside>

      {/* --- CONTENT AREA (SCROLLABLE) --- */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0,
        height: '100vh', // Full height
        overflowY: 'auto' // Scroll terjadi di sini
      }}>
        
        {/* MOBILE HEADER */}
        {!isDesktop && (
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#334155' }}><Menu size={24} /></button>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>JATES9</span>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#64748b' }}><Bell size={24} /></button>
          </header>
        )}

        <main style={{ padding: '2rem', flex: 1 }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              Halo, <strong>{overview?.user?.name}</strong>! Semangat hari ke-{overview?.challenge?.current_day}.
            </p>
          </div>

          {/* --- 1. PROFILE & DAILY TIP --- */}
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Profile Card */}
            <Card style={{ background: 'white', border: 'none', backgroundImage: 'var(--gradient-hero)' }}>
              <CardContent style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={35} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h2 className="heading-2" style={{ marginBottom: '0.25rem' }}>{overview?.user?.name}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ background: '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
                      Tipe {overview?.user?.group || '-'}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.6)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                      Kode: {overview?.user?.referral_code}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily AI Recommendation Card */}
            <Card style={{ background: '#818cf8', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
              <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                  <Lightbulb size={20} color="#fef08a" />
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>SARAN DOKTER AI HARI INI</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '500', lineHeight: '1.5' }}>
                  "{dailyTip}"
                </p>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                  <MessageCircle size={120} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- 2. TUTORIAL (BISA DICLOSE) --- */}
          {showTutorial && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={20} /> Panduan Program
                </h3>
                <button onClick={handleCloseTutorial} style={{ fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Tutup Panduan <X size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <Card style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => window.location.href='/dashboard/checkin'}>
                  <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', padding: '0.8rem', borderRadius: '12px', color: '#059669' }}><CheckCircle size={24}/></div>
                    <div><div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>1. Check-in Harian</div><p className="body-small" style={{ color: '#64748b' }}>Isi jurnal pagi & malam.</p></div>
                  </CardContent>
                </Card>
                <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                  <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#eff6ff', padding: '0.8rem', borderRadius: '12px', color: '#2563eb' }}><Activity size={24}/></div>
                    <div><div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>2. Minum Jates9</div><p className="body-small" style={{ color: '#64748b' }}>Rutin sebelum makan.</p></div>
                  </CardContent>
                </Card>
                <Card style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setIsChatOpen(true)}>
                  <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#fff7ed', padding: '0.8rem', borderRadius: '12px', color: '#ea580c' }}><MessageCircle size={24}/></div>
                    <div><div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>3. Konsultasi AI</div><p className="body-small" style={{ color: '#64748b' }}>Tanya jika ada keluhan.</p></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* --- 3. STATISTIK REAL --- */}
          <div className="ai-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Card className="product-card">
              <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
                </div>
                {/* DATA REAL CHECKIN */}
                <h3 className="heading-3">{overview?.financial?.total_checkins || 0}x</h3>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Tantangan Selesai</p>
              </CardContent>
            </Card>
            <Card className="product-card">
              <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h3 className="heading-3">{overview?.financial?.total_referrals || 0}</h3>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Teman Diajak</p>
              </CardContent>
            </Card>
            <Card className="product-card">
              <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto 1rem', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h3 className="heading-3">Rp {(overview?.financial?.commission_approved || 0).toLocaleString('id-ID')}</h3>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi Cair</p>
              </CardContent>
            </Card>
          </div>

          {/* --- 4. REKOMENDASI CHALLENGE & ARTIKEL --- */}
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr', gap: '2rem' }}>
            {/* Challenge Lain */}
            <div>
              <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} /> Tantangan Lainnya
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {challenges.filter(c => c.id !== overview?.user?.challenge_id).map((c) => (
                  <Card key={c.id} style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                    <CardContent style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{c.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.description}</p>
                      </div>
                      <button onClick={() => handleSwitchChallenge(c.id)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Ikuti
                      </button>
                    </CardContent>
                  </Card>
                ))}
                {challenges.filter(c => c.id !== overview?.user?.challenge_id).length === 0 && (
                  <p className="body-small" style={{ color: '#94a3b8' }}>Tidak ada tantangan lain saat ini.</p>
                )}
              </div>
            </div>

            {/* Artikel Mini */}
            <div>
              <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Artikel Kesehatan</h3>
              <Card style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Makanan Pereda Asam Lambung</h4>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 3 menit</span>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Yoga untuk Pencernaan</h4>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 5 menit</span>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

        </main>
      </div>

      {/* --- MODAL CHAT DOKTER AI --- */}
      {isChatOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <Card style={{ width: '100%', maxWidth: '450px', height: '600px', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>Dokter AI Jates9</div>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--primary)' : 'white', color: msg.role === 'user' ? 'white' : '#334155', padding: '0.8rem', borderRadius: '12px', maxWidth: '80%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.9rem' }}>{msg.content}</div>
              ))}
              {chatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem' }}>Sedang mengetik...</div>}
              <div ref={chatEndRef}></div>
            </div>
            <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', background: 'white', borderRadius: '0 0 8px 8px' }}>
              <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Tulis keluhan kesehatan..." style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              <button type="submit" disabled={chatLoading} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={20} /></button>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};

const navItemStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: isActive ? 'var(--accent-wash)' : 'transparent', color: isActive ? 'var(--primary)' : '#475569', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: isActive ? '600' : '400', marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.2s'
});

export default UserDashboard;
