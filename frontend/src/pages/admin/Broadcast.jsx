import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area'; // Pastikan komponen ini ada, atau ganti div biasa
import { Save, Zap, Lightbulb, ShoppingBag, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Broadcast = () => {
  const { getAuthHeader } = useAuth();
  
  // State Hari Aktif (Default Hari 1)
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // State Tab Editor
  const [activeTab, setActiveTab] = useState('challenge'); // 'challenge', 'fact', 'soft_sell'
  const [activeCategory, setActiveCategory] = useState('A'); // Tipe A, B, C

  // State Data Konten untuk Hari yang Dipilih
  const [contentData, setContentData] = useState({
    challenge_a: '',
    challenge_b: '',
    challenge_c: '',
    fact_content: '',
    soft_sell_content: ''
  });

  // Load Data saat Hari Berubah (Klik Sidebar)
  useEffect(() => {
    fetchData(selectedDay);
    // eslint-disable-next-line
  }, [selectedDay]);

  const fetchData = async (day) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/campaign/${day}`, {
        headers: getAuthHeader()
      });
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

  // Handle Input Text
  const handleChange = (field, value) => {
    setContentData(prev => ({ ...prev, [field]: value }));
  };

  // Simpan Data
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/campaign/store`,
        { day_sequence: selectedDay, ...contentData },
        { headers: getAuthHeader() }
      );
      // Feedback visual sederhana (bisa diganti toast)
      alert(`✅ Tersimpan! Jadwal Hari ke-${selectedDay} siap.`);
    } catch (error) {
      alert("Gagal menyimpan: " + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Komponen Input Editor
  const renderEditor = () => {
    if (loading) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">Memuat data...</div>;
    }

    if (activeTab === 'challenge') {
      const currentField = `challenge_${activeCategory.toLowerCase()}`;
      return (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
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
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100 flex items-center gap-2">
                <Zap size={16}/>
                <span><strong>Jam 07:00 WIB:</strong> Tantangan untuk Tipe {activeCategory}.</span>
            </div>
            <Textarea 
                value={contentData[currentField]}
                onChange={(e) => handleChange(currentField, e.target.value)}
                placeholder={`Masukkan pesan tantangan pagi untuk Tipe ${activeCategory}...`}
                className="min-h-[300px] text-base font-sans leading-relaxed"
            />
        </div>
      );
    }
    
    if (activeTab === 'fact') {
      return (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
             <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-100 flex items-center gap-2">
                <Lightbulb size={16}/>
                <span><strong>Jam 12:00 WIB:</strong> Fakta & Tips (Broadcast ke SEMUA user).</span>
            </div>
            <Textarea 
                value={contentData.fact_content}
                onChange={(e) => handleChange('fact_content', e.target.value)}
                placeholder="Tulis fakta kesehatan & tips harian di sini..."
                className="min-h-[300px] text-base font-sans leading-relaxed"
            />
        </div>
      );
    }

    if (activeTab === 'soft_sell') {
      return (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
             <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShoppingBag size={16}/>
                    <span><strong>Digabung:</strong> Muncul di bawah pesan Jam 12:00.</span>
                </div>
                {selectedDay % 5 === 0 && <Badge className="bg-green-600">Hari Promo (Day {selectedDay})</Badge>}
            </div>
            <Textarea 
                value={contentData.soft_sell_content}
                onChange={(e) => handleChange('soft_sell_content', e.target.value)}
                placeholder="Tulis promosi produk di sini (Opsional)..."
                className="min-h-[300px] text-base font-sans leading-relaxed"
            />
        </div>
      );
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Konten 30 Hari</h1>
            <p className="text-gray-500">Pilih hari di menu kiri, lalu edit konten di kanan.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white hover:bg-slate-800 w-40">
            <Save className="mr-2 h-4 w-4" /> 
            {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full items-start">
        
        {/* KOLOM KIRI: LIST HARI (1-30) */}
        <Card className="col-span-3 h-[75vh] flex flex-col shadow-md">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold uppercase text-gray-500">Daftar Hari</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                {/* Area Scrollable untuk 30 Hari */}
                <div className="h-full overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 
                                ${selectedDay === day 
                                    ? 'bg-slate-900 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs 
                                    ${selectedDay === day ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {day}
                                </span>
                                Hari ke-{day}
                            </span>
                            
                            {/* Indikator Promo (Kelipatan 5) */}
                            {day % 5 === 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedDay === day ? 'bg-green-500/20 text-green-200' : 'bg-green-100 text-green-700'}`}>
                                    Promo
                                </span>
                            )}
                            
                            {selectedDay === day && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* KOLOM KANAN: EDITOR */}
        <Card className="col-span-9 h-[75vh] flex flex-col shadow-md border-t-4 border-t-slate-900">
            
            {/* Tab Navigasi Editor */}
            <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab('challenge')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2
                    ${activeTab === 'challenge' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <Zap size={18} /> Challenge (07:00)
                </button>
                <button 
                    onClick={() => setActiveTab('fact')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2
                    ${activeTab === 'fact' ? 'border-yellow-500 text-yellow-600 bg-yellow-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <Lightbulb size={18} /> Fakta & Tips (12:00)
                </button>
                <button 
                    onClick={() => setActiveTab('soft_sell')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2
                    ${activeTab === 'soft_sell' ? 'border-green-600 text-green-600 bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <ShoppingBag size={18} /> Soft Sell (Opsional)
                </button>
            </div>

            {/* Area Edit */}
            <CardContent className="p-6 overflow-y-auto flex-1 bg-white">
                <div className="max-w-4xl mx-auto">
                    {renderEditor()}
                    
                    <div className="mt-8 flex gap-3 items-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                            <Sparkles size={16} />
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p className="font-semibold text-gray-700">Variabel Dinamis:</p>
                            <p>Gunakan <code>{`{{nama}}`}</code> : Akan otomatis berubah menjadi nama user (Contoh: "Halo Budi").</p>
                            <p>Gunakan <code>{`{{link_checkin}}`}</code> : Link unik untuk user mengisi jurnal harian mereka.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Broadcast;
