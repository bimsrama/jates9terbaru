import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X,
  Home, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, Search,
  Package, ShoppingBag, ChevronLeft, Lightbulb, Clock, AlertCircle, CheckCircle, Calendar, RefreshCw, FileText,
  Moon, Sun, Shield, Smartphone, Check, Palette, Edit2, Camera,
  Bot, Sparkles, MapPin, Truck, Box, TicketPercent, AlertTriangle, Plus, Map, CreditCard, Heart
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
  
  // --- STATE TOKO & ALAMAT ---
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  
  const [newAddr, setNewAddr] = useState({
      label:'Rumah', name:'', phone:'',
      prov_id:'', prov_name:'',
      city_id:'', city_name:'',
      dis_id:'', dis_name:'',
      subdis_id:'', subdis_name:'',
      address:'', zip:''
  });

  // --- STATE CHECKOUT & ORDER ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("pickup");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [myOrders, setMyOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // --- STATE HISTORY CHECKIN (CALENDAR) ---
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // --- STATE LAINNYA ---
  const [dailyData, setDailyData] = useState(null);
  const [journal, setJournal] = useState("");
  const [checkinStatus, setCheckinStatus] = useState(null);
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
  
  // State Modal Lain
  const [showQRModal, setShowQRModal] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [friendData, setFriendData] = useState(null);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  
  // Chat AI
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
    
    // Load Provinces
    axios.get(`${BACKEND_URL}/api/location/provinces`).then(res => setProvinces(res.data));

    const snapScriptUrl = "https://app.midtrans.com/snap/snap.js";
    const clientKey = "Mid-client-dXaTaEerstu_IviP";
    const script = document.createElement('script'); script.src = snapScriptUrl; script.setAttribute('data-client-key', clientKey);
    script.onload = () => { console.log("Snap Loaded"); setSnapLoaded(true); }; script.async = true; document.body.appendChild(script);
    return () => { window.removeEventListener('resize', handleResize); if(document.body.contains(script)){ document.body.removeChild(script); } };
  }, []);

  useEffect(() => { if (activeTab === 'friends') fetchFriendsList(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'shop') fetchOrders(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'checkin') fetchCheckinHistory(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const toggleDarkMode = () => { setDarkMode(!darkMode); localStorage.setItem('theme', !darkMode ? 'dark' : 'light'); if (!darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); };
  const changeThemeColor = (k) => { setThemeColor(k); localStorage.setItem('colorTheme', k); };
  const handleInstallApp = async () => { if (!installPrompt) { alert("Sudah terinstall/buka menu browser."); return; } installPrompt.prompt(); const { outcome } = await installPrompt.userChoice; if (outcome === 'accepted') setInstallPrompt(null); };

  // --- LOCATION HANDLERS ---
  const handleProvChange = (e) => {
      const id = e.target.value;
      const name = e.target.options[e.target.selectedIndex].text;
      setNewAddr({...newAddr, prov_id: id, prov_name: name, city_id:'', dis_id:'', subdis_id:''});
      axios.get(`${BACKEND_URL}/api/location/cities?prov_id=${id}`).then(res => setCities(res.data));
  };
  const handleCityChange = (e) => {
      const id = e.target.value;
      const name = e.target.options[e.target.selectedIndex].text;
      setNewAddr({...newAddr, city_id: id, city_name: name, dis_id:'', subdis_id:''});
      axios.get(`${BACKEND_URL}/api/location/districts?city_id=${id}`).then(res => setDistricts(res.data));
  };
  const handleDistrictChange = (e) => {
      const id = e.target.value;
      const name = e.target.options[e.target.selectedIndex].text;
      setNewAddr({...newAddr, dis_id: id, dis_name: name, subdis_id:''});
      axios.get(`${BACKEND_URL}/api/location/subdistricts?dis_id=${id}`).then(res => setSubdistricts(res.data));
  };
  const handleSubDistrictChange = (e) => {
      const id = e.target.value;
      const name = e.target.options[e.target.selectedIndex].text;
      const zip = subdistricts.find(s => s.id == id)?.zip || '';
      setNewAddr({...newAddr, subdis_id: id, subdis_name: name, zip: zip});
  };

  const fetchAddresses = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); setAddresses(res.data); } catch(e){} };

  const handleSaveAddress = async () => {
      try { await axios.post(`${BACKEND_URL}/api/user/address`, newAddr, { headers: getAuthHeader() }); fetchAddresses(); setShowAddressModal(false); alert("Alamat tersimpan!"); } catch(e){ alert("Gagal simpan alamat"); }
  };

  // --- HELPER TIME GREETING ---
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return "Selamat Pagi";
    if (hours < 15) return "Selamat Siang";
    if (hours < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

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

  const fetchArticles = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/articles`); setArticles(res.data); } catch (e) {} };
  const fetchDailyContent = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/daily-content`, { headers: getAuthHeader() }); setDailyData(res.data); setCheckinStatus(res.data.today_status || null); } catch (e) {} };
  const fetchFriendsList = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() }); setMyFriends(res.data.friends); } catch (e) {} };
  const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/products`); setProducts(res.data); } catch(e){} };
  const fetchOrders = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() }); setMyOrders(res.data); } catch (e) {} };
  const fetchCheckinHistory = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/checkin-history`, { headers: getAuthHeader() }); setCheckinHistory(res.data); } catch(e) {} };

  const generateDailyTip = (g) => { const tips = { 'A': "👋 Minum air hangat & serat.", 'B': "👋 Hindari santan & pedas.", 'C': "👋 Makan tepat waktu." }; return tips[g] || "👋 Jaga kesehatan!"; };
  const getRandomQuote = () => "Kesehatan adalah investasi terbaik.";
  const handleRefresh = async () => { setIsRefreshing(true); await Promise.all([fetchData(), fetchDailyContent(), fetchArticles(), fetchProducts()]); setIsRefreshing(false); };
  const handleScrollToChat = () => { setActiveTab('dashboard'); setSidebarOpen(false); setTimeout(() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); };
  const handleSendChat = async (e) => { e.preventDefault(); if(!chatMessage.trim()) return; const msg = chatMessage; setChatHistory(p => [...p, {role:"user", content:msg}]); setChatMessage(""); setChatLoading(true); try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()}); setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]); } catch (e) { setChatHistory(p => [...p, {role:"assistant", content:"Error koneksi."}]); } finally { setChatLoading(false); } };
  const copyReferral = () => { navigator.clipboard.writeText(overview?.user?.referral_code || ""); alert("Disalin!"); };
  const handleSubmitCheckin = async (status) => { if(isSubmitting) return; setIsSubmitting(true); try { await axios.post(`${BACKEND_URL}/api/checkin`, {journal, status}, {headers:getAuthHeader()}); setCheckinStatus(status); if(status==='completed') { alert("Selesai!"); fetchData(); } } catch(e){alert("Gagal.");} finally {setIsSubmitting(false);} };
  const handleSwitchChallenge = async (id) => { if(window.confirm("Ganti challenge akan mereset progress ke hari 1. Lanjut?")) { try { await axios.post(`${BACKEND_URL}/api/user/select-challenge`, {challenge_id: id}, {headers: getAuthHeader()}); alert("Berhasil ganti challenge!"); handleRefresh(); } catch(e){alert("Gagal.");} } };
  const handleArticleClick = (id) => { alert("Fitur detail artikel segera hadir!"); };
  const handleProfilePictureUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setUploadingImage(true); const formData = new FormData(); formData.append('image', file); try { const res = await axios.post(`${BACKEND_URL}/api/user/upload-profile-picture`, formData, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } }); setOverview(prev => ({ ...prev, user: { ...prev.user, profile_picture: res.data.image_url } })); alert("Foto berhasil diubah!"); } catch (err) { alert("Gagal upload foto."); } finally { setUploadingImage(false); } };
  const triggerFileInput = () => fileInputRef.current.click();

  // --- FRIENDS LOGIC ---
  const handleAddFriend = async () => {
      if(!friendCode) return alert("Masukkan kode teman!");
      alert("Fitur add friend dalam pengembangan backend.");
  };

  const handleShowFriendProfile = (friend) => {
      setFriendData(friend);
      setShowFriendProfile(true);
  };

  // --- CALENDAR LOGIC ---
  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} style={{ height: '40px' }}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const currentDateStr = new Date(year, month, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const log = checkinHistory.find(h => h.date === currentDateStr);
        let statusColor = darkMode ? '#334155' : '#f1f5f9';
        let textColor = darkMode ? '#94a3b8' : '#64748b';

        if (log) {
            if (log.status === 'completed') { statusColor = '#dcfce7'; textColor = '#166534'; }
            else if (log.status === 'skipped') { statusColor = '#fee2e2'; textColor = '#991b1b'; }
        }

        days.push(
            <div key={d} style={{ height: '40px', width:'40px', background: statusColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: textColor, cursor: 'pointer', margin:'0 auto' }}>
                {d}
            </div>
        );
    }
    return days;
  };

  const changeMonth = (offset) => {
      const newDate = new Date(calendarDate.setMonth(calendarDate.getMonth() + offset));
      setCalendarDate(new Date(newDate));
  };

  // --- CHECKOUT LOGIC ---
  const openCheckout = (product) => {
      setSelectedProduct(product);
      setShippingCost(0);
      setSelectedAddrId(null);
      setAppliedCoupon(null);
      setCouponCode("");
      setShowCheckoutModal(true);
  };

  const handleSelectAddrCheckout = async (addrId) => {
      setSelectedAddrId(addrId);
      const addr = addresses.find(a => a.id === Number(addrId));
      if(addr) {
          const res = await axios.post(`${BACKEND_URL}/api/location/rate`, { city_id: addr.city_id }, { headers: getAuthHeader() });
          setShippingCost(res.data.cost);
          setShippingMethod("JNE Regular");
      }
  };

  const checkCoupon = () => {
      setCouponError("");
      if (!couponCode) return;
      if (couponCode.toUpperCase() === 'HEMAT10') setAppliedCoupon({ code: 'HEMAT10', amount: 10000 });
      else if (couponCode.toUpperCase() === 'VITALYST') setAppliedCoupon({ code: 'VITALYST', amount: selectedProduct.price * 0.1 });
      else { setCouponError("Kode kupon tidak valid."); setAppliedCoupon(null); }
  };

  const handleProcessPayment = async () => {
      if (!snapLoaded) { alert("Sistem pembayaran belum siap."); return; }
      if (!selectedAddrId) { alert("Pilih alamat pengiriman."); return; }

      const addr = addresses.find(a => a.id === Number(selectedAddrId));

      try {
          const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
              item_name: selectedProduct.name,
              shipping_cost: shippingCost,
              address_detail: addr,
              coupon: appliedCoupon?.code || "",
              discount: appliedCoupon?.amount || 0
          }, { headers: getAuthHeader() });
   
          if (response.data.success) {
              setShowCheckoutModal(false);
              window.snap.pay(response.data.token, {
                  onSuccess: function(result) { alert("Pembayaran Berhasil!"); fetchOrders(); },
                  onPending: function(result) { alert("Menunggu pembayaran!"); fetchOrders(); },
                  onError: function(result) { alert("Pembayaran gagal!"); }
              });
          }
      } catch (error) { alert("Gagal memproses transaksi."); }
  };

  const handleCancelOrder = async (orderId) => {
      if(!window.confirm("Batalkan pesanan dalam 1x24 jam?")) return;
      try { await axios.post(`${BACKEND_URL}/api/user/order/cancel/${orderId}`, {}, { headers: getAuthHeader() }); alert("Berhasil dibatalkan."); fetchOrders(); } catch(e){ alert("Gagal/Waktu habis."); }
  };

  const badgeStyle = {
      background: 'linear-gradient(45deg, #FFD700, #FDB931)',
      color: '#7B3F00',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      border: '1px solid #FFF'
  };

  // --- CAROUSEL BANNER UI ---
  const ShopBanner = () => (
      <div style={{ marginBottom: '2rem', position:'relative', borderRadius: '16px', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding: '2.5rem 2rem', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Belanja Sehat, Hidup Kuat 🌿</h2>
                  <p style={{ opacity: 0.9 }}>Suplemen herbal terbaik untuk pencernaan Anda.</p>
              </div>
              <div style={{ background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'50%' }}>
                  <ShoppingBag size={48} color="white"/>
              </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'white', borderTop:'1px solid #eee' }}>
              <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}>
                  <MapPin size={18}/> Alamat Saya
              </button>
              <button onClick={()=>setShowOrderHistory(true)} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}>
                  <Truck size={18}/> Status Pesanan
              </button>
          </div>
      </div>
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;

  return (
    <div style={{ display: 'flex', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' }}>
      
      <style>{`
        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; --theme-gradient: ${currentTheme.gradient}; --theme-light: ${currentTheme.light}; }
        .dark { --theme-gradient: ${currentTheme.darkGradient}; }
        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; }
        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 600; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; alignItems: center; justifyContent: center; z-index: 99999; }
        .modal-content { background: white; padding: 2rem; borderRadius: 16px; maxWidth: 500px; width: 90%; maxHeight: 90vh; overflow-y: auto; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: darkMode ? '#1e293b' : 'white', borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', height: '100vh', position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.text }}>VITALYST</h2>
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={() => setActiveTab('dashboard')}><Home size={20}/> Dashboard</button></li>
            <li><button className={`nav-item ${activeTab==='checkin'?'active':''}`} onClick={() => setActiveTab('checkin')}><Calendar size={20}/> Riwayat Check-in</button></li>
            <li><button className={`nav-item ${activeTab==='shop'?'active':''}`} onClick={() => setActiveTab('shop')}><ShoppingBag size={20}/> Belanja Sehat</button></li>
            <li><button className={`nav-item ${activeTab==='friends'?'active':''}`} onClick={() => setActiveTab('friends')}><Users size={20}/> Teman Sehat</button></li>
            <li><button className="nav-item" onClick={handleScrollToChat}><Bot size={20}/> Dr. Alva AI</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={() => setActiveTab('settings')}><Settings size={20}/> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}><button onClick={logout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} /> Keluar</button></div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {!isDesktop && <header style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display:'flex', justifyContent:'space-between' }}><button onClick={()=>setSidebarOpen(true)}><Home/></button><span>VITALYST</span></header>}
        
        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1 }}>
          
          {/* CONTENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '1.5rem', marginTop: isDesktop ? 0 : '0.5rem' }}>
                <p className="body-medium" style={{ color: '#64748b' }}>{getGreeting()}, <strong>{overview?.user?.name}</strong>!</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
                
                {/* KOLOM KIRI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* Profil Card */}
                  <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <div style={badgeStyle}><Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}</div>
                        
                        {/* REFERRAL CODE DISINI */}
                        <div style={{fontSize:'0.75rem', marginTop:'0.5rem', color: darkMode?'#cbd5e1':'#475569', display:'flex', alignItems:'center', gap:'0.3rem', background:'rgba(255,255,255,0.3)', padding:'2px 8px', borderRadius:'6px', width:'fit-content', fontWeight:'bold'}}>
                             <QrCode size={12}/> Ref: {overview?.user?.referral_code}
                        </div>

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

                          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem'}}>
                              <div style={{background: darkMode?'#1e293b':'white', padding:'0.5rem', borderRadius:'6px', border:'1px solid #e2e8f0'}}>
                                  <div style={{fontSize:'0.7rem', color:'#64748b'}}>Berhasil</div>
                                  <div style={{fontSize:'1rem', fontWeight:'bold', color:'#166534'}}>{overview?.financial?.total_checkins || 0} Hari</div>
                              </div>
                              <div style={{background: darkMode?'#1e293b':'white', padding:'0.5rem', borderRadius:'6px', border:'1px solid #e2e8f0'}}>
                                  <div style={{fontSize:'0.7rem', color:'#64748b'}}>Terlewat</div>
                                  <div style={{fontSize:'1rem', fontWeight:'bold', color:'#991b1b'}}>{overview?.user?.missed_days || 0} Hari</div>
                              </div>
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
                  
                  {/* CHAT DOKTER AI */}
                  <Card ref={chatSectionRef} style={{ background: darkMode ? '#1e293b' : 'white', height: '450px', display:'flex', flexDirection:'column' }}>
                      <div style={{ padding: '1rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem', background: darkMode ? '#1e293b' : '#f8fafc' }}>
                        <div style={{ width: '45px', height: '45px', background: currentTheme.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
                            <Bot size={24} color={currentTheme.text} />
                        </div>
                        <div>
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

          {/* TAB RIWAYAT CHECK-IN (KALENDER) */}
          {activeTab === 'checkin' && (
              <div>
                 <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button>
                    <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Riwayat Kalender</h1>
                 </div>
                 
                 <div style={{background: darkMode ? '#1e293b' : 'white', padding:'1.5rem', borderRadius:'16px', border: darkMode?'1px solid #334155':'1px solid #e2e8f0', maxWidth:'500px', margin:'0 auto'}}>
                    {/* Header Kalender */}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                        <button onClick={()=>changeMonth(-1)} style={{background:'transparent', border:'none', cursor:'pointer', color: darkMode?'white':'black'}}><ChevronLeft/></button>
                        <h3 style={{fontWeight:'bold', fontSize:'1.2rem', color: darkMode?'white':'black'}}>
                            {calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={()=>changeMonth(1)} style={{background:'transparent', border:'none', cursor:'pointer', color: darkMode?'white':'black'}}><ChevronRight/></button>
                    </div>

                    {/* Nama Hari */}
                    <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', textAlign:'center', marginBottom:'0.5rem'}}>
                        {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => (
                            <div key={d} style={{fontSize:'0.8rem', fontWeight:'bold', color:'#64748b'}}>{d}</div>
                        ))}
                    </div>

                    {/* Grid Tanggal */}
                    <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'0.5rem'}}>
                        {renderCalendar()}
                    </div>

                    {/* Legend */}
                    <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem', justifyContent:'center'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.8rem', color: darkMode?'#cbd5e1':'#475569'}}>
                            <div style={{width:'12px', height:'12px', background:'#dcfce7', borderRadius:'3px'}}></div> Berhasil
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.8rem', color: darkMode?'#cbd5e1':'#475569'}}>
                            <div style={{width:'12px', height:'12px', background:'#fee2e2', borderRadius:'3px'}}></div> Terlewat
                        </div>
                    </div>
                 </div>
              </div>
          )}

          {/* TAB SHOP */}
          {activeTab === 'shop' && (
             <div>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                       <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button>
                       <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Belanja Sehat</h1>
                   </div>
                </div>

                <ShopBanner />

                <h3 style={{marginTop:'2rem', marginBottom:'1rem', fontWeight:'bold', fontSize:'1.2rem'}}>Katalog Produk</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                   {products.map((prod) => (
                      <Card key={prod.id} style={{ background: darkMode ? '#1e293b' : 'white', border: '1px solid #e2e8f0', overflow:'hidden', cursor:'pointer', transition:'transform 0.2s' }} onClick={() => openCheckout(prod)}>
                         <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={48} color="#cbd5e1"/>}
                         </div>
                         <div style={{ padding: '1rem' }}>
                            <h4 style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: darkMode?'white':'#0f172a' }}>{prod.name}</h4>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.5rem'}}>
                                <span style={{ fontWeight: 'bold', color: '#166534' }}>Rp {prod.price.toLocaleString()}</span>
                                <div style={{background: currentTheme.primary, padding:'4px', borderRadius:'6px'}}><Plus size={16} color="white"/></div>
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
             </div>
          )}

          {/* TAB FRIENDS (TEMAN SEHAT) */}
          {activeTab === 'friends' && (
             <div style={{maxWidth:'600px', margin:'0 auto'}}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button>
                    <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Teman Sehat</h1>
                </div>

                <Card style={{marginBottom: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'white'}}>
                   <CardContent style={{padding:'2rem', textAlign:'center'}}>
                      <p style={{marginBottom:'0.5rem', opacity:0.9}}>Kode Referral Saya</p>
                      <h1 style={{fontSize:'2.5rem', fontWeight:'bold', letterSpacing:'2px', marginBottom:'1.5rem'}}>{overview?.user?.referral_code}</h1>
                      <div style={{background:'white', padding:'1rem', borderRadius:'12px', display:'inline-block', marginBottom:'1.5rem'}}>
                         <QRCodeSVG value={`https://jagatetapsehat.com/join?ref=${overview?.user?.referral_code}`} size={150} />
                      </div>
                      <p style={{fontSize:'0.9rem', marginBottom:'1rem'}}>Ajak teman hidup sehat bersama!</p>
                      <button onClick={copyReferral} style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', color:'white', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}>
                         <Copy size={16}/> Salin Kode
                      </button>
                   </CardContent>
                </Card>

                <Card style={{marginBottom: '2rem'}}>
                    <CardContent style={{padding:'1.5rem'}}>
                        <h3 style={{fontWeight:'bold', marginBottom:'1rem', color: darkMode?'white':'black'}}>Tambah Teman</h3>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                            <input placeholder="Masukkan Kode Referral Teman" value={friendCode} onChange={e=>setFriendCode(e.target.value)} style={{flex:1, padding:'0.8rem', borderRadius:'8px', border:'1px solid #ccc'}} />
                            <button onClick={handleAddFriend} style={{background:currentTheme.primary, color:'white', border:'none', borderRadius:'8px', padding:'0 1.5rem', fontWeight:'bold', cursor:'pointer'}}>Add</button>
                        </div>
                    </CardContent>
                </Card>

                <h3 style={{fontWeight:'bold', marginBottom:'1rem', color: darkMode?'white':'black'}}>Daftar Teman</h3>
                {myFriends.length === 0 ? <p style={{color:'#64748b', textAlign:'center'}}>Belum ada teman. Yuk ajak temanmu!</p> : (
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        {myFriends.map(f => (
                            <div key={f.id} onClick={()=>handleShowFriendProfile(f)} style={{cursor:'pointer', padding:'1rem', display:'flex', alignItems:'center', gap:'1rem', background: darkMode?'#1e293b':'white', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                                <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#f1f5f9', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <User size={24} color="#64748b"/>
                                </div>
                                <div>
                                    <h4 style={{fontWeight:'bold', color:darkMode?'white':'black'}}>{f.name}</h4>
                                    <div style={{fontSize:'0.8rem', color: darkMode?'#cbd5e1':'#64748b', display:'flex', alignItems:'center', gap:'4px'}}><Medal size={12}/> {f.badge}</div>
                                </div>
                                <ChevronRight size={18} style={{marginLeft:'auto', color:'#94a3b8'}}/>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}

          {/* TAB SETTINGS */}
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

      {/* MODAL ALAMAT SAYA */}
      {showAddressModal && (
          <div className="modal-overlay">
             <div className="modal-content">
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
                     <h3 style={{fontWeight:'bold', fontSize:'1.2rem'}}>Alamat Saya</h3>
                     <button onClick={()=>setShowAddressModal(false)}><X size={24}/></button>
                 </div>
                 
                 {/* List Alamat */}
                 <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2rem'}}>
                     {addresses.length === 0 && <p style={{color:'#64748b'}}>Belum ada alamat tersimpan.</p>}
                     {addresses.map(addr => (
                         <div key={addr.id} style={{border:'1px solid #e2e8f0', padding:'1rem', borderRadius:'8px'}}>
                             <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{addr.label} <span style={{fontWeight:'normal', color:'#64748b'}}>| {addr.name}</span></div>
                             <p style={{fontSize:'0.85rem', color:'#334155', marginTop:'0.3rem'}}>{addr.address}, {addr.subdis_name}, {addr.dis_name}, {addr.city_name}, {addr.prov_name}</p>
                             <p style={{fontSize:'0.85rem', color:'#334155'}}>{addr.phone}</p>
                         </div>
                     ))}
                 </div>

                 {/* Form Tambah */}
                 <div style={{borderTop:'1px solid #e2e8f0', paddingTop:'1.5rem'}}>
                     <h4 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Alamat Baru</h4>
                     <input placeholder="Label (Rumah/Kantor)" value={newAddr.label} onChange={e=>setNewAddr({...newAddr, label:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                     <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
                        <input placeholder="Nama Penerima" value={newAddr.name} onChange={e=>setNewAddr({...newAddr, name:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                        <input placeholder="No HP" value={newAddr.phone} onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                     </div>
                     <select value={newAddr.prov_id} onChange={handleProvChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}>
                         <option value="">Pilih Provinsi</option>
                         {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     {newAddr.prov_id && (
                         <select value={newAddr.city_id} onChange={handleCityChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}>
                             <option value="">Pilih Kota/Kabupaten</option>
                             {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                     )}
                     {newAddr.city_id && (
                         <select value={newAddr.dis_id} onChange={handleDistrictChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}>
                             <option value="">Pilih Kecamatan</option>
                             {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                         </select>
                     )}
                     {newAddr.dis_id && (
                         <select value={newAddr.subdis_id} onChange={handleSubDistrictChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}>
                             <option value="">Pilih Kelurahan</option>
                             {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                     )}
                     <textarea placeholder="Alamat Lengkap (Jalan, No Rumah, RT/RW)" value={newAddr.address} onChange={e=>setNewAddr({...newAddr, address:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}></textarea>
                     <input placeholder="Kode Pos" value={newAddr.zip} onChange={e=>setNewAddr({...newAddr, zip:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'1rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                     
                     <button onClick={handleSaveAddress} style={{width:'100%', background: currentTheme.primary, padding:'0.8rem', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Simpan Alamat</button>
                 </div>
             </div>
          </div>
      )}

      {/* MODAL CHECKOUT REDESIGN */}
      {showCheckoutModal && selectedProduct && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1.5rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem' }}>Checkout</h3>
                
                <div style={{marginBottom:'1.5rem', background:'#f8fafc', padding:'1rem', borderRadius:'8px', display:'flex', gap:'1rem', alignItems:'center'}}>
                    {selectedProduct.image_url ? <img src={`${BACKEND_URL}${selectedProduct.image_url}`} style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover'}}/> : <Package size={40}/>}
                    <div>
                        <h4 style={{fontWeight:'bold'}}>{selectedProduct.name}</h4>
                        <p style={{color:'#166534', fontWeight:'bold'}}>Rp {selectedProduct.price.toLocaleString()}</p>
                    </div>
                </div>

                {/* PILIH ALAMAT */}
                <div style={{marginBottom:'1.5rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                        <label style={{fontWeight:'bold', fontSize:'0.9rem'}}>Alamat Pengiriman</label>
                        <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{fontSize:'0.8rem', color: currentTheme.primary, background:'none', border:'none', cursor:'pointer'}}>+ Tambah Alamat</button>
                    </div>
                    
                    {addresses.length > 0 ? (
                        <select onChange={(e)=>handleSelectAddrCheckout(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'6px', border:'1px solid #ccc'}}>
                             <option value="">Pilih Alamat Tersimpan</option>
                             {addresses.map(a => <option key={a.id} value={a.id}>{a.label} - {a.city_name}</option>)}
                        </select>
                    ) : (
                        <p style={{color:'#64748b', fontSize:'0.9rem'}}>Belum ada alamat. Silakan tambah alamat.</p>
                    )}
                </div>

                <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Subtotal</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Ongkos Kirim (JNE)</span><span>Rp {shippingCost.toLocaleString()}</span></div>
                    <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.2rem', marginTop:'0.5rem'}}><span>Total</span><span>Rp {(selectedProduct.price + shippingCost).toLocaleString()}</span></div>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Batal</button>
                    <button onClick={handleProcessPayment} disabled={!selectedAddrId} style={{padding:'0.8rem', border:'none', background: selectedAddrId ? '#ee4d2d' : '#cbd5e1', color:'white', borderRadius:'8px', fontWeight:'bold', cursor: selectedAddrId ? 'pointer' : 'not-allowed'}}>Bayar Sekarang</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL RIWAYAT PESANAN */}
      {showOrderHistory && (
          <div className="modal-overlay">
            <div className="modal-content">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                    <h3 style={{ fontSize:'1.4rem', fontWeight:'bold' }}>Status Pesanan</h3>
                    <button onClick={()=>setShowOrderHistory(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                </div>
                {myOrders.length === 0 ? <p style={{color:'#64748b', textAlign:'center'}}>Belum ada pesanan.</p> : (
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                        {myOrders.map((order, idx) => (
                            <div key={idx} style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1rem', marginBottom:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    <div>
                                        <h4 style={{fontWeight:'bold'}}>{order.product_name}</h4>
                                        <p style={{fontSize:'0.8rem', color:'#64748b'}}>Resi: {order.resi || '-'}</p>
                                    </div>
                                    <span style={{fontSize:'0.75rem', fontWeight:'bold', padding:'2px 8px', borderRadius:'12px', background: '#dcfce7', color: '#166534'}}>{order.status}</span>
                                </div>
                                <div style={{marginTop:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <div style={{fontSize:'0.8rem', color:'#64748b'}}>{order.date}</div>
                                    {(order.status === 'pending' || order.status === 'paid') && (
                                        <button onClick={()=>handleCancelOrder(order.order_id)} style={{background:'#fee2e2', color:'#991b1b', border:'none', padding:'0.4rem 0.8rem', borderRadius:'6px', fontSize:'0.8rem', cursor:'pointer'}}>Batalkan</button>
                                    )}
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
         <div className="modal-overlay">
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
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b' }}>Kode Pertemanan</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                        <QRCodeSVG value={`https://jagatetapsehat.com/friend/${overview?.user?.referral_code}`} size={160} />
                    </div>
                </div>
                <button onClick={() => setShowQRModal(false)} style={{ marginTop: '1rem', width: '100%', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px' }}>Tutup</button>
            </div>
        </div>
      )}
      
      {/* MODAL PROFIL TEMAN */}
      {showFriendProfile && friendData && (
        <div className="modal-overlay" onClick={() => setShowFriendProfile(false)}>
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
