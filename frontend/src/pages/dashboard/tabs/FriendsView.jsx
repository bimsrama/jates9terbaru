import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Copy, QrCode, Users, Medal, ChevronRight, X, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Pastikan install: npm install qrcode.react
import axios from 'axios';

const FriendView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, userOverview }) => {
  const [myFriends, setMyFriends] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [friendCode, setFriendCode] = useState("");

  useEffect(() => {
      axios.get(`${BACKEND_URL}/api/friends/list`, { headers: getAuthHeader() })
           .then(res => setMyFriends(res.data.friends))
           .catch(e => console.log(e));
  }, []);

  const copyReferral = () => {
      navigator.clipboard.writeText(userOverview?.user?.referral_code || "");
      alert("Kode referral disalin!");
  };

  return (
    <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <h1 className="text-2xl font-bold mb-6">Teman Sehat</h1>

        {/* 1. KARTU REFERRAL (Yang Anda cari) */}
        <Card style={{marginBottom: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'white', border:'none'}}>
            <CardContent style={{padding:'2rem', textAlign:'center'}}>
                <p style={{opacity:0.9, marginBottom:'0.5rem'}}>Kode Referral Saya</p>
                <h1 style={{fontSize:'2.5rem', fontWeight:'bold', letterSpacing:'2px', marginBottom:'1.5rem'}}>{userOverview?.user?.referral_code || "LOADING"}</h1>
                
                <div style={{display:'flex', justifyContent:'center', gap:'1rem'}}>
                    <button onClick={copyReferral} style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}>
                        <Copy size={16}/> Salin
                    </button>
                    <button onClick={()=>setShowQRModal(true)} style={{background:'white', color:'#4f46e5', border:'none', padding:'0.6rem 1.2rem', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold'}}>
                        <QrCode size={16}/> QR Code
                    </button>
                </div>
            </CardContent>
        </Card>

        {/* 2. INPUT TAMBAH TEMAN */}
        <Card style={{marginBottom:'2rem', background: darkMode?'#1e293b':'white'}}>
            <CardContent style={{padding:'1.5rem'}}>
                <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Teman</h3>
                <div style={{display:'flex', gap:'0.5rem'}}>
                    <input placeholder="Masukkan Kode Teman" value={friendCode} onChange={e=>setFriendCode(e.target.value)} style={{flex:1, padding:'0.8rem', borderRadius:'8px', border:'1px solid #ccc', color:'black'}} />
                    <button style={{background: currentTheme.primary, border:'none', padding:'0 1.5rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Add</button>
                </div>
            </CardContent>
        </Card>

        {/* 3. LIST TEMAN */}
        <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Daftar Teman</h3>
        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            {myFriends.map((f, i) => (
                <div key={i} style={{padding:'1rem', background: darkMode?'#1e293b':'white', borderRadius:'12px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'1rem'}}>
                    <div style={{width:'40px', height:'40px', background:'#f1f5f9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={20} color="gray"/></div>
                    <div>
                        <div style={{fontWeight:'bold'}}>{f.name}</div>
                        <div style={{fontSize:'0.8rem', color:'gray', display:'flex', alignItems:'center', gap:'4px'}}><Medal size={12}/> {f.badge}</div>
                    </div>
                </div>
            ))}
        </div>

        {/* 4. MODAL QR CODE */}
        {showQRModal && (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={()=>setShowQRModal(false)}>
                <div style={{background:'white', padding:'2rem', borderRadius:'16px', textAlign:'center'}} onClick={e=>e.stopPropagation()}>
                    <h3 style={{fontWeight:'bold', marginBottom:'1rem', color:'black'}}>Kode Pertemanan</h3>
                    <div style={{padding:'1rem', border:'1px solid #eee', borderRadius:'12px', display:'inline-block'}}>
                        <QRCodeSVG value={`https://jagatetapsehat.com/add/${userOverview?.user?.referral_code}`} size={180} />
                    </div>
                    <button onClick={()=>setShowQRModal(false)} style={{display:'block', width:'100%', marginTop:'1rem', padding:'0.8rem', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer'}}>Tutup</button>
                </div>
            </div>
        )}
    </div>
  );
};
export default FriendView;
