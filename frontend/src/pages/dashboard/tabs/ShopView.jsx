import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/card';
import { ShoppingBag, MapPin, Truck, Plus, Package, X } from 'lucide-react';

const ShopView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme }) => {
    // --- STATE UTAMA ---
    const [products, setProducts] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    
    // State Modal
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false); // Modal Alamat di sini

    // State Transaksi
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAddrId, setSelectedAddrId] = useState("");
    const [shippingCost, setShippingCost] = useState(0);
    const [snapLoaded, setSnapLoaded] = useState(false);

    // State Form Alamat Baru
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [newAddr, setNewAddr] = useState({ 
        label:'Rumah', name:'', phone:'', prov_id:'', prov_name:'', city_id:'', city_name:'', dis_id:'', dis_name:'', subdis_id:'', subdis_name:'', address:'', zip:'' 
    });

    // --- EFFECT ---
    useEffect(() => {
        fetchProducts();
        
        // Load Midtrans
        const snapScriptUrl = "https://app.midtrans.com/snap/snap.js"; 
        const clientKey = "Mid-client-dXaTaEerstu_IviP";
        if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = snapScriptUrl;
            script.setAttribute('data-client-key', clientKey);
            script.onload = () => setSnapLoaded(true);
            document.body.appendChild(script);
        } else {
            setSnapLoaded(true);
        }

        // Load Provinsi untuk Form Alamat
        axios.get(`${BACKEND_URL}/api/location/provinces`).then(res => setProvinces(res.data));
    }, []);

    // --- API CALLS ---
    const fetchProducts = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/products`); setProducts(res.data); } catch (e) {} };
    const fetchOrders = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() }); setMyOrders(res.data); } catch (e) {} };
    const fetchAddresses = async () => { try { const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() }); setAddresses(res.data); } catch (e) {} };

    // --- HANDLERS TRANSAKSI ---
    const openCheckout = (prod) => {
        setSelectedProduct(prod);
        setShippingCost(0);
        setSelectedAddrId("");
        fetchAddresses();
        setShowCheckoutModal(true);
    };

    const handleSelectAddrCheckout = async (addrId) => {
        setSelectedAddrId(addrId);
        const addr = addresses.find(a => a.id === Number(addrId));
        if(addr) {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/location/rate`, { city_id: addr.city_id }, { headers: getAuthHeader() });
                setShippingCost(res.data.cost);
            } catch (e) { alert("Gagal hitung ongkir."); }
        }
    };

    const handleProcessPayment = async () => {
        if (!snapLoaded) return alert("Sistem pembayaran belum siap.");
        if (!selectedAddrId) return alert("Pilih alamat pengiriman.");
        const addr = addresses.find(a => a.id === Number(selectedAddrId));

        try {
            const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
                item_name: selectedProduct.name, shipping_cost: shippingCost, address_detail: addr, coupon: "", discount: 0
            }, { headers: getAuthHeader() });
 
            if (response.data.success) {
                setShowCheckoutModal(false);
                window.snap.pay(response.data.token, {
                    onSuccess: function(result) { alert("Pembayaran Berhasil!"); fetchOrders(); },
                    onPending: function(result) { alert("Menunggu pembayaran!"); fetchOrders(); },
                    onError: function(result) { alert("Pembayaran gagal!"); }
                });
            }
        } catch (error) { alert("Gagal memproses transaksi."); }
    };

    const handleCancelOrder = async (orderId) => {
        if(!window.confirm("Batalkan pesanan ini?")) return;
        try {
            await axios.post(`${BACKEND_URL}/api/user/order/cancel/${orderId}`, {}, { headers: getAuthHeader() });
            alert("Pesanan dibatalkan."); fetchOrders();
        } catch(e) { alert("Gagal batalkan (Waktu habis)."); }
    };

    // --- HANDLERS ALAMAT (Sama seperti kodingan lama) ---
    const handleProvChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        setNewAddr({...newAddr, prov_id: id, prov_name: name, city_id:'', dis_id:'', subdis_id:''});
        axios.get(`${BACKEND_URL}/api/location/cities?prov_id=${id}`).then(res => setCities(res.data));
    };
    const handleCityChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        setNewAddr({...newAddr, city_id: id, city_name: name, dis_id:'', subdis_id:''});
        axios.get(`${BACKEND_URL}/api/location/districts?city_id=${id}`).then(res => setDistricts(res.data));
    };
    const handleDistrictChange = (e) => {
        const id = e.target.value; const name = e.target.options[e.target.selectedIndex].text;
        setNewAddr({...newAddr, dis_id: id, dis_name: name, subdis_id:''});
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
            fetchAddresses(); 
            setShowAddressModal(false); 
            alert("Alamat tersimpan!"); 
        } catch(e){ alert("Gagal simpan alamat"); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Belanja Sehat</h1>

            {/* BANNER */}
            <div style={{ marginBottom: '2rem', position:'relative', borderRadius: '16px', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding: '2.5rem 2rem', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Belanja Sehat 🌿</h2>
                        <p style={{ opacity: 0.9 }}>Suplemen terbaik untuk kesehatan Anda.</p>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'50%' }}>
                        <ShoppingBag size={48} color="white"/>
                    </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'white', borderTop:'1px solid #eee' }}>
                    <button onClick={()=>{fetchAddresses(); setShowAddressModal(true)}} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}>
                        <MapPin size={18}/> Alamat Saya
                    </button>
                    <button onClick={()=>{ fetchOrders(); setShowOrderHistory(true); }} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}>
                        <Truck size={18}/> Status Pesanan
                    </button>
                </div>
            </div>

            <h3 style={{marginTop:'2rem', marginBottom:'1rem', fontWeight:'bold', fontSize:'1.2rem'}}>Katalog Produk</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {products.map((prod) => (
                  <Card key={prod.id} style={{ background: darkMode ? '#1e293b' : 'white', border: '1px solid #e2e8f0', overflow:'hidden', cursor:'pointer', transition:'transform 0.2s' }} onClick={() => openCheckout(prod)}>
                      <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={48} color="#cbd5e1"/>}
                      </div>
                      <div style={{ padding: '1rem' }}>
                         <h4 style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: darkMode?'white':'#0f172a' }}>{prod.name}</h4>
                         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.5rem'}}>
                             <span style={{ fontWeight: 'bold', color: '#166534' }}>Rp {prod.price.toLocaleString()}</span>
                             <div style={{background: currentTheme.primary, padding:'4px', borderRadius:'6px'}}><Plus size={16} color="white"/></div>
                         </div>
                      </div>
                  </Card>
                ))}
            </div>

            {/* MODAL CHECKOUT */}
            {showCheckoutModal && selectedProduct && (
                <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'450px', maxHeight:'90vh', overflowY:'auto'}}>
                        <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1.5rem', color:'black' }}>Checkout</h3>
                        <div style={{marginBottom:'1.5rem', background:'#f8fafc', padding:'1rem', borderRadius:'8px', display:'flex', gap:'1rem', alignItems:'center'}}>
                            {selectedProduct.image_url ? <img src={`${BACKEND_URL}${selectedProduct.image_url}`} style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover'}}/> : <Package size={40} color="black"/>}
                            <div><h4 style={{fontWeight:'bold', color:'black'}}>{selectedProduct.name}</h4><p style={{color:'#166534', fontWeight:'bold'}}>Rp {selectedProduct.price.toLocaleString()}</p></div>
                        </div>
                        <div style={{marginBottom:'1.5rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                                <label style={{fontWeight:'bold', fontSize:'0.9rem', color:'black'}}>Alamat Pengiriman</label>
                                <button onClick={()=>{ setShowCheckoutModal(false); setShowAddressModal(true); }} style={{fontSize:'0.8rem', color: currentTheme.primary, background:'none', border:'none', cursor:'pointer'}}>+ Tambah Alamat</button>
                            </div>
                            <select onChange={(e)=>handleSelectAddrCheckout(e.target.value)} style={{width:'100%', padding:'0.8rem', borderRadius:'6px', border:'1px solid #ccc', background:'white', color:'black'}}>
                                 <option value="">-- Pilih Alamat --</option>
                                 {addresses.map(a => <option key={a.id} value={a.id}>{a.label} - {a.city_name}</option>)}
                            </select>
                        </div>
                        <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem', color:'black'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Harga</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Ongkir (JNE)</span><span>Rp {shippingCost.toLocaleString()}</span></div>
                            <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.2rem', marginTop:'0.5rem'}}><span>Total</span><span>Rp {(selectedProduct.price + shippingCost).toLocaleString()}</span></div>
                        </div>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                            <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', color:'black'}}>Batal</button>
                            <button onClick={handleProcessPayment} disabled={!selectedAddrId} style={{padding:'0.8rem', border:'none', background: selectedAddrId ? '#ee4d2d' : '#cbd5e1', color:'white', borderRadius:'8px', fontWeight:'bold', cursor: selectedAddrId ? 'pointer' : 'not-allowed'}}>Bayar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ALAMAT SAYA (DIPINDAHKAN KE SINI) */}
            {showAddressModal && (
                <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto', color:'black'}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
                            <h3 style={{fontWeight:'bold', fontSize:'1.2rem'}}>Alamat Saya</h3>
                            <button onClick={()=>setShowAddressModal(false)} style={{background:'none', border:'none'}}><X size={24}/></button>
                        </div>
                        {/* List Alamat */}
                        <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2rem'}}>
                            {addresses.length === 0 && <p style={{color:'#64748b'}}>Belum ada alamat tersimpan.</p>}
                            {addresses.map(addr => (
                                <div key={addr.id} style={{border:'1px solid #e2e8f0', padding:'1rem', borderRadius:'8px'}}>
                                    <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{addr.label} | {addr.name}</div>
                                    <p style={{fontSize:'0.85rem', color:'#334155'}}>{addr.address}, {addr.city_name}</p>
                                </div>
                            ))}
                        </div>
                        {/* Form Tambah */}
                        <div style={{borderTop:'1px solid #e2e8f0', paddingTop:'1.5rem'}}>
                            <h4 style={{fontWeight:'bold', marginBottom:'1rem'}}>Tambah Alamat Baru</h4>
                            <input placeholder="Label (Rumah/Kantor)" value={newAddr.label} onChange={e=>setNewAddr({...newAddr, label:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
                                <input placeholder="Penerima" value={newAddr.name} onChange={e=>setNewAddr({...newAddr, name:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                                <input placeholder="No HP" value={newAddr.phone} onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                            </div>
                            <select value={newAddr.prov_id} onChange={handleProvChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option value="">Pilih Provinsi</option>{provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                            {newAddr.prov_id && <select value={newAddr.city_id} onChange={handleCityChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option value="">Pilih Kota</option>{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
                            {newAddr.city_id && <select value={newAddr.dis_id} onChange={handleDistrictChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option value="">Pilih Kecamatan</option>{districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>}
                            {newAddr.dis_id && <select value={newAddr.subdis_id} onChange={handleSubDistrictChange} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}><option value="">Pilih Kelurahan</option>{subdistricts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}
                            <textarea placeholder="Alamat Lengkap" value={newAddr.address} onChange={e=>setNewAddr({...newAddr, address:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}></textarea>
                            <input placeholder="Kode Pos" value={newAddr.zip} onChange={e=>setNewAddr({...newAddr, zip:e.target.value})} style={{width:'100%', padding:'0.7rem', marginBottom:'1rem', border:'1px solid #ccc', borderRadius:'6px'}}/>
                            <button onClick={handleSaveAddress} style={{width:'100%', background: currentTheme.primary, padding:'0.8rem', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Simpan Alamat</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RIWAYAT PESANAN */}
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
                                        <div style={{marginTop:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div style={{fontSize:'0.8rem', color:'#64748b'}}>{order.date}</div>
                                            {(order.status === 'pending' || order.status === 'paid') && (
                                                <button onClick={()=>handleCancelOrder(order.order_id)} style={{background:'#fee2e2', color:'#991b1b', border:'none', padding:'0.4rem 0.8rem', borderRadius:'6px', fontSize:'0.8rem', cursor:'pointer'}}>Batalkan</button>
                                            )}
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
