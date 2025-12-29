import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Save, Zap, Lightbulb, ShoppingBag, Sparkles, Calendar } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Broadcast = () => {
  const { getAuthHeader } = useAuth();
  
  // State Hari (Default Hari ke-1)
  const [day, setDay] = useState(1);
  const [loading, setLoading] = useState(false);

  // State Navigasi Tab
  const [activeTab, setActiveTab] = useState('challenge'); // 'challenge', 'fact', 'soft_sell'
  const [activeCategory, setActiveCategory] = useState('A'); // Tipe A, B, C

  // State Data Konten
  const [contentData, setContentData] = useState({
    challenge_a: '',
    challenge_b: '',
    challenge_c: '',
    fact_content: '',
    soft_sell_content: ''
  });

  // Load Data dari Backend saat 'day' berubah
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/campaign/${day}`, {
          headers: getAuthHeader()
        });
        // Pastikan data tidak null
        const data = res.data || {};
        setContentData({
          challenge_a: data.challenge_a || '',
          challenge_b: data.challenge_b || '',
          challenge_c: data.challenge_c || '',
          fact_content: data.fact_content || '',
          soft_sell_content: data.soft_sell_content || ''
        });
      } catch (error) {
        console.error("Gagal load data", error);
        // Reset form jika error/data kosong
        setContentData({ challenge_a: '', challenge_b: '', challenge_c: '', fact_content: '', soft_sell_content: '' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [day, getAuthHeader]);

  // Handle Perubahan Textarea
  const handleChange = (field, value) => {
    setContentData(prev => ({ ...prev, [field]: value }));
  };

  // Fungsi Simpan ke Database
  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/campaign/store`,
        { day_sequence: day, ...contentData },
        { headers: getAuthHeader() }
      );
      alert(`✅ Jadwal Hari ke-${day} berhasil disimpan!`);
    } catch (error) {
      alert("Gagal menyimpan: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Render Logic untuk Input Area
  const renderInputArea = () => {
    if (activeTab === 'challenge') {
      const currentField = `challenge_${activeCategory.toLowerCase()}`;
      return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                {['A', 'B', 'C'].map(grp => (
                    <Button 
                        key={grp} 
                        size="sm"
                        variant={activeCategory === grp ? "default" : "outline"}
                        onClick={() => setActiveCategory(grp)}
                        className={activeCategory === grp ? "bg-slate-900 text-white" : ""}
                    >
                        Tipe {grp}
                    </Button>
                ))}
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded mb-2 border border-blue-100 flex items-center gap-2">
                <Zap size={16}/>
                <span><strong>Jam 07:00 WIB:</strong> Pesan tantangan pagi untuk user Tipe {activeCategory}.</span>
            </div>
            <Textarea 
                value={contentData[currentField]}
                onChange={(e) => handleChange(currentField, e.target.value)}
                placeholder={`Tulis pesan tantangan pagi untuk Tipe ${activeCategory} di sini...`}
                className="min-h-[250px] font-sans text-base"
            />
        </div>
      );
    }
    
    if (activeTab === 'fact') {
      return (
        <div className="space-y-4">
             <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded mb-2 border border-yellow-100 flex items-center gap-2">
                <Lightbulb size={16}/>
                <span><strong>Jam 12:00 WIB:</strong> Fakta & Tips Kesehatan (Dikirim ke SEMUA user).</span>
            </div>
            <Textarea 
                value={contentData.fact_content}
                onChange={(e) => handleChange('fact_content', e.target.value)}
                placeholder="Tulis fakta kesehatan & tips harian di sini..."
                className="min-h-[250px] font-sans text-base"
            />
        </div>
      );
    }

    if (activeTab === 'soft_sell') {
      return (
        <div className="space-y-4">
             <div className="p-3 bg-green-50 text-green-700 text-sm rounded mb-2 border border-green-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShoppingBag size={16}/>
                    <span><strong>Digabung dengan Fakta:</strong> Pesan ini akan ditempel di bawah pesan Jam 12:00.</span>
                </div>
                {day % 5 === 0 && <Badge className="bg-green-600">Hari Promo (Day {day})</Badge>}
            </div>
            <Textarea 
                value={contentData.soft_sell_content}
                onChange={(e) => handleChange('soft_sell_content', e.target.value)}
                placeholder="Tulis promosi produk (Jates, dll) di sini... (Opsional)"
                className="min-h-[250px] font-sans text-base"
            />
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
            <h1 className="heading-2">Jadwal Konten Otomatis</h1>
            <p className="text-gray-500">Isi konten untuk 30 hari, sistem akan mengirim otomatis sesuai jam.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border p-1 rounded-md shadow-sm">
            <div className="bg-gray-100 p-2 rounded">
                <Calendar size={20} className="text-gray-600"/>
            </div>
            <div className="flex flex-col px-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Edit Hari Ke</span>
                <Input 
                    type="number" 
                    className="w-16 h-6 p-0 border-none focus-visible:ring-0 font-bold text-lg" 
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                    min={1} max={30}
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Menu */}
        <Card className="md:col-span-3 h-fit">
            <CardContent className="p-3 grid gap-2">
                <Button variant={activeTab === 'challenge' ? 'default' : 'ghost'} className={`justify-start w-full ${activeTab === 'challenge' ? 'bg-slate-900 text-white' : ''}`} onClick={() => setActiveTab('challenge')}>
                    <Zap className="mr-2 h-4 w-4" /> Challenge (07:00)
                </Button>
                <Button variant={activeTab === 'fact' ? 'default' : 'ghost'} className={`justify-start w-full ${activeTab === 'fact' ? 'bg-slate-900 text-white' : ''}`} onClick={() => setActiveTab('fact')}>
                    <Lightbulb className="mr-2 h-4 w-4" /> Fakta & Tips (12:00)
                </Button>
                <Button variant={activeTab === 'soft_sell' ? 'default' : 'ghost'} className={`justify-start w-full ${activeTab === 'soft_sell' ? 'bg-slate-900 text-white' : ''}`} onClick={() => setActiveTab('soft_sell')}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Soft Sell (Opsional)
                </Button>
            </CardContent>
        </Card>

        {/* Editor Content */}
        <Card className="md:col-span-9">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="text-lg font-medium">Editor Pesan</CardTitle>
                <Button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Save className="mr-2 h-4 w-4" /> 
                    {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                {renderInputArea()}
                
                <div className="mt-6 flex gap-2 items-center bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-100">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>
                        Tips: Gunakan <code>{`{{nama}}`}</code> untuk menyapa nama user & <code>{`{{link_checkin}}`}</code> untuk link jurnal harian.
                    </span>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Broadcast;
