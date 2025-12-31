import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Leaf, ArrowRight, Check, Loader2, Trophy, Stethoscope, FileText, 
  RefreshCcw, CheckCircle, ShieldCheck, Phone, User, Lock, Edit2, RefreshCw, Medal, Users 
} from 'lucide-react';
import axios from 'axios';

// URL Backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const Register = () => {
  const navigate = useNavigate();
  const { register, getAuthHeader } = useAuth();

  // --- STATE ALUR ---
  // 1 = Form Data
  // 2 = Pilih Challenge
  // 3 = Jawab Quiz
  // 4 = Laporan Hasil
  // 4.5 = Animasi Badge (NEW STEP)
  // 5 = Sukses & Redirect
  const [step, setStep] = useState(1);
  
  // --- STATE LAIN ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Data
  const [formData, setFormData] = useState({
    name: '', phone_number: '', password: '', confirm_password: '', referral_code: ''
  });
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const inputStyle = {
    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px',
    border: '1px solid var(--border-light)', background: 'var(--bg-section)', fontSize: '1rem', outline: 'none'
  };

  // --- AUTO REDIRECT STEP 5 ---
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => navigate('/dashboard'), 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  // --- STEP 4.5: ANIMASI BADGE ---
  useEffect(() => {
    if (step === 4.5) {
      // Tahan animasi lebih lama (6 detik) agar user sempat baca infonya
      const timer = setTimeout(() => setStep(5), 6000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- HANDLER OTP & REGISTER ---
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm_password) { setError('Password tidak cocok'); return; }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/request-otp`, { phone_number: formData.phone_number });
      setShowOtpModal(true);
      startResendTimer();
    } catch (err) { setError(err.response?.data?.message || 'Gagal kirim OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerifyAndRegister = async () => {
    if (!otpCode) return alert("Masukkan kode OTP");
    setOtpLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/verify-otp`, { phone_number: formData.phone_number, otp: otpCode });
      const regRes = await register({ name: formData.name, phone_number: formData.phone_number, password: formData.password, referral_code: formData.referral_code });
      if (regRes.success) {
        setShowOtpModal(false);
        await fetchChallenges();
        setStep(2);
      } else { alert(regRes.error || "Gagal membuat akun."); }
    } catch (err) { alert(err.response?.data?.message || "Kode OTP Salah."); }
    finally { setOtpLoading(false); }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try { await axios.post(`${BACKEND_URL}/api/auth/request-otp`, { phone_number: formData.phone_number }); startResendTimer(); alert("OTP dikirim!"); }
    catch (err) { alert("Gagal kirim ulang."); }
  };

  // --- HANDLER CHALLENGE & QUIZ ---
  const fetchChallenges = async () => {
    try { const res = await axios.get(`${BACKEND_URL}/api/challenges`); setChallenges(res.data); }
    catch (err) { console.error(err); }
  };

  const handleSelectChallenge = async (id) => {
    setSelectedChallengeId(id); setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/user/select-challenge`, { challenge_id: id }, { headers: getAuthHeader() });
      const qRes = await axios.get(`${BACKEND_URL}/api/quiz/questions/${id}`, { headers: getAuthHeader() });
      if (qRes.data && qRes.data.length > 0) { setQuestions(qRes.data); setStep(3); }
      else { setStep(4.5); } 
    } catch (err) { setError("Gagal pilih challenge."); }
    finally { setLoading(false); }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
    else calculateAndSubmitQuiz();
  };

  const calculateAndSubmitQuiz = async () => {
    setLoading(true);
    const counts = { A: 0, B: 0, C: 0 };
    Object.values(answers).forEach(cat => { if (counts[cat] !== undefined) counts[cat]++; });
    let resultType = "A"; let maxCount = -1;
    ['C', 'B', 'A'].forEach(type => { if (counts[type] > maxCount) { maxCount = counts[type]; resultType = type; } });

    try {
      await axios.post(`${BACKEND_URL}/api/quiz/submit`, { health_type: resultType }, { headers: getAuthHeader() });
      setQuizResult({ type: resultType });
      setStep(4);
    } catch (err) { setError("Gagal simpan kuis."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)', paddingTop: '2rem', paddingBottom: '2rem' }}>
      
      {/* CARD KHUSUS ANIMASI BADGE (Step 4.5) */}
      {step === 4.5 ? (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.8s ease-in-out', maxWidth: '400px', width: '100%' }}>
          <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
             <div style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(circle, rgba(253, 224, 71, 0.5) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
             <Trophy size={110} color="#ca8a04" style={{ filter: 'drop-shadow(0 10px 15px rgba(234, 179, 8, 0.5))', transform: 'scale(1.1)' }} />
          </div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '0.5rem' }}>SELAMAT!</h2>
          
          <div style={{ background: 'white', color: '#ca8a04', padding: '0.6rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
             <Medal size={24}/> Pejuang Tangguh
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '1.5rem', borderRadius: '16px', color: '#334155', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left' }}>
             <h4 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} className="text-blue-600" /> Apa itu Badge?
             </h4>
             <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '0.8rem' }}>
               Badge adalah simbol pencapaian untuk Anda, para pejuang sehat yang konsisten!
             </p>
             <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#475569' }}>
               Dapatkan badge-badge lainnya dengan menyelesaikan tantangan, dan jalin pertemanan dengan pejuang hidup sehat lainnya.
             </p>
          </div>
        </div>
      ) : (
        /* KARTU STEP NORMAL 1, 2, 3, 4, 5 */
        <Card style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', minHeight: '650px', position: 'relative' }}>
          <CardHeader style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: step === 5 ? '#22c55e' : 'var(--gradient-button)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step === 1 && <Leaf className="h-8 w-8 text-white" />}
                {step === 2 && <Trophy className="h-8 w-8 text-white" />}
                {step === 3 && <Stethoscope className="h-8 w-8 text-white" />}
                {step === 4 && <FileText className="h-8 w-8 text-white" />}
                {step === 5 && <CheckCircle className="h-8 w-8 text-white" />}
              </div>
            </div>
            
            <CardTitle className="heading-2" style={{ marginBottom: '0.5rem' }}>
              {step === 1 && "Daftar Akun Baru"}
              {step === 2 && "Pilih Program Sehatmu"}
              {step === 3 && "Cek Kondisi Tubuh"}
              {step === 4 && "Analisa Kesehatan Anda"}
              {step === 5 && "Registrasi Selesai!"}
            </CardTitle>
            
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              {step === 1 && "Langkah 1: Isi Data & Verifikasi WA"}
              {step === 2 && "Langkah 2: Tentukan Tantangan"}
              {step === 3 && `Pertanyaan ${currentQuestionIndex + 1} dari ${questions.length}`}
              {step === 4 && "Berdasarkan jawaban kuis Anda"}
              {step === 5 && "Akun Anda telah siap."}
            </p>

            {step === 3 && (
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '1rem' }}>
                <div style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
              </div>
            )}
          </CardHeader>

          <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

            {step === 1 && (
              <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}><User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Lengkap" required style={inputStyle} /></div>
                <div style={{ position: 'relative' }}><Phone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><input type="tel" name="phone_number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="Nomor WhatsApp" required style={inputStyle} /></div>
                <div style={{ position: 'relative' }}><Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" required minLength={6} style={inputStyle} /></div>
                <div style={{ position: 'relative' }}><Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><input type="password" name="confirm_password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} placeholder="Ulangi Password" required style={inputStyle} /></div>
                <input type="text" name="referral_code" value={formData.referral_code} onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })} placeholder="Kode Referral (Opsional)" style={{...inputStyle, paddingLeft: '0.75rem'}} />
                <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>{loading ? <Loader2 className="animate-spin" /> : <>Daftar & Verifikasi WA <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} /></>}</Button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}><p className="body-small" style={{ color: 'var(--text-secondary)' }}>Sudah punya akun? <Link to="/login" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Masuk</Link></p></div>
              </form>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {challenges.length === 0 ? <div className="text-center text-gray-500">Memuat Tantangan...</div> : challenges.map((c) => (
                  <div key={c.id} onClick={() => handleSelectChallenge(c.id)} style={{ border: selectedChallengeId === c.id ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: selectedChallengeId === c.id ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-section)', borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                    <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏆</div>
                    <div><h4 style={{ fontWeight: 'bold' }}>{c.title}</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.description}</p></div>
                    {loading && selectedChallengeId === c.id && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin text-green-600" /></div>}
                  </div>
                ))}
              </div>
            )}

            {step === 3 && questions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>{questions[currentQuestionIndex].question_text}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {questions[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = answers[questions[currentQuestionIndex].id] === opt.category;
                    return (
                      <div key={idx} onClick={() => handleAnswerOption(opt.category)} style={{ padding: '1rem', borderRadius: '10px', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: isSelected ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-section)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.text}</span>{isSelected && <Check size={18} className="text-green-600" />}
                      </div>
                    );
                  })}
                </div>
                <Button className="btn-primary" onClick={handleNextQuestion} disabled={!answers[questions[currentQuestionIndex].id] || loading} style={{ width: '100%', marginTop: '2rem' }}>{loading ? <Loader2 className="animate-spin" /> : (currentQuestionIndex === questions.length - 1 ? "Lihat Hasil Analisa" : "Selanjutnya")}</Button>
              </div>
            )}

            {step === 4 && quizResult && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="heading-3">Tipe Pencernaan:</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#166534', margin: '0.5rem 0' }}>Tipe {quizResult.type}</div>
                  <p className="body-medium" style={{ color: '#4b5563' }}>
                    {quizResult.type === 'A' && "Kecenderungan Sembelit & Kurang Serat"}
                    {quizResult.type === 'B' && "Kecenderungan Kembung & Sensitif"}
                    {quizResult.type === 'C' && "Kecenderungan Maag & Asam Lambung"}
                    {quizResult.type === 'Sehat' && "Pencernaan Sehat & Terjaga"}
                  </p>
                </div>
                <Button className="btn-primary" onClick={() => setStep(4.5)} style={{ width: '100%', padding: '1rem' }}>
                  Daftar Program 30 Hari <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </Button>
                <Button variant="outline" onClick={() => { setStep(2); setAnswers({}); setQuizResult(null); }} style={{ width: '100%', marginTop: '1rem', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}><RefreshCcw size={18} style={{ marginRight: '0.5rem' }} /> Pilih Program Lain</Button>
              </div>
            )}

            {step === 5 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}><Check size={48} /></div>
                <h3 className="heading-2" style={{ color: '#16a34a', marginBottom: '1rem' }}>Terima Kasih Telah Mendaftar!</h3>
                <p className="body-medium" style={{ color: '#4b5563', marginBottom: '2rem' }}>Anda akan diarahkan ke profil kesehatan Anda...</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', color: 'var(--primary)' }}><Loader2 className="animate-spin" /> Mengalihkan...</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL OTP */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '60px', height: '60px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><ShieldCheck size={32} color="#16a34a" /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Verifikasi WhatsApp</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Kode OTP telah dikirim ke nomor:<br/><strong>{formData.phone_number}</strong></p>
            <input type="text" placeholder="6 Digit Kode" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))} style={{ width: '100%', padding: '0.8rem', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', outline: 'none' }} />
            <button onClick={handleVerifyAndRegister} disabled={otpLoading || otpCode.length < 6} style={{ width: '100%', background: '#16a34a', color: 'white', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem', opacity: (otpLoading || otpCode.length < 6) ? 0.7 : 1 }}>{otpLoading ? 'Memverifikasi...' : 'Verifikasi & Lanjut'}</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <button onClick={() => { setShowOtpModal(false); setOtpCode(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={14}/> Ubah Nomor</button>
              <button onClick={handleResendOtp} disabled={resendTimer > 0} style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#cbd5e1' : '#4f46e5', cursor: resendTimer > 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={14}/> {resendTimer > 0 ? `Kirim Ulang (${resendTimer}s)` : 'Kirim Ulang'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
