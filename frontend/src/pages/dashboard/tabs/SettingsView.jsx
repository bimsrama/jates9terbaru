import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Moon, Sun, Camera, Check, RefreshCw } from 'lucide-react';
import axios from 'axios';

const SettingsView = ({ BACKEND_URL, getAuthHeader, darkMode, toggleDarkMode, currentTheme, changeThemeColor, themeColor, THEMES, userOverview, fetchUserOverview }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleProfileUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      try {
          await axios.post(`${BACKEND_URL}/api/user/upload-profile-picture`, formData, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }});
          fetchUserOverview(); // Refresh global user data
          alert("Foto berhasil diupdate!");
      } catch(e) { alert("Gagal upload foto."); }
      finally { setUploading(false); }
  };

  return (
    <div style={{maxWidth:'600px'}}>
        <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

        {/* 1. GANTI FOTO PROFIL */}
        <Card style={{marginBottom:'1.5rem', background: darkMode?'#1e293b':'white'}}>
            <CardHeader><CardTitle>Foto Profil</CardTitle></CardHeader>
            <CardContent style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
                <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#f1f5f9', overflow:'hidden', border:'2px solid #e2e8f0'}}>
                    {userOverview?.user?.profile_picture && <img src={`${BACKEND_URL}${userOverview.user.profile_picture}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
                </div>
                <div>
                    <button onClick={()=>fileInputRef.current.click()} disabled={uploading} style={{background: currentTheme.primary, padding:'0.6rem 1rem', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                        {uploading ? <RefreshCw className="animate-spin" size={16}/> : <Camera size={16}/>}
                        {uploading ? "Mengupload..." : "Ganti Foto"}
                    </button>
                    <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleProfileUpload}/>
                </div>
            </CardContent>
        </Card>

        {/* 2. GANTI TEMA (LINGKARAN WARNA) */}
        <Card style={{marginBottom:'1.5rem', background: darkMode?'#1e293b':'white'}}>
            <CardHeader><CardTitle>Tema Aplikasi</CardTitle></CardHeader>
            <CardContent>
                <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                    {Object.values(THEMES).map(t => (
                        <div key={t.id} onClick={()=>changeThemeColor(t.id)} style={{cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem'}}>
                            <div style={{width:'40px', height:'40px', borderRadius:'50%', background: t.gradient, border: themeColor===t.id ? `3px solid ${darkMode?'white':'#333'}` : '1px solid #ccc', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                {themeColor===t.id && <Check size={20} color="white" style={{dropShadow:'0 1px 2px rgba(0,0,0,0.5)'}}/>}
                            </div>
                            <span style={{fontSize:'0.75rem', fontWeight: themeColor===t.id?'bold':'normal'}}>{t.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* 3. DARK MODE */}
        <Card style={{background: darkMode?'#1e293b':'white'}}>
            <CardContent style={{paddingTop:'1.5rem'}}>
                <button onClick={toggleDarkMode} style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', background:'transparent', border:'none', cursor:'pointer', color: darkMode?'white':'black'}}>
                    <div style={{display:'flex', gap:'0.8rem', alignItems:'center'}}>
                        {darkMode ? <Moon size={20} color="#fbbf24"/> : <Sun size={20} color="#f59e0b"/>}
                        <span style={{fontWeight:'bold', fontSize:'1rem'}}>Mode Gelap</span>
                    </div>
                    <div style={{width:'40px', height:'20px', background: darkMode ? currentTheme.primary : '#cbd5e1', borderRadius:'20px', position:'relative'}}>
                        <div style={{width:'16px', height:'16px', background:'white', borderRadius:'50%', position:'absolute', top:'2px', left: darkMode ? '22px' : '2px', transition:'all 0.3s'}}></div>
                    </div>
                </button>
            </CardContent>
        </Card>
    </div>
  );
};
export default SettingsView;
