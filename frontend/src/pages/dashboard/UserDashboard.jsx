import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, Users, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, 
  Package, ShoppingBag, ChevronLeft, Clock, CheckCircle, Calendar, RefreshCw, FileText,
  Camera, Bot, Sparkles, MapPin, Truck, Plus, Check, Bell, Edit2, Send, X, Loader,
  MessageSquareQuote, ShoppingCart, Play, Pause, Square, Target, TrendingUp, Zap, 
  Home, BookOpen, Shield, Trophy, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import HealthReport from './HealthReport'; // IMPORT COMPONENT BARU

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- KONFIGURASI TEMA ---
const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#8fec78', light: '#dcfce7', text: '#166534', gradient: 'linear-gradient(135deg, #ffffff 0%, #8fec78 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #14532d 100%)' },
  red: { id: 'red', name: 'Merah Berani', primary: '#fca5a5', light: '#fee2e2', text: '#991b1b', gradient: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' },
  gold: { id: 'gold', name: 'Emas Mewah', primary: '#fcd34d', light: '#fef3c7', text: '#b45309', gradient: 'linear-gradient(135deg, #ffffff 0%, #fcd34d 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #78350f 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#93c5fd', light: '#dbeafe', text: '#1e40af', gradient: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' },
  purple: { id: 'purple', name: 'Ungu Misteri', primary: '#d8b4fe', light: '#f3e8ff', text: '#6b21a8', gradient: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #581c87 100%)' },
};

const MOTIVATIONS = [ "Kesehatan adalah investasi terbaikmu.", "Setiap langkah kecil membawamu lebih dekat ke tujuan.", "Tubuhmu adalah satu-satunya tempat kamu tinggal, jagalah!", "Jangan menyerah, proses tidak akan mengkhianati hasil." ];

// --- COMPONENT MODAL RESPONSIF (REUSABLE) ---
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
        {title && (
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>{title}</h3>
            <button onClick={onClose} style={{ background: '#e2e8f0', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        )}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [myChallenges, setMyChallenges] = useState([]); 
  const [selectedChallenge, setSelectedChallenge] = useState(null); 
  const [dailyContent, setDailyContent] = useState(null);
  const [checkinHistory, setCheckinHistory] = useState([]); // Data untuk Rapor
  const [showHealthReport, setShowHealthReport] = useState(false); // Toggle Rapor

  // STATE LAIN
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  const currentTheme = THEMES[themeColor] || THEMES['green'];

  const [friendsData, setFriendsData] = useState([]);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // MODAL STATES
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // FORM STATES
  const [journalText, setJournalText] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [aiSummaryResult, setAiSummaryResult] = useState("");
  const [targetJoinChallenge, setTargetJoinChallenge] = useState(null);
  const [friendCode, setFriendCode] = useState("");
  
  // CHAT STATE
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: "assistant", content: "Halo! Saya Dr. Alva. Ada yang bisa saya bantu?" }]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // CHECKOUT STATE
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("jne");
  const [selectedAddrId, setSelectedAddrId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [newAddr, setNewAddr] = useState({ label:'Rumah', name:'', phone:'', prov_id:'', city_id:'', address:'', zip:'' });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    fetchData(); fetchMyChallenges(); fetchArticles();
    axios.get(`${BACKEND_URL}/api/location/provinces`).then(res => setProvinces(res.data));
    
    // Load Midtrans
    const script = document.createElement('script'); script.src = "https://app.midtrans.com/snap/snap.js"; script.setAttribute('data-client-key', "Mid-client-dXaTaEerstu_IviP"); script.async = true; document.body.appendChild(script);
    
    return () => { window.removeEventListener('resize', handleResize); if(document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const fetchData = async () => {
    try { const res = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() }); setOverview(res.data); } catch (e) {}
  };
  const fetchMyChallenges = async () => {
    try { const res = await axios.get(`${BACKEND_URL}/api/user/my-challenges`, { headers: getAuthHeader() }); setMyChallenges(res.data); } catch (e) {}
  };
  const fetchDailyContent = async (challengeId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/daily-content?challenge_id=${challengeId}`, { headers: getAuthHeader() });
      setDailyContent(res.data);
      // Ambil history untuk rapor
      const histRes = await axios.get(`${BACKEND_URL}/api/user/checkin-history`, { headers: getAuthHeader() });
      const filtered = histRes.data.filter(log => log.challenge_id === challengeId || !log.challenge_id);
      setCheckinHistory(filtered);
    } catch (e) {}
    setLoading(false);
  };
  const fetchFriendsList = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() }); setFriendsData(res.data.friends); } catch (e) {} };
  const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/products`); setProducts(res.data); } catch(e){} };
  const fetchOrders = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() }); setMyOrders(res.data); } catch(e){} };
  const fetchAddresses = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); setAddresses(res.data); } catch(e){} };

  // --- HANDLERS NAVIGASI ---
  const handleNavClick = (tab) => { setActiveTab(tab); setSelectedChallenge(null); setShowHealthReport(false); };
  
  // --- HANDLER CHALLENGE ---
  const handleOpenChallenge = (chal) => {
      setSelectedChallenge(chal);
      fetchDailyContent(chal.id);
      setShowHealthReport(false); 
      setActiveTab('challenge'); // Pindah ke tab challenge
  };
  const handleBackToChallengeList = () => { setSelectedChallenge(null); setDailyContent(null); setShowHealthReport(false); };
  const handleCheckinSubmit = async () => {
      if(!dailyContent) return;
      try {
          await axios.post(`${BACKEND_URL}/api/checkin`, { challenge_id: selectedChallenge.id, journal: journalText, status: 'completed', completed_tasks: completedTasks }, { headers: getAuthHeader() });
          alert("Laporan terkirim! 🎉"); setShowCheckinModal(false); fetchDailyContent(selectedChallenge.id);
      } catch (e) { alert("Gagal check-in."); }
  };
  const initiateJoinChallenge = (c) => { setTargetJoinChallenge(c); if (myChallenges.length >= 2) { setShowLimitModal(true); return; } startQuiz(c.id); };
  const startQuiz = async (id) => { try { const res = await axios.get(`${BACKEND_URL}/api/quiz/questions/${id}`, { headers: getAuthHeader() }); setQuizQuestions(res.data); setCurrentQuizIdx(0); setQuizAnswers({}); setShowQuizModal(true); } catch(e){} };
  const handleQuizAnswer = (cat) => { const qId = quizQuestions[currentQuizIdx].id; setQuizAnswers(p => ({...p, [qId]: cat})); if (currentQuizIdx < quizQuestions.length - 1) setCurrentQuizIdx(p => p+1); else submitQuizResult(cat); };
  const submitQuizResult = async (lastAns) => {
      const finalAns = { ...quizAnswers, [quizQuestions[currentQuizIdx].id]: lastAns };
      try { const res = await axios.post(`${BACKEND_URL}/api/quiz/submit`, { challenge_id: targetJoinChallenge.id, answers: finalAns, score: 100, health_type: "Tipe A" }, { headers: getAuthHeader() }); setAiSummaryResult(res.data.ai_summary); setShowQuizModal(false); setShowAiSummaryModal(true); fetchMyChallenges(); } catch(e){}
  };
  
  // --- HANDLER LAINNYA ---
  const handleSendChat = async (e) => { e.preventDefault(); if(!chatMessage.trim()) return; const msg = chatMessage; setChatHistory(p => [...p, {role:"user", content:msg}]); setChatMessage(""); setChatLoading(true); try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()}); setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]); } catch (e) {} finally { setChatLoading(false); } };
  const handleAddFriend = async () => { if(!friendCode) return; try { await axios.post(`${BACKEND_URL}/api/friends/add`, { referral_code: friendCode }, { headers: getAuthHeader() }); alert("Sukses!"); setFriendCode(""); fetchFriendsList(); } catch(e){ alert("Gagal tambah teman"); } };
  const handleProfilePictureUpload = async (e) => { const file = e.target.files[0]; if(!file) return; const fd = new FormData(); fd.append('image', file); try { await axios.post(`${BACKEND_URL}/api/user/upload-profile-picture`, fd, { headers: {...getAuthHeader(), 'Content-Type': 'multipart/form-data'} }); fetchData(); alert("Foto update!"); } catch(e){} };
  const handleSaveAddress = async () => { try { await axios.post(`${BACKEND_URL}/api/user/address`, newAddr, { headers: getAuthHeader() }); fetchAddresses(); setShowAddressModal(false); } catch(e){} };
  const handleProvChange = (e) => { const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text; setNewAddr({...newAddr, prov_id: id, city_id:''}); axios.get(`${BACKEND_URL}/api/location/cities?prov_id=${id}`).then(res => setCities(res.data)); };
  const openCheckout = (prod) => { setSelectedProduct(prod); setShowCheckoutModal(true); fetchAddresses(); };
  const handleProcessPayment = async () => { try { const res = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, { item_name: selectedProduct.name, shipping_cost: 0, address_detail: addresses.find(a=>a.id==selectedAddrId), shipping_method: 'JNE Regular', discount:0 }, { headers: getAuthHeader() }); if(res.data.success) { setShowCheckoutModal(false); window.snap.pay(res.data.token); } } catch(e){} };

  // --- RENDERERS ---
  const renderChallengeTab = () => {
    if (!selectedChallenge) {
        // VIEW 1: LIST CHALLENGE
        return (
            <div className="animate-fade-in">
                <h2 style={{fontSize:'1.25rem', fontWeight:'bold', marginBottom:'1.5rem'}}>Pilih Challenge Aktif</h2>
                {myChallenges.length > 0 ? (
                    <div style={{display:'grid', gap:'1rem'}}>
                        {myChallenges.map(chal => (
                            <div key={chal.id} onClick={() => handleOpenChallenge(chal)} style={{background:'white', padding:'1.5rem', borderRadius:'16px', border:`1px solid ${currentTheme.light}`, boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <h3 style={{fontWeight:'bold', fontSize:'1.1rem'}}>{chal.title}</h3>
                                    <span style={{fontSize:'0.8rem', color:'#64748b'}}>Lanjut Hari ke-{chal.current_day}</span>
                                </div>
                                <ChevronRight color="#94a3b8"/>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>Belum ada challenge. Pilih dari rekomendasi di Home.</div>
                )}
            </div>
        );
    }

    if (showHealthReport) {
        // VIEW 3: RAPOR / HEALTH REPORT (Menggantikan tab Riwayat lama)
        return (
            <HealthReport 
                user={overview?.user}
                logs={checkinHistory} 
                challengeTitle={selectedChallenge.title} 
                onClose={() => setShowHealthReport(false)} 
                theme={currentTheme}
            />
        );
    }

    // VIEW 2: DETAIL CHALLENGE
    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            <button onClick={handleBackToChallengeList} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}>
                <ChevronLeft size={18} /> Kembali
            </button>

            <Card style={{ background: currentTheme.gradient, color: '#064e3b', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', border: 'none' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.2rem' }}>Hari ke-{dailyContent?.day || 1}</h2>
                <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>{selectedChallenge.title}</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowHealthReport(true)} style={{ flex: 1, background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.5)', padding: '0.6rem', borderRadius: '8px', color: '#065f46', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <TrendingUp size={16} /> Lihat Perkembangan Saya
                    </button>
                </div>
            </Card>

            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Misi Hari Ini</h3>
            {loading ? <div style={{textAlign:'center'}}><Loader className="animate-spin"/></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dailyContent?.tasks?.map((task, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: currentTheme.light, padding: '0.5rem', borderRadius: '8px', color: currentTheme.text, fontWeight: 'bold' }}>{idx + 1}</div>
                            <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#334155' }}>{task}</div>
                        </div>
                    ))}
                    <button onClick={() => { setCompletedTasks([]); setShowCheckinModal(true); }} disabled={dailyContent?.today_status === 'completed'} style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: dailyContent?.today_status === 'completed' ? '#cbd5e1' : currentTheme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: dailyContent?.today_status === 'completed' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {dailyContent?.today_status === 'completed' ? <><CheckCircle size={20} /> Selesai</> : '✅ Lapor Check-in'}
                    </button>
                </div>
            )}
        </div>
    );
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>

      {/* Main Content */}
      <div style={{ padding: '1.5rem', paddingBottom: '100px' }}>
        {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
                {/* Header & Banner dari kode lama tetap disini */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div><h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Halo, {overview?.user?.name?.split(' ')[0]}! 👋</h1></div>
                    <div onClick={() => setActiveTab('settings')}><Settings size={24} color="#64748b"/></div>
                </div>
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Tantangan Saya</h3>
                <div style={{display:'grid', gap:'1rem'}}>
                    {myChallenges.map(chal => (
                        <Card key={chal.id} onClick={() => handleOpenChallenge(chal)} style={{ padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ fontWeight: 'bold' }}>{chal.title}</h4>
                                <span style={{ background: currentTheme.light, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>Hari {chal.current_day}</span>
                            </div>
                            <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '3px', marginTop:'0.5rem' }}>
                                <div style={{ width: `${(chal.current_day / 30) * 100}%`, background: currentTheme.primary, height: '100%', borderRadius: '3px' }}></div>
                            </div>
                        </Card>
                    ))}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '2rem 0 1rem' }}>Rekomendasi</h3>
                <div style={{display:'flex', overflowX:'auto', gap:'1rem', paddingBottom:'1rem'}}>
                    {overview?.recommendations?.map(rec => (
                        <div key={rec.id} style={{minWidth:'200px', background:'white', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1rem'}}>
                            <h4 style={{fontWeight:'bold', fontSize:'0.9rem'}}>{rec.title}</h4>
                            <button onClick={()=>initiateJoinChallenge(rec)} style={{width:'100%', marginTop:'0.5rem', padding:'0.5rem', background: currentTheme.primary, color:'white', border:'none', borderRadius:'6px'}}>Ikuti</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'challenge' && renderChallengeTab()}
        
        {activeTab === 'friends' && (
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Teman Sehat</h2>
                <Card style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Kode Referral Kamu</p>
                    <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '1rem' }}>{overview?.user?.referral_code || '...'}</div>
                    <div style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
                        <button onClick={()=>{navigator.clipboard.writeText(overview?.user?.referral_code); alert("Disalin")}} style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'8px 16px', borderRadius:'20px', color:'white', cursor:'pointer', display:'flex', gap:'5px', alignItems:'center'}}><Copy size={16}/> Salin</button>
                        <button onClick={()=>setShowQRModal(true)} style={{background:'white', color:'#4f46e5', border:'none', padding:'8px 16px', borderRadius:'20px', cursor:'pointer', display:'flex', gap:'5px', alignItems:'center'}}><QrCode size={16}/> QR</button>
                    </div>
                </Card>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Tambah Teman</h3>
                <div style={{display:'flex', gap:'0.5rem', marginBottom:'2rem'}}>
                    <input placeholder="Kode Teman" value={friendCode} onChange={e=>setFriendCode(e.target.value)} style={{flex:1, padding:'0.8rem', border:'1px solid #ccc', borderRadius:'8px'}}/>
                    <button onClick={handleAddFriend} style={{background: currentTheme.primary, color:'white', border:'none', padding:'0 1.5rem', borderRadius:'8px', fontWeight:'bold'}}>Add</button>
                </div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Daftar Teman</h3>
                {friendsData.map(f => (
                    <div key={f.id} style={{padding:'1rem', background:'white', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'1rem'}}>
                        <div style={{width:'40px', height:'40px', background:'#f1f5f9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={20}/></div>
                        <div><div style={{fontWeight:'bold'}}>{f.name}</div><div style={{fontSize:'0.8rem', color:'#64748b'}}>{f.badge}</div></div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'shop' && (
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Belanja Sehat</h2>
                <div style={{ display: 'flex', gap:'1rem', marginBottom:'1.5rem' }}>
                    <button onClick={()=>{fetchOrders(); setShowOrderHistory(true)}} style={{flex:1, padding:'0.8rem', border:'1px solid #ccc', borderRadius:'8px', background:'white'}}>Riwayat Pesanan</button>
                    <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{flex:1, padding:'0.8rem', border:'1px solid #ccc', borderRadius:'8px', background:'white'}}>Alamat Saya</button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    {products.map(prod => (
                        <Card key={prod.id} onClick={()=>openCheckout(prod)} style={{background:'white', border:'1px solid #e2e8f0', cursor:'pointer'}}>
                            <div style={{height:'120px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={32} color="#cbd5e1"/>}
                            </div>
                            <div style={{padding:'1rem'}}>
                                <h4 style={{fontWeight:'bold', fontSize:'0.9rem'}}>{prod.name}</h4>
                                <p style={{color: currentTheme.text, fontWeight:'bold', marginTop:'0.5rem'}}>Rp {prod.price.toLocaleString()}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
             <div style={{textAlign:'center', padding:'2rem'}}>
                 <User size={48} style={{margin:'0 auto'}}/>
                 <h3>{overview?.user?.name}</h3>
                 <p>{overview?.user?.phone}</p>
                 <button onClick={logout} style={{marginTop:'2rem', color:'red', border:'1px solid red', padding:'0.5rem 2rem', borderRadius:'8px', background:'white'}}>Logout</button>
             </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', background: 'white',
        borderTop: '1px solid #e2e8f0', padding: '0.8rem 1rem',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50
      }}>
        <NavBtn icon={Home} label="Home" active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} theme={currentTheme} />
        <NavBtn icon={Target} label="Challenge" active={activeTab === 'challenge'} onClick={() => setActiveTab('challenge')} theme={currentTheme} />
        <NavBtn icon={Users} label="Teman" active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} theme={currentTheme} />
        <NavBtn icon={ShoppingBag} label="Shop" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} theme={currentTheme} />
        <NavBtn icon={Settings} label="Akun" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} theme={currentTheme} />
      </div>

      {/* --- ALL MODALS --- */}
      <ResponsiveModal isOpen={showCheckinModal} onClose={() => setShowCheckinModal(false)} title="Laporan Harian">
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>Centang misi yang berhasil kamu lakukan:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {dailyContent?.tasks?.map((task, idx) => (
            <div key={idx} onClick={() => { if(completedTasks.includes(task)) setCompletedTasks(completedTasks.filter(t=>t!==task)); else setCompletedTasks([...completedTasks, task]); }} 
              style={{ padding: '0.8rem', borderRadius: '8px', border: `1px solid ${completedTasks.includes(task) ? currentTheme.primary : '#e2e8f0'}`, background: completedTasks.includes(task) ? currentTheme.light : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${completedTasks.includes(task) ? currentTheme.primary : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: completedTasks.includes(task) ? currentTheme.primary : 'white' }}>
                {completedTasks.includes(task) && <Check size={14} color="white" />}
              </div>
              <span style={{ fontSize: '0.9rem', color: completedTasks.includes(task) ? currentTheme.text : '#334155' }}>{task}</span>
            </div>
          ))}
        </div>
        <textarea placeholder="Gimana perasaanmu hari ini?" value={journalText} onChange={(e) => setJournalText(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', fontSize: '0.9rem', marginBottom: '1.5rem' }} />
        <button onClick={handleCheckinSubmit} style={{ width: '100%', padding: '1rem', background: currentTheme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Kirim Laporan</button>
      </ResponsiveModal>

      <ResponsiveModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} title="Slot Penuh">
         <div style={{textAlign:'center', padding:'1rem'}}><AlertTriangle size={48} color="#f59e0b" style={{margin:'0 auto 1rem auto'}}/><p>Kamu sudah mengikuti 2 challenge. Selesaikan atau pause salah satu untuk memulai yang baru.</p></div>
      </ResponsiveModal>

      <ResponsiveModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} title="Kuis Personalisasi">
         <h4 style={{fontWeight:'bold', marginBottom:'1.5rem'}}>{quizQuestions[currentQuizIdx]?.question_text}</h4>
         <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
             {quizQuestions[currentQuizIdx]?.options.map((opt, idx) => ( <button key={idx} onClick={() => handleQuizAnswer(opt.category)} style={{padding:'1rem', border:'1px solid #e2e8f0', borderRadius:'12px', background:'white', textAlign:'left'}}>{opt.text}</button> ))}
         </div>
      </ResponsiveModal>

      <ResponsiveModal isOpen={showAiSummaryModal} onClose={() => setShowAiSummaryModal(false)} title="Analisa Selesai">
         <div style={{textAlign:'center'}}><Bot size={48} color={currentTheme.text} style={{margin:'0 auto 1rem auto'}}/><h3 style={{fontWeight:'bold', fontSize:'1.2rem'}}>Hasil Personalisasi:</h3><p style={{background:'#eff6ff', padding:'1rem', borderRadius:'12px', margin:'1rem 0', fontStyle:'italic', color:'#1e40af'}}>"{aiSummaryResult}"</p><button onClick={()=>{setShowAiSummaryModal(false); fetchMyChallenges();}} style={{width:'100%', padding:'1rem', background:currentTheme.primary, color:'white', border:'none', borderRadius:'12px', fontWeight:'bold'}}>Mulai Challenge</button></div>
      </ResponsiveModal>

      <ResponsiveModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} title="Checkout">
         {selectedProduct && ( <div> <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem'}}> {selectedProduct.image_url ? <img src={`${BACKEND_URL}${selectedProduct.image_url}`} style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'8px'}}/> : <Package size={40}/>} <div><h4 style={{fontWeight:'bold'}}>{selectedProduct.name}</h4><p>Rp {selectedProduct.price.toLocaleString()}</p></div> </div> <div style={{marginBottom:'1rem'}}> <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.9rem'}}>Alamat Pengiriman</label> <select onChange={e=>setSelectedAddrId(e.target.value)} style={{width:'100%', padding:'0.8rem', border:'1px solid #ccc', borderRadius:'8px'}}> <option>Pilih Alamat...</option> {addresses.map(a=><option key={a.id} value={a.id}>{a.label} - {a.address}</option>)} </select> </div> <button onClick={handleProcessPayment} style={{width:'100%', padding:'1rem', background:currentTheme.primary, color:'white', border:'none', borderRadius:'12px', fontWeight:'bold'}}>Bayar Sekarang</button> </div> )}
      </ResponsiveModal>

      <ResponsiveModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Tambah Alamat">
         <input placeholder="Label" onChange={e=>setNewAddr({...newAddr, label:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/> <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}> <input placeholder="Penerima" onChange={e=>setNewAddr({...newAddr, name:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/> <input placeholder="No HP" onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/> </div> <select onChange={handleProvChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Provinsi</option>{provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select> {newAddr.prov_id && <select onChange={e=>setNewAddr({...newAddr, city_id:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Kota</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>} <textarea placeholder="Alamat Lengkap" onChange={e=>setNewAddr({...newAddr, address:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}></textarea> <button onClick={handleSaveAddress} style={{width:'100%', padding:'0.8rem', background:currentTheme.primary, border:'none', borderRadius:'8px', fontWeight:'bold', color:'white'}}>Simpan</button>
      </ResponsiveModal>

      <ResponsiveModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="Kode QR Saya">
         <div style={{textAlign:'center', padding:'2rem'}}> <QRCodeSVG value={`https://jagatetapsehat.com/invite/${overview?.user?.referral_code}`} size={200} /> <p style={{marginTop:'1rem', fontSize:'0.9rem', color:'#64748b'}}>Scan untuk berteman</p> </div>
      </ResponsiveModal>

      <ResponsiveModal isOpen={showOrderHistory} onClose={() => setShowOrderHistory(false)} title="Riwayat Pesanan">
         {myOrders.length === 0 ? <p style={{color:'#64748b'}}>Belum ada pesanan.</p> : ( <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}> {myOrders.map(order => ( <div key={order.order_id} onClick={()=>{setSelectedInvoice(order); setShowInvoice(true);}} style={{padding:'1rem', border:'1px solid #e2e8f0', borderRadius:'12px', background:'#f8fafc', cursor:'pointer'}}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}> <span style={{fontSize:'0.8rem', fontWeight:'bold', color:currentTheme.text}}>{order.order_id}</span> <span style={{fontSize:'0.75rem', padding:'2px 8px', borderRadius:'10px', background: order.status==='paid'?'#dcfce7':'#fffbeb', color: order.status==='paid'?'#166534':'#d97706'}}>{order.status}</span> </div> <div><div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{order.product_name}</div> <div style={{fontSize:'0.85rem'}}>Rp {order.amount.toLocaleString()}</div> </div> </div> ))} </div> )}
      </ResponsiveModal>

      <ResponsiveModal isOpen={showInvoice && selectedInvoice} onClose={() => setShowInvoice(false)} title="Invoice">
         <div style={{textAlign:'center', marginBottom:'1.5rem', borderBottom:'1px dashed #ccc', paddingBottom:'1rem'}}> <h2 style={{fontWeight:'bold', fontSize:'1.5rem'}}>INVOICE</h2> <p style={{fontSize:'0.9rem', color:'#64748b'}}>VITALYST STORE</p> </div> <div style={{marginBottom:'1.5rem'}}> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> <span style={{color:'#64748b', fontSize:'0.9rem'}}>Order ID</span> <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>{selectedInvoice?.order_id}</span> </div> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> <span style={{color:'#64748b', fontSize:'0.9rem'}}>Status</span> <span style={{fontWeight:'bold', fontSize:'0.9rem', textTransform:'uppercase'}}>{selectedInvoice?.status}</span> </div> </div> <div style={{borderTop:'1px solid #eee', borderBottom:'1px solid #eee', padding:'1rem 0', marginBottom:'1.5rem'}}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}> <span style={{fontSize:'0.9rem'}}>{selectedInvoice?.product_name}</span> <span style={{fontSize:'0.9rem', fontWeight:'bold'}}>Rp {selectedInvoice?.amount.toLocaleString()}</span> </div> </div>
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
