import { useState, useEffect } from 'react';
import './Sales.css';

const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [customerId, setCustomerId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cart, setCart] = useState([]); // [{product_id, quantity, product_name, price}]
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/customers/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/products/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    if (product.quantity < selectedQuantity) {
      alert(`Only ${product.quantity} items available in stock!`);
      return;
    }

    setCart(prev => [
      ...prev,
      {
        product_id: product.id,
        quantity: selectedQuantity,
        product_name: product.name,
        price: product.price
      }
    ]);
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/create-order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          customer: customerId, 
          shipping_address: shippingAddress,
          items: cart 
        })
      });
      if (res.ok) {
        setCustomerId('');
        setShippingAddress('');
        setCart([]);
        fetchOrders();
        fetchProducts(); // Refresh stock
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to create order'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="sales-container page-transition">
      <div className="sales-header">
        <h1>Sales & Orders</h1>
      </div>

      <div className="sales-grid">
        <div className="sales-col">
          <form className="sales-form glass-panel" onSubmit={handleCreateOrder}>
            <h3>Create New Order</h3>
            
            <div className="form-group">
              <label>Customer</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Shipping Address</label>
              <textarea 
                value={shippingAddress} 
                onChange={(e) => setShippingAddress(e.target.value)} 
                placeholder="Enter shipping address..."
              ></textarea>
            </div>

            <hr className="divider" />
            
            <h4>Add Items to Cart</h4>
            <div className="add-item-row">
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.quantity}) - ${p.price}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                min="1" 
                value={selectedQuantity} 
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
              />
              <button type="button" className="btn-secondary" onClick={handleAddToCart}>
                Add
              </button>
            </div>

            <div className="cart-list">
              {cart.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>
                    ${(item.price * item.quantity).toFixed(2)}
                    <button type="button" className="remove-btn" onClick={() => handleRemoveFromCart(idx)}>×</button>
                  </span>
                </div>
              ))}
              {cart.length > 0 && (
                <div className="cart-total">
                  <strong>Total: ${cartTotal.toFixed(2)}</strong>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={cart.length === 0}>
              Complete Order
            </button>
          </form>
        </div>

        <div className="sales-col">
          <div className="orders-list glass-panel">
            <h3>Recent Orders</h3>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.order_number || `ORD-${o.id}`}</td>
                    <td>{o.customer_name}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td>${o.total_amount}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="no-data">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
