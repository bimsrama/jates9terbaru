import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, ArrowRight, Check, Loader2, Trophy, Stethoscope, FileText, RefreshCcw, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Gunakan URL Backend dari environment atau default
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const Register = () => {
  const navigate = useNavigate();
  const { register, getAuthHeader } = useAuth();

  // --- STATE UTAMA ---
  // 1 = Form Register
  // 2 = Pilih Challenge
  // 3 = Jawab Quiz
  // 4 = Laporan Hasil (Report)
  // 5 = Sukses & Redirect
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data Form Register
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    referral_code: ''
  });

  // Data Challenge & Quiz
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null); // { type: 'A', score: 80 }

  // --- STYLE UTILS ---
  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '8px',
    border: '1px solid var(--border-light)', background: 'var(--bg-section)', fontSize: '1rem'
  };

  // --- AUTO REDIRECT UNTUK STEP 5 ---
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000); // Redirect setelah 3 detik
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  // ==========================================
  // STEP 1: LOGIC REGISTER
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Password dan Konfirmasi Password tidak cocok');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      phone_number: formData.phone_number,
      password: formData.password,
      referral_code: formData.referral_code || null
    });
    
    if (result.success) {
      await fetchChallenges(); // Ambil data challenge untuk Step 2
      setStep(2);
    } else {
      setError(result.error || 'Gagal mendaftar.');
    }
    setLoading(false);
  };

  // ==========================================
  // STEP 2: LOGIC PILIH CHALLENGE
  // ==========================================
  const fetchChallenges = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/challenges`);
      setChallenges(res.data);
    } catch (err) {
      console.error("Gagal load challenge", err);
    }
  };

  const handleSelectChallenge = async (id) => {
    setSelectedChallengeId(id);
    setLoading(true);
    try {
      // 1. Simpan pilihan ke backend
      await axios.post(
        `${BACKEND_URL}/api/user/select-challenge`, 
        { challenge_id: id },
        { headers: getAuthHeader() }
      );
      
      // 2. Ambil Pertanyaan Kuis untuk challenge ini
      const qRes = await axios.get(
        `${BACKEND_URL}/api/quiz/questions/${id}`,
        { headers: getAuthHeader() }
      );

      if (qRes.data && qRes.data.length > 0) {
        setQuestions(qRes.data);
        setStep(3); // Masuk ke Step 3 (Quiz)
      } else {
        // Fallback jika tidak ada soal, langsung ke Dashboard
        setStep(5);
      }
    } catch (err) {
      setError("Gagal memilih challenge. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 3: LOGIC QUIZ
  // ==========================================
  const handleAnswerOption = (category) => {
    const currentQ = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: category }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateAndSubmitQuiz();
    }
  };

  const calculateAndSubmitQuiz = async () => {
    setLoading(true);
    // Hitung Kategori Terbanyak (Logic Sederhana)
    const counts = { A: 0, B: 0, C: 0, Sehat: 0 };
    Object.values(answers).forEach(cat => { if (counts[cat] !== undefined) counts[cat]++; });
    
    let resultType = "A";
    let maxCount = -1;
    ['C', 'B', 'A'].forEach(type => {
      if (counts[type] > maxCount) { maxCount = counts[type]; resultType = type; }
    });

    try {
      // Simpan ke Backend
      await axios.post(
        `${BACKEND_URL}/api/quiz/submit`,
        { answers: answers, score: 80, health_type: resultType },
        { headers: getAuthHeader() }
      );

      setQuizResult({ type: resultType });
      setStep(4); // Masuk ke Step 4 (Laporan Hasil)
    } catch (err) {
      setError("Gagal menyimpan hasil kuis.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Card style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', minHeight: '650px' }}>
        
        {/* HEADER DINAMIS SESUAI STEP */}
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
            {step === 1 && "Bergabung dengan JATES9"}
            {step === 2 && "Pilih Program Sehatmu"}
            {step === 3 && "Cek Kondisi Tubuh"}
            {step === 4 && "Analisa Kesehatan Anda"}
            {step === 5 && "Registrasi Selesai!"}
          </CardTitle>
          
          <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 && "Langkah 1: Isi Biodata Diri"}
            {step === 2 && "Langkah 2: Tentukan Tantangan 30 Hari"}
            {step === 3 && `Pertanyaan ${currentQuestionIndex + 1} dari ${questions.length}`}
            {step === 4 && "Berdasarkan jawaban kuis Anda"}
            {step === 5 && "Akun Anda telah siap."}
          </p>

          {/* Progress Bar untuk Quiz (Step 3) */}
          {step === 3 && (
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '1rem' }}>
              <div style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
            </div>
          )}
        </CardHeader>

        <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* ERROR ALERT */}
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* === TAMPILAN STEP 1: FORM REGISTER === */}
          {step === 1 && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="body-small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Nama Lengkap *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Anda" required style={inputStyle} />
              </div>
              <div>
                <label className="body-small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Nomor WhatsApp *</label>
                <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="0812xxxxxxx" required style={inputStyle} />
              </div>
              <div>
                <label className="body-small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Password *</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required minLength={6} style={inputStyle} />
              </div>
              <div>
                <label className="body-small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Konfirmasi Password *</label>
                <input type="password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} placeholder="Ulangi password" required style={inputStyle} />
              </div>
              <div>
                <label className="body-small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Kode Referral (Opsional)</label>
                <input type="text" value={formData.referral_code} onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })} placeholder="Contoh: JATES123" style={{...inputStyle, textTransform: 'uppercase'}} />
              </div>
              <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? <Loader2 className="animate-spin" /> : <>Lanjut <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} /></>}
              </Button>
            </form>
          )}

          {/* === TAMPILAN STEP 2: PILIH CHALLENGE === */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {challenges.length === 0 ? <div className="text-center text-gray-500">Memuat Tantangan...</div> : challenges.map((c) => (
                <div key={c.id} onClick={() => handleSelectChallenge(c.id)}
                  style={{
                    border: selectedChallengeId === c.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: selectedChallengeId === c.id ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-section)',
                    borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative'
                  }}>
                  <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏆</div>
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{c.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.description}</p>
                  </div>
                  {loading && selectedChallengeId === c.id && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin text-green-600" /></div>}
                </div>
              ))}
            </div>
          )}

          {/* === TAMPILAN STEP 3: QUIZ === */}
          {step === 3 && questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>{questions[currentQuestionIndex].question_text}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {questions[currentQuestionIndex].options.map((opt, idx) => {
                  const isSelected = answers[questions[currentQuestionIndex].id] === opt.category;
                  return (
                    <div key={idx} onClick={() => handleAnswerOption(opt.category)}
                      style={{
                        padding: '1rem', borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                        background: isSelected ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-section)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                      <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.text}</span>
                      {isSelected && <Check size={18} className="text-green-600" />}
                    </div>
                  );
                })}
              </div>
              <Button className="btn-primary" onClick={handleNextQuestion} disabled={!answers[questions[currentQuestionIndex].id] || loading} style={{ width: '100%', marginTop: '2rem' }}>
                {loading ? <Loader2 className="animate-spin" /> : (currentQuestionIndex === questions.length - 1 ? "Lihat Hasil Analisa" : "Selanjutnya")}
              </Button>
            </div>
          )}

          {/* === TAMPILAN STEP 4: HASIL REPORT === */}
          {step === 4 && quizResult && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 className="heading-3">Tipe Pencernaan:</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#166534', margin: '0.5rem 0' }}>
                  Tipe {quizResult.type}
                </div>
                <p className="body-medium" style={{ color: '#4b5563' }}>
                  {quizResult.type === 'A' && "Kecenderungan Sembelit & Kurang Serat"}
                  {quizResult.type === 'B' && "Kecenderungan Kembung & Sensitif"}
                  {quizResult.type === 'C' && "Kecenderungan Maag & Asam Lambung"}
                  {quizResult.type === 'Sehat' && "Pencernaan Sehat & Terjaga"}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* TOMBOL UTAMA: MASUK DASHBOARD (Trigger Step 5) */}
                <Button 
                  className="btn-primary" 
                  onClick={() => setStep(5)} // Pindah ke Step 5 (Sukses)
                  style={{ width: '100%', padding: '1rem' }}
                >
                  Daftar Program 30 Hari <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </Button>

                {/* TOMBOL SEKUNDER: KEMBALI PILIH CARD */}
                <Button 
                  variant="outline"
                  onClick={() => {
                     setStep(2); // Kembali ke pilih challenge
                     setAnswers({}); // Reset jawaban
                     setQuizResult(null);
                  }}
                  style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)' }}
                >
                  <RefreshCcw size={18} style={{ marginRight: '0.5rem' }} /> Pilih Program Lain
                </Button>
              </div>
            </div>
          )}

          {/* === TAMPILAN STEP 5: SUKSES & REDIRECT === */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', 
                color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
              }}>
                <Check size={48} />
              </div>
              <h3 className="heading-2" style={{ color: '#16a34a', marginBottom: '1rem' }}>Selamat!</h3>
              <p className="body-medium" style={{ color: '#4b5563', marginBottom: '2rem' }}>
                Registrasi Anda sudah selesai.<br/>Anda akan diarahkan ke Dashboard Profil Anda...
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', color: 'var(--primary)' }}>
                <Loader2 className="animate-spin" /> Mengalihkan...
              </div>
            </div>
          )}

          {/* FOOTER NAVIGASI (Hanya muncul di Step 1) */}
          {step === 1 && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
                Sudah punya akun? <Link to="/login" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Masuk</Link>
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/" className="body-small" style={{ color: 'var(--text-muted)' }}>← Kembali ke Beranda</Link>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
