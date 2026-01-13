import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, 
  Home, LogOut, Settings, User, Medal, Copy, ChevronRight, QrCode, Search, 
  Package, ShoppingBag, ChevronLeft, Lightbulb, Clock, AlertCircle, CheckCircle, Calendar, RefreshCw, FileText,
  Moon, Sun, Shield, Smartphone, Check, Palette, Edit2, Camera,
  Bot, Sparkles, MapPin, Truck, Box, TicketPercent, Plus, Map
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- DATA WILAYAH INDONESIA LENGKAP ---
const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan", "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau",
  "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
  "Maluku", "Maluku Utara",
  "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
];

const CITIES = {
  "Aceh": ["Banda Aceh", "Sabang", "Lhokseumawe", "Langsa", "Subulussalam", "Aceh Besar", "Pidie"],
  "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar", "Tebing Tinggi", "Sibolga", "Tanjungbalai", "Gunungsitoli", "Deli Serdang", "Langkat", "Karo"],
  "Sumatera Barat": ["Padang", "Bukittinggi", "Payakumbuh", "Pariaman", "Padang Panjang", "Solok", "Sawahlunto"],
  "Riau": ["Pekanbaru", "Dumai", "Kampar", "Bengkalis", "Indragiri Hilir", "Rokan Hulu"],
  "Jambi": ["Jambi", "Sungai Penuh", "Muaro Jambi", "Batanghari"],
  "Sumatera Selatan": ["Palembang", "Prabumulih", "Lubuklinggau", "Pagar Alam", "Banyuasin", "Ogan Ilir"],
  "Bengkulu": ["Bengkulu", "Rejang Lebong", "Mukomuko"],
  "Lampung": ["Bandar Lampung", "Metro", "Lampung Selatan", "Lampung Tengah", "Pringsewu"],
  "Kepulauan Bangka Belitung": ["Pangkalpinang", "Bangka", "Belitung"],
  "Kepulauan Riau": ["Tanjungpinang", "Batam", "Bintan", "Karimun"],
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cimahi", "Sukabumi", "Tasikmalaya", "Cirebon", "Banjar", "Cianjur", "Karawang", "Purwakarta", "Indramayu", "Garut", "Subang", "Sumedang", "Kuningan", "Majalengka", "Ciamis"],
  "Jawa Tengah": ["Semarang", "Surakarta (Solo)", "Magelang", "Pekalongan", "Salatiga", "Tegal", "Banyumas", "Cilacap", "Jepara", "Kudus", "Pati", "Klaten", "Boyolali", "Sukoharjo", "Wonogiri", "Karanganyar", "Sragen", "Grobogan", "Blora", "Rembang"],
  "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunungkidul"],
  "Jawa Timur": ["Surabaya", "Malang", "Madiun", "Kediri", "Mojokerto", "Batu", "Pasuruan", "Probolinggo", "Blitar", "Sidoarjo", "Gresik", "Jember", "Banyuwangi", "Lamongan", "Tuban", "Bojonegoro", "Ngawi", "Magetan", "Ponorogo", "Pacitan"],
  "Banten": ["Serang", "Cilegon", "Tangerang", "Tangerang Selatan", "Pandeglang", "Lebak"],
  "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Buleleng", "Karangasem", "Klungkung", "Bangli", "Jembrana"],
  "Nusa Tenggara Barat": ["Mataram", "Bima", "Lombok Barat", "Lombok Tengah", "Lombok Timur", "Sumbawa"],
  "Nusa Tenggara Timur": ["Kupang", "Flores Timur", "Sikka", "Ende", "Manggarai", "Sumba Timur"],
  "Kalimantan Barat": ["Pontianak", "Singkawang", "Kubu Raya", "Sambas", "Sintang"],
  "Kalimantan Tengah": ["Palangka Raya", "Kotawaringin Timur", "Kapuas"],
  "Kalimantan Selatan": ["Banjarmasin", "Banjarbaru", "Banjar", "Tabalong"],
  "Kalimantan Timur": ["Samarinda", "Balikpapan", "Bontang", "Kutai Kartanegara", "Kutai Timur"],
  "Kalimantan Utara": ["Tarakan", "Bulungan", "Nunukan"],
  "Sulawesi Utara": ["Manado", "Tomohon", "Bitung", "Kotamobagu", "Minahasa"],
  "Sulawesi Tengah": ["Palu", "Poso", "Luwuk", "Tolitoli"],
  "Sulawesi Selatan": ["Makassar", "Parepare", "Palopo", "Gowa", "Maros", "Bone"],
  "Sulawesi Tenggara": ["Kendari", "Bau-Bau", "Konawe"],
  "Gorontalo": ["Gorontalo"],
  "Sulawesi Barat": ["Mamuju", "Majene"],
  "Maluku": ["Ambon", "Tual", "Maluku Tengah"],
  "Maluku Utara": ["Ternate", "Tidore Kepulauan", "Halmahera Utara"],
  "Papua": ["Jayapura", "Keerom", "Sarmi"],
  "Papua Barat": ["Manokwari", "Fakfak"],
  "Papua Selatan": ["Merauke", "Boven Digoel"],
  "Papua Tengah": ["Nabire", "Mimika"],
  "Papua Pegunungan": ["Jayawijaya", "Yahukimo"],
  "Papua Barat Daya": ["Sorong", "Raja Ampat"]
};

