import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, ArrowRight, Check, Loader2, Trophy } from 'lucide-react';
import axios from 'axios';

// Gunakan URL Backend dari environment atau default
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const Register = () => {
  const navigate = useNavigate();
  const { register, getAuthHeader } = useAuth();

  // --- STATE ---
  const [step, setStep] = useState(1); // 1 = Form, 2 = Challenge
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data Form
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    referral_code: ''
  });

  // Data Challenge
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  // --- STYLE UTILS (Menyamakan dengan Login.jsx) ---
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    background: 'var(--bg-section)',
    fontSize: '1rem'
  };

  // --- LOGIC STEP 1: REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Password dan Konfirmasi Password tidak cocok');
      setLoading(false);
      return;
    }

    // Panggil register di AuthContext
    const result = await register({
      name: formData.name,
      phone_number: formData.phone_number,
      password: formData.password,
      referral_code: formData.referral_code || null
    });
    
    if (result.success) {
      // Sukses Register -> Pindah ke Step 2 -> Ambil Data Challenge
      await fetchChallenges();
      setStep(2);
    } else {
      setError(result.error || 'Gagal mendaftar.');
    }
    
    setLoading(false);
  };

  // --- LOGIC STEP 2: LOAD & PILIH CHALLENGE ---
  const fetchChallenges = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(res.data);
    } catch (err) {
      console.error("Gagal load challenge", err);
      // Data Dummy jika API belum diisi admin
      setChallenges([
        { id: 1, title: 'Challenge Usus Sehat', description: 'Program detoks 30 hari' },
        { id: 2, title: 'Challenge Anti Aging', description: 'Program awet muda 30 hari' }
      ]);
    }
  };

  const handleSelectChallenge = async (id) => {
    setSelectedChallengeId(id);
    setLoading(true); // Loading spesifik card
    try {
      await axios.post(
        `${BACKEND_URL}/api/user/select-challenge`, 
        { challenge_id: id },
        { headers: getAuthHeader() } // Butuh token
      );
      // Sukses -> Masuk Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError("Gagal memilih challenge. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Card style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', minHeight: '650px' }}>
        
        <CardHeader style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
          {/* LOGO ICON */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: 'var(--gradient-button)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Leaf className="h-8 w-8" style={{ color: 'white' }} />
            </div>
          </div>
          
          <CardTitle className="heading-2" style={{ marginBottom: '0.5rem' }}>
            {step === 1 ? "Bergabung dengan JATES9" : "Pilih Program Sehatmu"}
          </CardTitle>
          <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? "Langkah 1: Isi Biodata Diri" : "Langkah 2: Tentukan Tantangan 30 Hari"}
          </p>
        </CardHeader>

        <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* ERROR ALERT */}
          {error && (
            <div style={{ 
              background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)',
              padding: '0.75rem', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* --- TAMPILAN STEP 1: FORM REGISTER --- */}
          {step === 1 && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Nama Lengkap *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Anda" required style={inputStyle} />
              </div>

              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Nomor WhatsApp *</label>
                <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="0812xxxxxxx" required style={inputStyle} />
              </div>

              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Password *</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required minLength={6} style={inputStyle} />
              </div>

              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Konfirmasi Password *</label>
                <input type="password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} placeholder="Ketik ulang password" required style={inputStyle} />
              </div>

              <div>
                <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Kode Referral (Opsional)</label>
                <input type="text" value={formData.referral_code} onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })} placeholder="Contoh: JATES123" style={{...inputStyle, textTransform: 'uppercase'}} />
              </div>

              <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Lanjut <ArrowRight size={18} /></>}
              </Button>
            </form>
          )}

          {/* --- TAMPILAN STEP 2: PILIH CHALLENGE --- */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {challenges.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Memuat Tantangan...</div>
              ) : (
                challenges.map((challenge) => (
                  <div 
                    key={challenge.id}
                    onClick={() => handleSelectChallenge(challenge.id)}
                    style={{
                      border: selectedChallengeId === challenge.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      background: selectedChallengeId === challenge.id ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-section)',
                      borderRadius: '12px', padding: '1rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                    }}
                  >
                    <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🏆
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)' }}>{challenge.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{challenge.description || "Program kesehatan intensif 30 hari."}</p>
                    </div>
                    
                    {/* Loading Overlay per Card */}
                    {loading && selectedChallengeId === challenge.id && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
                      </div>
                    )}
                  </div>
                ))
              )}
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Klik salah satu kartu di atas untuk memulai.
              </p>
            </div>
          )}

          {/* --- FOOTER (STEPPER & LINKS) --- */}
          <div style={{ marginTop: '2rem' }}>
            {/* Stepper Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {/* Step 1 Circle */}
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: step === 1 ? 'var(--text-primary)' : 'var(--primary)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold'
              }}>
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              
              {/* Line */}
              <div style={{ width: '40px', height: '3px', background: step > 1 ? 'var(--primary)' : '#e2e8f0', borderRadius: '2px' }}></div>
              
              {/* Step 2 Circle */}
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: step === 2 ? 'var(--text-primary)' : '#e2e8f0', 
                color: step === 2 ? 'white' : '#94a3b8', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold'
              }}>
                2
              </div>
            </div>

            {/* Back to Login (Only on Step 1) */}
            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
                  Sudah punya akun?{' '}
                  <Link to="/login" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Masuk</Link>
                </p>
                <div style={{ marginTop: '0.5rem' }}>
                  <Link to="/" className="body-small" style={{ color: 'var(--text-muted)' }}>← Kembali ke Beranda</Link>
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
