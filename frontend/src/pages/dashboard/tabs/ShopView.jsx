import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/card';
import { ShoppingBag, MapPin, Truck, Plus, Package, X, ShoppingCart } from 'lucide-react';

const ShopView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, setActiveTab }) => {
    const [products, setProducts] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    
    // Modal & Transaction State
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false); 
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAddrId, setSelectedAddrId] = useState("");
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingMethod, setShippingMethod] = useState("jne");
    const [snapLoaded, setSnapLoaded] = useState(false);

    // Form Alamat Baru
    const [newAddr, setNewAddr] = useState({ label:'Rumah', name:'', phone:'', prov_id:'', prov_name:'', city_id:'', city_name:'', dis_id:'', dis_name:'', subdis_id:'', subdis_name:'', address:'', zip:'' });

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/products`).then(res => setProducts(res.data));
        axios.get(`${BACKEND_URL}/api/location/provinces`).then(res => setProvinces(res.data));
        
        const snapScriptUrl = "https://app.midtrans.com/snap/snap.js"; 
        const clientKey = "Mid-client-dXaTaEerstu_IviP"; // Pastikan Client Key benar
        if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
            const script = document.createElement('script'); script.src = snapScriptUrl; script.setAttribute('data-client-key', clientKey);
            script.onload = () => setSnapLoaded(true); document.body.appendChild(script);
        } else { setSnapLoaded(true); }
    }, []);

    const fetchAddresses = async () => { try{const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); setAddresses(res.data);}catch(e){} };
    const fetchOrders = async () => { try{const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() }); setMyOrders(res.data);}catch(e){} };

    const openCheckout = (prod) => {
        setSelectedProduct(prod);
        setShippingCost(0);
        setSelectedAddrId("");
        setShippingMethod("jne");
        fetchAddresses();
        setShowCheckoutModal(true);
    };

    const handleMethodChange = (method) => {
        setShippingMethod(method);
        if (method === 'pickup') setShippingCost(0);
        else if (selectedAddrId) handleSelectAddr(selectedAddrId);
    };

    const handleSelectAddr = async (addrId) => {
        setSelectedAddrId(addrId);
        if (shippingMethod === 'pickup') return;
        const addr = addresses.find(a => a.id === Number(addrId));
        if(addr) {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/location/rate`, { city_id: addr.city_id }, { headers: getAuthHeader() });
                setShippingCost(res.data.cost);
            } catch (e) { alert("Gagal hitung ongkir"); }
        }
    };

    const handlePayment = async () => {
        if (!snapLoaded) return alert("Sistem pembayaran belum siap.");
        if (shippingMethod === 'jne' && !selectedAddrId) return alert("Pilih alamat pengiriman!");
        
        // Cari objek alamat lengkap jika JNE, atau kosong jika Pickup
        const addr = addresses.find(a => a.id === Number(selectedAddrId)) || {};
        
        try {
            const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
                item_name: selectedProduct.name,
                shipping_cost: shippingMethod === 'pickup' ? 0 : shippingCost, // Pastikan 0 kalau pickup
                address_detail: addr, 
                shipping_method: shippingMethod === 'pickup' ? 'Ambil di Toko' : 'JNE Regular',
                discount: 0
            }, { headers: getAuthHeader() });
 
            if (response.data.success) {
                setShowCheckoutModal(false);
                window.snap.pay(response.data.token, {
                    onSuccess: function(result) { alert("Pembayaran Berhasil!"); fetchOrders(); },
                    onPending: function(result) { alert("Menunggu pembayaran!"); fetchOrders(); },
                    onError: function(result) { alert("Pembayaran gagal!"); }
                });
            }
        } catch (error) { 
            console.error(error);
            alert("Gagal proses: " + (error.response?.data?.message || "Server Error")); 
        }
    };

    // LOGIKA FORM ALAMAT
    const handleProvChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        setNewAddr({...newAddr, prov_id: id, prov_name: name});
        axios.get(`${BACKEND_URL}/api/location/cities?prov_id=${id}`).then(res => setCities(res.data));
    };
    const handleCityChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        setNewAddr({...newAddr, city_id: id, city_name: name});
        axios.get(`${BACKEND_URL}/api/location/districts?city_id=${id}`).then(res => setDistricts(res.data));
    };
    const handleDistrictChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        setNewAddr({...newAddr, dis_id: id, dis_name: name});
        axios.get(`${BACKEND_URL}/api/location/subdistricts?dis_id=${id}`).then(res => setSubdistricts(res.data));
    };
    const handleSubDistrictChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        const zip = subdistricts.find(s => s.id == id)?.zip || '';
        setNewAddr({...newAddr, subdis_id: id, subdis_name: name, zip: zip});
    };
    const handleSaveAddress = async () => {
        try { 
            await axios.post(`${BACKEND_URL}/api/user/address`, newAddr, { headers: getAuthHeader() }); 
            fetchAddresses(); setShowAddressModal(false); alert("Alamat tersimpan!"); 
        } catch(e){ alert("Gagal simpan alamat"); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Belanja Sehat</h1>
            
            {/* Banner */}
            <div style={{ marginBottom: '2rem', position:'relative', borderRadius: '16px', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding: '2.5rem 2rem', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div><h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Belanja Sehat 🌿</h2><p style={{ opacity: 0.9 }}>Suplemen terbaik untuk kesehatan Anda.</p></div>
                    <div style={{ background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'50%' }}><ShoppingBag size={48} color="white"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'white', borderTop:'1px solid #eee' }}>
                    <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}><MapPin size={18}/> Kelola Alamat</button>
                    <button onClick={()=>{ fetchOrders(); setShowOrderHistory(true); }} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}><Truck size={18}/> Status Pesanan</button>
                </div>
            </div>

            {/* List Produk */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {products.map(prod => (
                    <Card key={prod.id} style={{cursor:'pointer', overflow:'hidden', background: darkMode?'#1e293b':'white', display:'flex', flexDirection:'column', height:'100%'}}>
                        <div onClick={()=>openCheckout(prod)} style={{height:'140px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={40} color="#ccc"/>}
                        </div>
                        <div style={{padding:'1rem', flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                            <div>
                                <h4 style={{fontWeight:'bold', fontSize:'0.9rem', marginBottom:'0.5rem'}}>{prod.name}</h4>
                                <div style={{color:'#166534', fontWeight:'bold', fontSize:'1rem'}}>Rp {prod.price.toLocaleString()}</div>
                            </div>
                            
                            {/* TOMBOL BELI SEKARANG (DITAMBAHKAN AGAR JELAS) */}
                            <button onClick={()=>openCheckout(prod)} style={{marginTop:'1rem', width:'100%', background: currentTheme.primary, border:'none', padding:'0.6rem', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
                                <ShoppingCart size={16}/> Beli Sekarang
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* MODAL CHECKOUT */}
            {showCheckoutModal && selectedProduct && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'400px', maxHeight:'90vh', overflowY:'auto', color:'black'}}>
                        <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Checkout</h3>
                        
                        <div style={{marginBottom:'1rem', display:'flex', gap:'0.5rem'}}>
                            <button onClick={()=>handleMethodChange('jne')} style={{flex:1, padding:'0.6rem', border: shippingMethod==='jne' ? `2px solid ${currentTheme.primary}` : '1px solid #ccc', borderRadius:'8px', background: shippingMethod==='jne' ? '#f0fdf4' : 'white', fontWeight:'bold'}}>JNE (Kirim)</button>
                            <button onClick={()=>handleMethodChange('pickup')} style={{flex:1, padding:'0.6rem', border: shippingMethod==='pickup' ? `2px solid ${currentTheme.primary}` : '1px solid #ccc', borderRadius:'8px', background: shippingMethod==='pickup' ? '#f0fdf4' : 'white', fontWeight:'bold'}}>Ambil di Toko</button>
                        </div>

                        {shippingMethod === 'jne' && (
                            <div style={{marginBottom:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'0.5rem'}}><span>Kirim ke:</span><button onClick={()=>{setShowAddressModal(true)}} style={{color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}>+ Alamat Baru</button></div>
                                <select onChange={e=>handleSelectAddr(e.target.value)} style={{width:'100%', padding:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}>
                                    <option value="">Pilih Alamat...</option>
                                    {addresses.map(a=><option key={a.id} value={a.id}>{a.label} - {a.address}</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem', color:'black'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Harga</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Ongkir</span><span>Rp {shippingCost.toLocaleString()}</span></div>
                            <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.2rem', marginTop:'0.5rem'}}><span>Total</span><span>Rp {(selectedProduct.price + shippingCost).toLocaleString()}</span></div>
                        </div>
                        
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                            <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', color:'black'}}>Batal</button>
                            <button onClick={handlePayment} style={{padding:'0.8rem', border:'none', background: (shippingMethod==='jne' && !selectedAddrId) ? '#ccc' : currentTheme.primary, color:'white', borderRadius:'8px', fontWeight:'bold', cursor: 'pointer'}}>Bayar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* MODAL ALAMAT & HISTORY SAMA SEPERTI SEBELUMNYA */}
            {/* (Sertakan kembali kode Modal Alamat & History agar tidak hilang saat copy-paste) */}
            {showAddressModal && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'400px', maxHeight:'90vh', overflowY:'auto', color:'black'}}>
                        <h3 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Alamat</h3>
                        <input placeholder="Label (Rumah/Kantor)" onChange={e=>setNewAddr({...newAddr, label:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
                            <input placeholder="Penerima" onChange={e=>setNewAddr({...newAddr, name:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                            <input placeholder="No HP" onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                        </div>
                        <select onChange={handleProvChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Provinsi</option>{provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                        {newAddr.prov_id && <select onChange={handleCityChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Kota</option>{cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>}
                        {newAddr.city_id && <select onChange={handleDistrictChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Kecamatan</option>{districts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>}
                        {newAddr.dis_id && <select onChange={handleSubDistrictChange} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option>Pilih Kelurahan</option>{subdistricts.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}
                        <textarea placeholder="Alamat Lengkap" onChange={e=>setNewAddr({...newAddr, address:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}></textarea>
                        <input placeholder="Kode Pos" onChange={e=>setNewAddr({...newAddr, zip:e.target.value})} style={{width:'100%', padding:'0.6rem', marginBottom:'1rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                        <button onClick={handleSaveAddress} style={{width:'100%', padding:'0.8rem', background:currentTheme.primary, border:'none', borderRadius:'8px', fontWeight:'bold'}}>Simpan</button>
                        <button onClick={()=>setShowAddressModal(false)} style={{width:'100%', padding:'0.8rem', background:'transparent', border:'none', marginTop:'0.5rem'}}>Batal</button>
                    </div>
                </div>
            )}

            {showOrderHistory && (
                <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'500px', maxHeight:'80vh', overflowY:'auto', color:'black'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                            <h3 style={{ fontSize:'1.4rem', fontWeight:'bold' }}>Status Pesanan</h3>
                            <button onClick={()=>setShowOrderHistory(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                        </div>
                        {myOrders.length === 0 ? <p style={{color:'#64748b', textAlign:'center'}}>Belum ada pesanan.</p> : (
                            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                                {myOrders.map((order, idx) => (
                                    <div key={idx} style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1rem', background:'#fff'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                            <div><h4 style={{fontWeight:'bold', color:'black'}}>{order.product_name}</h4><p style={{fontSize:'0.8rem', color:'#64748b'}}>Resi: {order.resi || '-'}</p></div>
                                            <span style={{fontSize:'0.75rem', fontWeight:'bold', padding:'2px 8px', borderRadius:'12px', background: order.status==='paid'?'#dcfce7':'#fffbeb', color: order.status==='paid'?'#166534':'#d97706'}}>{order.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default ShopView;
