import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, User, X, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // --- STATE ---
  const [savedUser, setSavedUser] = useState(null); // Data user yang tersimpan
  const [formData, setFormData] = useState({
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- 1. CEK LOCAL STORAGE SAAT LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem('last_user_info');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setSavedUser(parsedUser);
      // Isi otomatis nomor HP ke state
      setFormData(prev => ({ ...prev, phone_number: parsedUser.phone }));
    }
  }, []);

  // --- 2. HANDLE LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.phone_number, formData.password);
    
    if (result.success) {
      // SIMPAN INFO USER KE LOCAL STORAGE (Tanpa Password)
      const userInfoToSave = {
        name: result.user.name, // Pastikan API login mengembalikan object user
        phone: formData.phone_number
      };
      localStorage.setItem('last_user_info', JSON.stringify(userInfoToSave));

      // Redirect
      if (result.role === 'admin' || result.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || "Login gagal. Cek nomor atau password.");
    }
    
    setLoading(false);
  };

  // --- 3. HANDLE GANTI AKUN ---
  const handleSwitchAccount = () => {
    setSavedUser(null);
    setFormData({ phone_number: '', password: '' });
    localStorage.removeItem('last_user_info'); // Opsional: Hapus atau biarkan tertimpa nanti
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
        
        <CardHeader style={{ textAlign: 'center', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: 'var(--gradient-button)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Leaf className="h-8 w-8" style={{ color: 'white' }} />
            </div>
          </div>
          <CardTitle className="heading-2" style={{ marginBottom: '0.5rem' }}>Masuk ke JATES9</CardTitle>
          <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
            Program 30 Hari Usus Sehat
          </p>
        </CardHeader>

        <CardContent>
          
          {/* TAMPILAN JIKA USER TERSIMPAN (QUICK LOGIN) */}
          {savedUser ? (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ 
                background: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', 
                marginBottom: '1.5rem', position: 'relative', border: '1px solid #e2e8f0' 
              }}>
                {/* Tombol X Kecil untuk Ganti Akun Cepat */}
                <button 
                  onClick={handleSwitchAccount}
                  style={{ position: 'absolute', top: '10px', right: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                  title="Ganti Akun"
                >
                  <X size={18} />
                </button>

                <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '50%', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <User size={30} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>{savedUser.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{savedUser.phone}</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>{error}</div>}
                
                <div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan Password"
                    required
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px',
                      border: '1px solid var(--border-light)', background: 'var(--bg-section)', fontSize: '1rem'
                    }}
                  />
                </div>

                <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Memproses...' : 'Masuk Sekarang'}
                </Button>
              </form>

              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={handleSwitchAccount} 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-text)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Bukan Anda? Ganti Akun
                </button>
              </div>
            </div>
          ) : (
            // TAMPILAN LOGIN BIASA (MANUAL)
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', padding: '0.75rem', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              
              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="081234567890"
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border-light)', background: 'var(--bg-section)', fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border-light)', background: 'var(--bg-section)', fontSize: '1rem'
                  }}
                />
              </div>

              <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
                  Belum punya akun?{' '}
                  <Link to="/register" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Daftar Sekarang</Link>
                </p>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/" className="body-small" style={{ color: 'var(--text-muted)' }}>← Kembali ke Beranda</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
