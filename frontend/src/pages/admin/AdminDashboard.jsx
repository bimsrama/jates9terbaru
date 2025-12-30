import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, DollarSign, LayoutDashboard, 
  FileText, Shield, Award, PenTool, Check, X, Loader2, Bot, LogOut
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- DAFTAR BADGE GEN Z ---
const GEN_Z_BADGES = [
  "Pejuang Tangguh", // Default
  "Si Paling Sehat",
  "Usus Glowing",
  "Lord of Fiber",
  "Anti Kembung Club",
  "King of Metabolism",
  "Sepuh Jates9",
  "Healing Master"
];

const AdminDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // State Navigasi
  const [activeTab, setActiveTab] = useState('overview'); // overview, challenges, users, finance, articles
  const [loading, setLoading] = useState(false);

  // State Data
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState({ withdrawals: [], purchases: [] });
  
  // State Form Challenge AI
  const [challengeForm, setChallengeForm] = useState({ 
    day_sequence: '', topic: '', content: null 
  });
  const [aiLoading, setAiLoading] = useState(false);

  // State Form Artikel
  const [articleForm, setArticleForm] = useState({ title: '', content: '', image_url: '' });

  // --- LOAD DATA ---
  useEffect(() => {
    fetchStats();
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

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/transactions`, { headers: getAuthHeader() });
      setTransactions(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // --- ACTIONS ---
  const handleGenerateAI = async () => {
    if(!challengeForm.day_sequence || !challengeForm.topic) return alert("Isi hari dan topik dulu!");
    setAiLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/generate-challenge-content`,
        { day: challengeForm.day_sequence, topic: challengeForm.topic },
        { headers: getAuthHeader() }
      );
      if (res.data.success) {
        setChallengeForm(prev => ({ ...prev, content: res.data.data }));
      }
    } catch (e) { alert("Gagal generate AI. Cek server."); }
    setAiLoading(false);
  };

  const handleSaveChallenge = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/campaign/store`,
        {
          challenge_id: 1, 
          day_sequence: challengeForm.day_sequence,
          ...challengeForm.content
        },
        { headers: getAuthHeader() }
      );
      alert("Challenge Berhasil Disimpan!");
      setChallengeForm({ day_sequence: '', topic: '', content: null });
    } catch (e) { alert("Gagal simpan."); }
  };

  const handleUpdateUser = async (userId, type, value) => {
    try {
      const payload = { user_id: userId };
      if (type === 'role') payload.role = value;
      if (type === 'badge') payload.badge = value;
      
      await axios.post(`${BACKEND_URL}/api/admin/users/update-role`, payload, { headers: getAuthHeader() });
      fetchUsers(); // Refresh data user
    } catch (e) { alert("Gagal update user"); }
  };

  const handleUpdateTransaction = async (id, type, status) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/transaction/update`,
        { id, type, status },
        { headers: getAuthHeader() }
      );
      fetchTransactions();
    } catch (e) { alert("Gagal update transaksi"); }
  };

  const handleCreateArticle = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/article/create`, articleForm, { headers: getAuthHeader() });
      alert("Artikel Diterbitkan!");
      setArticleForm({ title: '', content: '', image_url: '' });
    } catch (e) { alert("Gagal buat artikel"); }
  };

  // --- RENDER SIDEBAR ITEM ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); if(id==='users') fetchUsers(); if(id==='finance') fetchTransactions(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', padding: '1rem',
        background: activeTab === id ? '#eff6ff' : 'transparent', border: 'none',
        color: activeTab === id ? '#2563eb' : '#64748b', fontWeight: activeTab === id ? 'bold' : 'normal',
        borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
      }}
    >
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* SIDEBAR ADMIN */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', position: 'sticky', top: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Admin Panel</h2>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
          <SidebarItem id="challenges" icon={Bot} label="AI Challenge Gen" />
          <SidebarItem id="users" icon={Users} label="User Management" />
          <SidebarItem id="finance" icon={DollarSign} label="Keuangan" />
          <SidebarItem id="articles" icon={PenTool} label="Buat Artikel" />
        </nav>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'none', border: 'none', padding: '1rem', cursor: 'pointer', marginTop: 'auto' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* === TAB OVERVIEW === */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
            <div className="ai-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <Card><CardContent style={{padding:'1.5rem', textAlign:'center'}}>
                <Users size={32} color="#2563eb" style={{margin:'0 auto 1rem'}}/>
                <h3>{stats.total_users || 0}</h3><p>Total User</p>
              </CardContent></Card>
              <Card><CardContent style={{padding:'1.5rem', textAlign:'center'}}>
                <Wallet size={32} color="#ea580c" style={{margin:'0 auto 1rem'}}/>
                <h3>{stats.pending_withdrawals || 0}</h3><p>Pending Withdraw</p>
              </CardContent></Card>
              <Card><CardContent style={{padding:'1.5rem', textAlign:'center'}}>
                <ShoppingCart size={32} color="#16a34a" style={{margin:'0 auto 1rem'}}/>
                <h3>Rp {(stats.total_revenue || 0).toLocaleString()}</h3><p>Total Revenue</p>
              </CardContent></Card>
            </div>
          </div>
        )}

        {/* === TAB CHALLENGE AI GENERATOR === */}
        {activeTab === 'challenges' && (
          <div style={{ maxWidth: '700px' }}>
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>AI Challenge Creator</h1>
            <Card style={{ padding: '1.5rem', background: 'white' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Hari Ke- (Angka)</label>
                <input type="number" style={inputStyle} value={challengeForm.day_sequence} onChange={(e) => setChallengeForm({...challengeForm, day_sequence: e.target.value})} placeholder="Contoh: 1" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Topik Tantangan</label>
                <input type="text" style={inputStyle} value={challengeForm.topic} onChange={(e) => setChallengeForm({...challengeForm, topic: e.target.value})} placeholder="Contoh: Manfaat Serat" />
              </div>
              <button onClick={handleGenerateAI} disabled={aiLoading} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {aiLoading ? <Loader2 className="animate-spin"/> : <Bot size={20}/>} Generate with AI
              </button>
            </Card>

            {challengeForm.content && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#166534' }}>Hasil Generate AI:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: '#14532d' }}>
                  <p><strong>Pagi:</strong> {challengeForm.content.challenge_a}</p>
                  <p><strong>Siang:</strong> {challengeForm.content.challenge_b}</p>
                  <p><strong>Malam:</strong> {challengeForm.content.challenge_c}</p>
                  <p><strong>Fakta:</strong> {challengeForm.content.fact_content}</p>
                </div>
                <button onClick={handleSaveChallenge} className="btn-primary" style={{ marginTop: '1.5rem', width: '100%', background: '#16a34a' }}>Simpan ke Database</button>
              </div>
            )}
          </div>
        )}

        {/* === TAB USER MANAGEMENT (WITH GEN Z BADGES) === */}
        {activeTab === 'users' && (
          <div>
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Manajemen User</h1>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>User Info</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Badge (Gelar)</th>
                    <th style={{ padding: '1rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                        <div style={{ fontSize:'0.8rem', color:'#64748b' }}>{u.phone}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{u.role}</td>
                      <td style={{ padding: '1rem' }}>
                        {/* SELECT BADGE GEN Z */}
                        <select 
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          value={u.badge || "Pejuang Tangguh"}
                          onChange={(e) => handleUpdateUser(u.id, 'badge', e.target.value)}
                        >
                          {GEN_Z_BADGES.map((badge) => (
                            <option key={badge} value={badge}>{badge}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleUpdateUser(u.id, 'role', 'admin')} style={btnSmallStyle('#3b82f6')}>Jadikan Admin</button>
                        )}
                        {u.role === 'admin' && (
                          <button onClick={() => handleUpdateUser(u.id, 'role', 'user')} style={btnSmallStyle('#ef4444')}>Hapus Admin</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB FINANCE === */}
        {activeTab === 'finance' && (
          <div>
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Keuangan & Produk</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* WITHDRAWAL */}
              <Card>
                <CardHeader><CardTitle>Permintaan Withdrawal</CardTitle></CardHeader>
                <CardContent>
                  {transactions.withdrawals.length === 0 ? <p className="text-sm text-gray-500">Belum ada request.</p> : transactions.withdrawals.map(w => (
                    <div key={w.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Rp {w.amount.toLocaleString()}</div>
                        <div style={{ fontSize: '0.8rem', color: w.status === 'pending' ? 'orange' : 'green' }}>Status: {w.status}</div>
                      </div>
                      {w.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleUpdateTransaction(w.id, 'withdrawal', 'approved')} style={{ border:'none', background:'#dcfce7', color:'green', padding:'0.4rem', borderRadius:'4px', cursor:'pointer' }}><Check size={16}/></button>
                          <button onClick={() => handleUpdateTransaction(w.id, 'withdrawal', 'rejected')} style={{ border:'none', background:'#fee2e2', color:'red', padding:'0.4rem', borderRadius:'4px', cursor:'pointer' }}><X size={16}/></button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* PURCHASES */}
              <Card>
                <CardHeader><CardTitle>Pembelian Produk</CardTitle></CardHeader>
                <CardContent>
                  {transactions.purchases.length === 0 ? <p className="text-sm text-gray-500">Belum ada pembelian.</p> : transactions.purchases.map(p => (
                    <div key={p.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{p.product}</div>
                        <div style={{ fontSize: '0.8rem', color: p.status === 'pending' ? 'orange' : 'green' }}>Status: {p.status}</div>
                      </div>
                      {p.status === 'pending' && (
                        <button onClick={() => handleUpdateTransaction(p.id, 'purchase', 'paid')} style={btnSmallStyle('#16a34a')}>Verifikasi Lunas</button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* === TAB ARTICLES === */}
        {activeTab === 'articles' && (
          <div style={{ maxWidth: '600px' }}>
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Buat Artikel Baru</h1>
            <Card style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Judul Artikel</label>
                <input type="text" style={inputStyle} value={articleForm.title} onChange={(e) => setArticleForm({...articleForm, title: e.target.value})} placeholder="Judul..." />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>URL Gambar</label>
                <input type="text" style={inputStyle} value={articleForm.image_url} onChange={(e) => setArticleForm({...articleForm, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Isi Konten</label>
                <textarea style={{...inputStyle, height: '150px'}} value={articleForm.content} onChange={(e) => setArticleForm({...articleForm, content: e.target.value})} placeholder="Tulis artikel di sini..." />
              </div>
              <button onClick={handleCreateArticle} className="btn-primary" style={{ width: '100%' }}>Terbitkan Artikel</button>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};

// Styles
const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' };
const btnSmallStyle = (color) => ({
  background: color, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
});

export default AdminDashboard;
