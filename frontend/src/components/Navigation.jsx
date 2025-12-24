import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, Leaf } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/quiz', label: 'Kuis Kesehatan' },
    { path: '/challenge', label: 'Program 30 Hari' },
    { path: '/product', label: 'Produk Jates9' },
    { path: '/chat', label: 'Doktor AI' }
  ];

  return (
    <>
      <nav className="nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'var(--gradient-button)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf className="h-5 w-5" style={{ color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>JATES9</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
              style={{ 
                background: location.pathname === link.path ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                color: location.pathname === link.path ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              {link.label}
            </Link>
          ))}
          <Button 
            className="btn-secondary" 
            size="sm"
            onClick={() => navigate('/login')}
            style={{ marginLeft: '0.5rem' }}
          >
            Masuk
          </Button>
          <Button 
            className="btn-primary" 
            size="sm"
            onClick={() => navigate('/register')}
          >
            Daftar
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ 
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'none'
          }}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav"
          style={{ 
            display: 'none',
            position: 'fixed',
            top: '4.5rem',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 40
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  padding: '0.75rem 1rem',
                  background: location.pathname === link.path ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                  color: location.pathname === link.path ? 'var(--text-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  borderRadius: '8px'
                }}
              >
                {link.label}
              </Link>
            ))}
            <Button 
              className="btn-secondary" 
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              style={{ marginTop: '0.5rem' }}
            >
              Masuk
            </Button>
            <Button 
              className="btn-primary" 
              onClick={() => {
                navigate('/register');
                setMobileMenuOpen(false);
              }}
            >
              Daftar
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;