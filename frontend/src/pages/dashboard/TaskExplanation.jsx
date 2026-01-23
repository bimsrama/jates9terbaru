import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Bot, ChevronLeft, Loader2, Sparkles, Activity, CheckCircle2, Info, HeartPulse } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const TaskExplanation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { getAuthHeader } = useAuth();
    
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);

    // Ambil data yang dikirim dari Dashboard
    const { tasks, challengeTitle, day } = state || {};

    useEffect(() => {
        // Redirect jika tidak ada data (misal refresh manual)
        if (!tasks || tasks.length === 0) {
            navigate('/dashboard'); 
            return;
        }
        fetchExplanation();
    }, []);

    const fetchExplanation = async () => {
        try {
            const res = await axios.post(
                `${BACKEND_URL}/api/explain-tasks`,
                { tasks, challenge_title: challengeTitle, day },
                { headers: getAuthHeader() }
            );
            setExplanation(res.data.explanation);
        } catch (error) {
            setExplanation("Maaf, Dr. Alva sedang sibuk. Coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center">
             {/* --- Header Sticky --- */}
             <div className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={20} className="text-slate-700" />
                </button>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Misi Hari {day}</h2>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{challengeTitle}</p>
                </div>
            </div>

            {/* --- Content Container --- */}
            <div className="w-full max-w-lg p-4 pb-24 flex flex-col gap-6">
                
                {/* 1. KARTU LIST TUGAS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Aktivitas Fisik</h3>
                    </div>
                    <div className="space-y-3">
                        {tasks.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700 font-medium leading-relaxed">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. KARTU ANALISA DR. ALVA */}
                <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
                    {/* Header Kartu Dokter */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                                <Bot size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Kata Dr. Alva</h1>
                                <p className="text-indigo-100 text-xs flex items-center gap-1">
                                    <Sparkles size={12} /> AI Health Analysis
                                </p>
                            </div>
                        </div>
                        {/* Hiasan background */}
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-[-20px] left-[-10px] w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
                    </div>

                    <CardContent className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <HeartPulse size={20} className="text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-slate-500 text-sm animate-pulse font-medium">Sedang meracik penjelasan...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Alert Info */}
                                <div className="flex gap-3 p-3 bg-indigo-50 text-indigo-800 text-xs rounded-lg border border-indigo-100 items-start">
                                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                                    <p className="leading-relaxed">
                                        Penjelasan ini disesuaikan dengan kondisi tubuh dan program yang sedang kamu jalani.
                                    </p>
                                </div>

                                {/* Konten Penjelasan */}
                                <div className="prose prose-sm prose-slate max-w-none">
                                    {/* Memisahkan paragraf agar lebih enak dibaca */}
                                    {explanation.split('\n').map((paragraph, idx) => {
                                        // Skip paragraf kosong
                                        if (!paragraph.trim()) return null;
                                        
                                        // Deteksi jika ini adalah poin (bullet point atau angka)
                                        const isListItem = /^[•\-\d\.]/.test(paragraph.trim());
                                        
                                        return (
                                            <p key={idx} className={`text-slate-600 leading-7 ${isListItem ? 'pl-4 font-medium text-slate-700' : 'mb-3'}`}>
                                                {paragraph}
                                            </p>
                                        );
                                    })}
                                </div>

                                {/* Footer Motivasi */}
                                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                    <p className="text-sm font-semibold text-slate-400">#SehatSetiapHari</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default TaskExplanation;
