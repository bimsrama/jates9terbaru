import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, 
  Smartphone, DollarSign, Calendar, Plus, Award, Menu, Sparkles
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const GEN_Z_BADGES = [
  "Pejuang Tangguh", "Si Paling Sehat", "Usus Glowing", "Lord of Fiber", 
  "Anti Kembung Club", "King of Metabolism", "Sepuh Jates9", "Healing Master"
];

const AdminDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // Data States
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState({ withdrawals: [], purchases: [] });
  const [challenges, setChallenges] = useState([]);

  // Form States
  const [challengeDay, setChallengeDay] = useState(1);
  const [challengeForm, setChallengeForm] = useState({
    challenge_a: '', challenge_b: '', challenge_c: '',
    fact_content: '', soft_sell_content: '', evaluation_msg: ''
  });
  
  const [newChallengeTitle, setNewChallengeTitle] = useState("");

  useEffect(() => {
    fetchStats();
    fetchChallengeCards();
    const handleResize = () => {
        const isDesktop = window.innerWidth > 1024;
        if (isDesktop) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeader() });
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: getAuthHeader() });
      setUsers(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchChallengeCards = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(res.data);
    } catch (e) { console.error(e); }
  };

  const handleGenerateChallengeAI = async () => {
    if(!newChallengeTitle) return alert("Masukkan judul tantangan!");
    setBtnLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/quiz/generate-challenge-auto`, 
        { title: newChallengeTitle }, 
        { headers: getAuthHeader() }
      );
      alert("AI Berhasil membuat Challenge & Kuis!");
      setNewChallengeTitle("");
      fetchChallengeCards();
    } catch (e) { alert("Gagal generate AI."); }
    setBtnLoading(false);
  };

  const handleSaveDailyContent = async () => {
    setBtnLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/campaign/store`, 
        { day_sequence: challengeDay, challenge_id: 1, ...challengeForm }, 
        { headers: getAuthHeader() }
      );
      alert(`Berhasil menyimpan konten Hari ke-${challengeDay}`);
    } catch (e) { alert("Gagal simpan."); }
    setBtnLoading(false);
  };

  const handleUpdateUser = async (userId, type, value) => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/users/update-role`, { user_id: userId, [type]: value }, { headers: getAuthHeader() });
      fetchUsers(); 
    } catch (e) { alert("Gagal update user"); }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        if(id==='users') fetchUsers(); 
        if(window.innerWidth <= 1024) setSidebarOpen(false);
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', padding: '0.85rem 1rem',
        background: activeTab === id ? 'var(--primary)' : 'transparent', border: 'none',
        color: activeTab === id ? 'white' : '#64748b', fontWeight: activeTab === id ? '600' : '400',
        borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginBottom: '0.25rem'
      }}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    // FULL CANVAS WRAPPER
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      background: '#f8fafc', zIndex: 99999, display: 'flex', overflow: 'hidden' 
    }}>
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div 
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside style={{ 
        width: isSidebarOpen ? '260px' : '0px', 
        position: window.innerWidth <= 1024 ? 'fixed' : 'relative',
        left: 0, top: 0, bottom: 0,
        background: 'white', borderRight: '1px solid #e2e8f0', 
        zIndex: 101, display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        visibility: isSidebarOpen ? 'visible' : 'hidden'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Bot size={24} /> Jates Admin
          </h2>
          {window.innerWidth <= 1024 && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none' }}><X size={20}/></button>}
        </div>
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="challenge_cards" icon={Award} label="Card Challenge AI" />
          <SidebarItem id="challenge_content" icon={Calendar} label="Broadcast 30 Hari" />
          <SidebarItem id="users" icon={Users} label="User & Badge" />
          <SidebarItem id="finance" icon={DollarSign} label="Keuangan" />
          <SidebarItem id="articles" icon={PenTool} label="Artikel" />
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', width: '100%', padding: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* HEADER BAR */}
        <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <Menu size={20}/>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                Admin Mode
            </span>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto', padding: window.innerWidth < 768 ? '1rem' : '2rem' }}>
          
          {/* TAB OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-500">
              <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard label="Total User" val={stats.total_users} icon={<Users/>} color="#3b82f6" />
                <StatCard label="WD Pending" val={stats.pending_withdrawals} icon={<Wallet/>} color="#f59e0b" />
                <StatCard label="Revenue" val={`Rp ${stats.total_revenue?.toLocaleString()}`} icon={<ShoppingCart/>} color="#10b981" />
              </div>
            </div>
          )}

          {/* TAB CARD CHALLENGE AI */}
          {activeTab === 'challenge_cards' && (
            <div className="animate-in fade-in duration-500">
              <div style={{ marginBottom: '2rem' }}>
                <h1 className="heading-2">Challenge Cards AI</h1>
                <p style={{ color: '#64748b' }}>AI akan membuatkan deskripsi dan kuis otomatis berdasarkan judul anda.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.2fr 1fr', gap: '2rem' }}>
                <Card style={{ padding: '1.5rem', border: '2px dashed #cbd5e1', background: 'white' }}>
                  <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                       <Sparkles color="#3b82f6" />
                    </div>
                    <h3 style={{ fontWeight: 'bold' }}>Auto-Generate Challenge</h3>
                  </div>
                  <input 
                    placeholder="Contoh: Tantangan Detox Liver 15 Hari" 
                    style={{ ...inputStyle, marginBottom: '1rem' }} 
                    value={newChallengeTitle} 
                    onChange={(e) => setNewChallengeTitle(e.target.value)}
                  />
                  <button onClick={handleGenerateChallengeAI} disabled={btnLoading} className="btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
                    {btnLoading ? <Loader2 className="animate-spin" /> : <><Bot size={18}/> Generate via AI</>}
                  </button>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontWeight: 'bold' }}>Challenge Saat Ini</h3>
                  {challenges.map(c => (
                    <Card key={c.id} style={{ padding: '1rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{c.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{c.description?.substring(0, 80)}...</div>
                        </div>
                        <Award size={20} color="#eab308" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB BROADCAST CONTENT */}
          {activeTab === 'challenge_content' && (
            <div className="animate-in fade-in duration-500">
              <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Broadcast Manager 30 Hari</h1>
              <Card style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Calendar size={20} color="var(--primary)" />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Edit Konten Hari Ke-</label>
                  <input type="number" min="1" max="30" value={challengeDay} onChange={(e) => setChallengeDay(e.target.value)} style={{ ...inputStyle, width: '100px', marginLeft: '10px' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   {challengeDay % 5 === 0 && <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>PROMO</span>}
                   {challengeDay % 7 === 0 && <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>EVALUASI</span>}
                </div>
              </Card>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <EditorBox title="Challenge (Pagi)" val={challengeForm.challenge_a} onChange={(v) => setChallengeForm({...challengeForm, challenge_a: v})} hint="07:00 WIB" />
                <EditorBox title="Fakta & Tips (Siang)" val={challengeForm.fact_content} onChange={(v) => setChallengeForm({...challengeForm, fact_content: v})} hint="12:00 WIB" />
                {challengeDay % 5 === 0 && (
                  <EditorBox title="Soft Selling" val={challengeForm.soft_sell_content} onChange={(v) => setChallengeForm({...challengeForm, soft_sell_content: v})} color="#f0fdf4" hint="Link Produk" />
                )}
                {challengeDay % 7 === 0 && (
                  <EditorBox title="Evaluasi" val={challengeForm.evaluation_msg} onChange={(v) => setChallengeForm({...challengeForm, evaluation_msg: v})} color="#fff7ed" hint="Mingguan" />
                )}
              </div>

              <button onClick={handleSaveDailyContent} disabled={btnLoading} className="btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '1rem', fontSize: '1rem' }}>
                {btnLoading ? <Loader2 className="animate-spin" /> : 'Simpan Konten Hari Ini'}
              </button>
            </div>
          )}

          {/* TAB USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in duration-500">
              <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>User Management</h1>
              <Card style={{ overflowX: 'auto', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={thStyle}>User Info</th><th style={thStyle}>Badge / Gelar</th><th style={thStyle}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.phone}</div>
                        </td>
                        <td style={tdStyle}>
                          <select value={u.badge || "Pejuang Tangguh"} onChange={(e) => handleUpdateUser(u.id, 'badge', e.target.value)} style={selectStyle}>
                            {GEN_Z_BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => handleUpdateUser(u.id, 'role', u.role==='admin'?'user':'admin')} style={btnSmallStyle(u.role==='admin'?'#ef4444':'#3b82f6')}>
                            {u.role==='admin'?'Revoke':'Set Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---
const StatCard = ({ label, val, icon, color }) => (
  <Card style={{ border: 'none', background: 'white', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ height: '4px', background: color }}></div>
    <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>{label}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{val || 0}</h3>
      </div>
      <div style={{ color: color, background: `${color}15`, padding: '0.75rem', borderRadius: '12px' }}>{icon}</div>
    </CardContent>
  </Card>
);

const EditorBox = ({ title, val, onChange, hint, color="white" }) => (
  <Card style={{ background: color, border: '1px solid #e2e8f0' }}>
    <CardHeader style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
      <CardTitle style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal' }}>{hint}</span>
      </CardTitle>
    </CardHeader>
    <CardContent style={{ padding: '1rem' }}>
      <textarea 
        style={{ ...inputStyle, height: '140px', fontSize: '0.85rem', background: 'transparent', lineHeight: '1.6' }} 
        value={val} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Ketik konten ${title.toLowerCase()}...`}
      />
    </CardContent>
  </Card>
);

// --- STYLES ---
const inputStyle = { width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' };
const selectStyle = { padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', width: '100%', maxWidth: '180px' };
const btnSmallStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' });
const thStyle = { padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '1rem', fontSize: '0.85rem', color: '#334155' };

export default AdminDashboard;
