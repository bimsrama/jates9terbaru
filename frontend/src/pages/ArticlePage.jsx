import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card'; // Pastikan path ini sesuai dengan struktur folder Anda
import { ChevronLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/articles/${id}`);
        setArticle(res.data);
      } catch (error) {
        console.error("Gagal load artikel:", error);
        alert("Artikel tidak ditemukan");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: 'Baca artikel kesehatan ini di Jates9!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link artikel disalin!');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#64748b' }}>Memuat artikel...</div>;
  if (!article) return null;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* HEADER GAMBAR */}
      <div style={{ 
        width: '100%', 
        height: '35vh', 
        minHeight: '250px',
        background: '#e2e8f0', 
        position: 'relative',
        backgroundImage: article.image_url ? `url(${BACKEND_URL}${article.image_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%)' }}></div>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            position: 'absolute', top: '20px', left: '20px', 
            background: 'white', border: 'none', borderRadius: '50%', 
            width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10 
          }}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </button>

        <button 
          onClick={handleShare} 
          style={{ 
            position: 'absolute', top: '20px', right: '20px', 
            background: 'white', border: 'none', borderRadius: '50%', 
            width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10 
          }}
        >
          <Share2 size={20} color="#1e293b" />
        </button>
      </div>

      {/* KONTEN ARTIKEL */}
      <div style={{ maxWidth: '800px', margin: '-40px auto 0', padding: '0 1rem', position: 'relative', zIndex: 20 }}>
        <Card style={{ border: 'none', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)', background: 'white', overflow: 'hidden' }}>
          <CardContent style={{ padding: '2rem 1.5rem' }}>
            
            <h1 className="heading-2" style={{ fontSize: '1.6rem', lineHeight: '1.3', marginBottom: '1rem', color: '#0f172a' }}>{article.title}</h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#64748b', fontSize: '0.8rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14}/> Admin Jates</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14}/> {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14}/> {article.reading_time || '3 min'} baca</span>
            </div>

            <div style={{ 
              fontSize: '1rem', 
              lineHeight: '1.7', 
              color: '#334155', 
              whiteSpace: 'pre-line', 
              textAlign: 'justify' 
            }}>
              {article.content}
            </div>

          </CardContent>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.8rem' }}>
          &copy; Jates9 - Jagatetapsehat
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
