import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { Home, Users, ShoppingBag, Calendar, Bot, Settings, LogOut, Menu } from 'lucide-react';
import axios from 'axios';

// Import Komponen Tab Baru
import DashboardView from './tabs/DashboardView';
import CheckinView from './tabs/CheckinView';
import ShopView from './tabs/ShopView';
import FriendsView from './tabs/FriendsView';
import SettingsView from './tabs/SettingsView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- TEMA CONFIG (Tetap disini agar bisa dipass ke anak-anaknya) ---
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
  
  // --- STATE UTAMA ---
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark'); 
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  const currentTheme = THEMES[themeColor] || THEMES['green'];

  // Fungsi Toggle & Helper
  const toggleDarkMode = () => { setDarkMode(!darkMode); localStorage.setItem('theme', !darkMode ? 'dark' : 'light'); };
  const changeThemeColor = (k) => { setThemeColor(k); localStorage.setItem('colorTheme', k); };

  // Fetch Data Awal (User Profile)
  const fetchData = async () => {
    try {
      const overviewRes = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(overviewRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    const handleResize = () => { setIsDesktop(window.innerWidth > 1024); if(window.innerWidth > 1024) setSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    if (darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    fetchData();
    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]);

  if (loading) return <div className="p-8 text-center">Memuat dashboard...</div>;

  // Props global yang sering dipakai anak-anaknya
  const commonProps = {
    BACKEND_URL, getAuthHeader, darkMode, currentTheme, overview, setOverview
  };

  return (
    <div style={{ display: 'flex', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
      
      {/* --- SIDEBAR (Tetap disini) --- */}
      <aside style={{ width: '260px', background: darkMode ? '#1e293b' : 'white', borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', height: '100vh', position: isDesktop ? 'relative' : 'fixed', transform: (isDesktop || isSidebarOpen) ? 'translateX(0)' : 'translateX(-100%)', zIndex: 50, transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.text }}>VITALYST</h2>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Helper Component untuk Menu Item */}
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'checkin', icon: Calendar, label: 'Riwayat Check-in' },
              { id: 'shop', icon: ShoppingBag, label: 'Belanja Sehat' },
              { id: 'friends', icon: Users, label: 'Teman Sehat' },
              { id: 'settings', icon: Settings, label: 'Pengaturan' }
            ].map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === item.id ? (darkMode ? currentTheme.text : currentTheme.light) : 'transparent', color: activeTab === item.id ? (darkMode ? 'white' : currentTheme.text) : (darkMode ? '#94a3b8' : '#475569'), fontWeight: activeTab === item.id ? '600' : 'normal' }}
                >
                  <item.icon size={20}/> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: '1rem' }}><button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><LogOut size={20} /> Keluar</button></div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {!isDesktop && (
          <header style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display:'flex', justifyContent:'space-between', background: darkMode ? '#1e293b' : 'white' }}>
            <button onClick={()=>setSidebarOpen(true)} style={{background:'none', border:'none', color: darkMode?'white':'black'}}><Menu/></button>
            <span style={{fontWeight:'bold'}}>VITALYST</span>
          </header>
        )}
        
        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1 }}>
          
          {/* PEMANGGILAN TAB / COMPONENT */}
          {activeTab === 'dashboard' && <DashboardView {...commonProps} setActiveTab={setActiveTab} />}
          
          {activeTab === 'checkin' && <CheckinView {...commonProps} />}
          
          {activeTab === 'shop' && <ShopView {...commonProps} />}
          
          {activeTab === 'friends' && <FriendsView {...commonProps} />}
          
          {activeTab === 'settings' && (
            <SettingsView 
              {...commonProps} 
              themeColor={themeColor} 
              changeThemeColor={changeThemeColor} 
              THEMES={THEMES} 
              toggleDarkMode={toggleDarkMode}
              logout={logout}
              setActiveTab={setActiveTab}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
