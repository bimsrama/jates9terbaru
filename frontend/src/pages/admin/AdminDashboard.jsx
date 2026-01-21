import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Send, Smartphone, Calendar, 
  Trash2, Clock, Save, Eye, Package, Bell, 
  AlertTriangle, RefreshCw, Zap, Sparkles, Menu, FileSpreadsheet, CheckCircle, XCircle
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const GEN_Z_BADGES = [
  "Pejuang Tangguh", "Si Paling Sehat", "Usus Glowing", "Lord of Fiber", 
  "Anti Kembung Club", "King of Metabolism", "Sepuh Jates9", "Healing Master", "Jates9 Champion 🏆"
];

const AdminDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [btnLoading, setBtnLoading] = useState(false);

  // Data States
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]); 
  const [orders, setOrders] = useState([]);
  
  // FORM STATES
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', fake_sales: 0, image: null });
  const [articleForm, setArticleForm] = useState({ title: '', content: '', image: null });

  // FINANCE & TRANSACTION STATES
  const [withdrawals, setWithdrawals] = useState([]);
  const [wdRefInput, setWdRefInput] = useState(""); 
  const [wdProcessingId, setWdProcessingId] = useState(null);

  // MATRIX STATES (INPUT CHALLENGE)
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [contentMatrix, setContentMatrix] = useState({});
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [activeTypeTab, setActiveTypeTab] = useState('a'); // 'a', 'b', or 'c'

  // EDIT & VIEW CHALLENGE STATE
  const [editingChallenge, setEditingChallenge] = useState(null); 
  const [challengeParticipants, setChallengeParticipants] = useState([]);
  const [viewMode, setViewMode] = useState('info'); 
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // --- NEW: GENERATOR PREVIEW STATE ---
  const [genChallengeName, setGenChallengeName] = useState("");
  const [previewData, setPreviewData] = useState(null); // Menyimpan hasil JSON dari AI
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // BROADCAST STATE
  const [testPhone, setTestPhone] = useState("");
  const [selectedTestUser, setSelectedTestUser] = useState("");
  const [customBroadcastMsg, setCustomBroadcastMsg] = useState(""); 

  useEffect(() => {
    fetchStats();
    fetchChallengeCards();
  }, []);

  useEffect(() => {
    if (activeTab === 'challenge_content' && selectedChallengeId) fetchContentMatrix(selectedChallengeId);
    if (activeTab === 'users' || activeTab === 'broadcast') fetchUsers();
    if (activeTab === 'articles') fetchArticles();
    if (activeTab === 'products') fetchProducts(); 
    if (activeTab === 'finance') fetchWithdrawals(); 
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, selectedChallengeId]);

  // --- API FETCH ---
  const fetchStats = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeader() }); setStats(res.data); } catch (e) {} };
  const fetchUsers = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: getAuthHeader() }); setUsers(res.data); } catch (e) {} };
  const fetchChallengeCards = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/challenges`); setChallenges(res.data); if(res.data.length && !selectedChallengeId) setSelectedChallengeId(res.data[0].id); } catch (e) {} };
  const fetchContentMatrix = async (id) => { setLoadingMatrix(true); try { const res = await axios.get(`${BACKEND_URL}/api/admin/campaign/matrix/${id}`, { headers: getAuthHeader() }); const m={}; res.data.forEach(x=>{m[x.day_sequence]=x}); setContentMatrix(m); } catch(e){} setLoadingMatrix(false); };
  const fetchArticles = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeader() }); setArticles(res.data); } catch(e){} };
  const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/products`, { headers: getAuthHeader() }); setProducts(res.data); } catch(e){} };
  
  const fetchWithdrawals = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/finance/withdrawals`, { headers: getAuthHeader() }); setWithdrawals(res.data); } catch(e){} };
  const fetchOrders = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/orders`, { headers: getAuthHeader() }); setOrders(res.data); } catch(e){} };

  const fetchParticipants = async (challengeId) => {
    setLoadingParticipants(true);
    try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/challenge/${challengeId}/participants`, { headers: getAuthHeader() });
        setChallengeParticipants(res.data);
    } catch (e) {
        console.error("Gagal load peserta");
    } finally {
        setLoadingParticipants(false);
    }
  };

  // --- HANDLERS ---
  const handleUpdateOrder = async (orderId, status, resi) => {
      if(!window.confirm(`Update order ${orderId} ke status ${status}?`)) return;
      try {
          await axios.post(`${BACKEND_URL}/api/admin/orders/update`, { order_id: orderId, status, resi }, { headers: getAuthHeader() });
          fetchOrders();
          alert("Order updated!");
      } catch(e) { alert("Gagal update order."); }
  };

  const handleApproveWD = async (id) => {
      if(!wdRefInput) return alert("Masukkan Nomor ID/Bukti Transfer dulu!");
      if(!window.confirm("Setujui penarikan ini?")) return;
      setBtnLoading(true);
      try {
          await axios.post(`${BACKEND_URL}/api/admin/finance/withdrawals/approve`, { id, transaction_ref: wdRefInput }, { headers: getAuthHeader() });
          alert("Penarikan Disetujui!");
          setWdProcessingId(null);
          setWdRefInput("");
          fetchWithdrawals();
      } catch (e) { alert("Gagal proses"); }
      setBtnLoading(false);
  };

  const handlePostArticle = async (e) => {
      e.preventDefault(); setBtnLoading(true);
      const fd = new FormData(); fd.append('title', articleForm.title); fd.append('content', articleForm.content); if(articleForm.image) fd.append('image', articleForm.image);
      try { const res = await axios.post(`${BACKEND_URL}/api/admin/articles`, fd, { headers: {...getAuthHeader(), 'Content-Type': 'multipart/form-data'} }); if(res.data.success){ alert(`Posted! Time: ${res.data.reading_time}`); setArticleForm({title:'',content:'',image:null}); fetchArticles(); } } catch(e){ alert("Error"); } setBtnLoading(false);
  };

  const handleAddProduct = async (e) => {
      e.preventDefault(); setBtnLoading(true);
      const fd = new FormData(); 
      fd.append('name', productForm.name); 
      fd.append('price', productForm.price); 
      fd.append('description', productForm.description); 
      fd.append('fake_sales', productForm.fake_sales);
      if(productForm.image) fd.append('image', productForm.image);
      try { await axios.post(`${BACKEND_URL}/api/admin/products`, fd, { headers: {...getAuthHeader(), 'Content-Type': 'multipart/form-data'} }); alert("Produk Ditambahkan!"); setProductForm({name:'', price:'', description:'', fake_sales:0, image:null}); fetchProducts(); } catch(e){ alert("Error"); } setBtnLoading(false);
  };

  const handleDeleteProduct = async (id) => {
      if(!window.confirm("Hapus produk ini?")) return;
      try { await axios.delete(`${BACKEND_URL}/api/admin/products/${id}`, { headers: getAuthHeader() }); fetchProducts(); } catch(e){ alert("Gagal hapus"); }
  };

  const handleSaveMatrix = async () => { if(!selectedChallengeId) return; setBtnLoading(true); try { const pl = Object.keys(contentMatrix).map(d=>({day_sequence:parseInt(d), challenge_id:selectedChallengeId, ...contentMatrix[d]})); await axios.post(`${BACKEND_URL}/api/admin/campaign/matrix/save`, {challenge_id:selectedChallengeId, data:pl}, {headers:getAuthHeader()}); alert("Challenge Saved!"); } catch(e){alert("Error");} setBtnLoading(false); };
  
  const handleDeleteChallenge = async (id, e) => { e.stopPropagation(); if(window.confirm("Delete?")) try { await axios.delete(`${BACKEND_URL}/api/admin/quiz/delete-challenge/${id}`, {headers:getAuthHeader()}); setChallenges(challenges.filter(c=>c.id!==id)); } catch(e){} };
  
  const handleUpdateChallenge = async () => {
    if(!editingChallenge) return; setBtnLoading(true);
    try { await axios.post(`${BACKEND_URL}/api/admin/quiz/update-challenge`, editingChallenge, { headers: getAuthHeader() }); alert("Challenge berhasil diupdate!"); setEditingChallenge(null); fetchChallengeCards(); } catch (e) { alert("Gagal update."); } finally { setBtnLoading(false); }
  };

  const handleOpenChallengeModal = (challenge) => { setEditingChallenge(challenge); setViewMode('info'); fetchParticipants(challenge.id); };

  const handleUpdateUser = async (uid, type, val) => {
    try { const payload = { user_id: uid }; if (type === 'role') payload.role = val; if (type === 'badge') payload.badge = val; await axios.post(`${BACKEND_URL}/api/admin/users/update-role`, payload, { headers: getAuthHeader() }); fetchUsers(); alert(`User ${type} berhasil diubah!`); } catch(e) { alert("Gagal update user."); }
  };
  
  const handleMatrixChange = (d, typeKey, idx, val) => {
    setContentMatrix(prev => {
        const row = prev[d] || {};
        const currentArr = row[typeKey] || ["", "", ""];
        const newArr = [...currentArr];
        newArr[idx] = val; 
        return { ...prev, [d]: { ...row, [typeKey]: newArr } };
    });
  };

  // --- LOGIC CHALLENGE MANAGEMENT (RESET & REMOVE) ---
  const handleResetUserChallenge = async (userId, challengeId, userName) => {
    if (!challengeId) return alert("User tidak memiliki challenge aktif.");
    if (!window.confirm(`⚠️ PERHATIAN:\nYakin ingin MERESET progress challenge user "${userName}" kembali ke Hari 1?\n\nSemua progress checklist dan jurnal user untuk challenge ini akan dihapus.`)) return;
    setBtnLoading(true);
    try { await axios.post(`${BACKEND_URL}/api/admin/users/challenge/reset`, { user_id: userId, challenge_id: challengeId }, { headers: getAuthHeader() }); alert("Sukses! Challenge user telah di-reset ke Hari 1."); fetchUsers(); } catch (e) { alert("Gagal reset: " + (e.response?.data?.message || e.message)); } finally { setBtnLoading(false); }
  };

  const handleRemoveUserChallenge = async (userId, challengeId, userName) => {
    if (!challengeId) return alert("User tidak memiliki challenge aktif.");
    if (!window.confirm(`⛔ BAHAYA:\nYakin ingin MENGHAPUS/MENGELUARKAN user "${userName}" dari challenge ini?\n\nUser akan kehilangan akses dan seluruh data challenge akan hilang.`)) return;
    setBtnLoading(true);
    try { await axios.post(`${BACKEND_URL}/api/admin/users/challenge/remove`, { user_id: userId, challenge_id: challengeId }, { headers: getAuthHeader() }); alert("Sukses! User telah dikeluarkan dari challenge."); fetchUsers(); } catch (e) { alert("Gagal menghapus: " + (e.response?.data?.message || e.message)); } finally { setBtnLoading(false); }
  };

  // --- NEW: LOGIC GENERATOR CHALLENGE (PREVIEW FLOW) ---
  const handleGeneratePreview = async () => {
    if (!genChallengeName) return alert("Isi judul dulu!");
    setBtnLoading(true);
    try {
        const res = await axios.post(
            `${BACKEND_URL}/api/admin/quiz/generate-preview`, 
            { title: genChallengeName }, 
            { headers: getAuthHeader() }
        );
        if (res.data.success) {
            setPreviewData(res.data.preview_data);
            setShowPreviewModal(true);
        }
    } catch (e) {
        alert("Gagal generate: " + (e.response?.data?.message || e.message));
    } finally {
        setBtnLoading(false);
    }
  };

  const handleSaveGeneratedChallenge = async () => {
    if (!previewData || !genChallengeName) return;
    setBtnLoading(true);
    try {
        await axios.post(
            `${BACKEND_URL}/api/admin/quiz/save-generated`, 
            { title: genChallengeName, preview_data: previewData }, 
            { headers: getAuthHeader() }
        );
        alert("Challenge berhasil disimpan!");
        setShowPreviewModal(false);
        setPreviewData(null);
        setGenChallengeName("");
        fetchChallengeCards(); // Refresh list
    } catch (e) {
        alert("Gagal simpan: " + (e.response?.data?.message || e.message));
    } finally {
        setBtnLoading(false);
    }
  };

  // --- BROADCAST HANDLERS ---
  const handleSelectTestUser = (e) => { const uid = e.target.value; setSelectedTestUser(uid); const user = users.find(u => u.id === parseInt(uid)); if (user) { setTestPhone(user.phone); } else { setTestPhone(""); } };
  const handleTestBroadcast = async () => { if (!testPhone) return alert("Isi nomor HP dulu!"); setBtnLoading(true); try { const res = await axios.post(`${BACKEND_URL}/api/admin/broadcast/test`, { phone_number: testPhone }, { headers: getAuthHeader() }); alert(res.data.message || "Test sent!"); } catch (e) { alert("Gagal kirim test: " + (e.response?.data?.message || e.message)); } finally { setBtnLoading(false); } };
  const handleManualBroadcast = async (type) => { const msg = type === 'daily' ? "Yakin ingin mengirim CHALLENGE HARI INI ke SEMUA USER sekarang?" : "Yakin ingin mengirim REMINDER MALAM sekarang?"; if(!window.confirm(msg)) return; setBtnLoading(true); try { const endpoint = type === 'daily' ? 'daily' : 'reminder'; await axios.post(`${BACKEND_URL}/api/admin/broadcast/${endpoint}`, {}, { headers: getAuthHeader() }); alert(`Sukses! Pesan ${type} sedang dikirim di background.`); } catch(e) { alert("Gagal memicu broadcast."); } finally { setBtnLoading(false); } };
  const handleCustomBroadcast = async () => { if (!customBroadcastMsg) return alert("Pesan tidak boleh kosong!"); if (!window.confirm("Kirim pesan ini ke SEMUA user? Aksi ini tidak bisa dibatalkan.")) return; setBtnLoading(true); try { await axios.post(`${BACKEND_URL}/api/admin/broadcast/custom`, { message: customBroadcastMsg }, { headers: getAuthHeader() }); alert("Pesan sedang dikirim ke semua user via background process."); setCustomBroadcastMsg(""); } catch (e) { alert("Gagal mengirim broadcast: " + (e.response?.data?.message || e.message)); } finally { setBtnLoading(false); } };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => { setActiveTab(id); if(window.innerWidth<=1024) setSidebarOpen(false); }}
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
          <SidebarItem id="orders" icon={ShoppingCart} label="Pesanan Masuk" />
          <SidebarItem id="broadcast" icon={MessageSquare} label="Broadcast WA" />
          <SidebarItem id="products" icon={Package} label="Manajemen Produk" />
          <SidebarItem id="finance" icon={Wallet} label="Keuangan & WD" />
          <SidebarItem id="challenge_content" icon={Calendar} label="Input Challenge" />
          <SidebarItem id="users" icon={Users} label="User & Referral" />
          <SidebarItem id="articles" icon={FileText} label="Artikel Kesehatan" />
          <SidebarItem id="challenge_generator" icon={Sparkles} label="Challenge Generator" />
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}><button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', width: '100%', padding: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}> <LogOut size={18} /> Logout </button></div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between' }}>
          <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}> <Menu size={20}/> </button>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>{activeTab.toUpperCase().replace('_', ' ')}</span>
          </div>
          <button style={{background:'none', border:'none', position:'relative', cursor:'pointer'}}>
              <Bell size={20} color="#64748b"/>
              <div style={{position:'absolute', top:'-2px', right:'-2px', width:'8px', height:'8px', background:'red', borderRadius:'50%'}}></div>
          </button>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {/* TAB OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard label="Total User" val={stats.total_users} icon={<Users/>} color="#3b82f6" />
                <StatCard label="WD Pending" val={stats.pending_withdrawals} icon={<Wallet/>} color="#f59e0b" />
                <StatCard label="Total Penjualan" val={`Rp ${stats.total_revenue?.toLocaleString() || 0}`} icon={<ShoppingCart/>} color="#10b981" />
              </div>
              
              <h2 className="heading-2" style={{marginBottom:'1rem'}}>Manajemen Challenge</h2>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap: '1.5rem' }}>
                <Card style={{ padding: '1.5rem', background: 'white', height: 'fit-content' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Bot size={18} /> AI Quick Generator</h3>
                  <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'1rem'}}>Otomatis buat challenge lengkap (Tipe, Kuis, & Deskripsi) dalam sekali klik.</p>
                  <input placeholder="Topik Challenge (cth: Bebas Maag)" style={{ ...inputStyle, marginBottom: '1rem' }} value={genChallengeName} onChange={(e) => setGenChallengeName(e.target.value)} />
                  <button onClick={handleGeneratePreview} disabled={btnLoading} className="btn-primary" style={{ width: '100%', padding:'0.7rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px' }}>{btnLoading ? 'Sedang Generate...' : 'Preview Challenge (AI)'}</button>
                </Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {challenges.map(c => (
                        <Card key={c.id} onClick={() => handleOpenChallengeModal(c)} style={{ padding: '1rem', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.1s' }}>
                            <div style={{display:'flex', justifyContent:'space-between'}}><b>{c.title}</b><button onClick={(e) => handleDeleteChallenge(c.id, e)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button></div>
                            <p style={{fontSize:'0.8rem', color:'#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{c.description}</p>
                            <div style={{fontSize:'0.7rem', color:'var(--primary)', marginTop:'0.5rem', fontStyle:'italic', display:'flex', alignItems:'center', gap:'0.3rem'}}><Eye size={12}/> Lihat Peserta & Edit</div>
                        </Card>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB BROADCAST & WA */}
          {activeTab === 'broadcast' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="heading-2" style={{marginBottom:'1.5rem'}}>Broadcast WhatsApp</h2>
                
                {/* 1. MANUAL TRIGGER (FITUR UTAMA YANG DIMINTA) */}
                <Card style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', marginBottom:'2rem', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem'}}>
                        <AlertTriangle size={24} color="#dc2626"/>
                        <h3 style={{ fontWeight: 'bold', fontSize:'1.1rem', color:'#dc2626' }}>Darurat: Kirim Challenge Manual</h3>
                    </div>
                    <p style={{fontSize:'0.9rem', color:'#475569', marginBottom:'1.5rem', lineHeight:'1.5'}}>
                        Gunakan tombol di bawah <b>HANYA JIKA</b> pesan otomatis jam 09:00 pagi <b>TIDAK TERKIRIM (MACET)</b>.
                    </p>
                    
                    <div style={{display:'flex', gap:'1rem', flexDirection:'column'}}>
                        <button 
                            onClick={() => handleManualBroadcast('daily')} 
                            disabled={btnLoading}
                            style={{
                                padding:'1rem', 
                                background:'linear-gradient(to right, #dc2626, #b91c1c)', 
                                border:'none', 
                                borderRadius:'8px', 
                                cursor:'pointer', 
                                fontWeight:'bold', 
                                color:'white',
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'center',
                                gap:'0.5rem',
                                fontSize:'1rem',
                                boxShadow:'0 4px 6px -1px rgba(220, 38, 38, 0.3)'
                            }}
                        >
                            {btnLoading ? <Loader2 className="animate-spin" /> : <Zap size={20}/>}
                            KIRIM CHALLENGE HARI INI SEKARANG
                        </button>
                        
                        <button 
                            onClick={() => handleManualBroadcast('reminder')} 
                            disabled={btnLoading}
                            style={{
                                padding:'0.8rem', 
                                background:'white', 
                                border:'2px solid #f59e0b', 
                                borderRadius:'8px', 
                                cursor:'pointer', 
                                fontWeight:'bold', 
                                color:'#b45309',
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'center',
                                gap:'0.5rem'
                            }}
                        >
                            <Clock size={18}/>
                            Kirim Reminder Malam (Manual)
                        </button>
                    </div>
                </Card>

                {/* 2. CUSTOM BROADCAST (ANNOUNCEMENT) */}
                <Card style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', marginBottom:'2rem' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color:'#16a34a', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <MessageSquare size={20}/> Broadcast Pengumuman (Custom)
                    </h3>
                    <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'1rem'}}>
                        Kirim pesan bebas ke <b>SEMUA USER</b> (Info Promo / Maintenance / Update).
                    </p>
                    
                    <textarea 
                        style={{ ...inputStyle, minHeight:'100px', marginBottom:'1rem' }}
                        placeholder="Halo guys, ada update baru nih..."
                        value={customBroadcastMsg}
                        onChange={(e) => setCustomBroadcastMsg(e.target.value)}
                    />
                    
                    <button onClick={handleCustomBroadcast} disabled={btnLoading} style={{ width: '100%', padding:'0.8rem', background:'#16a34a', color:'white', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', display:'flex', justifyContent:'center', gap:'0.5rem' }}>
                        {btnLoading ? <Loader2 className="animate-spin" /> : <Send size={18}/>} Kirim ke Semua User
                    </button>
                </Card>

                {/* 3. TEST KONEKSI & KIRIM (FITUR YANG DIPERBAHARUI) */}
                <Card style={{ padding: '1.5rem', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color:'#64748b', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem' }}>
                        <Zap size={18} /> Test Koneksi (AppScript & WA)
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Pilih User (untuk target)</label>
                        <select value={selectedTestUser} onChange={handleSelectTestUser} style={selectStyle}>
                            <option value="">-- Pilih User --</option>
                            {users.map(u => (<option key={u.id} value={u.id}>{u.name} - {u.phone}</option>))}
                        </select>
                    </div>

                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-end' }}>
                        <div style={{flex:1}}>
                            <label style={labelStyle}>Nomor WhatsApp</label>
                            <input placeholder="628..." style={inputStyle} value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
                        </div>
                        <button onClick={handleTestBroadcast} disabled={btnLoading} style={{ padding:'0.7rem 1.5rem', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', height:'fit-content', marginBottom:'2px' }}>
                            {btnLoading ? 'Sending...' : 'Kirim Test'}
                        </button>
                    </div>
                    <p style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.5rem'}}>* Ini akan mengirim pesan "Tes Broadcast" untuk memastikan Python terhubung ke AppScript/Watzap.</p>
                </Card>
            </div>
          )}

          {/* TAB ORDERS */}
          {activeTab === 'orders' && (
             <Card style={{padding:'1.5rem', background:'white'}}>
                <h3 style={{fontWeight:'bold', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <ShoppingCart size={22}/> Manajemen Pesanan
                </h3>
                <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
                        <thead style={{background:'#f0fdf4', borderBottom:'2px solid #e2e8f0'}}>
                            <tr>
                                <th style={thStyle}>Order ID</th>
                                <th style={thStyle}>Produk</th>
                                <th style={thStyle}>Total</th>
                                <th style={thStyle}>Customer & Alamat</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Resi</th>
                                <th style={thStyle}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map(o => (
                                <tr key={o.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                    <td style={tdStyle}><span style={{fontFamily:'monospace', background:'#f1f5f9', padding:'2px 4px', borderRadius:'4px'}}>{o.order_id}</span><div style={{fontSize:'0.7rem', color:'#94a3b8'}}>{o.date}</div></td>
                                    <td style={tdStyle}><b>{o.product}</b></td>
                                    <td style={tdStyle}>Rp {o.amount.toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <div style={{fontWeight:'bold'}}>{o.customer}</div>
                                        <div style={{fontSize:'0.75rem', color:'#64748b', maxWidth:'200px', lineHeight:'1.3'}}>
                                            {o.address}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <select value={o.status} onChange={(e)=>handleUpdateOrder(o.order_id, e.target.value, o.resi)} style={{...selectStyle, padding:'2px 6px', fontSize:'0.8rem', borderColor: o.status==='cancelled'?'red':'#cbd5e1'}}>
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid (Dikemas)</option>
                                            <option value="shipped">Shipped (Dikirim)</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        <input defaultValue={o.resi} placeholder="Input Resi..." onBlur={(e)=>handleUpdateOrder(o.order_id, o.status, e.target.value)} style={{padding:'4px', borderRadius:'4px', border:'1px solid #cbd5e1', width:'120px', fontSize:'0.8rem'}} />
                                    </td>
                                    <td style={tdStyle}>
                                        <button onClick={()=>handleUpdateOrder(o.order_id, 'shipped', o.resi)} title="Simpan Perubahan" style={{background:'#3b82f6', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'}}><Save size={14}/></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>Belum ada pesanan masuk.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </Card>
          )}

          {/* TAB PRODUCTS */}
          {activeTab === 'products' && (
             <div style={{display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap:'1.5rem'}}>
                <Card style={{padding:'1.5rem', background:'white', height:'fit-content'}}>
                    <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Input Produk Baru</h3>
                    <form onSubmit={handleAddProduct}>
                        <div style={{marginBottom:'1rem'}}><label style={labelStyle}>Nama Produk</label><input style={inputStyle} value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} required /></div>
                        <div style={{marginBottom:'1rem'}}><label style={labelStyle}>Harga (Rp)</label><input type="number" style={inputStyle} value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} required /></div>
                        <div style={{marginBottom:'1rem'}}><label style={labelStyle}>Dummy Terjual</label><input type="number" style={inputStyle} value={productForm.fake_sales} onChange={e=>setProductForm({...productForm, fake_sales: e.target.value})} /></div>
                        <div style={{marginBottom:'1rem'}}><label style={labelStyle}>Gambar</label><input type="file" style={inputStyle} onChange={e=>setProductForm({...productForm, image: e.target.files[0]})} accept="image/*" /></div>
                        <div style={{marginBottom:'1rem'}}><label style={labelStyle}>Deskripsi</label><textarea style={{...inputStyle, minHeight:'100px'}} value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} /></div>
                        <button type="submit" disabled={btnLoading} className="btn-primary" style={{width:'100%', padding:'0.8rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px'}}>{btnLoading ? 'Saving...' : 'Simpan Produk'}</button>
                    </form>
                </Card>
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    {products.map(p => (
                        <Card key={p.id} style={{padding:'1rem', display:'flex', gap:'1rem', alignItems:'start'}}>
                            {p.image_url ? <img src={`${BACKEND_URL}${p.image_url}`} alt={p.name} style={{width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px'}} /> : <div style={{width:'80px', height:'80px', background:'#eee', borderRadius:'8px', display:'flex', justifyContent:'center', alignItems:'center'}}><Package color="#ccc"/></div>}
                            <div style={{flex:1}}>
                                <h4 style={{fontWeight:'bold'}}>{p.name}</h4>
                                <div style={{color:'#16a34a', fontWeight:'bold'}}>Rp {p.price.toLocaleString()}</div>
                                <div style={{fontSize:'0.8rem', color:'#64748b'}}>Terjual (Dummy): {p.fake_sales}</div>
                                <p style={{fontSize:'0.8rem', color:'#64748b', marginTop:'0.5rem'}}>{p.description}</p>
                            </div>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}><Trash2 size={18}/></button>
                        </Card>
                    ))}
                </div>
             </div>
          )}

          {/* TAB CHALLENGE GENERATOR (NEW PREVIEW FLOW) */}
          {activeTab === 'challenge_generator' && (
             <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                   <h2 className="heading-2" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Sparkles className="text-yellow-500"/> Challenge Generator (AI)</h2>
                   <p style={{ color: '#64748b', marginBottom: '1rem' }}>Buat misi harian otomatis (3 Tipe Kondisi x 3 Opsi Pilihan) dengan bantuan AI.</p>
                </div>
                
                <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Generator</CardTitle></CardHeader>
                    <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Topik Challenge</label>
                                <input type="text" placeholder="Contoh: Program Bebas Maag 30 Hari" value={genChallengeName} onChange={(e) => setGenChallengeName(e.target.value)} style={inputStyle} />
                            </div>
                            <button 
                                onClick={handleGeneratePreview} 
                                disabled={btnLoading} 
                                style={{ width:'100%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow:'0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                            > 
                                {btnLoading ? <Loader2 className="animate-spin" /> : <Bot size={20} />} 
                                {btnLoading ? 'Sedang Membuat Preview...' : 'Generate Preview (AI)'} 
                            </button>
                        </div>
                    </CardContent>
                </Card>
             </div>
          )}

          {/* TAB INPUT CHALLENGE (UPDATED - 3 OPSI PER TIPE) */}
          {activeTab === 'challenge_content' && (
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                  <h1 className="heading-2">Input Challenge 30 Hari</h1>
                  <div style={{display:'flex', gap:'1rem'}}>
                      <a href="https://docs.google.com/spreadsheets/d/1y9dkUeHdgxAnjhcUb56-7vtXrznNR0Ll1UQRdOtmFLQ/edit?gid=0#gid=0" target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'#10b981', color:'white', textDecoration:'none', padding:'0.5rem 1rem', borderRadius:'6px', fontWeight:'bold', fontSize:'0.9rem'}}>
                          <FileSpreadsheet size={18}/> Buka Master Sheet (Fakta & Promo)
                      </a>
                      <select value={selectedChallengeId || ""} onChange={(e) => setSelectedChallengeId(e.target.value)} style={selectStyle}>
                         <option value="" disabled>Pilih Challenge...</option>
                         {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <button onClick={handleSaveMatrix} disabled={btnLoading} style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--primary)', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer'}}>
                         {btnLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Simpan Challenge
                      </button>
                  </div>
              </div>
              
              {/* TAB SELECTOR UNTUK TIPE */}
              <div style={{display:'flex', gap:'1rem', marginBottom:'1rem', borderBottom:'1px solid #e2e8f0'}}>
                  {['A','B','C'].map(t => (
                      <button 
                        key={t}
                        onClick={()=>setActiveTypeTab(t.toLowerCase())}
                        style={{
                            padding:'0.8rem 2rem', 
                            borderBottom: activeTypeTab===t.toLowerCase() ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTypeTab===t.toLowerCase() ? 'var(--primary)' : '#64748b',
                            background: 'transparent',
                            borderTop: 'none', borderLeft:'none', borderRight:'none',
                            fontWeight: 'bold', cursor:'pointer', fontSize:'1rem'
                        }}
                      >
                          TIPE {t}
                      </button>
                  ))}
              </div>

              {loadingMatrix ? <div style={{padding:'2rem', textAlign:'center'}}>Loading data...</div> : (
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background:'white' }}>
                    <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th style={{...thStyle, width: '60px', background: '#f1f5f9', textAlign:'center'}}>Hari</th>
                            <th style={{...thStyle, textAlign:'center', background: activeTypeTab==='a'?'#dbeafe': activeTypeTab==='b'?'#dcfce7':'#fae8ff', color: activeTypeTab==='a'?'#1e40af': activeTypeTab==='b'?'#166534':'#86198f', width:'30%'}}>OPSI 1 (Mudah)</th>
                            <th style={{...thStyle, textAlign:'center', background: activeTypeTab==='a'?'#dbeafe': activeTypeTab==='b'?'#dcfce7':'#fae8ff', color: activeTypeTab==='a'?'#1e40af': activeTypeTab==='b'?'#166534':'#86198f', width:'30%'}}>OPSI 2 (Sedang)</th>
                            <th style={{...thStyle, textAlign:'center', background: activeTypeTab==='a'?'#dbeafe': activeTypeTab==='b'?'#dcfce7':'#fae8ff', color: activeTypeTab==='a'?'#1e40af': activeTypeTab==='b'?'#166534':'#86198f', width:'30%'}}>OPSI 3 (Menantang)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                            const row = contentMatrix[day] || {};
                            const currentKey = `challenge_${activeTypeTab}`;
                            const optionsArray = Array.isArray(row[currentKey]) ? row[currentKey] : ["", "", ""];

                            return (
                                <tr key={day} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{...tdStyle, textAlign:'center', fontWeight:'bold', background:'#f8fafc'}}>{day}</td>
                                    
                                    {[0, 1, 2].map((optIndex) => (
                                        <td key={optIndex} style={{...tdStyle, padding:'0.5rem', background: activeTypeTab==='a'?'#eff6ff': activeTypeTab==='b'?'#f0fdf4':'#faf5ff'}}>
                                            <textarea 
                                                placeholder={`Pilihan ${optIndex+1} untuk Hari ${day}`} 
                                                style={tableInputStyle} 
                                                value={optionsArray[optIndex] || ""} 
                                                onChange={e=>handleMatrixChange(day, currentKey, optIndex, e.target.value)} 
                                            />
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                      </tbody>
                    </table>
                  </div>
              )}
              <p style={{marginTop:'1rem', fontSize:'0.85rem', color:'#64748b', fontStyle:'italic'}}>* Masukkan 3 pilihan challenge yang berbeda setiap harinya agar user punya alternatif.</p>
            </div>
          )}

          {/* TAB USERS (UPDATED WITH RESET/DELETE) */}
          {activeTab === 'users' && (
            <Card style={{ overflowX: 'auto', background: 'white' }}>
                <CardHeader><CardTitle className="heading-3">Daftar Pengguna & Manajemen Challenge</CardTitle></CardHeader>
                <CardContent>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize:'0.9rem' }}>
                        <thead style={{background:'#f8fafc'}}>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={thStyle}>User Info</th>
                                <th style={thStyle}>Statistik</th>
                                <th style={thStyle}>Challenge Aktif</th>
                                <th style={thStyle}>Badge</th>
                                <th style={thStyle}>Aksi Challenge</th>
                                <th style={thStyle}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>
                                        <b>{u.name}</b><br/>
                                        <span style={{color:'#64748b', fontSize:'0.8rem'}}>{u.phone}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', fontSize:'0.75rem', border:'1px solid #e2e8f0'}}>
                                            Refs: {u.referral_count}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: u.active_challenge_id ? '#166534' : '#94a3b8', 
                                            fontWeight:'bold',
                                            background: u.active_challenge_id ? '#dcfce7' : 'transparent',
                                            padding: u.active_challenge_id ? '2px 8px' : '0',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {u.current_challenge}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <select value={u.badge} onChange={e=>handleUpdateUser(u.id,'badge',e.target.value)} style={{...selectStyle, fontSize:'0.8rem', padding:'2px'}}>
                                            {GEN_Z_BADGES.map(b=><option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        {u.active_challenge_id ? (
                                            <div style={{display:'flex', gap:'0.5rem'}}>
                                                <button 
                                                    onClick={() => handleResetUserChallenge(u.id, u.active_challenge_id, u.name)} 
                                                    title="Reset ke Hari 1"
                                                    disabled={btnLoading}
                                                    style={{background:'#f59e0b', color:'white', border:'none', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem'}}
                                                >
                                                    <RefreshCw size={14}/> Reset
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveUserChallenge(u.id, u.active_challenge_id, u.name)} 
                                                    title="Hapus dari Challenge"
                                                    disabled={btnLoading}
                                                    style={{background:'#ef4444', color:'white', border:'none', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem'}}
                                                >
                                                    <XCircle size={14}/> Del
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{color:'#94a3b8', fontSize:'0.8rem'}}>-</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <button onClick={()=>handleUpdateUser(u.id,'role',u.role==='admin'?'user':'admin')} style={{color:u.role==='admin'?'red':'blue', border:'none', background:'none', cursor:'pointer', fontWeight:'bold', fontSize:'0.8rem'}}>
                                            {u.role==='admin'?'Revoke Admin':'Make Admin'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
          )}
          
          {/* TAB ARTICLES */}
          {activeTab === 'articles' && (<div style={{display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap:'1.5rem'}}><Card style={{padding:'1.5rem', background:'white', height:'fit-content'}}><h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Artikel Baru</h3><form onSubmit={handlePostArticle}><div style={{marginBottom:'1rem'}}><label style={labelStyle}>Judul Artikel</label><input style={inputStyle} value={articleForm.title} onChange={e=>setArticleForm({...articleForm, title: e.target.value})} required placeholder="Tips Hidup Sehat..." /></div><div style={{marginBottom:'1rem'}}><label style={labelStyle}>Gambar (Otomatis Kompres)</label><input type="file" style={inputStyle} onChange={e=>setArticleForm({...articleForm, image: e.target.files[0]})} accept="image/*" /></div><div style={{marginBottom:'1rem'}}><label style={labelStyle}>Isi Konten (AI akan hitung waktu baca)</label><textarea style={{...inputStyle, minHeight:'150px'}} value={articleForm.content} onChange={e=>setArticleForm({...articleForm, content: e.target.value})} required placeholder="Tulis konten disini..." /></div><button type="submit" disabled={btnLoading} className="btn-primary" style={{width:'100%', padding:'0.8rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px', display:'flex', justifyContent:'center', gap:'0.5rem'}}>{btnLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={16}/> Publish Artikel (AI)</>}</button></form></Card><div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>{articles.map(a => (<Card key={a.id} style={{padding:'1rem', display:'flex', gap:'1rem', alignItems:'start'}}>{a.image_url && <img src={`${BACKEND_URL}${a.image_url}`} alt="art" style={{width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px'}} />}<div><h4 style={{fontWeight:'bold'}}>{a.title}</h4><p style={{fontSize:'0.8rem', color:'#64748b'}}>{a.content}</p></div></Card>))}</div></div>)}
          
          {/* TAB FINANCE (WD) */}
          {activeTab === 'finance' && (
             <div style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
                <Card style={{padding:'1.5rem', background:'white'}}>
                    <h3 style={{fontWeight:'bold', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><Wallet size={20}/> Permintaan Penarikan (WD)</h3>
                    <div style={{overflowX:'auto'}}>
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                            <thead style={{background:'#fefce8'}}>
                                <tr><th style={thStyle}>Tanggal</th><th style={thStyle}>User</th><th style={thStyle}>Jumlah</th><th style={thStyle}>Bank Info</th><th style={thStyle}>Status</th><th style={thStyle}>Aksi / ID Transaksi</th></tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(w => (
                                    <tr key={w.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                        <td style={tdStyle}>{w.date}</td>
                                        <td style={tdStyle}><b>{w.user_name}</b></td>
                                        <td style={tdStyle}>Rp {w.amount.toLocaleString()}</td>
                                        <td style={tdStyle}>{w.bank_info}</td>
                                        <td style={tdStyle}><span style={{padding:'2px 8px', borderRadius:'12px', background: w.status==='approved'?'#dcfce7':'#fee2e2', color: w.status==='approved'?'#166534':'#991b1b', fontSize:'0.75rem', fontWeight:'bold'}}>{w.status.toUpperCase()}</span></td>
                                        <td style={tdStyle}>{w.status === 'pending' ? (<div style={{display:'flex', gap:'0.5rem'}}><input placeholder="No. Bukti Transfer..." style={{...selectStyle, width:'150px'}} value={wdProcessingId === w.id ? wdRefInput : ''} onChange={e => { setWdProcessingId(w.id); setWdRefInput(e.target.value); }} /><button onClick={() => handleApproveWD(w.id)} disabled={btnLoading} style={{background:'#16a34a', color:'white', border:'none', borderRadius:'6px', padding:'0.4rem', cursor:'pointer'}}><CheckCircle size={16}/></button></div>) : (<span style={{fontSize:'0.8rem', color:'#64748b'}}>Ref: {w.transaction_ref}</span>)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </div>
          )}

        </main>
      </div>

      {/* MODAL DETAIL CHALLENGE & PESERTA */}
      {editingChallenge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setEditingChallenge(null)}>
           <div style={{ background: 'white', padding: '0', borderRadius: '12px', width: '90%', maxWidth: '800px', height:'85vh', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
             
             <div style={{padding:'1.5rem', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Detail Challenge</h3>
                 <button onClick={() => setEditingChallenge(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20}/></button>
             </div>

             <div style={{display:'flex', padding:'0 1.5rem', borderBottom:'1px solid #e2e8f0'}}>
                 <button onClick={() => setViewMode('info')} style={{padding:'1rem', borderBottom: viewMode==='info'?'2px solid var(--primary)':'none', color: viewMode==='info'?'var(--primary)':'#64748b', fontWeight:'bold', cursor:'pointer'}}>Edit Info</button>
                 <button onClick={() => setViewMode('participants')} style={{padding:'1rem', borderBottom: viewMode==='participants'?'2px solid var(--primary)':'none', color: viewMode==='participants'?'var(--primary)':'#64748b', fontWeight:'bold', cursor:'pointer'}}>Peserta & Laporan ({challengeParticipants.length})</button>
             </div>

             <div style={{padding:'1.5rem', overflowY:'auto', flex:1}}>
                 {viewMode === 'info' ? (
                     <>
                         <div style={{ marginBottom: '1rem' }}>
                             <label style={labelStyle}>Judul Challenge</label>
                             <input style={inputStyle} value={editingChallenge.title} onChange={(e) => setEditingChallenge({...editingChallenge, title: e.target.value})} />
                         </div>
                         <div style={{ marginBottom: '1.5rem' }}>
                             <label style={labelStyle}>Deskripsi & Tipe</label>
                             <textarea style={{ ...inputStyle, minHeight: '200px' }} value={editingChallenge.description} onChange={(e) => setEditingChallenge({...editingChallenge, description: e.target.value})} placeholder="Jelaskan tantangan ini..." />
                         </div>
                         <button onClick={handleUpdateChallenge} disabled={btnLoading} style={{ width:'100%', padding: '0.8rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight:'bold' }}>{btnLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                     </>
                 ) : (
                     <div style={{overflowX:'auto'}}>
                         {loadingParticipants ? <div style={{textAlign:'center', padding:'2rem'}}>Loading data peserta...</div> : (
                           <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
                               <thead style={{background:'#f8fafc'}}>
                                   <tr>
                                       <th style={thStyle}>Nama User</th>
                                       <th style={thStyle}>Tipe</th>
                                       <th style={thStyle}>Hari Ke</th>
                                       <th style={thStyle}>Status Hari Ini</th>
                                       <th style={thStyle}>Total Check-in</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {challengeParticipants.length > 0 ? challengeParticipants.map(p => (
                                       <tr key={p.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                           <td style={tdStyle}><b>{p.name}</b><br/><span style={{fontSize:'0.75rem', color:'#94a3b8'}}>{p.phone}</span></td>
                                           <td style={tdStyle}><span style={{background:'#eff6ff', color:'#1e40af', padding:'2px 6px', borderRadius:'4px', fontSize:'0.75rem'}}>{p.group}</span></td>
                                           <td style={tdStyle}>{p.day}</td>
                                           <td style={tdStyle}>
                                               {p.today_status === 'completed' && <span style={{color:'#16a34a', fontWeight:'bold', display:'flex', alignItems:'center', gap:'4px'}}><CheckCircle size={14}/> Selesai</span>}
                                               {p.today_status === 'skipped' && <span style={{color:'#dc2626', fontWeight:'bold'}}>Skip</span>}
                                               {p.today_status === 'pending' && <span style={{color:'#d97706', fontWeight:'bold'}}>Belum</span>}
                                           </td>
                                           <td style={tdStyle}>{p.total_completed}x</td>
                                       </tr>
                                   )) : (
                                       <tr><td colSpan="5" style={{padding:'2rem', textAlign:'center', color:'#64748b'}}>Belum ada peserta di challenge ini.</td></tr>
                                   )}
                               </tbody>
                           </table>
                         )}
                     </div>
                 )}
             </div>
           </div>
        </div>
      )}

      {/* --- NEW: PREVIEW MODAL --- */}
      {showPreviewModal && previewData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
           <div style={{ background: 'white', padding: '0', borderRadius: '16px', width: '90%', maxWidth: '700px', height:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
             <div style={{padding:'1.5rem', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', borderTopLeftRadius:'16px', borderTopRightRadius:'16px'}}>
                 <h3 style={{ fontWeight: '800', fontSize: '1.25rem', color:'#1e293b' }}>✨ Preview Hasil AI</h3>
                 <p style={{fontSize:'0.9rem', color:'#64748b'}}>Tinjau hasil generate sebelum disimpan.</p>
             </div>
             
             <div style={{padding:'1.5rem', overflowY:'auto', flex:1}}>
                 {/* 1. Deskripsi */}
                 <div style={{marginBottom:'1.5rem'}}>
                     <h4 style={{fontSize:'0.9rem', fontWeight:'700', color:'#475569', marginBottom:'0.5rem', textTransform:'uppercase'}}>Deskripsi Program</h4>
                     <div style={{padding:'1rem', background:'#f1f5f9', borderRadius:'8px', fontSize:'0.95rem', lineHeight:'1.6'}}>{previewData.description}</div>
                 </div>

                 {/* 2. Tipe User */}
                 <div style={{marginBottom:'1.5rem'}}>
                     <h4 style={{fontSize:'0.9rem', fontWeight:'700', color:'#475569', marginBottom:'0.5rem', textTransform:'uppercase'}}>Kategori User (Tipe)</h4>
                     <div style={{display:'grid', gap:'0.8rem'}}>
                         {previewData.types && Object.entries(previewData.types).map(([key, val], idx) => (
                             <div key={idx} style={{padding:'0.8rem', border:'1px solid #e2e8f0', borderRadius:'8px', display:'flex', alignItems:'center', gap:'0.8rem'}}>
                                 <span style={{background:'#dbeafe', color:'#1e40af', fontWeight:'bold', padding:'0.3rem 0.6rem', borderRadius:'6px', fontSize:'0.8rem'}}>
                                     {typeof val === 'object' ? val.name : key} {/* Handle format array obj / key-val */}
                                 </span>
                                 <span style={{fontSize:'0.9rem', color:'#334155'}}>{typeof val === 'object' ? val.description : val}</span>
                             </div>
                         ))}
                         {/* Fallback jika format array */}
                         {Array.isArray(previewData.types) && previewData.types.map((t, idx) => (
                             <div key={idx} style={{padding:'0.8rem', border:'1px solid #e2e8f0', borderRadius:'8px'}}>
                                 <div style={{fontWeight:'bold', color:'#3b82f6'}}>{t.name}</div>
                                 <div style={{fontSize:'0.85rem', color:'#64748b'}}>{t.description}</div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* 3. Pertanyaan Kuis */}
                 <div>
                     <h4 style={{fontSize:'0.9rem', fontWeight:'700', color:'#475569', marginBottom:'0.5rem', textTransform:'uppercase'}}>Kuis Diagnosa ({previewData.questions.length} Soal)</h4>
                     <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                         {previewData.questions.map((q, idx) => (
                             <Card key={idx} style={{padding:'1rem', border:'1px dashed #cbd5e1', background:'#fff'}}>
                                 <div style={{fontWeight:'bold', marginBottom:'0.8rem'}}>Q{idx+1}: {q.text}</div>
                                 <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                     {q.options.map((opt, i) => (
                                         <li key={i} style={{fontSize:'0.85rem', display:'flex', justifyContent:'space-between', background:'#f8fafc', padding:'0.5rem', borderRadius:'4px'}}>
                                             <span>{opt.text}</span>
                                             <span style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b', background:'#e2e8f0', padding:'2px 6px', borderRadius:'4px'}}>{opt.type}</span>
                                         </li>
                                     ))}
                                 </ul>
                             </Card>
                         ))}
                     </div>
                 </div>
             </div>

             <div style={{padding:'1.5rem', borderTop:'1px solid #e2e8f0', background:'#f8fafc', borderBottomLeftRadius:'16px', borderBottomRightRadius:'16px', display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
                 <button 
                    onClick={() => setShowPreviewModal(false)}
                    style={{padding:'0.8rem 1.5rem', background:'white', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', color:'#64748b'}}
                 >
                     Batal / Generate Ulang
                 </button>
                 <button 
                    onClick={handleSaveGeneratedChallenge}
                    disabled={btnLoading}
                    style={{padding:'0.8rem 1.5rem', background:'var(--primary)', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', color:'white', display:'flex', alignItems:'center', gap:'0.5rem'}}
                 >
                     {btnLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18}/>}
                     Setujui & Simpan
                 </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ label, val, icon, color }) => (<Card style={{ border: 'none', background: 'white', padding: '1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}><div><p style={{color:'#64748b'}}>{label}</p><h3>{val}</h3></div><div style={{color:color}}>{icon}</div></Card>);
const inputStyle = { width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' };
const tableInputStyle = { width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', minHeight:'50px', fontSize:'0.8rem' };
const selectStyle = { padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' };
const thStyle = { padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' };
const tdStyle = { padding: '0.75rem', fontSize: '0.85rem' };
const subThStyle = { padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', minWidth: '180px' };
const dashStyle = { display:'block', textAlign:'center', color:'#cbd5e1', fontSize:'1.2rem' };
const labelStyle = { display:'block', marginBottom:'0.4rem', fontSize:'0.85rem', fontWeight:'600', color:'#475569'};

export default AdminDashboard;
