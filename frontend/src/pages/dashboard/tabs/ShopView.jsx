import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/card';
import { ShoppingBag, MapPin, Truck, Plus, Package, X } from 'lucide-react';

const ShopView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme, setActiveTab }) => {
    const [products, setProducts] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAddrId, setSelectedAddrId] = useState("");
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingMethod, setShippingMethod] = useState("jne"); // 'jne' or 'pickup'
    const [snapLoaded, setSnapLoaded] = useState(false);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/products`).then(res => setProducts(res.data));
        const snapScriptUrl = "https://app.midtrans.com/snap/snap.js"; 
        const clientKey = "Mid-client-dXaTaEerstu_IviP";
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
        else if (selectedAddrId) handleSelectAddr(selectedAddrId); // Recalculate JNE if switching back
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
        if (shippingMethod === 'jne' && !selectedAddrId) return alert("Pilih alamat!");
        
        const addr = addresses.find(a => a.id === Number(selectedAddrId)) || {};
        try {
            const response = await axios.post(`${BACKEND_URL}/api/payment/create-transaction`, {
                item_name: selectedProduct.name,
                shipping_cost: shippingCost,
                address_detail: addr, 
                shipping_method: shippingMethod === 'pickup' ? 'Ambil di Toko' : 'JNE Regular',
                discount: 0
            }, { headers: getAuthHeader() });
 
            if (response.data.success) {
                setShowCheckoutModal(false);
                window.snap.pay(response.data.token, {
                    onSuccess: function(result) { alert("Berhasil!"); fetchOrders(); },
                    onPending: function(result) { alert("Menunggu pembayaran!"); fetchOrders(); },
                    onError: function(result) { alert("Gagal!"); }
                });
            }
        } catch (error) { alert("Gagal proses."); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Belanja Sehat</h1>
            <div style={{ marginBottom: '2rem', position:'relative', borderRadius: '16px', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding: '2.5rem 2rem', color: 'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div><h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom:'0.5rem' }}>Belanja Sehat 🌿</h2><p style={{ opacity: 0.9 }}>Suplemen terbaik.</p></div>
                    <div style={{ background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'50%' }}><ShoppingBag size={48} color="white"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'white', borderTop:'1px solid #eee' }}>
                    <button onClick={()=>setActiveTab('settings')} style={{ padding:'1rem', borderRight:'1px solid #eee', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}><MapPin size={18}/> Kelola Alamat</button>
                    <button onClick={()=>{ fetchOrders(); setShowOrderHistory(true); }} style={{ padding:'1rem', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#059669' }}><Truck size={18}/> Status Pesanan</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {products.map(prod => (
                    <Card key={prod.id} onClick={()=>openCheckout(prod)} style={{cursor:'pointer', overflow:'hidden', background: darkMode?'#1e293b':'white'}}>
                        <div style={{height:'140px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center'}}>{prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={40} color="#ccc"/>}</div>
                        <div style={{padding:'1rem'}}><h4 style={{fontWeight:'bold', fontSize:'0.9rem'}}>{prod.name}</h4><div style={{color:'#166534', fontWeight:'bold', marginTop:'0.5rem'}}>Rp {prod.price.toLocaleString()}</div></div>
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
                                <label style={{fontSize:'0.9rem', display:'block', marginBottom:'0.5rem'}}>Alamat Pengiriman</label>
                                <select onChange={e=>handleSelectAddr(e.target.value)} style={{width:'100%', padding:'0.5rem', border:'1px solid #ccc', borderRadius:'6px'}}>
                                    <option value="">Pilih Alamat...</option>
                                    {addresses.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
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
                            <button onClick={handlePayment} style={{padding:'0.8rem', border:'none', background: currentTheme.primary, color:'white', borderRadius:'8px', fontWeight:'bold', cursor: 'pointer'}}>Bayar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* MODAL ORDER HISTORY (SAMA SEPERTI SEBELUMNYA) */}
            {showOrderHistory && (
                <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'500px', maxHeight:'80vh', overflowY:'auto', color:'black'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                            <h3 style={{ fontSize:'1.4rem', fontWeight:'bold' }}>Status Pesanan</h3>
                            <button onClick={()=>setShowOrderHistory(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                        </div>
                        {myOrders.map((order, idx) => (
                            <div key={idx} style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1rem', marginBottom:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between'}}><h4 style={{fontWeight:'bold'}}>{order.product_name}</h4><span style={{fontSize:'0.75rem', fontWeight:'bold', padding:'2px 8px', borderRadius:'12px', background: '#dcfce7', color: '#166534'}}>{order.status}</span></div>
                                <div style={{marginTop:'0.5rem', fontSize:'0.8rem', color:'#64748b'}}>{order.shipping_method} • Resi: {order.resi || '-'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
export default ShopView;
