import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  Home, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, Search, 
  Package, ShoppingBag, ChevronLeft, Lightbulb, Clock, AlertCircle, CheckCircle, Calendar, RefreshCw, FileText,
  Moon, Sun, Shield, Smartphone, Check
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- KONFIGURASI TEMA WARNA ---
const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#8fec78', light: '#dcfce7', text: '#166534', gradient: 'linear-gradient(135deg, #ffffff 0%, #8fec78 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #14532d 100%)' },
  red: { id: 'red', name: 'Merah Berani', primary: '#fca5a5', light: '#fee2e2', text: '#991b1b', gradient: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' },
  gold: { id: 'gold', name: 'Emas Mewah', primary: '#fcd34d', light: '#fef3c7', text: '#b45309', gradient: 'linear-gradient(135deg, #ffffff 0%, #fcd34d 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #78350f 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#93c5fd', light: '#dbeafe', text: '#1e40af', gradient: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' },
  purple: { id: 'purple', name: 'Ungu Misteri', primary: '#d8b4fe', light: '#f3e8ff', text: '#6b21a8', gradient: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #581c87 100%)' },
};

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate(); 
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [myFriends, setMyFriends] = useState([]);
  const [articles, setArticles] = useState([]); 
  
  // --- STATE DAILY CONTENT & CHECKIN ---
  const [dailyData, setDailyData] = useState(null);
  const [journal, setJournal] = useState("");
  const [checkinStatus, setCheckinStatus] = useState(null); 
  const [countdown, setCountdown] = useState(null);
  const [quote, setQuote] = useState("Sehat itu investasi, bukan pengeluaran.");

  // --- STATE UI & NAVIGATION ---
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Theme & Dark Mode
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark'); 
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  
  const currentTheme = THEMES[themeColor] || THEMES['green'];

  // --- STATE FEATURES ---
  const [showQRModal, setShowQRModal] = useState(false); 
  const [friendCode, setFriendCode] = useState(""); 
  const [friendData, setFriendData] = useState(null); 
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); 
  const [installPrompt, setInstallPrompt] = useState(null); 

  // --- STATE CHAT AI ---
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]); 
  const [chatLoading, setChatLoading] = useState(false);
  
  const chatEndRef = useRef(null);
  const chatSectionRef = useRef(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const handleResize = () => {
        const desktop = window.innerWidth > 1024;
        setIsDesktop(desktop);
        if(desktop) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setInstallPrompt(e); });

    // Apply Dark Mode Class
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    fetchData();
    fetchDailyContent();
    fetchArticles(); 
    setQuote(getRandomQuote());
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { if (activeTab === 'friends') fetchFriendsList(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  // --- HANDLERS ---
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const changeThemeColor = (colorKey) => {
    setThemeColor(colorKey);
    localStorage.setItem('colorTheme', colorKey);
  };

  const handleInstallApp = async () => {
    if (!installPrompt) {
      alert("Aplikasi mungkin sudah terinstall atau browser tidak mendukung fitur ini. Coba buka menu browser -> 'Tambahkan ke Layar Utama'.");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  // --- COUNTDOWN TIMER ---
  useEffect(() => {
    let timer;
    if (checkinStatus === 'pending') {
      timer = setInterval(() => {
        const now = new Date();
        const target = new Date();
        target.setHours(19, 0, 0, 0); 
        if (now > target) { setCountdown("Waktu Habis"); clearInterval(timer); } 
        else {
          const diff = target - now;
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          setCountdown(`${hours}j ${minutes}m`);
        }
      }, 1000);
    } else { setCountdown(null); }
    return () => clearInterval(timer);
  }, [checkinStatus]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);
      const tip = generateDailyTip(overviewRes.data.user?.group || 'Sehat');
      setChatHistory([{ role: "system_tip", content: tip }, { role: "assistant", content: "Halo! Saya Dokter AI Jates9. Ada yang bisa saya bantu?" }]);
      const challengeRes = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(challengeRes.data);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const fetchArticles = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/articles`); setArticles(res.data); } catch (error) {} };
  const fetchDailyContent = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/daily-content`, { headers: getAuthHeader() }); setDailyData(res.data); if (res.data.today_status) setCheckinStatus(res.data.today_status); else setCheckinStatus(null); } catch (err) {} };
  const fetchFriendsList = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() }); setMyFriends(res.data.friends); } catch (err) {} };

  const getRandomQuote = () => {
    const quotes = ["Kesehatan adalah kekayaan sejati.", "Satu langkah kecil hari ini, dampak besar di masa depan.", "Tubuhmu adalah satu-satunya tempatmu tinggal.", "Konsistensi mengalahkan intensitas."];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const handleRefresh = async () => { setIsRefreshing(true); await Promise.all([fetchData(), fetchDailyContent(), fetchArticles()]); setQuote(getRandomQuote()); setIsRefreshing(false); };
  
  const generateDailyTip = (group) => {
    const tips = { 'A': "💡 Tipe A (Sembelit): Perbanyak air hangat & serat.", 'B': "💡 Tipe B (Kembung): Hindari santan & pedas.", 'C': "💡 Tipe C (GERD): Jaga jam makan.", 'Sehat': "💡 Info Sehat: Olahraga ringan & tidur cukup." };
    return tips[group] || tips['Sehat'];
  };

  const handleScrollToChat = () => { setActiveTab('dashboard'); setSidebarOpen(false); setTimeout(() => { chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); };

  const handleSendChat = async (e) => {
    e.preventDefault(); if (!chatMessage.trim()) return;
    const userMsg = chatMessage; setChatHistory(prev => [...prev, { role: "user", content: userMsg }]); setChatMessage(""); setChatLoading(true);
    try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, { message: userMsg }, { headers: getAuthHeader() }); setChatHistory(prev => [...prev, { role: "assistant", content: res.data.response }]); } catch (err) { setChatHistory(prev => [...prev, { role: "assistant", content: "Maaf, koneksi terganggu." }]); } finally { setChatLoading(false); }
  };

  const copyReferral = () => { navigator.clipboard.writeText(overview?.user?.referral_code || ""); alert("Kode Referral disalin!"); };

  const handleSubmitCheckin = async (forcedStatus) => {
      if (isSubmitting) return; setIsSubmitting(true);
      try {
          const res = await axios.post(`${BACKEND_URL}/api/checkin`, { journal, status: forcedStatus }, { headers: getAuthHeader() });
          if (res.data.success) { setCheckinStatus(forcedStatus); if(forcedStatus === 'completed') { alert("✅ Selesai! Hebat."); fetchData(); } else { alert("🕒 Status Pending."); } }
      } catch (err) { alert(err.response?.data?.message || "Gagal check-in."); } finally { setIsSubmitting(false); }
  };

  const handleSwitchChallenge = async (chId) => {
      if(!window.confirm("Pindah challenge? Progress reset.")) return;
      try { await axios.post(`${BACKEND_URL}/api/user/select-challenge`, { challenge_id: chId }, { headers: getAuthHeader() }); alert("Berhasil!"); window.location.reload(); } catch (e) { alert("Gagal."); }
  };

  const handleSearchFriend = async () => {
    if(!friendCode.trim()) return alert("Masukkan kode!"); setSearchLoading(true); setFriendData(null);
    try { const res = await axios.post(`${BACKEND_URL}/api/friends/lookup`, { referral_code: friendCode.toUpperCase() }, { headers: getAuthHeader() }); setFriendData(res.data.friend); } catch (err) { alert("Teman tidak ditemukan."); } finally { setSearchLoading(false); }
  };

  const handleClickFriendFromList = async (code) => { setFriendCode(code); setSearchLoading(true); setShowQRModal(false); try { const res = await axios.post(`${BACKEND_URL}/api/friends/lookup`, { referral_code: code }, { headers: getAuthHeader() }); setFriendData(res.data.friend); setShowFriendProfile(true); } catch (err) { alert("Gagal memuat profil."); } finally { setSearchLoading(false); } };

  const handleOpenFriendProfile = () => { if(friendData) { setShowQRModal(false); setShowFriendProfile(true); } };
  const handleArticleClick = (articleId) => { navigate(`/article/${articleId}`); };

  const currentChallenge = challenges.find(c => c.id === overview?.user?.challenge_id) || { title: "Belum Ada Challenge", description: "Pilih tantangan di bawah" };
  const challengeDay = overview?.user?.challenge_day || 1;
  const progressPercent = Math.min(((overview?.financial?.total_checkins || 0) / 30) * 100, 100);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' }}>
      
      {/* GLOBAL STYLES & DYNAMIC THEME */}
      <style>{`
        :root {
          --primary: ${currentTheme.primary};
          --primary-dark: ${currentTheme.text};
          --theme-gradient: ${currentTheme.gradient};
          --theme-light: ${currentTheme.light};
        }
        .dark {
          --theme-gradient: ${currentTheme.darkGradient};
        }
        .gold-badge {
          background: linear-gradient(135deg, #F59E0B 0%, #B45309 100%);
          border: 1px solid #FCD34D;
          color: white; padding: 0.35rem 1rem; border-radius: 99px; font-size: 0.85rem; font-weight: bold; display: inline-flex; align-items: center; gap: 0.4rem;
        }
        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; }
        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 600; }
        .scroll-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {!isDesktop && isSidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: darkMode ? '#1e293b' : 'white', borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', height: '100vh', position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.text }}>JATES9</h2><p style={{ fontSize: '0.8rem', color: '#64748b' }}>Member Area</p></div>
          {!isDesktop && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>}
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}><Home size={20} /> Dashboard</button></li>
            <li><button className={`nav-item ${activeTab==='checkin'?'active':''}`} onClick={() => { setActiveTab('checkin'); setSidebarOpen(false); }}><Calendar size={20} /> Riwayat Check-in</button></li>
            <li><button className={`nav-item ${activeTab==='report'?'active':''}`} onClick={() => { setActiveTab('report'); setSidebarOpen(false); }}><TrendingUp size={20} /> Rapor Kesehatan</button></li>
            <li><button className={`nav-item ${activeTab==='friends'?'active':''}`} onClick={() => { setActiveTab('friends'); setSidebarOpen(false); }}><Users size={20} /> Teman Sehat</button></li>
            <li><button className={`nav-item ${activeTab==='shop'?'active':''}`} onClick={() => { setActiveTab('shop'); setSidebarOpen(false); }}><ShoppingBag size={20} /> Produk & Toko</button></li>
            <li><button className="nav-item" onClick={handleScrollToChat}><MessageCircle size={20} /> Dokter AI</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}><Settings size={20} /> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
          <button onClick={logout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} /> Keluar</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        
        {!isDesktop && (
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: darkMode ? '#1e293b' : 'white', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: darkMode ? '#e2e8f0' : '#334155' }}><Home size={24} /></button><span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: currentTheme.text }}>JATES9</span></div>
            <button onClick={logout} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}><LogOut size={18} /> Keluar</button>
          </header>
        )}

        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1, maxWidth: '100%', boxSizing: 'border-box' }}>
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '1.5rem', marginTop: isDesktop ? 0 : '0.5rem' }}>
                <p className="body-medium" style={{ color: '#64748b' }}>Halo, <strong>{overview?.user?.name}</strong>! Semangat hari ke-{challengeDay}.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
                
                {/* KOLOM KIRI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* Profil Card */}
                  <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={35} color={currentTheme.text} />
                      </div>
                      <div>
                        <h2 className="heading-2" style={{ marginBottom: '0.3rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{overview?.user?.name}</h2>
                        <div className="gold-badge"><Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tantangan Aktif */}
                  <Card style={{ background: darkMode ? '#1e293b' : '#fff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div><h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: currentTheme.text, display:'flex', alignItems:'center', gap:'0.5rem' }}><Activity size={18} /> Tantangan Aktif</h3></div>
                          <button onClick={() => setShowAllChallenges(true)} style={{ background: 'none', border: 'none', color: currentTheme.text, fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Lihat Semua <ChevronRight size={14} /></button>
                        </div>
                        <div style={{ background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', padding: '1rem', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                          <div style={{ marginBottom: '0.75rem' }}>
                              <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', color: darkMode ? 'white' : '#0f172a' }}>{currentChallenge.title}</h4>
                              <span style={{ fontSize: '0.75rem', background: currentTheme.light, color: currentTheme.text, padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Tipe {overview?.user?.group || 'Umum'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                              <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}><span>Progress</span><span>{Math.round(progressPercent)}%</span></div>
                                  <div style={{ height: '6px', background: darkMode ? '#475569' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${progressPercent}%`, height: '100%', background: currentTheme.primary, borderRadius: '4px' }}></div></div>
                              </div>
                          </div>
                        </div>
                    </CardContent>
                  </Card>

                  {/* Check-in */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader style={{paddingBottom:'0.5rem'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <CardTitle className="heading-3" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize: '1.1rem', color: darkMode ? 'white' : 'black'}}>
                          <Activity size={20} color={currentTheme.text}/> Misi Hari Ini
                        </CardTitle>
                        {checkinStatus === 'completed' && <span style={{fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold'}}><CheckCircle size={12}/> Selesai</span>}
                        {checkinStatus === 'pending' && <span style={{fontSize: '0.75rem', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold'}}><Clock size={12}/> Pending</span>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dailyData && (
                        <div style={{ background: darkMode ? '#334155' : '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${currentTheme.text}`, marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: currentTheme.text, marginBottom: '0.2rem' }}>Info Sehat:</h4>
                          <p style={{ fontSize: '0.9rem', color: darkMode ? '#e2e8f0' : '#334155' }}>{dailyData.fact || dailyData.message}</p>
                        </div>
                      )}
                      {(checkinStatus === 'completed' || checkinStatus === 'skipped') ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', background: checkinStatus === 'completed' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px' }}>
                           <h3 style={{fontWeight:'bold', color: checkinStatus === 'completed' ? '#166534' : '#991b1b'}}>Misi Selesai!</h3>
                        </div>
                      ) : (
                        <div>
                           {dailyData?.tasks?.map((task, idx) => (
                             <div key={idx} style={{ padding: '0.8rem', background: darkMode ? '#334155' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'center', color: darkMode ? 'white' : 'black' }}>
                               <div style={{width:'8px', height:'8px', borderRadius:'50%', background: currentTheme.primary}}></div>
                               {task}
                             </div>
                           ))}
                           <textarea value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="Tulis jurnal..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop:'1rem', background: darkMode ? '#1e293b' : 'white', color: darkMode ? 'white' : 'black' }}></textarea>
                           <button onClick={() => handleSubmitCheckin('completed')} style={{ background: currentTheme.primary, width:'100%', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', marginTop:'1rem', border:'none', cursor:'pointer' }}>SELESAIKAN</button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* KOLOM KANAN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* CHAT DOKTER AI (Header Kembali & Rapi) */}
                  <Card ref={chatSectionRef} style={{ background: darkMode ? '#1e293b' : 'white', height: '450px', display:'flex', flexDirection:'column' }}>
                     {/* Header Dokter AI */}
                     <div style={{ padding: '1rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem', background: darkMode ? '#1e293b' : '#f8fafc' }}>
                        <div style={{ width: '45px', height: '45px', background: currentTheme.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
                            <MessageCircle size={24} color={currentTheme.text} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: darkMode ? 'white' : '#0f172a', marginBottom:'2px' }}>Dokter AI Jates9</h3>
                            <p style={{ fontSize: '0.75rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Tanyakan apa saja kepada Dokter AI</p>
                        </div>
                     </div>

                     <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                         {chatHistory.map((msg, i) => (
                           <div key={i} style={{ 
                             padding:'0.6rem 1rem', 
                             background: msg.role==='user' ? currentTheme.light : (darkMode?'#334155':'#f1f5f9'), 
                             borderRadius:'12px', 
                             borderBottomRightRadius: msg.role==='user' ? '2px' : '12px',
                             borderTopLeftRadius: msg.role==='assistant' ? '2px' : '12px',
                             marginBottom:'0.8rem', 
                             maxWidth:'85%',
                             alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start',
                             marginLeft: msg.role==='user' ? 'auto' : '0',
                             color: msg.role==='user' ? '#1e3a8a' : (darkMode?'#e2e8f0':'#334155'),
                             fontSize: '0.9rem',
                             lineHeight: '1.5'
                           }}>
                             {msg.content}
                           </div>
                         ))}
                         {chatLoading && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginLeft:'0.5rem' }}>Sedang mengetik...</div>}
                         <div ref={chatEndRef}></div>
                     </div>
                     <form onSubmit={handleSendChat} style={{padding:'1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display:'flex', gap:'0.5rem'}}>
                        <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'0.7rem', borderRadius:'20px', border:'1px solid #ccc', color:'black', outline:'none', fontSize:'0.9rem'}} placeholder="Tanya keluhan..." />
                        <button style={{background: currentTheme.primary, border:'none', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><Send size={18}/></button>
                     </form>
                  </Card>

                  {/* ARTIKEL KESEHATAN (Icon FileText) */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'transparent', border:'none', boxShadow:'none' }}>
                      <h3 style={{marginBottom:'1rem', fontWeight:'bold'}}>Artikel Kesehatan</h3>
                      {articles.map(article => (
                          <div key={article.id} onClick={() => handleArticleClick(article.id)} style={{ display:'flex', gap:'1rem', padding:'1rem', background: darkMode ? '#334155' : 'white', borderRadius:'12px', marginBottom:'0.8rem', cursor:'pointer', border: darkMode ? 'none' : '1px solid #e2e8f0', alignItems:'center' }}>
                              
                              {/* Ikon FileText sebagai pengganti gambar */}
                              <div style={{width:'50px', height:'50px', background: currentTheme.light, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                  <FileText size={24} color={currentTheme.text}/>
                              </div>
                              
                              <div style={{flex:1}}>
                                 <h4 style={{fontWeight:'bold', fontSize:'0.9rem', color: darkMode ? 'white' : '#1e293b', marginBottom:'0.2rem', lineHeight:'1.3'}}>{article.title}</h4>
                                 <p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', display:'flex', alignItems:'center', gap:'4px' }}>
                                    <Clock size={12}/> {article.reading_time || "3 min"} baca
                                 </p>
                              </div>
                              <ChevronRight size={18} color="#94a3b8"/>
                          </div>
                      ))}
                  </Card>

                  {/* QUOTE & REFRESH (Paling Bawah) */}
                  <div style={{ paddingBottom: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ fontStyle: 'italic', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem', marginBottom: '1rem', padding: '0 1rem' }}>
                        "{quote}"
                    </p>
                    <button 
                        onClick={handleRefresh} 
                        disabled={isRefreshing} 
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: darkMode ? '#cbd5e1' : '#475569', 
                            fontSize: '0.85rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            margin: '0 auto', 
                            cursor: 'pointer' 
                        }}
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> 
                        {isRefreshing ? "Memuat ulang..." : "Refresh Halaman"}
                    </button>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* TAB LAIN (DISEDERHANAKAN, BISA DIKEMBALIKAN KE FULL KODE SEPERTI SEBELUMNYA JIKA PERLU) */}
          {activeTab === 'checkin' && (<div style={{color: darkMode ? 'white' : 'black'}}><h1 className="heading-2">Riwayat</h1><p>Halaman Riwayat Check-in</p></div>)}
          {activeTab === 'friends' && (<div style={{color: darkMode ? 'white' : 'black'}}><h1 className="heading-2">Teman Sehat</h1><p>Daftar teman Anda.</p></div>)}
          {activeTab === 'shop' && (<div style={{color: darkMode ? 'white' : 'black'}}><h1 className="heading-2">Toko</h1><p>Katalog Produk.</p></div>)}
          {activeTab === 'report' && (<div style={{color: darkMode ? 'white' : 'black'}}><h1 className="heading-2">Rapor</h1><p>Statistik Kesehatan.</p></div>)}

          {/* SETTINGS PAGE */}
          {activeTab === 'settings' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button>
                  <h1 className="heading-2">Pengaturan</h1>
               </div>
               
               <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* UBAH TEMA */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Ubah Tema Aplikasi</CardTitle></CardHeader>
                    <CardContent>
                       <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                          {Object.values(THEMES).map((theme) => (
                             <div key={theme.id} onClick={() => changeThemeColor(theme.id)} style={{ cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
                                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: theme.gradient, border: themeColor === theme.id ? `3px solid ${darkMode?'white':'#1e293b'}` : '1px solid #ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                   {themeColor === theme.id && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><Check size={20} color="white" style={{dropShadow:'0 1px 2px rgba(0,0,0,0.5)'}}/></div>}
                                </div>
                                <span style={{fontSize:'0.75rem', fontWeight: themeColor === theme.id ? 'bold' : 'normal'}}>{theme.name}</span>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                  </Card>

                  {/* AKUN & REFERRAL */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Info Akun</CardTitle></CardHeader>
                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                           <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Nomor WhatsApp</label>
                           <input type="text" value={overview?.user?.phone || ""} disabled style={{ width:'100%', padding: '0.8rem', background: darkMode ? '#334155' : '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: darkMode?'white':'black' }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Kode Referral Saya</label>
                           <div style={{ display:'flex', gap:'0.5rem' }}>
                              <input type="text" value={overview?.user?.referral_code || ""} disabled style={{ flex:1, padding: '0.8rem', background: darkMode ? '#334155' : '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight:'bold', letterSpacing:'1px', color: darkMode?'white':'black' }} />
                              <button onClick={copyReferral} style={{ background: currentTheme.primary, color:'black', border:'none', borderRadius:'6px', padding:'0 1rem', cursor:'pointer' }}><Copy size={18}/></button>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* TAMPILAN & APLIKASI */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Lainnya</CardTitle></CardHeader>
                    <CardContent>
                       <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                          <button onClick={toggleDarkMode} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'1rem', background: darkMode ? '#334155' : '#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black' }}>
                             <div style={{display:'flex', alignItems:'center', gap:'0.8rem'}}><div style={{background: darkMode?'#1e293b':'white', padding:'8px', borderRadius:'50%'}}>{darkMode ? <Moon size={20} color="#fbbf24"/> : <Sun size={20} color="#f59e0b"/>}</div> <span style={{fontWeight:'bold'}}>Mode Gelap</span></div>
                             <div style={{ width:'40px', height:'20px', background: darkMode ? currentTheme.primary : '#cbd5e1', borderRadius:'20px', position:'relative', transition:'background 0.3s' }}>
                                <div style={{ width:'16px', height:'16px', background:'white', borderRadius:'50%', position:'absolute', top:'2px', left: darkMode ? '22px' : '2px', transition:'left 0.3s' }}></div>
                             </div>
                          </button>
                          <button onClick={handleInstallApp} style={{ display:'flex', alignItems:'center', gap:'0.8rem', width:'100%', padding:'1rem', background: darkMode ? '#334155' : '#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black', textAlign:'left' }}>
                              <div style={{background: darkMode?'#1e293b':'white', padding:'8px', borderRadius:'50%'}}><Smartphone size={20} color={currentTheme.text}/></div>
                              <div><div style={{fontWeight:'bold'}}>Install Aplikasi</div><div style={{fontSize:'0.75rem', color:'#64748b'}}>Tambahkan ke Layar Utama</div></div>
                          </button>
                          <button onClick={() => setShowPrivacyModal(true)} style={{ display:'flex', alignItems:'center', gap:'0.8rem', width:'100%', padding:'1rem', background: darkMode ? '#334155' : '#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black', textAlign:'left' }}>
                              <div style={{background: darkMode?'#1e293b':'white', padding:'8px', borderRadius:'50%'}}><Shield size={20} color="#ef4444"/></div>
                              <div><div style={{fontWeight:'bold'}}>Kebijakan Privasi</div><div style={{fontSize:'0.75rem', color:'#64748b'}}>Ketentuan penggunaan data</div></div>
                          </button>
                       </div>
                    </CardContent>
                  </Card>

                  <button onClick={logout} style={{ width: '100%', padding: '1rem', border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                     <LogOut size={20}/> Keluar dari Aplikasi
                  </button>
               </div>
            </div>
          )}

        </main>
      </div>

      {showPrivacyModal && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: darkMode ? '#1e293b' : 'white', color: darkMode ? 'white' : 'black', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight:'80vh', overflowY:'auto' }}>
               <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Shield size={24}/> Kebijakan Privasi</h3>
               <div style={{ fontSize:'0.9rem', lineHeight:'1.6', marginBottom:'1.5rem', color: darkMode ? '#cbd5e1' : '#334155' }}>
                  <p><strong>1. Pengumpulan Data:</strong> Kami mengumpulkan data nama, nomor WhatsApp, dan log aktivitas kesehatan Anda untuk keperluan monitoring program Jates9.</p>
                  <p><strong>2. Penggunaan Data:</strong> Data Anda digunakan untuk memberikan rekomendasi kesehatan yang personal oleh AI dan tim ahli kami.</p>
                  <p><strong>3. Keamanan:</strong> Kami tidak membagikan data pribadi Anda kepada pihak ketiga tanpa izin, kecuali untuk keperluan pengiriman produk (ekspedisi).</p>
                  <p><strong>4. Hak Pengguna:</strong> Anda berhak meminta penghapusan akun sewaktu-waktu melalui Admin.</p>
               </div>
               <button onClick={() => setShowPrivacyModal(false)} style={{ width:'100%', padding:'0.8rem', background: currentTheme.primary, color:'black', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>Saya Mengerti</button>
            </div>
         </div>
      )}

      {showQRModal && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowQRModal(false)}><div style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%' }} onClick={e => e.stopPropagation()}><h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Kode Pertemanan</h3><div style={{ marginBottom: '1.5rem' }}><div style={{ background: 'white', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}><QRCodeSVG value={`https://jagatetapsehat.com/friend/${overview?.user?.referral_code}`} size={160} /></div></div><button onClick={() => setShowQRModal(false)} style={{ marginTop: '1rem', width: '100%', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px' }}>Tutup</button></div></div>)}
    </div>
  );
};

export default UserDashboard;
