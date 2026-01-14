import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CheckinView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme }) => {
    const [checkinHistory, setCheckinHistory] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/user/checkin-history`, { headers: getAuthHeader() })
             .then(res => setCheckinHistory(res.data));
    }, []);

    const changeMonth = (offset) => {
        const newDate = new Date(calendarDate.setMonth(calendarDate.getMonth() + offset));
        setCalendarDate(new Date(newDate));
    };

    const renderCalendar = () => {
        // ... (Copy logika renderCalendar dari kode lama) ...
        // Gunakan variable checkinHistory dan calendarDate
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDay === 0 ? 6 : firstDay - 1; 
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} style={{ height: '40px' }}></div>);
        for (let d = 1; d <= daysInMonth; d++) {
             const currentDateStr = new Date(year, month, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); 
             const log = checkinHistory.find(h => h.date === currentDateStr);
             let bg = darkMode ? '#334155' : '#f1f5f9';
             if(log?.status === 'completed') bg = '#dcfce7';
             days.push(<div key={d} style={{height:'40px', width:'40px', background:bg, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>{d}</div>);
        }
        return days;
    };

    return (
        <div>
            <h1 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem'}}>Riwayat Check-in</h1>
            <div style={{background: darkMode ? '#1e293b' : 'white', padding:'1.5rem', borderRadius:'16px', maxWidth:'500px', margin:'0 auto', border: '1px solid #e2e8f0'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
                    <button onClick={()=>changeMonth(-1)}><ChevronLeft/></button>
                    <h3>{calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={()=>changeMonth(1)}><ChevronRight/></button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'0.5rem', textAlign:'center'}}>
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
};

export default CheckinView;
