import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  BookOpen, CheckCircle, FileText, Menu, Home, LogOut, Settings, 
  User, Award, Bell, Lightbulb, Download, Bot, Medal, Copy, MoreVertical, 
  PauseCircle, StopCircle, ChevronRight, QrCode, Search, ScanLine, Camera, CameraOff, Heart
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 
import { QrReader } from 'react-qr-reader'; // Library Baru yang Stabil

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [myFriends, setMyFriends] = useState([]);
  
  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  
  // --- STATE FRIEND & QR ---
  const [showQRModal, setShowQRModal] = useState(false); 
  const [friendCode, setFriendCode] = useState(""); 
  const [friendData, setFriendData] = useState(null); 
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // --- STATE LOGIC CHALLENGE ---
  const [isPaused, setIsPaused] = useState(false); 

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

  const fetchFriendsList = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() });
        setMyFriends(res.data.friends);
    } catch (err) { console.error("Gagal load teman"); }
  };

  useEffect(() => {
      if (activeTab === 'friends') fetchFriendsList();
  }, [activeTab]);

  const generateDailyTip = (group) => {
    const tips = {
      'A': "💡 Info Tipe A (Sembelit): Fokus perbanyak air hangat 2 gelas saat bangun tidur dan konsumsi serat tinggi hari ini.",
      'B': "💡 Info Tipe B (Kembung): Hindari makanan bersantan dan pedas hari ini. Jaga pola makan teratur.",
      'C': "💡 Info Tipe C (GERD): Jangan terlambat makan siang. Hindari kopi dan teh pekat agar asam lambung aman.",
      'Sehat': "💡 Info Sehat: Kondisi stabil. Pertahankan dengan olahraga ringan 15 menit dan tidur cukup."
    };
    const selectedTip = tips[group] || tips['Sehat'];
    return selectedTip;
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hide_tutorial', 'true'); 
  };

  const handleScrollToChat = () => {
    setActiveTab('dashboard');
    setSidebarOpen(false); 
    setTimeout(() => {
        chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
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

  const copyReferral = () => {
    navigator.clipboard.writeText(overview?.user?.referral_code || "");
    alert("Kode Referral disalin!");
  };

  const handlePauseChallenge = () => {
      if(window.confirm("Jeda tantangan sementara?")) {
          setIsPaused(true); setShowMenuId(null);
      }
  };
  const handleResumeChallenge = () => {
      setIsPaused(false); setShowMenuId(null); alert("Selamat datang kembali!");
  };
  const handleStopChallenge = () => {
      if(window.confirm("Yakin ingin berhenti? Progress hilang.")) {
          alert("Tantangan dihentikan."); setShowMenuId(null);
      }
  };

  // --- FRIEND SEARCH LOGIC ---
  const handleSearchFriend = async () => {
    if(!friendCode.trim()) return alert("Masukkan kode teman!");
    setSearchLoading(true);
    setFriendData(null);
    try {
        const res = await axios.post(`${BACKEND_URL}/api/friends/lookup`, { referral_code: friendCode.toUpperCase() }, { headers: getAuthHeader() });
        setFriendData(res.data.friend);
    } catch (err) {
        alert(err.response?.data?.message || "Teman tidak ditemukan.");
    } finally {
        setSearchLoading(false);
    }
  };

  const handleClickFriendFromList = async (code) => {
      setFriendCode(code); 
      setSearchLoading(true);
      setShowQRModal(false); 
      try {
          const res = await axios.post(`${BACKEND_URL}/api/friends/lookup`, { referral_code: code }, { headers: getAuthHeader() });
          setFriendData(res.data.friend);
          setShowFriendProfile(true); 
      } catch (err) {
          alert("Gagal memuat profil teman.");
      } finally {
          setSearchLoading(false);
      }
  };

  const handleOpenFriendProfile = () => {
      if(friendData) {
          setShowQRModal(false);
          setShowFriendProfile(true);
      }
  };

  // --- SCANNER LOGIC (FIXED: React QR Reader) ---
  const handleScan = (result, error) => {
    if (!!result) {
        const rawText = result?.text;
        if (rawText) {
            // Format URL: https://jagatetapsehat.com/friend/KODE
            const parts = rawText.split('/');
            const code = parts[parts.length - 1]; 
            if(code) {
                setFriendCode(code.toUpperCase()); 
                setIsScanning(false); 
                alert(`Kode terdeteksi: ${code}`);
            }
        }
    }
    if (!!error) {
        // console.info(error); 
    }
  };

  // --- DATA PROCESSING ---
  const currentChallenge = challenges.find(c => c.id === overview?.user?.challenge_id) || { title: "Belum Ada Challenge", description: "Pilih tantangan di bawah" };
  const progressPercent = Math.min(((overview?.financial?.total_checkins || 0) / 30) * 100, 100);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: '#f8fafc', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' }}>
      
      {!isDesktop && isSidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>JATES9</h2><p style={{ fontSize: '0.8rem', color: '#64748b' }}>Member Area</p></div>
          {!isDesktop && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>}
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className="nav-item" style={navItemStyle(activeTab === 'dashboard')} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}><Home size={20} /> Dashboard</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => window.location.href='/dashboard/checkin'}><Activity size={20} /> Check-in Harian</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={() => window.location.href='/dashboard/health-report'}><FileText size={20} /> Rapor Kesehatan</button></li>
            <li><button className="nav-item" style={navItemStyle(activeTab === 'friends')} onClick={() => { setActiveTab('friends'); setSidebarOpen(false); }}><Heart size={20} /> Teman Sehat</button></li>
            <li><button className="nav-item" style={navItemStyle(false)} onClick={handleScrollToChat}><MessageCircle size={20} /> Dokter AI</button></li>
            <li><button className="nav-item" style={navItemStyle(false)}><Settings size={20} /> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ ...navItemStyle(false), color: '#ef4444', justifyContent: 'flex-start' }}><LogOut size={20} /> Keluar</button>
        </div>
      </aside>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {!isDesktop && (
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#334155' }}><Menu size={24} /></button><span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>JATES9</span></div>
            <button onClick={logout} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}><LogOut size={18} /> Keluar</button>
          </header>
        )}

        <main style={{ padding: '2rem', flex: 1 }}>
          
          {/* --- DASHBOARD TAB --- */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>Halo, <strong>{overview?.user?.name}</strong>! Semangat hari ke-{overview?.user?.challenge_day}.</p>
              </div>

              {/* SECTION 1: PROFILE & CHAT */}
              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem', minHeight: isDesktop ? '500px' : 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <Card style={{ background: 'white', border: 'none', backgroundImage: 'var(--gradient-hero)' }}>
                    <CardContent style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}><User size={35} style={{ color: 'var(--primary)' }} /></div>
                      <div>
                        <h2 className="heading-2" style={{ marginBottom: '0.25rem' }}>{overview?.user?.name}</h2>
                        <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content' }}><Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <Card style={{ textAlign: 'center', padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}><div style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} color="#2563eb" /></div><h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{overview?.financial?.total_checkins || 0}x</h3><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Check-in</p></Card>
                    <Card style={{ textAlign: 'center', padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}><div style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="#16a34a" /></div><h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{overview?.financial?.total_referrals || 0}</h3><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Referral</p></Card>
                    <Card style={{ textAlign: 'center', padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}><div style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wallet size={20} color="#ea580c" /></div><h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(overview?.financial?.commission_approved || 0) / 1000}k</h3><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Komisi</p></Card>
                  </div>
                </div>
                
                {/* DOKTER AI */}
                <Card ref={chatSectionRef} style={{ background: 'white', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: isDesktop ? '100%' : '500px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc' }}><div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={24} color="#16a34a" /></div><div><h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>Dokter AI Jates9</h3><p style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%' }}></span> Online</p></div></div>
                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {chatHistory.map((msg, idx) => (<div key={idx} style={msg.role === 'system_tip' ? { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.8rem', fontSize: '0.9rem', color: '#1e40af', display: 'flex', gap: '0.5rem' } : { alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--primary)' : '#f1f5f9', color: msg.role === 'user' ? 'white' : '#334155', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.5' }}>{msg.role === 'system_tip' ? <><Lightbulb size={20} style={{ flexShrink: 0 }} /><div>{msg.content}</div></> : msg.content}</div>))}
                    {chatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Dokter sedang mengetik...</div>}
                    <div ref={chatEndRef}></div>
                  </div>
                  <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}><input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Tanya keluhan kesehatan..." style={{ flex: 1, padding: '0.75rem', borderRadius: '25px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' }} /><button type="submit" disabled={chatLoading} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}><Send size={20} /></button></form>
                </Card>
              </div>

              {/* CHALLENGE PROGRESS (BAWAH) */}
              <Card style={{ background: isPaused ? '#fffbeb' : 'white', border: isPaused ? '1px solid #fcd34d' : '1px solid #e2e8f0', marginBottom: '2rem', position: 'relative', overflow: 'visible', transition: 'all 0.3s' }}>
                <CardContent style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isPaused ? '#d97706' : 'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}><Activity size={20} /> {isPaused ? "Tantangan Dijeda" : "Tantangan Aktif"}</h3>
                          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{isPaused ? "Silakan lanjut jika sudah siap." : "Pantau progres kesehatan Anda di sini."}</p>
                      </div>
                      <button onClick={() => setShowAllChallenges(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Lihat Semua <ChevronRight size={16} /></button>
                    </div>
                    <div style={{ background: isPaused ? 'white' : '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div><h4 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>{currentChallenge.title}</h4><span style={{ fontSize: '0.8rem', background: isPaused ? '#fee2e2' : '#dcfce7', color: isPaused ? '#b91c1c' : '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>{isPaused ? "DIJEDA" : `Tipe ${overview?.user?.group || 'Umum'}`}</span></div>
                          <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowMenuId(showMenuId === 'active' ? null : 'active')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><MoreVertical size={20} color="#64748b" /></button>
                            {showMenuId === 'active' && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid #e2e8f0', zIndex: 10, width: '160px', overflow: 'hidden' }}>
                                  {isPaused ? (<button onClick={handleResumeChallenge} style={{ width: '100%', padding: '0.8rem', textAlign: 'left', background: '#ecfdf5', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#166534', fontWeight: '600' }}><PlayCircle size={16} /> Lanjut</button>) : (<button onClick={handlePauseChallenge} style={{ width: '100%', padding: '0.8rem', textAlign: 'left', background: 'white', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><PauseCircle size={16} /> Pause</button>)}
                                  <button onClick={handleStopChallenge} style={{ width: '100%', padding: '0.8rem', textAlign: 'left', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#ef4444' }}><StopCircle size={16} /> Berhenti</button>
                                </div>
                            )}
                          </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem' }}><span>Progress</span><span>{Math.round(progressPercent)}%</span></div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${progressPercent}%`, height: '100%', background: isPaused ? '#fbbf24' : 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div></div>
                          </div>
                      </div>
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                          <div><strong>{overview?.financial?.total_checkins || 0}</strong> <span style={{color: '#94a3b8'}}>Hari Check-in</span></div>
                          <div><strong>{overview?.user?.challenge_day || 1}</strong> <span style={{color: '#94a3b8'}}>Hari Berjalan</span></div>
                      </div>
                    </div>
                </CardContent>
              </Card>

              {/* REFERRAL & FRIEND QR */}
              <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                <Card style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', border: 'none' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Users size={20}/> Kode Referral</h3>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>Bagikan ke teman untuk dapat komisi.</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem', flex: 1 }}>{overview?.user?.referral_code}</span>
                          <button onClick={copyReferral} style={{ background: 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#4f46e5' }}><Copy size={16}/></button>
                      </div>
                    </CardContent>
                </Card>
                <Card style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setShowQRModal(true)}>
                    <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}><QrCode size={32}/></div>
                      <div><h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>Tambah Teman</h3><p style={{ fontSize: '0.85rem', color: '#64748b' }}>Scan QR / Input Kode Teman</p></div>
                    </CardContent>
                </Card>
              </div>

              {/* CHALLENGE LAIN & ARTIKEL */}
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
                  </div>
                </div>
                <div>
                  <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Artikel Kesehatan</h3>
                  <Card style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px' }}></div><div><h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Makanan Pereda Asam Lambung</h4><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 3 menit</span></div></li>
                      <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}><div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px' }}></div><div><h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Yoga untuk Pencernaan</h4><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baca 5 menit</span></div></li>
                    </ul>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* --- TAMPILAN HALAMAN DAFTAR TEMAN --- */}
          {activeTab === 'friends' && (
            <div>
               <div style={{ marginBottom: '2rem' }}>
                  <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Teman Sehat</h1>
                  <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>Jalin pertemanan, saling menyemangati!</p>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {/* CARD TAMBAH TEMAN */}
                  <Card style={{ background: '#f0fdf4', border: '1px dashed #16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }} onClick={() => setShowQRModal(true)}>
                      <div style={{ textAlign: 'center', color: '#166534' }}>
                          <div style={{ background: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}><QrCode size={24} /></div>
                          <h3 style={{ fontWeight: 'bold' }}>Tambah Teman</h3>
                      </div>
                  </Card>

                  {/* LIST TEMAN */}
                  {myFriends.map((friend, idx) => (
                      <Card key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => handleClickFriendFromList(friend.referral_code)}>
                          <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <User size={24} color="#2563eb" />
                              </div>
                              <div>
                                  <h4 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>{friend.name}</h4>
                                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                      <span style={{ color: '#16a34a', background: '#dcfce7', padding: '0 6px', borderRadius: '4px' }}>{friend.badge}</span>
                                      <span style={{ color: '#64748b' }}>• {friend.relation}</span>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
               </div>
               {myFriends.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                       <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                       <p>Belum ada teman. Yuk ajak teman bergabung!</p>
                   </div>
               )}
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL QR CODE & SEARCH FRIEND --- */}
      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowQRModal(false)}>
           <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Kode Pertemanan</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                 {!isScanning ? (
                    <>
                        <div style={{ background: 'white', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                            <QRCodeSVG value={`https://jagatetapsehat.com/friend/${overview?.user?.referral_code}`} size={160} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Tunjukkan ini ke teman Anda.</p>
                        <button onClick={() => setIsScanning(true)} style={{ marginTop: '1rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem auto 0' }}>
                            <Camera size={18}/> Scan QR (Kamera)
                        </button>
                    </>
                 ) : (
                    <div style={{ overflow: 'hidden', borderRadius: '12px', position: 'relative' }}>
                        <QrReader
                            onResult={handleScan}
                            constraints={{ facingMode: 'environment' }}
                            style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                        />
                        <button onClick={() => setIsScanning(false)} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <CameraOff size={16}/> Tutup Kamera
                        </button>
                    </div>
                 )}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
                 <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.8rem', color: '#334155' }}>Cari Teman</h4>
                 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input 
                       type="text" 
                       placeholder="Masukkan Kode Teman" 
                       value={friendCode} 
                       onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                       style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', textTransform: 'uppercase' }}
                    />
                    <button onClick={handleSearchFriend} disabled={searchLoading} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                       {searchLoading ? '...' : <Search size={18} />}
                    </button>
                 </div>

                 {friendData && (
                    <div onClick={handleOpenFriendProfile} style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'left', border: '1px solid #bbf7d0', cursor: 'pointer', transition: 'transform 0.2s', ':hover': {transform: 'scale(1.02)'} }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#16a34a"/></div>
                          <div>
                             <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{friendData.name}</div>
                             <div style={{ fontSize: '0.8rem', color: '#166534' }}>{friendData.badge}</div>
                          </div>
                       </div>
                       <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Klik untuk lihat profil</span>
                          <ChevronRight size={16} />
                       </div>
                    </div>
                 )}
              </div>

              <button onClick={() => setShowQRModal(false)} style={{ marginTop: '1.5rem', background: '#f1f5f9', border: 'none', padding: '0.5rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#334155', width: '100%' }}>Tutup</button>
           </div>
        </div>
      )}

      {/* --- MODAL FRIEND PROFILE --- */}
      {showFriendProfile && friendData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowFriendProfile(false)}>
           <div style={{ background: 'white', padding: '0', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: 'var(--gradient-hero)', padding: '2rem 1rem', color: '#1e293b' }}>
                 <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <User size={40} style={{ color: 'var(--primary)' }} />
                 </div>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{friendData.name}</h2>
                 <div style={{ background: 'white', color: '#ca8a04', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Medal size={16}/> {friendData.badge}
                 </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                 <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Sedang Mengikuti:</h4>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                       <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.3rem' }}>{friendData.challenge_title}</div>
                       <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Tipe {friendData.group || 'Umum'}</span>
                          <span>Hari ke-{friendData.challenge_day}</span>
                       </div>
                       <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.8rem', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(((friendData.total_checkins || 0)/30)*100, 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#f0fdf4', padding: '0.8rem', borderRadius: '8px' }}>
                       <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#166534' }}>{friendData.total_checkins}</div>
                       <div style={{ fontSize: '0.75rem', color: '#166534' }}>Total Check-in</div>
                    </div>
                    <div style={{ background: '#fff7ed', padding: '0.8rem', borderRadius: '8px' }}>
                       <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ea580c' }}>{friendData.challenge_day}</div>
                       <div style={{ fontSize: '0.75rem', color: '#ea580c' }}>Hari Berjalan</div>
                    </div>
                 </div>

                 <button onClick={() => setShowFriendProfile(false)} style={{ marginTop: '2rem', width: '100%', padding: '0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#334155' }}>Tutup Profil</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

const navItemStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: isActive ? 'var(--accent-wash)' : 'transparent', color: isActive ? 'var(--primary)' : '#475569', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: isActive ? '600' : '400', marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.2s'
});

export default UserDashboard;
