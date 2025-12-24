import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.phone_number, formData.password);
    
    if (result.success) {
      // Navigate based on role
      if (result.role === 'admin' || result.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
        <CardHeader style={{ textAlign: 'center', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--gradient-button)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ 
                background: 'rgba(220, 38, 38, 0.1)', 
                border: '1px solid rgba(220, 38, 38, 0.3)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
            
            <div>
              <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="081234567890"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <Button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              Belum punya akun?{' '}
              <Link to="/register" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
                Daftar Sekarang
              </Link>
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/" className="body-small" style={{ color: 'var(--text-muted)' }}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;