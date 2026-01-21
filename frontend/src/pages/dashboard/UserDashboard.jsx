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

// Pastikan file HealthReport.jsx ada di folder yang sama
import HealthReport from './HealthReport';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- KONFIGURASI TEMA ---
const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#8fec78', light: '#dcfce7', text: '#166534', gradient: 'linear-gradient(135deg, #ffffff 0%, #8fec78 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #14532d 100%)' },
  red: { id: 'red', name: 'Merah Berani', primary: '#fca5a5', light: '#fee2e2', text: '#991b1b', gradient: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' },
  gold: { id: 'gold', name: 'Emas Mewah', primary: '#fcd34d', light: '#fef3c7', text: '#b45309', gradient: 'linear-gradient(135deg, #ffffff 0%, #fcd34d 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #78350f 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#93c5fd', light: '#dbeafe', text: '#1e40af', gradient: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' },
  purple: { id: 'purple', name: 'Ungu Misteri', primary: '#d8b4fe', light: '#f3e8ff', text: '#6b21a8', gradient: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #581c87 100%)' },
};

const MOTIVATIONS = [
  "Kesehatan adalah investasi terbaikmu.",
  "Setiap langkah kecil membawamu lebih dekat ke tujuan.",
  "Tubuhmu adalah satu-satunya tempat kamu tinggal, jagalah!",
  "Jangan menyerah, proses tidak akan mengkhianati hasil.",
  "Hari ini sulit, besok akan lebih baik, lusa kamu juara!",
  "Disiplin adalah jembatan antara tujuan dan pencapaian."
];

const UserDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // --- STATE DATA ---
  const [overview, setOverview] = useState(null);
  const [activeChallenges, setActiveChallenges] = useState([]); 
  const [recommendedChallenges, setRecommendedChallenges] = useState([]); 
  
  // --- STATE KHUSUS MULTI CHALLENGE ---
  const [allDailyData, setAllDailyData] = useState([]); 
  const [selectedTasksMap, setSelectedTasksMap] = useState({}); 
  const [journalsMap, setJournalsMap] = useState({}); 

  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(true);
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
      label:'Rumah', name:'', phone:'', prov_id:'', prov_name:'', city_id:'', city_name:'', dis_id:'', dis_name:'', subdis_id:'', subdis_name:'', address:'', zip:''
  });

  // --- STATE CHECKOUT & ORDER ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedAddrId, setSelectedAddrId] = useState("");
  const [shippingMethod, setShippingMethod] = useState("jne"); 
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // --- STATE HISTORY CHECKIN ---
  const [checkinHistory, setCheckinHistory] = useState([]);

  // --- STATE BARU: QUIZ, CHALLENGE & REPORT MANAGEMENT ---
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);
  const [targetJoinChallenge, setTargetJoinChallenge] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [aiSummaryResult, setAiSummaryResult] = useState("");
  const [showReportData, setShowReportData] = useState(null); // Jika tidak null, tampilkan HealthReport

  // --- STATE LAINNYA ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  const currentTheme = THEMES[themeColor] || THEMES['green'];
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [friendData, setFriendData] = useState(null);
  
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatSectionRef = useRef(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [motivationText, setMotivationText] = useState("");
  const mainContentRef = useRef(null);
  const startY = useRef(0);

  useEffect(() => {
    const handleResize = () => { setIsDesktop(window.innerWidth > 1024); if(window.innerWidth > 1024) setSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    if (darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) { setShowTutorial(true); }

    fetchData(); 
    fetchArticles(); 
    fetchProducts(); 
    fetchAddresses(); 
    fetchCheckinHistory(); 
    
    axios.get(`${BACKEND_URL}/api/location/provinces`).then(res => setProvinces(res.data));

    const snapScriptUrl = "https://app.midtrans.com/snap/snap.js";
    const clientKey = "Mid-client-dXaTaEerstu_IviP";
    const script = document.createElement('script'); script.src = snapScriptUrl; script.setAttribute('data-client-key', clientKey);
    script.onload = () => { setSnapLoaded(true); }; script.async = true; document.body.appendChild(script);
    
    return () => { window.removeEventListener('resize', handleResize); if(document.body.contains(script)){ document.body.removeChild(script); } };
  }, []);

  useEffect(() => {
      if (activeChallenges.length > 0) {
          fetchAllDailyContents();
      } else {
          setDailyLoading(false);
      }
  }, [activeChallenges]);

  useEffect(() => { if (activeTab === 'friends') fetchFriendsList(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'shop') fetchOrders(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const handleTouchStart = (e) => { if (mainContentRef.current.scrollTop === 0) startY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => { if (startY.current === 0) return; const currentY = e.touches[0].clientY; const diff = currentY - startY.current; };
  const handleTouchEnd = async (e) => {
      const currentY = e.changedTouches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 100 && mainContentRef.current.scrollTop === 0 && !refreshing) {
          setRefreshing(true);
          const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
          setMotivationText(randomMotivation);
          await Promise.all([fetchData(), fetchAllDailyContents(), fetchArticles()]);
          setTimeout(() => { setRefreshing(false); startY.current = 0; }, 1500);
      }
      startY.current = 0;
  };

  const toggleDarkMode = () => { setDarkMode(!darkMode); localStorage.setItem('theme', !darkMode ? 'dark' : 'light'); if (!darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); };
  const changeThemeColor = (k) => { setThemeColor(k); localStorage.setItem('colorTheme', k); };
  
  const handleProvChange = (e) => { const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text; setNewAddr({...newAddr, prov_id: id, prov_name: name, city_id:'', dis_id:'', subdis_id:''}); axios.get(`${BACKEND_URL}/api/location/cities?prov_id=${id}`).then(res => setCities(res.data)); };
  const handleCityChange = (e) => { const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text; setNewAddr({...newAddr, city_id: id, city_name: name, dis_id:'', subdis_id:''}); axios.get(`${BACKEND_URL}/api/location/districts?city_id=${id}`).then(res => setDistricts(res.data)); };
  const handleDistrictChange = (e) => { const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text; setNewAddr({...newAddr, dis_id: id, dis_name: name, subdis_id:''}); axios.get(`${BACKEND_URL}/api/location/subdistricts?dis_id=${id}`).then(res => setSubdistricts(res.data)); };
  const handleSubDistrictChange = (e) => { const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text; const zip = subdistricts.find(s => s.id == id)?.zip || ''; setNewAddr({...newAddr, subdis_id: id, subdis_name: name, zip: zip}); };

  const fetchAddresses = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); setAddresses(res.data); } catch(e){} };
  const handleSaveAddress = async () => { try { await axios.post(`${BACKEND_URL}/api/user/address`, newAddr, { headers: getAuthHeader() }); fetchAddresses(); setShowAddressModal(false); alert("Alamat tersimpan!"); } catch(e){ alert("Gagal simpan alamat"); } };

  const getGreeting = () => { const h = new Date().getHours(); return h < 11 ? "Selamat Pagi" : h < 15 ? "Selamat Siang" : h < 18 ? "Selamat Sore" : "Selamat Malam"; };

  const fetchData = async () => {
    try {
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);
      setActiveChallenges(overviewRes.data.active_challenges || []);
      setRecommendedChallenges(overviewRes.data.recommendations || []);
      
      const tip = "Jaga kesehatan!";
      setChatHistory([{ role: "system_tip", content: tip }, { role: "assistant", content: "Halo! Saya Dr. Alva. Bagaimana perkembangan challenge kamu hari ini?" }]);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchArticles = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/admin/articles`); setArticles(res.data); } catch (e) {} };
  
  const fetchAllDailyContents = async () => { 
      setDailyLoading(true); 
      try { 
          const promises = activeChallenges.map(chal => 
              axios.get(`${BACKEND_URL}/api/daily-content?challenge_id=${chal.id}`, { headers: getAuthHeader() })
          );
          const results = await Promise.all(promises);
          const validData = results.map(r => r.data).filter(d => d.found);
          setAllDailyData(validData);
      } catch (e) { console.error(e); } 
      finally { setTimeout(() => setDailyLoading(false), 600); }
  };

  const fetchFriendsList = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() }); setMyFriends(res.data.friends); } catch (e) {} };
  const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/products`); if(Array.isArray(res.data)) { setProducts(res.data); } else { setProducts([]); } } catch(e){ setProducts([]); } };
  const fetchOrders = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() }); setMyOrders(res.data); } catch (e) {} };
  
  const fetchCheckinHistory = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/checkin-history`, { headers: getAuthHeader() }); setCheckinHistory(res.data); } catch(e) {} };

  const handleNavClick = (tab) => { setActiveTab(tab); if (!isDesktop) setSidebarOpen(false); };
  const handleScrollToChat = () => { setActiveTab('dashboard'); if(!isDesktop) setSidebarOpen(false); setTimeout(() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); };

  const handleSendChat = async (e) => { e.preventDefault(); if(!chatMessage.trim()) return; const msg = chatMessage; setChatHistory(p => [...p, {role:"user", content:msg}]); setChatMessage(""); setChatLoading(true); try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()}); setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]); } catch (e) { setChatHistory(p => [...p, {role:"assistant", content:"Error koneksi."}]); } finally { setChatLoading(false); } };
  const copyReferral = () => { navigator.clipboard.writeText(overview?.user?.referral_code || ""); alert("Disalin!"); };
  
  const toggleTaskSelection = (challengeId, task) => {
    const currentTasks = selectedTasksMap[challengeId] || [];
    let newTasks;
    if (currentTasks.includes(task)) { newTasks = currentTasks.filter(t => t !== task); } else { if (currentTasks.length < 3) newTasks = [...currentTasks, task]; else newTasks = currentTasks; }
    setSelectedTasksMap(prev => ({ ...prev, [challengeId]: newTasks }));
  };

  const handleJournalChange = (challengeId, text) => { setJournalsMap(prev => ({ ...prev, [challengeId]: text })); };

  const handleSubmitCheckin = async (challengeId, status) => { 
      if(isSubmitting) return; 
      const tasks = selectedTasksMap[challengeId] || [];
      const journal = journalsMap[challengeId] || "";
      if(status === 'completed' && tasks.length === 0) { alert("Pilih minimal 1 aktivitas untuk diselesaikan."); return; }
      setIsSubmitting(true); 
      try { 
          await axios.post(`${BACKEND_URL}/api/checkin`, { journal: journal, status: status, completed_tasks: tasks, challenge_id: challengeId }, {headers:getAuthHeader()}); 
          if(status === 'completed') { alert("Luar biasa! Misi selesai."); }
          if(status === 'pending') { alert("Oke, pengingat telah diset."); }
          fetchAllDailyContents(); fetchData(); fetchCheckinHistory(); 
      } catch(e){ alert(e.response?.data?.message || "Gagal check-in."); } finally { setIsSubmitting(false); } 
  };
  
  const handleChallengeAction = async (id, action) => {
      if(!window.confirm(`Yakin ingin ${action} challenge ini?`)) return;
      try {
          await axios.post(`${BACKEND_URL}/api/user/challenge/action`, { challenge_id: id, action: action }, { headers: getAuthHeader() });
          fetchData(); 
      } catch(e) { alert("Gagal update status"); }
  };

  const handleOpenReport = (challenge) => {
      const relevantLogs = checkinHistory.filter(log => log.challenge_id === challenge.id || !log.challenge_id);
      setShowReportData({
          challengeTitle: challenge.title,
          logs: relevantLogs.length > 0 ? relevantLogs : checkinHistory
      });
  };

  const initiateJoinChallenge = async (challenge) => {
      setTargetJoinChallenge(challenge);
      if (activeChallenges.length >= 2) {
          setShowLimitModal(true);
          return;
      }
      startQuiz(challenge.id);
  };

  const startQuiz = async (challengeId) => {
      try {
          const res = await axios.get(`${BACKEND_URL}/api/quiz/questions/${challengeId}`, { headers: getAuthHeader() });
          setQuizQuestions(res.data);
          setCurrentQuizIdx(0);
          setQuizAnswers({});
          setShowQuizModal(true);
      } catch (err) {
          alert("Gagal memuat kuis.");
      }
  };

  const handleQuizAnswer = (optionCategory) => {
      const qId = quizQuestions[currentQuizIdx].id;
      setQuizAnswers(prev => ({...prev, [qId]: optionCategory}));
      if (currentQuizIdx < quizQuestions.length - 1) {
          setCurrentQuizIdx(prev => prev + 1);
      } else {
          submitQuizResult(optionCategory);
      }
  };

  const submitQuizResult = async (lastAnswer) => {
      const finalAnswers = { ...quizAnswers, [quizQuestions[currentQuizIdx].id]: lastAnswer };
      const counts = { A: 0, B: 0, C: 0 };
      Object.values(finalAnswers).forEach(cat => {
          const key = String(cat).toUpperCase();
          if(counts[key] !== undefined) counts[key]++;
      });
      let healthType = "A"; let maxCount = -1;
      ['C', 'B', 'A'].forEach(type => { if (counts[type] > maxCount) { maxCount = counts[type]; healthType = type; } });
      const typeMapping = { "A": "Tipe A", "B": "Tipe B", "C": "Tipe C" };
      const finalType = typeMapping[healthType] || healthType;

      try {
          const res = await axios.post(`${BACKEND_URL}/api/quiz/submit`, {
              challenge_id: targetJoinChallenge.id,
              answers: finalAnswers,
              health_type: finalType,
              score: 100
          }, { headers: getAuthHeader() });

          setAiSummaryResult(res.data.ai_summary);
          setShowQuizModal(false);
          setShowAiSummaryModal(true);
          fetchData(); 
      } catch (err) {
          alert(err.response?.data?.message || "Gagal submit kuis");
      }
  };

  const handlePauseFromModal = async (challengeId) => {
      if(!window.confirm("Pause challenge ini? Kamu bisa melanjutkannya nanti.")) return;
      try {
          await axios.post(`${BACKEND_URL}/api/user/challenge/pause`, { challenge_id: challengeId }, {
              headers: { getAuthHeader } 
          });
          await handleChallengeAction(challengeId, 'pause');
          setShowLimitModal(false);
          startQuiz(targetJoinChallenge.id);
      } catch (err) {
      }
  };

  const closeTutorial = () => { setShowTutorial(false); localStorage.setItem('hasSeenTutorial', 'true'); };
  const handleProfilePictureUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setUploadingImage(true); const formData = new FormData(); formData.append('image', file); try { const res = await axios.post(`${BACKEND_URL}/api/user/upload-profile-picture`, formData, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } }); setOverview(prev => ({ ...prev, user: { ...prev.user, profile_picture: res.data.image_url } })); alert("Foto berhasil diubah!"); } catch (err) { alert("Gagal upload foto."); } finally { setUploadingImage(false); } };
  const triggerFileInput = () => fileInputRef.current.click();
  const handleAddFriend = async () => { if(!friendCode) return alert("Masukkan kode teman!"); try { await axios.post(`${BACKEND_URL}/api/friends/add`, { referral_code: friendCode }, { headers: getAuthHeader() }); alert("Teman berhasil ditambahkan!"); setFriendCode(""); fetchFriendsList(); } catch (e) { alert(e.response?.data?.message || "Gagal menambahkan teman."); } };
  const handleShowFriendProfile = (friend) => { setFriendData(friend); setShowFriendProfile(true); };
  
  const openCheckout = async (product) => { setSelectedProduct(product); setShippingCost(0); setShippingMethod("jne"); setAppliedCoupon(null); setCouponCode(""); setShowCheckoutModal(true); try { const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); setAddresses(res.data); if (res.data.length > 0) { handleSelectAddrCheckout(res.data[0].id); } else { setSelectedAddrId(""); } } catch(e){} };
  const handleMethodChange = (method) => { setShippingMethod(method); if (method === 'pickup') setShippingCost(0); else if (selectedAddrId) handleSelectAddrCheckout(selectedAddrId); };
  const handleSelectAddrCheckout = async (addrId) => { setSelectedAddrId(addrId); if (shippingMethod === 'pickup') return; const addr = addresses.find(a => a.id === Number(addrId)); if(addr) { const res = await axios.post(`${BACKEND_URL}/api/location/rate`, { city_id: addr.city_id }, { headers: getAuthHeader() }); setShippingCost(res.data.cost); } };
  const handleProcessPayment = async () => {
      if (!snapLoaded) { alert("Sistem pembayaran belum siap."); return; }
      if (shippingMethod === 'jne' && !selectedAddrId) { alert("Pilih alamat pengiriman."); return; }
      const addr = addresses.find(a => a.id === Number(selectedAddrId)) || {};
      try {
          const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, { item_name: selectedProduct.name, shipping_cost: shippingMethod === 'pickup' ? 0 : shippingCost, address_detail: addr, shipping_method: shippingMethod === 'pickup' ? 'Ambil di Toko' : 'JNE Regular', coupon: appliedCoupon?.code || "", discount: appliedCoupon?.amount || 0 }, { headers: getAuthHeader() });
          if (response.data.success) { setShowCheckoutModal(false); window.snap.pay(response.data.token, { onSuccess: function(result) { alert("Pembayaran Berhasil!"); fetchOrders(); }, onPending: function(result) { alert("Menunggu pembayaran!"); fetchOrders(); }, onError: function(result) { alert("Pembayaran gagal!"); } }); }
      } catch (error) { alert("Gagal memproses transaksi: " + (error.response?.data?.message || "Server Error")); }
  };
  const handleOpenInvoice = (order) => { setSelectedInvoice(order); setShowInvoice(true); };
  const badgeStyle = { background: 'linear-gradient(45deg, #FFD700, #FDB931)', color: '#7B3F00', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '1px solid #FFF' };
  
  const ShopBanner = () => (
      <div style={{ marginBottom: '2rem', position:'relative', borderRadius: '16px', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding: '2.5rem 2rem', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div> <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Belanja Sehat, Hidup Kuat</h2> <p style={{ opacity: 0.9 }}>Suplemen herbal terbaik untuk pencernaan Anda.</p> </div>
              <div style={{ background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'50%' }}> <ShoppingBag size={48} color="white"/> </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'white', borderTop:'1px solid #eee' }}>
              <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}> <MapPin size={18}/> Alamat Saya </button>
              <button onClick={()=>{fetchOrders(); setShowOrderHistory(true)}} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}> <Truck size={18}/> Status Pesanan </button>
          </div>
      </div>
  );

  const renderDailyCard = (data) => {
      const isCompleted = data.today_status === 'completed';
      const selected = selectedTasksMap[data.challenge_id] || [];
      const journal = journalsMap[data.challenge_id] || "";

      return (
          <Card key={data.challenge_id} style={{ marginBottom: '1.5rem', background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
              <CardHeader style={{paddingBottom:'0.5rem', background: currentTheme.light}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <CardTitle className="heading-3" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize: '1rem', color: currentTheme.text}}> 
                          <Activity size={18}/> {data.challenge_title} - Hari {data.day} 
                      </CardTitle>
                      {isCompleted && <span style={{fontSize: '0.75rem', background: '#166534', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold'}}>Selesai</span>}
                  </div>
              </CardHeader>
              <CardContent style={{paddingTop:'1rem'}}>
                  {data.fact && (
                      <div style={{ background: darkMode ? '#334155' : '#f8fafc', padding: '0.8rem', borderRadius: '8px', borderLeft: `3px solid ${currentTheme.text}`, marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.85rem', color: darkMode ? '#e2e8f0' : '#334155', fontStyle:'italic' }}>"{data.fact}"</p>
                      </div>
                  )}

                  {isCompleted ? (
                      <div style={{textAlign:'center', padding:'1.5rem', background: darkMode ? 'rgba(22, 101, 52, 0.2)' : '#f0fdf4', borderRadius:'12px', color: darkMode ? '#86efac' : '#166534', border: '1px solid #bbb'}}>
                          <CheckCircle size={32} style={{margin:'0 auto 0.5rem auto'}} />
                          <h3 style={{fontSize:'1.1rem', fontWeight:'bold'}}>Misi Tuntas!</h3>
                          {data.ai_feedback && <div style={{marginTop:'0.5rem', fontStyle:'italic', fontSize:'0.8rem'}}>"{data.ai_feedback}"</div>}
                      </div>
                  ) : (
                      <>
                          <p style={{marginBottom:'0.8rem', fontWeight:'bold', fontSize:'0.9rem', color: darkMode?'white':'black'}}>Checklist Aktivitas:</p>
                          <div style={{display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                              {data.tasks?.map((task, idx) => {
                                  const isSelected = selected.includes(task);
                                  return (
                                      <div key={idx} onClick={() => toggleTaskSelection(data.challenge_id, task)} style={{ padding:'0.8rem', borderRadius:'10px', border: isSelected ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0', background: isSelected ? currentTheme.light : (darkMode ? '#334155' : 'white'), cursor:'pointer', display:'flex', alignItems:'center', gap:'0.8rem', transition:'all 0.2s', color: darkMode ? 'white' : 'black' }}>
                                          <div style={{ width:'20px', height:'20px', borderRadius:'4px', border:`2px solid ${isSelected ? currentTheme.primary : '#cbd5e1'}`, background: isSelected ? currentTheme.primary : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0, color: 'white' }}> {isSelected && <Check size={14} strokeWidth={3}/>} </div>
                                          <span style={{fontSize:'0.85rem', fontWeight: isSelected ? 'bold' : 'normal'}}>{task}</span>
                                      </div>
                                  );
                              })}
                          </div>
                          
                          <textarea value={journal} onChange={(e) => handleJournalChange(data.challenge_id, e.target.value)} placeholder={`Jurnal untuk ${data.challenge_title}...`} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop:'1rem', background: darkMode ? '#1e293b' : 'white', color: darkMode ? 'white' : 'black', fontFamily:'inherit', fontSize:'0.9rem' }} ></textarea>
                          
                          <div style={{ marginTop: '1rem', display:'flex', gap:'0.5rem' }}>
                              <button onClick={() => handleSubmitCheckin(data.challenge_id, 'completed')} disabled={isSubmitting || selected.length === 0} style={{ flex:2, background: selected.length > 0 ? currentTheme.primary : '#cbd5e1', color: 'black', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: selected.length > 0 ? 'pointer' : 'not-allowed', display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem' }}> 
                                  {isSubmitting ? <RefreshCw className="animate-spin" size={16}/> : <CheckCircle size={16}/>} Selesai 
                              </button>
                              <button onClick={() => handleSubmitCheckin(data.challenge_id, 'pending')} disabled={isSubmitting} style={{flex:1, background:'transparent', border:'1px solid #ccc', borderRadius:'8px', color: darkMode?'white':'#64748b', cursor:'pointer', fontWeight:'500'}}>Nanti</button>
                          </div>
                      </>
                  )}
              </CardContent>
          </Card>
      );
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background: darkMode?'#0f172a':'#f8fafc', color: darkMode?'white':'black' }}><Loader className="animate-spin" size={40}/><p style={{marginTop:'1rem'}}>Memuat Dashboard...</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflow: 'hidden' }}>
      <style>{`<br>        header:not(.dashboard-header), .navbar, .site-header, #header, nav.navbar { display: none !important; }<br>        body { padding-top: 0 !important; margin-top: 0 !important; }<br>        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; --theme-gradient: ${currentTheme.gradient}; --theme-light: ${currentTheme.light}; }<br>        .dark { --theme-gradient: ${currentTheme.darkGradient}; }<br>        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; }<br>        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 600; }<br>        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; alignItems: center; justifyContent: center; z-index: 99999; }<br>        .modal-content { background: ${darkMode ? '#1e293b' : 'white'}; padding: 2rem; border-radius: 16px; maxWidth: 500px; width: 90%; maxHeight: 90vh; overflow-y: auto; color: ${darkMode ? 'white' : 'black'}; }<br>      `}</style>

      {isDesktop && (
      <aside style={{ width: '260px', background: darkMode ? '#1e293b' : 'white', borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', height: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}> <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.text }}>VITALYST</h2> </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={() => handleNavClick('dashboard')}><Activity size={20}/> Dashboard</button></li>
            <li><button className={`nav-item ${activeTab==='shop'?'active':''}`} onClick={() => handleNavClick('shop')}><ShoppingBag size={20}/> Belanja Sehat</button></li>
            <li><button className={`nav-item ${activeTab==='friends'?'active':''}`} onClick={() => handleNavClick('friends')}><Users size={20}/> Teman Sehat</button></li>
            <li><button className="nav-item" onClick={handleScrollToChat}><Bot size={20}/> Dr. Alva</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={() => handleNavClick('settings')}><Settings size={20}/> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}><button onClick={logout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} /> Keluar</button></div>
      </aside>
      )}

      <div ref={mainContentRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', paddingBottom: isDesktop ? 0 : '80px' }}>
        {!isDesktop && <header className="dashboard-header" style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display:'flex', justifyContent:'space-between', background: darkMode?'#1e293b':'white', position: 'sticky', top: 0, zIndex: 50 }}>
            <span style={{fontWeight:'bold', fontSize:'1.2rem'}}>VITALYST</span>
            <button onClick={()=>setShowNotifDropdown(!showNotifDropdown)} style={{background:'none', border:'none', position:'relative'}}>
                <Bell size={24} color={darkMode?'white':'#1e293b'}/>
                {overview?.notifications?.length > 0 && <span style={{position:'absolute', top:0, right:0, width:'8px', height:'8px', background:'red', borderRadius:'50%'}}></span>}
            </button>
        </header>}
        
        {refreshing && (
            <div style={{textAlign: 'center', padding: '1rem', background: currentTheme.light, color: currentTheme.text}}>
                <RefreshCw className="animate-spin" size={20} style={{display:'inline-block', marginRight:'8px'}}/> Memuat ulang data...
            </div>
        )}

        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1 }}>
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '1.5rem', marginTop: isDesktop ? 0 : '0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p className="body-medium" style={{ color: '#64748b' }}>{getGreeting()}, <strong>{overview?.user?.name}</strong>!</p>
                {isDesktop && (
                    <div style={{position:'relative'}}>
                        <button onClick={()=>setShowNotifDropdown(!showNotifDropdown)} style={{background:'none', border:'none', cursor:'pointer', position:'relative'}}>
                            <Bell size={24} color={darkMode?'white':'#1e293b'}/>
                            {overview?.notifications?.length > 0 && <span style={{position:'absolute', top:-2, right:-2, width:'10px', height:'10px', background:'red', borderRadius:'50%'}}></span>}
                        </button>
                        {showNotifDropdown && (
                            <div style={{position:'absolute', top:'100%', right:0, width:'280px', background: darkMode?'#334155':'white', boxShadow:'0 5px 15px rgba(0,0,0,0.2)', borderRadius:'12px', padding:'1rem', zIndex:100, border: '1px solid #e2e8f0'}}>
                                <h4 style={{fontWeight:'bold', marginBottom:'0.8rem', fontSize:'0.9rem', color: darkMode?'white':'black'}}>Notifikasi</h4>
                                {overview?.notifications?.length > 0 ? (
                                    <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                                            {overview.notifications.map((n, i) => (
                                                <div key={i} style={{fontSize:'0.85rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem'}}>
                                                    <div style={{fontWeight:'bold', color: currentTheme.text}}>{n.title}</div>
                                                    <div style={{color: darkMode?'#cbd5e1':'#64748b'}}>{n.message}</div>
                                                    <div style={{fontSize:'0.7rem', color:'#94a3b8', marginTop:'2px'}}>{n.date}</div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (<div style={{fontSize:'0.85rem', color:'#94a3b8'}}>Belum ada notifikasi baru.</div>)}
                            </div>
                        )}
                    </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid white' }}>
                              {overview?.user?.profile_picture ? ( <img src={`${BACKEND_URL}${overview.user.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> ) : ( <User size={35} color={currentTheme.text} /> )}
                          </div>
                          <button onClick={() => setActiveTab('settings')} style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'white', borderRadius: '50%', padding: '4px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}> <Edit2 size={12} color="#475569" /> </button>
                      </div>
                      <div> <h2 className="heading-2" style={{ marginBottom: '0.3rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{overview?.user?.name}</h2> <div style={badgeStyle}><Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}</div> </div>
                    </CardContent>
                  </Card>

                  <div>
                      {dailyLoading ? (
                          <div style={{textAlign:'center', padding:'2rem', background: darkMode?'#1e293b':'white', borderRadius:'12px'}}>
                              <Loader className="animate-spin" size={32} color={currentTheme.text} style={{margin:'0 auto'}}/>
                              <p style={{marginTop:'1rem', fontSize:'0.9rem'}}>Memuat Misi...</p>
                          </div>
                      ) : allDailyData.length === 0 ? (
                          <Card style={{ padding:'2rem', textAlign:'center', background: darkMode?'#1e293b':'white' }}>
                              <p style={{color:'#64748b'}}>Kamu belum mengikuti challenge apapun.</p>
                              <p style={{fontSize:'0.8rem', marginTop:'0.5rem'}}>Pilih rekomendasi di bawah untuk mulai!</p>
                          </Card>
                      ) : (
                          allDailyData.map(data => renderDailyCard(data))
                      )}
                  </div>

                  <Card style={{ background: darkMode ? '#1e293b' : '#fff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader>
                        <CardTitle className="heading-3" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem'}}>
                            <TrendingUp size={18} /> Challenge Saya ({activeChallenges.length}/2)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeChallenges.length === 0 ? (
                            <p style={{fontSize:'0.9rem', color:'#64748b'}}>Belum ada challenge yang diikuti.</p>
                        ) : (
                            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                                {activeChallenges.map(chal => (
                                    <div key={chal.id} style={{ padding:'1rem', borderRadius:'12px', background: darkMode?'#334155':'#f8fafc', border:'1px solid #eee', cursor: 'default', transition: 'transform 0.1s' }}>
                                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                                                <span style={{fontWeight:'bold', color: currentTheme.text}}>{chal.title}</span>
                                                <span style={{fontSize:'0.8rem', padding:'2px 8px', borderRadius:'10px', background: chal.status==='active'?'#dcfce7':'#fee2e2', color: chal.status==='active'?'#166534':'#991b1b'}}>
                                                    {chal.status === 'active' ? 'Aktif' : 'Paused'}
                                                </span>
                                            </div>
                                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'4px', color:'#64748b'}}>
                                                <span>Hari ke-{chal.day > 30 ? '30+' : chal.day}</span>
                                                <span style={{fontWeight:'bold'}}>{chal.progress}% Tuntas</span>
                                            </div>
                                            <div style={{height:'8px', background:'#e2e8f0', borderRadius:'4px', overflow:'hidden', marginBottom:'0.5rem'}}>
                                                <div style={{width:`${chal.progress}%`, height:'100%', background: currentTheme.primary, transition: 'width 0.5s ease-in-out'}}></div>
                                            </div>
                                            <div style={{display:'flex', gap:'1rem', fontSize:'0.75rem', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px dashed #cbd5e1'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'4px', color: darkMode?'#86efac':'#166534'}}> <CheckCircle size={12}/> {chal.completed || 0} Selesai </div>
                                                <div style={{display:'flex', alignItems:'center', gap:'4px', color: '#ef4444'}}> <X size={12}/> {chal.missed || 0} Terlewat </div>
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenReport(chal); }}
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '0.8rem',
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    background: 'white',
                                                    border: `1px solid ${currentTheme.primary}`,
                                                    color: currentTheme.text,
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FileText size={16}/> Laporan Perkembangan Saya
                                            </button>
                                            
                                            <div style={{display:'flex', gap:'0.5rem'}} onClick={(e) => e.stopPropagation()}>
                                                {chal.status === 'active' ? (
                                                    <button onClick={()=>handleChallengeAction(chal.id, 'pause')} style={{flex:1, padding:'6px', borderRadius:'6px', border:'1px solid #cbd5e1', background:'white', fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', cursor:'pointer', color:'black'}}> <Pause size={14}/> Pause </button>
                                                ) : (
                                                    <button onClick={()=>handleChallengeAction(chal.id, 'resume')} style={{flex:1, padding:'6px', borderRadius:'6px', border:'1px solid #cbd5e1', background:'white', fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', cursor:'pointer', color:'black'}}> <Play size={14}/> Resume </button>
                                                )}
                                                <button onClick={()=>handleChallengeAction(chal.id, 'stop')} style={{flex:1, padding:'6px', borderRadius:'6px', border:'1px solid #fee2e2', background:'#fef2f2', color:'#ef4444', fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', cursor:'pointer'}}> <Square size={14}/> Berhenti </button>
                                            </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                  </Card>

                  {recommendedChallenges.length > 0 && (
                      <div style={{marginTop:'1rem'}}>
                          <h3 style={{fontSize:'1rem', fontWeight:'bold', marginBottom:'1rem', color: darkMode?'white':'black'}}>Rekomendasi Challenge</h3>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem'}}>
                              {recommendedChallenges.map(rec => (
                                  <Card key={rec.id} style={{background: darkMode?'#1e293b':'white', border:'1px solid #e2e8f0', overflow:'hidden'}}>
                                      <div style={{height:'100px', background: currentTheme.light, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                          <Target size={32} color={currentTheme.text}/>
                                      </div>
                                      <div style={{padding:'1rem'}}>
                                          <h4 style={{fontWeight:'bold', fontSize:'0.9rem', marginBottom:'0.3rem', color: darkMode?'white':'black'}}>{rec.title}</h4>
                                          <button onClick={()=>initiateJoinChallenge(rec)} style={{ width:'100%', marginTop:'0.5rem', background: currentTheme.primary, border:'none', padding:'6px', borderRadius:'6px', color: 'white', fontSize:'0.8rem', fontWeight:'bold', cursor: 'pointer' }}>
                                              {activeChallenges.length >= 2 ? "Slot Penuh" : "Ikuti Challenge"}
                                          </button>
                                      </div>
                                  </Card>
                              ))}
                          </div>
                      </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  <Card ref={chatSectionRef} style={{ background: darkMode ? '#1e293b' : 'white', height: '450px', display:'flex', flexDirection:'column' }}>
                      <div style={{ padding: '1rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem', background: darkMode ? '#1e293b' : '#f8fafc' }}>
                        <div style={{ width: '45px', height: '45px', background: currentTheme.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}> <Bot size={24} color={currentTheme.text} /> </div>
                        <div> <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: darkMode ? 'white' : '#0f172a', marginBottom:'2px', display:'flex', alignItems:'center', gap:'6px' }}> Dr. Alva <Sparkles size={16} fill={currentTheme.primary} color={currentTheme.text}/> </h3> <p style={{ fontSize: '0.75rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Coach Kesehatan Pribadi Anda</p> </div>
                      </div>
                      <div style={{flex:1, overflowY:'auto', padding:'1rem'}}> {chatHistory.map((msg, i) => ( <div key={i} style={{ padding:'0.6rem 1rem', background: msg.role==='user' ? currentTheme.light : (darkMode?'#334155':'#f1f5f9'), borderRadius:'12px', marginBottom:'0.8rem', maxWidth:'85%', alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start', marginLeft: msg.role==='user' ? 'auto' : '0', color: msg.role==='user' ? '#1e3a8a' : (darkMode?'e2e8f0':'#334155'), fontSize: '0.9rem' }}> {msg.content} </div> ))} {chatLoading && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginLeft:'0.5rem' }}>Dr. Alva sedang mengetik...</div>} <div ref={chatEndRef}></div> </div>
                      <form onSubmit={handleSendChat} style={{padding:'1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display:'flex', gap:'0.5rem'}}> <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'0.7rem', borderRadius:'20px', border:'1px solid #ccc', color:'black', outline:'none', fontSize:'0.9rem'}} placeholder="Tanya keluhan..." /> <button style={{background: currentTheme.primary, border:'none', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><Send size={18}/></button> </form>
                  </Card>
                  <Card style={{ background: darkMode ? '#1e293b' : 'transparent', border:'none', boxShadow:'none' }}>
                      <h3 style={{marginBottom:'1rem', fontWeight:'bold'}}>Artikel Kesehatan</h3>
                      {articles.map(article => ( <div key={article.id} onClick={() => setSelectedArticle(article)} style={{ display:'flex', gap:'1rem', padding:'1rem', background: darkMode ? '#334155' : 'white', borderRadius:'12px', marginBottom:'0.8rem', cursor:'pointer', border: darkMode ? 'none' : '1px solid #e2e8f0', alignItems:'center' }}> <div style={{width:'50px', height:'50px', background: currentTheme.light, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}> <FileText size={24} color={currentTheme.text}/> </div> <div style={{flex:1}}> <h4 style={{fontWeight:'bold', fontSize:'0.9rem', color: darkMode ? 'white' : '#1e293b', marginBottom:'0.2rem', lineHeight:'1.3'}}>{article.title}</h4> <p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', display:'flex', alignItems:'center', gap:'4px' }}> <Clock size={12}/> {Math.ceil((article.content?.split(' ').length || 0)/200)} min baca </p> </div> <ChevronRight size={18} color="#94a3b8"/> </div> ))}
                  </Card>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                  <div style={{ background: darkMode ? '#334155' : 'white', padding: '1rem 2rem', borderRadius: '12px', border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0', display: 'inline-block', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                      <p style={{ fontSize: '0.8rem', color: darkMode ? '#cbd5e1' : '#64748b', marginBottom: '0.3rem', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'bold' }}>Kode Referral Anda</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.text, letterSpacing: '2px' }}>{overview?.user?.referral_code || '-'}</span>
                          <button onClick={copyReferral} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding:'4px', borderRadius:'4px', display:'flex', alignItems:'center' }}> <Copy size={18} color={darkMode ? 'white' : '#1e293b'} /> </button>
                          <button onClick={()=>setShowQRModal(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding:'4px', borderRadius:'4px', display:'flex', alignItems:'center' }}> <QrCode size={18} color={darkMode ? 'white' : '#1e293b'} /> </button>
                      </div>
                  </div>
              </div>
              {motivationText && ( <div style={{marginTop:'2rem', textAlign:'center', padding:'1rem', fontStyle:'italic', color: darkMode?'#cbd5e1':'#64748b', animation:'fadeIn 0.5s ease'}}> "{motivationText}" </div> )}
            </>
          )}

          {activeTab === 'settings' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}> <button onClick={() => handleNavClick('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button> <h1 className="heading-2">Pengaturan</h1> </div>
               <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> <CardHeader><CardTitle className="heading-3">Foto Profil</CardTitle></CardHeader> <CardContent> <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}> <div style={{ position: 'relative', width:'80px', height:'80px' }}> <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '2px solid #e2e8f0' }}> {overview?.user?.profile_picture ? <img src={`${BACKEND_URL}${overview.user.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={40} color="#94a3b8"/></div>} </div> <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleProfilePictureUpload} /> </div> <button onClick={triggerFileInput} disabled={uploadingImage} style={{ background: currentTheme.primary, color:'black', border:'none', padding:'0.6rem 1rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>{uploadingImage ? <RefreshCw className="animate-spin" size={16}/> : <Camera size={16}/>} {uploadingImage ? "Mengupload..." : "Ganti Foto"}</button> </div> </CardContent> </Card>
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> <CardHeader><CardTitle className="heading-3">Ubah Tema</CardTitle></CardHeader> <CardContent> <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}> {Object.values(THEMES).map((theme) => ( <div key={theme.id} onClick={() => changeThemeColor(theme.id)} style={{ cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}> <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: theme.gradient, border: themeColor === theme.id ? `3px solid ${darkMode?'white':'#1e293b'}` : '1px solid #ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}> {themeColor === theme.id && <Check size={20} color="white" style={{dropShadow:'0 1px 2px rgba(0,0,0,0.5)'}}/>} </div> </div> ))} </div> </CardContent> </Card>
                  <button onClick={() => setShowPrivacy(true)} style={{ width: '100%', padding: '1rem', border: '1px solid #e2e8f0', background: darkMode?'#334155':'white', borderRadius: '8px', color: darkMode?'white':'#1e293b', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}><Shield size={20}/> Kebijakan Privasi</button>
                  <button onClick={logout} style={{ width: '100%', padding: '1rem', border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}><LogOut size={20}/> Keluar dari Aplikasi</button>
               </div>
            </div>
          )}
          {activeTab === 'shop' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}> <div style={{display:'flex', gap:'1rem', alignItems:'center'}}> <button onClick={() => handleNavClick('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button> <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Belanja Sehat</h1> </div> </div>
                <ShopBanner />
                <h3 style={{marginTop:'2rem', marginBottom:'1rem', fontWeight:'bold', fontSize:'1.2rem'}}>Katalog Produk</h3>
                {products.length === 0 ? ( <div style={{padding:'3rem', textAlign:'center', color:'#64748b', background: darkMode?'#1e293b':'#f8fafc', borderRadius:'12px', border:'1px dashed #cbd5e1'}}> <Package size={48} style={{margin:'0 auto 1rem auto', opacity:0.5}}/> <p>Belum ada produk tersedia saat ini.</p> </div> ) : ( <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}> {products.map((prod) => ( <Card key={prod.id} style={{ background: darkMode ? '#1e293b' : 'white', border: '1px solid #e2e8f0', overflow:'hidden', cursor:'pointer', transition:'transform 0.2s', display:'flex', flexDirection:'column', height:'100%' }} onClick={() => openCheckout(prod)}> <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={48} color="#cbd5e1"/>} </div> <div style={{ padding: '1rem', flex: 1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}> <div> <h4 style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: darkMode?'white':'#0f172a' }}>{prod.name}</h4> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.5rem'}}> <span style={{ fontWeight: 'bold', color: '#166534' }}>Rp {prod.price.toLocaleString()}</span> <div style={{background: currentTheme.primary, padding:'4px', borderRadius:'6px'}}><Plus size={16} color="white"/></div> </div> </div> <button onClick={()=>openCheckout(prod)} style={{marginTop:'1rem', width:'100%', background: currentTheme.primary, padding:'0.5rem', borderRadius:'8px', border:'none', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', cursor:'pointer'}}> <ShoppingCart size={16}/> Beli </button> </div> </Card> ))} </div> )}
              </div>
          )}
          {activeTab === 'friends' && (
              <div style={{maxWidth:'600px', margin:'0 auto'}}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}> <button onClick={() => handleNavClick('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button> <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Teman Sehat</h1> </div>
                <Card style={{marginBottom: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'white'}}> <CardContent style={{padding:'2rem', textAlign:'center'}}> <p style={{marginBottom:'0.5rem', opacity:0.9}}>Kode Referral Saya</p> <h1 style={{fontSize:'2.5rem', fontWeight:'bold', letterSpacing:'2px', marginBottom:'1.5rem'}}>{overview?.user?.referral_code}</h1> <div style={{display:'flex', justifyContent:'center', gap:'1rem'}}> <button onClick={copyReferral} style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', color:'white', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}> <Copy size={16}/> Salin </button> <button onClick={()=>setShowQRModal(true)} style={{background:'white', color:'#4f46e5', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}> <QrCode size={16}/> QR Code </button> </div> </CardContent> </Card>
                <Card style={{marginBottom: '2rem', background: darkMode?'#1e293b':'white'}}> <CardContent style={{padding:'1.5rem'}}> <h3 style={{fontWeight:'bold', marginBottom:'1rem', color: darkMode?'white':'black'}}>Tambah Teman</h3> <div style={{display:'flex', gap:'0.5rem'}}> <input placeholder="Masukkan Kode Referral Teman" value={friendCode} onChange={e=>setFriendCode(e.target.value)} style={{flex:1, padding:'0.8rem', borderRadius:'8px', border:'1px solid #ccc', color:'black'}} /> <button onClick={handleAddFriend} style={{background:currentTheme.primary, color:'white', border:'none', borderRadius:'8px', padding:'0 1.5rem', fontWeight:'bold', cursor:'pointer'}}>Add</button> </div> </CardContent> </Card>
                <h3 style={{fontWeight:'bold', marginBottom:'1rem', color: darkMode?'white':'black'}}>Daftar Teman</h3> <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}> {myFriends.map(f => ( <div key={f.id} onClick={()=>handleShowFriendProfile(f)} style={{cursor:'pointer', padding:'1rem', display:'flex', alignItems:'center', gap:'1rem', background: darkMode?'#1e293b':'white', borderRadius:'12px', border:'1px solid #e2e8f0'}}> <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#f1f5f9', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}> <User size={24} color="#64748b"/> </div> <div> <h4 style={{fontWeight:'bold', color:darkMode?'white':'black'}}>{f.name}</h4> <div style={{fontSize:'0.8rem', color: darkMode?'#cbd5e1':'#64748b', display:'flex', alignItems:'center', gap:'4px'}}><Medal size={12}/> {f.badge}</div> </div> </div> ))} </div>
              </div>
          )}
        </main>
      </div>

      {!isDesktop && (
          <nav className="mobile-navbar" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: darkMode ? '#1e293b' : 'white',
              borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              padding: '10px 0',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
              width: '100%',
              paddingBottom: 'safe-area-inset-bottom'
          }}>
              {/* Home */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'dashboard' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('dashboard')}
              >
                  <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.7rem', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}>Home</span>
              </button>

              {/* Teman (Menggantikan History) */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'friends' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('friends')}
              >
                  <Users size={22} strokeWidth={activeTab === 'friends' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.7rem', fontWeight: activeTab === 'friends' ? 'bold' : 'normal' }}>Teman</span>
              </button>

              {/* Shop */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'shop' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('shop')}
              >
                  <ShoppingBag size={22} strokeWidth={activeTab === 'shop' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.7rem', fontWeight: activeTab === 'shop' ? 'bold' : 'normal' }}>Shop</span>
              </button>

              {/* Profil */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'settings' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('settings')}
              >
                  <User size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.7rem', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Profil</span>
              </button>
          </nav>
      )}

      {/* --- RENDER LAPORAN KESEHATAN SEBAGAI OVERLAY --- */}
      {showReportData && (
          <HealthReport 
            logs={showReportData.logs} 
            challengeTitle={showReportData.challengeTitle} 
            theme={currentTheme}
            user={overview?.user}
            onClose={() => setShowReportData(null)} 
          />
      )}

      {/* --- ALL MODALS --- */}
      {showTutorial && ( <div className="modal-overlay" onClick={closeTutorial}> <div className="modal-content" style={{background:'white', color:'black', textAlign:'center', padding:'2.5rem', maxWidth:'400px'}} onClick={e=>e.stopPropagation()}> <div style={{width:'60px', height:'60px', background: currentTheme.light, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem auto'}}> <Sparkles size={32} color={currentTheme.text}/> </div> <h2 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem'}}>Selamat Datang di Vitalyst!</h2> <div style={{textAlign:'left', fontSize:'0.95rem', color:'#475569', lineHeight:'1.6', marginBottom:'2rem'}}> <p style={{marginBottom:'0.8rem'}}>👋 Halo! Mari mulai perjalanan sehatmu:</p> <ul style={{listStyleType:'disc', paddingLeft:'1.5rem', marginBottom:'1rem'}}> <li style={{marginBottom:'0.5rem'}}>Ikuti <strong>Challenge Kesehatan</strong> selama 30 hari untuk membangun kebiasaan baik.</li> <li style={{marginBottom:'0.5rem'}}>Lakukan <strong>Check-in Harian</strong> untuk mencatat misimu.</li> <li style={{marginBottom:'0.5rem'}}>Kamu akan menerima <strong>WhatsApp Broadcast</strong> sebagai pengingat & motivasi.</li> <li>Konsultasikan keluhanmu dengan <strong>Dr. Alva</strong> kapan saja.</li> </ul> <p>Ayo buat kesehatanmu lebih terkontrol mulai hari ini!</p> </div> <button onClick={closeTutorial} style={{width:'100%', padding:'0.8rem', background: currentTheme.primary, color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Siap, Saya Mengerti!</button> </div> </div> )}
      {showPrivacy && ( <div className="modal-overlay" onClick={()=>setShowPrivacy(false)}> <div className="modal-content" style={{background: darkMode?'#1e293b':'white', color: darkMode?'white':'black', maxWidth:'500px', maxHeight:'80vh', overflowY:'auto'}} onClick={e=>e.stopPropagation()}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}> <h2 style={{fontSize:'1.3rem', fontWeight:'bold'}}>Kebijakan Privasi</h2> <button onClick={()=>setShowPrivacy(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24} color={darkMode?'white':'black'}/></button> </div> <div style={{lineHeight:'1.6', fontSize:'0.9rem', color: darkMode?'#cbd5e1':'#475569'}}> <p style={{marginBottom:'1rem'}}>Terakhir diperbarui: Januari 2026</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>1. Informasi yang Kami Kumpulkan</h4> <p style={{marginBottom:'1rem'}}>Kami mengumpulkan informasi seperti nama, nomor telepon (untuk verifikasi WhatsApp), dan data kesehatan yang Anda masukkan untuk personalisasi challenge.</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>2. Penggunaan Data</h4> <p style={{marginBottom:'1rem'}}>Data Anda digunakan untuk memantau progres kesehatan, mengirimkan pengingat misi harian, dan rekomendasi produk kesehatan yang relevan.</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>3. Keamanan Data</h4> <p style={{marginBottom:'1rem'}}>Kami menjaga kerahasiaan data Anda dan tidak akan membagikannya kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>4. Hubungi Kami</h4> <p>Jika ada pertanyaan mengenai privasi ini, silakan hubungi tim support kami.</p> </div> <button onClick={()=>setShowPrivacy(false)} style={{width:'100%', marginTop:'2rem', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', color:'black', fontWeight:'bold'}}>Tutup</button> </div> </div> )}
      {showCheckoutModal && selectedProduct && ( <div className="modal-overlay" onClick={()=>setShowCheckoutModal(false)}> <div className="modal-content" style={{background:'white', color:'black'}} onClick={e=>e.stopPropagation()}> <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Checkout</h3> <div style={{marginBottom:'1rem', display:'flex', gap:'0.5rem'}}> <button onClick={()=>handleMethodChange('jne')} style={{flex:1, padding:'0.6rem', border: shippingMethod==='jne' ? `2px solid ${currentTheme.primary}` : '1px solid #ccc', borderRadius:'8px', background: shippingMethod==='jne' ? '#f0fdf4' : 'white', fontWeight:'bold'}}>JNE (Kirim)</button> <button onClick={()=>handleMethodChange('pickup')} style={{flex:1, padding:'0.6rem', border: shippingMethod==='pickup' ? `2px solid ${currentTheme.primary}` : '1px solid #ccc', borderRadius:'8px', background: shippingMethod==='pickup' ? '#f0fdf4' : 'white', fontWeight:'bold'}}>Ambil di Toko</button> </div> {shippingMethod === 'jne' && ( <div style={{marginBottom:'1rem'}}> <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'0.5rem'}}><span>Kirim ke:</span><button onClick={()=>{setShowAddressModal(true)}} style={{color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}>+ Alamat Baru</button></div> <select onChange={e=>handleSelectAddrCheckout(e.target.value)} value={selectedAddrId} style={{width:'100%', padding:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}> <option value="" disabled>Pilih Alamat...</option> {addresses.map(a=><option key={a.id} value={a.id}>{a.label} - {a.address}</option>)} </select> {addresses.length === 0 && <p style={{fontSize:'0.8rem', color:'red', marginTop:'4px'}}>Belum ada alamat tersimpan.</p>} </div> )} <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem', color:'black'}}> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Harga</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Ongkir</span><span>Rp {shippingCost.toLocaleString()}</span></div> <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.2rem', marginTop:'0.5rem'}}><span>Total</span><span>Rp {(selectedProduct.price + shippingCost).toLocaleString()}</span></div> </div> <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}> <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', color:'black'}}>Batal</button> <button onClick={handleProcessPayment} style={{padding:'0.8rem', border:'none', background: currentTheme.primary, color:'white', borderRadius:'8px', fontWeight:'bold', cursor: 'pointer'}}>Bayar</button> </div> </div> </div> )}
      {showOrderHistory && ( <div className="modal-overlay" onClick={()=>setShowOrderHistory(false)}> <div className="modal-content" style={{background: darkMode?'#1e293b':'white', color: darkMode?'white':'black'}} onClick={e=>e.stopPropagation()}> <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Riwayat Pesanan</h3> {myOrders.length === 0 ? <p style={{color:'#64748b'}}>Belum ada pesanan.</p> : ( <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}> {myOrders.map(order => ( <div key={order.order_id} onClick={()=>handleOpenInvoice(order)} style={{padding:'1rem', border:'1px solid #e2e8f0', borderRadius:'12px', background: darkMode?'#334155':'#f8fafc', cursor:'pointer'}}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}> <span style={{fontSize:'0.8rem', fontWeight:'bold', color:currentTheme.text}}>{order.order_id}</span> <span style={{fontSize:'0.75rem', padding:'2px 8px', borderRadius:'10px', background: order.status==='paid'?'#dcfce7':'#fffbeb', color: order.status==='paid'?'#166534':'#d97706'}}>{order.status}</span> </div> <div style={{display:'flex', gap:'1rem'}}> <div style={{width:'50px', height:'50px', background:'white', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', border:'1px solid #eee'}}> {order.product_image ? <img src={`${BACKEND_URL}${order.product_image}`} style={{width:'100%'}}/> : <Package size={24}/>} </div> <div> <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{order.product_name}</div> <div style={{fontSize:'0.85rem'}}>Rp {order.amount.toLocaleString()}</div> </div> </div> </div> ))} </div> )} <button onClick={()=>setShowOrderHistory(false)} style={{width:'100%', marginTop:'1.5rem', padding:'0.8rem', border:'1px solid #ccc', background:'transparent', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black'}}>Tutup</button> </div> </div> )}
      {showInvoice && selectedInvoice && ( <div className="modal-overlay" onClick={()=>setShowInvoice(false)}> <div className="modal-content" style={{background:'white', color:'black', width:'100%', maxWidth:'400px'}} onClick={e=>e.stopPropagation()}> <div style={{textAlign:'center', marginBottom:'1.5rem', borderBottom:'1px dashed #ccc', paddingBottom:'1rem'}}> <h2 style={{fontWeight:'bold', fontSize:'1.5rem'}}>INVOICE</h2> <p style={{fontSize:'0.9rem', color:'#64748b'}}>VITALYST STORE</p> <p style={{fontSize:'0.8rem', color:'#94a3b8'}}>{selectedInvoice.date}</p> </div> <div style={{marginBottom:'1.5rem'}}> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> <span style={{color:'#64748b', fontSize:'0.9rem'}}>Order ID</span> <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>{selectedInvoice.order_id}</span> </div> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> <span style={{color:'#64748b', fontSize:'0.9rem'}}>Status</span> <span style={{fontWeight:'bold', fontSize:'0.9rem', textTransform:'uppercase'}}>{selectedInvoice.status}</span> </div> <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> <span style={{color:'#64748b', fontSize:'0.9rem'}}>Metode</span> <span style={{fontSize:'0.9rem'}}>{selectedInvoice.shipping_method}</span> </div> {selectedInvoice.resi && ( <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> <span style={{color:'#64748b', fontSize:'0.9rem'}}>Resi</span> <span style={{fontSize:'0.9rem', fontWeight:'bold'}}>{selectedInvoice.resi}</span> </div> )} </div> <div style={{borderTop:'1px solid #eee', borderBottom:'1px solid #eee', padding:'1rem 0', marginBottom:'1.5rem'}}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}> <span style={{fontSize:'0.9rem'}}>{selectedInvoice.product_name}</span> <span style={{fontSize:'0.9rem', fontWeight:'bold'}}>Rp {selectedInvoice.amount.toLocaleString()}</span> </div> </div> <button onClick={()=>setShowInvoice(false)} style={{width:'100%', padding:'0.8rem', background: currentTheme.primary, color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Tutup</button> </div> </div> )}
      {showAddressModal && ( <div className="modal-overlay" onClick={()=>setShowAddressModal(false)}> <div className="modal-content" style={{background:'white', color:'black'}} onClick={e=>e.stopPropagation()}> <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Alamat</h3> <input placeholder="Label (Rumah/Kantor)" onChange={e=>setNewAddr({...newAddr, label:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/> <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}> <input placeholder="Penerima" onChange={e=>setNewAddr({...newAddr, name:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/> <input placeholder="No HP" onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/> </div> <select onChange={handleProvChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Provinsi</option>{provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select> {newAddr.prov_id && <select onChange={handleCityChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Kota</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>} <textarea placeholder="Alamat Lengkap" onChange={e=>setNewAddr({...newAddr, address:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}></textarea> <input placeholder="Kode Pos" onChange={e=>setNewAddr({...newAddr, zip:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'1rem', border:'1px solid #ccc', borderRadius:'6px'}}/> <div style={{display:'flex', gap:'0.5rem'}}> <button onClick={handleSaveAddress} style={{flex:1, padding:'0.8rem', background:currentTheme.primary, border:'none', borderRadius:'8px', fontWeight:'bold', color:'white', cursor:'pointer'}}>Simpan</button> <button onClick={()=>setShowAddressModal(false)} style={{flex:1, padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', color:'black'}}>Batal</button> </div> </div> </div> )}
      {selectedArticle && ( <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={()=>setSelectedArticle(null)}> <div style={{background: darkMode?'#1e293b':'white', width:'90%', maxWidth:'600px', maxHeight:'80vh', overflowY:'auto', borderRadius:'16px', padding:'2rem', position:'relative', color: darkMode?'white':'black'}} onClick={e=>e.stopPropagation()}> <button onClick={()=>setSelectedArticle(null)} style={{position:'absolute', right:'1rem', top:'1rem', background:'none', border:'none', cursor:'pointer'}}><X size={24} color={darkMode?'white':'black'}/></button> <h2 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem', paddingRight:'2rem'}}>{selectedArticle.title}</h2> {selectedArticle.image_url && <img src={`${BACKEND_URL}${selectedArticle.image_url}`} style={{width:'100%', borderRadius:'8px', marginBottom:'1rem'}}/>} <div style={{lineHeight:'1.6', fontSize:'0.95rem', whiteSpace:'pre-line'}}>{selectedArticle.content}</div> </div> </div> )}
      {showQRModal && ( <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={()=>setShowQRModal(false)}> <div style={{background:'white', padding:'2rem', borderRadius:'16px', textAlign:'center'}} onClick={e=>e.stopPropagation()}> <h3 style={{fontWeight:'bold', marginBottom:'1rem', color:'black'}}>Kode Pertemanan</h3> <div style={{padding:'1rem', border:'1px solid #eee', borderRadius:'12px', display:'inline-block'}}> <QRCodeSVG value={`https://jagatetapsehat.com/add/${overview?.user?.referral_code}`} size={180} /> </div> <button onClick={()=>setShowQRModal(false)} style={{display:'block', width:'100%', marginTop:'1rem', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer'}}>Tutup</button> </div> </div> )}

      {/* --- MODAL BARU: LIMIT CHALLENGE --- */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={()=>setShowLimitModal(false)}>
            <div className="modal-content" style={{background: darkMode?'#1e293b':'white', color: darkMode?'white':'black', maxWidth:'400px'}} onClick={e=>e.stopPropagation()}>
                <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
                    <div style={{background: '#ffedd5', width:'50px', height:'50px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto'}}>
                        <AlertTriangle size={24} color="#ea580c"/>
                    </div>
                    <h3 style={{fontWeight:'bold', fontSize:'1.2rem', marginBottom:'0.5rem'}}>Slot Challenge Penuh!</h3>
                    <p style={{fontSize:'0.9rem', color: darkMode?'#cbd5e1':'#64748b'}}>
                        Kamu hanya bisa menjalankan maksimal 2 challenge sekaligus. Pause salah satu untuk memulai <b>{targetJoinChallenge?.title}</b>.
                    </p>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                    {activeChallenges.map(c => (
                        <div key={c.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', border: darkMode?'1px solid #334155':'1px solid #e2e8f0', padding:'0.8rem', borderRadius:'8px'}}>
                            <span style={{fontSize:'0.9rem', fontWeight:'500'}}>{c.title}</span>
                            <button onClick={() => handlePauseFromModal(c.id)} style={{fontSize:'0.8rem', padding:'4px 10px', background:'#f1f5f9', borderRadius:'6px', border:'none', color:'black', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
                                <Pause size={12}/> Pause
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowLimitModal(false)} style={{width:'100%', marginTop:'1.5rem', padding:'0.8rem', border:'1px solid #ccc', background:'transparent', borderRadius:'8px', cursor:'pointer', color: darkMode?'white':'black'}}>Batal</button>
            </div>
        </div>
      )}

      {/* --- MODAL BARU: QUIZ --- */}
      {showQuizModal && (
        <div className="modal-overlay">
            <div className="modal-content" style={{background: darkMode?'#1e293b':'white', color: darkMode?'white':'black', height:'80vh', display:'flex', flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
                <div style={{marginBottom:'1rem'}}>
                    <h3 style={{fontWeight:'bold', fontSize:'1.1rem'}}>Kuis Penentuan Tipe</h3>
                    <div style={{height:'4px', background:'#e2e8f0', borderRadius:'2px', marginTop:'0.8rem'}}>
                        <div style={{height:'100%', background: currentTheme.primary, width: `${((currentQuizIdx+1)/quizQuestions.length)*100}%`, transition:'width 0.3s ease'}}></div>
                    </div>
                </div>
                <div style={{flex:1, overflowY:'auto'}}>
                    <h4 style={{fontSize:'1.1rem', fontWeight:'600', marginBottom:'1.5rem'}}>{quizQuestions[currentQuizIdx]?.question_text}</h4>
                    <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                        {quizQuestions[currentQuizIdx]?.options.map((opt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleQuizAnswer(opt.category)}
                                style={{
                                    padding:'1rem', textAlign:'left', border: darkMode?'1px solid #334155':'1px solid #e2e8f0', 
                                    background: darkMode?'#0f172a':'white', borderRadius:'12px', cursor:'pointer', color: darkMode?'white':'black',
                                    transition:'background 0.2s'
                                }}
                                onMouseEnter={(e)=>e.currentTarget.style.borderColor = currentTheme.primary}
                                onMouseLeave={(e)=>e.currentTarget.style.borderColor = darkMode?'#334155':'#e2e8f0'}
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => setShowQuizModal(false)} style={{marginTop:'1rem', padding:'0.8rem', background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer'}}>Batalkan</button>
            </div>
        </div>
      )}

      {/* --- MODAL BARU: AI SUMMARY --- */}
      {showAiSummaryModal && (
        <div className="modal-overlay">
            <div className="modal-content" style={{background: darkMode?'#1e293b':'white', color: darkMode?'white':'black', textAlign:'center', maxWidth:'400px'}} onClick={e=>e.stopPropagation()}>
                <div style={{width:'70px', height:'70px', background: currentTheme.light, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem auto'}}>
                    <Trophy size={36} color={currentTheme.text}/>
                </div>
                <h3 style={{fontWeight:'bold', fontSize:'1.3rem', marginBottom:'0.5rem'}}>Kamu Siap!</h3>
                <p style={{marginBottom:'1.5rem', fontSize:'0.9rem', color: darkMode?'#cbd5e1':'#64748b'}}>Berdasarkan jawabanmu, program ini telah disesuaikan.</p>
                
                <div style={{background: darkMode?'#0f172a':'#eff6ff', padding:'1rem', borderRadius:'12px', border:`1px solid ${darkMode?'#334155':'#dbeafe'}`, marginBottom:'2rem', textAlign:'left'}}>
                    <div style={{display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                        <Bot size={20} color={currentTheme.text} style={{marginTop:'2px', flexShrink:0}}/>
                        <div style={{fontStyle:'italic', fontSize:'0.9rem', color: darkMode?'#e2e8f0':'#1e40af'}}>"{aiSummaryResult}"</div>
                    </div>
                </div>

                <button 
                    onClick={() => { setShowAiSummaryModal(false); fetchData(); }}
                    style={{width:'100%', padding:'0.9rem', background: currentTheme.primary, color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem'}}
                >
                    Mulai Program Sekarang
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
