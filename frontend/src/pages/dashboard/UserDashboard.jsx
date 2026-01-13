import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  Home, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, Search, 
  Package, ShoppingBag, ChevronLeft, Lightbulb, Clock, AlertCircle, CheckCircle, Calendar, RefreshCw, FileText,
  Moon, Sun, Shield, Smartphone, Check, Palette, Edit2, Camera,
  Bot, Sparkles, MapPin, Truck, Box, TicketPercent
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- KONFIGURASI TOKO ---
const STORE_LOCATION = { lat: -6.175392, lng: 106.827153 }; // Monas Jakarta
const PRICE_PER_KM = 5000; 

const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#8fec78', light: '#dcfce7', text: '#166534', gradient: 'linear-gradient(135deg, #ffffff 0%, #8fec78 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #14532d 100%)' },
  red: { id: 'red', name: 'Merah Berani', primary: '#fca5a5', light: '#fee2e2', text: '#991b1b', gradient: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' },
  gold: { id: 'gold', name: 'Emas Mewah', primary: '#fcd34d', light: '#fef3c7', text: '#b45309', gradient: 'linear-gradient(135deg, #ffffff 0%, #fcd34d 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #78350f 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#93c5fd', light: '#dbeafe', text: '#1e40af', gradient: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' },
  purple: { id: 'purple', name: 'Ungu Misteri', primary: '#d8b4fe', light: '#f3e8ff', text: '#6b21a8', gradient: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #581c87 100%)' },
};

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate(); 
  const fileInputRef = useRef(null); 
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [myFriends, setMyFriends] = useState([]);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]); 
  
  // --- STATE CHECKOUT & ORDER ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form Checkout
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("pickup"); 
  const [userLocation, setUserLocation] = useState(null); 
  const [shippingCost, setShippingCost] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // {code, amount}
  const [couponError, setCouponError] = useState("");

  const [myOrders, setMyOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // --- STATE LAINNYA ---
  const [dailyData, setDailyData] = useState(null);
  const [journal, setJournal] = useState("");
  const [checkinStatus, setCheckinStatus] = useState(null); 
  const [countdown, setCountdown] = useState(null);
  const [quote, setQuote] = useState("Sehat itu investasi, bukan pengeluaran.");
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); 
  const [snapLoaded, setSnapLoaded] = useState(false); 
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark'); 
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  const currentTheme = THEMES[themeColor] || THEMES['green'];
  const [showQRModal, setShowQRModal] = useState(false); 
  const [friendCode, setFriendCode] = useState(""); 
  const [friendData, setFriendData] = useState(null); 
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); 
  const [installPrompt, setInstallPrompt] = useState(null); 
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]); 
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatSectionRef = useRef(null);

  useEffect(() => {
    const handleResize = () => { setIsDesktop(window.innerWidth > 1024); if(window.innerWidth > 1024) setSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setInstallPrompt(e); });
    if (darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    fetchData(); fetchDailyContent(); fetchArticles(); fetchProducts(); setQuote(getRandomQuote());
    const snapScriptUrl = "https://app.midtrans.com/snap/snap.js"; 
    const clientKey = "Mid-client-dXaTaEerstu_IviP"; 
    const script = document.createElement('script'); script.src = snapScriptUrl; script.setAttribute('data-client-key', clientKey);
    script.onload = () => { console.log("Snap Loaded"); setSnapLoaded(true); }; script.async = true; document.body.appendChild(script);
    return () => { window.removeEventListener('resize', handleResize); if(document.body.contains(script)){ document.body.removeChild(script); } };
  }, []);

  useEffect(() => { if (activeTab === 'friends') fetchFriendsList(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'shop') fetchOrders(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const toggleDarkMode = () => { setDarkMode(!darkMode); localStorage.setItem('theme', !darkMode ? 'dark' : 'light'); if (!darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); };
  const changeThemeColor = (k) => { setThemeColor(k); localStorage.setItem('colorTheme', k); };
  const handleInstallApp = async () => { if (!installPrompt) { alert("Sudah terinstall/buka menu browser."); return; } installPrompt.prompt(); const { outcome } = await installPrompt.userChoice; if (outcome === 'accepted') setInstallPrompt(null); };

  const fetchData = async () => {
    try {
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);
      const tip = generateDailyTip(overviewRes.data.user?.group || 'Sehat');
      setChatHistory([{ role: "system_tip", content: tip }, { role: "assistant", content: "Halo! Saya Dr. Alva AI. Ada keluhan apa hari ini?" }]);
      const challengeRes = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(challengeRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // ... (Fetch Functions sama seperti sebelumnya) ...
  const fetchArticles = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/articles`); setArticles(res.data); } catch (e) {} };
  const fetchDailyContent = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/daily-content`, { headers: getAuthHeader() }); setDailyData(res.data); setCheckinStatus(res.data.today_status || null); } catch (e) {} };
  const fetchFriendsList = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() }); setMyFriends(res.data.friends); } catch (e) {} };
  const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/products`); setProducts(res.data); } catch(e){} };
  const fetchOrders = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() }); setMyOrders(res.data); } catch (e) {} };

  const generateDailyTip = (g) => { const tips = { 'A': "💡 Minum air hangat & serat.", 'B': "💡 Hindari santan & pedas.", 'C': "💡 Makan tepat waktu." }; return tips[g] || "💡 Jaga kesehatan!"; };
  const getRandomQuote = () => "Kesehatan adalah investasi terbaik.";
  const handleRefresh = async () => { setIsRefreshing(true); await Promise.all([fetchData(), fetchDailyContent(), fetchArticles(), fetchProducts()]); setIsRefreshing(false); };
  const handleScrollToChat = () => { setActiveTab('dashboard'); setSidebarOpen(false); setTimeout(() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); };
  const handleSendChat = async (e) => { e.preventDefault(); if(!chatMessage.trim()) return; const msg = chatMessage; setChatHistory(p => [...p, {role:"user", content:msg}]); setChatMessage(""); setChatLoading(true); try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()}); setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]); } catch (e) { setChatHistory(p => [...p, {role:"assistant", content:"Error koneksi."}]); } finally { setChatLoading(false); } };
  const copyReferral = () => { navigator.clipboard.writeText(overview?.user?.referral_code || ""); alert("Disalin!"); };
  const handleSubmitCheckin = async (status) => { if(isSubmitting) return; setIsSubmitting(true); try { await axios.post(`${BACKEND_URL}/api/checkin`, {journal, status}, {headers:getAuthHeader()}); setCheckinStatus(status); if(status==='completed') { alert("Selesai!"); fetchData(); } } catch(e){alert("Gagal.");} finally {setIsSubmitting(false);} };
  
  // --- FUNGSI LOKASI & JARAK ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; 
  };

  const handleGetLocation = () => {
      if (!navigator.geolocation) { alert("Browser tidak support GPS."); return; }
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              setIsGettingLocation(false);
              setShippingAddress(`Lokasi Terdeteksi: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Otomatis)`);
              const dist = calculateDistance(latitude, longitude, STORE_LOCATION.lat, STORE_LOCATION.lng);
              if (shippingMethod === 'jne') {
                  let cost = 10000;
                  if (dist > 10) cost += (dist - 10) * PRICE_PER_KM;
                  setShippingCost(Math.ceil(cost / 1000) * 1000); 
              }
          },
          () => { alert("Gagal mengambil lokasi."); setIsGettingLocation(false); }
      );
  };

  const openCheckout = (product) => {
      setSelectedProduct(product);
      setShippingCost(0);
      setShippingMethod('pickup');
      // [FIX] Auto-Fill dari data User yang sudah di-fetch
      setRecipientName(overview?.user?.name || "");
      setRecipientPhone(overview?.user?.phone || "");
      setShippingAddress(overview?.user?.address || ""); // Alamat otomatis terisi
      setAppliedCoupon(null);
      setCouponCode("");
      setShowCheckoutModal(true);
  };

  const checkCoupon = () => {
      setCouponError("");
      if (!couponCode) return;
      if (couponCode.toUpperCase() === 'HEMAT10') {
          setAppliedCoupon({ code: 'HEMAT10', amount: 10000 });
      } else if (couponCode.toUpperCase() === 'VITALYST') {
          setAppliedCoupon({ code: 'VITALYST', amount: selectedProduct.price * 0.1 });
      } else {
          setCouponError("Kode kupon tidak valid.");
          setAppliedCoupon(null);
      }
  };

  const handleProcessPayment = async () => {
      if (!snapLoaded) { alert("Sistem pembayaran belum siap."); return; }
      if (shippingMethod === 'jne' && !shippingAddress) { alert("Mohon isi alamat pengiriman."); return; }

      try {
          const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
              amount: selectedProduct.price,
              item_name: selectedProduct.name,
              shipping_name: recipientName,
              shipping_phone: recipientPhone,
              shipping_address: shippingAddress,
              shipping_method: shippingMethod,
              shipping_cost: shippingCost,
              latitude: userLocation?.lat,
              longitude: userLocation?.lng,
              coupon_code: appliedCoupon?.code || "" 
          }, { headers: getAuthHeader() });
  
          if (response.data.success) {
              setShowCheckoutModal(false);
              // Update state overview agar alamat tersimpan terlihat langsung tanpa refresh
              setOverview(prev => ({
                  ...prev,
                  user: { ...prev.user, address: shippingAddress, phone: recipientPhone }
              }));
              window.snap.pay(response.data.token, {
                  onSuccess: function(result) { alert("Pembayaran Berhasil!"); fetchOrders(); },
                  onPending: function(result) { alert("Menunggu pembayaran!"); fetchOrders(); },
                  onError: function(result) { alert("Pembayaran gagal!"); }
              });
          }
      } catch (error) { alert("Gagal memproses transaksi."); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' }}>
      
      {/* STYLE SAMA SEPERTI SEBELUMNYA */}
      <style>{`
        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; --theme-gradient: ${currentTheme.gradient}; --theme-light: ${currentTheme.light}; }
        .dark { --theme-gradient: ${currentTheme.darkGradient}; }
        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; }
        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 600; }
        .scroll-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* SIDEBAR & HEADER SAMA (SAYA SINGKAT) */}
      <aside style={{ width: '260px', background: darkMode ? '#1e293b' : 'white', borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', height: '100vh', position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.text }}>VITALYST</h2>
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={() => setActiveTab('dashboard')}><Home size={20}/> Dashboard</button></li>
            <li><button className={`nav-item ${activeTab==='checkin'?'active':''}`} onClick={() => setActiveTab('checkin')}><Calendar size={20}/> Riwayat Check-in</button></li>
            <li><button className={`nav-item ${activeTab==='shop'?'active':''}`} onClick={() => setActiveTab('shop')}><ShoppingBag size={20}/> Produk & Toko</button></li>
            <li><button className="nav-item" onClick={handleScrollToChat}><Bot size={20}/> Dr. Alva AI</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={() => setActiveTab('settings')}><Settings size={20}/> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}><button onClick={logout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} /> Keluar</button></div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {!isDesktop && <header style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display:'flex', justifyContent:'space-between' }}><button onClick={()=>setSidebarOpen(true)}><Home/></button><span>VITALYST</span></header>}
        
        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1 }}>
          
          {/* CONTENT DASHBOARD/CHECKIN/SETTINGS SAMA... */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '1.5rem', marginTop: isDesktop ? 0 : '0.5rem' }}>
                <p className="body-medium" style={{ color: '#64748b' }}>Halo, <strong>{overview?.user?.name}</strong>! Semangat hari ke-{overview?.user?.challenge_day || 1}.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
                
                {/* KOLOM KIRI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* Profil Card */}
                  <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* FOTO PROFIL */}
                      <div style={{ position: 'relative' }}>
                          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid white' }}>
                              {overview?.user?.profile_picture ? (
                                  <img src={`${BACKEND_URL}${overview.user.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <User size={35} color={currentTheme.text} />
                              )}
                          </div>
                          <button onClick={() => setActiveTab('settings')} style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'white', borderRadius: '50%', padding: '4px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                              <Edit2 size={12} color="#475569" />
                          </button>
                      </div>

                      <div>
                        <h2 className="heading-2" style={{ marginBottom: '0.3rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{overview?.user?.name}</h2>
                        <div className="gold-badge"><Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tantangan Aktif */}
                  <Card style={{ background: darkMode ? '#1e293b' : '#fff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div><h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: currentTheme.text, display:'flex', alignItems:'center', gap:'0.5rem' }}><Activity size={18} /> Tantangan Aktif</h3></div>
                          <button onClick={() => setShowAllChallenges(true)} style={{ background: 'none', border: 'none', color: currentTheme.text, fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Lihat Semua <ChevronRight size={14} /></button>
                        </div>
                        <div style={{ background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', padding: '1rem', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                          <div style={{ marginBottom: '0.75rem' }}>
                              <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', color: darkMode ? 'white' : '#0f172a' }}>{challenges.find(c => c.id === overview?.user?.challenge_id)?.title || "Belum Ada Challenge"}</h4>
                              <span style={{ fontSize: '0.75rem', background: currentTheme.light, color: currentTheme.text, padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Tipe {overview?.user?.group || 'Umum'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                              <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}><span>Progress</span><span>{Math.round(Math.min(((overview?.financial?.total_checkins || 0) / 30) * 100, 100))}%</span></div>
                                  <div style={{ height: '6px', background: darkMode ? '#475569' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${Math.min(((overview?.financial?.total_checkins || 0) / 30) * 100, 100)}%`, height: '100%', background: currentTheme.primary, borderRadius: '4px' }}></div></div>
                              </div>
                          </div>
                        </div>
                    </CardContent>
                  </Card>

                  {/* Check-in */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader style={{paddingBottom:'0.5rem'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <CardTitle className="heading-3" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize: '1.1rem', color: darkMode ? 'white' : 'black'}}>
                          <Activity size={20} color={currentTheme.text}/> Misi Hari Ini
                        </CardTitle>
                        {checkinStatus === 'completed' && <span style={{fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold'}}><CheckCircle size={12}/> Selesai</span>}
                        {checkinStatus === 'pending' && <span style={{fontSize: '0.75rem', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold'}}><Clock size={12}/> Pending</span>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dailyData && (
                        <div style={{ background: darkMode ? '#334155' : '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${currentTheme.text}`, marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: currentTheme.text, marginBottom: '0.2rem' }}>Info Sehat:</h4>
                          <p style={{ fontSize: '0.9rem', color: darkMode ? '#e2e8f0' : '#334155' }}>{dailyData.fact || dailyData.message}</p>
                        </div>
                      )}
                      {(checkinStatus === 'completed' || checkinStatus === 'skipped') ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', background: checkinStatus === 'completed' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px' }}>
                           <h3 style={{fontWeight:'bold', color: checkinStatus === 'completed' ? '#166534' : '#991b1b'}}>Misi Selesai!</h3>
                        </div>
                      ) : (
                        <div>
                           {dailyData?.tasks?.map((task, idx) => (
                             <div key={idx} style={{ padding: '0.8rem', background: darkMode ? '#334155' : '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'center', color: darkMode ? 'white' : 'black' }}>
                               <div style={{width:'8px', height:'8px', borderRadius:'50%', background: currentTheme.primary}}></div>
                               {task}
                             </div>
                           ))}
                           <textarea value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="Tulis jurnal..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop:'1rem', background: darkMode ? '#1e293b' : 'white', color: darkMode ? 'white' : 'black' }}></textarea>
                           
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                              <button onClick={() => handleSubmitCheckin('pending')} disabled={isSubmitting} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Nanti Saja</button>
                              <button onClick={() => handleSubmitCheckin('completed')} disabled={isSubmitting} style={{ background: currentTheme.primary, color: 'black', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Selesai</button>
                           </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* KOLOM KANAN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* CHAT DOKTER AI (UPDATED) */}
                  <Card ref={chatSectionRef} style={{ background: darkMode ? '#1e293b' : 'white', height: '450px', display:'flex', flexDirection:'column' }}>
                      <div style={{ padding: '1rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem', background: darkMode ? '#1e293b' : '#f8fafc' }}>
                        {/* Icon AI Baru */}
                        <div style={{ width: '45px', height: '45px', background: currentTheme.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
                            <Bot size={24} color={currentTheme.text} />
                        </div>
                        <div>
                            {/* Nama Baru + Icon Sparkles */}
                            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: darkMode ? 'white' : '#0f172a', marginBottom:'2px', display:'flex', alignItems:'center', gap:'6px' }}>
                                Dr. Alva AI <Sparkles size={16} fill={currentTheme.primary} color={currentTheme.text}/>
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Tanyakan apa saja kepada Dr. Alva</p>
                        </div>
                      </div>

                      <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                          {chatHistory.map((msg, i) => (
                            <div key={i} style={{ 
                              padding:'0.6rem 1rem', 
                              background: msg.role==='user' ? currentTheme.light : (darkMode?'#334155':'#f1f5f9'), 
                              borderRadius:'12px', 
                              borderBottomRightRadius: msg.role==='user' ? '2px' : '12px',
                              borderTopLeftRadius: msg.role==='assistant' ? '2px' : '12px',
                              marginBottom:'0.8rem', 
                              maxWidth:'85%',
                              alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start',
                              marginLeft: msg.role==='user' ? 'auto' : '0',
                              color: msg.role==='user' ? '#1e3a8a' : (darkMode?'#e2e8f0':'#334155'),
                              fontSize: '0.9rem',
                              lineHeight: '1.5'
                            }}>
                              {msg.content}
                            </div>
                          ))}
                          {chatLoading && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginLeft:'0.5rem' }}>Dr. Alva sedang mengetik...</div>}
                          <div ref={chatEndRef}></div>
                      </div>
                      <form onSubmit={handleSendChat} style={{padding:'1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display:'flex', gap:'0.5rem'}}>
                         <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'0.7rem', borderRadius:'20px', border:'1px solid #ccc', color:'black', outline:'none', fontSize:'0.9rem'}} placeholder="Tanya keluhan..." />
                         <button style={{background: currentTheme.primary, border:'none', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><Send size={18}/></button>
                      </form>
                  </Card>

                  {/* ARTIKEL KESEHATAN */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'transparent', border:'none', boxShadow:'none' }}>
                      <h3 style={{marginBottom:'1rem', fontWeight:'bold'}}>Artikel Kesehatan</h3>
                      {articles.map(article => (
                          <div key={article.id} onClick={() => handleArticleClick(article.id)} style={{ display:'flex', gap:'1rem', padding:'1rem', background: darkMode ? '#334155' : 'white', borderRadius:'12px', marginBottom:'0.8rem', cursor:'pointer', border: darkMode ? 'none' : '1px solid #e2e8f0', alignItems:'center' }}>
                              <div style={{width:'50px', height:'50px', background: currentTheme.light, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                  <FileText size={24} color={currentTheme.text}/>
                              </div>
                              <div style={{flex:1}}>
                                 <h4 style={{fontWeight:'bold', fontSize:'0.9rem', color: darkMode ? 'white' : '#1e293b', marginBottom:'0.2rem', lineHeight:'1.3'}}>{article.title}</h4>
                                 <p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', display:'flex', alignItems:'center', gap:'4px' }}>
                                    <Clock size={12}/> {article.reading_time || "3 min"} baca
                                 </p>
                              </div>
                              <ChevronRight size={18} color="#94a3b8"/>
                          </div>
                      ))}
                  </Card>

                  {/* REKOMENDASI CHALLENGE */}
                  <div>
                    <h3 className="heading-3" style={{marginBottom:'0.8rem', fontSize:'1rem'}}>Rekomendasi Challenge</h3>
                    <div className="scroll-hide" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%' }}>
                      {challenges.map((ch) => (
                        <div key={ch.id} style={{ minWidth: '200px', maxWidth: '200px', background: darkMode ? '#334155' : 'white', border: darkMode ? 'none' : '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display:'flex', flexDirection:'column', justifyContent:'space-between', flexShrink: 0 }}>
                          <div>
                            <div style={{width:'36px', height:'36px', background: currentTheme.light, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.5rem'}}>
                                <Activity size={18} color={currentTheme.text}/>
                            </div>
                            <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: darkMode ? 'white' : '#0f172a', marginBottom:'0.3rem' }}>{ch.title}</h4>
                            <p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ch.description}</p>
                          </div>
                          <button onClick={() => handleSwitchChallenge(ch.id)} style={{ marginTop: '0.8rem', width: '100%', padding: '0.4rem', border: `1px solid ${currentTheme.text}`, background: 'transparent', color: currentTheme.text, borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Detail</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QUOTE & REFRESH */}
                  <div style={{ paddingBottom: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ fontStyle: 'italic', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem', marginBottom: '1rem', padding: '0 1rem' }}>
                        "{quote}"
                    </p>
                    <button onClick={handleRefresh} disabled={isRefreshing} style={{ background: 'transparent', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 auto', cursor: 'pointer' }}>
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> {isRefreshing ? "Memuat ulang..." : "Refresh Halaman"}
                    </button>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* FITUR TOKO */}
          {activeTab === 'shop' && (
             <div>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                       <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button>
                       <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Toko Vitalyst</h1>
                   </div>
                   <button onClick={() => setShowOrderHistory(true)} style={{ background: currentTheme.light, color: currentTheme.text, border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight:'bold', display:'flex', gap:'0.5rem', alignItems:'center', cursor:'pointer' }}>
                       <Truck size={18}/> Status Pesanan
                   </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                   {products.map((prod) => (
                      <Card key={prod.id} style={{ background: darkMode ? '#1e293b' : 'white', border: '1px solid #e2e8f0' }}>
                         <div style={{ height: '180px', background: darkMode ? '#334155' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0', overflow:'hidden' }}>
                            {prod.image_url ? (
                                <img src={`${BACKEND_URL}${prod.image_url}`} alt={prod.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <Package size={64} color="#94a3b8"/>
                            )}
                         </div>
                         <CardContent style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', color: darkMode ? 'white' : 'black' }}>{prod.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', minHeight: '40px' }}>{prod.description}</p>
                            
                            {/* DUMMY SOLD COUNT */}
                            <div style={{fontSize:'0.75rem', color:'#64748b', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                                <CheckCircle size={12} color="#16a34a"/> Terjual: <b>{prod.fake_sales || 0} pcs</b>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.1rem' }}>Rp {prod.price.toLocaleString()}</span>
                               <button 
                                  onClick={() => openCheckout(prod)} 
                                  style={{ background: '#ee4d2d', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border:'none', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                               >
                                  <ShoppingBag size={16}/> Beli Sekarang
                               </button>
                            </div>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </div>
          )}

          {/* SETTINGS PAGE */}
          {activeTab === 'settings' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button>
                  <h1 className="heading-2">Pengaturan</h1>
               </div>
               
               <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* CARD PROFILE PICTURE UPDATE */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Foto Profil</CardTitle></CardHeader>
                    <CardContent>
                       <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
                           <div style={{ position: 'relative', width:'80px', height:'80px' }}>
                              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                                 {overview?.user?.profile_picture ? (
                                    <img src={`${BACKEND_URL}${overview.user.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 ) : (
                                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={40} color="#94a3b8"/></div>
                                 )}
                              </div>
                              {/* INPUT FILE HIDDEN */}
                              <input 
                                 type="file" 
                                 ref={fileInputRef} 
                                 style={{ display: 'none' }} 
                                 accept="image/*" 
                                 onChange={handleProfilePictureUpload} 
                              />
                           </div>
                           <div>
                              <button onClick={triggerFileInput} disabled={uploadingImage} style={{ background: currentTheme.primary, color:'black', border:'none', padding:'0.6rem 1rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                  {uploadingImage ? <RefreshCw className="animate-spin" size={16}/> : <Camera size={16}/>}
                                  {uploadingImage ? "Mengupload..." : "Ganti Foto"}
                              </button>
                              <p style={{fontSize:'0.75rem', color:'#64748b', marginTop:'0.5rem'}}>Max 2MB (JPG/PNG)</p>
                           </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* UBAH TEMA */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Ubah Tema Aplikasi</CardTitle></CardHeader>
                    <CardContent>
                       <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                          {Object.values(THEMES).map((theme) => (
                             <div key={theme.id} onClick={() => changeThemeColor(theme.id)} style={{ cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
                                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: theme.gradient, border: themeColor === theme.id ? `3px solid ${darkMode?'white':'#1e293b'}` : '1px solid #ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                   {themeColor === theme.id && <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><Check size={20} color="white" style={{dropShadow:'0 1px 2px rgba(0,0,0,0.5)'}}/></div>}
                                </div>
                                <span style={{fontSize:'0.75rem', fontWeight: themeColor === theme.id ? 'bold' : 'normal'}}>{theme.name}</span>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                  </Card>

                  {/* AKUN & REFERRAL */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Info Akun</CardTitle></CardHeader>
                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                           <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Nomor WhatsApp</label>
                           <input type="text" value={overview?.user?.phone || ""} disabled style={{ width:'100%', padding: '0.8rem', background: darkMode ? '#334155' : '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: darkMode?'white':'black' }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Kode Referral Saya</label>
                           <div style={{ display:'flex', gap:'0.5rem' }}>
                              <input type="text" value={overview?.user?.referral_code || ""} disabled style={{ flex:1, padding: '0.8rem', background: darkMode ? '#334155' : '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight:'bold', letterSpacing:'1px', color: darkMode?'white':'black' }} />
                              <button onClick={copyReferral} style={{ background: currentTheme.primary, color:'black', border:'none', borderRadius:'6px', padding:'0 1rem', cursor:'pointer' }}><Copy size={18}/></button>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* TAMPILAN & APLIKASI */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader><CardTitle className="heading-3">Lainnya</CardTitle></CardHeader>
                    <CardContent>
                       <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                          <button onClick={toggleDarkMode} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'1rem', background: darkMode ? '#334155' : '#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black' }}>
                             <div style={{display:'flex', alignItems:'center', gap:'0.8rem'}}><div style={{background: darkMode?'#1e293b':'white', padding:'8px', borderRadius:'50%'}}>{darkMode ? <Moon size={20} color="#fbbf24"/> : <Sun size={20} color="#f59e0b"/>}</div> <span style={{fontWeight:'bold'}}>Mode Gelap</span></div>
                             <div style={{ width:'40px', height:'20px', background: darkMode ? currentTheme.primary : '#cbd5e1', borderRadius:'20px', position:'relative', transition:'background 0.3s' }}>
                                <div style={{ width:'16px', height:'16px', background:'white', borderRadius:'50%', position:'absolute', top:'2px', left: darkMode ? '22px' : '2px', transition:'left 0.3s' }}></div>
                             </div>
                          </button>
                          <button onClick={handleInstallApp} style={{ display:'flex', alignItems:'center', gap:'0.8rem', width:'100%', padding:'1rem', background: darkMode ? '#334155' : '#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black', textAlign:'left' }}>
                             <div style={{background: darkMode?'#1e293b':'white', padding:'8px', borderRadius:'50%'}}><Smartphone size={20} color={currentTheme.text}/></div>
                             <div><div style={{fontWeight:'bold'}}>Install Aplikasi</div><div style={{fontSize:'0.75rem', color:'#64748b'}}>Tambahkan ke Layar Utama</div></div>
                          </button>
                          <button onClick={() => setShowPrivacyModal(true)} style={{ display:'flex', alignItems:'center', gap:'0.8rem', width:'100%', padding:'1rem', background: darkMode ? '#334155' : '#f8fafc', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black', textAlign:'left' }}>
                             <div style={{background: darkMode?'#1e293b':'white', padding:'8px', borderRadius:'50%'}}><Shield size={20} color="#ef4444"/></div>
                             <div><div style={{fontWeight:'bold'}}>Kebijakan Privasi</div><div style={{fontSize:'0.75rem', color:'#64748b'}}>Ketentuan penggunaan data</div></div>
                          </button>
                       </div>
                    </CardContent>
                  </Card>

                  <button onClick={logout} style={{ width: '100%', padding: '1rem', border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                     <LogOut size={20}/> Keluar dari Aplikasi
                  </button>
               </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL CHECKOUT */}
      {showCheckoutModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight:'90vh', overflowY:'auto' }}>
                <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1.5rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem' }}>Checkout Pesanan</h3>
                
                <div style={{marginBottom:'1rem'}}>
                    <h4 style={{fontWeight:'bold', marginBottom:'0.2rem'}}>{selectedProduct.name}</h4>
                    <p style={{color:'#64748b'}}>Harga Satuan: Rp {selectedProduct.price.toLocaleString()}</p>
                </div>

                <div style={{marginBottom:'1rem'}}>
                    <label style={{display:'block', marginBottom:'0.3rem', fontWeight:'bold', fontSize:'0.9rem'}}>Data Penerima</label>
                    <input value={recipientName} onChange={(e)=>setRecipientName(e.target.value)} placeholder="Nama Penerima" style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', borderRadius:'6px', border:'1px solid #ccc'}} />
                    <input value={recipientPhone} onChange={(e)=>setRecipientPhone(e.target.value)} placeholder="Nomor HP" style={{width:'100%', padding:'0.6rem', borderRadius:'6px', border:'1px solid #ccc'}} />
                </div>

                <div style={{marginBottom:'1rem'}}>
                    <label style={{display:'block', marginBottom:'0.3rem', fontWeight:'bold', fontSize:'0.9rem'}}>Metode Pengiriman</label>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                        <button onClick={()=>{setShippingMethod('pickup'); setShippingCost(0);}} style={{padding:'0.6rem', border: shippingMethod==='pickup'?`2px solid ${currentTheme.primary}`:'1px solid #ccc', background: shippingMethod==='pickup'?currentTheme.light:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Ambil di Toko</button>
                        <button onClick={()=>{setShippingMethod('jne');}} style={{padding:'0.6rem', border: shippingMethod==='jne'?`2px solid ${currentTheme.primary}`:'1px solid #ccc', background: shippingMethod==='jne'?currentTheme.light:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>JNE (Kirim)</button>
                    </div>
                </div>

                {shippingMethod === 'jne' && (
                    <div style={{marginBottom:'1rem', background:'#f8fafc', padding:'1rem', borderRadius:'8px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                            <label style={{fontWeight:'bold', fontSize:'0.9rem'}}>Alamat Pengiriman</label>
                            <button onClick={handleGetLocation} disabled={isGettingLocation} style={{background: currentTheme.primary, border:'none', padding:'0.4rem 0.8rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'bold', display:'flex', gap:'0.3rem', alignItems:'center', cursor:'pointer'}}>
                                {isGettingLocation ? "Mencari..." : <><MapPin size={12}/> Tag Lokasi</>}
                            </button>
                        </div>
                        <textarea 
                            value={shippingAddress} 
                            onChange={(e)=>setShippingAddress(e.target.value)} 
                            placeholder="Alamat lengkap..." 
                            rows={2} 
                            style={{width:'100%', padding:'0.6rem', borderRadius:'6px', border:'1px solid #ccc', fontSize:'0.9rem'}}
                        ></textarea>
                    </div>
                )}

                <div style={{marginBottom:'1.5rem'}}>
                    <label style={{display:'block', marginBottom:'0.3rem', fontWeight:'bold', fontSize:'0.9rem'}}>Kode Kupon</label>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                        <input value={couponCode} onChange={(e)=>setCouponCode(e.target.value)} placeholder="Contoh: HEMAT10" style={{flex:1, padding:'0.6rem', borderRadius:'6px', border:'1px solid #ccc'}} />
                        <button onClick={checkCoupon} style={{background:'#0f172a', color:'white', border:'none', padding:'0 1rem', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>Cek</button>
                    </div>
                    {couponError && <p style={{fontSize:'0.8rem', color:'red', marginTop:'0.2rem'}}>{couponError}</p>}
                    {appliedCoupon && <p style={{fontSize:'0.8rem', color:'green', marginTop:'0.2rem'}}>Diskon Rp {appliedCoupon.amount.toLocaleString()} diterapkan!</p>}
                </div>

                <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Subtotal</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Ongkos Kirim</span><span>Rp {shippingCost.toLocaleString()}</span></div>
                    {appliedCoupon && <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem', color:'green'}}><span>Diskon Kupon</span><span>- Rp {appliedCoupon.amount.toLocaleString()}</span></div>}
                    <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.2rem', marginTop:'0.5rem'}}><span>Total Bayar</span><span>Rp {(selectedProduct.price + shippingCost - (appliedCoupon?.amount || 0)).toLocaleString()}</span></div>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Batal</button>
                    <button onClick={handleProcessPayment} style={{padding:'0.8rem', border:'none', background:'#ee4d2d', color:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Bayar Sekarang</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL RIWAYAT PESANAN */}
      {showOrderHistory && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight:'80vh', overflowY:'auto' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                    <h3 style={{ fontSize:'1.4rem', fontWeight:'bold' }}>Status Pesanan</h3>
                    <button onClick={()=>setShowOrderHistory(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                </div>
                {myOrders.length === 0 ? <p style={{color:'#64748b', textAlign:'center'}}>Belum ada pesanan.</p> : (
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        {myOrders.map((order, idx) => (
                            <div key={idx} style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1rem', display:'flex', gap:'1rem', alignItems:'center'}}>
                                <div style={{width:'60px', height:'60px', background:'#f1f5f9', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}><Box size={24} color="#64748b"/></div>
                                <div style={{flex:1}}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}><h4 style={{fontWeight:'bold', fontSize:'0.95rem'}}>{order.product_name}</h4><span style={{fontSize:'0.75rem', fontWeight:'bold', padding:'2px 8px', borderRadius:'12px', background: order.status==='paid'?'#dcfce7': order.status==='shipped'?'#dbeafe':'#fff7ed', color: order.status==='paid'?'#166534': order.status==='shipped'?'#1e40af':'#9a3412'}}>{order.status === 'pending' ? 'Menunggu Bayar' : order.status === 'paid' ? 'Dikemas' : order.status === 'shipped' ? 'Dikirim' : order.status}</span></div>
                                    <p style={{fontSize:'0.8rem', color:'#64748b'}}>Total: Rp {order.amount.toLocaleString()} • {order.shipping_method.toUpperCase()}</p>
                                    {order.resi && <p style={{fontSize:'0.8rem', color:'#1e40af', marginTop:'0.2rem'}}>Resi: {order.resi}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
      )}

      {/* MODAL PRIVASI */}
      {showPrivacyModal && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: darkMode ? '#1e293b' : 'white', color: darkMode ? 'white' : 'black', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight:'80vh', overflowY:'auto' }}>
               <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Shield size={24}/> Kebijakan Privasi</h3>
               <div style={{ fontSize:'0.9rem', lineHeight:'1.6', marginBottom:'1.5rem', color: darkMode ? '#cbd5e1' : '#334155' }}>
                  <p><strong>1. Pengumpulan Data:</strong> Kami mengumpulkan data nama, nomor WhatsApp, dan log aktivitas kesehatan Anda untuk keperluan monitoring program Vitalyst.</p>
                  <p><strong>2. Penggunaan Data:</strong> Data Anda digunakan untuk memberikan rekomendasi kesehatan yang personal oleh AI dan tim ahli kami.</p>
                  <p><strong>3. Keamanan:</strong> Kami tidak membagikan data pribadi Anda kepada pihak ketiga tanpa izin, kecuali untuk keperluan pengiriman produk (ekspedisi).</p>
                  <p><strong>4. Hak Pengguna:</strong> Anda berhak meminta penghapusan akun sewaktu-waktu melalui Admin.</p>
               </div>
               <button onClick={() => setShowPrivacyModal(false)} style={{ width:'100%', padding:'0.8rem', background: currentTheme.primary, color:'black', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>Saya Mengerti</button>
            </div>
         </div>
      )}

      {/* MODAL QR */}
      {showQRModal && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowQRModal(false)}><div style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%' }} onClick={e => e.stopPropagation()}><h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Kode Pertemanan</h3><div style={{ marginBottom: '1.5rem' }}><div style={{ background: 'white', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}><QRCodeSVG value={`https://jagatetapsehat.com/friend/${overview?.user?.referral_code}`} size={160} /></div></div><button onClick={() => setShowQRModal(false)} style={{ marginTop: '1rem', width: '100%', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px' }}>Tutup</button></div></div>)}
      
      {/* MODAL PROFIL TEMAN (SUDAH DIPERBAIKI) */}
      {showFriendProfile && friendData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }} onClick={() => setShowFriendProfile(false)}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: '350px', width: '90%', overflow: 'hidden', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <div style={{ background: `linear-gradient(135deg, ${currentTheme.light} 0%, ${currentTheme.primary} 100%)`, padding: '2rem 1rem', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', border: '2px solid white' }}>
                        {friendData.profile_picture ? (
                           <img src={`${BACKEND_URL}${friendData.profile_picture}`} alt={friendData.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        ) : (
                           <User size={40} color={currentTheme.text} />
                        )}
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.2rem' }}>{friendData.name}</h2>
                    <div className="gold-badge" style={{ display: 'inline-flex', marginTop: '0.5rem' }}><Medal size={14}/> {friendData.badge}</div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Sedang Mengikuti:</h4>
                        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1rem' }}>{friendData.challenge_title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Tipe {friendData.group || 'Umum'} • Hari ke-{friendData.challenge_day}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '0.8rem', background: '#f0fdf4', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#166534' }}>{friendData.total_checkins}</div>
                            <div style={{ fontSize: '0.7rem', color: '#166534' }}>Check-in</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.8rem', background: '#fff7ed', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ea580c' }}>{friendData.challenge_day}</div>
                            <div style={{ fontSize: '0.7rem', color: '#ea580c' }}>Hari Jalan</div>
                        </div>
                    </div>
                    <button onClick={() => setShowFriendProfile(false)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Tutup</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
