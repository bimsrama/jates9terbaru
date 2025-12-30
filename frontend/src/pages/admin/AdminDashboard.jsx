import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, Smartphone
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- BADGES ---
const GEN_Z_BADGES = [
  "Pejuang Tangguh", "Si Paling Sehat", "Usus Glowing", "Lord of Fiber", 
  "Anti Kembung Club", "King of Metabolism", "Sepuh Jates9", "Healing Master"
];

const AdminDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // State Navigasi
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(false);

  // State Data
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState({ withdrawals: [], purchases: [] });
  
  // State AI Challenge (Bulk)
  const [bulkTopic, setBulkTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // State WhatsApp Broadcast
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all"); // 'all' or 'group_a', etc.
  const [sendingWA, setSendingWA] = useState(false);

  // State Artikel
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

  // 1. Generate 30 Hari & Download Sheet
  const handleGenerateBulk = async () => {
    if(!bulkTopic) return alert("Masukkan topik tantangan dulu!");
    setAiLoading(true);
    try {
      // Request ke Backend untuk generate CSV
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/generate-bulk-plan`,
        { topic: bulkTopic },
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        // Download Logic
        const blob = new Blob([res.data.csv_content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Challenge_30_Hari_${bulkTopic.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("File berhasil didownload!");
      }
    } catch (e) { 
      alert("Gagal generate. Pastikan API Key OpenAI valid."); 
    }
    setAiLoading(false);
  };

  // 2. Kirim WhatsApp Broadcast
  const handleBroadcast = async () => {
    if(!broadcastMsg) return alert("Tulis pesan dulu!");
    if(!window.confirm(`Kirim pesan ke ${broadcastTarget === 'all' ? 'SEMUA USER' : broadcastTarget}?`)) return;

    setSendingWA(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/broadcast`,
        { message: broadcastMsg, target: broadcastTarget },
        { headers: getAuthHeader() }
      );
      alert("Pesan sedang dikirim antrian!");
      setBroadcastMsg("");
    } catch (e) { alert("Gagal kirim broadcast."); }
    setSendingWA(false);
  };

  const handleUpdateUser = async (userId, type, value) => {
    try {
      const payload = { user_id: userId };
      if (type === 'role') payload.role = value;
      if (type === 'badge') payload.badge = value;
      await axios.post(`${BACKEND_URL}/api/admin/users/update-role`, payload, { headers: getAuthHeader() });
      fetchUsers(); 
    } catch (e) { alert("Gagal update user"); }
  };

  const handleUpdateTransaction = async (id, type, status) => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/transaction/update`, { id, type, status }, { headers: getAuthHeader() });
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

  // --- COMPONENT HELPERS ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); if(id==='users') fetchUsers(); if(id==='finance') fetchTransactions(); }}
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', position: 'sticky', top: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <LayoutDashboard /> Admin Panel
        </h2>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="challenges" icon={Bot} label="AI Generator" />
          <SidebarItem id="whatsapp" icon={MessageSquare} label="WhatsApp Blast" />
          <SidebarItem id="users" icon={Users} label="Users & Badges" />
          <SidebarItem id="finance" icon={DollarSign} label="Keuangan" />
          <SidebarItem id="articles" icon={PenTool} label="Artikel" />
        </nav>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: '#fee2e2', border: 'none', padding: '1rem', borderRadius: '8px', cursor: 'pointer', marginTop: 'auto', fontWeight: 'bold' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* === TAB OVERVIEW === */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Statistik Performa</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <Card style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none' }}>
                <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Total Pengguna</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.total_users || 0}</h3>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}><Users size={32} /></div>
                </CardContent>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none' }}>
                <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Pending Withdrawal</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.pending_withdrawals || 0}</h3>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}><Wallet size={32} /></div>
                </CardContent>
              </Card>
              <Card style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
                <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Pendapatan Produk</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Rp {(stats.total_revenue || 0).toLocaleString()}</h3>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}><ShoppingCart size={32} /></div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* === TAB AI GENERATOR (BULK 30 DAYS) === */}
        {activeTab === 'challenges' && (
          <div style={{ maxWidth: '800px' }} className="animate-in fade-in zoom-in duration-300">
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>AI Challenge Generator (30 Hari)</h1>
            <Card style={{ padding: '2rem', background: 'white' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Bot size={40} color="#2563eb" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Buat Jadwal 30 Hari Otomatis</h3>
                <p style={{ color: '#64748b' }}>Masukkan topik kesehatan, AI akan membuatkan jadwal lengkap dalam format Excel/CSV.</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Topik / Judul Program</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
                  value={bulkTopic} 
                  onChange={(e) => setBulkTopic(e.target.value)} 
                  placeholder="Contoh: Diet Anti Inflamasi, Detoks Gula, dll..." 
                />
              </div>

              <button 
                onClick={handleGenerateBulk} 
                disabled={aiLoading} 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
              >
                {aiLoading ? <><Loader2 className="animate-spin"/> Sedang Membuat Jadwal (Mungkin butuh 30-60 detik)...</> : <><FileSpreadsheet size={20}/> Generate & Download CSV</>}
              </button>
            </Card>
          </div>
        )}

        {/* === TAB WHATSAPP BROADCAST === */}
        {activeTab === 'whatsapp' && (
          <div style={{ maxWidth: '800px' }} className="animate-in fade-in zoom-in duration-300">
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>WhatsApp Broadcast</h1>
            <Card style={{ padding: '2rem', background: 'white' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Target Penerima</label>
                  <select 
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="all">Semua Pengguna</option>
                    <option value="A">Hanya Tipe A (Sembelit)</option>
                    <option value="B">Hanya Tipe B (Kembung)</option>
                    <option value="C">Hanya Tipe C (GERD)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Isi Pesan</label>
                <textarea 
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '200px' }}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Halo Kak {{name}}, jangan lupa minum Jates9 hari ini ya! ..."
                />
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>*Gunakan <strong>{`{{name}}`}</strong> untuk menyebut nama user secara otomatis.</p>
              </div>

              <button 
                onClick={handleBroadcast} 
                disabled={sendingWA} 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#16a34a' }}
              >
                {sendingWA ? <Loader2 className="animate-spin"/> : <><Send size={20}/> Kirim Pesan Sekarang</>}
              </button>
            </Card>
          </div>
        )}

        {/* === TAB USER MANAGEMENT === */}
        {activeTab === 'users' && (
          <div>
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Manajemen User & Badge</h1>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>User Info</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Gelar (Badge)</th>
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
                      <td style={{ padding: '1rem' }}>
                        {u.role !== 'admin' ? 
                          <button onClick={() => handleUpdateUser(u.id, 'role', 'admin')} style={btnSmallStyle('#3b82f6')}>Jadikan Admin</button> :
                          <button onClick={() => handleUpdateUser(u.id, 'role', 'user')} style={btnSmallStyle('#ef4444')}>Hapus Admin</button>
                        }
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
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Keuangan</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <Card>
                <CardHeader><CardTitle>Permintaan Withdrawal</CardTitle></CardHeader>
                <CardContent>
                  {transactions.withdrawals.length === 0 ? <p className="text-gray-500">Kosong.</p> : transactions.withdrawals.map(w => (
                    <div key={w.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Rp {w.amount.toLocaleString()}</div>
                        <div style={{ fontSize: '0.8rem', color: w.status === 'pending' ? 'orange' : 'green' }}>{w.status}</div>
                      </div>
                      {w.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleUpdateTransaction(w.id, 'withdrawal', 'approved')} style={{ border:'none', background:'#dcfce7', color:'green', padding:'0.4rem', borderRadius:'4px' }}><Check size={16}/></button>
                          <button onClick={() => handleUpdateTransaction(w.id, 'withdrawal', 'rejected')} style={{ border:'none', background:'#fee2e2', color:'red', padding:'0.4rem', borderRadius:'4px' }}><X size={16}/></button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Pembelian Produk</CardTitle></CardHeader>
                <CardContent>
                  {transactions.purchases.length === 0 ? <p className="text-gray-500">Kosong.</p> : transactions.purchases.map(p => (
                    <div key={p.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{p.product}</div>
                        <div style={{ fontSize: '0.8rem', color: p.status === 'pending' ? 'orange' : 'green' }}>{p.status}</div>
                      </div>
                      {p.status === 'pending' && <button onClick={() => handleUpdateTransaction(p.id, 'purchase', 'paid')} style={btnSmallStyle('#16a34a')}>Lunas</button>}
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
            <h1 className="heading-2" style={{ marginBottom: '1.5rem' }}>Buat Artikel</h1>
            <Card style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}><label style={{display:'block', fontWeight:'bold', marginBottom:'0.5rem'}}>Judul</label><input type="text" style={inputStyle} value={articleForm.title} onChange={(e) => setArticleForm({...articleForm, title: e.target.value})} placeholder="Judul..." /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{display:'block', fontWeight:'bold', marginBottom:'0.5rem'}}>Gambar URL</label><input type="text" style={inputStyle} value={articleForm.image_url} onChange={(e) => setArticleForm({...articleForm, image_url: e.target.value})} placeholder="https://..." /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{display:'block', fontWeight:'bold', marginBottom:'0.5rem'}}>Isi</label><textarea style={{...inputStyle, height:'150px'}} value={articleForm.content} onChange={(e) => setArticleForm({...articleForm, content: e.target.value})} placeholder="Isi artikel..." /></div>
              <button onClick={handleCreateArticle} className="btn-primary" style={{ width: '100%' }}>Terbitkan</button>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' };
const btnSmallStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' });

export default AdminDashboard;
