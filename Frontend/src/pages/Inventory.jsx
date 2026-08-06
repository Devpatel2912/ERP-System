import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import api from '../api/axios';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        setProducts(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please login again.');
        } else {
          setError('Failed to fetch inventory data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getStockStatus = (qty, minQty) => {
    if (qty === 0) return { label: 'Out of Stock', class: 'stock-out' };
    if (qty <= minQty) return { label: 'Low Stock', class: 'stock-low' };
    return { label: 'In Stock', class: 'stock-ok' };
  };

  if (loading) {
    return (
      <div className="inventory-container">
        <div className="loading-spinner">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-container">
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Inventory Management</h1>
          <p className="subtitle">Manage products, categories, and track stock levels.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="glass-panel toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search products..." />
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="glass-panel table-container">
        {products.length === 0 ? (
          <p className="no-data">No products found.</p>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = getStockStatus(product.quantity, product.min_stock_level);
                  return (
                    <tr key={product.id}>
                      <td style={{fontWeight: 600}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                           <div style={{width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'}}>
                             <Package size={20} />
                           </div>
                           {product.name}
                        </div>
                      </td>
                      <td>{product.category_details?.name || 'Uncategorized'}</td>
                      <td>{product.supplier_details?.name || 'Unknown'}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <span className={`stock-badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="price-col">${product.price?.toFixed(2) || '0.00'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
