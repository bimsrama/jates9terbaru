import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  Activity, User, Medal, Edit2, Copy, CheckCircle, Clock, 
  Bot, Sparkles, Send, FileText, RefreshCw, TrendingUp, X 
} from 'lucide-react';
import axios from 'axios';

const DashboardView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, userOverview, fetchUserOverview, setActiveTab }) => {
  const [challenges, setChallenges] = useState([]);
  const [articles, setArticles] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [journal, setJournal] = useState("");
  const [quote, setQuote] = useState("Sehat itu investasi.");
  const [selectedArticle, setSelectedArticle] = useState(null); // State untuk artikel terpilih

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: "assistant", content: "Halo! Saya Dr. Alva AI. Ada keluhan?" }]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { loadAllData(); }, []);
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
      } catch (e) {}
  };

  const handleSendChat = async (e) => {
      e.preventDefault();
      if(!chatMessage.trim()) return;
      const msg = chatMessage; 
      setChatHistory(p => [...p, {role:"user", content:msg}]); 
      setChatMessage(""); setChatLoading(true);
      try {
          const res = await axios.post(`${BACKEND_URL}/api/chat/send`, {message:msg}, {headers:getAuthHeader()});
          setChatHistory(p => [...p, {role:"assistant", content:res.data.response}]);
      } catch (e) { setChatHistory(p => [...p, {role:"assistant", content:"Error koneksi."}]); } 
      finally { setChatLoading(false); }
  };

  // Helper Estimasi Waktu Baca
  const getReadingTime = (text) => {
      const words = text ? text.split(/\s+/).length : 0;
      return Math.ceil(words / 200) + " min baca";
  };

  return (
    <div>
        {/* HEADER & REFRESH */}
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
            <button onClick={loadAllData} style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'transparent', border:'none', cursor:'pointer', color: darkMode?'#cbd5e1':'#64748b', fontSize:'0.8rem'}}>
                <RefreshCw size={14}/> Segarkan Data
            </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1.3fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
            {/* KOLOM KIRI (Profil, Checkin, Challenge) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card style={{ border: 'none', borderRadius: '16px', background: 'var(--theme-gradient)', color: darkMode ? 'white' : '#1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent style={{ padding: '1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                        <div style={{width:'70px', height:'70px', borderRadius:'50%', background:'white', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white', overflow:'hidden'}}>
                             {userOverview?.user?.profile_picture ? <img src={`${BACKEND_URL}${userOverview.user.profile_picture}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <User size={35} color={currentTheme.text}/>}
                        </div>
                        <div>
                            <h2 style={{fontSize:'1.3rem', fontWeight:'bold'}}>{userOverview?.user?.name}</h2>
                            <div style={{background:'rgba(255,255,255,0.3)', padding:'2px 8px', borderRadius:'6px', fontSize:'0.8rem', fontWeight:'bold', display:'inline-block', marginTop:'4px'}}>Ref: {userOverview?.user?.referral_code}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* CHECKIN WIDGET SIMPLE */}
                <Card style={{ background: darkMode ? '#1e293b' : 'white', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <CardContent style={{padding:'1.5rem'}}>
                        <h3 style={{fontSize:'1.1rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem'}}><Activity size={20} color={currentTheme.text}/> Misi Hari Ini</h3>
                        {dailyData && <div style={{background: darkMode?'#334155':'#f8fafc', padding:'1rem', borderRadius:'8px', marginBottom:'1rem'}}>"{dailyData.fact}"</div>}
                        {checkinStatus ? <div style={{textAlign:'center', padding:'1rem', background:'#dcfce7', color:'#166534', borderRadius:'8px', fontWeight:'bold'}}>Sudah Check-in! ✅</div> : (
                            <button onClick={()=>axios.post(`${BACKEND_URL}/api/checkin`, {status:'completed'}, {headers:getAuthHeader()}).then(loadAllData)} style={{width:'100%', background:currentTheme.primary, padding:'0.8rem', borderRadius:'8px', border:'none', fontWeight:'bold', cursor:'pointer'}}>Check-in Sekarang</button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* KOLOM KANAN (Chat & Artikel) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card ref={chatEndRef} style={{ background: darkMode ? '#1e293b' : 'white', height: '400px', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}><h3 style={{fontWeight:'bold'}}>Dr. Alva AI</h3></div>
                    <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                        {chatHistory.map((m,i)=><div key={i} style={{padding:'0.5rem', marginBottom:'0.5rem', background:m.role==='user'?currentTheme.light:'#f1f5f9', borderRadius:'8px', alignSelf:m.role==='user'?'flex-end':'flex-start', marginLeft:m.role==='user'?'auto':0, maxWidth:'85%'}}>{m.content}</div>)}
                        {chatLoading && <div style={{fontSize:'0.8rem', color:'gray'}}>Mengetik...</div>}
                    </div>
                    <form onSubmit={handleSendChat} style={{padding:'1rem', display:'flex', gap:'0.5rem'}}><input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} style={{flex:1, padding:'0.5rem', border:'1px solid #ccc', borderRadius:'8px'}} placeholder="Tanya..."/><button type="submit" style={{background:currentTheme.primary, border:'none', padding:'0.5rem 1rem', borderRadius:'8px'}}><Send size={16}/></button></form>
                </Card>

                {/* LIST ARTIKEL */}
                <div>
                    <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Artikel Kesehatan</h3>
                    {articles.map(art => (
                        <div key={art.id} onClick={() => setSelectedArticle(art)} style={{display:'flex', gap:'1rem', padding:'1rem', background: darkMode?'#334155':'white', borderRadius:'12px', marginBottom:'0.5rem', cursor:'pointer', border:'1px solid #eee'}}>
                            <div style={{width:'40px', height:'40px', background: currentTheme.light, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}><FileText size={20} color={currentTheme.text}/></div>
                            <div>
                                <h4 style={{fontWeight:'bold', fontSize:'0.9rem'}}>{art.title}</h4>
                                <p style={{fontSize:'0.75rem', color:'gray', display:'flex', alignItems:'center', gap:'4px'}}>
                                    <Clock size={12}/> {getReadingTime(art.content)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* MODAL BACA ARTIKEL */}
        {selectedArticle && (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999}} onClick={()=>setSelectedArticle(null)}>
                <div style={{background: darkMode?'#1e293b':'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'600px', maxHeight:'80vh', overflowY:'auto', color: darkMode?'white':'black'}} onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
                        <h2 style={{fontSize:'1.5rem', fontWeight:'bold'}}>{selectedArticle.title}</h2>
                        <button onClick={()=>setSelectedArticle(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24} color={darkMode?'white':'black'}/></button>
                    </div>
                    {selectedArticle.image_url && <img src={`${BACKEND_URL}${selectedArticle.image_url}`} style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'8px', marginBottom:'1rem'}}/>}
                    <div style={{lineHeight:'1.6', whiteSpace:'pre-line'}}>{selectedArticle.content}</div>
                </div>
            </div>
        )}
    </div>
  );
};
export default DashboardView;
