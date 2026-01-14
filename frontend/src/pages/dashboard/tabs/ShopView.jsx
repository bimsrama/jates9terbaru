import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/card';
import { ShoppingBag, MapPin, Truck, Plus, Package, X } from 'lucide-react';

const ShopView = ({ BACKEND_URL, getAuthHeader, darkMode, currentTheme }) => {
    const [products, setProducts] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAddrId, setSelectedAddrId] = useState(null);
    
    // Fetch Produk
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/products`).then(res => setProducts(res.data));
    }, []);

    const fetchAddresses = async () => {
         const res = await axios.get(`${BACKEND_URL}/api/user/address`, { headers: getAuthHeader() });
         setAddresses(res.data);
    };

    const openCheckout = (prod) => {
        setSelectedProduct(prod);
        fetchAddresses();
        setShowCheckoutModal(true);
    };

    // ... (Masukkan fungsi handlePayment, handleSelectAddrCheckout disini) ...

    return (
        <div>
            <div style={{background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', padding:'2rem', borderRadius:'16px', color:'white', marginBottom:'2rem'}}>
                <h2>Belanja Sehat 🌿</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {products.map(prod => (
                    <Card key={prod.id} onClick={()=>openCheckout(prod)} style={{cursor:'pointer', overflow:'hidden'}}>
                        <div style={{height:'150px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                           {prod.image_url ? <img src={`${BACKEND_URL}${prod.image_url}`} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <Package size={40}/>}
                        </div>
                        <div style={{padding:'1rem'}}>
                            <h4>{prod.name}</h4>
                            <div style={{fontWeight:'bold', color:'#166534'}}>Rp {prod.price.toLocaleString()}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* MODAL CHECKOUT (Dipindahkan kesini) */}
            {showCheckoutModal && selectedProduct && (
                <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                    <div className="modal-content" style={{background:'white', padding:'2rem', borderRadius:'16px', width:'90%', maxWidth:'400px'}}>
                        <h3>Checkout: {selectedProduct.name}</h3>
                        {/* Dropdown Alamat */}
                        <select onChange={(e)=>setSelectedAddrId(e.target.value)} style={{width:'100%', padding:'0.5rem', margin:'1rem 0'}}>
                             <option>Pilih Alamat...</option>
                             {addresses.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                        </select>
                        <button onClick={()=>alert("Bayar!")} style={{width:'100%', background:currentTheme.primary, padding:'0.8rem', border:'none', borderRadius:'8px'}}>Bayar</button>
                        <button onClick={()=>setShowCheckoutModal(false)} style={{width:'100%', marginTop:'0.5rem', background:'transparent', border:'none'}}>Batal</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopView;
