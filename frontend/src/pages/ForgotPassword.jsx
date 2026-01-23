import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { KeyRound, Smartphone, Lock, ArrowRight, Loader2, CheckCircle, ChevronLeft } from 'lucide-react';
import axios from 'axios';

// URL Backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // State Steps: 1=Phone, 2=OTP, 3=NewPassword, 4=Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- STEP 1: REQUEST OTP ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password-request`, { phone_number: phoneNumber });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Nomor tidak ditemukan.");
    } finally { setLoading(false); }
  };

  // --- STEP 2: VERIFY OTP (Client Side Check Only / Move to next step) ---
  // Di sini kita belum submit ke server, user harus isi password dulu baru submit OTP + Password sekaligus
  const handleVerifyOtpStep = (e) => {
    e.preventDefault();
    if (otpCode.length < 6) { setError("Masukkan 6 digit OTP"); return; }
    setError('');
    setStep(3);
  };

  // --- STEP 3: SUBMIT NEW PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Password tidak cocok"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    
    setLoading(true); setError('');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password-confirm`, {
        phone_number: phoneNumber,
        otp: otpCode,
        new_password: password
      });
      setStep(4); // Success
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengubah password.");
      if (err.response?.data?.message?.includes('OTP')) setStep(2); // Balik ke OTP jika salah
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px',
    border: '1px solid var(--border-light)', background: 'var(--bg-section)', fontSize: '1rem', outline: 'none'
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
        
        <CardHeader style={{ textAlign: 'center', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gradient-button)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="heading-2" style={{ marginBottom: '0.5rem' }}>Reset Kata Sandi</CardTitle>
          <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 && "Masukkan nomor WhatsApp terdaftar"}
            {step === 2 && "Masukkan Kode OTP dari WhatsApp"}
            {step === 3 && "Buat Kata Sandi Baru"}
            {step === 4 && "Berhasil!"}
          </p>
        </CardHeader>

        <CardContent>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          {/* --- FORM STEP 1: PHONE --- */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ position: 'relative' }}>
                <Smartphone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0812xxxx (Nomor WA)" required style={inputStyle} />
              </div>
              <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? <Loader2 className="animate-spin" /> : <>Kirim OTP <ArrowRight size={18} style={{ marginLeft: '8px' }} /></>}
              </Button>
            </form>
          )}

          {/* --- FORM STEP 2: OTP --- */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtpStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'center' }}>
              <p className="body-small">Kode dikirim ke: <strong>{phoneNumber}</strong></p>
              <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))} placeholder="6 Digit OTP" required style={{ ...inputStyle, padding: '0.8rem', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }} />
              <Button type="submit" className="btn-primary" style={{ width: '100%' }}>Lanjut <ArrowRight size={18} /></Button>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>Ganti Nomor</button>
            </form>
          )}

          {/* --- FORM STEP 3: NEW PASSWORD --- */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata Sandi Baru" required minLength={6} style={inputStyle} />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi Kata Sandi" required style={inputStyle} />
              </div>
              <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? <Loader2 className="animate-spin" /> : "Simpan Kata Sandi"}
              </Button>
            </form>
          )}

          {/* --- FORM STEP 4: SUCCESS --- */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}>Berhasil!</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Kata sandi Anda telah diperbarui.</p>
              <Button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
                Masuk ke Akun
              </Button>
            </div>
          )}

          {step !== 4 && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" className="body-small" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ChevronLeft size={16} /> Kembali ke Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
