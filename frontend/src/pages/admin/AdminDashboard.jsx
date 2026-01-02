import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, 
  Smartphone, DollarSign, Calendar, Plus, Award, Menu, Sparkles, Trash2, Clock, Save
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

  // Data States
  const [stats, setStats] = useState({ total_users: 0, pending_withdrawals: 0, total_revenue: 0 });
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);

  // --- MATRIX CONTENT STATE ---
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [contentMatrix, setContentMatrix] = useState({}); // { 1: {row data}, 2: {row data} }
  const [loadingMatrix, setLoadingMatrix] = useState(false);

  const [newChallengeTitle, setNewChallengeTitle] = useState("");

  useEffect(() => {
    fetchStats();
    fetchChallengeCards();
  }, []);

  // Fetch Matrix saat Challenge ID berubah
  useEffect(() => {
    if (selectedChallengeId && activeTab === 'challenge_content') {
        fetchContentMatrix(selectedChallengeId);
    }
  }, [selectedChallengeId, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeader() });
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: getAuthHeader() });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); setUsers([]); }
  };

  const fetchChallengeCards = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(Array.isArray(res.data) ? res.data : []);
      if(res.data.length > 0 && !selectedChallengeId) setSelectedChallengeId(res.data[0].id);
    } catch (e) { console.error(e); setChallenges([]); }
  };

  const fetchContentMatrix = async (challengeId) => {
      setLoadingMatrix(true);
      try {
          const res = await axios.get(`${BACKEND_URL}/api/admin/campaign/matrix/${challengeId}`, { headers: getAuthHeader() });
          const matrix = {};
          res.data.forEach(item => { matrix[item.day_sequence] = item; });
          setContentMatrix(matrix);
      } catch (e) { console.error(e); setContentMatrix({}); }
      setLoadingMatrix(false);
  };

  const handleMatrixChange = (day, field, value) => {
      setContentMatrix(prev => ({
          ...prev,
          [day]: { ...prev[day], [field]: value }
      }));
  };

  const handleSaveMatrix = async () => {
      if (!selectedChallengeId) return alert("Pilih Challenge dulu!");
      setBtnLoading(true);
      try {
          const payload = Object.keys(contentMatrix).map(day => ({
              day_sequence: parseInt(day),
              challenge_id: selectedChallengeId,
              ...contentMatrix[day]
          }));
          await axios.post(`${BACKEND_URL}/api/admin/campaign/matrix/save`, { challenge_id: selectedChallengeId, data: payload }, { headers: getAuthHeader() });
          alert("✅ Konten 30 hari berhasil disimpan!");
      } catch (e) { alert("Gagal menyimpan."); }
      setBtnLoading(false);
  };

  const handleGenerateChallengeAI = async () => {
    if(!newChallengeTitle) return alert("Masukkan judul!");
    const confirmGen = window.confirm(`Generate challenge "${newChallengeTitle}" dengan AI?`);
    if(!confirmGen) return;
    setBtnLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/quiz/generate-challenge-auto`, { title: newChallengeTitle }, { headers: getAuthHeader() });
      if(res.data.success) { alert("Sukses generate!"); setNewChallengeTitle(""); fetchChallengeCards(); }
    } catch (e) { alert("Gagal generate."); }
    setBtnLoading(false);
  };

  const handleDeleteChallenge = async (id) => {
    if(!window.confirm("Hapus permanen?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/quiz/delete-challenge/${id}`, { headers: getAuthHeader() });
      setChallenges(challenges.filter(c => c.id !== id));
    } catch (e) { alert("Gagal hapus."); }
  };

  const handleUpdateUser = async (userId, type, value) => {
    try { await axios.post(`${BACKEND_URL}/api/admin/users/update-role`, { user_id: userId, [type]: value }, { headers: getAuthHeader() }); fetchUsers(); } catch (e) { alert("Gagal update"); }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => { setActiveTab(id); if(id==='users') fetchUsers(); if(window.innerWidth <= 1024) setSidebarOpen(false); }}
      style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', padding: '0.85rem 1rem', background: activeTab === id ? 'var(--primary)' : 'transparent', border: 'none', color: activeTab === id ? 'white' : '#64748b', fontWeight: activeTab === id ? '600' : '400', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem' }}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#f8fafc', zIndex: 99999, display: 'flex', overflow: 'hidden' }}>
      <style>{`:root { --primary: #3b82f6; }`}</style>
      <aside style={{ width: isSidebarOpen ? '260px' : '0px', transition: 'all 0.3s', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', display: 'flex', flexDirection: 'column', visibility: isSidebarOpen ? 'visible' : 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}><h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}> <Bot size={20} /> Jates Admin</h2></div>
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="challenge_cards" icon={Award} label="Card Challenge AI" />
          <SidebarItem id="challenge_content" icon={Calendar} label="Broadcast 30 Hari" />
          <SidebarItem id="users" icon={Users} label="User & Badge" />
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}><button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', width: '100%', padding: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}> <LogOut size={18} /> Logout </button></div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between' }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}> <Menu size={20}/> </button>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>{activeTab.toUpperCase()}</span>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'overview' && (
            <div>
              <h1 className="heading-2" style={{marginBottom:'1.5rem'}}>Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard label="Total User" val={stats.total_users} icon={<Users/>} color="#3b82f6" />
                <StatCard label="WD Pending" val={stats.pending_withdrawals} icon={<Wallet/>} color="#f59e0b" />
                <StatCard label="Revenue" val={`Rp ${stats.total_revenue?.toLocaleString()}`} icon={<ShoppingCart/>} color="#10b981" />
              </div>
            </div>
          )}

          {activeTab === 'challenge_cards' && (
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap: '1.5rem' }}>
                <Card style={{ padding: '1.5rem', background: 'white', height: 'fit-content' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Buat Challenge Baru</h3>
                  <input placeholder="Judul Tantangan..." style={{ ...inputStyle, marginBottom: '1rem' }} value={newChallengeTitle} onChange={(e) => setNewChallengeTitle(e.target.value)} />
                  <button onClick={handleGenerateChallengeAI} disabled={btnLoading} className="btn-primary" style={{ width: '100%', padding:'0.7rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px' }}>{btnLoading ? 'Loading...' : 'Generate via AI'}</button>
                </Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {challenges.map(c => (
                        <Card key={c.id} style={{ padding: '1rem', background: 'white', border: '1px solid #e2e8f0' }}>
                            <div style={{display:'flex', justifyContent:'space-between'}}><b>{c.title}</b><button onClick={() => handleDeleteChallenge(c.id)} style={{color:'red', background:'none', border:'none'}}><Trash2 size={16}/></button></div>
                            <p style={{fontSize:'0.8rem', color:'#64748b'}}>{c.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
          )}

          {activeTab === 'challenge_content' && (
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                  <h1 className="heading-2">Broadcast Manager (30 Hari)</h1>
                  <div style={{display:'flex', gap:'1rem'}}>
                     <select value={selectedChallengeId || ""} onChange={(e) => setSelectedChallengeId(e.target.value)} style={selectStyle}>
                        <option value="" disabled>Pilih Challenge...</option>
                        {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                     </select>
                     <button onClick={handleSaveMatrix} disabled={btnLoading} style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'#10b981', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer'}}>
                        {btnLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Simpan
                     </button>
                  </div>
              </div>
              {loadingMatrix ? <div style={{padding:'2rem', textAlign:'center'}}>Loading matrix...</div> : (
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background:'white' }}>
                    <table style={{ width: '100%', minWidth: '1500px', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={thStyle}>Hari</th>
                          <th style={thStyle}>Tipe A (Sembelit)<br/><small>09:00</small></th>
                          <th style={thStyle}>Tipe B (Kembung)<br/><small>09:00</small></th>
                          <th style={thStyle}>Tipe C (GERD)<br/><small>09:00</small></th>
                          <th style={thStyle}>Fakta Kesehatan<br/><small>12:00</small></th>
                          <th style={thStyle}>Soft Sell<br/><small>H+3</small></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                            const row = contentMatrix[day] || {};
                            return (
                                <tr key={day} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{...tdStyle, textAlign:'center', fontWeight:'bold', background:'#f8fafc'}}>{day}</td>
                                    <td style={tdStyle}><textarea style={tableInputStyle} value={row.challenge_a||""} onChange={e=>handleMatrixChange(day,'challenge_a',e.target.value)} /></td>
                                    <td style={tdStyle}><textarea style={tableInputStyle} value={row.challenge_b||""} onChange={e=>handleMatrixChange(day,'challenge_b',e.target.value)} /></td>
                                    <td style={tdStyle}><textarea style={tableInputStyle} value={row.challenge_c||""} onChange={e=>handleMatrixChange(day,'challenge_c',e.target.value)} /></td>
                                    <td style={tdStyle}><textarea style={tableInputStyle} value={row.fact_content||""} onChange={e=>handleMatrixChange(day,'fact_content',e.target.value)} /></td>
                                    <td style={tdStyle}>{day%3===0 ? <textarea style={{...tableInputStyle, background:'#f0fdf4'}} value={row.soft_sell_content||""} onChange={e=>handleMatrixChange(day,'soft_sell_content',e.target.value)} /> : '-'}</td>
                                </tr>
                            )
                        })}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
              <Card style={{ overflowX: 'auto', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{background:'#f8fafc'}}><th style={thStyle}>User</th><th style={thStyle}>Badge</th><th style={thStyle}>Aksi</th></tr></thead>
                  <tbody>{users.map(u => (
                      <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={tdStyle}><b>{u.name}</b><br/>{u.phone}</td>
                          <td style={tdStyle}><select value={u.badge} onChange={e=>handleUpdateUser(u.id,'badge',e.target.value)} style={selectStyle}>{GEN_Z_BADGES.map(b=><option key={b} value={b}>{b}</option>)}</select></td>
                          <td style={tdStyle}><button onClick={()=>handleUpdateUser(u.id,'role',u.role==='admin'?'user':'admin')} style={{color:u.role==='admin'?'red':'blue', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>{u.role==='admin'?'Revoke':'Admin'}</button></td>
                      </tr>
                  ))}</tbody>
                </table>
              </Card>
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon, color }) => (<Card style={{ border: 'none', background: 'white', padding: '1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}><div><p style={{color:'#64748b'}}>{label}</p><h3>{val}</h3></div><div style={{color:color}}>{icon}</div></Card>);
const inputStyle = { width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' };
const tableInputStyle = { width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', minHeight:'50px', fontSize:'0.8rem' };
const selectStyle = { padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' };
const thStyle = { padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' };
const tdStyle = { padding: '0.75rem', fontSize: '0.85rem' };

export default AdminDashboard;
