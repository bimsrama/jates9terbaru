import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { healthQuestions } from '../mock';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const HealthQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const progress = ((currentQuestion + 1) / healthQuestions.length) * 100;

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < healthQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    let totalScore = 0;
    let healthType = 'A';

    Object.entries(answers).forEach(([qId, answer]) => {
      const question = healthQuestions.find(q => q.id === parseInt(qId));
      const option = question.options.find(opt => opt.value === answer);
      
      if (option.score !== undefined) {
        totalScore += option.score;
      }
      if (option.type) {
        healthType = option.type;
      }
    });

    // Submit to backend API
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: 'demo_' + Date.now(),
          name: 'Demo User',
          answers: answers,
          score: totalScore,
          health_type: healthType,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      // Simpan user_id ke localStorage
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('quizResult', JSON.stringify({
        score: totalScore,
        type: healthType,
        timestamp: new Date().toISOString()
      }));

      setShowResult(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Fallback ke localStorage jika backend error
      localStorage.setItem('quizResult', JSON.stringify({
        score: totalScore,
        type: healthType,
        timestamp: new Date().toISOString()
      }));
      setShowResult(true);
    }
  };

  const getResultMessage = () => {
    const result = JSON.parse(localStorage.getItem('quizResult'));
    const { score, type } = result;

    let severity = 'Ringan';
    if (score >= 8) severity = 'Berat';
    else if (score >= 5) severity = 'Sedang';

    let typeDesc = '';
    if (type.includes('A')) typeDesc += 'Sembelit ';
    if (type.includes('B')) typeDesc += 'Kembung ';
    if (type.includes('C')) typeDesc += 'Maag ';

    return {
      severity,
      typeDesc: typeDesc.trim(),
      recommendation: `Berdasarkan hasil kuis, Anda mengalami masalah pencernaan kategori ${severity} dengan gejala utama: ${typeDesc}. Program 30 Hari kami dirancang khusus untuk mengatasi masalah Anda.`
    };
  };

  if (showResult) {
    const result = getResultMessage();
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Card style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
          <CardHeader style={{ textAlign: 'center' }}>
            <CardTitle className="heading-2">Hasil Analisis Kesehatan Anda</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: 'var(--gradient-button)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700
              }}>
                {result.severity}
              </div>
              <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Kondisi: {result.typeDesc}</h3>
              <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
                {result.recommendation}
              </p>
            </div>

            <div style={{ background: 'var(--accent-wash)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h4 className="heading-3" style={{ marginBottom: '1rem' }}>Langkah Selanjutnya:</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-body)' }}>
                <li className="body-medium" style={{ marginBottom: '0.5rem' }}>✅ Daftar Program 30 Hari (GRATIS)</li>
                <li className="body-medium" style={{ marginBottom: '0.5rem' }}>✅ Dapatkan pendampingan harian via WhatsApp</li>
                <li className="body-medium" style={{ marginBottom: '0.5rem' }}>✅ Akses ke Doktor AI untuk konsultasi</li>
                <li className="body-medium">✅ Rekomendasi Jates9 yang sesuai kondisi Anda</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button 
                className="btn-primary" 
                style={{ flex: 1 }}
                onClick={() => navigate('/challenge')}
              >
                Daftar Program 30 Hari <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => navigate('/chat')}
              >
                Konsultasi Doktor AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = healthQuestions[currentQuestion];
  const hasAnswer = answers[question.id] !== undefined;

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="heading-2" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Kuis Kesehatan Pencernaan
          </h1>
          <p className="body-medium" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Pertanyaan {currentQuestion + 1} dari {healthQuestions.length}
          </p>
          <Progress value={progress} style={{ height: '8px' }} />
        </div>

        <Card className="product-card" style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <CardTitle className="heading-3">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {question.options.map((option) => (
                <Button
                  key={option.value}
                  className={answers[question.id] === option.value ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => handleAnswer(question.id, option.value)}
                  style={{ 
                    justifyContent: 'flex-start', 
                    textAlign: 'left',
                    height: 'auto',
                    padding: '1rem 1.5rem',
                    whiteSpace: 'normal'
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <Button
            className="btn-secondary"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Kembali
          </Button>
          <Button
            className="btn-primary"
            onClick={handleNext}
            disabled={!hasAnswer}
          >
            {currentQuestion === healthQuestions.length - 1 ? 'Lihat Hasil' : 'Lanjut'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HealthQuiz;