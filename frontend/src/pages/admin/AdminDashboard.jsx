import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, 
  Smartphone, DollarSign, Calendar, Plus, Award, Menu, Sparkles, Trash2, Clock
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
  const [btnLoading, setBtnLoading] = useState(false);

  // Data States (Sediakan default array [] agar tidak blank saat render awal)
  const [stats, setStats] = useState({ total_users: 0, pending_withdrawals: 0, total_revenue: 0 });
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);

  // Form States
  const [challengeDay, setChallengeDay] = useState(1);
  const [challengeForm, setChallengeForm] = useState({
    challenge_a: '', challenge_b: '', challenge_c: '',
    fact_content: '', soft_sell_content: '', evaluation_msg: ''
  });
  const [newChallengeTitle, setNewChallengeTitle] = useState("");

  // Load Data awal
  useEffect(() => {
    fetchStats();
    fetchChallengeCards();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeader() });
      setStats(res.data);
    } catch (e) { console.error("Fetch Stats Error:", e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: getAuthHeader() });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Fetch Users Error:", e); setUsers([]); }
  };

  const fetchChallengeCards = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Fetch Challenges Error:", e); setChallenges([]); }
  };

  const handleGenerateChallengeAI = async () => {
    if(!newChallengeTitle) return alert("Masukkan judul tantangan!");
    setBtnLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/quiz/generate-challenge-auto`, 
        { title: newChallengeTitle }, 
        { headers: getAuthHeader() }
      );
      alert("AI Berhasil membuat Challenge!");
      setNewChallengeTitle("");
      fetchChallengeCards();
    } catch (e) { alert("Gagal generate AI."); }
    setBtnLoading(false);
  };

  const handleDeleteChallenge = async (id) => {
    if(!window.confirm("Hapus tantangan ini secara permanen?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/quiz/delete-challenge/${id}`, { headers: getAuthHeader() });
      setChallenges(challenges.filter(c => c.id !== id));
    } catch (e) { alert("Gagal menghapus."); }
  };

  const getChallengeStatus = (createdAt) => {
    if(!createdAt) return { day: 1, percent: 0, expired: false };
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
    return {
      day: diffDays > 30 ? 30 : diffDays,
      percent: Math.min((diffDays / 30) * 100, 100),
      expired: diffDays > 30
    };
  };

  const handleSaveDailyContent = async () => {
    setBtnLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/campaign/store`, 
        { day_sequence: challengeDay, challenge_id: 1, ...challengeForm }, 
        { headers: getAuthHeader() }
      );
      alert(`Berhasil menyimpan konten Hari ke-${challengeDay}`);
    } catch (e) { alert("Gagal simpan konten."); }
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
      onClick={() => { setActiveTab(id); if(id==='users') fetchUsers(); if(window.innerWidth <= 1024) setSidebarOpen(false); }}
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#f8fafc', zIndex: 99999, display: 'flex', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: isSidebarOpen ? '260px' : '0px', transition: 'all 0.3s ease', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', position: 'relative', zIndex: 101, display: 'flex', flexDirection: 'column', visibility: isSidebarOpen ? 'visible' : 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}> <Bot size={20} /> Jates Admin</h2>
        </div>
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="challenge_cards" icon={Award} label="Card Challenge AI" />
          <SidebarItem id="challenge_content" icon={Calendar} label="Broadcast 30 Hari" />
          <SidebarItem id="users" icon={Users} label="User & Badge" />
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', width: '100%', padding: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}> <LogOut size={18} /> Logout </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between' }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}> <Menu size={20}/> </button>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>{activeTab.toUpperCase()}</span>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {/* TAB OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in">
              <h1 className="heading-2" style={{marginBottom:'1.5rem'}}>Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard label="Total User" val={stats.total_users} icon={<Users/>} color="#3b82f6" />
                <StatCard label="WD Pending" val={stats.pending_withdrawals} icon={<Wallet/>} color="#f59e0b" />
                <StatCard label="Revenue" val={`Rp ${stats.total_revenue?.toLocaleString()}`} icon={<ShoppingCart/>} color="#10b981" />
              </div>
            </div>
          )}

          {/* TAB CHALLENGE CARDS */}
          {activeTab === 'challenge_cards' && (
            <div className="animate-in fade-in">
              <h1 className="heading-2" style={{marginBottom:'1rem'}}>Challenge Card AI</h1>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap: '1.5rem' }}>
                <Card style={{ padding: '1.5rem', background: 'white', height: 'fit-content' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems:'center', gap: '5px' }}><Sparkles size={18} color="blue"/> Buat Challenge Baru</h3>
                  <input placeholder="Judul Tantangan..." style={{ ...inputStyle, marginBottom: '1rem' }} value={newChallengeTitle} onChange={(e) => setNewChallengeTitle(e.target.value)} />
                  <button onClick={handleGenerateChallengeAI} disabled={btnLoading} className="btn-primary" style={{ width: '100%' }}>
                    {btnLoading ? <Loader2 className="animate-spin" /> : 'Generate via AI'}
                  </button>
                </Card>

                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Timeline Challenge</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {challenges.length === 0 ? <p>Belum ada tantangan.</p> : challenges.map(c => {
                      const status = getChallengeStatus(c.created_at);
                      return (
                        <Card key={c.id} style={{ padding: '1.25rem', background: status.expired ? '#fff1f2' : 'white', border: status.expired ? '1px solid #fda4af' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{c.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dibuat: {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {status.expired ? 
                                    <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', height: 'fit-content' }}>EXPIRED</span> 
                                    : <span style={{ background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', height: 'fit-content' }}>ACTIVE</span>
                                }
                                <button onClick={() => handleDeleteChallenge(c.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18}/></button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem' }}>{c.description}</div>
                          <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                             <div style={{ width: `${status.percent}%`, height: '100%', background: status.expired ? '#ef4444' : '#3b82f6', transition: 'width 0.5s ease' }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem', fontWeight: '600', color: '#64748b' }}>
                             <span>Hari ke-{status.day}</span><span>Target 30 Hari</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB BROADCAST CONTENT */}
          {activeTab === 'challenge_content' && (
            <div className="animate-in fade-in">
              <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Broadcast Manager</h1>
              <Card style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Calendar />
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Edit Konten Hari Ke-</label>
                  <input type="number" min="1" max="30" value={challengeDay} onChange={(e) => setChallengeDay(e.target.value)} style={{ ...inputStyle, width: '100px', marginLeft: '10px' }} />
                </div>
              </Card>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <EditorBox title="Challenge (Pagi)" val={challengeForm.challenge_a} onChange={(v) => setChallengeForm({...challengeForm, challenge_a: v})} hint="07:00 WIB" />
                <EditorBox title="Fakta (Siang)" val={challengeForm.fact_content} onChange={(v) => setChallengeForm({...challengeForm, fact_content: v})} hint="12:00 WIB" />
                {challengeDay % 5 === 0 && <EditorBox title="Soft Sell" val={challengeForm.soft_sell_content} onChange={(v) => setChallengeForm({...challengeForm, soft_sell_content: v})} color="#f0fdf4" />}
                {challengeDay % 7 === 0 && <EditorBox title="Evaluasi" val={challengeForm.evaluation_msg} onChange={(v) => setChallengeForm({...challengeForm, evaluation_msg: v})} color="#fff7ed" />}
              </div>
              <button onClick={handleSaveDailyContent} className="btn-primary" style={{ marginTop: '2rem', width: '100%' }}>Simpan Konten</button>
            </div>
          )}

          {/* TAB USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in">
              <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>User & Badge</h1>
              <Card style={{ overflowX: 'auto', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr><th style={thStyle}>User</th><th style={thStyle}>Badge</th><th style={thStyle}>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? <tr><td colSpan="3" style={{padding:'2rem', textAlign:'center'}}>Tidak ada data user.</td></tr> : users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}><b>{u.name}</b><br/>{u.phone}</td>
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

const StatCard = ({ label, val, icon, color }) => (
  <Card style={{ border: 'none', background: 'white', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ height: '4px', background: color }}></div>
    <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>{label}</p><h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{val || 0}</h3></div>
      <div style={{ color: color, background: `${color}15`, padding: '0.75rem', borderRadius: '12px' }}>{icon}</div>
    </CardContent>
  </Card>
);

const EditorBox = ({ title, val, onChange, hint, color="white" }) => (
  <Card style={{ background: color, border: '1px solid #e2e8f0' }}>
    <CardHeader style={{ padding: '1rem' }}><CardTitle style={{ fontSize: '0.85rem' }}>{title} <small style={{color:'#94a3b8'}}>{hint}</small></CardTitle></CardHeader>
    <CardContent style={{ padding: '1rem' }}>
      <textarea style={{ ...inputStyle, height: '100px' }} value={val} onChange={(e) => onChange(e.target.value)} placeholder={`Ketik ${title}...`} />
    </CardContent>
  </Card>
);

const inputStyle = { width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' };
const selectStyle = { padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' };
const btnSmallStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' });
const thStyle = { padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' };
const tdStyle = { padding: '1rem', fontSize: '0.85rem' };

export default AdminDashboard;
