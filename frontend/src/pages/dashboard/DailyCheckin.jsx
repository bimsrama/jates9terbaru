import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import axios from 'axios';
import { CheckCircle, Circle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DailyCheckin = () => {
  const { getAuthHeader } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [challengeId, setChallengeId] = useState('');
  const [formData, setFormData] = useState({
    comfort_level: 5,
    symptoms: [],
    notes: '',
    morning_task_completed: false,
    noon_task_completed: false,
    evening_task_completed: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const symptomOptions = [
    'Kembung',
    'Nyeri perut',
    'Sembelit',
    'Diare',
    'Mual',
    'Heartburn',
    'Sendawa berlebih'
  ];

  useEffect(() => {
    fetchChallengeInfo();
  }, []);

  const fetchChallengeInfo = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(
        `${BACKEND_URL}/api/challenge/progress/${userId}`,
        { headers: getAuthHeader() }
      );
      setCurrentDay(response.data.current_day);
      setChallengeId(response.data.challenge_id || 'temp_challenge');
    } catch (error) {
      console.error('Error fetching challenge info:', error);
      setCurrentDay(1);
    }
  };

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('user_id');
      await axios.post(
        `${BACKEND_URL}/api/dashboard/user/checkin`,
        {
          user_id: userId,
          challenge_id: challengeId,
          day: currentDay,
          ...formData
        },
        { headers: getAuthHeader() }
      );

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard/health-report';
      }, 2000);
    } catch (error) {
      console.error('Error submitting check-in:', error);
      alert('Gagal submit check-in. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card className="product-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>Check-in Berhasil!</h2>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              Data kesehatan Anda untuk hari ke-{currentDay} telah tersimpan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Daily Check-in</h1>
        <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
          Hari ke-{currentDay} dari 30 hari challenge
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Comfort Level */}
        <Card className="product-card" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <CardTitle className="heading-3">Tingkat Kenyamanan Pencernaan</CardTitle>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              Seberapa nyaman pencernaan Anda hari ini? (1 = Sangat tidak nyaman, 10 = Sangat nyaman)
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, comfort_level: num })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: formData.comfort_level === num ? 'var(--accent-primary)' : 'var(--border-light)',
                    background: formData.comfort_level === num ? 'var(--accent-wash)' : 'transparent',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span className="heading-2" style={{ color: 'var(--accent-text)' }}>{formData.comfort_level}/10</span>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="product-card" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <CardTitle className="heading-3">Gejala yang Dirasakan</CardTitle>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              Pilih gejala yang Anda rasakan hari ini (opsional)
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {symptomOptions.map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: formData.symptoms.includes(symptom) ? 'var(--accent-primary)' : 'var(--border-light)',
                    background: formData.symptoms.includes(symptom) ? 'var(--accent-wash)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {formData.symptoms.includes(symptom) ? '✓ ' : ''}{symptom}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <Card className="product-card" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <CardTitle className="heading-3">Tugas Harian</CardTitle>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              Centang tugas yang sudah Anda selesaikan hari ini
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, morning_task_completed: !formData.morning_task_completed })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: formData.morning_task_completed ? 'var(--accent-wash)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                {formData.morning_task_completed ? 
                  <CheckCircle style={{ color: 'var(--accent-primary)' }} /> : 
                  <Circle style={{ color: 'var(--border-medium)' }} />
                }
                <div>
                  <div className="body-medium" style={{ fontWeight: 600 }}>🌅 Tugas Pagi</div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>Minum 2 gelas air hangat & sarapan sehat</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, noon_task_completed: !formData.noon_task_completed })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: formData.noon_task_completed ? 'var(--accent-wash)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                {formData.noon_task_completed ? 
                  <CheckCircle style={{ color: 'var(--accent-primary)' }} /> : 
                  <Circle style={{ color: 'var(--border-medium)' }} />
                }
                <div>
                  <div className="body-medium" style={{ fontWeight: 600 }}>☀️ Tugas Siang</div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>Kunyah makanan 20x & hindari makan terburu-buru</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, evening_task_completed: !formData.evening_task_completed })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: formData.evening_task_completed ? 'var(--accent-wash)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                {formData.evening_task_completed ? 
                  <CheckCircle style={{ color: 'var(--accent-primary)' }} /> : 
                  <Circle style={{ color: 'var(--border-medium)' }} />
                }
                <div>
                  <div className="body-medium" style={{ fontWeight: 600 }}>🌙 Tugas Malam</div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>Makan 3 jam sebelum tidur & jalan santai 10 menit</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="product-card" style={{ marginBottom: '1.5rem' }}>
          <CardHeader>
            <CardTitle className="heading-3">Catatan Tambahan</CardTitle>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
              Tulis catatan atau observasi penting hari ini (opsional)
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Hari ini saya merasa lebih baik setelah mengurangi kopi..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Menyimpan...' : 'Submit Check-in'}
        </Button>
      </form>
    </div>
  );
};

export default DailyCheckin;