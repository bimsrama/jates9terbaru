import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, 
  Smartphone, DollarSign, Calendar, Plus, Award, Menu, Sparkles, Trash2, Clock, Save, Image as ImageIcon, CheckCircle, Edit3, Eye, Package, Receipt, Bell, Truck, AlertTriangle
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
  const [orders, setOrders] = useState([]); // State Pesanan
  const [notifications, setNotifications] = useState([]); // State Notifikasi
  
  // FORM STATES
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', fake_sales: 0, image: null });
  const [articleForm, setArticleForm] = useState({ title: '', content: '', image: null });

  // FINANCE & TRANSACTION STATES
  const [withdrawals, setWithdrawals] = useState([]);
  const [wdRefInput, setWdRefInput] = useState(""); 
  const [wdProcessingId, setWdProcessingId] = useState(null);

  // MATRIX STATES
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [contentMatrix, setContentMatrix] = useState({});
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [newChallengeTitle, setNewChallengeTitle] = useState("");

  // EDIT & VIEW CHALLENGE STATE
  const [editingChallenge, setEditingChallenge] = useState(null); 
  const [challengeParticipants, setChallengeParticipants] = useState([]);
  const [viewMode, setViewMode] = useState('info'); 
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // GENERATOR WA STATE
  const [genChallengeName, setGenChallengeName] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  useEffect(() => {
    fetchStats();
    fetchChallengeCards();
    fetchNotifications(); // Auto fetch notif
  }, []);

  useEffect(() => {
    if (activeTab === 'challenge_content' && selectedChallengeId) fetchContentMatrix(selectedChallengeId);
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'articles') fetchArticles();
    if (activeTab === 'products') fetchProducts(); 
    if (activeTab === 'finance') fetchWithdrawals(); 
    if (activeTab === 'orders') fetchOrders(); // Tab Pesanan Baru
  }, [activeTab, selectedChallengeId]);

  // --- API FETCH ---
  const fetchStats = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeader() }); setStats(res.data); } catch (e) {} };
  const fetchUsers = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: getAuthHeader() }); setUsers(res.data); } catch (e) {} };
  const fetchChallengeCards = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/challenges`); setChallenges(res.data); if(res.data.length && !selectedChallengeId) setSelectedChallengeId(res.data[0].id); } catch (e) {} };
  const fetchContentMatrix = async (id) => { setLoadingMatrix(true); try { const res = await axios.get(`${BACKEND_URL}/api/admin/campaign/matrix/${id}`, { headers: getAuthHeader() }); const m={}; res.data.forEach(x=>{m[x.day_sequence]=x}); setContentMatrix(m); } catch(e){} setLoadingMatrix(false); };
  const fetchArticles = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeader() }); setArticles(res.data); } catch(e){} };
  const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/products`, { headers: getAuthHeader() }); setProducts(res.data); } catch(e){} };
  
  // FINANCE FETCH
  const fetchWithdrawals = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/finance/withdrawals`, { headers: getAuthHeader() }); setWithdrawals(res.data); } catch(e){} };

  // ORDERS FETCH [BARU]
  const fetchOrders = async () => { 
      try { 
          const res = await axios.get(`${BACKEND_URL}/api/admin/orders`, { headers: getAuthHeader() }); 
          setOrders(res.data); 
      } catch(e){} 
  };

  // NOTIFICATIONS FETCH [BARU]
  const fetchNotifications = async () => {
      try {
          // Asumsi backend punya endpoint ini (bisa reuse endpoint user/notifications jika logicnya handle admin)
          // Atau buat endpoint khusus admin notif
          // Di sini kita pakai mock dulu atau sesuaikan dengan endpoint yang ada
      } catch(e){}
  };

  // FETCH PARTICIPANTS
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
      
      try { 
        await axios.post(`${BACKEND_URL}/api/admin/products`, fd, { headers: {...getAuthHeader(), 'Content-Type': 'multipart/form-data'} }); 
        alert("Produk Ditambahkan!"); 
        setProductForm({name:'', price:'', description:'', fake_sales:0, image:null}); 
        fetchProducts(); 
      } catch(e){ alert("Error"); } 
      setBtnLoading(false);
  };

  const handleDeleteProduct = async (id) => {
      if(!window.confirm("Hapus produk ini?")) return;
      try { await axios.delete(`${BACKEND_URL}/api/admin/products/${id}`, { headers: getAuthHeader() }); fetchProducts(); } catch(e){ alert("Gagal hapus"); }
  };

  const handleSaveMatrix = async () => { if(!selectedChallengeId) return; setBtnLoading(true); try { const pl = Object.keys(contentMatrix).map(d=>({day_sequence:parseInt(d), challenge_id:selectedChallengeId, ...contentMatrix[d]})); await axios.post(`${BACKEND_URL}/api/admin/campaign/matrix/save`, {challenge_id:selectedChallengeId, data:pl}, {headers:getAuthHeader()}); alert("Saved!"); } catch(e){alert("Error");} setBtnLoading(false); };
  const handleGenerateAI = async () => { if(!newChallengeTitle || !window.confirm("Generate?")) return; setBtnLoading(true); try { await axios.post(`${BACKEND_URL}/api/admin/quiz/generate-challenge-auto`, {title:newChallengeTitle}, {headers:getAuthHeader()}); alert("Done!"); setNewChallengeTitle(""); fetchChallengeCards(); } catch(e){alert("Fail");} setBtnLoading(false); };
  
  const handleDeleteChallenge = async (id, e) => { 
      e.stopPropagation(); 
      if(window.confirm("Delete?")) try { await axios.delete(`${BACKEND_URL}/api/admin/quiz/delete-challenge/${id}`, {headers:getAuthHeader()}); setChallenges(challenges.filter(c=>c.id!==id)); } catch(e){} 
  };
  
  const handleUpdateChallenge = async () => {
    if(!editingChallenge) return;
    setBtnLoading(true);
    try {
        await axios.post(`${BACKEND_URL}/api/admin/quiz/update-challenge`, editingChallenge, { headers: getAuthHeader() });
        alert("Challenge berhasil diupdate!");
        setEditingChallenge(null);
        fetchChallengeCards();
    } catch (e) {
        alert("Gagal update challenge. Pastikan backend mendukung route ini.");
    } finally {
        setBtnLoading(false);
    }
  };

  const handleOpenChallengeModal = (challenge) => {
    setEditingChallenge(challenge);
    setViewMode('info'); 
    fetchParticipants(challenge.id);
  };

  const handleUpdateUser = async (uid, type, val) => {
    try {
        const payload = { user_id: uid };
        if (type === 'role') payload.role = val;
        if (type === 'badge') payload.badge = val;

        await axios.post(`${BACKEND_URL}/api/admin/users/update-role`, payload, { headers: getAuthHeader() });
        fetchUsers(); 
        alert(`User ${type} berhasil diubah!`);
    } catch(e) {
        alert("Gagal update user.");
    }
  };
  
  const handleMatrixChange = (d,f,v) => setContentMatrix(p=>({...p, [d]:{...p[d],[f]:v}}));

  // --- LOGIC GENERATOR WA ---
  const generatePrompt = () => {
    if (!genChallengeName) { alert("Mohon isi Nama Program Challenge!"); return; }
    const template = `
