import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserManagement = () => {
  const { getAuthHeader, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/dashboard/admin/users`,
        { headers: getAuthHeader() }
      );
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/dashboard/admin/users/${userId}`,
        { headers: getAuthHeader() }
      );
      fetchUsers();
    } catch (error) {
      alert('Error deleting user: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="heading-2" style={{ marginBottom: '2rem' }}>User Management</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users.map(u => (
          <Card key={u.id} className="product-card">
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="body-medium" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{u.name}</h3>
                  <p className="body-small" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{u.phone_number}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Badge style={{ background: u.role === 'admin' || u.role === 'super_admin' ? 'var(--accent-primary)' : 'var(--bg-section)', color: u.role === 'admin' || u.role === 'super_admin' ? 'white' : 'var(--text-body)' }}>
                      {u.role}
                    </Badge>
                    {u.challenge_enrolled && <Badge style={{ background: 'var(--accent-wash)', color: 'var(--accent-text)' }}>Challenge</Badge>}
                    <Badge>Referrals: {u.total_referrals}</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                  <div className="body-small">
                    <span style={{ color: 'var(--text-secondary)' }}>Commission:</span> Rp {(u.total_commission || 0).toLocaleString('id-ID')}
                  </div>
                  {user?.role === 'super_admin' && (
                    <Button 
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ background: '#FF6B6B', border: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;