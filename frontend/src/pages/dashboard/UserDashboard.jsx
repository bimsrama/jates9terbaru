import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Settings, ShoppingBag, 
  Calendar, Users, Bot, LogOut
} from 'lucide-react';
import axios from 'axios';

// --- IMPORT TABS ---
import DashboardView from './tabs/DashboardView';
import CheckinView from './tabs/CheckinView';
import ShopView from './tabs/ShopView';
import FriendView from './tabs/FriendsView';
import SettingsView from './tabs/SettingsView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- DEFINISI TEMA ---
export const THEMES = {
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
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [userOverview, setUserOverview] = useState(null); 

  // --- STATE TEMA ---
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark'); 
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  const currentTheme = THEMES[themeColor] || THEMES['green'];

  // --- LOAD DATA USER ---
  const fetchUserOverview = async () => {
      try {
          const res = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
          setUserOverview(res.data);
      } catch (e) { 
          console.error("Gagal load user data", e); 
      }
  };

  useEffect(() => {
    fetchUserOverview();
    
    // Handler Resize untuk ganti layout Mobile <-> Desktop
    const handleResize = () => { setIsDesktop(window.innerWidth > 1024); };
    window.addEventListener('resize', handleResize);
    
    if (darkMode) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark');

    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]);

  const toggleDarkMode = () => { 
      const newMode = !darkMode; 
      setDarkMode(newMode); 
      localStorage.setItem('theme', newMode ? 'dark' : 'light'); 
  };
  const changeThemeColor = (k) => { 
      setThemeColor(k); 
      localStorage.setItem('colorTheme', k); 
  };

  // --- PROPS SHARED ---
  const commonProps = {
      BACKEND_URL, getAuthHeader, darkMode, currentTheme, 
      userOverview, setUserOverview, fetchUserOverview,
      toggleDarkMode, changeThemeColor, themeColor, THEMES, setActiveTab
  };

  // --- STYLE TOMBOL NAVIGASI (Reusable) ---
  const navButtonStyle = (tabName, isSidebar = false) => ({
      display: 'flex',
      flexDirection: isSidebar ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: isSidebar ? 'flex-start' : 'center',
      gap: isSidebar ? '12px' : '0',
      width: '100%',
      background: activeTab === tabName && isSidebar ? (darkMode ? '#334155' : currentTheme.light) : 'transparent',
      border: 'none',
      padding: isSidebar ? '12px 16px' : '0.8rem 0',
      borderRadius: isSidebar ? '12px' : '0',
      cursor: 'pointer',
      color: activeTab === tabName ? currentTheme.text : (darkMode ? '#94a3b8' : '#64748b'),
      fontWeight: activeTab === tabName ? 'bold' : 'normal',
      transition: 'all 0.2s ease',
      flex: isSidebar ? 'none' : 1
  });

  return (
    <div style={{ 
        display: 'flex',
        minHeight: '100vh', 
        background: darkMode ? '#0f172a' : '#f8fafc', 
        color: darkMode ? '#e2e8f0' : '#1e293b',
        paddingBottom: isDesktop ? '0' : '100px', // Padding bawah hanya di HP
        overflowX: 'hidden'
    }}>
      
      {/* --- MAGIC STYLE: HILANGKAN MENU LAMA --- */}
      <style>{`
        /* Sembunyikan elemen Header/Navbar global */
        header:not(.dashboard-header), .navbar, .site-header, #header, nav.navbar {
            display: none !important;
        }
        /* Reset margin body */
        body { padding-top: 0 !important; margin-top: 0 !important; }
        
        /* Utils */
        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; }
        .dark { --theme-gradient: ${currentTheme.darkGradient}; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; alignItems: center; justifyContent: center; z-index: 99999; }
        .modal-content { background: ${darkMode ? '#1e293b' : 'white'}; padding: 2rem; border-radius: 16px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; color: ${darkMode ? 'white' : 'black'}; }
      `}</style>

      {/* =========================================
          DESKTOP SIDEBAR (Hanya muncul jika isDesktop = true)
         ========================================= */}
      {isDesktop && (
        <aside style={{ 
            width: '280px', 
            background: darkMode ? '#1e293b' : 'white', 
            borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
            height: '100vh', 
            position: 'sticky', 
            top: 0, 
            display: 'flex', 
            flexDirection: 'column',
            padding: '1.5rem',
            zIndex: 50
        }}>
            <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: currentTheme.text, display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{width:'32px', height:'32px', background: currentTheme.gradient, borderRadius:'8px'}}></div>
                    VITALYST
                </h2>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={() => setActiveTab('dashboard')} style={navButtonStyle('dashboard', true)}>
                    <Home size={22}/> Dashboard
                </button>
                <button onClick={() => setActiveTab('checkin')} style={navButtonStyle('checkin', true)}>
                    <Calendar size={22}/> Jurnal Check-in
                </button>
                <button onClick={() => setActiveTab('shop')} style={navButtonStyle('shop', true)}>
                    <ShoppingBag size={22}/> Toko Sehat
                </button>
                <button onClick={() => setActiveTab('friends')} style={navButtonStyle('friends', true)}>
                    <Users size={22}/> Teman Sehat
                </button>
                <button onClick={() => setActiveTab('settings')} style={navButtonStyle('settings', true)}>
                    <Settings size={22}/> Pengaturan
                </button>
            </nav>

            <div style={{ borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button onClick={logout} style={{ ...navButtonStyle('', true), color: '#ef4444' }}>
                    <LogOut size={22}/> Keluar
                </button>
            </div>
        </aside>
      )}

      {/* =========================================
          MAIN CONTENT AREA
         ========================================= */}
      <div style={{ flex: 1, width: '100%' }}>
          <main style={{ 
              padding: isDesktop ? '2rem 3rem' : '1.5rem', 
              maxWidth: isDesktop ? '1400px' : '800px', 
              margin: '0 auto',
              paddingTop: isDesktop ? '2rem' : '1.5rem'
          }}>
              {activeTab === 'dashboard' && <DashboardView {...commonProps} />}
              {activeTab === 'checkin' && <CheckinView {...commonProps} />}
              {activeTab === 'shop' && <ShopView {...commonProps} />}
              {activeTab === 'friends' && <FriendView {...commonProps} />}
              {activeTab === 'settings' && <SettingsView {...commonProps} />}
          </main>
      </div>

      {/* =========================================
          MOBILE BOTTOM NAV (Hanya muncul jika isDesktop = false)
         ========================================= */}
      {!isDesktop && (
        <nav className="bottom-nav" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: darkMode ? '#1e293b' : 'white',
            borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 99999, 
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.05)'
        }}>
            <button onClick={() => setActiveTab('dashboard')} style={navButtonStyle('dashboard')}>
                <Home size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}>Home</span>
            </button>
            
            <button onClick={() => setActiveTab('checkin')} style={navButtonStyle('checkin')}>
                <Calendar size={24} strokeWidth={activeTab === 'checkin' ? 2.5 : 2} />
                <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: activeTab === 'checkin' ? 'bold' : 'normal' }}>Jurnal</span>
            </button>

            {/* Tombol Tengah (Shop) */}
            <div style={{ position: 'relative', top: '-25px' }}>
                <button onClick={() => setActiveTab('shop')} style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.text} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '6px solid ' + (darkMode ? '#0f172a' : '#f8fafc'),
                    boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    color: 'white'
                }}>
                    <ShoppingBag size={28} fill="white" fillOpacity={0.2} />
                </button>
            </div>

            <button onClick={() => setActiveTab('friends')} style={navButtonStyle('friends')}>
                <Users size={24} strokeWidth={activeTab === 'friends' ? 2.5 : 2} />
                <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: activeTab === 'friends' ? 'bold' : 'normal' }}>Teman</span>
            </button>

            <button onClick={() => setActiveTab('settings')} style={navButtonStyle('settings')}>
                <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Akun</span>
            </button>
        </nav>
      )}

    </div>
  );
};

export default UserDashboard;
