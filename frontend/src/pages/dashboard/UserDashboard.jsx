import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Activity, TrendingUp, Users, Wallet } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserDashboard = () => {
  const { getAuthHeader, user } = useAuth();
  const [overview, setOverview] = useState(null);
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

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="body-medium" style={{ color: 'var(--text-secondary)' }}>Memuat dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
        <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
          Selamat datang kembali, {overview?.user?.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="ai-grid" style={{ marginBottom: '2rem' }}>
        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent-wash)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Activity className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>{overview?.challenge?.current_day || 0}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Hari Challenge</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent-wash)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <TrendingUp className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>{overview?.challenge?.total_checkins || 0}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Check-in Selesai</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent-wash)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Users className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>{overview?.financial?.total_referrals || 0}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Total Referral</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent-wash)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Wallet className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>
              Rp {(overview?.financial?.commission_pending || 0).toLocaleString('id-ID')}
            </h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Komisi Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Info */}
      <Card className="product-card" style={{ marginBottom: '2rem', background: 'var(--gradient-hero)', border: 'none' }}>
        <CardHeader>
          <CardTitle className="heading-3">Kode Referral Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div className="heading-2" style={{ color: 'var(--accent-text)', letterSpacing: '0.2em' }}>
              {overview?.user?.referral_code || 'LOADING'}
            </div>
          </div>
          <p className="body-small" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            Bagikan kode ini ke teman Anda dan dapatkan komisi 10% dari setiap pembelian mereka!
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className="btn-primary"
          onClick={() => window.location.href = '/dashboard/checkin'}
          style={{ flex: '1', minWidth: '200px' }}
        >
          📝 Check-in Hari Ini
        </button>
        <button 
          className="btn-secondary"
          onClick={() => window.location.href = '/dashboard/health-report'}
          style={{ flex: '1', minWidth: '200px' }}
        >
          📊 Lihat Rapor Kesehatan
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;