import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Lock, CheckCircle, Calendar, Clock } from 'lucide-react';
import { challengeDays } from '../mock';

const Challenge = () => {
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleEnroll = async () => {
    setEnrolling(true);
    
    const user_id = localStorage.getItem('user_id');
    const quizResult = JSON.parse(localStorage.getItem('quizResult') || '{}');
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/challenge/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          phone_number: 'demo_' + Date.now(),
          name: 'Demo User',
          health_type: quizResult.type || 'A',
          start_date: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('challengeEnrolled', 'true');
        localStorage.setItem('challengeStartDate', new Date().toISOString());
        localStorage.setItem('challenge_id', data.challenge_id);
        alert('Selamat! Anda telah terdaftar di Program 30 Hari Challenge. Cek WhatsApp Anda untuk instruksi lebih lanjut.');
      }
    } catch (error) {
      console.error('Error enrolling in challenge:', error);
      alert('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="challenge-page">
      {/* Header Section */}
      <section style={{ background: 'var(--gradient-hero)', padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <div className="container">
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Program 30 Hari Challenge
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '1rem auto 2rem' }}>
            Transformasi kesehatan pencernaan Anda dengan pendampingan harian, tugas sederhana, dan edukasi komprehensif.
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="heading-2" style={{ color: 'var(--accent-text)' }}>100%</div>
              <div className="body-small">GRATIS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="heading-2" style={{ color: 'var(--accent-text)' }}>30</div>
              <div className="body-small">Hari</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="heading-2" style={{ color: 'var(--accent-text)' }}>2x</div>
              <div className="body-small">Sehari</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Bagaimana Program Ini Bekerja?
        </h2>
        <div className="ai-grid">
          <Card className="product-card">
            <CardHeader>
              <Calendar className="h-10 w-10" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
              <CardTitle>Tugas Harian</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Setiap hari Anda akan menerima 3 tugas sederhana via WhatsApp (pagi, siang, malam) yang mudah dilakukan dan langsung terasa efeknya.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="product-card">
            <CardHeader>
              <Clock className="h-10 w-10" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
              <CardTitle>Check-in Website</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Catat progress Anda di website kami. Lihat grafik kesehatan, tingkat kedisiplinan, dan dapatkan rekomendasi personal.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="product-card">
            <CardHeader>
              <CheckCircle className="h-10 w-10" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
              <CardTitle>Evaluasi Berkala</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Di hari ke-7, 14, 21, dan 30, Anda akan mengisi rapor mingguan untuk tracking progress dan mendapat feedback dari Coach.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Challenge Days Preview */}
      <section style={{ background: 'var(--bg-section)', padding: '4rem 1.5rem' }}>
        <div className="container">
          <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Preview Program
          </h2>
          <p className="body-medium" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Berikut adalah contoh hari-hari penting dalam program 30 hari Anda
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {challengeDays.map((day) => (
              <Card 
                key={day.day} 
                className="product-card" 
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
              >
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ 
                          width: '3rem', 
                          height: '3rem', 
                          borderRadius: '50%', 
                          background: 'var(--accent-wash)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--accent-text)'
                        }}>
                          {day.day}
                        </div>
                        <CardTitle>{day.title}</CardTitle>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {day.isEvaluation && <Badge style={{ background: 'var(--accent-primary)', color: 'white' }}>Evaluasi</Badge>}
                      {day.isGraduation && <Badge style={{ background: 'var(--accent-strong)', color: 'white' }}>Graduation</Badge>}
                      <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </CardHeader>
                {selectedDay === day.day && (
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <div className="body-small" style={{ color: 'var(--accent-text)', fontWeight: 600, marginBottom: '0.25rem' }}>🌅 Pagi:</div>
                        <div className="body-medium">{day.morning_task}</div>
                      </div>
                      <div>
                        <div className="body-small" style={{ color: 'var(--accent-text)', fontWeight: 600, marginBottom: '0.25rem' }}>☀️ Siang:</div>
                        <div className="body-medium">{day.noon_task}</div>
                      </div>
                      <div>
                        <div className="body-small" style={{ color: 'var(--accent-text)', fontWeight: 600, marginBottom: '0.25rem' }}>🌙 Malam:</div>
                        <div className="body-medium">{day.evening_task}</div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--accent-wash)', padding: '1rem', borderRadius: '8px' }}>
                      <div className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>💡 Edukasi:</div>
                      <div className="body-small">{day.education}</div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <Card style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--gradient-hero)', border: 'none' }}>
          <CardContent style={{ padding: '3rem 2rem' }}>
            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
              Siap Memulai Transformasi Anda?
            </h2>
            <p className="body-large" style={{ marginBottom: '2rem' }}>
              Bergabunglah dengan ribuan orang yang telah berhasil sembuh dari masalah pencernaan mereka.
            </p>
            <Button 
              className="btn-primary"
              size="lg"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Mendaftar...' : 'Daftar Program Gratis Sekarang'}
            </Button>
            <p className="body-small" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Atau <button onClick={() => navigate('/chat')} style={{ color: 'var(--accent-text)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>konsultasi dengan Doktor AI</button> terlebih dahulu
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Challenge;