// Simulasi Kode Pos (Contoh kota besar, aslinya ribuan)
const POSTAL_CODES = {
  "Banda Aceh": "23116", "Medan": "20111", "Padang": "25100", "Pekanbaru": "28111", "Jambi": "36111", 
  "Palembang": "30111", "Bengkulu": "38221", "Bandar Lampung": "35100", "Pangkalpinang": "33100", "Tanjungpinang": "29100",
  "Jakarta Pusat": "10110", "Jakarta Utara": "14110", "Jakarta Barat": "11110", "Jakarta Selatan": "12110", "Jakarta Timur": "13110",
  "Bandung": "40111", "Bekasi": "17100", "Bogor": "16000", "Depok": "16400", "Tangerang": "15000", "Tangerang Selatan": "15310",
  "Semarang": "50111", "Surakarta (Solo)": "57111", "Yogyakarta": "55111", "Surabaya": "60111", "Malang": "65111",
  "Denpasar": "80111", "Mataram": "83100", "Kupang": "85111",
  "Pontianak": "78111", "Palangka Raya": "73111", "Banjarmasin": "70111", "Samarinda": "75100", "Balikpapan": "76100", "Tarakan": "77100",
  "Manado": "95111", "Palu": "94111", "Makassar": "90111", "Kendari": "93111", "Gorontalo": "96111", "Mamuju": "91511",
  "Ambon": "97111", "Ternate": "97711", "Jayapura": "99111", "Manokwari": "98311", "Sorong": "98411", "Merauke": "99600", "Mimika": "99910"
};

