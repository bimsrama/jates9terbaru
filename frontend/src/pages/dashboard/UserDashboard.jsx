import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  BookOpen, CheckCircle, FileText, Menu, Home, LogOut, Settings, 
  User, Award, Bell, Lightbulb, Download, Bot, Medal 
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
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]); 
  const [chatLoading, setChatLoading] = useState(false);
  
  const chatEndRef = useRef(null);
  const chatSectionRef = useRef(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
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
  }, [chatHistory]);

  const fetchData = async () => {
    try {
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);
      
      const tip = generateDailyTip(overviewRes.data.user?.group || 'Sehat');
      setChatHistory([
        { role: "system_tip", content: tip },
        { role: "assistant", content: "Halo! Saya Dokter AI Jates9. Ada yang bisa saya bantu terkait kesehatan Anda hari ini?" }
      ]);

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
      'A': "💡 Info Tipe A (Sembelit): Fokus perbanyak air hangat 2 gelas saat bangun tidur dan konsumsi serat tinggi hari ini.",
      'B': "💡 Info Tipe B (Kembung): Hindari makanan bersantan dan pedas hari ini. Jaga pola makan teratur.",
      'C': "💡 Info Tipe C (GERD): Jangan terlambat makan siang. Hindari kopi dan teh pekat agar asam lambung aman.",
      'Sehat': "💡 Info Sehat: Kondisi stabil. Pertahankan dengan olahraga ringan 15 menit dan tidur cukup."
    };
    const selectedTip = tips[group] || tips['Sehat'];
    setDailyTip(selectedTip);
    return selectedTip;
  };

  // --- ACTIONS ---
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hide_tutorial', 'true'); 
  };

  const handleScrollToChat = () => {
    setSidebarOpen(false); 
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      setChatHistory(prev => [...prev, { role: "assistant", content: "Maaf, koneksi terganggu. Silakan coba lagi." }]);
    } finally { setChatLoading(false); }
  };

  // --- LOGIC SERTIFIKAT ---
  const getCertificateStatus = () => {
    const days = overview?.financial?.total_checkins || 0;
    if (days >= 30) return { eligible: true, type: "Gold", days: 30 };
    if (days >= 25) return { eligible: true, type: "Silver", days: 25 };
    if (days >= 20) return { eligible: true, type: "Bronze", days: 20 };
    return { eligible: false, type: "", days: 0 };
  };
  const certStatus = getCertificateStatus();

  const handleDownloadCert = () => {
    alert("Selamat! Sertifikat sedang diunduh (Simulasi).");
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    // FULL CANVAS OVERLAY
    <div style={{ 
      display: 'flex', background: '#f8fafc', width: '100vw', height: '100vh', 
      position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' 
    }}>
      
      {/* OVERLAY MOBILE SIDEBAR */}
      {!isDesktop && isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>
      )}

      {/* --- SIDEBAR (DESKTOP & MOBILE MENU) --- */}
      <aside style={{
        width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh',
        position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 50,
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
            <li><button className="nav-item" style={navItemStyle(false)} onClick={handleScrollToChat}><MessageCircle size={20} /> Dokter AI</button></li>
            <li><button className="nav-item" style={navItemStyle(false)}><Settings size={20} /> Pengaturan</button></li>
          </ul>
        </nav>
        {/* LOGOUT DI SIDEBAR (UTAMA UNTUK DESKTOP) */}
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ ...navItemStyle(false), color: '#ef4444', justifyContent: 'flex-start' }}>
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        
        {/* MOBILE HEADER (WITH LOGOUT BUTTON) */}
        {!isDesktop && (
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#334155' }}><Menu size={24} /></button>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>JATES9</span>
            </div>
            {/* LOGOUT BUTTON DI HEADER MOBILE */}
            <button onClick={logout} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <LogOut size={18} /> Keluar
            </button>
          </header>
        )}

        <main style={{ padding: '2rem', flex: 1 }}>
          
          {/* HEADER DASHBOARD */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              Halo, <strong>{overview?.user?.name}</strong>! Semangat hari ke-{overview?.challenge?.current_day}.
            </p>
          </div>

          {/* --- SERTIFIKAT KELULUSAN --- */}
          {certStatus.eligible && (
            <Card style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', border: 'none', marginBottom: '2rem', color: '#7c2d12' }}>
              <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '0.8rem', borderRadius: '50%' }}><Award size={32} color="#FDB931" /></div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Selamat! Anda Lulus Tantangan {certStatus.days} Hari</h3>
                    <p style={{ fontSize: '0.9rem' }}>Konsistensi Anda luar biasa. Klaim sertifikat {certStatus.type} Anda sekarang.</p>
                  </div>
                </div>
                <button onClick={handleDownloadCert} style={{ background: 'white', color: '#7c2d12', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <Download size={18} /> Download Sertifikat
                </button>
              </CardContent>
            </Card>
          )}

          {/* --- GRID PROFILE & CHAT --- */}
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem', minHeight: isDesktop ? '500px' : 'auto' }}>
            
            {/* KOLOM KIRI: Profil & Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card style={{ background: 'white', border: 'none', backgroundImage: 'var(--gradient-hero)' }}>
                <CardContent style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <User size={35} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <h2 className="heading-2" style={{ marginBottom: '0.25rem' }}>{overview?.user?.name}</h2>
                    
                    {/* BADGE DAN INFO USER */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Badge Gelar */}
                      <span style={{ 
                        background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', 
                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '0.3rem' 
                      }}>
                        <Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}
                      </span>

                      <span style={{ background: '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
                        Tipe {overview?.user?.group || '-'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.5rem', fontWeight: '600' }}>
                      Kode Referral: <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: '4px' }}>{overview?.user?.referral_code}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Card style={{ textAlign: 'center', padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}>
                   <div style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} color="#2563eb" /></div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{overview?.financial?.total_checkins || 0}x</h3>
                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Check-in</p>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}>
                   <div style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="#16a34a" /></div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{overview?.financial?.total_referrals || 0}</h3>
                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Referral</p>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}>
                   <div style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wallet size={20} color="#ea580c" /></div>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(overview?.financial?.commission_approved || 0) / 1000}k</h3>
                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Komisi</p>
                </Card>
              </div>
            </div>

            {/* KOLOM KANAN: DOKTER AI */}
            <Card ref={chatSectionRef} style={{ background: 'white', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: isDesktop ? '100%' : '500px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc' }}>
                <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={24} color="#16a34a" /></div>
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>Dokter AI Jates9</h3>
                  <p style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%' }}></span> Online</p>
                </div>
              </div>
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatHistory.map((msg, idx) => (
                  <div key={idx} style={msg.role === 'system_tip' ? { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.8rem', fontSize: '0.9rem', color: '#1e40af', display: 'flex', gap: '0.5rem' } : { alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--primary)' : '#f1f5f9', color: msg.role === 'user' ? 'white' : '#334155', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {msg.role === 'system_tip' ? <><Lightbulb size={20} style={{ flexShrink: 0 }} /><div>{msg.content}</div></> : msg.content}
                  </div>
                ))}
                {chatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Dokter sedang mengetik...</div>}
                <div ref={chatEndRef}></div>
              </div>
              <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Tanya keluhan kesehatan..." style={{ flex: 1, padding: '0.75rem', borderRadius: '25px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' }} />
                <button type="submit" disabled={chatLoading} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}><Send size={20} /></button>
              </form>
            </Card>
          </div>

          {/* --- TUTORIAL --- */}
          {showTutorial && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={20} /> Langkah Sukses</h3>
                <button onClick={handleCloseTutorial} style={{ fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Tutup Panduan <X size={16} /></button>
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
                <Card style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={handleScrollToChat}>
                  <CardContent style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#fff7ed', padding: '0.8rem', borderRadius: '12px', color: '#ea580c' }}><MessageCircle size={24}/></div>
                    <div><div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>3. Konsultasi AI</div><p className="body-small" style={{ color: '#64748b' }}>Gunakan chat di atas.</p></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* --- CHALLENGE & ARTIKEL --- */}
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr', gap: '2rem' }}>
            <div>
              <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={20} /> Tantangan Lainnya</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {challenges.filter(c => c.id !== overview?.user?.challenge_id).map((c) => (
                  <Card key={c.id} style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                    <CardContent style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div><h4 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{c.title}</h4><p style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.description}</p></div>
                      <button onClick={() => handleSwitchChallenge(c.id)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Ikuti</button>
                    </CardContent>
                  </Card>
                ))}
                {challenges.filter(c => c.id !== overview?.user?.challenge_id).length === 0 && <p className="body-small" style={{ color: '#94a3b8' }}>Tidak ada tantangan lain saat ini.</p>}
              </div>
            </div>
            <div>
              <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Artikel Kesehatan</h3>
              <Card style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                    <div><h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Makanan Pereda Asam Lambung</h4><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 3 menit</span></div>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                    <div><h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Yoga untuk Pencernaan</h4><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 5 menit</span></div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
};

const navItemStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: isActive ? 'var(--accent-wash)' : 'transparent', color: isActive ? 'var(--primary)' : '#475569', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: isActive ? '600' : '400', marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.2s'
});

export default UserDashboard;
