import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, Users, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, 
  Package, ShoppingBag, ChevronLeft, Clock, CheckCircle, Calendar, RefreshCw, FileText,
  Camera, Bot, Sparkles, MapPin, Truck, Plus, Check, Bell, Edit2, Send, X, Loader,
  MessageSquareQuote, ShoppingCart, Play, Pause, Square, Target, TrendingUp, Zap, 
  Home, BookOpen, Shield, Trophy, AlertTriangle, Flame, MessageCircle, Map, Receipt, CheckSquare
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import HealthReport from './HealthReport';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#22c55e', light: '#dcfce7', text: '#14532d', cardGradient: 'linear-gradient(135deg, #22c55e 0%, #14532d 100%)', gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #14532d 100%)' },
  red: { id: 'red', name: 'Merah Berani', primary: '#ef4444', light: '#fee2e2', text: '#7f1d1d', cardGradient: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)', gradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' },
  gold: { id: 'gold', name: 'Emas Mewah', primary: '#f59e0b', light: '#fef3c7', text: '#78350f', cardGradient: 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)', gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #78350f 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#3b82f6', light: '#dbeafe', text: '#1e3a8a', cardGradient: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' },
  purple: { id: 'purple', name: 'Ungu Misteri', primary: '#a855f7', light: '#f3e8ff', text: '#581c87', cardGradient: 'linear-gradient(135deg, #a855f7 0%, #581c87 100%)', gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #581c87 100%)' },
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
  const [showReportData, setShowReportData] = useState(null); 

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

  // --- SINKRONISASI CEKLIST DARI HISTORY ---
  useEffect(() => {
    if (allDailyData.length > 0 && checkinHistory.length > 0) {
        allDailyData.forEach(daily => {
            const logToday = checkinHistory.find(log => 
                log.challenge_id === daily.challenge_id && 
                log.day == daily.day 
            );

            if (logToday && logToday.chosen_option) {
                const savedTasks = logToday.chosen_option.split(', ');
                setSelectedTasksMap(prev => {
                    if (!prev[daily.challenge_id]) {
                        return { ...prev, [daily.challenge_id]: savedTasks };
                    }
                    return prev;
                });
            }
        });
    }
  }, [allDailyData, checkinHistory]);

  useEffect(() => {
      if (activeChallenges.length > 0) {
          fetchAllDailyContents();
      } else {
          setDailyLoading(false);
      }
  }, [activeChallenges]);

  useEffect(() => { if (activeTab === 'friends') fetchFriendsList(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'shop') fetchOrders(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'chat') setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 300); }, [activeTab, chatHistory]);

  const handleTouchStart = (e) => { if (mainContentRef.current.scrollTop === 0) startY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => { if (startY.current === 0) return; const currentY = e.touches[0].clientY; const diff = currentY - startY.current; };
  const handleTouchEnd = async (e) => {
      const currentY = e.changedTouches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 100 && mainContentRef.current.scrollTop === 0 && !refreshing && activeTab === 'dashboard') {
          setRefreshing(true);
          const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
          setMotivationText(randomMotivation);
          await Promise.all([fetchData(), fetchAllDailyContents(), fetchArticles(), fetchCheckinHistory()]);
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
    
  const handleSendChat = async (e) => { e.preventDefault(); if(!chatMessage.trim()) return; const msg = chatMessage; setChatHistory(p => [...p, {role:"user", content:msg}]); setChatMessage(""); setChatLoading(true); try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()}); setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]); } catch (e) { setChatHistory(p => [...p, {role:"assistant", content:"Error koneksi."}]); } finally { setChatLoading(false); } };
  const copyReferral = () => { navigator.clipboard.writeText(overview?.user?.referral_code || ""); alert("Disalin!"); };
    
  // --- LOGIC CHECKLIST BARU ---
  const toggleTaskSelection = (challengeId, task) => {
    const currentTasks = selectedTasksMap[challengeId] || [];
    let newTasks;
    if (currentTasks.includes(task)) { 
        newTasks = currentTasks.filter(t => t !== task); 
    } else { 
        newTasks = [...currentTasks, task]; 
    }
    setSelectedTasksMap(prev => ({ ...prev, [challengeId]: newTasks }));
  };

  const handleJournalChange = (challengeId, text) => { setJournalsMap(prev => ({ ...prev, [challengeId]: text })); };

  // --- LOGIC SIMPAN / COMPLETE ---
  const handleSubmitCheckin = async (challengeId, type) => { 
      if(isSubmitting) return; 
      
      const tasks = selectedTasksMap[challengeId] || [];
      const journal = journalsMap[challengeId] || "";
      
      const statusToSend = type === 'save' ? 'progress' : 'completed';
      
      if (tasks.length === 0) { alert("Pilih minimal 1 aktivitas."); return; }
      
      setIsSubmitting(true); 
      try { 
          await axios.post(`${BACKEND_URL}/api/checkin`, { 
              journal: journal, 
              status: statusToSend, 
              completed_tasks: tasks, 
              challenge_id: challengeId 
          }, {headers:getAuthHeader()}); 
          
          if(statusToSend === 'completed') { alert("Luar biasa! Hari ini tuntas."); }
          else { alert("Progress tersimpan."); }
          
          fetchAllDailyContents(); 
          fetchData(); 
          fetchCheckinHistory(); 
      } catch(e){ 
          alert(e.response?.data?.message || "Gagal check-in."); 
      } finally { 
          setIsSubmitting(false); 
      } 
  };
    
  const handleChallengeAction = async (id, action) => {
      if(action === 'stop' && !window.confirm(`Yakin ingin ${action} challenge ini?`)) return;
      try {
          await axios.post(`${BACKEND_URL}/api/user/challenge/action`, { challenge_id: id, action: action }, { headers: getAuthHeader() });
          fetchData(); 
      } catch(e) { alert("Gagal update status"); }
  };

  // --- NAVIGASI KE PENJELASAN TUGAS ---
  const handleOpenExplanation = (dailyData) => {
    navigate('/dashboard/task-explanation', { 
        state: { 
            tasks: dailyData.tasks, 
            challengeTitle: dailyData.challenge_title, 
            day: dailyData.day 
        } 
    });
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
    
  const openCheckout = async (product) => { 
      setSelectedProduct(product); 
      setShippingCost(0); 
      setShippingMethod("jne"); 
      setAppliedCoupon(null); 
      setCouponCode(""); 
      setShowCheckoutModal(true); 
      
      try { 
          const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); 
          const savedAddresses = res.data;
          setAddresses(savedAddresses); 
          
          if (savedAddresses.length > 0) { 
              handleSelectAddrCheckout(savedAddresses[0].id); 
          } else { 
              setSelectedAddrId(""); 
          } 
      } catch(e) {
          console.error(e);
      } 
  };

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
  const badgeStyle = { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backdropFilter:'blur(4px)', border: '1px solid rgba(255,255,255,0.4)' };
    
  const ShopBanner = () => (
      <div style={{ marginBottom: '2rem', position:'relative', borderRadius: '24px', overflow:'hidden', boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ background: currentTheme.cardGradient, padding: '2.5rem 2rem', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div> <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom:'0.5rem', letterSpacing:'-0.5px' }}>Belanja Sehat, Hidup Kuat</h2> <p style={{ opacity: 0.9 }}>Suplemen herbal terbaik untuk pencernaan Anda.</p> </div>
              <div style={{ background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'50%' }}> <ShoppingBag size={48} color="white"/> </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'white', borderTop:'1px solid #eee' }}>
              <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color: currentTheme.text }}> <MapPin size={18}/> Alamat Saya </button>
              <button onClick={()=>{fetchOrders(); setShowOrderHistory(true)}} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color: currentTheme.text }}> <Receipt size={18}/> Status Pesanan </button>
          </div>
      </div>
  );

  // --- RENDER CHALLENGE CARD ---
  const renderDailyCard = (data) => {
      const isCompleted = data.today_status === 'completed';
      const selected = selectedTasksMap[data.challenge_id] || [];
      const journal = journalsMap[data.challenge_id] || "";
      const totalTasks = data.tasks?.length || 0;
      const tasksDoneCount = selected.length;
      const allChecked = tasksDoneCount === totalTasks && totalTasks > 0;

      return (
          <Card key={data.challenge_id} className="gym-card" style={{ marginBottom: '1.5rem', background: darkMode ? '#1e293b' : 'white', border: 'none', borderRadius:'24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <CardHeader style={{paddingBottom:'0.5rem', background: 'transparent'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div style={{display:'flex', flexDirection:'column'}}>
                        <span style={{fontSize:'0.75rem', fontWeight:'800', textTransform:'uppercase', color: currentTheme.primary, letterSpacing:'1px'}}>Daily Challenge</span>
                        <CardTitle className="heading-3" style={{fontSize: '1.2rem', color: darkMode?'white':'#0f172a', fontWeight:'800'}}> 
                           {data.challenge_title} <span style={{fontWeight:'normal', fontSize:'1rem', color:'#94a3b8'}}>| Hari {data.day}</span>
                        </CardTitle>
                      </div>
                      {isCompleted && <div style={{width:'40px', height:'40px', background:currentTheme.light, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><CheckCircle size={24} color={currentTheme.primary} fill={currentTheme.light}/></div>}
                  </div>
              </CardHeader>
              <CardContent style={{paddingTop:'1rem'}}>
                  {data.fact && (
                      <div style={{ background: darkMode ? '#334155' : currentTheme.light, padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', display:'flex', gap:'10px' }}>
                          <Zap size={20} color={currentTheme.primary} fill={currentTheme.primary} style={{flexShrink:0}}/>
                          <p style={{ fontSize: '0.9rem', color: darkMode ? '#e2e8f0' : currentTheme.text, fontWeight:'500', lineHeight:'1.5' }}>"{data.fact}"</p>
                      </div>
                  )}

                  {isCompleted ? (
                      <div style={{textAlign:'center', padding:'2rem', background: darkMode ? 'rgba(22, 101, 52, 0.2)' : '#f0fdf4', borderRadius:'20px', color: darkMode ? '#86efac' : '#166534', border: `1px dashed ${currentTheme.primary}`}}>
                          <Flame size={48} color={currentTheme.primary} style={{margin:'0 auto 0.5rem auto'}} />
                          <h3 style={{fontSize:'1.3rem', fontWeight:'900'}}>Misi Tuntas!</h3>
                          <p style={{marginTop:'0.5rem'}}>Luar biasa! Konsistensi adalah kunci.</p>
                          {data.ai_feedback && <div style={{marginTop:'1rem', fontStyle:'italic', fontSize:'0.85rem', background:'rgba(255,255,255,0.5)', padding:'8px', borderRadius:'8px'}}>"{data.ai_feedback}"</div>}
                          
                          {/* Tombol Lihat Penjelasan Tetap Ada */}
                          <button onClick={() => handleOpenExplanation(data)} style={{marginTop:'1rem', background:'transparent', border:'none', color: currentTheme.primary, fontWeight:'bold', cursor:'pointer', fontSize:'0.85rem', textDecoration:'underline'}}>
                             Lihat Penjelasan Tugas Tadi
                          </button>
                      </div>
                  ) : (
                      <>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                            <p style={{fontWeight:'700', fontSize:'0.95rem', color: darkMode?'#cbd5e1':'#64748b', textTransform:'uppercase', letterSpacing:'0.5px'}}>Target Hari Ini:</p>
                            <span style={{fontSize:'0.8rem', background: '#f1f5f9', padding:'2px 8px', borderRadius:'10px', color:'#64748b'}}>{tasksDoneCount}/{totalTasks} Selesai</span>
                          </div>

                          <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                              {data.tasks?.map((task, idx) => {
                                  const isSelected = selected.includes(task);
                                  return (
                                      <div key={idx} onClick={() => toggleTaskSelection(data.challenge_id, task)} 
                                        style={{ 
                                            padding:'1rem', borderRadius:'16px', 
                                            border: isSelected ? `2px solid ${currentTheme.primary}` : (darkMode ? '1px solid #334155' : '1px solid #e2e8f0'), 
                                            background: isSelected ? (darkMode ? 'rgba(34, 197, 94, 0.1)' : currentTheme.light) : (darkMode ? '#1e293b' : 'white'), 
                                            cursor:'pointer', display:'flex', alignItems:'center', gap:'1rem', transition:'all 0.2s', 
                                            color: darkMode ? 'white' : '#0f172a',
                                            opacity: isSelected ? 0.7 : 1 
                                        }}>
                                          <div style={{ 
                                              width:'26px', height:'26px', borderRadius:'8px', 
                                              border:`2px solid ${isSelected ? currentTheme.primary : '#cbd5e1'}`, 
                                              background: isSelected ? currentTheme.primary : 'transparent', 
                                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0, color: 'white',
                                              transition: 'all 0.2s'
                                          }}> 
                                              {isSelected && <Check size={18} strokeWidth={4}/>} 
                                          </div>
                                          <span style={{
                                              fontSize:'1rem', 
                                              fontWeight: isSelected ? '500' : '500',
                                              textDecoration: isSelected ? 'line-through' : 'none', 
                                              color: isSelected ? (darkMode ? '#94a3b8' : '#64748b') : 'inherit'
                                          }}>{task}</span>
                                      </div>
                                  );
                              })}
                          </div>
                            
                          <textarea value={journal} onChange={(e) => handleJournalChange(data.challenge_id, e.target.value)} placeholder={`Catat perasaanmu setelah latihan...`} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: 'none', background: darkMode ? '#0f172a' : '#f1f5f9', marginTop:'1.5rem', color: darkMode ? 'white' : 'black', fontFamily:'inherit', fontSize:'0.95rem', resize:'vertical', minHeight:'80px' }} ></textarea>
                            
                          <div style={{ marginTop: '1.5rem', display:'flex', gap:'1rem', flexDirection: 'column' }}>
                              {/* LOGIKA TOMBOL */}
                              {allChecked ? (
                                  <button onClick={() => handleSubmitCheckin(data.challenge_id, 'complete')} disabled={isSubmitting} style={{ width:'100%', background: currentTheme.primary, color: 'white', border: 'none', padding: '1rem', borderRadius: '30px', fontWeight: '800', fontSize:'1rem', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition:'all 0.2s' }}> 
                                      {isSubmitting ? <RefreshCw className="animate-spin" size={20}/> : <CheckCircle size={20}/>} SELESAI / COMPLETE WORKOUT
                                  </button>
                              ) : (
                                  <div style={{display:'flex', gap:'10px'}}>
                                      {/* TOMBOL SIMPAN PROGRESS */}
                                      <button onClick={() => handleSubmitCheckin(data.challenge_id, 'save')} disabled={isSubmitting || tasksDoneCount === 0} style={{ flex:1, background: tasksDoneCount > 0 ? '#3b82f6' : '#cbd5e1', color: 'white', border: 'none', padding: '1rem', borderRadius: '30px', fontWeight: '800', fontSize:'0.9rem', cursor: tasksDoneCount > 0 ? 'pointer' : 'not-allowed', display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}> 
                                          {isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : <CheckSquare size={18}/>} SIMPAN PROGRESS
                                      </button>
                                      
                                      {/* TOMBOL PENJELASAN TUGAS (BARU) */}
                                      <button onClick={() => handleOpenExplanation(data)} style={{ flex:1, background: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '1rem', borderRadius: '30px', fontWeight: '700', fontSize:'0.9rem', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem' }}>
                                          <BookOpen size={18}/> Info Tugas
                                      </button>
                                  </div>
                              )}
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
      <style>{`<br>        header:not(.dashboard-header), .navbar, .site-header, #header, nav.navbar { display: none !important; }<br>        body { padding-top: 0 !important; margin-top: 0 !important; }<br>        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; --theme-gradient: ${currentTheme.gradient}; --theme-light: ${currentTheme.light}; }<br>        .dark { --theme-gradient: ${currentTheme.darkGradient}; }<br>        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; font-weight: 500; }<br>        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 700; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }<br>        
        
        /* UPDATED MODAL CSS */
        .modal-overlay { 
            position: fixed; 
            inset: 0; 
            background: rgba(0,0,0,0.6); 
            backdrop-filter: blur(4px);
            display: flex; 
            align-items: center; 
            justify-content: center; 
            z-index: 99999; 
            padding: 1rem; 
        }
        .modal-content { 
            background: ${darkMode ? '#1e293b' : 'white'}; 
            padding: 2rem; 
            border-radius: 24px; 
            max-width: 500px; 
            width: 100%; 
            max-height: 90vh; 
            overflow-y: auto; 
            color: ${darkMode ? 'white' : 'black'}; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            position: relative; /* Added relative positioning for absolute children */
        }
        
        /* GYM STYLE ELEMENTS */
        .gym-card:hover {
            transform: translateY(-2px);
            transition: transform 0.3s ease;
        }
        .progress-bar-capsule {
            height: 12px;
            background: #e2e8f0;
            border-radius: 999px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            border-radius: 999px;
            background: ${currentTheme.primary};
            box-shadow: 0 0 10px ${currentTheme.primary};
            transition: width 0.5s ease-in-out;
        }
      `}</style>

      {isDesktop && (
      <aside style={{ width: '280px', background: darkMode ? '#1e293b' : 'white', borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', height: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 20 }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: 'none' }}> <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: currentTheme.primary, letterSpacing:'-1px', display:'flex', alignItems:'center', gap:'8px' }}><Activity fill={currentTheme.primary}/> VITALYST</h2> </div>
        <nav style={{ padding: '1rem 1.5rem', flex: 1, overflowY: 'auto' }}>
          <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#94a3b8', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'1px'}}>Menu Utama</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button className={`nav-item ${activeTab==='dashboard'?'active':''}`} onClick={() => handleNavClick('dashboard')}><Activity size={20}/> Dashboard</button></li>
            <li><button className={`nav-item ${activeTab==='shop'?'active':''}`} onClick={() => handleNavClick('shop')}><ShoppingBag size={20}/> Belanja Sehat</button></li>
            <li><button className={`nav-item ${activeTab==='friends'?'active':''}`} onClick={() => handleNavClick('friends')}><Users size={20}/> Teman Sehat</button></li>
            <li><button className={`nav-item ${activeTab==='chat'?'active':''}`} onClick={() => handleNavClick('chat')}><Bot size={20}/> Dr. Alva AI</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={() => handleNavClick('settings')}><Settings size={20}/> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}><button onClick={logout} className="nav-item" style={{ color: '#ef4444', justifyContent:'center', background: '#fef2f2', fontWeight:'bold' }}><LogOut size={20} /> Keluar</button></div>
      </aside>
      )}

      <div ref={mainContentRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', paddingBottom: isDesktop ? 0 : '80px', background: darkMode ? '#0f172a' : '#f8fafc' }}>
        {!isDesktop && <header className="dashboard-header" style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display:'flex', justifyContent:'space-between', background: darkMode?'#1e293b':'white', position: 'sticky', top: 0, zIndex: 50 }}>
            <span style={{fontWeight:'900', fontSize:'1.2rem', color: currentTheme.primary, display:'flex', alignItems:'center', gap:'5px'}}><Activity size={20} fill={currentTheme.primary}/> VITALYST</span>
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

        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '2rem', marginTop: isDesktop ? 0 : '0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                    <p className="body-medium" style={{ color: '#64748b', fontSize:'0.9rem', fontWeight:'500' }}>{getGreeting()},</p>
                    <h1 style={{fontSize:'1.8rem', fontWeight:'900', color: darkMode?'white':'#0f172a'}}>{overview?.user?.name}</h1>
                </div>
                {isDesktop && (
                    <div style={{position:'relative'}}>
                        <button onClick={()=>setShowNotifDropdown(!showNotifDropdown)} style={{background:'white', border:'1px solid #e2e8f0', cursor:'pointer', position:'relative', padding:'10px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                            <Bell size={22} color={currentTheme.text}/>
                            {overview?.notifications?.length > 0 && <span style={{position:'absolute', top:8, right:10, width:'8px', height:'8px', background:'red', borderRadius:'50%'}}></span>}
                        </button>
                        {showNotifDropdown && (
                            <div style={{position:'absolute', top:'120%', right:0, width:'300px', background: darkMode?'#334155':'white', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', borderRadius:'16px', padding:'1rem', zIndex:100, border: '1px solid #e2e8f0'}}>
                                <h4 style={{fontWeight:'bold', marginBottom:'0.8rem', fontSize:'0.9rem', color: darkMode?'white':'black'}}>Notifikasi</h4>
                                {overview?.notifications?.length > 0 ? (
                                    <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                                            {overview.notifications.map((n, i) => (
                                                <div key={i} style={{fontSize:'0.85rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem'}}>
                                                    <div style={{fontWeight:'bold', color: currentTheme.text}}>{n.title}</div>
                                                    <div style={{color: darkMode?'#cbd5e1':'#64748b'}}>{n.message}</div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (<div style={{fontSize:'0.85rem', color:'#94a3b8'}}>Belum ada notifikasi baru.</div>)}
                            </div>
                        )}
                    </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr', gap: isDesktop ? '1.5rem' : '1rem', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* --- CARD PROFILE (GYM MEMBER STYLE) --- */}
                  <Card style={{ border: 'none', borderRadius: '24px', background: currentTheme.cardGradient, color: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', overflow: 'hidden', position:'relative', minHeight:'180px' }}>
                    <div style={{position:'absolute', top:'-20px', right:'-20px', width:'150px', height:'150px', background:'rgba(255,255,255,0.1)', borderRadius:'50%'}}></div>
                    <div style={{position:'absolute', bottom:'-40px', left:'-20px', width:'200px', height:'200px', background:'rgba(255,255,255,0.05)', borderRadius:'50%'}}></div>
                    
                    <CardContent style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position:'relative', zIndex:1 }}>
                      <div style={{ position: 'relative' }}>
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter:'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.5)', boxShadow:'0 4px 10px rgba(0,0,0,0.2)' }}>
                              {overview?.user?.profile_picture ? ( <img src={`${BACKEND_URL}${overview.user.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> ) : ( <User size={40} color="white" /> )}
                          </div>
                          <button onClick={() => setActiveTab('settings')} style={{ position: 'absolute', bottom: '0', right: '-5px', background: 'white', borderRadius: '50%', padding: '6px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}> <Edit2 size={14} color={currentTheme.text} /> </button>
                      </div>
                      <div style={{flex:1}}> 
                          <h2 className="heading-2" style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '900', textShadow:'0 2px 4px rgba(0,0,0,0.1)' }}>{overview?.user?.name}</h2> 
                          <div style={badgeStyle}><Medal size={14} /> {overview?.user?.badge || "Pejuang Tangguh"}</div> 
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                      {dailyLoading ? (
                          <div style={{textAlign:'center', padding:'3rem', background: darkMode?'#1e293b':'white', borderRadius:'24px'}}>
                              <Loader className="animate-spin" size={32} color={currentTheme.text} style={{margin:'0 auto'}}/>
                              <p style={{marginTop:'1rem', fontSize:'0.9rem'}}>Menyiapkan Program Latihan...</p>
                          </div>
                      ) : allDailyData.length === 0 ? (
                          <Card style={{ padding:'2rem', textAlign:'center', background: darkMode?'#1e293b':'white', borderRadius:'24px' }}>
                              <p style={{color:'#64748b'}}>Kamu belum mengikuti challenge apapun.</p>
                              <p style={{fontSize:'0.8rem', marginTop:'0.5rem'}}>Pilih rekomendasi di bawah untuk mulai!</p>
                          </Card>
                      ) : (
                          allDailyData.map(data => renderDailyCard(data))
                      )}
                  </div>

                  <Card style={{ background: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius:'24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <CardHeader>
                        <CardTitle className="heading-3" style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.1rem', fontWeight:'800'}}>
                            <TrendingUp size={20} /> PROGRESS SAYA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeChallenges.length === 0 ? (
                            <p style={{fontSize:'0.9rem', color:'#64748b'}}>Belum ada challenge yang diikuti.</p>
                        ) : (
                            <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                                {activeChallenges.map(chal => (
                                    <div key={chal.id} style={{ padding:'0', background: 'transparent', cursor: 'default' }}>
                                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.8rem', alignItems:'center'}}>
                                                <div>
                                                    <div style={{fontWeight:'800', fontSize:'1rem', color: darkMode?'white':'#0f172a'}}>{chal.title}</div>
                                                    <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'2px'}}>Target 30 Hari</div>
                                                </div>
                                                <span style={{fontSize:'0.8rem', padding:'4px 12px', borderRadius:'20px', background: chal.status==='active'?currentTheme.light:'#fee2e2', color: chal.status==='active'?currentTheme.text:'#991b1b', fontWeight:'700', textTransform:'uppercase'}}>
                                                    {chal.status}
                                                </span>
                                            </div>
                                            
                                            <div className="progress-bar-capsule" style={{marginBottom:'0.8rem', background: darkMode?'#334155':'#f1f5f9'}}>
                                                <div className="progress-fill" style={{width:`${chal.progress}%`}}></div>
                                            </div>
                                            
                                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#64748b', marginBottom:'1.5rem'}}>
                                                <span style={{fontWeight:'700', color: currentTheme.primary}}>{chal.progress}% Completed</span>
                                                <span>{30 - chal.day} hari tersisa</span>
                                            </div>

                                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                                <div style={{background: darkMode?'#334155':'#f8fafc', padding:'10px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
                                                    <CheckCircle size={16} color={currentTheme.primary}/>
                                                    <span style={{fontSize:'0.8rem', fontWeight:'600'}}>{chal.completed || 0} Selesai</span>
                                                </div>
                                                <div style={{background: darkMode?'#334155':'#f8fafc', padding:'10px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
                                                    <X size={16} color="#ef4444"/>
                                                    <span style={{fontSize:'0.8rem', fontWeight:'600'}}>{chal.missed || 0} Missed</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{marginTop:'1rem', display:'flex', gap:'10px'}}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleOpenReport(chal); }}
                                                    style={{ flex:1, padding:'10px', borderRadius:'12px', background: darkMode?'#0f172a':'white', border:`1px solid ${darkMode?'#334155':'#e2e8f0'}`, fontWeight:'700', fontSize:'0.8rem', cursor:'pointer', color: darkMode?'white':'black' }}
                                                >
                                                    Lihat Laporan
                                                </button>
                                                <button onClick={()=>handleChallengeAction(chal.id, chal.status === 'active' ? 'pause' : 'resume')} style={{padding:'10px 14px', borderRadius:'12px', background: darkMode?'#0f172a':'white', border:`1px solid ${darkMode?'#334155':'#e2e8f0'}`, cursor:'pointer', color: darkMode?'white':'black'}}>
                                                    {chal.status === 'active' ? <Pause size={16}/> : <Play size={16}/>}
                                                </button>
                                            </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                  </Card>
                </div>
                  
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  
                  {/* ARTIKEL KESEHATAN (Moved to Right Column) */}
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border:'none', borderRadius:'24px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)', height:'fit-content' }}>
                      <div style={{padding:'1.5rem', borderBottom:`1px solid ${darkMode?'#334155':'#f1f5f9'}`}}>
                        <h3 style={{fontWeight:'800', display:'flex', alignItems:'center', gap:'8px', fontSize:'1.1rem'}}><BookOpen size={20}/> ARTIKEL TERBARU</h3>
                      </div>
                      <div style={{padding:'1rem'}}>
                        {articles.map(article => ( <div key={article.id} onClick={() => setSelectedArticle(article)} style={{ display:'flex', gap:'1rem', padding:'1rem', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius:'16px', marginBottom:'0.8rem', cursor:'pointer', border: 'none', alignItems:'center' }}> <div style={{width:'50px', height:'50px', background: currentTheme.light, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}> <FileText size={24} color={currentTheme.text}/> </div> <div style={{flex:1}}> <h4 style={{fontWeight:'700', fontSize:'0.95rem', color: darkMode ? 'white' : '#1e293b', marginBottom:'0.2rem', lineHeight:'1.3'}}>{article.title}</h4> <p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', display:'flex', alignItems:'center', gap:'4px' }}> <Clock size={12}/> {Math.ceil((article.content?.split(' ').length || 0)/200)} min baca </p> </div> <ChevronRight size={18} color="#94a3b8"/> </div> ))}
                      </div>
                  </Card>

                  {recommendedChallenges.length > 0 && (
                      <div style={{marginTop:'1rem'}}>
                          <h3 style={{fontSize:'1.1rem', fontWeight:'800', marginBottom:'1rem', color: darkMode?'white':'black', display:'flex', alignItems:'center', gap:'8px'}}>
                            <Target size={20}/> REKOMENDASI PROGRAM
                          </h3>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem'}}>
                              {recommendedChallenges.map(rec => (
                                  <Card key={rec.id} style={{background: darkMode?'#1e293b':'white', border:'none', borderRadius:'20px', overflow:'hidden', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                      <div style={{height:'100px', background: currentTheme.gradient, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                          <Trophy size={36} color={currentTheme.text} style={{opacity:0.6}}/>
                                      </div>
                                      <div style={{padding:'1.2rem'}}>
                                          <h4 style={{fontWeight:'800', fontSize:'1rem', marginBottom:'0.5rem', color: darkMode?'white':'#0f172a'}}>{rec.title}</h4>
                                          <button onClick={()=>initiateJoinChallenge(rec)} style={{ width:'100%', marginTop:'0.5rem', background: 'black', border:'none', padding:'10px', borderRadius:'12px', color: 'white', fontSize:'0.8rem', fontWeight:'bold', cursor: 'pointer' }}>
                                              {activeChallenges.length >= 2 ? "Slot Penuh" : "Mulai Program"}
                                          </button>
                                      </div>
                                  </Card>
                              ))}
                          </div>
                      </div>
                  )}

                  <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                      <div style={{ background: darkMode ? '#334155' : 'white', padding: '1.5rem 2rem', borderRadius: '24px', display: 'inline-block', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}>
                          <p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', marginBottom: '0.5rem', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:'700' }}>Kode Referral Anda</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                              <span style={{ fontSize: '2rem', fontWeight: '900', color: currentTheme.primary, letterSpacing: '4px', fontFamily:'monospace' }}>{overview?.user?.referral_code || '-'}</span>
                              <button onClick={copyReferral} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding:'8px', borderRadius:'8px', display:'flex', alignItems:'center' }}> <Copy size={18} color="#475569" /> </button>
                              <button onClick={()=>setShowQRModal(true)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding:'8px', borderRadius:'8px', display:'flex', alignItems:'center' }}> <QrCode size={20} color="#475569" /> </button>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
              {motivationText && ( <div style={{marginTop:'2rem', textAlign:'center', padding:'1rem', fontWeight:'600', color: darkMode?'#cbd5e1':'#64748b', animation:'fadeIn 0.5s ease', fontStyle:'italic'}}> "{motivationText}" </div> )}
            </>
          )}

          {activeTab === 'chat' && (
              <div style={{ display:'flex', flexDirection:'column', height:'100%', maxWidth:'800px', margin:'0 auto', width:'100%' }}>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}> 
                      <button onClick={() => handleNavClick('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Home</button> 
                  </div>
                  <Card style={{ flex:1, display:'flex', flexDirection:'column', borderRadius:'24px', border:'none', boxShadow:'0 10px 25px rgba(0,0,0,0.08)', background: darkMode ? '#1e293b' : 'white', overflow:'hidden' }}>
                      {/* Chat Header */}
                      <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${darkMode?'#334155':'#f1f5f9'}`, display: 'flex', alignItems: 'center', gap: '1rem', background: currentTheme.gradient }}>
                        <div style={{ width: '45px', height: '45px', background: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0, boxShadow:'0 4px 10px rgba(0,0,0,0.1)' }}> 
                            <Bot size={28} color={currentTheme.text} /> 
                        </div>
                        <div> 
                            <h3 style={{ fontWeight: '800', fontSize: '1.2rem', color: currentTheme.text, marginBottom:'2px', display:'flex', alignItems:'center', gap:'6px' }}> 
                                Dr. Alva <div style={{width:'8px', height:'8px', background:'#22c55e', borderRadius:'50%', boxShadow:'0 0 5px #22c55e'}}></div> 
                            </h3> 
                            <p style={{ fontSize: '0.8rem', color: currentTheme.text, opacity:0.8 }}>AI Personal Health Coach</p> 
                        </div>
                      </div>

                      {/* Chat Body */}
                      <div style={{flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', background: darkMode?'#0f172a':'#f8fafc'}}> 
                        {chatHistory.map((msg, i) => ( 
                            <div key={i} style={{ 
                                padding:'1rem 1.2rem', 
                                background: msg.role==='user' ? currentTheme.primary : (darkMode?'#334155':'white'), 
                                borderRadius: msg.role==='user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                                maxWidth:'80%', 
                                alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start', 
                                color: msg.role==='user' ? 'white' : (darkMode?'e2e8f0':'#334155'), 
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                border: msg.role!=='user' && !darkMode ? '1px solid #e2e8f0' : 'none'
                            }}> 
                                {msg.content} 
                            </div> 
                        ))} 
                        {chatLoading && (
                            <div style={{ alignSelf:'flex-start', padding:'0.8rem 1.2rem', background: darkMode?'#334155':'white', borderRadius:'20px 20px 20px 4px', fontSize:'0.8rem', color:'#64748b', display:'flex', gap:'4px' }}>
                                <span className="animate-bounce">●</span><span className="animate-bounce" style={{animationDelay:'0.1s'}}>●</span><span className="animate-bounce" style={{animationDelay:'0.2s'}}>●</span>
                            </div>
                        )} 
                        <div ref={chatEndRef}></div> 
                      </div>

                      {/* Chat Input */}
                      <form onSubmit={handleSendChat} style={{padding:'1.2rem', borderTop: `1px solid ${darkMode?'#334155':'#f1f5f9'}`, display:'flex', gap:'0.8rem', background: darkMode?'#1e293b':'white'}}> 
                          <input autoFocus value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'1rem 1.5rem', borderRadius:'30px', border:`1px solid ${darkMode?'#475569':'#e2e8f0'}`, background: darkMode?'#0f172a':'#f8fafc', color: darkMode?'white':'black', outline:'none', fontSize:'0.95rem'}} placeholder="Tulis pesan..." /> 
                          <button style={{background: currentTheme.primary, border:'none', width:'54px', height:'54px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 4px 15px ${currentTheme.light}`, transition:'transform 0.2s'}}><Send size={22} color="white" style={{marginLeft:'-3px', marginTop:'2px'}}/></button> 
                      </form>
                  </Card>
              </div>
          )}

          {activeTab === 'settings' && (
            <div>
               <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}> <button onClick={() => handleNavClick('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}><ChevronLeft size={20}/> Kembali</button> <h1 className="heading-2">Pengaturan</h1> </div>
               <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> <CardHeader><CardTitle className="heading-3">Foto Profil</CardTitle></CardHeader> <CardContent> <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}> <div style={{ position: 'relative', width:'80px', height:'80px' }}> <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '2px solid #e2e8f0' }}> {overview?.user?.profile_picture ? <img src={`${BACKEND_URL}${overview.user.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={40} color="#94a3b8"/></div>} </div> <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleProfilePictureUpload} /> </div> <button onClick={triggerFileInput} disabled={uploadingImage} style={{ background: currentTheme.primary, color:'black', border:'none', padding:'0.6rem 1rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>{uploadingImage ? <RefreshCw className="animate-spin" size={16}/> : <Camera size={16}/>} {uploadingImage ? "Mengupload..." : "Ganti Foto"}</button> </div> </CardContent> </Card>
                  <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> <CardHeader><CardTitle className="heading-3">Ubah Tema</CardTitle></CardHeader> <CardContent> <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}> {Object.values(THEMES).map((theme) => ( <div key={theme.id} onClick={() => changeThemeColor(theme.id)} style={{ cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}> <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: theme.cardGradient, border: themeColor === theme.id ? `3px solid ${darkMode?'white':'#1e293b'}` : '1px solid #ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}> {themeColor === theme.id && <Check size={20} color="white" style={{dropShadow:'0 1px 2px rgba(0,0,0,0.5)'}}/>} </div> </div> ))} </div> </CardContent> </Card>
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
                {products.length === 0 ? ( <div style={{padding:'3rem', textAlign:'center', color:'#64748b', background: darkMode?'#1e293b':'#f8fafc', borderRadius:'12px', border:'1px dashed #cbd5e1'}}> <Package size={48} style={{margin:'0 auto 1rem auto', opacity:0.5}}/> <p>Belum ada produk tersedia saat ini.</p> </div> ) : ( <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}> {products.map((prod) => ( <Card key={prod.id} style={{ background: darkMode ? '#1e293b' : 'white', border: '1px solid #e2e8f0', overflow:'hidden', cursor:'pointer', transition:'transform 0.2s', display:'flex', flexDirection:'column', height:'100%' }} onClick={() => openCheckout(prod)}> <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={48} color="#cbd5e1"/>} </div> <div style={{ padding: '1rem', flex: 1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}> <div> <h4 style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: darkMode?'white':'#0f172a' }}>{prod.name}</h4> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.5rem'}}> <span style={{ fontWeight: 'bold', color: '#166534' }}>Rp {prod.price.toLocaleString()}</span> <div style={{background: currentTheme.primary, padding:'4px', borderRadius:'6px'}}><Plus size={16} color="white"/></div> </div> </div> <button onClick={()=>openCheckout(prod)} style={{marginTop:'1rem', width:'100%', background: currentTheme.primary, padding:'0.5rem', borderRadius:'8px', border:'none', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', cursor:'pointer', color:'white'}}> <ShoppingCart size={16}/> Beli </button> </div> </Card> ))} </div> )}
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
              padding: '10px 10px',
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
                  <span style={{ fontSize: '0.6rem', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}>Home</span>
              </button>

              {/* Shop */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'shop' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('shop')}
              >
                  <ShoppingBag size={22} strokeWidth={activeTab === 'shop' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.6rem', fontWeight: activeTab === 'shop' ? 'bold' : 'normal' }}>Shop</span>
              </button>

              {/* Dr. Alva (CENTER FLOATING ICON) */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <button
                      onClick={() => handleNavClick('chat')}
                      style={{
                          position: 'absolute',
                          top: '-35px',
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          background: currentTheme.cardGradient,
                          border: `6px solid ${darkMode ? '#1e293b' : 'white'}`,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 20
                      }}
                  >
                      <Bot size={28} color="white" fill="white" />
                  </button>
                  <span style={{
                      position: 'absolute',
                      bottom: '2px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: activeTab === 'chat' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b')
                  }}>
                      Dr. Alva
                  </span>
              </div>

              {/* Teman */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'friends' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('friends')}
              >
                  <Users size={22} strokeWidth={activeTab === 'friends' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.6rem', fontWeight: activeTab === 'friends' ? 'bold' : 'normal' }}>Teman</span>
              </button>

              {/* Profil */}
              <button
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'settings' ? currentTheme.primary : (darkMode ? '#94a3b8' : '#64748b') }}
                  onClick={() => handleNavClick('settings')}
              >
                  <User size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                  <span style={{ fontSize: '0.6rem', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Profil</span>
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
      {showTutorial && ( <div className="modal-overlay" onClick={closeTutorial}> <div className="modal-content" style={{textAlign:'center', padding:'2.5rem', maxWidth:'400px'}} onClick={e=>e.stopPropagation()}> <div style={{width:'60px', height:'60px', background: currentTheme.light, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem auto'}}> <Sparkles size={32} color={currentTheme.text}/> </div> <h2 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem'}}>Selamat Datang di Vitalyst!</h2> <div style={{textAlign:'left', fontSize:'0.95rem', color: darkMode?'#cbd5e1':'#475569', lineHeight:'1.6', marginBottom:'2rem'}}> <p style={{marginBottom:'0.8rem'}}>👋 Halo! Mari mulai perjalanan sehatmu:</p> <ul style={{listStyleType:'disc', paddingLeft:'1.5rem', marginBottom:'1rem'}}> <li style={{marginBottom:'0.5rem'}}>Ikuti <strong>Challenge Kesehatan</strong> selama 30 hari untuk membangun kebiasaan baik.</li> <li style={{marginBottom:'0.5rem'}}>Lakukan <strong>Check-in Harian</strong> untuk mencatat misimu.</li> <li style={{marginBottom:'0.5rem'}}>Kamu akan menerima <strong>WhatsApp Broadcast</strong> sebagai pengingat & motivasi.</li> <li>Konsultasikan keluhanmu dengan <strong>Dr. Alva</strong> kapan saja.</li> </ul> <p>Ayo buat kesehatanmu lebih terkontrol mulai hari ini!</p> </div> <button onClick={closeTutorial} style={{width:'100%', padding:'0.8rem', background: currentTheme.primary, color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Siap, Saya Mengerti!</button> </div> </div> )}
      {showPrivacy && ( <div className="modal-overlay" onClick={()=>setShowPrivacy(false)}> <div className="modal-content" onClick={e=>e.stopPropagation()}> <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}> <h2 style={{fontSize:'1.3rem', fontWeight:'bold'}}>Kebijakan Privasi</h2> <button onClick={()=>setShowPrivacy(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24} color={darkMode?'white':'black'}/></button> </div> <div style={{lineHeight:'1.6', fontSize:'0.9rem', color: darkMode?'#cbd5e1':'#475569'}}> <p style={{marginBottom:'1rem'}}>Terakhir diperbarui: Januari 2026</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>1. Informasi yang Kami Kumpulkan</h4> <p style={{marginBottom:'1rem'}}>Kami mengumpulkan informasi seperti nama, nomor telepon (untuk verifikasi WhatsApp), dan data kesehatan yang Anda masukkan untuk personalisasi challenge.</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>2. Penggunaan Data</h4> <p style={{marginBottom:'1rem'}}>Data Anda digunakan untuk memantau progres kesehatan, mengirimkan pengingat misi harian, dan rekomendasi produk kesehatan yang relevan.</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>3. Keamanan Data</h4> <p style={{marginBottom:'1rem'}}>Kami menjaga kerahasiaan data Anda dan tidak akan membagikannya kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.</p> <h4 style={{fontWeight:'bold', marginBottom:'0.5rem', color: currentTheme.text}}>4. Hubungi Kami</h4> <p>Jika ada pertanyaan mengenai privasi ini, silakan hubungi tim support kami.</p> </div> <button onClick={()=>setShowPrivacy(false)} style={{width:'100%', marginTop:'2rem', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', color:'black', fontWeight:'bold'}}>Tutup</button> </div> </div> )}
      
      {/* --- FIX 2: RESPONSIVE CHECKOUT MODAL --- */}
      {showCheckoutModal && selectedProduct && ( 
        <div className="modal-overlay" onClick={()=>setShowCheckoutModal(false)} style={{zIndex:100001}}> 
            <div className="modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth:'500px', width:'95%', maxHeight:'90vh', overflowY:'auto'}}> 
                <h3 style={{fontWeight:'bold', marginBottom:'1rem', fontSize:'1.2rem'}}>Checkout</h3> 
                <div style={{marginBottom:'1rem', display:'flex', gap:'0.5rem', flexWrap:'wrap'}}> 
                    <button onClick={()=>handleMethodChange('jne')} style={{flex:1, padding:'0.8rem', border: shippingMethod==='jne' ? `2px solid ${currentTheme.primary}` : '1px solid #ccc', borderRadius:'8px', background: shippingMethod==='jne' ? '#f0fdf4' : 'white', fontWeight:'bold', color:'black', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                        <Truck size={18}/> JNE (Kirim)
                    </button> 
                    <button onClick={()=>handleMethodChange('pickup')} style={{flex:1, padding:'0.8rem', border: shippingMethod==='pickup' ? `2px solid ${currentTheme.primary}` : '1px solid #ccc', borderRadius:'8px', background: shippingMethod==='pickup' ? '#f0fdf4' : 'white', fontWeight:'bold', color:'black', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                        <MapPin size={18}/> Ambil di Toko
                    </button> 
                </div> 
                
                {shippingMethod === 'jne' && ( 
                    <div style={{marginBottom:'1rem', background: darkMode?'#334155':'#f8fafc', padding:'1rem', borderRadius:'12px'}}> 
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'0.5rem'}}>
                            <span style={{fontWeight:'bold'}}>Kirim ke:</span>
                            <button onClick={()=>{setShowAddressModal(true)}} style={{color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:'600'}}>+ Alamat Baru</button>
                        </div> 
                        <select onChange={e=>handleSelectAddrCheckout(e.target.value)} value={selectedAddrId || ""} style={{width:'100%', padding:'0.8rem', border:'1px solid #ccc', borderRadius:'8px', background: darkMode?'#1e293b':'white', color: darkMode?'white':'black'}}> 
                            <option value="" disabled>Pilih Alamat Pengiriman...</option> 
                            {addresses.map(a=><option key={a.id} value={a.id}>{a.label} - {a.address}</option>)} 
                        </select> 
                        {addresses.length === 0 && <p style={{fontSize:'0.8rem', color:'red', marginTop:'8px'}}>Belum ada alamat tersimpan.</p>} 
                    </div> 
                )} 
                
                <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem'}}> 
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.95rem'}}><span>Harga Barang</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div> 
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.95rem'}}><span>Biaya Pengiriman</span><span>Rp {shippingCost.toLocaleString()}</span></div> 
                    <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.3rem', marginTop:'1rem', paddingTop:'0.5rem', borderTop:'1px dashed #ccc'}}>
                        <span>Total Bayar</span>
                        <span style={{color: currentTheme.primary}}>Rp {(selectedProduct.price + shippingCost).toLocaleString()}</span>
                    </div> 
                </div> 
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}> 
                    <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', color:'black'}}>Batal</button> 
                    <button onClick={handleProcessPayment} style={{padding:'0.8rem', border:'none', background: currentTheme.primary, color:'white', borderRadius:'8px', fontWeight:'bold', cursor: 'pointer', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>Bayar Sekarang</button> 
                </div> 
            </div> 
        </div> 
      )}

      {/* --- FIX 1: ORDER HISTORY MODAL (SEBELUMNYA HILANG) --- */}
      {showOrderHistory && (
          <div className="modal-overlay" onClick={()=>setShowOrderHistory(false)} style={{zIndex: 100000}}>
              <div className="modal-content" style={{maxWidth:'500px', width:'95%', maxHeight:'85vh'}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', borderBottom:'1px solid #eee', paddingBottom:'1rem'}}>
                      <h3 style={{fontWeight:'bold', fontSize:'1.2rem'}}>Riwayat Pesanan</h3>
                      <button onClick={()=>setShowOrderHistory(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
                          <X size={24} color={darkMode?'white':'black'}/>
                      </button>
                  </div>
                  
                  {myOrders.length === 0 ? (
                      <div style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>
                          <ShoppingBag size={48} style={{margin:'0 auto 1rem auto', opacity:0.5}}/>
                          <p>Belum ada riwayat pesanan.</p>
                      </div>
                  ) : (
                      <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                          {myOrders.map(order => (
                              <div key={order.id} style={{padding:'1rem', border: darkMode?'1px solid #334155':'1px solid #e2e8f0', borderRadius:'12px', background: darkMode?'#0f172a':'#f8fafc'}}>
                                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                                      <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>#{order.order_id || order.id}</span>
                                      <span style={{
                                          fontSize:'0.75rem', padding:'2px 8px', borderRadius:'10px', 
                                          background: order.status==='paid'?'#dcfce7':'#ffedd5', 
                                          color: order.status==='paid'?'#166534':'#9a3412', fontWeight:'bold', textTransform:'uppercase'
                                      }}>
                                          {order.status}
                                      </span>
                                  </div>
                                  <div style={{fontWeight:'bold', marginBottom:'0.2rem'}}>{order.product_name}</div>
                                  <div style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'1rem'}}>
                                      Total: Rp {order.amount?.toLocaleString()}
                                  </div>
                                  <button 
                                      onClick={() => handleOpenInvoice(order)} 
                                      style={{width:'100%', padding:'0.6rem', background:'white', border:'1px solid #ccc', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#334155'}}
                                  >
                                      Lihat Invoice
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
      
      {/* --- FIX 3: INVOICE MODAL LEBIH LENGKAP --- */}
      {showInvoice && selectedInvoice && ( 
        <div className="modal-overlay" onClick={()=>setShowInvoice(false)} style={{zIndex: 100001}}> 
            <div className="modal-content" style={{maxWidth:'400px'}} onClick={e=>e.stopPropagation()}> 
                <div style={{textAlign:'center', marginBottom:'1.5rem', borderBottom:'1px dashed #ccc', paddingBottom:'1rem', position:'relative'}}> 
                    <button onClick={()=>setShowInvoice(false)} style={{position:'absolute', right:0, top:0, background:'none', border:'none', cursor:'pointer'}}>
                        <X size={24} color={darkMode?'white':'black'}/>
                    </button>
                    <div style={{width:'50px', height:'50px', background: currentTheme.primary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto', color:'white'}}>
                        <Check size={28}/>
                    </div>
                    <h2 style={{fontWeight:'bold', fontSize:'1.5rem'}}>INVOICE</h2> 
                    <p style={{fontSize:'0.9rem', color:'#64748b'}}>VITALYST STORE</p> 
                    <p style={{fontSize:'0.8rem', color:'#94a3b8'}}>{selectedInvoice.date || new Date().toLocaleDateString()}</p> 
                </div> 
                
                <div style={{marginBottom:'1.5rem'}}> 
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> 
                        <span style={{color:'#64748b', fontSize:'0.9rem'}}>No. Order</span> 
                        <span style={{fontWeight:'bold', fontSize:'0.9rem'}}>{selectedInvoice.order_id || selectedInvoice.id}</span> 
                    </div> 
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> 
                        <span style={{color:'#64748b', fontSize:'0.9rem'}}>Status</span> 
                        <span style={{fontWeight:'bold', fontSize:'0.9rem', textTransform:'uppercase', color: selectedInvoice.status === 'paid' ? 'green' : 'orange'}}>{selectedInvoice.status}</span> 
                    </div> 
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}> 
                        <span style={{color:'#64748b', fontSize:'0.9rem'}}>Pengiriman</span> 
                        <span style={{fontSize:'0.9rem'}}>{selectedInvoice.shipping_method}</span> 
                    </div> 
                    
                    {/* Alamat Pengiriman (Muncul jika BUKAN Pickup) */}
                    {selectedInvoice.shipping_method !== 'Ambil di Toko' && selectedInvoice.shipping_method !== 'pickup' && selectedInvoice.address && (
                        <div style={{marginTop:'0.8rem', paddingTop:'0.8rem', borderTop:'1px solid #eee'}}>
                            <span style={{color:'#64748b', fontSize:'0.9rem', display:'block', marginBottom:'4px'}}>Alamat Pengiriman:</span>
                            <span style={{fontSize:'0.85rem', lineHeight:'1.4', display:'block', background:'#f8fafc', padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}}>
                                {typeof selectedInvoice.address === 'object' ? `${selectedInvoice.address.address}, ${selectedInvoice.address.city_name}` : selectedInvoice.address}
                            </span>
                        </div>
                    )}

                    {selectedInvoice.resi && ( 
                        <div style={{display:'flex', justifyContent:'space-between', marginTop:'0.5rem', background:'#f0fdf4', padding:'8px', borderRadius:'6px'}}> 
                            <span style={{color:'#166534', fontSize:'0.9rem'}}>No. Resi</span> 
                            <span style={{fontSize:'0.9rem', fontWeight:'bold', color:'#166534'}}>{selectedInvoice.resi}</span> 
                        </div> 
                    )} 
                </div> 
                
                {/* Rincian Produk & Harga */}
                <div style={{borderTop:'1px solid #eee', borderBottom:'1px solid #eee', padding:'1rem 0', marginBottom:'1.5rem'}}> 
                    <div style={{marginBottom:'1rem'}}>
                         <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'4px'}}>Produk</p>
                         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span style={{fontWeight:'bold', fontSize:'0.95rem'}}>{selectedInvoice.product_name}</span>
                            <span style={{fontSize:'0.9rem'}}>x1</span>
                         </div>
                    </div>

                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}> 
                        <span style={{fontSize:'0.9rem', color:'#64748b'}}>Harga</span> 
                        {/* Asumsi: Amount sudah termasuk ongkir, kita estimasi harga barang */}
                        <span style={{fontSize:'0.9rem'}}>Rp {(selectedInvoice.amount - (selectedInvoice.shipping_cost || 0)).toLocaleString()}</span> 
                    </div> 
                    
                    {selectedInvoice.shipping_cost > 0 && (
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}> 
                            <span style={{fontSize:'0.9rem', color:'#64748b'}}>Ongkos Kirim</span> 
                            <span style={{fontSize:'0.9rem'}}>Rp {selectedInvoice.shipping_cost.toLocaleString()}</span> 
                        </div> 
                    )}

                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1rem', paddingTop:'0.5rem', borderTop:'1px dashed #eee'}}> 
                        <span style={{fontSize:'1rem', fontWeight:'bold'}}>Total Bayar</span> 
                        <span style={{fontSize:'1.1rem', fontWeight:'bold', color: currentTheme.primary}}>Rp {selectedInvoice.amount.toLocaleString()}</span> 
                    </div> 
                </div> 

                {/* Tombol Lihat Lokasi Toko jika Pickup */}
                {(selectedInvoice.shipping_method === 'Ambil di Toko' || selectedInvoice.shipping_method === 'pickup') && (
                    <a 
                        href="https://www.google.com/maps/search/?api=1&query=Toko+Vitalyst" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{display:'flex', alignItems:'center', justifyContent:'center', width:'100%', marginBottom:'1rem', padding:'0.8rem', background: '#e0f2fe', color:'#0284c7', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', textAlign:'center', textDecoration:'none', gap:'8px'}}
                    >
                        <Map size={18} /> Buka Google Maps (Toko)
                    </a>
                )}

                <button onClick={()=>setShowInvoice(false)} style={{width:'100%', padding:'0.8rem', background: currentTheme.primary, color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Tutup Invoice</button> 
            </div> 
        </div> 
      )}

      {/* FIX: ADDRESS MODAL DENGAN CLOSE BUTTON DI HEADER & Z-INDEX */}
      {showAddressModal && ( 
        <div className="modal-overlay" onClick={()=>setShowAddressModal(false)} style={{zIndex: 100001}}> 
            <div className="modal-content" onClick={e=>e.stopPropagation()}> 
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                    <h3 style={{fontWeight:'bold'}}>Tambah Alamat</h3>
                    <button onClick={()=>setShowAddressModal(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
                        <X size={24} color={darkMode?'white':'black'}/>
                    </button>
                </div>
                <input placeholder="Label (Rumah/Kantor)" onChange={e=>setNewAddr({...newAddr, label:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}/> 
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}> 
                    <input placeholder="Penerima" onChange={e=>setNewAddr({...newAddr, name:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}/> 
                    <input placeholder="No HP" onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}/> 
                </div> 
                <select onChange={handleProvChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}><option>Pilih Provinsi</option>{provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select> {newAddr.prov_id && <select onChange={handleCityChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}><option>Pilih Kota</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>} <textarea placeholder="Alamat Lengkap" onChange={e=>setNewAddr({...newAddr, address:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}></textarea> <input placeholder="Kode Pos" onChange={e=>setNewAddr({...newAddr, zip:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'1rem', border:'1px solid #ccc', borderRadius:'6px', color:'black'}}/> 
                <div style={{display:'flex', gap:'0.5rem'}}> 
                    <button onClick={handleSaveAddress} style={{flex:1, padding:'0.8rem', background:currentTheme.primary, border:'none', borderRadius:'8px', fontWeight:'bold', color:'white', cursor:'pointer'}}>Simpan</button> 
                    <button onClick={()=>setShowAddressModal(false)} style={{flex:1, padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', color:'black'}}>Batal</button> 
                </div> 
            </div> 
        </div> 
      )}

      {selectedArticle && ( <div className="modal-overlay" onClick={()=>setSelectedArticle(null)}> <div className="modal-content" style={{width:'100%', maxWidth:'600px', maxHeight:'85vh', padding:'2rem', position:'relative'}} onClick={e=>e.stopPropagation()}> <button onClick={()=>setSelectedArticle(null)} style={{position:'absolute', right:'1rem', top:'1rem', background:'none', border:'none', cursor:'pointer'}}><X size={24} color={darkMode?'white':'black'}/></button> <h2 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem', paddingRight:'2rem'}}>{selectedArticle.title}</h2> {selectedArticle.image_url && <img src={`${BACKEND_URL}${selectedArticle.image_url}`} style={{width:'100%', borderRadius:'8px', marginBottom:'1rem'}}/>} <div style={{lineHeight:'1.6', fontSize:'0.95rem', whiteSpace:'pre-line'}}>{selectedArticle.content}</div> </div> </div> )}
      {showQRModal && ( <div className="modal-overlay" onClick={()=>setShowQRModal(false)}> <div className="modal-content" style={{textAlign:'center', background:'white'}} onClick={e=>e.stopPropagation()}> <h3 style={{fontWeight:'bold', marginBottom:'1rem', color:'black'}}>Kode Pertemanan</h3> <div style={{padding:'1rem', border:'1px solid #eee', borderRadius:'12px', display:'inline-block'}}> <QRCodeSVG value={`https://jagatetapsehat.com/add/${overview?.user?.referral_code}`} size={180} /> </div> <button onClick={()=>setShowQRModal(false)} style={{display:'block', width:'100%', marginTop:'1rem', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', color:'black'}}>Tutup</button> </div> </div> )}

      {/* --- MODAL BARU: LIMIT CHALLENGE --- */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={()=>setShowLimitModal(false)}>
            <div className="modal-content" style={{maxWidth:'400px'}} onClick={e=>e.stopPropagation()}>
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
            <div className="modal-content" style={{maxHeight:'85vh', height:'auto', display:'flex', flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
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
            <div className="modal-content" style={{textAlign:'center', maxWidth:'400px'}} onClick={e=>e.stopPropagation()}>
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
