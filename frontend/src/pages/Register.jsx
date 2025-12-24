import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    confirm_password: '',
    referral_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.phone_number,
      formData.email,
      formData.password,
      formData.referral_code || null
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Card style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
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
          <CardTitle className="heading-2" style={{ marginBottom: '0.5rem' }}>Daftar JATES9</CardTitle>
          <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
            Bergabung dengan 1.240+ peserta
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
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Budi Santoso"
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
                Nomor WhatsApp *
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
                Email (Opsional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
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
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 karakter"
                required
                minLength={6}
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
                Konfirmasi Password *
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Ketik ulang password"
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
                Kode Referral (Opsional)
              </label>
              <input
                type="text"
                value={formData.referral_code}
                onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                placeholder="ABCD1234"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <Button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang 🚀'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              Sudah punya akun?{' '}
              <Link to="/login" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
                Masuk
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

export default Register;