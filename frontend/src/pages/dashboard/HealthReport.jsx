import React, { useState, useMemo } from 'react';
import { Calendar, Trophy, X, CheckCircle, Zap, Target, Bot, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Card } from '../../components/ui/card';

const HealthReport = ({ logs, challengeTitle, onClose, theme, user }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);

  // --- LOGIKA STATISTIK ---
  const stats = useMemo(() => {
    const totalDays = 30; 
    const completed = logs.filter(l => l.status === 'completed').length;
    // Hitung streak sederhana (logika bisa disesuaikan)
    let currentStreak = completed > 0 ? 1 : 0; 
    const percentage = Math.round((completed / totalDays) * 100);
    
    let message = "Ayo mulai langkah pertamamu!";
    if (percentage >= 80) message = "Luar biasa! Konsistensi kamu di level elit.";
    else if (percentage >= 50) message = "Kerja bagus! Kamu sudah separuh jalan.";
    else if (percentage >= 20) message = "Start yang baik. Teruslah konsisten!";
    
    return { completed, streak: currentStreak, percentage, message };
  }, [logs]);

  // --- LOGIKA KALENDER ---
  const changeMonth = (offset) => { 
    const newDate = new Date(calendarDate.setMonth(calendarDate.getMonth() + offset)); 
    setCalendarDate(new Date(newDate)); 
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; 

    const days = [];
    for (let i = 0; i < startDay; i++) { 
        days.push(<div key={`empty-${i}`} style={{ height: '40px' }}></div>); 
    }
    for (let d = 1; d <= daysInMonth; d++) {
        // Format tanggal harus cocok dengan data backend (DD MMM YYYY atau YYYY-MM-DD)
        const currentDateStr = new Date(year, month, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const log = logs.find(h => h.date === currentDateStr);
        
        let statusColor = '#f1f5f9'; 
        let textColor = '#64748b';
        let cursorStyle = 'default';
        
        if (log) { 
            if (log.status === 'completed') { statusColor = '#dcfce7'; textColor = '#166534'; cursorStyle = 'pointer'; } 
            else if (log.status === 'skipped') { statusColor = '#fee2e2'; textColor = '#991b1b'; } 
        }
        
        days.push(
            <div key={d} onClick={() => { if(log && log.status === 'completed') setSelectedLogDetail(log); }} 
                 style={{ height: '40px', width:'40px', background: statusColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: textColor, cursor: cursorStyle, margin:'0 auto', transition:'transform 0.1s' }}>
                {d}
            </div>
        );
    }
    return days;
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Header Navigasi */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onClose} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor:'pointer' }}>
            <ChevronLeft size={20}/>
        </button>
        <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>Rapor Perkembangan</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{challengeTitle}</p>
        </div>
      </div>

      {/* KALENDER CARD */}
      <div style={{background: 'white', padding:'1.5rem', borderRadius:'16px', border:'1px solid #e2e8f0', maxWidth:'500px', margin:'0 auto 2rem auto', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}> 
            <button onClick={()=>changeMonth(-1)} style={{background:'transparent', border:'none', cursor:'pointer'}}><ChevronLeft/></button> 
            <h3 style={{fontWeight:'bold', fontSize:'1.1rem'}}> {calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} </h3> 
            <button onClick={()=>changeMonth(1)} style={{background:'transparent', border:'none', cursor:'pointer'}}><ChevronRight/></button> 
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', textAlign:'center', marginBottom:'0.5rem'}}> 
            {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => ( <div key={d} style={{fontSize:'0.8rem', fontWeight:'bold', color:'#64748b'}}>{d}</div> ))} 
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'0.5rem'}}> 
            {renderCalendar()} 
        </div>
        <p style={{textAlign:'center', fontSize:'0.75rem', color:'#94a3b8', marginTop:'1rem'}}>*Klik tanggal hijau untuk melihat detail.</p>
      </div>

      {/* STATISTIK */}
      <div style={{maxWidth:'500px', margin:'0 auto'}}>
          <h3 style={{fontSize:'1.1rem', fontWeight:'bold', marginBottom:'1rem', color: '#1e293b'}}>Statistik & Evaluasi</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem', marginBottom:'1.5rem'}}>
              <div style={{background: 'white', padding:'1rem', borderRadius:'12px', border:'1px solid #e2e8f0', textAlign:'center'}}> 
                  <div style={{background: theme.light, width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.5rem auto'}}><CheckCircle size={16} color={theme.text}/></div> 
                  <div style={{fontSize:'1.2rem', fontWeight:'bold', color: theme.text}}>{stats.completed}</div> 
                  <div style={{fontSize:'0.7rem', color:'#64748b'}}>Misi Tuntas</div> 
              </div>
              <div style={{background: 'white', padding:'1rem', borderRadius:'12px', border:'1px solid #e2e8f0', textAlign:'center'}}> 
                  <div style={{background: '#fee2e2', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.5rem auto'}}><Zap size={16} color='#ef4444'/></div> 
                  <div style={{fontSize:'1.2rem', fontWeight:'bold', color: '#ef4444'}}>{stats.streak}</div> 
                  <div style={{fontSize:'0.7rem', color:'#64748b'}}>Streak Hari</div> 
              </div>
              <div style={{background: 'white', padding:'1rem', borderRadius:'12px', border:'1px solid #e2e8f0', textAlign:'center'}}> 
                  <div style={{background: '#dbeafe', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.5rem auto'}}><Target size={16} color='#2563eb'/></div> 
                  <div style={{fontSize:'1.2rem', fontWeight:'bold', color: '#2563eb'}}>{stats.percentage}%</div> 
                  <div style={{fontSize:'0.7rem', color:'#64748b'}}>Penyelesaian</div> 
              </div>
          </div>
          
          <Card style={{background: 'white', borderLeft: `4px solid ${theme.primary}`, overflow:'hidden'}}> 
              <div style={{padding:'1.2rem', display:'flex', gap:'1rem', alignItems:'flex-start'}}> 
                  <div style={{background: theme.light, padding:'0.5rem', borderRadius:'50%', flexShrink:0}}> 
                      <Bot size={32} color={theme.text}/> 
                  </div> 
                  <div> 
                      <h4 style={{fontSize:'1rem', fontWeight:'bold', marginBottom:'0.3rem', color: theme.text}}>Evaluasi Dr. Alva</h4> 
                      <p style={{fontSize:'0.9rem', lineHeight:'1.5', color: '#334155'}}> "{stats.message}" </p> 
                  </div> 
              </div> 
          </Card>
      </div>

      {/* MODAL DETAIL LOG HARIAN (POPUP) */}
      {selectedLogDetail && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999}} onClick={()=>setSelectedLogDetail(null)}>
            <div style={{background: 'white', color: 'black', maxWidth:'400px', width:'90%', padding:'1.5rem', borderRadius:'16px', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}} onClick={e=>e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}> 
                    <h3 style={{fontWeight:'bold', fontSize:'1.1rem'}}>Laporan Harian</h3> 
                    <button onClick={()=>setSelectedLogDetail(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20}/></button> 
                </div> 
                <div style={{marginBottom:'1.5rem', padding:'1rem', background: theme.light, borderRadius:'12px', color: theme.text}}> 
                    <div style={{fontSize:'0.8rem', textTransform:'uppercase', opacity:0.8, marginBottom:'0.3rem'}}>Tanggal</div> 
                    <div style={{fontWeight:'bold', fontSize:'1rem'}}>{selectedLogDetail.date} (Hari ke-{selectedLogDetail.day})</div> 
                </div> 
                <div style={{marginBottom:'1.5rem'}}> 
                    <div style={{fontWeight:'bold', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><CheckCircle size={18} color={theme.primary}/> Misi Tuntas:</div> 
                    <ul style={{paddingLeft:'1.5rem', margin:0, color: '#475569', fontSize:'0.9rem'}}> 
                        {selectedLogDetail.chosen_option ? selectedLogDetail.chosen_option.split(', ').map((opt, i) => ( <li key={i}>{opt}</li> )) : <li>Misi Harian</li>} 
                    </ul> 
                </div> 
                {selectedLogDetail.notes && ( 
                    <div style={{marginBottom:'1.5rem'}}> 
                        <div style={{fontWeight:'bold', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><Edit2 size={18} color={theme.primary}/> Jurnal Kamu:</div> 
                        <div style={{fontSize:'0.9rem', fontStyle:'italic', color: '#64748b', background: '#f8fafc', padding:'0.8rem', borderRadius:'8px'}}> "{selectedLogDetail.notes}" </div> 
                    </div> 
                )} 
                <div style={{borderTop: '1px solid #e2e8f0', paddingTop:'1rem'}}> 
                    <div style={{fontWeight:'bold', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color: theme.text}}><Bot size={18}/> Ulasan Coach AI:</div> 
                    <div style={{lineHeight:'1.5', fontSize:'0.9rem', color: '#334155'}}> {selectedLogDetail.ai_feedback || "Belum ada ulasan AI untuk hari ini."} </div> 
                </div> 
            </div>
        </div>
      )}
    </div>
  );
};

export default HealthReport;
