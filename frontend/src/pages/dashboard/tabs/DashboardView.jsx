import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Activity, User, Medal, Edit2, QrCode, ChevronRight, CheckCircle, Clock, Bot, Sparkles, Send, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios';

const DashboardView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, userOverview, fetchUserOverview, setActiveTab }) => {
  // State Lokal Dashboard
  const [challenges, setChallenges] = useState([]);
  const [articles, setArticles] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [journal, setJournal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chat AI State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: "assistant", content: "Halo! Saya Dr. Alva AI. Ada keluhan apa hari ini?" }]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
      fetchUserOverview(); // Refresh data user saat masuk dashboard
      axios.get(`${BACKEND_URL}/api/challenges`).then(res => setChallenges(res.data));
      axios.get(`${BACKEND_URL}/api/admin/articles`).then(res => setArticles(res.data));
      
      axios.get(`${BACKEND_URL}/api/daily-content`, { headers: getAuthHeader() })
           .then(res => { setDailyData(res.data); setCheckinStatus(res.data.today_status); })
           .catch(() => {});
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const handleSendChat = async (e) => {
      e.preventDefault();
      if(!chatMessage.trim()) return;
      const msg = chatMessage; 
      setChatHistory(p => [...p, {role:"user", content:msg}]); 
      setChatMessage(""); 
      setChatLoading(true);
      try {
          const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()});
          setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]);
      } catch (e) {
          setChatHistory(p => [...p, {role:"assistant", content:"Maaf, koneksi error."}]);
      } finally { setChatLoading(false); }
  };

  const handleSubmitCheckin = async (status) => {
      if(isSubmitting) return; setIsSubmitting(true);
      try {
          await axios.post(`${BACKEND_URL}/api/checkin`, {journal, status}, {headers:getAuthHeader()});
          setCheckinStatus(status); fetchUserOverview(); alert("Berhasil Check-in!");
      } catch(e) { alert("Gagal Check-in"); } 
      finally { setIsSubmitting(false); }
  };

  const badgeStyle = { background: 'linear-gradient(45deg, #FFD700, #FDB931)', color: '#7B3F00', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1.2fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
       
       {/* KOLOM KIRI */}
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Profil Card (Foto Profil & Nama) */}
          <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white' }}>
                      {userOverview?.user?.profile_picture ? (
                          <img src={`${BACKEND_URL}${userOverview.user.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : ( <User size={35} color={currentTheme.text} /> )}
                  </div>
                  <button onClick={() => setActiveTab('settings')} style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'white', borderRadius: '50%', padding: '4px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                      <Edit2 size={12} color="#475569" />
                  </button>
              </div>
              <div>
                <h2 style={{ marginBottom: '0.3rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{userOverview?.user?.name || "User"}</h2>
                <div style={badgeStyle}><Medal size={14} /> {userOverview?.user?.badge || "Newbie"}</div>
                <div style={{fontSize:'0.75rem', marginTop:'0.5rem', background:'rgba(255,255,255,0.3)', padding:'2px 8px', borderRadius:'6px', width:'fit-content', fontWeight:'bold', display:'flex', alignItems:'center', gap:'4px'}}>
                     <QrCode size={12}/> Ref: {userOverview?.user?.referral_code}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Check-in Widget */}
          <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
             <CardHeader><CardTitle style={{fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><Activity size={20} color={currentTheme.text}/> Misi Hari Ini</CardTitle></CardHeader>
             <CardContent>
                {dailyData && <div style={{background: darkMode ? '#334155' : '#f8fafc', padding:'1rem', borderRadius:'8px', marginBottom:'1rem', borderLeft:`4px solid ${currentTheme.text}`}}>{dailyData.fact || dailyData.message}</div>}
                
                {(checkinStatus === 'completed' || checkinStatus === 'skipped') ? (
                    <div style={{textAlign:'center', padding:'1.5rem', background:'#f0fdf4', borderRadius:'12px', color:'#166534', fontWeight:'bold'}}>Misi Selesai! 🎉</div>
                ) : (
                    <div>
                        {dailyData?.tasks?.map((t,i) => <div key={i} style={{padding:'0.5rem', borderBottom:'1px solid #eee'}}>• {t}</div>)}
                        <textarea value={journal} onChange={e=>setJournal(e.target.value)} placeholder="Jurnal kesehatan hari ini..." style={{width:'100%', padding:'0.8rem', marginTop:'1rem', borderRadius:'8px', border:'1px solid #ccc', color:'black'}}></textarea>
                        <button onClick={()=>handleSubmitCheckin('completed')} disabled={isSubmitting} style={{marginTop:'1rem', width:'100%', background: currentTheme.primary, padding:'0.8rem', borderRadius:'8px', border:'none', fontWeight:'bold', cursor:'pointer'}}>Selesai Check-in</button>
                    </div>
                )}
             </CardContent>
          </Card>
       </div>

       {/* KOLOM KANAN */}
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 3. CHAT DOKTER AI */}
          <Card style={{ background: darkMode ? '#1e293b' : 'white', height: '450px', display:'flex', flexDirection:'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 <div style={{ width: '40px', height: '40px', background: currentTheme.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color={currentTheme.text} /></div>
                 <div><h3 style={{fontWeight:'bold'}}>Dr. Alva AI <Sparkles size={14} fill={currentTheme.primary} style={{display:'inline'}}/></h3></div>
              </div>
              <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{ padding:'0.6rem 1rem', borderRadius:'12px', marginBottom:'0.5rem', maxWidth:'85%', alignSelf: msg.role==='user'?'flex-end':'flex-start', marginLeft: msg.role==='user'?'auto':0, background: msg.role==='user'?currentTheme.light:'#f1f5f9', color:'black' }}>{msg.content}</div>
                  ))}
                  {chatLoading && <div style={{fontSize:'0.8rem', color:'#888'}}>Dr. Alva sedang mengetik...</div>}
                  <div ref={chatEndRef}></div>
              </div>
              <form onSubmit={handleSendChat} style={{padding:'1rem', borderTop:'1px solid #eee', display:'flex', gap:'0.5rem'}}>
                  <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'0.7rem', borderRadius:'20px', border:'1px solid #ccc', color:'black'}} placeholder="Tanya keluhan..." />
                  <button type="submit" style={{background: currentTheme.primary, border:'none', width:'40px', height:'40px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><Send size={18}/></button>
              </form>
          </Card>

          {/* 4. ARTIKEL */}
          <div>
             <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Artikel Kesehatan</h3>
             {articles.map(art => (
                 <div key={art.id} style={{display:'flex', gap:'1rem', padding:'1rem', background: darkMode?'#334155':'white', borderRadius:'12px', marginBottom:'0.5rem', cursor:'pointer'}}>
                     <div style={{width:'40px', height:'40px', background: currentTheme.light, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}><FileText size={20} color={currentTheme.text}/></div>
                     <div><h4 style={{fontWeight:'bold', fontSize:'0.9rem'}}>{art.title}</h4></div>
                 </div>
             ))}
          </div>
       </div>
    </div>
  );
};
export default DashboardView;
