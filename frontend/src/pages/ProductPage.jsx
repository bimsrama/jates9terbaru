import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Check, Star, ShoppingCart } from 'lucide-react';
import { productInfo } from '../mock';

const ProductPage = () => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState('premium');

  const handlePurchase = (variantId) => {
    // Mock purchase - akan diintegrasikan dengan Midtrans nanti
    const variant = productInfo.variants.find(v => v.id === variantId);
    alert(`Pembelian ${variant.name} akan segera diproses. Fitur payment gateway sedang dalam pengembangan.`);
    // navigate('/checkout');
  };

  return (
    <div className="product-page">
      {/* Hero Product Section */}
      <section style={{ background: 'var(--gradient-hero)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <Badge style={{ background: 'var(--accent-primary)', color: 'white', marginBottom: '1rem' }}>
            Superfood Enzim Buah
          </Badge>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1rem' }}>
            {productInfo.name}
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--accent-text)', fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 600 }}>
            {productInfo.tagline}
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Mengapa Jates9 Berbeda?
        </h2>
        <div className="ai-grid">
          {productInfo.benefits.map((benefit, index) => {
            const IconComponent = require('lucide-react')[benefit.icon];
            return (
              <Card key={index} className="product-card">
                <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-wash)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <IconComponent className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <h3 className="heading-3" style={{ marginBottom: '0.75rem' }}>{benefit.title}</h3>
                  <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ background: 'var(--bg-section)', padding: '4rem 1.5rem' }}>
        <div className="container">
          <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Pilih Paket yang Sesuai
          </h2>
          <p className="body-large" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Diskon khusus untuk member program 30 hari
          </p>

          <div className="ai-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {productInfo.variants.map((variant) => (
              <Card 
                key={variant.id} 
                className="product-card" 
                style={{ 
                  border: variant.recommended ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                  position: 'relative'
                }}
              >
                {variant.recommended && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    background: 'var(--gradient-button)',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    ⭐ PALING POPULER
                  </div>
                )}
                <CardHeader style={{ textAlign: 'center', paddingTop: variant.recommended ? '2rem' : '1.5rem' }}>
                  <CardTitle className="heading-3" style={{ marginBottom: '0.5rem' }}>{variant.name}</CardTitle>
                  <CardDescription style={{ fontSize: '1rem', fontWeight: 500 }}>{variant.duration}</CardDescription>
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        Rp {variant.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <Badge style={{ background: 'var(--accent-primary)', color: 'white' }}>
                        Hemat {variant.discount}%
                      </Badge>
                    </div>
                    <div className="heading-2" style={{ color: 'var(--accent-text)' }}>
                      Rp {variant.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={variant.recommended ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%', marginBottom: '1.5rem' }}
                    onClick={() => handlePurchase(variant.id)}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {variant.recommended ? 'Beli Sekarang' : 'Pilih Paket'}
                  </Button>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Per hari: Rp {Math.round(variant.price / parseInt(variant.duration)).toLocaleString('id-ID')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div style={{ maxWidth: '700px', margin: '3rem auto 0', textAlign: 'center' }}>
            <Card style={{ background: 'var(--accent-wash)', border: 'none' }}>
              <CardContent style={{ padding: '2rem' }}>
                <h3 className="heading-3" style={{ marginBottom: '1rem' }}>🎁 Bonus Eksklusif Member</h3>
                <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                  <li className="body-medium" style={{ marginBottom: '0.5rem' }}>✅ Konsultasi GRATIS dengan Coach via WhatsApp</li>
                  <li className="body-medium" style={{ marginBottom: '0.5rem' }}>✅ Akses ke Doktor AI tanpa batas</li>
                  <li className="body-medium" style={{ marginBottom: '0.5rem' }}>✅ E-book "Panduan Lengkap Hidup Sehat Pencernaan"</li>
                  <li className="body-medium">✅ Garansi uang kembali 30 hari</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Apa Kata Mereka?
        </h2>
        <div className="ai-grid">
          {productInfo.testimonials.map((testimonial, index) => (
            <Card key={index} className="product-card">
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: 'var(--gradient-button)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem'
                  }}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <CardTitle style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{testimonial.name}, {testimonial.age}</CardTitle>
                    <CardDescription style={{ fontSize: '0.875rem' }}>{testimonial.problem}</CardDescription>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="h-4 w-4" style={{ fill: 'var(--accent-primary)', color: 'var(--accent-primary)' }} />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ background: 'var(--accent-wash)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div className="body-small" style={{ fontWeight: 600, color: 'var(--accent-text)', marginBottom: '0.25rem' }}>
                    🎉 Hasil:
                  </div>
                  <div className="body-medium">{testimonial.result}</div>
                </div>
                <p className="body-medium" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--gradient-hero)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
            Mulai Perjalanan Kesembuhan Anda Hari Ini
          </h2>
          <p className="body-large" style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Bergabung dengan Program 30 Hari + Jates9 = Formula Terbukti Sembuhkan Masalah Pencernaan
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              className="btn-primary"
              size="lg"
              onClick={() => handlePurchase('premium')}
            >
              Beli Paket Premium
            </Button>
            <Button 
              className="btn-secondary"
              size="lg"
              onClick={() => navigate('/chat')}
            >
              Konsultasi Dulu
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;