// --- KONFIGURASI TOKO & HARGA ---
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
  const [savedAddress, setSavedAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Form Alamat Baru
  const [addrProvince, setAddrProvince] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  const [addrPostal, setAddrPostal] = useState("");

  const [shippingMethod, setShippingMethod] = useState("pickup"); 
  const [shippingCost, setShippingCost] = useState(0);
  const [userLocation, setUserLocation] = useState(null); 
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [couponError, setCouponError] = useState("");

  const [myOrders, setMyOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // --- CAROUSEL STATE ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
      { id: 1, color: "#dcfce7", title: "Promo Spesial", desc: "Diskon Ongkir JNE s/d 10rb" },
      { id: 2, color: "#dbeafe", title: "Paket Sehat", desc: "Beli 2 Gratis Konsultasi" },
      { id: 3, color: "#fff7ed", title: "Member Baru", desc: "Kupon: HEMAT10" }
  ];

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
    
    // Carousel Interval
    const slideInterval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slides.length); }, 4000);

    return () => { window.removeEventListener('resize', handleResize); clearInterval(slideInterval); if(document.body.contains(script)){ document.body.removeChild(script); } };
  }, []);

  useEffect(() => { if (activeTab === 'friends') fetchFriendsList(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'shop') fetchOrders(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  // Update Postal Code otomatis saat Kota berubah
  useEffect(() => {
      if (addrCity && POSTAL_CODES[addrCity]) {
          setAddrPostal(POSTAL_CODES[addrCity]);
      } else {
          setAddrPostal("");
      }
  }, [addrCity]);

  // Update JNE Cost saat alamat / metode berubah
  useEffect(() => {
      if (shippingMethod === 'jne') {
          // Simulasi harga berdasarkan Kota
          let basePrice = 10000; // Jabodetabek default
          
          if (addrCity) {
              if (addrCity.includes("Jakarta") || addrCity.includes("Tangerang") || addrCity.includes("Bekasi") || addrCity.includes("Depok") || addrCity.includes("Bogor")) {
                  basePrice = 9000;
              } else if (["Jawa Barat", "Banten"].includes(addrProvince)) {
                  basePrice = 15000;
              } else if (["Jawa Tengah", "DI Yogyakarta", "Jawa Timur"].includes(addrProvince)) {
                  basePrice = 22000;
              } else if (["Bali", "Lampung"].includes(addrProvince)) {
                  basePrice = 30000;
              } else if (["Sumatera Utara", "Sulawesi Selatan", "Kalimantan Timur"].includes(addrProvince)) {
                   basePrice = 45000;
              } else if (["Papua", "Papua Barat"].includes(addrProvince)) {
                   basePrice = 90000;
              } else {
                   basePrice = 35000; // Luar Jawa lainnya
              }
          }
          setShippingCost(basePrice);
      } else {
          setShippingCost(0);
      }
  }, [shippingMethod, addrCity, addrProvince]);

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
  
  const handleGetLocation = () => {
      if (!navigator.geolocation) { alert("Browser tidak support GPS."); return; }
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              setIsGettingLocation(false);
              setAddrDetail(prev => `${prev} (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
          },
          () => { alert("Gagal mengambil lokasi."); setIsGettingLocation(false); }
      );
  };

  const openCheckout = (product) => {
      setSelectedProduct(product);
      setShippingCost(0);
      setShippingMethod('pickup');
      // Auto-Fill
      setRecipientName(overview?.user?.name || "");
      setRecipientPhone(overview?.user?.phone || "");
      
      // Cek apakah user punya alamat tersimpan
      if (overview?.user?.address && overview.user.address.length > 5) {
          setSavedAddress(overview.user.address);
          setIsAddingAddress(false);
      } else {
          setSavedAddress(null);
          setIsAddingAddress(true); // Paksa isi alamat jika belum ada
      }
      
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
      
      // Tentukan alamat final
      let finalAddress = savedAddress;
      if (isAddingAddress || !savedAddress) {
          if (!addrProvince || !addrCity || !addrDistrict || !addrDetail) {
              alert("Mohon lengkapi alamat pengiriman (Provinsi, Kota, Kecamatan, Detail)."); return;
          }
          finalAddress = `${addrDetail}, Kec. ${addrDistrict}, ${addrCity}, ${addrProvince}, ${addrPostal}`;
      }

      if (shippingMethod === 'jne' && !finalAddress) { alert("Alamat wajib diisi."); return; }

      try {
          const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
              amount: selectedProduct.price,
              item_name: selectedProduct.name,
              shipping_name: recipientName,
              shipping_phone: recipientPhone,
              shipping_address: finalAddress,
              shipping_method: shippingMethod,
              shipping_cost: shippingCost,
              latitude: userLocation?.lat,
              longitude: userLocation?.lng,
              coupon_code: appliedCoupon?.code || "" 
          }, { headers: getAuthHeader() });
  
          if (response.data.success) {
              setShowCheckoutModal(false);
              setOverview(prev => ({
                  ...prev,
                  user: { ...prev.user, address: finalAddress, phone: recipientPhone }
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
      
      <style>{`
        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; --theme-gradient: ${currentTheme.gradient}; --theme-light: ${currentTheme.light}; }
        .dark { --theme-gradient: ${currentTheme.darkGradient}; }
        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; }
        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 600; }
        .scroll-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* SIDEBAR & HEADER */}
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
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
             <div><h2 className="heading-2">Halo, {overview?.user?.name}</h2></div>
          )}

          {/* FITUR TOKO E-COMMERCE STYLE */}
          {activeTab === 'shop' && (
             <div>
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                       <button onClick={() => setActiveTab('dashboard')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px' }}><ChevronLeft size={20}/></button>
                       <h1 className="heading-2" style={{color: darkMode?'white':'black'}}>Toko Sehat</h1>
                   </div>
                </div>

                {/* BANNER CAROUSEL */}
                <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {slides.map((slide, index) => (
                        <div key={slide.id} style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: slide.color, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem',
                            opacity: index === currentSlide ? 1 : 0, transition: 'opacity 0.5s ease-in-out'
                        }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>{slide.title}</h2>
                            <p style={{ fontSize: '1rem', color: '#475569' }}>{slide.desc}</p>
                        </div>
                    ))}
                    <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                        {slides.map((_, idx) => (
                            <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentSlide ? '#0f172a' : 'rgba(0,0,0,0.2)' }}></div>
                        ))}
                    </div>
                </div>

                {/* MENU CEPAT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div onClick={() => setShowOrderHistory(true)} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '40px', height: '40px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={20} color="#1e40af"/></div>
                        <div><div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Status Pesanan</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Lacak paketmu</div></div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                         <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={20} color="#b45309"/></div>
                         <div><div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Alamat Saya</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{overview?.user?.address ? "Tersimpan" : "Belum diisi"}</div></div>
                    </div>
                </div>

                {/* PRODUCT GRID */}
                <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', color: darkMode?'white':'#0f172a' }}>Produk Pilihan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                   {products.map((prod) => (
                      <Card key={prod.id} style={{ background: darkMode ? '#1e293b' : 'white', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                         <div style={{ height: '140px', background: darkMode ? '#334155' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow:'hidden' }}>
                            {prod.image_url ? (
                                <img src={`${BACKEND_URL}${prod.image_url}`} alt={prod.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <Package size={48} color="#94a3b8"/>
                            )}
                         </div>
                         <CardContent style={{ padding: '1rem' }}>
                            <h3 style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.3rem', color: darkMode ? 'white' : 'black', lineHeight: '1.3' }}>{prod.name}</h3>
                            <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.2rem'}}>
                                <CheckCircle size={10} color="#16a34a"/> {prod.fake_sales || 0} terjual
                            </div>
                            <div style={{ display: 'flex', flexDirection:'column', gap:'0.5rem' }}>
                               <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '1rem' }}>Rp {prod.price.toLocaleString()}</span>
                               <button 
                                  onClick={() => openCheckout(prod)} 
                                  style={{ background: '#ee4d2d', color: 'white', padding: '0.5rem', borderRadius: '6px', border:'none', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent:'center', gap: '0.3rem', cursor: 'pointer', width:'100%' }}
                               >
                                  <ShoppingBag size={14}/> Beli
                               </button>
                            </div>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </div>
          )}
          
          {/* ... Other Tabs ... */}

        </main>
      </div>

      {/* MODAL CHECKOUT LENGKAP */}
      {showCheckoutModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: 'white', padding: '0', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight:'90vh', overflowY:'auto', display:'flex', flexDirection:'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', position:'sticky', top:0, background:'white', zIndex:10 }}>
                    <h3 style={{ fontSize:'1.2rem', fontWeight:'bold' }}>Checkout</h3>
                    <p style={{ fontSize:'0.8rem', color:'#64748b' }}>Lengkapi data pengiriman Anda</p>
                </div>
                
                <div style={{ padding: '1.5rem', flex:1 }}>
                    {/* PRODUK INFO */}
                    <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px dashed #eee' }}>
                         <div style={{ width:'60px', height:'60px', borderRadius:'8px', background:'#f1f5f9', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {selectedProduct.image_url ? <img src={`${BACKEND_URL}${selectedProduct.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={24} color="#ccc"/>}
                         </div>
                         <div>
                             <div style={{fontWeight:'bold', fontSize:'0.95rem'}}>{selectedProduct.name}</div>
                             <div style={{color:'#166534', fontWeight:'bold'}}>Rp {selectedProduct.price.toLocaleString()}</div>
                         </div>
                    </div>

                    {/* KONTAK */}
                    <div style={{ marginBottom:'1.5rem' }}>
                        <label style={{ display:'block', fontSize:'0.85rem', fontWeight:'bold', marginBottom:'0.5rem' }}>Info Penerima</label>
                        <input value={recipientName} onChange={(e)=>setRecipientName(e.target.value)} placeholder="Nama Lengkap" style={{ width:'100%', padding:'0.7rem', border:'1px solid #e2e8f0', borderRadius:'8px', marginBottom:'0.5rem', fontSize:'0.9rem' }} />
                        <input value={recipientPhone} onChange={(e)=>setRecipientPhone(e.target.value)} placeholder="Nomor WhatsApp" style={{ width:'100%', padding:'0.7rem', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'0.9rem' }} />
                    </div>

                    {/* ALAMAT */}
                    <div style={{ marginBottom:'1.5rem' }}>
                        <label style={{ display:'block', fontSize:'0.85rem', fontWeight:'bold', marginBottom:'0.5rem' }}>Alamat Pengiriman</label>
                        
                        {/* Jika ada alamat tersimpan & tidak sedang mode edit */}
                        {savedAddress && !isAddingAddress ? (
                            <div style={{ background:'#f8fafc', padding:'1rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                                <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                                    <MapPin size={18} color="#0f172a" style={{ marginTop:'2px' }}/>
                                    <p style={{ fontSize:'0.9rem', color:'#334155', flex:1 }}>{savedAddress}</p>
                                </div>
                            </div>
                        ) : null}

                        {/* Tombol Tambah / Ganti Alamat */}
                        <button 
                            onClick={() => setIsAddingAddress(!isAddingAddress)} 
                            style={{ 
                                marginTop: '0.8rem', width: '100%', padding: '0.8rem', 
                                border: '2px dashed #cbd5e1', background: 'transparent', 
                                borderRadius: '8px', color: '#64748b', fontWeight: 'bold', 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            {isAddingAddress ? "Batal Ubah Alamat" : (savedAddress ? "Ubah Alamat" : <><Plus size={16}/> Tambah Alamat Baru</>)}
                        </button>

                        {/* FORM ALAMAT BARU */}
                        {isAddingAddress && (
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                <select value={addrProvince} onChange={(e)=>setAddrProvince(e.target.value)} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc', fontSize:'0.9rem' }}>
                                    <option value="">Pilih Provinsi</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <select value={addrCity} onChange={(e)=>setAddrCity(e.target.value)} disabled={!addrProvince} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc', fontSize:'0.9rem' }}>
                                    <option value="">Pilih Kota/Kabupaten</option>
                                    {addrProvince && CITIES[addrProvince]?.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                                    <input value={addrDistrict} onChange={(e)=>setAddrDistrict(e.target.value)} placeholder="Kecamatan" style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc', fontSize:'0.9rem' }} />
                                    <input value={addrPostal} readOnly placeholder="Kode Pos" style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc', background: '#f1f5f9', fontSize:'0.9rem' }} />
                                </div>
                                <textarea value={addrDetail} onChange={(e)=>setAddrDetail(e.target.value)} placeholder="Nama Jalan, No. Rumah, RT/RW, Patokan..." rows={3} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc', fontSize:'0.9rem' }}></textarea>
                                
                                <button onClick={handleGetLocation} style={{ background:'#eff6ff', color:'#1e40af', border:'none', padding:'0.6rem', borderRadius:'8px', fontSize:'0.8rem', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', cursor:'pointer' }}>
                                   <Map size={14}/> Gunakan Lokasi Saat Ini (GPS)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* METODE PENGIRIMAN */}
                    <div style={{ marginBottom:'1.5rem' }}>
                        <label style={{ display:'block', fontSize:'0.85rem', fontWeight:'bold', marginBottom:'0.5rem' }}>Pengiriman</label>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                            <button onClick={()=>setShippingMethod('pickup')} style={{ padding:'0.8rem', border: shippingMethod==='pickup' ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0', borderRadius:'8px', background: shippingMethod==='pickup' ? '#f0fdf4' : 'white', fontWeight:'bold', fontSize:'0.9rem', cursor:'pointer' }}>
                                Ambil di Toko
                            </button>
                            <button onClick={()=>setShippingMethod('jne')} style={{ padding:'0.8rem', border: shippingMethod==='jne' ? `2px solid ${currentTheme.primary}` : '1px solid #e2e8f0', borderRadius:'8px', background: shippingMethod==='jne' ? '#f0fdf4' : 'white', fontWeight:'bold', fontSize:'0.9rem', cursor:'pointer' }}>
                                JNE / Ekspedisi
                            </button>
                        </div>
                    </div>

                    {/* KUPON */}
                    <div style={{ marginBottom:'1.5rem' }}>
                        <label style={{ display:'block', fontSize:'0.85rem', fontWeight:'bold', marginBottom:'0.5rem' }}>Kode Kupon</label>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                             <div style={{ position:'relative', flex:1 }}>
                                <TicketPercent size={18} color="#94a3b8" style={{ position:'absolute', top:'10px', left:'10px' }}/>
                                <input value={couponCode} onChange={(e)=>setCouponCode(e.target.value)} placeholder="Masukkan kode..." style={{ width:'100%', padding:'0.7rem 0.7rem 0.7rem 2.2rem', borderRadius:'8px', border:'1px solid #e2e8f0' }} />
                             </div>
                             <button onClick={checkCoupon} style={{ background:'#0f172a', color:'white', border:'none', borderRadius:'8px', padding:'0 1.2rem', fontWeight:'bold', cursor:'pointer' }}>Cek</button>
                        </div>
                        {couponError && <p style={{ fontSize:'0.8rem', color:'#ef4444', marginTop:'0.3rem' }}>{couponError}</p>}
                        {appliedCoupon && <p style={{ fontSize:'0.8rem', color:'#16a34a', marginTop:'0.3rem' }}>Kupon berhasil! Hemat Rp {appliedCoupon.amount.toLocaleString()}</p>}
                    </div>
                </div>

                {/* FOOTER TOTAL & BAYAR */}
                <div style={{ padding:'1.5rem', borderTop:'1px solid #eee', background:'#f9fafb', borderBottomLeftRadius:'16px', borderBottomRightRadius:'16px' }}>
                     <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.9rem' }}>
                         <span style={{color:'#64748b'}}>Subtotal Produk</span>
                         <span>Rp {selectedProduct.price.toLocaleString()}</span>
                     </div>
                     <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.9rem' }}>
                         <span style={{color:'#64748b'}}>Ongkos Kirim</span>
                         <span>Rp {shippingCost.toLocaleString()}</span>
                     </div>
                     {appliedCoupon && (
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.9rem', color:'#16a34a' }}>
                           <span>Diskon</span>
                           <span>- Rp {appliedCoupon.amount.toLocaleString()}</span>
                        </div>
                     )}
                     <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem', fontSize:'1.1rem', fontWeight:'bold' }}>
                         <span>Total Bayar</span>
                         <span>Rp {Math.max(0, selectedProduct.price + shippingCost - (appliedCoupon?.amount || 0)).toLocaleString()}</span>
                     </div>
                     
                     <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'1rem' }}>
                         <button onClick={()=>setShowCheckoutModal(false)} style={{ padding:'0.8rem', borderRadius:'8px', border:'1px solid #cbd5e1', background:'white', fontWeight:'bold', cursor:'pointer' }}>Batal</button>
                         <button onClick={handleProcessPayment} style={{ padding:'0.8rem', borderRadius:'8px', border:'none', background:'#ee4d2d', color:'white', fontWeight:'bold', cursor:'pointer' }}>Bayar Sekarang</button>
                     </div>
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
                                    {/* FIX ERROR toUpperCase: Tambahkan proteksi */}
                                    <p style={{fontSize:'0.8rem', color:'#64748b'}}>Total: Rp {order.amount.toLocaleString()} • {(order.shipping_method || '-').toUpperCase()}</p>
                                    {order.resi && <p style={{fontSize:'0.8rem', color:'#1e40af', marginTop:'0.2rem'}}>Resi: {order.resi}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

export default UserDashboard;
