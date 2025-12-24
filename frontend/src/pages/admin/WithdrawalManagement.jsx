import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const WithdrawalManagement = () => {
  const { getAuthHeader } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/dashboard/admin/withdrawals?status=pending`,
        { headers: getAuthHeader() }
      );
      setWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (withdrawalId, approved) => {
    const note = approved ? 'Approved by admin' : prompt('Reason for rejection:');
    if (!approved && !note) return;

    try {
      await axios.put(
        `${BACKEND_URL}/api/dashboard/admin/withdrawals/${withdrawalId}?approved=${approved}&note=${encodeURIComponent(note || '')}`,
        {},
        { headers: getAuthHeader() }
      );
      fetchWithdrawals();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Withdrawal Management</h1>

      {withdrawals.length === 0 ? (
        <Card className="product-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CardContent>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <p className="body-medium">No pending withdrawals</p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {withdrawals.map(w => (
            <Card key={w.id} className="product-card">
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="body-medium" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      {w.user_name} ({w.user_phone})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
                        Bank: {w.bank_name} - {w.account_number}
                      </p>
                      <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
                        A/N: {w.account_name}
                      </p>
                    </div>
                    <Badge style={{ background: 'var(--accent-primary)', color: 'white' }}>
                      Rp {w.amount.toLocaleString('id-ID')}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      onClick={() => handleProcess(w.id, true)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Pay
                    </Button>
                    <Button 
                      onClick={() => handleProcess(w.id, false)}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#FF6B6B', color: 'white', border: 'none' }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagement;