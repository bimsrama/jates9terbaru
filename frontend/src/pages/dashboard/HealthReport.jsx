import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Award, TrendingUp, Calendar, Target } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HealthReport = () => {
  const { getAuthHeader, user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthReport();
  }, []);

  const fetchHealthReport = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/dashboard/user/health-report`,
        { headers: getAuthHeader() }
      );
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching health report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementInfo = (achievement) => {
    const achievements = {
      week_1: { label: '1 Minggu', icon: '🎯', color: '#8FEC78' },
      week_2: { label: '2 Minggu', icon: '🔥', color: '#81DD67' },
      week_3: { label: '3 Minggu', icon: '💪', color: '#0d7916' },
      champion: { label: 'Champion', icon: '🏆', color: '#FFD700' },
      perfectionist: { label: 'Perfectionist', icon: '⭐', color: '#FF6B6B' }
    };
    return achievements[achievement] || { label: achievement, icon: '✨', color: '#8FEC78' };
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="body-medium" style={{ color: 'var(--text-secondary)' }}>Memuat rapor kesehatan...</div>
      </div>
    );
  }

  if (!report || report.total_days === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <Card className="product-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CardContent>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Belum Ada Data</h3>
            <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Mulai check-in harian Anda untuk melihat rapor kesehatan
            </p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/dashboard/checkin'}
            >
              Mulai Check-in
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Rapor Kesehatan</h1>
        <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
          Perjalanan kesehatan Anda selama {report.total_days} hari
        </p>
      </div>

      {/* Stats Grid */}
      <div className="ai-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Calendar className="h-8 w-8" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
            <h3 className="heading-2" style={{ marginBottom: '0.25rem' }}>{report.total_days}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Total Hari</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Target className="h-8 w-8" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
            <h3 className="heading-2" style={{ marginBottom: '0.25rem' }}>{report.completion_rate}%</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Completion Rate</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <TrendingUp className="h-8 w-8" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
            <h3 className="heading-2" style={{ marginBottom: '0.25rem' }}>{report.average_comfort.toFixed(1)}/10</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Rata-rata Comfort</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {report.achievements && report.achievements.length > 0 && (
        <Card className="product-card" style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <CardTitle className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award style={{ color: 'var(--accent-primary)' }} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {report.achievements.map((achievement, index) => {
                const info = getAchievementInfo(achievement);
                return (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'var(--accent-wash)',
                      border: `2px solid ${info.color}`,
                      textAlign: 'center',
                      minWidth: '120px'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{info.icon}</div>
                    <div className="body-small" style={{ fontWeight: 600 }}>{info.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comfort Trend */}
      <Card className="product-card" style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle className="heading-3">Tren Kenyamanan Pencernaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
            {report.comfort_trend.map((level, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${level * 10}%`,
                  background: level >= 7 ? 'var(--accent-primary)' : level >= 5 ? '#FFD700' : '#FF6B6B',
                  borderRadius: '4px 4px 0 0',
                  minWidth: '10px',
                  position: 'relative'
                }}
                title={`Hari ${index + 1}: ${level}/10`}
              >
                <span style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)'
                }}>
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
              <span className="body-small">Baik (7-10)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', background: '#FFD700', borderRadius: '4px' }}></div>
              <span className="body-small">Sedang (5-6)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', background: '#FF6B6B', borderRadius: '4px' }}></div>
              <span className="body-small">Kurang (1-4)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Check-in */}
      {report.latest_checkin && (
        <Card className="product-card">
          <CardHeader>
            <CardTitle className="heading-3">Check-in Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p className="body-small" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hari Ke-</p>
                <p className="body-medium" style={{ fontWeight: 600 }}>{report.latest_checkin.day}</p>
              </div>
              <div>
                <p className="body-small" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Comfort Level</p>
                <p className="body-medium" style={{ fontWeight: 600 }}>{report.latest_checkin.comfort_level}/10</p>
              </div>
              <div>
                <p className="body-small" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tasks</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{report.latest_checkin.morning_task_completed ? '✅' : '⬜'}</span>
                  <span style={{ fontSize: '1.2rem' }}>{report.latest_checkin.noon_task_completed ? '✅' : '⬜'}</span>
                  <span style={{ fontSize: '1.2rem' }}>{report.latest_checkin.evening_task_completed ? '✅' : '⬜'}</span>
                </div>
              </div>
            </div>
            {report.latest_checkin.notes && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--accent-wash)', borderRadius: '8px' }}>
                <p className="body-small" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Catatan:</p>
                <p className="body-medium">{report.latest_checkin.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          className="btn-primary"
          onClick={() => window.location.href = '/dashboard/checkin'}
        >
          Check-in Hari Ini
        </button>
      </div>
    </div>
  );
};

export default HealthReport;