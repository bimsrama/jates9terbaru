import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Send, Bot, User } from 'lucide-react';
import { aiChatMock } from '../mock';

const AIChat = () => {
  const [messages, setMessages] = useState(aiChatMock);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input
    };

    setMessages([...messages, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const user_id = localStorage.getItem('user_id') || 'guest_' + Date.now();
      const session_id = localStorage.getItem('chat_session_id') || 'session_' + Date.now();
      
      // Save session_id for future requests
      localStorage.setItem('chat_session_id', session_id);

      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          session_id: session_id,
          message: userInput
        })
      });

      const data = await response.json();
      
      const aiResponse = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to mock response
      const aiResponse = {
        role: 'assistant',
        content: generateMockResponse(userInput)
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (question) => {
    const lowercaseQ = question.toLowerCase();
    
    if (lowercaseQ.includes('maag') || lowercaseQ.includes('perut') || lowercaseQ.includes('nyeri')) {
      return 'Berdasarkan gejala yang Anda sebutkan, kemungkinan Anda mengalami masalah maag atau GERD. Saya sarankan:\n\n1. Hindari makanan pedas, asam, dan berlemak\n2. Makan dalam porsi kecil tapi sering\n3. Jangan langsung tidur setelah makan\n4. Konsumsi Jates9 yang mengandung enzim untuk membantu pencernaan\n\nApakah Anda sudah mengikuti Program 30 Hari kami? Program ini akan memberikan panduan lengkap untuk mengatasi maag Anda.';
    }
    
    if (lowercaseQ.includes('sembelit') || lowercaseQ.includes('bab') || lowercaseQ.includes('susah')) {
      return 'Sembelit biasanya disebabkan oleh kurangnya serat dan cairan. Berikut solusinya:\n\n1. Minum minimal 8 gelas air putih per hari\n2. Konsumsi buah-buahan seperti pepaya, pisang\n3. Tambah sayuran hijau di setiap makan\n4. Jates9 mengandung serat alami yang membantu melancarkan BAB\n\nDalam Program 30 Hari kami, Anda akan mendapat panduan lengkap pola makan untuk mengatasi sembelit secara permanen.';
    }
    
    if (lowercaseQ.includes('kembung') || lowercaseQ.includes('gas') || lowercaseQ.includes('sendawa')) {
      return 'Kembung dan gas berlebih bisa diatasi dengan cara berikut:\n\n1. Kunyah makanan perlahan (minimal 20x)\n2. Hindari minum saat makan (minum 30 menit sebelum/sesudah)\n3. Kurangi makanan yang memicu gas (kol, soda, kacang berlebih)\n4. Enzim dalam Jates9 membantu memecah makanan sehingga mengurangi produksi gas\n\nProgram 30 Hari kami mengajarkan teknik makan yang benar untuk mencegah kembung.';
    }
    
    if (lowercaseQ.includes('jates9') || lowercaseQ.includes('produk')) {
      return 'Jates9 adalah superfood enzim buah yang mengandung 9 buah pilihan:\n\n✅ Pepaya - Enzim papain untuk pencernaan\n✅ Nanas - Bromelain anti-inflamasi\n✅ Apel - Serat pektin\n✅ Dan 6 buah lainnya\n\nJates9 membantu:\n- Mempercepat pencernaan makanan\n- Melancarkan BAB\n- Mengurangi kembung\n- Memperbaiki lapisan lambung\n\nKami punya 3 paket: Basic (7 hari), Premium (30 hari), dan Family (90 hari). Paket mana yang cocok untuk Anda?';
    }
    
    if (lowercaseQ.includes('program') || lowercaseQ.includes('challenge')) {
      return 'Program 30 Hari Challenge adalah program pendampingan GRATIS yang mencakup:\n\n📱 Pendampingan harian via WhatsApp\n📅 Tugas sederhana 3x sehari\n📊 Check-in website untuk tracking progress\n📝 Evaluasi mingguan (hari 7, 14, 21, 30)\n🎓 Sertifikat digital setelah lulus\n\nProgram ini 100% GRATIS dan sudah membantu ribuan orang sembuh dari masalah pencernaan. Apakah Anda ingin mendaftar sekarang?';
    }
    
    return 'Terima kasih atas pertanyaan Anda. Saya adalah asisten AI yang berspesialisasi dalam kesehatan pencernaan. Saya bisa membantu Anda dengan:\n\n• Konsultasi masalah maag, kembung, sembelit\n• Informasi tentang Program 30 Hari Challenge\n• Detail produk Jates9\n• Tips pola makan sehat\n\nSilakan tanyakan hal spesifik yang ingin Anda ketahui!';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '900px', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--gradient-button)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Bot className="h-10 w-10" style={{ color: 'white' }} />
          </div>
          <h1 className="heading-2">Doktor AI</h1>
          <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
            Asisten kesehatan virtual Anda - Tanyakan apa saja tentang kesehatan pencernaan
          </p>
        </div>

        {/* Chat Messages */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '1rem' }}>
          <CardContent style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  alignItems: 'flex-start',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: message.role === 'user' ? 'var(--bg-section)' : 'var(--gradient-button)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                  ) : (
                    <Bot className="h-5 w-5" style={{ color: 'white' }} />
                  )}
                </div>
                <div 
                  style={{ 
                    background: message.role === 'user' ? 'var(--bg-section)' : 'var(--accent-wash)',
                    padding: '1rem',
                    borderRadius: '12px',
                    maxWidth: '70%',
                    whiteSpace: 'pre-line'
                  }}
                  className="body-medium"
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--gradient-button)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot className="h-5 w-5" style={{ color: 'white' }} />
                </div>
                <div style={{ 
                  background: 'var(--accent-wash)',
                  padding: '1rem',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 0.2s' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce 1s infinite 0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Input Area */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tanyakan tentang masalah pencernaan Anda..."
            style={{ resize: 'none', minHeight: '60px' }}
            disabled={isLoading}
          />
          <Button
            className="btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{ height: '60px', width: '60px', padding: 0 }}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <p className="body-small" style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Doktor AI adalah asisten virtual. Untuk diagnosa medis, konsultasi dengan dokter profesional.
        </p>
      </div>
    </div>
  );
};

export default AIChat;