import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, ShoppingCart, Wallet, LayoutDashboard, 
  FileText, PenTool, Check, X, Loader2, Bot, LogOut, 
  MessageSquare, Download, FileSpreadsheet, Send, 
  Smartphone, DollarSign, Calendar, Plus, Award, Menu, Sparkles, Trash2, Clock, Save, Image as ImageIcon, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const GEN_Z_BADGES = [
  "Pejuang Tangguh", "Si Paling Sehat", "Usus Glowing", "Lord of Fiber", 
  "Anti Kembung Club", "King of Metabolism", "Sepuh Jates9", "Healing Master"
];

const AdminDashboard = () => {
  const { getAuthHeader, logout } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [btnLoading, setBtnLoading] = useState(false);

  // Data States
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [articles, setArticles] = useState([]);
  
  // --- STATE GENERATOR WA (BARU) ---
  const [genChallengeName, setGenChallengeName] = useState("");
  const [genTypeA, setGenTypeA] = useState("");
  const [genTypeB, setGenTypeB] = useState("");
  const [genTypeC, setGenTypeC] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchChallenges();
  }, []);

  const fetchStats = async () => {
      try { const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: getAuthHeader() }); setStats(res.data); } catch (e) {}
  };
  const fetchUsers = async () => {
      try { const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: getAuthHeader() }); setUsers(res.data); } catch (e) {}
  };
  const fetchChallenges = async () => {
      try { const res = await axios.get(`${BACKEND_URL}/api/challenges`); setChallenges(res.data); } catch (e) {}
  };

  // --- LOGIC GENERATOR WA ---
  const generatePrompt = () => {
    if (!genChallengeName || !genTypeA || !genTypeB || !genTypeC) {
      alert("Mohon isi Nama Challenge dan Ketiga Tipe Target!");
      return;
    }

    // Ambil kata pertama untuk kode (misal: GERD dari 'GERD Anxiety')
    const codeA = genTypeA.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const codeB = genTypeB.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const codeC = genTypeC.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');

    const template = `
Topik Challenge: ${genChallengeName}
Target Tipe A: ${genTypeA}
Target Tipe B: ${genTypeB}
Target Tipe C: ${genTypeC}

Tolong buatkan konten WhatsApp Broadcast 30 Hari dengan struktur berikut untuk ketiga tipe target di atas.

1. BAGIAN 1: 30 HARI CHALLENGE (Action)
   - Buatkan full dari Hari 1 s/d 30.
   - Kode: CH_[TIPE]_[HARI] (Contoh: CH_${codeA}_01)
   - Isi: Tantangan harian simpel untuk mengubah kebiasaan buruk terkait masalah tersebut.
   - Format: Subject menarik, Isi singkat, Call to Action.

2. BAGIAN 2: 30 HARI FAKTA & TIPS (Edukasi)
   - Buatkan full dari Hari 1 s/d 30.
   - Kode: FT_[TIPE]_[HARI] (Contoh: FT_${codeA}_01)
   - Isi: Fakta mengejutkan atau tips kesehatan terkait masalah tersebut.
   - Format: "Sadar nggak?", Fakta, Tips singkat.

3. BAGIAN 3: SOFT SELLING JATES9
   - HANYA buatkan untuk hari-hari berikut: Hari ke-1, 3, 6, 9, 12, 15, 18, 21, 24, 27, dan 30.
   - Kode: SS_[TIPE]_[HARI] (Contoh: SS_${codeA}_03)
   - Isi: Hubungkan masalah si Tipe tersebut dengan solusi Jates9. Gunakan angle yang bervariasi (rasa sakit, kepraktisan, keamanan herbal, testimoni, hemat/promo).
   - Tone: Persuasif tapi seperti teman (Soft selling), akhiri dengan ajakan chat/order.

STYLE PENULISAN:
- Gaya bahasa: Casual, akrab, cocok untuk Broadcast WhatsApp.
- Gunakan emoji yang sesuai.
- To the point, jangan bertele-tele.

Langsung kerjakan outputnya dalam format tabel atau list yang rapi agar mudah saya copy ke Excel.
    `;
    setGeneratedPrompt(template.trim());
  };

  const handleOpenGemini = () => {
    if (!generatedPrompt) return alert("Generate prompt dulu!");
    
    // Copy ke clipboard
    navigator.clipboard.writeText(generatedPrompt).then(() => {
        alert("Prompt berhasil disalin! Paste (Ctrl+V) di kolom chat Gemini.");
        // Buka Gemini di tab baru
        window.open("https://gemini.google.com/app", "_blank");
    }).catch(err => {
        alert("Gagal menyalin: " + err);
    });
  };

  const handleResetGenerator = () => {
    setGenChallengeName("");
    setGenTypeA("");
    setGenTypeB("");
    setGenTypeC("");
    setGeneratedPrompt("");
  };

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* SIDEBAR */}
      <aside style={{ 
          width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', 
          height: '100vh', position: 'fixed', left: isSidebarOpen ? 0 : '-260px', 
          transition: 'left 0.3s', zIndex: 50, display: 'flex', flexDirection: 'column' 
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>JATES9 ADMIN</h2>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><button onClick={() => { setActiveTab('overview'); setSidebarOpen(window.innerWidth > 1024); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'overview' ? '#dcfce7' : 'transparent', color: activeTab === 'overview' ? '#166534' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'overview' ? '600' : '400' }}><LayoutDashboard size={20} /> Overview</button></li>
            <li><button onClick={() => { setActiveTab('users'); setSidebarOpen(window.innerWidth > 1024); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'users' ? '#dcfce7' : 'transparent', color: activeTab === 'users' ? '#166534' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'users' ? '600' : '400' }}><Users size={20} /> Users</button></li>
            <li><button onClick={() => { setActiveTab('challenges'); setSidebarOpen(window.innerWidth > 1024); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'challenges' ? '#dcfce7' : 'transparent', color: activeTab === 'challenges' ? '#166534' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'challenges' ? '600' : '400' }}><Award size={20} /> Challenges</button></li>
            
            {/* MENU BARU: GENERATOR WA */}
            <li>
              <button 
                onClick={() => { setActiveTab('wa_generator'); setSidebarOpen(window.innerWidth > 1024); }} 
                style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'wa_generator' ? '#dcfce7' : 'transparent', color: activeTab === 'wa_generator' ? '#166534' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'wa_generator' ? '600' : '400' }}
              >
                <Sparkles size={20} /> Generator WA
              </button>
            </li>

          </ul>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={logout} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><LogOut size={20} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, marginLeft: isSidebarOpen && window.innerWidth > 1024 ? '260px' : 0, transition: 'margin-left 0.3s' }}>
        <header style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Menu size={24} color="#334155" /></button>
          <div style={{ fontWeight: 'bold', color: '#166534' }}>Admin Panel</div>
        </header>

        <main style={{ padding: '2rem' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard label="Total User" val={stats.total_users || 0} icon={<Users size={24} />} color="#2563eb" />
                <StatCard label="Total Omset" val={`Rp ${(stats.total_revenue || 0).toLocaleString()}`} icon={<DollarSign size={24} />} color="#16a34a" />
                <StatCard label="Tantangan Aktif" val={challenges.length} icon={<Award size={24} />} color="#ea580c" />
             </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
             <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                 <CardHeader><CardTitle className="heading-3">Daftar Pengguna</CardTitle></CardHeader>
                 <CardContent>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead>
                          <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                             <th style={thStyle}>Nama</th>
                             <th style={thStyle}>WhatsApp</th>
                             <th style={thStyle}>Badge</th>
                          </tr>
                       </thead>
                       <tbody>
                          {users.map(u => (
                             <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={tdStyle}>{u.name}</td>
                                <td style={tdStyle}>{u.phone}</td>
                                <td style={tdStyle}><span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{u.badge}</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </CardContent>
             </Card>
          )}

          {/* TAB 3: CHALLENGES */}
          {activeTab === 'challenges' && (
             <div>
                <h2 className="heading-2" style={{marginBottom:'1rem'}}>Daftar Challenge</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                   {challenges.map(c => (
                      <Card key={c.id} style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                         <CardContent style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                               <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{c.title}</h3>
                               <Award size={20} color="#ea580c" />
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{c.description}</p>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </div>
          )}

          {/* TAB 4: GENERATOR WA CHALLENGE */}
          {activeTab === 'wa_generator' && (
             <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                   <h2 className="heading-2">Generator Konten WA</h2>
                   <p style={{ color: '#64748b' }}>Bikin konten challenge 30 hari otomatis dengan bantuan AI.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                   {/* CARD INPUT */}
                   <Card style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                      <CardHeader><CardTitle className="heading-3">1. Konfigurasi Challenge</CardTitle></CardHeader>
                      <CardContent>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                               <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Nama Program Challenge</label>
                               <input type="text" placeholder="Contoh: Program Bebas Maag 30 Hari" value={genChallengeName} onChange={(e) => setGenChallengeName(e.target.value)} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                               <div>
                                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Tipe A (Masalah)</label>
                                  <input type="text" placeholder="Cth: GERD Anxiety" value={genTypeA} onChange={(e) => setGenTypeA(e.target.value)} style={inputStyle} />
                               </div>
                               <div>
                                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Tipe B (Masalah)</label>
                                  <input type="text" placeholder="Cth: Gastritis Kronis" value={genTypeB} onChange={(e) => setGenTypeB(e.target.value)} style={inputStyle} />
                               </div>
                               <div>
                                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Tipe C (Masalah)</label>
                                  <input type="text" placeholder="Cth: Dyspepsia" value={genTypeC} onChange={(e) => setGenTypeC(e.target.value)} style={inputStyle} />
                               </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                               <button onClick={generatePrompt} style={{ flex: 1, background: '#16a34a', color: 'white', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                  <Sparkles size={18} /> Buat Prompt
                               </button>
                               <button onClick={handleResetGenerator} style={{ background: '#f1f5f9', color: '#64748b', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Trash2 size={18} /> Reset
                               </button>
                            </div>
                         </div>
                      </CardContent>
                   </Card>

                   {/* CARD OUTPUT */}
                   {generatedPrompt && (
                      <Card style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                         <CardHeader>
                            <CardTitle className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                               <Bot size={20} color="#2563eb" /> 2. Hasil Prompt (Siap Copy)
                            </CardTitle>
                         </CardHeader>
                         <CardContent>
                            <textarea 
                               readOnly 
                               value={generatedPrompt} 
                               style={{ width: '100%', height: '300px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical', background: 'white' }}
                            ></textarea>
                            
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                               <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Klik tombol di bawah untuk copy otomatis & buka Gemini:</p>
                               <button 
                                  onClick={handleOpenGemini}
                                  style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}
                               >
                                  <Bot size={24} /> BUKA GEMINI AI & PASTE
                               </button>
                            </div>
                         </CardContent>
                      </Card>
                   )}
                </div>
             </div>
          )}

        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon, color }) => (<Card style={{ border: 'none', background: 'white', padding: '1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}><div><p style={{color:'#64748b'}}>{label}</p><h3>{val}</h3></div><div style={{color:color}}>{icon}</div></Card>);
const inputStyle = { width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' };
const thStyle = { padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' };
const tdStyle = { padding: '0.75rem', fontSize: '0.85rem' };

export default AdminDashboard;
