import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Activity, Users, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, 
  Package, ShoppingBag, ChevronLeft, Clock, CheckCircle, Calendar, RefreshCw, FileText,
  Camera, Bot, Sparkles, MapPin, Truck, Plus, Check, Bell, Edit2, Send, X, Loader,
  MessageSquareQuote, ShoppingCart, Play, Pause, Square, Target, TrendingUp, Zap, 
  Home, BookOpen, Shield, Trophy, AlertTriangle, Heart
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import HealthReport from './HealthReport'; // IMPORT COMPONENT BARU

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- KONFIGURASI TEMA ---
const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#10b981', light: '#dcfce7', text: '#047857', gradient: 'linear-gradient(135deg, #ecfdf5 0%, #10b981 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#3b82f6', light: '#dbeafe', text: '#1d4ed8', gradient: 'linear-gradient(135deg, #eff6ff 0%, #3b82f6 100%)' },
};

const UserDashboard = () => {
  const { user, getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState(THEMES.green); // Default Green
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // DATA STATES
  const [userData, setUserData] = useState(null);
  const [myChallenges, setMyChallenges] = useState([]); // List challenge yg diikuti
  const [selectedChallenge, setSelectedChallenge] = useState(null); // Challenge yg sedang dibuka detailnya
  const [dailyContent, setDailyContent] = useState(null); // Isi task hari ini
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [friendsData, setFriendsData] = useState({ friends: [], mentor: null });

  // MODAL STATES
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showHealthReport, setShowHealthReport] = useState(false); // Untuk toggle halaman Rapor
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);

  // CHECKIN FORM
  const [journalText, setJournalText] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);
  
  // Initialize
  useEffect(() => {
    fetchUserData();
    fetchMyChallenges();
  }, [refreshKey]);

  // Auto Select Challenge jika cuma 1 (Optional, tapi request user ingin list dulu)
  // Jadi biarkan user memilih dari list.

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { headers: getAuthHeader() });
      setUserData(res.data.user);
    } catch (e) { console.error(e); }
  };

  const fetchMyChallenges = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/my-challenges`, { headers: getAuthHeader() });
      setMyChallenges(res.data);
    } catch (e) { console.error("Gagal load challenge"); }
    setLoading(false);
  };

  const fetchDailyContent = async (challengeId) => {
    setLoading(true);
    try {
      // Ambil konten harian berdasarkan challenge ID
      const res = await axios.get(`${BACKEND_URL}/api/daily-content?challenge_id=${challengeId}`, { headers: getAuthHeader() });
      setDailyContent(res.data);
      
      // Ambil history khusus challenge ini untuk rapor
      const histRes = await axios.get(`${BACKEND_URL}/api/user/checkin-history`, { headers: getAuthHeader() });
      // Filter history client-side atau backend (disini filter client side dulu berdasarkan challenge_id nanti di HealthReport)
      const filteredHistory = histRes.data.filter(log => log.challenge_id === challengeId || !log.challenge_id); // Handle legacy logs without ID
      setCheckinHistory(filteredHistory);

    } catch (e) { console.error("Gagal load daily content"); }
    setLoading(false);
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() });
      setFriendsData(res.data);
    } catch (e) {}
  };

  // --- HANDLERS ---
  const handleOpenChallengeDetail = (challenge) => {
    setSelectedChallenge(challenge);
    fetchDailyContent(challenge.id);
    setShowHealthReport(false); // Reset view ke detail, bukan rapor
  };

  const handleBackToChallengeList = () => {
    setSelectedChallenge(null);
    setDailyContent(null);
    setShowHealthReport(false);
  };

  const handleCheckinSubmit = async () => {
    if(!dailyContent) return;
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/checkin`, {
        challenge_id: selectedChallenge.id,
        journal: journalText,
        status: 'completed',
        completed_tasks: completedTasks // Kirim array tugas yg dicentang
      }, { headers: getAuthHeader() });
      
      alert("Check-in Berhasil! 🎉");
      setShowCheckinModal(false);
      fetchDailyContent(selectedChallenge.id); // Refresh data
      setRefreshKey(p => p+1); // Refresh user data (poin/badge)
    } catch (e) {
      alert("Gagal Checkin: " + (e.response?.data?.message || e.message));
    }
    setLoading(false);
  };

  const handleTaskToggle = (task) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter(t => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  // --- UI COMPONENTS ---

  // 1. REUSABLE RESPONSIVE MODAL
  const ResponsiveModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }} onClick={onClose}>
        <div style={{
          background: 'white', width: '100%', maxWidth: '450px',
          borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          animation: 'slideUp 0.3s ease-out', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>{title}</h3>
            <button onClick={onClose} style={{ background: '#e2e8f0', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          {/* Content (Scrollable) */}
          <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
        <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      </div>
    );
  };

  // --- RENDER CONTENT BASED ON TABS ---

  const renderHome = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Halo, {userData?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Semangat sehat hari ini!</p>
        </div>
        <div onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
          {userData?.profile_picture ? (
            <img src={`${BACKEND_URL}${userData.profile_picture}`} alt="Profile" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.primary}` }} />
          ) : (
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary }}>
              <User size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Banner / Stat */}
      <Card style={{ background: theme.gradient, border: 'none', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#064e3b', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Badge Saat Ini</p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#065f46' }}>{userData?.badge || 'Pejuang Sehat'}</h2>
          </div>
          <Trophy size={40} color="#065f46" style={{ opacity: 0.8 }} />
        </div>
      </Card>

      {/* SECTION CHALLENGE */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Tantangan Saya</h3>
      
      {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader className="animate-spin" style={{margin:'0 auto'}}/></div> : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {myChallenges.length > 0 ? myChallenges.map(chal => (
            <Card key={chal.id} onClick={() => { setActiveTab('challenge'); handleOpenChallengeDetail(chal); }} 
              style={{ padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', background:'white', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom:'0.5rem' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>{chal.title}</h4>
                <span style={{ background: theme.light, color: theme.text, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  Hari {chal.current_day}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {chal.description}
              </p>
              <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '3px' }}>
                <div style={{ width: `${(chal.current_day / 30) * 100}%`, background: theme.primary, height: '100%', borderRadius: '3px' }}></div>
              </div>
            </Card>
          )) : (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Kamu belum mengikuti challenge apapun.</p>
              <button style={{ marginTop: '1rem', color: theme.primary, fontWeight: 'bold', background: 'none', border: 'none' }}>+ Cari Challenge Baru</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderChallengeTab = () => {
    // 1. Jika User belum memilih challenge dari list
    if (!selectedChallenge) {
      return (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Pilih Challenge Aktif</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {myChallenges.map(chal => (
              <div key={chal.id} onClick={() => handleOpenChallengeDetail(chal)} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${theme.light}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{chal.title}</h3>
                    <ChevronRight color="#94a3b8"/>
                </div>
                <div style={{marginTop:'0.5rem', display:'flex', gap:'0.5rem'}}>
                    <span style={{fontSize:'0.8rem', background:'#f1f5f9', padding:'2px 8px', borderRadius:'6px'}}>Hari {chal.current_day}/30</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Jika Sedang Melihat Rapor Perkembangan
    if (showHealthReport) {
      return (
        <HealthReport 
          user={userData}
          logs={checkinHistory} 
          challengeTitle={selectedChallenge.title} 
          onClose={() => setShowHealthReport(false)} 
          theme={theme}
        />
      );
    }

    // 3. Detail Challenge (Daily Task)
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
        <button onClick={handleBackToChallengeList} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}>
          <ChevronLeft size={18} /> Kembali ke List
        </button>

        {/* Card Header Challenge */}
        <Card style={{ background: theme.gradient, color: '#064e3b', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', border: 'none' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.2rem' }}>Hari ke-{dailyContent?.day || 1}</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>{selectedChallenge.title}</p>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            {/* Tombol Lihat Rapor */}
            <button 
              onClick={() => setShowHealthReport(true)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.5)', padding: '0.6rem', borderRadius: '8px', color: '#065f46', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}
            >
              <TrendingUp size={16} /> Lihat Rapor
            </button>
          </div>
        </Card>

        {/* Daily Tasks */}
        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Misi Hari Ini</h3>
        {loading ? <Loader className="animate-spin" style={{margin:'2rem auto', display:'block'}}/> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dailyContent?.tasks?.map((task, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: theme.light, padding: '0.5rem', borderRadius: '8px', color: theme.text, fontWeight: 'bold' }}>{idx + 1}</div>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#334155' }}>{task}</div>
              </div>
            ))}
            
            {/* Tombol Check-in */}
            <button 
              onClick={() => {
                if (dailyContent?.today_status === 'completed') return;
                setCompletedTasks([]); // Reset selection
                setShowCheckinModal(true);
              }}
              disabled={dailyContent?.today_status === 'completed'}
              style={{
                width: '100%', padding: '1rem', marginTop: '1rem',
                background: dailyContent?.today_status === 'completed' ? '#cbd5e1' : theme.primary,
                color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem',
                cursor: dailyContent?.today_status === 'completed' ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: dailyContent?.today_status === 'completed' ? 'none' : '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
              }}
            >
              {dailyContent?.today_status === 'completed' ? <><CheckCircle size={20} /> Misi Selesai</> : '✅ Lapor Check-in'}
            </button>
          </div>
        )}

        {/* Info Box (Fact) */}
        {dailyContent?.fact && (
          <div style={{ marginTop: '2rem', background: '#fffbeb', padding: '1rem', borderRadius: '12px', border: '1px solid #fcd34d' }}>
            <h4 style={{ fontWeight: 'bold', color: '#b45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} /> Tahukah Kamu?</h4>
            <p style={{ fontSize: '0.9rem', color: '#92400e', lineHeight: '1.5' }}>{dailyContent.fact}</p>
          </div>
        )}
      </div>
    );
  };

  const renderFriendsTab = () => (
    <div className="animate-fade-in">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem' }}>Teman Sehat</h2>
        
        {/* Card Referral Code */}
        <Card style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Kode Referral Kamu</p>
            <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '1rem' }}>{userData?.referral_code || '...'}</div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Bagikan kode ini untuk mengundang teman!</p>
        </Card>

        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Mentor & Teman</h3>
        {/* Placeholder List Teman */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', textAlign: 'center' }}>
            <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#64748b' }}>Fitur Teman Sehat akan segera hadir!</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pantau progress teman kamu di sini nanti.</p>
        </div>
    </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>

      {/* Main Content Area */}
      <div style={{ padding: '1.5rem', paddingBottom: '100px' }}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'challenge' && renderChallengeTab()}
        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'profile' && <div style={{textAlign:'center', padding:'2rem'}}><User size={48} style={{margin:'0 auto'}}/><p>Profile Page Placeholder</p><button onClick={logout} style={{color:'red', marginTop:'1rem'}}>Logout</button></div>}
      </div>

      {/* BOTTOM NAVIGATION (Responsive Fixed) */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', background: 'white',
        borderTop: '1px solid #e2e8f0', padding: '0.8rem 1rem',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 50
      }}>
        <NavBtn icon={Home} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); handleBackToChallengeList(); }} theme={theme} />
        <NavBtn icon={Target} label="Challenge" active={activeTab === 'challenge'} onClick={() => setActiveTab('challenge')} theme={theme} />
        <NavBtn icon={Users} label="Teman" active={activeTab === 'friends'} onClick={() => { setActiveTab('friends'); fetchFriends(); }} theme={theme} />
        <NavBtn icon={User} label="Profil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} theme={theme} />
      </div>

      {/* --- MODALS (RESPONSIVE) --- */}

      {/* CHECK-IN MODAL */}
      <ResponsiveModal isOpen={showCheckinModal} onClose={() => setShowCheckinModal(false)} title="Laporan Harian">
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>Centang misi yang berhasil kamu lakukan:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {dailyContent?.tasks?.map((task, idx) => (
            <div key={idx} onClick={() => handleTaskToggle(task)} 
              style={{ 
                padding: '0.8rem', borderRadius: '8px', border: `1px solid ${completedTasks.includes(task) ? theme.primary : '#e2e8f0'}`, 
                background: completedTasks.includes(task) ? theme.light : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' 
              }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${completedTasks.includes(task) ? theme.primary : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: completedTasks.includes(task) ? theme.primary : 'white' }}>
                {completedTasks.includes(task) && <Check size={14} color="white" />}
              </div>
              <span style={{ fontSize: '0.9rem', color: completedTasks.includes(task) ? theme.text : '#334155' }}>{task}</span>
            </div>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>Catatan Jurnal (Opsional)</label>
        <textarea 
          placeholder="Gimana perasaanmu hari ini?" 
          value={journalText} onChange={(e) => setJournalText(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', fontSize: '0.9rem', marginBottom: '1.5rem' }}
        />

        <button onClick={handleCheckinSubmit} disabled={loading} style={{ width: '100%', padding: '1rem', background: theme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem' }}>
          {loading ? <Loader className="animate-spin" /> : <Send size={18} />} Kirim Laporan
        </button>
      </ResponsiveModal>

    </div>
  );
};

const NavBtn = ({ icon: Icon, label, active, onClick, theme }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: active ? theme.primary : '#94a3b8', transition: 'all 0.2s' }}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span style={{ fontSize: '0.7rem', fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
  </button>
);

export default UserDashboard;
