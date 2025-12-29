import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: ''
    // group dihapus
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validasi sederhana
    if(!formData.name || !formData.email || !formData.password) {
        setError("Nama, Email, dan Password wajib diisi.");
        setLoading(false);
        return;
    }

    try {
      await register(formData);
      // Redirect ditangani di AuthContext atau otomatis ke login
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Daftar Akun</CardTitle>
          <p className="text-center text-gray-500">Mulai perjalanan sehatmu hari ini</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input 
                name="name" 
                placeholder="Nama Anda" 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="email@contoh.com" 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor WhatsApp</label>
              <Input 
                name="phone_number" 
                type="tel" 
                placeholder="0812..." 
                onChange={handleChange} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="******" 
                onChange={handleChange} 
                required 
              />
            </div>

            <Button className="w-full bg-slate-900 hover:bg-slate-800" type="submit" disabled={loading}>
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Masuk di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
