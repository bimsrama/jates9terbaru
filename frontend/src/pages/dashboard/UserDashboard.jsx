import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Activity, TrendingUp, Users, Wallet, MessageCircle, Send, X, BookOpen, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserDashboard = () => {
  const { getAuthHeader, user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE CHAT AI ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Halo! Saya Dokter AI Jates9. Ada yang bisa saya bantu terkait program kesehatan Anda?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    // Auto scroll chat ke bawah
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen]);

  const fetchOverview = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard/user/overview`, { headers: getAuthHeader() });
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/chat/send`,
        { message: userMsg },
        { headers: getAuthHeader() }
      );
      setChatHistory(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan koneksi. Coba lagi nanti." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
        <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
          Selamat datang, {overview?.user?.name}! (Group {overview?.user?.group || '-'})
        </p>
      </div>

      {/* --- BAGIAN TUTORIAL (PANDUAN) --- */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} /> Panduan Program
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0284c7' }}>1. Check-in Harian</div>
              <p className="body-small">Isi laporan harian setiap pagi & malam untuk memantau perkembangan ususmu.</p>
            </CardContent>
          </Card>
          <Card style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#16a34a' }}>2. Konsumsi Produk</div>
              <p className="body-small">Minum Jates9 sesuai anjuran (pagi sebelum makan, malam sebelum tidur).</p>
            </CardContent>
          </Card>
          <Card style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#ea580c' }}>3. Konsultasi AI</div>
              <p className="body-small">Gunakan fitur Dokter AI di pojok kanan bawah jika ada keluhan.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* STATS GRID (TETAP SAMA) */}
      <div className="ai-grid" style={{ marginBottom: '2rem' }}>
        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3">{overview?.challenge?.current_day || 1}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Hari ke-</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3">{overview?.financial?.total_referrals || 0}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Teman Diajak</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3">Rp {(overview?.financial?.commission_approved || 0).toLocaleString('id-ID')}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi Cair</p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <button className="btn-primary" onClick={() => window.location.href = '/dashboard/checkin'} style={{ flex: '1', minWidth: '200px' }}>
          📝 Check-in Hari Ini
        </button>
        <button className="btn-secondary" onClick={() => window.location.href = '/dashboard/health-report'} style={{ flex: '1', minWidth: '200px' }}>
          📊 Lihat Rapor Kesehatan
        </button>
      </div>

      {/* --- CHAT DOKTER AI (FLOATING WIDGET) --- */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: 'var(--primary)', color: 'white', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={30} />
          </button>
        )}

        {isChatOpen && (
          <Card style={{ width: '350px', height: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: 'none' }}>
            <div style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                Dokter AI Jates9
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--primary)' : 'white',
                  color: msg.role === 'user' ? 'white' : '#334155',
                  padding: '0.8rem', borderRadius: '12px', maxWidth: '80%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem'
                }}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem' }}>Sedang mengetik...</div>}
              <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleSendChat} style={{ padding: '0.8rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)} 
                placeholder="Tanya keluhan..." 
                style={{ flex: 1, padding: '0.6rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
              <button type="submit" disabled={chatLoading} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </form>
          </Card>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;
