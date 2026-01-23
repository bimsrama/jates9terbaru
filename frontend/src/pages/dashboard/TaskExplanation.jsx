import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Bot, ChevronLeft, Loader2, Sparkles, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Jika ingin format text rapi (opsional, bisa pakai text biasa)

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
                { tasks, challenge_title: challengeTitle },
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
        <div className="min-h-screen bg-slate-50 p-4 pb-20 flex flex-col items-center">
             {/* Header */}
             <div className="w-full max-w-lg mb-4 flex items-center gap-2">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 bg-white rounded-full shadow-sm border border-gray-200"
                >
                    <ChevronLeft size={24} className="text-slate-700" />
                </button>
                <h2 className="text-xl font-bold text-slate-800">Penjelasan Misi</h2>
            </div>

            <Card className="w-full max-w-lg bg-white border-none shadow-lg rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <Bot size={32} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold mb-1">Analisa Dr. Alva</h1>
                    <p className="text-blue-100 text-sm">{challengeTitle} - Hari {day}</p>
                </div>

                <CardContent className="p-6">
                    {loading ? (
                        <div className="text-center py-10">
                            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                            <p className="text-slate-500 animate-pulse">Sedang menganalisa manfaat kesehatanmu...</p>
                        </div>
                    ) : (
                        <div className="prose prose-slate max-w-none">
                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-start">
                                <Sparkles className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-1">Tugas Hari Ini:</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-700 m-0">
                                        {tasks.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {/* Gunakan ReactMarkdown jika install librarynya, atau div biasa */}
                                {explanation}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TaskExplanation;
