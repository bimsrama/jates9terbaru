import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Users, ShoppingCart, Wallet, DollarSign } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const { getAuthHeader } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPurchases: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, purchasesRes, withdrawalsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/dashboard/admin/users?limit=0`, { headers: getAuthHeader() }),
        axios.get(`${BACKEND_URL}/api/dashboard/admin/purchases?status=pending`, { headers: getAuthHeader() }),
        axios.get(`${BACKEND_URL}/api/dashboard/admin/withdrawals?status=pending`, { headers: getAuthHeader() })
      ]);

      setStats({
        totalUsers: usersRes.data.total || 0,
        pendingPurchases: purchasesRes.data.purchases?.length || 0,
        pendingWithdrawals: withdrawalsRes.data.withdrawals?.length || 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      <div className="ai-grid" style={{ marginBottom: '2rem' }}>
        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Users className="h-10 w-10" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.75rem' }} />
            <h3 className="heading-2">{stats.totalUsers}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Total Users</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <ShoppingCart className="h-10 w-10" style={{ color: '#FFD700', margin: '0 auto 0.75rem' }} />
            <h3 className="heading-2">{stats.pendingPurchases}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Pending Purchases</p>
          </CardContent>
        </Card>

        <Card className="product-card">
          <CardContent style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Wallet className="h-10 w-10" style={{ color: '#FF6B6B', margin: '0 auto 0.75rem' }} />
            <h3 className="heading-2">{stats.pendingWithdrawals}</h3>
            <p className="body-small" style={{ color: 'var(--text-secondary)' }}>Pending Withdrawals</p>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.location.href = '/admin/users'}>
          Manage Users
        </button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.location.href = '/admin/purchases'}>
          Verify Purchases
        </button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.location.href = '/admin/withdrawals'}>
          Process Withdrawals
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;