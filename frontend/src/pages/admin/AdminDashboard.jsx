import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, 
  Smartphone, DollarSign, Calendar, Plus, Award, Menu
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

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
  
  const [newChallengeCard, setNewChallengeCard] = useState({ title: '', description: '' });
  const [articleForm, setArticleForm] = useState({ title: '', content: '', image_url: '' });

  useEffect(() => {
    fetchStats();
    fetchChallengeCards();
    const handleResize = () => { if(window.innerWidth < 1024) setSidebarOpen(false); };
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

  // --- SAVE CONTENT CHALLENGE PER HARI ---
  const handleSaveDailyContent = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/campaign/store`, 
        { day_sequence: challengeDay, challenge_id: 1, ...challengeForm }, 
        { headers: getAuthHeader() }
      );
      alert(`Berhasil menyimpan konten Hari ke-${challengeDay}`);
    } catch (e) { alert("Gagal simpan konten harian"); }
  };

  // --- CREATE NEW CHALLENGE CARD ---
  const handleCreateChallengeCard = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/quiz/create-challenge`, newChallengeCard, { headers: getAuthHeader() });
      alert("Challenge Card Baru Berhasil Dibuat!");
      fetchChallengeCards();
    } catch (e) { alert("Gagal membuat card"); }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        if(id==='users') fetchUsers(); 
        if(id==='finance') fetchTransactions();
        if(window.innerWidth < 1024) setSidebarOpen(false);
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', padding: '1rem',
        background: activeTab === id ? 'var(--primary)' : 'transparent', border: 'none',
        color: activeTab === id ? 'white' : '#64748b', fontWeight: activeTab === id ? 'bold' : 'normal',
        borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
      }}
    >
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', position: 'relative' }}>
      
      {/* MOBILE OVERLAY */}
      {!isSidebarOpen && window.innerWidth < 1024 && (
        <button onClick={() => setSidebarOpen(true)} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 100, background: 'white', p: 2, borderRadius: '50%', border: '1px solid #ddd' }}>
          <Menu size={24} />
        </button>
      )}

      {/* SIDEBAR */}
      <aside style={{ 
        width: isSidebarOpen ? '260px' : '0px', 
        overflow: 'hidden',
        background: 'white', 
        borderRight: '1px solid #e2e8f0', 
        height: '100vh', 
        position: 'sticky', 
        top: 0, 
        padding: isSidebarOpen ? '1.5rem' : '0px', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.3s ease',
        zIndex: 90
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <LayoutDashboard /> Jates9 Admin
          </h2>
          {window.innerWidth < 1024 && <button onClick={() => setSidebarOpen(false)}><X size={20}/></button>}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="challenge_content" icon={Calendar} label="Isi Pesan 30 Hari" />
          <SidebarItem id="challenge_cards" icon={Award} label="Challenge Cards" />
          <SidebarItem id="users" icon={Users} label="User Management" />
          <SidebarItem id="finance" icon={DollarSign} label="Keuangan" />
          <SidebarItem id="articles" icon={PenTool} label="Artikel" />
        </nav>
        
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: '#fee2e2', border: 'none', padding: '1rem', borderRadius: '8px', cursor: 'pointer', marginTop: 'auto', fontWeight: 'bold' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: window.innerWidth < 768 ? '1rem' : '2.5rem', overflowY: 'auto' }}>
        
        {/* TAB OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Statistik Sistem</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <StatCard label="Total User" val={stats.total_users} icon={<Users/>} color="#3b82f6" />
              <StatCard label="WD Pending" val={stats.pending_withdrawals} icon={<Wallet/>} color="#f59e0b" />
              <StatCard label="Revenue" val={`Rp ${stats.total_revenue?.toLocaleString()}`} icon={<ShoppingCart/>} color="#10b981" />
            </div>
          </div>
        )}

        {/* TAB ISI PESAN CHALLENGE 30 HARI */}
        {activeTab === 'challenge_content' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Manajemen Pesan 30 Hari</h1>
            <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 'bold' }}>Pilih Hari:</label>
                <input type="number" min="1" max="30" value={challengeDay} onChange={(e) => setChallengeDay(e.target.value)} style={{ ...inputStyle, width: '80px' }} />
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {challengeDay % 5 === 0 ? "⚠️ Hari ini otomatis ada Soft Selling." : ""}
                  {challengeDay % 7 === 0 ? " ✅ Hari ini ada Evaluasi Mingguan." : ""}
                </p>
              </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <EditorBox title="Pagi (Challenge)" val={challengeForm.challenge_a} onChange={(v) => setChallengeForm({...challengeForm, challenge_a: v})} hint="Kirim jam 07:00" />
              <EditorBox title="Siang (Fakta/Tips)" val={challengeForm.fact_content} onChange={(v) => setChallengeForm({...challengeForm, fact_content: v})} hint="Setiap Hari - Edukasi" />
              {challengeDay % 5 === 0 && (
                <EditorBox title="Soft Selling" val={challengeForm.soft_sell_content} onChange={(v) => setChallengeForm({...challengeForm, soft_sell_content: v})} hint="Muncul per 5 hari" color="#f0fdf4" />
              )}
              {challengeDay % 7 === 0 && (
                <EditorBox title="Evaluasi Mingguan" val={challengeForm.evaluation_msg} onChange={(v) => setChallengeForm({...challengeForm, evaluation_msg: v})} hint="Muncul per 7 hari" color="#eff6ff" />
              )}
            </div>
            
            <button onClick={handleSaveDailyContent} className="btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '1rem' }}>
               <Send size={18} style={{marginRight: '8px'}}/> Simpan Konten Hari ke-{challengeDay}
            </button>
          </div>
        )}

        {/* TAB MANAGE CHALLENGE CARDS */}
        {activeTab === 'challenge_cards' && (
          <div className="animate-in fade-in duration-500">
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Challenge Cards</h1>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap: '2rem' }}>
              <Card style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Tambah Challenge Baru</h3>
                <input placeholder="Judul (Contoh: Detoks Liver)" style={{...inputStyle, marginBottom: '1rem'}} value={newChallengeCard.title} onChange={(e) => setNewChallengeCard({...newChallengeCard, title: e.target.value})} />
                <textarea placeholder="Deskripsi singkat..." style={{...inputStyle, height: '100px', marginBottom: '1rem'}} value={newChallengeCard.description} onChange={(e) => setNewChallengeCard({...newChallengeCard, description: e.target.value})} />
                <button onClick={handleCreateChallengeCard} className="btn-primary" style={{width: '100%'}}><Plus size={18}/> Tambah ke Database</button>
              </Card>

              <Card style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Challenge Aktif</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {challenges.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{c.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.description}</div>
                      </div>
                      <Award color="var(--primary)" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ... TAB USER & FINANCE TETAP SAMA NAMUN DIBUNGKUS RESPONSIVE ... */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500">
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>User Management</h1>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={thStyle}>Nama</th><th style={thStyle}>Badge</th><th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{u.name}<br/><span style={{fontSize:'0.7rem'}}>{u.phone}</span></td>
                      <td style={tdStyle}>
                        <select value={u.badge || "Pejuang Tangguh"} onChange={(e) => handleUpdateUser(u.id, 'badge', e.target.value)} style={{p:1, borderRadius:4}}>
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
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ label, val, icon, color }) => (
  <Card style={{ border: 'none', background: 'white', overflow: 'hidden' }}>
    <div style={{ height: '4px', background: color }}></div>
    <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>{label}</p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{val}</h3>
      </div>
      <div style={{ color: color, background: `${color}15`, padding: '0.75rem', borderRadius: '12px' }}>{icon}</div>
    </CardContent>
  </Card>
);

const EditorBox = ({ title, val, onChange, hint, color="white" }) => (
  <Card style={{ background: color }}>
    <CardHeader className="pb-2">
      <CardTitle style={{ fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        {title} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{hint}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <textarea 
        style={{ ...inputStyle, height: '120px', fontSize: '0.9rem' }} 
        value={val} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Tulis pesan ${title.toLowerCase()}...`}
      />
    </CardContent>
  </Card>
);

// --- STYLES ---
const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' };
const btnSmallStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' });
const thStyle = { padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' };
const tdStyle = { padding: '1rem', fontSize: '0.9rem' };

export default AdminDashboard;
