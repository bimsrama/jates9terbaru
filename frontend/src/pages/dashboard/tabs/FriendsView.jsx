import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../../components/ui/card';
import { User, Medal, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 

const FriendView = ({ BACKEND_URL, getAuthHeader, userOverview, currentTheme, darkMode }) => {
    const [friends, setFriends] = useState([]);
    const [friendCode, setFriendCode] = useState("");
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() })
             .then(res => setFriends(res.data.friends))
             .catch(e => console.error(e));
    }, []);

    const copyReferral = () => { navigator.clipboard.writeText(userOverview?.user?.referral_code || ""); alert("Kode referral disalin!"); };

    const handleAddFriend = async () => {
        if (!friendCode) return alert("Masukkan kode teman!");
        try {
            // Memanggil endpoint baru di main.py
            await axios.post(`${BACKEND_URL}/api/friends/add`, { referral_code: friendCode }, { headers: getAuthHeader() });
            alert("Teman berhasil ditambahkan!");
            setFriendCode("");
            // Refresh list
            const res = await axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() });
            setFriends(res.data.friends);
        } catch (e) {
            alert(e.response?.data?.message || "Gagal menambahkan teman.");
        }
    };

    return (
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
            <h1 className="text-2xl font-bold mb-4">Teman Sehat</h1>
            
            <Card style={{marginBottom: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'white', border:'none'}}>
                <CardContent style={{padding:'2rem', textAlign:'center'}}>
                    <p style={{opacity:0.9, marginBottom:'0.5rem'}}>Kode Referral Saya</p>
                    <h1 style={{fontSize:'2.5rem', fontWeight:'bold', letterSpacing:'2px', marginBottom:'1.5rem'}}>{userOverview?.user?.referral_code || "..."}</h1>
                    <div style={{display:'flex', justifyContent:'center', gap:'1rem'}}>
                        <button onClick={copyReferral} style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}><Copy size={16}/> Salin</button>
                        <button onClick={()=>setShowQR(true)} style={{background:'white', color:'#4f46e5', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}><QrCode size={16}/> QR Code</button>
                    </div>
                </CardContent>
            </Card>

            <Card style={{marginBottom:'1.5rem', background: darkMode?'#1e293b':'white'}}>
                <CardContent style={{padding:'1.5rem'}}>
                    <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Teman</h3>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                        <input value={friendCode} onChange={e=>setFriendCode(e.target.value)} placeholder="Masukkan Kode Referral Teman" style={{flex:1, padding:'0.8rem', borderRadius:'8px', border:'1px solid #ccc', color:'black'}}/>
                        <button onClick={handleAddFriend} style={{background: currentTheme.primary, border:'none', padding:'0 1.5rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Add</button>
                    </div>
                </CardContent>
            </Card>

            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                {friends.length === 0 && <p style={{textAlign:'center', color:'#888'}}>Belum ada teman.</p>}
                {friends.map((f, idx) => (
                    <div key={idx} style={{padding:'1rem', background: darkMode?'#1e293b':'white', borderRadius:'12px', display:'flex', alignItems:'center', gap:'1rem', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                        <div style={{width:'40px', height:'40px', background:'#f1f5f9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={20} color="gray"/></div>
                        <div><div style={{fontWeight:'bold'}}>{f.name}</div><div style={{fontSize:'0.8rem', color:'gray'}}>{f.relation} • {f.badge}</div></div>
                    </div>
                ))}
            </div>

            {showQR && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={()=>setShowQR(false)}>
                    <div style={{background:'white', padding:'2rem', borderRadius:'16px', textAlign:'center'}} onClick={e=>e.stopPropagation()}>
                        <h3 style={{fontWeight:'bold', marginBottom:'1rem', color:'black'}}>Kode Pertemanan</h3>
                        <div style={{padding:'1rem', border:'1px solid #eee', borderRadius:'12px', display:'inline-block'}}>
                            <QRCodeSVG value={`https://jagatetapsehat.com/add/${userOverview?.user?.referral_code}`} size={180} />
                        </div>
                        <button onClick={()=>setShowQR(false)} style={{display:'block', width:'100%', marginTop:'1rem', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer'}}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FriendView;
