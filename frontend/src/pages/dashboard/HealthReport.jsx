import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Trophy, XCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const HealthReport = ({ logs, challengeTitle, onClose, theme, user }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());

  // --- LOGIKA STATISTIK ---
  const stats = useMemo(() => {
    const totalDays = 30; 
    const completed = logs.filter(l => l.status === 'completed').length;
    const missed = logs.filter(l => l.status === 'skipped').length;
    const percentage = Math.round((completed / totalDays) * 100);
    return { completed, missed, percentage };
  }, [logs]);

  // --- LOGIKA KALENDER ---
  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust Monday start

    const days = [];
    // Empty slots
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ height: '40px' }}></div>);
    }
    // Date slots
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDateStr = new Date(year, month, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      // Cari log berdasarkan tanggal string format "DD MMM YYYY" (sesuaikan dengan format backend Anda)
      // Note: Pastikan format date backend konsisten. Di sini kita asumsikan matching string.
      const log = logs.find(h => h.date === currentDateStr || h.day === d); // Fallback ke day jika date string beda

      let bg = theme.id === 'green' ? '#f0fdf4' : '#eff6ff';
      let color = '#64748b';
      let border = '1px solid #e2e8f0';

      if (log) {
        if (log.status === 'completed') {
          bg = theme.primary; 
          color = 'white'; 
          border = 'none';
        } else if (log.status === 'skipped') {
          bg = '#fee2e2'; 
          color = '#991b1b';
          border = '1px solid #fca5a5';
        }
      }

      days.push(
        <div key={d} style={{
          height: '40px', width: '100%', maxWidth: '40px', margin: '0 auto',
          background: bg, color: color, border: border, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '0.9rem', position: 'relative'
        }}>
          {d}
          {log?.status === 'completed' && <CheckCircle size={10} style={{ position: 'absolute', bottom: '2px', right: '2px', color: 'white' }} />}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + offset)));
  };

  // Styles
  const cardStyle = {
    background: 'white', borderRadius: '16px', padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '1.5rem',
    border: '1px solid #e2e8f0'
  };

  return (
    <div className="health-report-container" style={{ paddingBottom: '80px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <ChevronLeft size={20}/> Kembali
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Rapor Kesehatan</h2>
          <p style={{ color: theme.text, fontSize: '0.9rem', fontWeight: '600' }}>{challengeTitle}</p>
        </div>
      </div>

      {/* STATS CARD */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Trophy size={20} color="#eab308" />
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Statistik Kamu</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.primary }}>{stats.completed}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hari Selesai</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#eab308' }}>{stats.percentage}%</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Kelulusan</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ef4444' }}>{stats.missed}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Terlewat</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.5rem', background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${stats.percentage}%`, background: theme.primary, height: '100%', borderRadius: '5px', transition: 'width 1s ease' }}></div>
        </div>
      </div>

      {/* CALENDAR CARD */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ChevronLeft /></button>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => changeMonth(1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ChevronRight /></button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' }}>
          {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(d => (
            <div key={d} style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8' }}>{d}</div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {renderCalendar()}
        </div>
      </div>

      {/* AI FEEDBACK */}
      <div style={{ ...cardStyle, background: '#f8fafc', border: `1px dashed ${theme.primary}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingUp size={20} color={theme.text} />
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Kata Coach AI</h3>
        </div>
        {logs.length > 0 && logs[0].ai_feedback ? (
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155', fontStyle: 'italic' }}>
            "{logs[0].ai_feedback}"
          </p>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Lakukan check-in hari ini untuk mendapatkan evaluasi terbaru.</p>
        )}
      </div>

    </div>
  );
};

export default HealthReport;
