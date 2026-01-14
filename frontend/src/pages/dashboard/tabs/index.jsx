import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, LogOut, Settings, User, ShoppingBag, 
  Calendar, Users, Bot, Menu 
} from 'lucide-react';

// Import Views (Tab) yang sudah kita pisah
import DashboardView from './tabs/DashboardView';
import CheckinView from './tabs/CheckinView';
import ShopView from './tabs/ShopView';
import FriendView from './tabs/FriendsView'; // Pastikan nama file sesuai (ada 's' atau tidak)
import SettingsView from './tabs/SettingsView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

// --- DEFINISI TEMA (Sama seperti kodingan lama Anda) ---
export const THEMES = {
  green: { id: 'green', name: 'Hijau Alami', primary: '#8fec78', light: '#dcfce7', text: '#166534', gradient: 'linear-gradient(135deg, #ffffff 0%, #8fec78 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #14532d 100%)' },
  red: { id: 'red', name: 'Merah Berani', primary: '#fca5a5', light: '#fee2e2', text: '#991b1b', gradient: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' },
  gold: { id: 'gold', name: 'Emas Mewah', primary: '#fcd34d', light: '#fef3c7', text: '#b45309', gradient: 'linear-gradient(135deg, #ffffff 0%, #fcd34d 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #78350f 100%)' },
  blue: { id: 'blue', name: 'Biru Tenang', primary: '#93c5fd', light: '#dbeafe', text: '#1e40af', gradient: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' },
  purple: { id: 'purple', name: 'Ungu Misteri', primary: '#d8b4fe', light: '#f3e8ff', text: '#6b21a8', gradient: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', darkGradient: 'linear-gradient(135deg, #1e293b 0%, #581c87 100%)' },
};

const DashboardLayout = () => {
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();
  
  // State Tema & UI
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  
  // Load Tema dari LocalStorage
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark'); 
  const [themeColor, setThemeColor] = useState(localStorage.getItem('colorTheme') || 'green');
  const currentTheme = THEMES[themeColor] || THEMES['green'];

  useEffect(() => {
    const handleResize = () => { 
        setIsDesktop(window.innerWidth > 1024); 
        if(window.innerWidth > 1024) setSidebarOpen(false); 
    };
    window.addEventListener('resize', handleResize);
    
    // Apply Dark Mode Class
    if (darkMode) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark');

    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]);

  // Fungsi Ganti Tema (Akan dioper ke SettingsView)
  const toggleDarkMode = () => { 
      const newMode = !darkMode;
      setDarkMode(newMode); 
      localStorage.setItem('theme', newMode ? 'dark' : 'light'); 
  };

  const changeThemeColor = (k) => { 
      setThemeColor(k); 
      localStorage.setItem('colorTheme', k); 
  };

  // Props yang akan dikirim ke semua Tab Anak
  const commonProps = {
      BACKEND_URL,
      getAuthHeader,
      darkMode,
      currentTheme,
      toggleDarkMode,   // Khusus Settings
      changeThemeColor, // Khusus Settings
      themeColor,       // Khusus Settings
      THEMES,           // Khusus Settings
      setActiveTab      // Agar anak bisa pindah tab
  };

  // Render Tab Content
  const renderContent = () => {
      switch (activeTab) {
          case 'dashboard': return <DashboardView {...commonProps} />;
          case 'checkin': return <CheckinView {...commonProps} />;
          case 'shop': return <ShopView {...commonProps} />;
          case 'friends': return <FriendView {...commonProps} />;
          case 'settings': return <SettingsView {...commonProps} />;
          default: return <DashboardView {...commonProps} />;
      }
  };

  return (
    <div style={{ display: 'flex', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#1e293b', width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
      
      {/* INJECT CSS VARIABLES AGAR TEMA BERJALAN */}
      <style>{`
        :root { --primary: ${currentTheme.primary}; --primary-dark: ${currentTheme.text}; --theme-gradient: ${currentTheme.gradient}; --theme-light: ${currentTheme.light}; }
        .dark { --theme-gradient: ${currentTheme.darkGradient}; }
        .nav-item { display: flex; alignItems: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; margin-bottom: 0.25rem; text-align: left; transition: all 0.2s; color: ${darkMode ? '#94a3b8' : '#475569'}; background: transparent; }
        .nav-item.active { background: ${darkMode ? currentTheme.text : currentTheme.light}; color: ${darkMode ? 'white' : currentTheme.text}; font-weight: 600; }
        .nav-item:hover { background: ${darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}; }
        
        /* Scrollbar Hide */
        .scroll-hide::-webkit-scrollbar { display: none; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; alignItems: center; justifyContent: center; z-index: 99999; }
        .modal-content { background: ${darkMode ? '#1e293b' : 'white'}; padding: 2rem; border-radius: 16px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; color: ${darkMode ? 'white' : 'black'}; }
      `}</style>

      {/* SIDEBAR (Menggunakan Style Lama Anda) */}
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
            <li><button className="nav-item"><Bot size={20}/> Dr. Alva AI</button></li>
            <li><button className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={() => setActiveTab('settings')}><Settings size={20}/> Pengaturan</button></li>
          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
            <button onClick={logout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} /> Keluar</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {!isDesktop && (
            <header style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', background: darkMode ? '#1e293b' : 'white' }}>
                <button onClick={()=>setSidebarOpen(true)} style={{background:'none', border:'none', color: darkMode?'white':'black'}}><Menu/></button>
                <span style={{fontWeight:'bold'}}>VITALYST</span>
                <div style={{width:'24px'}}></div>
            </header>
        )}
        
        <main style={{ padding: isDesktop ? '2rem' : '1rem', flex: 1 }}>
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
