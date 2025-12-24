import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Withdrawal = () => {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${BACKEND_URL}/api/dashboard/user/withdrawal`,
        {
          amount: parseFloat(formData.amount),
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_name: formData.account_name
        },
        { headers: getAuthHeader() }
      );

      setSuccess(true);
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      setError(error.response?.data?.detail || 'Gagal mengajukan penarikan');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <Card className="product-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <CardContent>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>Permintaan Dikirim!</h2>
            <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Permintaan penarikan Anda sebesar Rp {parseFloat(formData.amount).toLocaleString('id-ID')} sedang diproses oleh admin.
              Anda akan menerima notifikasi via WhatsApp setelah disetujui.
            </p>
            <Button 
              className="btn-primary"
              onClick={() => window.location.href = '/dashboard'}
            >
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Penarikan Komisi</h1>
        <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
          Ajukan penarikan komisi Anda ke rekening bank
        </p>
      </div>

      <Card className="product-card">
        <CardContent style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div style={{ 
                background: 'rgba(220, 38, 38, 0.1)', 
                border: '1px solid rgba(220, 38, 38, 0.3)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <div>
              <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Jumlah Penarikan (Rp) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100000"
                required
                min="50000"
                step="1000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem'
                }}
              />
              <p className="body-small" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Minimal penarikan: Rp 50.000
              </p>
            </div>

            <div>
              <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Nama Bank *
              </label>
              <select
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem'
                }}
              >
                <option value="">Pilih Bank</option>
                <option value="BCA">BCA</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
                <option value="CIMB Niaga">CIMB Niaga</option>
                <option value="Permata">Permata</option>
                <option value="Danamon">Danamon</option>
                <option value="BTN">BTN</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Nomor Rekening *
              </label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="1234567890"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label className="body-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Nama Pemilik Rekening *
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Sesuai dengan rekening bank"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ background: 'var(--accent-wash)', padding: '1rem', borderRadius: '8px' }}>
              <p className="body-small" style={{ color: 'var(--text-secondary)' }}>
                ⚠️ Pastikan data rekening Anda benar. Penarikan akan diproses dalam 1-3 hari kerja setelah disetujui admin.
              </p>
            </div>

            <Button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Memproses...' : 'Ajukan Penarikan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawal;