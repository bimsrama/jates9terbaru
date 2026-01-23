import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Bot, ChevronLeft, Loader2, Target, HeartPulse, PlayCircle, Lightbulb, Youtube, Dumbbell } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '[https://jagatetapsehat.com/backend_api](https://jagatetapsehat.com/backend_api)';

const TaskExplanation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { getAuthHeader } = useAuth();
    
    // State sekarang menampung object JSON, bukan string
    const [aiData, setAiData] = useState(null);
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
            setAiData(res.data.explanation);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center">
             {/* --- Header Sticky --- */}
             <div className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={20} className="text-slate-700" />
                </button>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Panduan Hari {day}</h2>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{challengeTitle}</p>
                </div>
            </div>

            {/* --- Content --- */}
            <div className="w-full max-w-lg p-4 pb-24 flex flex-col gap-5">
                
                {/* LIST TUGAS (Preview Singkat) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Misi Kamu Hari Ini</h3>
                    <ul className="space-y-2">
                        {tasks.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                        <p className="text-slate-500 text-sm animate-pulse">Dr. Alva sedang menganalisa...</p>
                    </div>
                ) : aiData ? (
                    <>
                        {/* CARD 1: KENAPA PENTING (Purpose) */}
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                    <Target size={18} />
                                </div>
                                <h3 className="font-bold text-slate-800">Kenapa Penting?</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {aiData.why_important}
                            </p>
                        </div>

                        {/* CARD 2: MANFAAT KESEHATAN (Health) */}
                        <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                                    <HeartPulse size={18} />
                                </div>
                                <h3 className="font-bold text-slate-800">Dampak Kesehatan</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {aiData.health_benefit}
                            </p>
                        </div>

                        {/* CARD 3: PANDUAN TEKNIS (Instruction) */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                                    <Dumbbell size={18} />
                                </div>
                                <h3 className="font-bold text-slate-800">Cara Melakukan</h3>
                            </div>
                            
                            <div className="text-sm text-slate-600 leading-7 whitespace-pre-wrap">
                                {aiData.instruction}
                            </div>

                            {/* Tombol YouTube */}
                            {aiData.youtube_keyword && (
                                <a 
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(aiData.youtube_keyword)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md shadow-red-200"
                                >
                                    <Youtube size={18} fill="white" />
                                    Tonton Panduan Video
                                </a>
                            )}
                        </div>

                        {/* CARD 4: PRO TIP */}
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                            <Lightbulb size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm mb-1">Pro Tip Dr. Alva</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    {aiData.tips}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <Bot size={40} className="mx-auto mb-2 opacity-50"/>
                        <p>Gagal memuat data. Coba refresh.</p>
                    </div>
                )}

                {/* Footer Brand */}
                <div className="text-center pt-4 opacity-30">
                    <Bot size={24} className="mx-auto mb-1"/>
                    <p className="text-[10px] font-bold tracking-widest">POWERED BY VITALYST AI</p>
                </div>

            </div>
        </div>
    );
};

export default TaskExplanation;
