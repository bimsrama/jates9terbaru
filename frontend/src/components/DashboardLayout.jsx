import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  CheckSquare, 
  Users as UsersIcon, 
  Wallet, 
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  MessageSquare // <--- Import Icon Baru
} from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/health-report', label: 'Rapor Kesehatan', icon: Activity },
    { path: '/dashboard/checkin', label: 'Check-in', icon: CheckSquare },
    { path: '/dashboard/affiliate', label: 'Afiliasi & Komisi', icon: UsersIcon },
    { path: '/dashboard/withdrawal', label: 'Penarikan', icon: Wallet },
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/admin/broadcast', label: 'Broadcast WA', icon: MessageSquare }, // <--- Menu Baru Ditambahkan
    { path: '/admin/users', label: 'User Management', icon: UsersIcon },
    { path: '/admin/purchases', label: 'Verify Purchases', icon: ShoppingBag },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 100,
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          background: 'white',
          cursor: 'pointer',
          display: 'none'
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div 
        className="sidebar"
        style={{
          width: '280px',
          background: 'white',
          borderRight: '1px solid var(--border-light)',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          left: sidebarOpen ? 0 : '-280px',
          transition: 'left 0.3s',
          zIndex: 99
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--gradient-button)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Leaf className="h-6 w-6" style={{ color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>JATES9</span>
        </div>

        {/* User Info */}
        <div style={{ 
          padding: '1rem', 
          background: 'var(--accent-wash)', 
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <div className="body-medium" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{user?.name}</div>
          <div className="body-small" style={{ color: 'var(--text-secondary)' }}>{isAdmin ? 'Admin' : 'User'}</div>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--accent-wash)' : 'transparent',
                  color: isActive ? 'var(--accent-text)' : 'var(--text-body)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9375rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.background = 'var(--bg-section)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.background = 'transparent';
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            background: 'transparent',
            color: '#FF6B6B',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 500,
            marginTop: '1rem'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '280px', minHeight: '100vh' }} className="main-content">
        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            left: ${sidebarOpen ? '0' : '-280px'} !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
