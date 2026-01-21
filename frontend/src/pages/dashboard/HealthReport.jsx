import React, { useMemo } from 'react';
import { Calendar, TrendingUp, Trophy, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const HealthReport = ({ logs, challengeTitle, onClose, theme, user }) => {
  // --- LOGIKA KALENDER & STATISTIK ---
  const stats = useMemo(() => {
    const totalDays = 30; // Asumsi challenge 30 hari
    const completed = logs.filter(l => l.status === 'completed').length;
    const missed = logs.filter(l => l.status === 'missed').length; // Jika ada status missed
    const percentage = Math.round((completed / totalDays) * 100);
    
    // Hitung streak sederhana
    let currentStreak = 0;
    // Logika streak bisa dikembangkan lebih lanjut berdasarkan tanggal berurutan
    // Untuk simpelnya kita ambil total completed dulu sebagai 'konsistensi'
    
    return { completed, missed, percentage };
  }, [logs]);

  // Generate Kalender Grid 30 Hari
  const renderCalendar = () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
        {days.map(day => {
          const log = logs.find(l => l.day === day);
          let bg = '#f1f5f9'; // Default abu
          let color = '#94a3b8';
          let border = '1px solid #e2e8f0';

          if (log) {
            if (log.status === 'completed') {
              bg = '#dcfce7'; color = '#166534'; border = '1px solid #86efac';
            } else if (log.status === 'missed') {
              bg = '#fee2e2'; color = '#991b1b'; border = '1px solid #fca5a5';
            }
          }

          return (
            <div key={day} style={{
              background: bg, color: color, border: border,
              borderRadius: '8px', padding: '0.5rem', textAlign: 'center',
              fontSize: '0.8rem', fontWeight: 'bold', aspectRatio: '1/1',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
            }}>
              <span>{day}</span>
              {log?.status === 'completed' && <CheckCircle size={10} style={{marginTop:'2px'}}/>}
            </div>
          );
        })}
      </div>
    );
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.text }}>Rapor Kesehatan</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{challengeTitle}</p>
        </div>
        <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
          <XCircle size={24} color="#64748b"/>
        </button>
      </div>

      {/* RINGKASAN PROGRESS */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Trophy size={20} color="#eab308" />
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Pencapaian Kamu</h3>
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

      {/* KALENDER */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Calendar size={20} color={theme.text} />
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Riwayat Kalender</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Hijau = Selesai, Merah = Terlewat.</p>
        {renderCalendar()}
      </div>

      {/* AI FEEDBACK TERAKHIR (JIKA ADA) */}
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
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Belum ada evaluasi dari AI. Lakukan check-in hari ini!</p>
        )}
      </div>

    </div>
  );
};

export default HealthReport;
