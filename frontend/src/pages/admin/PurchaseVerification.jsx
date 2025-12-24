import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PurchaseVerification = () => {
  const { getAuthHeader } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/dashboard/admin/purchases?status=pending`,
        { headers: getAuthHeader() }
      );
      setPurchases(response.data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (purchaseId, approved) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/dashboard/admin/purchases/${purchaseId}/verify?approved=${approved}`,
        {},
        { headers: getAuthHeader() }
      );
      fetchPurchases();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Purchase Verification</h1>

      {purchases.length === 0 ? (
        <Card className="product-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CardContent>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <p className="body-medium">No pending purchases</p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {purchases.map(p => (
            <Card key={p.id} className="product-card">
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="body-medium" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{p.product_name}</h3>
                    <p className="body-small" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {p.user_name} ({p.user_phone})
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Badge style={{ background: 'var(--accent-primary)', color: 'white' }}>
                        Rp {p.amount.toLocaleString('id-ID')}
                      </Badge>
                      <span className="body-small" style={{ color: 'var(--text-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      onClick={() => handleVerify(p.id, true)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleVerify(p.id, false)}
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

export default PurchaseVerification;