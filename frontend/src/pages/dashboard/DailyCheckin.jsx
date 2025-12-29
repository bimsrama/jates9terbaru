import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

import { Button } from '../../components/ui/button';

import { Textarea } from '../../components/ui/textarea';

import axios from 'axios';

import { CheckCircle, Circle } from 'lucide-react';



const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';



const DailyCheckin = () => {

  const { getAuthHeader, user } = useAuth();

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

    'Kembung', 'Nyeri perut', 'Sembelit', 'Diare', 'Mual', 'Heartburn', 'Sendawa berlebih'

  ];



  // Logic: Tunggu user siap, baru fetch data

  useEffect(() => {

    if (user || localStorage.getItem('user_id')) {

        fetchChallengeInfo();

    }

  }, [user]);



  const fetchChallengeInfo = async () => {

    try {

      // Ambil ID dengan aman

      const userId = user?.id || localStorage.getItem('user_id');

      

      if (!userId) return; // Stop jika tidak ada ID



      const response = await axios.get(

        `${BACKEND_URL}/api/challenge/progress/${userId}`,

        { headers: getAuthHeader() }

      );

      

      if (response.data) {

          setCurrentDay(response.data.current_day || 1);

          setChallengeId(response.data.challenge_id || 'temp_challenge');

      }

    } catch (error) {

      console.error('Error fetching challenge info:', error);

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

      const userId = user?.id || localStorage.getItem('user_id');

      

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

      alert('Gagal submit check-in. Pastikan koneksi aman.');

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

              Data hari ke-{currentDay} tersimpan.

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

          Hari ke-{currentDay}

        </p>

      </div>



      <form onSubmit={handleSubmit}>

        {/* Comfort Level */}

        <Card className="product-card" style={{ marginBottom: '1.5rem' }}>

          <CardHeader>

            <CardTitle className="heading-3">Tingkat Kenyamanan</CardTitle>

          </CardHeader>

          <CardContent>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (

                <button

                  key={num}

                  type="button"

                  onClick={() => setFormData({ ...formData, comfort_level: num })}

                  style={{

                    width: '40px', height: '40px', borderRadius: '50%',

                    border: '2px solid',

                    borderColor: formData.comfort_level === num ? 'var(--accent-primary)' : 'var(--border-light)',

                    background: formData.comfort_level === num ? 'var(--accent-wash)' : 'transparent',

                    cursor: 'pointer'

                  }}

                >

                  {num}

                </button>

              ))}

            </div>

            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{formData.comfort_level}/10</div>

          </CardContent>

        </Card>



        {/* Symptoms Section */}

        <Card className="product-card" style={{ marginBottom: '1.5rem' }}>

          <CardHeader><CardTitle className="heading-3">Gejala</CardTitle></CardHeader>

          <CardContent>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>

              {symptomOptions.map(symptom => (

                <button

                  key={symptom} type="button"

                  onClick={() => toggleSymptom(symptom)}

                  style={{

                    padding: '0.5rem 1rem', borderRadius: '20px',

                    border: '1px solid',

                    borderColor: formData.symptoms.includes(symptom) ? 'var(--accent-primary)' : '#ccc',

                    background: formData.symptoms.includes(symptom) ? 'var(--accent-wash)' : 'transparent'

                  }}

                >

                  {symptom}

                </button>

              ))}

            </div>

          </CardContent>

        </Card>



        <Button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>

          {loading ? 'Menyimpan...' : 'Submit Check-in'}

        </Button>

      </form>

    </div>

  );

};



export default DailyCheckin;
