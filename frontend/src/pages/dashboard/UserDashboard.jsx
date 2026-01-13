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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vitalyst.com/backend_api';

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
      // Auto-Fill dari data User
      setRecipientName(overview?.user?.name || "");
      setRecipientPhone(overview?.user?.phone || "");
      setShippingAddress(overview?.user?.address || ""); // [FITUR BARU] Ambil alamat tersimpan
      setAppliedCoupon(null);
      setCouponCode("");
      setShowCheckoutModal(true);
  };

  const checkCoupon = () => {
      setCouponError("");
      if (!couponCode) return;
      // Simulasi Kupon (Bisa diganti API)
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
              coupon_code: appliedCoupon?.code || "" // Kirim kode kupon
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
          {activeTab === 'dashboard' && (<div><h2 className="heading-2">Halo, {overview?.user?.name}</h2></div>)}

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
                   )) : (
                      <p style={{color:'#64748b'}}>Belum ada produk.</p>
                   )}
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

      {/* MODAL PRIVASI */}
      {showPrivacyModal && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: darkMode ? '#1e293b' : 'white', color: darkMode ? 'white' : 'black', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight:'80vh', overflowY:'auto' }}>
               <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Shield size={24}/> Kebijakan Privasi</h3>
               <div style={{ fontSize:'0.9rem', lineHeight:'1.6', marginBottom:'1.5rem', color: darkMode ? '#cbd5e1' : '#334155' }}>
                  <p><strong>1. Pengumpulan Data:</strong> Kami mengumpulkan data nama, nomor WhatsApp, dan log aktivitas kesehatan Anda untuk keperluan monitoring program Jates9.</p>
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