Topik Challenge: "${genChallengeName}"
TUGAS ANDA:
1. Analisa topik di atas.
2. Tentukan 3 Tipe/Kategori Peserta (Tipe A, Tipe B, Tipe C) yang paling relevan.
3. Buatkan konten WhatsApp Broadcast 30 Hari.

STRUKTUR OUTPUT (Format Tabel/List):
[JUDUL: Daftar Tipe]
- Tipe A: [Nama]
- Tipe B: [Nama]
- Tipe C: [Nama]

[KONTEN HARIAN]
1. BAGIAN 1: 30 HARI CHALLENGE (Action)
   - Kode: CH_[KODE_TIPE]_[HARI]
   - Isi: Tantangan harian.
2. BAGIAN 2: 30 HARI FAKTA (Edukasi)
   - Kode: FT_[KODE_TIPE]_[HARI]
   - Isi: Fakta.
3. BAGIAN 3: SOFT SELLING JATES9 (Hari 1,3,6,9...)
   - Kode: SS_[KODE_TIPE]_[HARI]
   - Isi: Jualan soft.
STYLE: Casual, akrab, emoji.
    `;
    setGeneratedPrompt(template.trim());
  };

  const handleOpenGemini = () => {
    if (!generatedPrompt) return alert("Generate prompt dulu!");
    navigator.clipboard.writeText(generatedPrompt).then(() => {
        alert("Prompt disalin! Paste di Gemini.");
        window.open("https://gemini.google.com/app", "_blank");
    }).catch(err => { alert("Gagal menyalin: " + err); });
  };

  const handleResetGenerator = () => { setGenChallengeName(""); setGeneratedPrompt(""); };

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
          <SidebarItem id="products" icon={Package} label="Manajemen Produk" />
          <SidebarItem id="finance" icon={Wallet} label="Keuangan & WD" />
          <SidebarItem id="challenge_content" icon={Calendar} label="Broadcast 30 Hari" />
          <SidebarItem id="users" icon={Users} label="User & Referral" />
          <SidebarItem id="articles" icon={FileText} label="Artikel Kesehatan" />
          <SidebarItem id="wa_generator" icon={Sparkles} label="Generator WA" />
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
              
              {/* Notifikasi Singkat */}
              <Card style={{marginBottom:'2rem', padding:'1.5rem', background:'white'}}>
                  <h3 style={{fontWeight:'bold', marginBottom:'1rem', display:'flex', gap:'0.5rem', alignItems:'center'}}><Bell size={18}/> Notifikasi Terbaru</h3>
                  <div style={{maxHeight:'200px', overflowY:'auto'}}>
                      <p style={{color:'#64748b', fontSize:'0.9rem', fontStyle:'italic'}}>Belum ada notifikasi baru.</p>
                  </div>
              </Card>

              <h2 className="heading-2" style={{marginBottom:'1rem'}}>Manajemen Challenge</h2>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.5fr', gap: '1.5rem' }}>
                <Card style={{ padding: '1.5rem', background: 'white', height: 'fit-content' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Buat Challenge Baru</h3>
                  <input placeholder="Judul Tantangan..." style={{ ...inputStyle, marginBottom: '1rem' }} value={newChallengeTitle} onChange={(e) => setNewChallengeTitle(e.target.value)} />
                  <button onClick={handleGenerateAI} disabled={btnLoading} className="btn-primary" style={{ width: '100%', padding:'0.7rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px' }}>{btnLoading ? 'Loading...' : 'Generate via AI'}</button>
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

          {/* TAB ORDERS (BARU) */}
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
                                        <select 
                                            value={o.status} 
                                            onChange={(e)=>handleUpdateOrder(o.order_id, e.target.value, o.resi)}
                                            style={{...selectStyle, padding:'2px 6px', fontSize:'0.8rem', borderColor: o.status==='cancelled'?'red':'#cbd5e1'}}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid (Dikemas)</option>
                                            <option value="shipped">Shipped (Dikirim)</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        <input 
                                            defaultValue={o.resi} 
                                            placeholder="Input Resi..." 
                                            onBlur={(e)=>handleUpdateOrder(o.order_id, o.status, e.target.value)}
                                            style={{padding:'4px', borderRadius:'4px', border:'1px solid #cbd5e1', width:'120px', fontSize:'0.8rem'}}
                                        />
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

          {/* TAB MANAJEMEN PRODUK */}
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

          {/* TAB WA GENERATOR */}
          {activeTab === 'wa_generator' && (
             <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                   <h2 className="heading-2">Generator Konten WA</h2>
                   <p style={{ color: '#64748b', marginBottom: '1rem' }}>Bikin konten challenge 30 hari otomatis dengan bantuan AI.</p>
                   <a href="https://docs.google.com/spreadsheets/d/1y9dkUeHdgxAnjhcUb56-7vtXrznNR0Ll1UQRdOtmFLQ/edit?usp=sharing" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white', padding: '0.7rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}> <FileSpreadsheet size={18} /> Buka Sheet Broadcast </a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                   <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                      <CardHeader><CardTitle className="heading-3">1. Konfigurasi Challenge</CardTitle></CardHeader>
                      <CardContent>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Nama Program Challenge</label><input type="text" placeholder="Contoh: Program Bebas Maag 30 Hari" value={genChallengeName} onChange={(e) => setGenChallengeName(e.target.value)} style={inputStyle} /></div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                               <button onClick={generatePrompt} style={{ flex: 1, background: '#16a34a', color: 'white', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}> <Sparkles size={18} /> Buat Prompt </button>
                               <button onClick={handleResetGenerator} style={{ background: '#f1f5f9', color: '#64748b', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> <Trash2 size={18} /> Reset </button>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                   {generatedPrompt && (
                      <Card style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                         <CardHeader><CardTitle className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={20} color="#2563eb" /> 2. Hasil Prompt (Siap Copy)</CardTitle></CardHeader>
                         <CardContent>
                            <textarea readOnly value={generatedPrompt} style={{ width: '100%', height: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical', background: 'white' }}></textarea>
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                               <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Klik tombol di bawah untuk copy otomatis & buka Gemini:</p>
                               <button onClick={handleOpenGemini} style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}><Bot size={24} /> BUKA GEMINI AI & PASTE</button>
                            </div>
                         </CardContent>
                      </Card>
                   )}
                </div>
             </div>
          )}

          {/* TAB CHALLENGE CONTENT */}
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
                    <table style={{ width: '100%', minWidth: '2000px', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th style={{...thStyle, width: '50px', background: '#f1f5f9'}}></th>
                            <th colSpan={3} style={{...thStyle, textAlign:'center', background: '#dbeafe', color: '#1e40af', borderRight:'2px solid white'}}>GROUP A (Misal: Sembelit)</th>
                            <th colSpan={3} style={{...thStyle, textAlign:'center', background: '#dcfce7', color: '#166534', borderRight:'2px solid white'}}>GROUP B (Misal: Kembung)</th>
                            <th colSpan={3} style={{...thStyle, textAlign:'center', background: '#fae8ff', color: '#86198f'}}>GROUP C (Misal: GERD)</th>
                        </tr>
                        <tr>
                          <th style={{...thStyle, textAlign:'center'}}>Hari</th>
                          <th style={subThStyle}>Tugas A</th><th style={subThStyle}>Fakta A</th><th style={subThStyle}>Soft Sell A</th>
                          <th style={subThStyle}>Tugas B</th><th style={subThStyle}>Fakta B</th><th style={subThStyle}>Soft Sell B</th>
                          <th style={subThStyle}>Tugas C</th><th style={subThStyle}>Fakta C</th><th style={subThStyle}>Soft Sell C</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                            const row = contentMatrix[day] || {};
                            return (
                                <tr key={day} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{...tdStyle, textAlign:'center', fontWeight:'bold', background:'#f8fafc'}}>{day}</td>
                                    {/* GROUP A */}
                                    <td style={{...tdStyle, background: '#eff6ff'}}><textarea style={tableInputStyle} value={row.challenge_a||""} onChange={e=>handleMatrixChange(day,'challenge_a',e.target.value)} /></td>
                                    <td style={{...tdStyle, background: '#eff6ff'}}><textarea style={tableInputStyle} value={row.fact_a||""} onChange={e=>handleMatrixChange(day,'fact_a',e.target.value)} /></td>
                                    <td style={{...tdStyle, background: '#eff6ff'}}>{day%3===0 || day===1 ? <textarea style={{...tableInputStyle, borderColor: '#93c5fd'}} value={row.soft_sell_a||""} onChange={e=>handleMatrixChange(day,'soft_sell_a',e.target.value)} /> : <span style={dashStyle}>-</span>}</td>
                                    {/* GROUP B */}
                                    <td style={{...tdStyle, background: '#f0fdf4'}}><textarea style={tableInputStyle} value={row.challenge_b||""} onChange={e=>handleMatrixChange(day,'challenge_b',e.target.value)} /></td>
                                    <td style={{...tdStyle, background: '#f0fdf4'}}><textarea style={tableInputStyle} value={row.fact_b||""} onChange={e=>handleMatrixChange(day,'fact_b',e.target.value)} /></td>
                                    <td style={{...tdStyle, background: '#f0fdf4'}}>{day%3===0 || day===1 ? <textarea style={{...tableInputStyle, borderColor: '#86efac'}} value={row.soft_sell_b||""} onChange={e=>handleMatrixChange(day,'soft_sell_b',e.target.value)} /> : <span style={dashStyle}>-</span>}</td>
                                    {/* GROUP C */}
                                    <td style={{...tdStyle, background: '#faf5ff'}}><textarea style={tableInputStyle} value={row.challenge_c||""} onChange={e=>handleMatrixChange(day,'challenge_c',e.target.value)} /></td>
                                    <td style={{...tdStyle, background: '#faf5ff'}}><textarea style={tableInputStyle} value={row.fact_c||""} onChange={e=>handleMatrixChange(day,'fact_c',e.target.value)} /></td>
                                    <td style={{...tdStyle, background: '#faf5ff'}}>{day%3===0 || day===1 ? <textarea style={{...tableInputStyle, borderColor: '#d8b4fe'}} value={row.soft_sell_c||""} onChange={e=>handleMatrixChange(day,'soft_sell_c',e.target.value)} /> : <span style={dashStyle}>-</span>}</td>
                                </tr>
                            )
                        })}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          )}

          {/* TAB USERS */}
          {activeTab === 'users' && (<Card style={{ overflowX: 'auto', background: 'white' }}><CardHeader><CardTitle className="heading-3">Daftar Pengguna</CardTitle></CardHeader><CardContent><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}><th style={thStyle}>User</th><th style={thStyle}>Statistik</th><th style={thStyle}>Challenge</th><th style={thStyle}>Badge</th><th style={thStyle}>Aksi</th></tr></thead><tbody>{users.map(u => (<tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={tdStyle}><b>{u.name}</b><br/>{u.phone}</td><td style={tdStyle}><span style={{background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', fontSize:'0.75rem'}}>Refs: {u.referral_count}</span></td><td style={tdStyle}><span style={{color:u.current_challenge!=='-'?'#16a34a':'#94a3b8', fontWeight:'bold'}}>{u.current_challenge}</span></td><td style={tdStyle}><select value={u.badge} onChange={e=>handleUpdateUser(u.id,'badge',e.target.value)} style={selectStyle}>{GEN_Z_BADGES.map(b=><option key={b} value={b}>{b}</option>)}</select></td><td style={tdStyle}><button onClick={()=>handleUpdateUser(u.id,'role',u.role==='admin'?'user':'admin')} style={{color:u.role==='admin'?'red':'blue', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>{u.role==='admin'?'Revoke':'Admin'}</button></td></tr>))}</tbody></table></CardContent></Card>)}
          
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
                              <label style={labelStyle}>Deskripsi & Tipe (A/B/C)</label>
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
