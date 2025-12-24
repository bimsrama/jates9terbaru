import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, DollarSign, TrendingUp, Copy, Check } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Affiliate = () => {
  const { getAuthHeader, user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/dashboard/user/overview`,
        { headers: getAuthHeader() }
      );
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const code = overview?.user?.referral_code || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const code = overview?.user?.referral_code || '';
    const message = `Halo! Saya ingin mengajak kamu bergabung di Program 30 Hari Usus Sehat JATES9. Gunakan kode referral saya: ${code} untuk mendapatkan bonus spesial! \n\nDaftar di: ${window.location.origin}/register`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="body-medium" style={{ color: 'var(--text-secondary)' }}>Memuat data afiliasi...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Program Afiliasi</h1>
        <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
          Dapatkan komisi 10% dari setiap pembelian referral Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="ai-grid" style={{ marginBottom: '2rem' }}>
        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Users className="h-10 w-10" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.75rem' }} />
            <h3 className="heading-2" style={{ marginBottom: '0.25rem' }}>{overview?.financial?.total_referrals || 0}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Total Referral</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <DollarSign className="h-10 w-10" style={{ color: '#FFD700', margin: '0 auto 0.75rem' }} />
            <h3 className="heading-2" style={{ marginBottom: '0.25rem' }}>
              Rp {(overview?.financial?.commission_pending || 0).toLocaleString('id-ID')}
            </h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi Pending</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <TrendingUp className="h-10 w-10" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.75rem' }} />
            <h3 className="heading-2" style={{ marginBottom: '0.25rem' }}>
              Rp {(overview?.financial?.commission_approved || 0).toLocaleString('id-ID')}
            </h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi Approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card className="product-card" style={{ marginBottom: '2rem', background: 'var(--gradient-hero)', border: 'none' }}>
        <CardHeader>
          <CardTitle className="heading-3">Kode Referral Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="heading-1" style={{ color: 'var(--accent-text)', letterSpacing: '0.2em' }}>
                {overview?.user?.referral_code || 'LOADING'}
              </div>
              <button
                onClick={copyReferralCode}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-wash)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Copy code"
              >
                {copied ? <Check style={{ color: 'var(--accent-primary)' }} /> : <Copy style={{ color: 'var(--accent-text)' }} />}
              </button>
            </div>
          </div>
          
          <Button 
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={shareWhatsApp}
          >
            📱 Bagikan via WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="product-card" style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <CardTitle className="heading-3">Cara Kerja Program Afiliasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--accent-wash)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
                color: 'var(--accent-text)'
              }}>1</div>
              <div>
                <h4 className="body-medium" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Bagikan Kode Referral</h4>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Ajak teman dan keluarga untuk bergabung menggunakan kode referral Anda</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--accent-wash)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
                color: 'var(--accent-text)'
              }}>2</div>
              <div>
                <h4 className="body-medium" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Mereka Membeli Produk</h4>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Setiap kali referral Anda membeli produk Jates9, Anda mendapat komisi 10%</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--accent-wash)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
                color: 'var(--accent-text)'
              }}>3</div>
              <div>
                <h4 className="body-medium" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Tarik Komisi</h4>
                <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi akan disetujui admin setelah pembelian diverifikasi, lalu bisa ditarik ke rekening Anda</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <Button 
          className="btn-primary"
          onClick={() => window.location.href = '/dashboard/withdrawal'}
          disabled={(overview?.financial?.commission_approved || 0) === 0}
        >
          Tarik Komisi
        </Button>
        {(overview?.financial?.commission_approved || 0) === 0 && (
          <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Belum ada komisi yang bisa ditarik
          </p>
        )}
      </div>
    </div>
  );
};

export default Affiliate;