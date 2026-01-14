import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/card';
import { ShoppingBag, MapPin, Truck, Plus, Package, X, CheckCircle, Clock } from 'lucide-react';

const ShopView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, setActiveTab }) => {
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    
    // Modal State
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    
    // Transaction State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAddrId, setSelectedAddrId] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);
    const [snapLoaded, setSnapLoaded] = useState(false);

    // --- EFFECT: Load Data & Midtrans ---
    useEffect(() => {
        fetchProducts();
        
        // Load Midtrans Snap Script
        const snapScriptUrl = "https://app.midtrans.com/snap/snap.js"; 
        const clientKey = "Mid-client-dXaTaEerstu_IviP"; // Ganti dengan Client Key Anda jika beda
        
        if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = snapScriptUrl;
            script.setAttribute('data-client-key', clientKey);
            script.onload = () => {
                console.log("Snap Loaded");
                setSnapLoaded(true);
            };
            document.body.appendChild(script);
        } else {
            setSnapLoaded(true);
        }
    }, []);

    // --- API CALLS ---
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/products`);
            setProducts(res.data);
        } catch (e) { console.error("Gagal load produk"); }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/user/orders`, { headers: getAuthHeader() });
            setMyOrders(res.data);
        } catch (e) { console.error("Gagal load order"); }
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() });
            setAddresses(res.data);
        } catch (e) { console.error("Gagal load alamat"); }
    };

    // --- HANDLERS ---
    const openCheckout = (prod) => {
        setSelectedProduct(prod);
        setShippingCost(0);
        setSelectedAddrId(""); // Reset pilihan alamat
        fetchAddresses(); // Load alamat terbaru saat mau checkout
        setShowCheckoutModal(true);
    };

    const handleSelectAddrCheckout = async (addrId) => {
        setSelectedAddrId(addrId);
        const addr = addresses.find(a => a.id === Number(addrId));
        if(addr) {
            try {
                // Hitung Ongkir Real-time
                const res = await axios.post(`${BACKEND_URL}/api/location/rate`, { city_id: addr.city_id }, { headers: getAuthHeader() });
                setShippingCost(res.data.cost);
            } catch (e) {
                alert("Gagal hitung ongkir.");
            }
        }
    };

    const handleProcessPayment = async () => {
        if (!snapLoaded) return alert("Sistem pembayaran belum siap. Tunggu sebentar.");
        if (!selectedAddrId) return alert("Pilih alamat pengiriman.");

        const addr = addresses.find(a => a.id === Number(selectedAddrId));

        try {
            const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
                item_name: selectedProduct.name,
                shipping_cost: shippingCost,
                address_detail: addr, 
                coupon: "", // Bisa dikembangkan nanti
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
        } catch (error) { alert("Gagal memproses transaksi."); }
    };

    const handleCancelOrder = async (orderId) => {
        if(!window.confirm("Batalkan pesanan ini?")) return;
        try {
            await axios.post(`${BACKEND_URL}/api/user/order/cancel/${orderId}`, {}, { headers: getAuthHeader() });
            alert("Pesanan dibatalkan.");
            fetchOrders();
        } catch(e) { alert("Gagal batalkan (Mungkin batas waktu habis)."); }
    };

    // --- UI COMPONENTS ---
    
    // Banner Component
    const ShopBanner = () => (
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
              {/* Tombol ini akan mengarahkan user ke Tab Settings untuk atur alamat */}
              <button onClick={() => setActiveTab('settings')} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}>
                  <MapPin size={18}/> Kelola Alamat
              </button>
              <button onClick={()=>{ fetchOrders(); setShowOrderHistory(true); }} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}>
                  <Truck size={18}/> Status Pesanan
              </button>
          </div>
      </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <h1 className="text-2xl font-bold">Belanja Sehat</h1>
            </div>

            <ShopBanner />

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
                        <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', marginBottom:'1.5rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem', color:'black' }}>Checkout</h3>
                        
                        {/* Info Produk */}
                        <div style={{marginBottom:'1.5rem', background:'#f8fafc', padding:'1rem', borderRadius:'8px', display:'flex', gap:'1rem', alignItems:'center'}}>
                            {selectedProduct.image_url ? <img src={`${BACKEND_URL}${selectedProduct.image_url}`} style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover'}}/> : <Package size={40} color="black"/>}
                            <div>
                                <h4 style={{fontWeight:'bold', color:'black'}}>{selectedProduct.name}</h4>
                                <p style={{color:'#166534', fontWeight:'bold'}}>Rp {selectedProduct.price.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Pilih Alamat */}
                        <div style={{marginBottom:'1.5rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                                <label style={{fontWeight:'bold', fontSize:'0.9rem', color:'black'}}>Alamat Pengiriman</label>
                                {/* Tombol pintas ke Settings jika belum ada alamat */}
                                <button onClick={()=>{ setShowCheckoutModal(false); setActiveTab('settings'); }} style={{fontSize:'0.8rem', color: currentTheme.primary, background:'none', border:'none', cursor:'pointer'}}>+ Kelola Alamat</button>
                            </div>
                            
                            {addresses.length > 0 ? (
                                <select onChange={(e)=>handleSelectAddrCheckout(e.target.value)} style={{width:'100%', padding:'0.8rem', borderRadius:'6px', border:'1px solid #ccc', background:'white', color:'black'}}>
                                     <option value="">-- Pilih Alamat --</option>
                                     {addresses.map(a => <option key={a.id} value={a.id}>{a.label} - {a.city_name}</option>)}
                                </select>
                            ) : (
                                <div style={{padding:'1rem', background:'#fee2e2', borderRadius:'8px', color:'#991b1b', fontSize:'0.9rem'}}>
                                    Belum ada alamat tersimpan. Silakan tambah alamat di menu Pengaturan.
                                </div>
                            )}
                        </div>

                        {/* Rincian Biaya */}
                        <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', marginBottom:'1.5rem', color:'black'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Harga Produk</span><span>Rp {selectedProduct.price.toLocaleString()}</span></div>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem'}}><span>Ongkos Kirim (JNE)</span><span>Rp {shippingCost.toLocaleString()}</span></div>
                            <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.2rem', marginTop:'0.5rem', borderTop:'1px dashed #ccc', paddingTop:'0.5rem'}}><span>Total Bayar</span><span>Rp {(selectedProduct.price + shippingCost).toLocaleString()}</span></div>
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                            <button onClick={()=>setShowCheckoutModal(false)} style={{padding:'0.8rem', border:'1px solid #ccc', background:'white', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', color:'black'}}>Batal</button>
                            <button onClick={handleProcessPayment} disabled={!selectedAddrId} style={{padding:'0.8rem', border:'none', background: selectedAddrId ? '#ee4d2d' : '#cbd5e1', color:'white', borderRadius:'8px', fontWeight:'bold', cursor: selectedAddrId ? 'pointer' : 'not-allowed'}}>Bayar Sekarang</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RIWAYAT PESANAN */}
            {showOrderHistory && (
                <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'500px', maxHeight:'80vh', overflowY:'auto'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                            <h3 style={{ fontSize:'1.4rem', fontWeight:'bold', color:'black' }}>Status Pesanan</h3>
                            <button onClick={()=>setShowOrderHistory(false)} style={{background:'none', border:'none', cursor:'pointer', color:'black'}}><X size={24}/></button>
                        </div>
                        {myOrders.length === 0 ? <p style={{color:'#64748b', textAlign:'center'}}>Belum ada pesanan.</p> : (
                            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                                {myOrders.map((order, idx) => (
                                    <div key={idx} style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1rem', background:'#fff'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                            <div>
                                                <h4 style={{fontWeight:'bold', color:'black'}}>{order.product_name}</h4>
                                                <p style={{fontSize:'0.8rem', color:'#64748b'}}>Resi: {order.resi || '-'}</p>
                                            </div>
                                            <span style={{fontSize:'0.75rem', fontWeight:'bold', padding:'2px 8px', borderRadius:'12px', background: order.status==='paid'?'#dcfce7':'#fffbeb', color: order.status==='paid'?'#166534':'#d97706'}}>
                                                {order.status}
                                            </span>
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
