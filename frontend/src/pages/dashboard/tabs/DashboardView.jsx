import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  Activity, User, Medal, Edit2, Copy, ChevronRight, 
  CheckCircle, Clock, Bot, Sparkles, Send, FileText, 
  RefreshCw, TrendingUp, X 
} from 'lucide-react';
import axios from 'axios';

const DashboardView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, userOverview, fetchUserOverview, setActiveTab }) => {
  const [challenges, setChallenges] = useState([]);
  const [articles, setArticles] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [journal, setJournal] = useState("");
  const [quote, setQuote] = useState("Sehat itu investasi, bukan pengeluaran.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null); // State Modal Artikel

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: "assistant", content: "Halo! Saya Dr. Alva AI. Ada keluhan apa hari ini?" }]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { loadAllData(); setQuote(getRandomQuote()); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const loadAllData = async () => {
      if(fetchUserOverview) fetchUserOverview();
      try {
          const [challRes, artRes, dailyRes] = await Promise.all([
              axios.get(`${BACKEND_URL}/api/challenges`),
              axios.get(`${BACKEND_URL}/api/admin/articles`),
              axios.get(`${BACKEND_URL}/api/daily-content`, { headers: getAuthHeader() })
          ]);
          setChallenges(challRes.data);
          setArticles(artRes.data);
          setDailyData(dailyRes.data);
          setCheckinStatus(dailyRes.data.today_status);
      } catch (e) { console.error("Gagal load data", e); }
  };

  const getRandomQuote = () => { const quotes = ["Sehat itu investasi.", "Tubuhmu adalah aset.", "Jangan tunggu sakit.", "Mulai hari ini."]; return quotes[Math.floor(Math.random() * quotes.length)]; };
  const handleRefresh = async () => { setIsRefreshing(true); await loadAllData(); setQuote(getRandomQuote()); setIsRefreshing(false); };
  const copyReferral = () => { navigator.clipboard.writeText(userOverview?.user?.referral_code || ""); alert("Kode referral berhasil disalin!"); };
  
  const handleSwitchChallenge = async (id) => { 
      if(window.confirm("Ganti challenge? Progress akan reset.")) { 
          try { await axios.post(`${BACKEND_URL}/api/user/select-challenge`, {challenge_id: id}, {headers: getAuthHeader()}); alert("Berhasil!"); handleRefresh(); } 
          catch(e){ alert("Gagal."); } 
      } 
  };

  const handleSubmitCheckin = async (status) => { 
      if(isSubmitting) return; setIsSubmitting(true); 
      try { await axios.post(`${BACKEND_URL}/api/checkin`, {journal, status}, {headers:getAuthHeader()}); setCheckinStatus(status); fetchUserOverview(); alert("Berhasil!"); } 
      catch(e) { alert("Gagal."); } finally { setIsSubmitting(false); } 
  };

  const handleSendChat = async (e) => { 
      e.preventDefault(); if(!chatMessage.trim()) return; const msg = chatMessage; setChatHistory(p => [...p, {role:"user", content:msg}]); setChatMessage(""); setChatLoading(true); 
      try { const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()}); setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]); } 
      catch (e) { setChatHistory(p => [...p, {role:"assistant", content:"Error koneksi."}]); } finally { setChatLoading(false); } 
  };

  const badgeStyle = { background: 'linear-gradient(45deg, #FFD700, #FDB931)', color: '#7B3F00', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' };

  return (
    <div>
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
            <button onClick={handleRefresh} style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'transparent', border:'none', cursor:'pointer', color: darkMode?'#cbd5e1':'#64748b', fontSize:'0.8rem'}}><RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""}/> {isRefreshing ? "Memuat..." : "Segarkan Data"}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1.3fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
            {/* KOLOM KIRI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom:'1.5rem'}}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white' }}>
                                    {userOverview?.user?.profile_picture ? <img src={`${BACKEND_URL}${userOverview.user.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={35} color={currentTheme.text} />}
                                </div>
                                <button onClick={() => setActiveTab('settings')} style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'white', borderRadius: '50%', padding: '4px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}><Edit2 size={12} color="#475569" /></button>
                            </div>
                            <div><h2 style={{ marginBottom: '0.3rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{userOverview?.user?.name || "User"}</h2><div style={badgeStyle}><Medal size={14} /> {userOverview?.user?.badge || "Newbie"}</div></div>
                        </div>
                        <div style={{background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', padding:'1rem', borderRadius:'12px', border: '1px solid rgba(255,255,255,0.4)'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div><p style={{fontSize:'0.75rem', fontWeight:'bold', opacity:0.8, marginBottom:'2px'}}>KODE REFERRAL</p><h2 style={{fontSize:'1.4rem', fontWeight:'bold', letterSpacing:'1px'}}>{userOverview?.user?.referral_code || "..."}</h2></div>
                                <button onClick={copyReferral} style={{background:'white', color: currentTheme.text, border:'none', padding:'0.5rem 1rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'0.5rem'}}><Copy size={16}/> Salin</button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* TANTANGAN AKTIF */}
                <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}><h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: currentTheme.text, display:'flex', alignItems:'center', gap:'0.5rem' }}><Activity size={18} /> Tantangan Aktif</h3></div>
                        <div style={{ background: darkMode ? '#334155' : '#f8fafc', borderRadius: '12px', padding: '1rem', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', color: darkMode ? 'white' : '#0f172a' }}>{challenges.find(c => c.id === userOverview?.user?.challenge_id)?.title || "Belum Ada Challenge"}</h4>
                                <span style={{ fontSize: '0.75rem', background: currentTheme.light, color: currentTheme.text, padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Tipe {userOverview?.user?.group || 'Umum'}</span>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem'}}>
                                <div style={{background: darkMode?'#1e293b':'white', padding:'0.5rem', borderRadius:'6px', border:'1px solid #e2e8f0'}}><div style={{fontSize:'0.7rem', color:'#64748b'}}>Berhasil</div><div style={{fontSize:'1rem', fontWeight:'bold', color:'#166534'}}>{userOverview?.financial?.total_checkins || 0} Hari</div></div>
                                <div style={{background: darkMode?'#1e293b':'white', padding:'0.5rem', borderRadius:'6px', border:'1px solid #e2e8f0'}}><div style={{fontSize:'0.7rem', color:'#64748b'}}>Terlewat</div><div style={{fontSize:'1rem', fontWeight:'bold', color:'#991b1b'}}>{userOverview?.user?.missed_days || 0} Hari</div></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}><span>Progress</span><span>{Math.round(Math.min(((userOverview?.financial?.total_checkins || 0) / 30) * 100, 100))}%</span></div>
                                    <div style={{ height: '6px', background: darkMode ? '#475569' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${Math.min(((userOverview?.financial?.total_checkins || 0) / 30) * 100, 100)}%`, height: '100%', background: currentTheme.primary, borderRadius: '4px' }}></div></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardHeader style={{paddingBottom:'0.5rem'}}><div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><CardTitle style={{fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'0.5rem', color: darkMode?'white':'black'}}><Activity size={20} color={currentTheme.text}/> Misi Hari Ini</CardTitle>{checkinStatus === 'completed' && <span style={{fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold'}}><CheckCircle size={12}/> Selesai</span>}</div></CardHeader>
                    <CardContent>
                        {dailyData && <div style={{ background: darkMode ? '#334155' : '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${currentTheme.text}`, marginBottom: '1rem' }}><h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: currentTheme.text, marginBottom: '0.2rem' }}>Info Sehat:</h4><p style={{ fontSize: '0.9rem', color: darkMode ? '#e2e8f0' : '#334155' }}>{dailyData.fact || dailyData.message}</p></div>}
                        {(checkinStatus === 'completed' || checkinStatus === 'skipped') ? (<div style={{textAlign:'center', padding:'1.5rem', background: checkinStatus === 'completed' ? '#f0fdf4' : '#fef2f2', borderRadius:'12px', color: checkinStatus === 'completed' ? '#166534' : '#991b1b', fontWeight:'bold'}}>Misi Hari Ini Selesai! 🎉</div>) : (<div>{dailyData?.tasks?.map((t,i) => (<div key={i} style={{padding:'0.5rem', borderBottom:'1px solid #eee', display:'flex', gap:'0.5rem', alignItems:'center', color: darkMode?'white':'black'}}><div style={{width:'6px', height:'6px', borderRadius:'50%', background: currentTheme.primary}}></div> {t}</div>))}<textarea value={journal} onChange={e=>setJournal(e.target.value)} placeholder="Tulis jurnal..." style={{width:'100%', padding:'0.8rem', marginTop:'1rem', borderRadius:'8px', border:'1px solid #ccc', color:'black'}}></textarea><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}><button onClick={() => handleSubmitCheckin('skipped')} disabled={isSubmitting} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Lewati</button><button onClick={() => handleSubmitCheckin('completed')} disabled={isSubmitting} style={{ background: currentTheme.primary, color: 'black', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Selesai</button></div></div>)}
                    </CardContent>
                </Card>

                <div>
                    <h3 style={{fontSize:'1rem', fontWeight:'bold', marginBottom:'0.8rem', color: darkMode?'white':'black'}}>Rekomendasi Challenge</h3>
                    <div className="scroll-hide" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%' }}>{challenges.map((ch) => (<div key={ch.id} style={{ minWidth: '200px', maxWidth: '200px', background: darkMode ? '#334155' : 'white', border: darkMode ? 'none' : '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display:'flex', flexDirection:'column', justifyContent:'space-between', flexShrink: 0 }}><div><div style={{width:'36px', height:'36px', background: currentTheme.light, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.5rem'}}><TrendingUp size={18} color={currentTheme.text}/></div><h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: darkMode ? 'white' : '#0f172a', marginBottom:'0.3rem' }}>{ch.title}</h4><p style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ch.description}</p></div><button onClick={() => handleSwitchChallenge(ch.id)} style={{ marginTop: '0.8rem', width: '100%', padding: '0.4rem', border: `1px solid ${currentTheme.text}`, background: 'transparent', color: currentTheme.text, borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Pilih</button></div>))}</div>
                </div>
            </div>

            {/* KOLOM KANAN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card ref={chatEndRef} style={{ background: darkMode ? '#1e293b' : 'white', height: '450px', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding: '1rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem', background: darkMode ? '#1e293b' : '#f8fafc' }}><div style={{ width: '40px', height: '40px', background: currentTheme.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color={currentTheme.text} /></div><div><h3 style={{fontWeight:'bold', color: darkMode?'white':'black'}}>Dr. Alva AI <Sparkles size={14} fill={currentTheme.primary} style={{display:'inline'}}/></h3><p style={{fontSize:'0.75rem', color:'#64748b'}}>Tanyakan keluhan kesehatanmu</p></div></div>
                    <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>{chatHistory.map((msg, i) => (<div key={i} style={{ padding:'0.6rem 1rem', borderRadius:'12px', marginBottom:'0.5rem', maxWidth:'85%', alignSelf: msg.role==='user'?'flex-end':'flex-start', marginLeft: msg.role==='user'?'auto':0, background: msg.role==='user'?currentTheme.light:(darkMode?'#334155':'#f1f5f9'), color: msg.role==='user'?'#1e3a8a':(darkMode?'white':'black') }}>{msg.content}</div>))}{chatLoading && <div style={{fontSize:'0.8rem', color:'#888'}}>Dr. Alva sedang mengetik...</div>}<div ref={chatEndRef}></div></div>
                    <form onSubmit={handleSendChat} style={{padding:'1rem', borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', display:'flex', gap:'0.5rem'}}><input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'0.7rem', borderRadius:'20px', border:'1px solid #ccc', color:'black'}} placeholder="Tanya sesuatu..." /><button type="submit" style={{background: currentTheme.primary, border:'none', width:'40px', height:'40px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><Send size={18}/></button></form>
                </Card>

                {/* ARTIKEL LIST */}
                <div>
                    <h3 style={{fontWeight:'bold', marginBottom:'1rem', color: darkMode?'white':'black'}}>Artikel Kesehatan</h3>
                    {articles.map(art => (
                        <div key={art.id} onClick={() => setSelectedArticle(art)} style={{display:'flex', gap:'1rem', padding:'1rem', background: darkMode?'#334155':'white', borderRadius:'12px', marginBottom:'0.5rem', cursor:'pointer', border: darkMode?'none':'1px solid #e2e8f0'}}>
                            <div style={{width:'40px', height:'40px', background: currentTheme.light, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}><FileText size={20} color={currentTheme.text}/></div>
                            <div>
                                <h4 style={{fontWeight:'bold', fontSize:'0.9rem', color: darkMode?'white':'black'}}>{art.title}</h4>
                                <p style={{fontSize:'0.75rem', color:'#64748b', display:'flex', alignItems:'center', gap:'4px'}}>
                                    <Clock size={12}/> {art.reading_time || "3 min"} baca
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div style={{ paddingBottom: '3rem', textAlign: 'center', marginTop: '2rem' }}><p style={{ fontStyle: 'italic', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem', marginBottom: '1rem', padding: '0 1rem' }}>"{quote}"</p><button onClick={handleRefresh} disabled={isRefreshing} style={{ background: 'transparent', border: 'none', color: darkMode ? '#cbd5e1' : '#475569', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 auto', cursor: 'pointer' }}><RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> {isRefreshing ? "Memuat ulang..." : "Refresh Halaman"}</button></div>

        {/* MODAL BACA ARTIKEL (YANG HILANG) */}
        {selectedArticle && (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={()=>setSelectedArticle(null)}>
                <div style={{background: darkMode?'#1e293b':'white', width:'90%', maxWidth:'600px', maxHeight:'80vh', overflowY:'auto', borderRadius:'16px', padding:'2rem', position:'relative', color: darkMode?'white':'black'}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setSelectedArticle(null)} style={{position:'absolute', right:'1rem', top:'1rem', background:'none', border:'none', cursor:'pointer'}}><X size={24} color={darkMode?'white':'black'}/></button>
                    <h2 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem', paddingRight:'2rem'}}>{selectedArticle.title}</h2>
                    {selectedArticle.image_url && <img src={`${BACKEND_URL}${selectedArticle.image_url}`} style={{width:'100%', borderRadius:'8px', marginBottom:'1rem'}}/>}
                    <div style={{lineHeight:'1.6', fontSize:'0.95rem', whiteSpace:'pre-line'}}>{selectedArticle.content}</div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DashboardView;
