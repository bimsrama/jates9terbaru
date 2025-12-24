import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, Zap, Heart, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { productInfo } from '../mock';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Sembuhkan Masalah Pencernaan Anda Dalam 30 Hari
          </h1>
          <p className="hero-subtitle">
            Program pendampingan GRATIS dengan sistem terbukti membantu ribuan orang sembuh dari maag, kembung, dan sembelit tanpa ketergantungan obat.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Button 
              className="btn-primary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Daftar Gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              className="btn-secondary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sudah Punya Akun? Masuk
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>
            Apakah Anda Mengalami Ini?
          </h2>
          <div className="ai-grid" style={{ textAlign: 'left', marginTop: '2rem' }}>
            <Card className="product-card">
              <CardContent style={{ paddingTop: '1.5rem' }}>
                <CheckCircle className="h-8 w-8" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Maag Kambuh Terus</h3>
                <p className="body-small">Perut perih, mual, tidak nafsu makan. Sudah minum obat tapi hanya sembuh sementara.</p>
              </CardContent>
            </Card>
            <Card className="product-card">
              <CardContent style={{ paddingTop: '1.5rem' }}>
                <CheckCircle className="h-8 w-8" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Kembung & Banyak Gas</h3>
                <p className="body-small">Perut terasa begah, sering sendawa, buang angin tidak nyaman di tempat umum.</p>
              </CardContent>
            </Card>
            <Card className="product-card">
              <CardContent style={{ paddingTop: '1.5rem' }}>
                <CheckCircle className="h-8 w-8" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Susah BAB</h3>
                <p className="body-small">BAB tidak lancar, perut keras, harus mengejan kuat. Kadang sampai berhari-hari.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section style={{ background: 'var(--bg-section)', padding: '4rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
              Solusi Kami: Trust-Based Healing
            </h2>
            <p className="body-large" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Kami tidak langsung jualan obat. Kami memberikan program pendampingan GRATIS 30 hari untuk membangun kepercayaan dan membuktikan sistem kami bekerja.
            </p>
          </div>

          <div className="ai-grid">
            <Card className="product-card">
              <CardHeader>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>1</span>
                </div>
                <CardTitle>Kuis Kesehatan</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kami identifikasi masalah spesifik Anda (Tipe A: Sembelit, Tipe B: Kembung, Tipe C: Maag) untuk solusi yang tepat.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="product-card">
              <CardHeader>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>2</span>
                </div>
                <CardTitle>Program 30 Hari</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pendampingan harian via WhatsApp + Website. Tugas sederhana yang langsung terasa efeknya.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="product-card">
              <CardHeader>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--accent-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>3</span>
                </div>
                <CardTitle>Jates9 Accelerator</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Superfood alami yang mempercepat penyembuhan. Ditawarkan setelah Anda merasakan hasilnya.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
            {productInfo.name}
          </h2>
          <p className="body-large" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
            {productInfo.tagline}
          </p>
        </div>

        <div className="ai-grid" style={{ marginBottom: '3rem' }}>
          {productInfo.benefits.map((benefit, index) => {
            const Icon = { Leaf, Zap, Heart, Shield }[benefit.icon];
            return (
              <Card key={index} className="product-card">
                <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
                  <Icon className="h-12 w-12" style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
                  <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>{benefit.title}</h3>
                  <p className="body-small">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            className="btn-primary"
            size="lg"
            onClick={() => navigate('/register')}
          >
            Daftar & Lihat Paket
          </Button>
          <Button 
            className="btn-secondary"
            size="lg"
            onClick={() => navigate('/product')}
          >
            Lihat Detail Produk
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'var(--gradient-hero)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
            Siap Mulai Perjalanan Kesembuhan Anda?
          </h2>
          <p className="body-large" style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Daftar sekarang dan dapatkan akses ke Program 30 Hari Challenge GRATIS!
          </p>
          <Button 
            className="btn-primary"
            size="lg"
            onClick={() => navigate('/register')}
          >
            Daftar Gratis Sekarang <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;