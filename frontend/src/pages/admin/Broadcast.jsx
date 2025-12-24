import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Send, Users, MessageCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Broadcast = () => {
  const { getAuthHeader } = useAuth();
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return alert("Pesan tidak boleh kosong");
    if (!window.confirm("Kirim pesan WA ke target audiens ini?")) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/dashboard/admin/broadcast`,
        { target_group: target, message: message },
        { headers: getAuthHeader() }
      );
      alert(res.data.message);
      setMessage("");
    } catch (error) {
      alert("Gagal kirim: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Broadcast WhatsApp</h1>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={20}/> Target Penerima</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="text-sm font-medium mb-2 block">Pilih Kategori Kesehatan</label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger><SelectValue placeholder="Pilih Target" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📢 Semua User</SelectItem>
                <SelectItem value="A">💩 Tipe A (Sembelit)</SelectItem>
                <SelectItem value="B">🎈 Tipe B (Kembung)</SelectItem>
                <SelectItem value="C">🔥 Tipe C (Maag/GERD)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-4">
              Pesan akan dikirim menggunakan Watzap.id Gateway.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircle size={20}/> Isi Pesan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Contoh: Halo! Jangan lupa minum air hangat pagi ini ya..." 
              className="min-h-[150px] mb-4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button className="w-full btn-primary" onClick={handleSend} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Mengirim...' : 'Kirim Broadcast'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Broadcast;
