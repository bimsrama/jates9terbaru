import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Bot, ChevronLeft, Loader2, Sparkles, Activity, CheckCircle2, Info, HeartPulse, Youtube, PlayCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

const TaskExplanation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { getAuthHeader } = useAuth();
    
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);

    const { tasks, challengeTitle, day } = state || {};

    useEffect(() => {
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

    // --- FUNGSI MERUBAH TEKS JADI TOMBOL YOUTUBE ---
    const renderTextWithLinks = (text) => {
        // Regex untuk menangkap format Markdown [Teks](URL)
        const parts = text.split(/(\[.*?\]\(.*?\))/g);
        
        return parts.map((part, i) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                // Jika ketemu link, render sebagai Tombol Video
                return (
                    <a 
                        key={i} 
                        href={match[2]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white font-bold bg-[#FF0000] hover:bg-[#cc0000] px-3 py-1.5 rounded-full mx-1 shadow-sm transition-transform active:scale-95 text-xs no-underline"
                    >
                        <Youtube size={16} fill="white" /> {match[1]}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center">
             {/* Header */}
             <div className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <ChevronLeft size={20} className="text-slate-700" />
                </button>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Panduan Hari {day}</h2>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{challengeTitle}</p>
                </div>
            </div>

            <div className="w-full max-w-lg p-4 pb-24 flex flex-col gap-6">
                
                {/* KARTU 1: DAFTAR TUGAS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Target Latihan</h3>
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

                {/* KARTU 2: PANDUAN TEKNIS & VIDEO */}
                <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                                <PlayCircle size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Instruksi & Video</h1>
                                <p className="text-indigo-100 text-xs flex items-center gap-1">
                                    <Sparkles size={12} /> AI Trainer Guidance
                                </p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <HeartPulse size={20} className="text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-slate-500 text-sm animate-pulse font-medium">Mencari video panduan...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Alert Info */}
                                <div className="flex gap-3 p-3 bg-indigo-50 text-indigo-800 text-xs rounded-lg border border-indigo-100 items-start">
                                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                                    <p className="leading-relaxed">
                                        Ikuti panduan di bawah agar gerakanmu benar dan efektif. Klik tombol merah untuk melihat video contoh.
                                    </p>
                                </div>

                                {/* Konten Penjelasan */}
                                <div className="prose prose-sm prose-slate max-w-none">
                                    {explanation.split('\n').map((paragraph, idx) => {
                                        if (!paragraph.trim()) return null;
                                        
                                        // Deteksi poin
                                        const isListItem = /^[•\-\d\.]/.test(paragraph.trim());
                                        
                                        return (
                                            <div key={idx} className={`text-slate-600 leading-7 ${isListItem ? 'pl-4 font-medium text-slate-700' : 'mb-3'}`}>
                                                {/* Render Text dengan Tombol Video */}
                                                {renderTextWithLinks(paragraph)}
                                            </div>
                                        );
                                    })}
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
