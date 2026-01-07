import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  Home, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, Search, 
  Package, ShoppingBag, ChevronLeft, Lightbulb, Clock, AlertCircle, CheckCircle, Calendar, RefreshCw, FileText
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [myFriends, setMyFriends] = useState([]);
  const [articles, setArticles] = useState([]); // [BARU] State Artikel
  
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
  
  // --- STATE FEATURES ---
  const [showQRModal, setShowQRModal] = useState(false); 
  const [friendCode, setFriendCode] = useState(""); 
  const [friendData, setFriendData] = useState(null); 
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);

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
    
    // Load Data Awal
    fetchData();
    fetchDailyContent();
    fetchArticles(); // [BARU] Load Artikel
    setQuote(getRandomQuote());
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      if (activeTab === 'friends') fetchFriendsList();
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- COUNTDOWN TIMER ---
  useEffect(() => {
    let timer;
    if (checkinStatus === 'pending') {
      timer = setInterval(() => {
        const now = new Date();
        const target = new Date();
        target.setHours(19, 0, 0, 0); 

        if (now > target) {
          setCountdown("Waktu Habis");
          clearInterval(timer);
        } else {
          const diff = target - now;
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setCountdown(`${hours}j ${minutes}m ${seconds}d`);
        }
      }, 1000);
    } else {
        setCountdown(null); 
    }
    return () => clearInterval(timer);
  }, [checkinStatus]);

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

  // [BARU] FETCH ARTICLES
  const fetchArticles = async () => {
    try {
        // Menggunakan endpoint admin/articles (public GET)
        const res = await axios.get(`${BACKEND_URL}/api/admin/articles`);
        setArticles(res.data);
    } catch (error) {
        console.error("Gagal load artikel:", error);
    }
  };

  const fetchDailyContent = async () => {
      try {
          const res = await axios.get(`${BACKEND_URL}/api/daily-content`, { headers: getAuthHeader() });
          setDailyData(res.data);
          
          if (res.data.today_status) {
            setCheckinStatus(res.data.today_status);
          } else {
            setCheckinStatus(null); 
          }
      } catch (err) { console.error("Gagal load konten harian"); }
  };

  const fetchFriendsList = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() });
        setMyFriends(res.data.friends);
    } catch (err) { console.error("Gagal load teman"); }
  };

  const getRandomQuote = () => {
    const quotes = [
      "Kesehatan adalah kekayaan sejati.",
      "Satu langkah kecil hari ini, dampak besar di masa depan.",
      "Tubuhmu adalah satu-satunya tempatmu tinggal.",
      "Konsistensi mengalahkan intensitas.",
      "Jangan menunggu sakit untuk memulai hidup sehat."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchData(), fetchDailyContent(), fetchArticles()]);
    setQuote(getRandomQuote());
    setIsRefreshing(false);
  };

  const generateDailyTip = (group) => {
    const tips = {
      'A': "💡 Info Tipe A (Sembelit): Fokus perbanyak air hangat 2 gelas saat bangun tidur dan konsumsi serat tinggi hari ini.",
      'B': "💡 Info Tipe B (Kembung): Hindari makanan bersantan dan pedas hari ini. Jaga pola makan teratur.",
      'C': "💡 Info Tipe C (GERD): Jangan terlambat makan siang. Hindari kopi dan teh pekat agar asam lambung aman.",
      'Sehat': "💡 Info Sehat: Kondisi stabil. Pertahankan dengan olahraga ringan 15 menit dan tidur cukup."
    };
    return tips[group] || tips['Sehat'];
  };

  const handleScrollToChat = () => {
    setActiveTab('dashboard');
    setSidebarOpen(false); 
    setTimeout(() => {
        chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
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

  const copyReferral = () => {
    navigator.clipboard.writeText(overview?.user?.referral_code || "");
    alert("Kode Referral disalin!");
  };

  // --- FUNGSI CHECKIN ---
  const handleSubmitCheckin = async (forcedStatus) => {
      if (isSubmitting) return; 
      setIsSubmitting(true);
      
      try {
          const res = await axios.post(`${BACKEND_URL}/api/checkin`, { 
            journal, 
            status: forcedStatus 
          }, { headers: getAuthHeader() });
          
          if (res.data.success) {
            setCheckinStatus(forcedStatus); 
            
            if(forcedStatus === 'completed') {
              alert("✅ Check-in SELESAI! Anda hebat hari ini.");
              fetchData(); 
            } else {
              alert("🕒 Oke, status PENDING tersimpan. Selesaikan sebelum jam 19:00!");
            }
          }
      } catch (err) { 
          alert(err.response?.data?.message || "Gagal check-in."); 
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleSwitchChallenge = async (chId) => {
      if(!window.confirm("Ingin pindah ke tantangan ini? Progress saat ini mungkin akan direset.")) return;
      try {
          await axios.post(`${BACKEND_URL}/api/user/select-challenge`, { challenge_id: chId }, { headers: getAuthHeader() });
          alert("Berhasil pindah challenge!");
          window.location.reload();
      } catch (e) { alert("Gagal pindah challenge"); }
  };

  const handleSearchFriend = async () => {
    if(!friendCode.trim()) return alert("Masukkan kode teman!");
    setSearchLoading(true); setFriendData(null);
    try {
        const res = await axios.post(`${BACKEND_URL}/api/friends/lookup`, { referral_code: friendCode.toUpperCase() }, { headers: getAuthHeader() });
        setFriendData(res.data.friend);
    } catch (err) { alert(err.response?.data?.message || "Teman tidak ditemukan."); } 
    finally { setSearchLoading(false); }
  };

  const handleClickFriendFromList = async (code) => {
      setFriendCode(code); setSearchLoading(true); setShowQRModal(false); 
      try {
          const res = await axios.post(`${BACKEND_URL}/api/friends/lookup`, { referral_code: code }, { headers: getAuthHeader() });
          setFriendData(res.data.friend); setShowFriendProfile(true); 
      } catch (err) { alert("Gagal memuat profil teman."); } 
      finally { setSearchLoading(false); }
  };

  const handleOpenFriendProfile = () => {
      if(friendData) {
          setShowQRModal(false);
          setShowFriendProfile(true);
      }
  };

  const currentChallenge = challenges.find(c => c.id === overview?.user?.challenge_id) || { title: "Belum Ada Challenge", description: "Pilih tantangan di bawah" };
  const challengeDay = overview?.user?.challenge_day || 1;
  const progressPercent = Math.min(((overview?.financial?.total_checkins || 0) / 30) * 100, 100);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: '#f8fafc', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' }}>
      
      {/* CSS Injection */}
      <style>{`
        :root {
          --primary: #8fec78;
          --primary-dark: #6bd455;
          --gradient-profile: linear-gradient(135deg, #ffffff 0%, #8fec78 100%);
        }
        .gold-badge {
          background: linear-gradient(135deg, #F59E0B 0%, #B45309 100%);
          border: 1px solid #FCD34D;
          color: white;
          padding: 0.35rem 1rem;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 4px 6px -1px rgba(180, 83, 9, 0.4);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .nav-item.active {
          background: #dcfce7 !important;
          color: #166534 !important;
          font-weight: 600;
        }
        .scroll-hide::-webkit-scrollbar { display: none; }
        
        body { overflow-x: hidden; }
      `}</style>

      {/* Overlay Sidebar di Mobile */}
      {!isDesktop && isSidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>JATES9</h2><p style={{ fontSize: '0.8rem', color: '#64748b' }}>Member Area</p></div>
          {!isDesktop && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>}
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className={`nav-item ${activeTab==='dashboard'?'active':''}`} style={navItemStyle(activeTab === 'dashboard')} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}><Home size={20} /> Dashboard</button></li>
            <li><button className={`nav-item ${activeTab==='checkin'?'active':''}`} style={navItemStyle(activeTab === 'checkin')} onClick={() => { setActiveTab('checkin'); setSidebarOpen(false); }}><Calendar size={20} /> Riwayat Check-in</button></li>
            <li><button className={`nav-item ${activeTab==='report'?'active':''}`} style={navItemStyle(activeTab === 'report')} onClick={() => { setActiveTab('report'); setSidebarOpen(false); }}><TrendingUp size={20} /> Rapor Kesehatan</button></li>
            <li><button className={`nav-item ${activeTab==='friends'?'active':''}`} style={navItemStyle(activeTab === 'friends')} onClick={() => { setActiveTab('friends'); setSidebarOpen(false); }}><Users size={20} /> Teman Sehat</button></li>
            <li><button className={`nav-item ${activeTab==='shop'?'active':''}`} style={navItemStyle(activeTab === 'shop')} onClick={() => { setActiveTab('shop'); setSidebarOpen(false); }}><ShoppingBag size={20} /> Produk & Toko</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={handleScrollToChat}><MessageCircle size={20} /> Dokter AI</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} style={navItemStyle(activeTab === 'settings')} onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}><Settings size={20} /> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ ...navItemStyle(false), color: '#ef4444', justifyContent: 'flex-start' }}><LogOut size={20} /> Keluar</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        
        {/* Header Mobile */}
        {!isDesktop && (
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#334155' }}><Home size={24} /></button><span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#166534' }}>JATES9</span></div>
            <button onClick={logout} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}><LogOut size={18} /> Keluar</button>
          </header>
        )}

        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1, maxWidth: '100%', boxSizing: 'border-box' }}>
          
          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 className="heading-2" style={{ marginBottom: '0.3rem' }}>Dashboard</h1>
                <p className="body-medium" style={{ color: '#64748b' }}>Halo, <strong>{overview?.user?.name}</strong>! Semangat hari ke-{challengeDay}.</p>
              </div>

              {/* Grid Container */}
              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
                
                {/* === KOLOM KIRI (UTAMA) === */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* 1. Profil Card */}
                  <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--gradient-profile)', color: '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={35} color="#166534" />
                      </div>
                      <div>
                        <h2 className="heading-2" style={{ marginBottom: '0.3rem', color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>{overview?.user?.name}</h2>
                        <div className="gold-badge">
                          <Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Kartu Tantangan Aktif */}
                  <Card style={{ background: '#fff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#166534', display:'flex', alignItems:'center', gap:'0.5rem' }}><Activity size={18} /> Tantangan Aktif</h3>
                          </div>
                          <button onClick={() => setShowAllChallenges(true)} style={{ background: 'none', border: 'none', color: '#166534', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Lihat Semua <ChevronRight size={14} /></button>
                        </div>
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                          <div style={{ marginBottom: '0.75rem' }}>
                              <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#0f172a' }}>{currentChallenge.title}</h4>
                              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Tipe {overview?.user?.group || 'Umum'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                              <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}><span>Progress</span><span>{Math.round(progressPercent)}%</span></div>
                                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${progressPercent}%`, height: '100%', background: '#8fec78', borderRadius: '4px', transition: 'width 0.5s ease' }}></div></div>
                              </div>
                          </div>
                          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                              <div><strong>{overview?.financial?.total_checkins || 0}/30</strong> <span style={{color: '#94a3b8'}}>Selesai</span></div>
                              <div><strong>{challengeDay}</strong> <span style={{color: '#94a3b8'}}>Berjalan</span></div>
                          </div>
                        </div>
                    </CardContent>
                  </Card>

                  {/* 3. Check-in Box */}
                  <Card style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <CardHeader style={{paddingBottom:'0.5rem'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <CardTitle className="heading-3" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize: '1.1rem'}}>
                          <Activity size={20} color="#166534"/> Misi Hari Ini
                        </CardTitle>
                        {/* Status Badge */}
                        {checkinStatus === 'completed' && <span style={{fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'4px'}}><CheckCircle size={12}/> Selesai</span>}
                        {checkinStatus === 'pending' && <span style={{fontSize: '0.75rem', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'4px'}}><Clock size={12}/> Pending</span>}
                        {checkinStatus === 'skipped' && <span style={{fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'4px'}}><AlertCircle size={12}/> Skipped</span>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Fakta Harian */}
                      {dailyData && (
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.2rem' }}><Lightbulb size={16} style={{display:'inline', marginBottom:'-2px'}}/> Info Sehat:</h4>
                          <p style={{ fontSize: '0.9rem', color: '#334155' }}>{dailyData.fact || dailyData.message}</p>
                        </div>
                      )}

                      {/* LOGIKA TAMPILAN CHECKIN */}
                      {(checkinStatus === 'completed' || checkinStatus === 'skipped') ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', background: checkinStatus === 'completed' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', border: checkinStatus === 'completed' ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                           {checkinStatus === 'completed' ? <CheckCircle size={40} color="#16a34a" style={{margin:'0 auto 0.5rem'}}/> : <AlertCircle size={40} color="#ef4444" style={{margin:'0 auto 0.5rem'}}/>}
                           <h3 style={{fontWeight:'bold', color: checkinStatus === 'completed' ? '#166534' : '#991b1b', marginBottom: '0.3rem'}}>{checkinStatus === 'completed' ? "Misi Selesai!" : "Hari Dilewatkan"}</h3>
                           <p style={{fontSize:'0.85rem', color: checkinStatus === 'completed' ? '#16a34a' : '#ef4444'}}>{checkinStatus === 'completed' ? "Sampai jumpa besok!" : "Tetap semangat!"}</p>
                        </div>
                      ) : (
                        <div>
                           {/* List Tugas */}
                           <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {dailyData?.tasks?.map((task, idx) => (
                                <div key={idx} style={{ padding: '0.8rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display:'flex', alignItems:'center', gap:'0.8rem' }}>
                                   <div style={{ width:'8px', height:'8px', background:'#8fec78', borderRadius:'50%', flexShrink:0 }}></div>
                                   <span style={{ fontSize:'0.9rem', fontWeight:'500', color:'#334155' }}>{task}</span>
                                </div>
                              ))}
                           </div>

                           {/* Input Jurnal */}
                           <div style={{marginTop: '1rem', marginBottom:'1rem'}}>
                              <label style={{fontWeight:'bold', color:'#334155', display:'block', marginBottom:'0.5rem', fontSize:'0.9rem'}}>Jurnal Singkat:</label>
                              <textarea 
                                  value={journal}
                                  onChange={(e) => setJournal(e.target.value)}
                                  placeholder="Bagaimana perasaanmu setelah melakukan tugas hari ini?" 
                                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px', outline: 'none', resize: 'none', fontSize:'0.9rem', boxSizing: 'border-box' }}
                              ></textarea>
                           </div>

                           {/* Timer */}
                           {checkinStatus === 'pending' && countdown && (
                              <div style={{ textAlign: 'center', marginBottom: '1rem', padding: '0.8rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                <div style={{ color: '#92400e', fontWeight: 'bold', fontSize:'0.9rem' }}>Sisa Waktu Check-in:</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#b45309' }}>{countdown}</div>
                              </div>
                           )}

                           {/* Tombol Aksi */}
                           <div style={{ display: 'grid', gridTemplateColumns: checkinStatus === 'pending' ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                              {checkinStatus === null && (
                                <button onClick={() => handleSubmitCheckin('pending')} disabled={isSubmitting} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  Nanti
                                </button>
                              )}
                              <button onClick={() => handleSubmitCheckin('completed')} disabled={isSubmitting} style={{ background: '#8fec78', color: '#064e3b', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(143, 236, 120, 0.4)' }}>
                                {isSubmitting ? 'Loading...' : (checkinStatus === 'pending' ? 'SELESAIKAN' : 'Sudah')}
                              </button>
                           </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 4. Statistik */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                    <Card style={{ textAlign: 'center', padding: '0.8rem', background: 'white', border: '1px solid #e2e8f0' }}><h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{overview?.financial?.total_checkins || 0}</h3><p style={{ fontSize: '0.7rem', color: '#64748b' }}>Check-in</p></Card>
                    <Card style={{ textAlign: 'center', padding: '0.8rem', background: 'white', border: '1px solid #e2e8f0' }}><h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{overview?.financial?.total_referrals || 0}</h3><p style={{ fontSize: '0.7rem', color: '#64748b' }}>Referral</p></Card>
                    <Card style={{ textAlign: 'center', padding: '0.8rem', background: 'white', border: '1px solid #e2e8f0' }}><h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{(overview?.financial?.commission_approved || 0) / 1000}k</h3><p style={{ fontSize: '0.7rem', color: '#64748b' }}>Komisi</p></Card>
                  </div>

                  {/* 5. Rekomendasi Challenge */}
                  <div>
                    <h3 className="heading-3" style={{marginBottom:'0.8rem', fontSize:'1rem'}}>Rekomendasi Challenge</h3>
                    <div className="scroll-hide" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%' }}>
                       {challenges.map((ch) => (
                         <div key={ch.id} style={{ minWidth: '200px', maxWidth: '200px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display:'flex', flexDirection:'column', justifyContent:'space-between', flexShrink: 0 }}>
                            <div>
                              <div style={{width:'36px', height:'36px', background:'#f0fdf4', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.5rem'}}><Activity size={18} color="#16a34a"/></div>
                              <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a', marginBottom:'0.3rem' }}>{ch.title}</h4>
                              <p style={{ fontSize: '0.75rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ch.description}</p>
                            </div>
                            <button onClick={() => handleSwitchChallenge(ch.id)} style={{ marginTop: '0.8rem', width: '100%', padding: '0.4rem', border: '1px solid #16a34a', background: 'transparent', color: '#16a34a', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Detail</button>
                         </div>
                       ))}
                    </div>
                  </div>

                </div>
                
                {/* === KOLOM KANAN === */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* 1. Chatbot Card */}
                  <Card ref={chatSectionRef} style={{ background: 'white', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '450px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc' }}><div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={24} color="#166534" /></div><div><h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>Dokter AI Jates9</h3><p style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%' }}></span> Online</p></div></div>
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {chatHistory.map((msg, idx) => (<div key={idx} style={msg.role === 'system_tip' ? { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.8rem', fontSize: '0.9rem', color: '#1e40af', display: 'flex', gap: '0.5rem' } : { alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#dcfce7' : '#f1f5f9', color: msg.role === 'user' ? '#14532d' : '#334155', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.5' }}>{msg.role === 'system_tip' ? <><Lightbulb size={20} style={{ flexShrink: 0 }} /><div>{msg.content}</div></> : msg.content}</div>))}
                      {chatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Dokter sedang mengetik...</div>}
                      <div ref={chatEndRef}></div>
                    </div>
                    <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}><input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Tanya keluhan kesehatan..." style={{ flex: 1, padding: '0.75rem', borderRadius: '25px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' }} /><button type="submit" disabled={chatLoading} style={{ background: '#8fec78', color: '#064e3b', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}><Send size={20} /></button></form>
                  </Card>

                  {/* 2. [UPDATED] Artikel Kesehatan (Dinamis dari DB) */}
                  <div>
                    <h3 className="heading-3" style={{ marginBottom: '1rem', fontSize:'1rem' }}>Artikel Kesehatan</h3>
                    <Card style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {articles.length > 0 ? articles.map(article => (
                            <div key={article.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', transition:'transform 0.2s' }}>
                                {/* Gambar Artikel */}
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {article.image_url ? (
                                        <img src={`${BACKEND_URL}${article.image_url}`} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FileText size={24} color="#94a3b8" />
                                    )}
                                </div>
                                {/* Konten Teks */}
                                <div style={{flex: 1}}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.2rem', lineHeight: '1.2' }}>{article.title}</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 3 menit</p>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Belum ada artikel.</div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* 3. Footer */}
                  <div style={{ paddingBottom: '3rem', textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', padding: '0 1rem' }}>"{quote}"</p>
                    <button onClick={handleRefresh} disabled={isRefreshing} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 auto', cursor: 'pointer' }}>
                      <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> {isRefreshing ? "Memuat ulang..." : "Refresh Halaman"}
                    </button>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* 2. HISTORY CHECK-IN PAGE */}
          {activeTab === 'checkin' && (
            <div>
              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button>
                <h1 className="heading-2">Riwayat Perjalanan</h1>
              </div>
              <Card style={{ background: 'white', border: '1px solid #e2e8f0', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardHeader><CardTitle className="heading-3">Kalender Check-in</CardTitle><p style={{fontSize:'0.9rem', color:'#64748b'}}>Hijau = Selesai, Abu = Belum</p></CardHeader>
                <CardContent style={{ padding: '1.5rem' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.8rem' }}>
                      {Array.from({length: 30}, (_, i) => i + 1).map(day => {
                         let statusColor = '#f1f5f9'; let textColor = '#94a3b8';
                         if (day < challengeDay) { statusColor = '#dcfce7'; textColor = '#166534'; }
                         else if (day === challengeDay) {
                            if (checkinStatus === 'completed') { statusColor = '#dcfce7'; textColor = '#166534'; }
                            else if (checkinStatus === 'pending') { statusColor = '#fef3c7'; textColor = '#d97706'; }
                            else { statusColor = '#fff'; textColor = '#334155'; }
                         }
                         const isToday = day === challengeDay;
                         return (
                           <div key={day} style={{ aspectRatio: '1/1', background: statusColor, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: isToday ? '2px solid #16a34a' : '1px solid transparent', fontWeight: 'bold', color: textColor }}>
                              <span style={{fontSize:'0.7rem', fontWeight:'normal'}}>Day</span><span style={{fontSize:'1.2rem'}}>{day}</span>{day < challengeDay && <CheckCircle size={12} style={{marginTop:'4px'}}/>}
                           </div>
                         )
                      })}
                   </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 3. HEALTH REPORT PAGE */}
          {activeTab === 'report' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button>
                  <h1 className="heading-2">Rapor Kesehatan</h1>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                  <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}><CardHeader><CardTitle className="heading-3">Statistik Konsistensi</CardTitle></CardHeader><CardContent><div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>{[40, 60, 30, 80, 50, 90, 70].map((h, i) => (<div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '100%', height: `${h}%`, background: h > 50 ? '#8fec78' : '#e2e8f0', borderRadius: '4px 4px 0 0' }}></div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>H-{7-i}</span></div>))}</div><div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>Total Check-in: <strong>{overview?.financial?.total_checkins}</strong></span><span>Skor Kesehatan: <strong style={{ color: '#16a34a' }}>85/100</strong></span></div></CardContent></Card>
                  <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}><CardHeader><CardTitle className="heading-3">Riwayat Evaluasi</CardTitle></CardHeader><CardContent><div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}><div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}><div style={{ fontWeight: 'bold', color: '#0f172a' }}>Evaluasi Awal (Hari 1)</div><p style={{ fontSize: '0.9rem', color: '#64748b' }}>Kondisi awal: Sering kembung dan tidak nyaman.</p></div>{challengeDay >= 5 ? (<div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a', cursor: 'pointer' }} onClick={() => alert("Membuka detail evaluasi...")}><div style={{ fontWeight: 'bold', color: '#166534', display: 'flex', justifyContent: 'space-between' }}>Evaluasi 5 Hari <span>Lihat &rarr;</span></div><p style={{ fontSize: '0.9rem', color: '#166534' }}>Klik untuk melihat hasil analisis AI.</p></div>) : (<div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8', textAlign: 'center' }}>Evaluasi berikutnya di Hari ke-5</div>)}</div></CardContent></Card>
               </div>
            </div>
          )}

          {/* 4. SHOP PAGE */}
          {activeTab === 'shop' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button><h1 className="heading-2">Toko & Produk</h1></div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>{[{ name: "Jates9 - 5ml (Trial)", price: "Rp 75.000", desc: "Cocok untuk pemula. Cukup untuk 7 hari.", img: "pack" }, { name: "Jates9 - 10ml (Reguler)", price: "Rp 135.000", desc: "Ukuran standar untuk konsumsi rutin.", img: "package" }, { name: "Paket Sehat (3x 10ml)", price: "Rp 350.000", desc: "Hemat Rp 55.000! Stok untuk sebulan.", img: "star" }].map((prod, idx) => (<Card key={idx} style={{ background: 'white', border: '1px solid #e2e8f0' }}><div style={{ height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}><Package size={64} color="#94a3b8"/></div><CardContent style={{ padding: '1.5rem' }}><h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{prod.name}</h3><p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', minHeight: '40px' }}>{prod.desc}</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.1rem' }}>{prod.price}</span><a href={`https://shopee.co.id/jates9?ref=${overview?.user?.referral_code}`} target="_blank" rel="noreferrer" style={{ background: '#ee4d2d', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={16}/> Beli di Shopee</a></div></CardContent></Card>))}</div>
            </div>
          )}

          {/* 5. SETTINGS PAGE */}
          {activeTab === 'settings' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button><h1 className="heading-2">Pengaturan Akun</h1></div>
               <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}><Card style={{ background: 'white', border: '1px solid #e2e8f0' }}><CardHeader><CardTitle className="heading-3">Profil Saya</CardTitle></CardHeader><CardContent><div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}><div><label style={{ fontSize: '0.9rem', color: '#64748b' }}>Nama Lengkap</label><input type="text" value={overview?.user?.name} disabled style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }} /></div><div><label style={{ fontSize: '0.9rem', color: '#64748b' }}>Nomor WhatsApp</label><input type="text" value={overview?.user?.referral_code} disabled style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }} /></div></div></CardContent></Card><Card style={{ background: 'white', border: '1px solid #e2e8f0' }}><CardContent style={{padding:'1.5rem'}}><button onClick={logout} style={{ width: '100%', padding: '1rem', border: '1px solid #fee2e2', background: '#fef2f2', textAlign: 'left', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>Keluar dari Aplikasi</button></CardContent></Card></div>
            </div>
          )}

          {/* 6. FRIENDS LIST PAGE */}
          {activeTab === 'friends' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button><h1 className="heading-2">Teman Sehat</h1></div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}><Card style={{ background: '#f0fdf4', border: '1px dashed #16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }} onClick={() => setShowQRModal(true)}><div style={{ textAlign: 'center', color: '#166534' }}><div style={{ background: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}><QrCode size={24} /></div><h3 style={{ fontWeight: 'bold' }}>Tambah Teman</h3></div></Card>{myFriends.map((friend, idx) => (<Card key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => handleClickFriendFromList(friend.referral_code)}><CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} color="#2563eb" /></div><div><h4 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>{friend.name}</h4><div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', marginTop: '0.2rem' }}><span style={{ color: '#16a34a', background: '#dcfce7', padding: '0 6px', borderRadius: '4px' }}>{friend.badge}</span><span style={{ color: '#64748b' }}>• {friend.relation}</span></div></div></CardContent></Card>))}</div>
            </div>
          )}

        </main>
      </div>

      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowQRModal(false)}>
           <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Kode Pertemanan</h3>
              <div style={{ marginBottom: '1.5rem' }}><div style={{ background: 'white', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}><QRCodeSVG value={`https://jagatetapsehat.com/friend/${overview?.user?.referral_code}`} size={160} /></div><p style={{ fontSize: '0.85rem', color: '#64748b' }}>Tunjukkan ini ke teman Anda.</p></div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}><h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.8rem', color: '#334155' }}>Cari Teman</h4><div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><input type="text" placeholder="Masukkan Kode Teman" value={friendCode} onChange={(e) => setFriendCode(e.target.value.toUpperCase())} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', textTransform: 'uppercase' }} /><button onClick={handleSearchFriend} disabled={searchLoading} style={{ background: '#8fec78', color: '#064e3b', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>{searchLoading ? '...' : <Search size={18} />}</button></div>{friendData && (<div onClick={handleOpenFriendProfile} style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'left', border: '1px solid #bbf7d0', cursor: 'pointer', transition: 'transform 0.2s' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}><div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#16a34a"/></div><div><div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{friendData.name}</div><div style={{ fontSize: '0.8rem', color: '#166534' }}>{friendData.badge}</div></div></div><div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Klik untuk lihat profil</span><ChevronRight size={16} /></div></div>)}</div>
              <button onClick={() => setShowQRModal(false)} style={{ marginTop: '1.5rem', background: '#f1f5f9', border: 'none', padding: '0.5rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#334155', width: '100%' }}>Tutup</button>
           </div>
        </div>
      )}

      {showFriendProfile && friendData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowFriendProfile(false)}>
           <div style={{ background: 'white', padding: '0', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: 'var(--gradient-profile)', padding: '2rem 1rem', color: '#1e293b', position: 'relative', overflow: 'hidden' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative', zIndex: 2 }}><User size={40} color="#166534" /></div><h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b', position: 'relative', zIndex: 2 }}>{friendData.name}</h2><div className="gold-badge" style={{ position: 'relative', zIndex: 2 }}><Medal size={16}/> {friendData.badge}</div></div>
              <div style={{ padding: '1.5rem' }}><div style={{ textAlign: 'left', marginBottom: '1.5rem' }}><h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Sedang Mengikuti:</h4><div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.3rem' }}>{friendData.challenge_title}</div><div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}><span>Tipe {friendData.group || 'Umum'}</span><span>Hari ke-{friendData.challenge_day}</span></div><div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.8rem', overflow: 'hidden' }}><div style={{ width: `${Math.min(((friendData.total_checkins || 0)/30)*100, 100)}%`, height: '100%', background: '#8fec78' }}></div></div></div></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}><div style={{ background: '#f0fdf4', padding: '0.8rem', borderRadius: '8px' }}><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#166534' }}>{friendData.total_checkins}</div><div style={{ fontSize: '0.75rem', color: '#166534' }}>Total Check-in</div></div><div style={{ background: '#fff7ed', padding: '0.8rem', borderRadius: '8px' }}><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ea580c' }}>{friendData.challenge_day}</div><div style={{ fontSize: '0.75rem', color: '#ea580c' }}>Hari Berjalan</div></div></div><button onClick={() => setShowFriendProfile(false)} style={{ marginTop: '2rem', width: '100%', padding: '0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#334155' }}>Tutup Profil</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

const navItemStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: isActive ? '#dcfce7' : 'transparent', color: isActive ? '#14532d' : '#475569', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: isActive ? '600' : '400', marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.2s'
});

export default UserDashboard;
