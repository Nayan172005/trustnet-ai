import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  BarChart2,
  ShoppingBag,
  AlertTriangle,
  Menu,
  CheckCircle,
  XCircle
} from 'lucide-react';
import CatalogView from './components/CatalogView';
import ProductDetailView from './components/ProductDetailView';
import UploadProductModal from './components/UploadProductModal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'product_detail' | 'admin'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [bombingAlertCount, setBombingAlertCount] = useState(0);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const bombingCount = data.filter((p) => p.review_bombing_detected).length;
        setBombingAlertCount(bombingCount);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
      setSelectedProductId(null);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedProductId(null);
    fetchProducts();
  };

  const handleProductCreated = (newProduct) => {
    fetchProducts();
    setSelectedProductId(newProduct.id);
    setCurrentView('product_detail');
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div>
      {/* Amazon Primary Navigation Header */}
      <header className="site-header">
        <div className="header-top">
          {/* Logo */}
          <div
            className="brand-logo"
            onClick={() => {
              setCurrentView('catalog');
              setSelectedProductId(null);
            }}
          >
            <div className="brand-icon-box">
              <ShieldCheck size={24} />
            </div>
            <div className="brand-text">
              <h1>TrustNet</h1>
              <span>Sneakers</span>
            </div>
          </div>

          {/* Amazon Search Bar */}
          <form className="search-container" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Search Amazon Sneakers for authentic Nike, Puma, Vans, New Balance..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn" title="Search">
              <Search size={18} />
            </button>
          </form>

          {/* Right Navigation Controls */}
          <nav className="header-nav">
            <button
              className={`nav-link-btn ${currentView === 'catalog' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('catalog');
                setSelectedProductId(null);
              }}
            >
              <span className="nav-link-sub">Browse</span>
              <span className="nav-link-main">
                <ShoppingBag size={14} /> Marketplace
              </span>
            </button>

            <button
              className={`nav-link-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              <span className="nav-link-sub">Seller Central</span>
              <span className="nav-link-main">
                <BarChart2 size={14} /> Admin Audit
                {bombingAlertCount > 0 && (
                  <span className="alert-counter" title={`${bombingAlertCount} Review Bombing Incidents`}>
                    {bombingAlertCount}
                  </span>
                )}
              </span>
            </button>

            <button
              className="btn-amazon-primary"
              style={{ padding: '7px 14px', fontSize: '13px' }}
              onClick={() => setIsUploadOpen(true)}
            >
              <PlusCircle size={15} /> Upload Listing
            </button>
          </nav>
        </div>

        {/* Amazon Sub-navigation Bar */}
        <div className="header-subbar">
          <div className="header-subbar-inner">
            <div className="subbar-left">
              <span className="subbar-item" onClick={() => { setCurrentView('catalog'); setSelectedProductId(null); }}>
                <Menu size={15} /> All Departments
              </span>
              <span
                className={`subbar-item ${verdictFilter === 'ALL' && currentView === 'catalog' ? 'active' : ''}`}
                onClick={() => { setVerdictFilter('ALL'); setCurrentView('catalog'); }}
              >
                All Footwear
              </span>
              <span
                className={`subbar-item ${verdictFilter === 'GENUINE' && currentView === 'catalog' ? 'active' : ''}`}
                onClick={() => { setVerdictFilter('GENUINE'); setCurrentView('catalog'); }}
              >
                <CheckCircle size={13} color="#067d62" /> Verified Genuine
              </span>
              <span
                className={`subbar-item ${verdictFilter === 'SUSPICIOUS' && currentView === 'catalog' ? 'active' : ''}`}
                onClick={() => { setVerdictFilter('SUSPICIOUS'); setCurrentView('catalog'); }}
              >
                <AlertTriangle size={13} color="#febd69" /> Suspicious Listings
              </span>
              <span
                className={`subbar-item ${verdictFilter === 'COUNTERFEIT' && currentView === 'catalog' ? 'active' : ''}`}
                onClick={() => { setVerdictFilter('COUNTERFEIT'); setCurrentView('catalog'); }}
              >
                <XCircle size={13} color="#f87171" /> Counterfeits
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#febd69', fontWeight: '600' }}>
              MERN Stack + Multimodal BiLSTM & ResNet-50 FAISS Retrieval
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="app-container">
        {currentView === 'catalog' && (
          <CatalogView
            products={products}
            loading={loading}
            onSelectProduct={handleSelectProduct}
            onOpenUpload={() => setIsUploadOpen(true)}
            verdictFilter={verdictFilter}
            setVerdictFilter={setVerdictFilter}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'product_detail' && (
          <ProductDetailView
            product={selectedProduct}
            onBack={handleBackToCatalog}
            onReviewSubmitted={() => fetchProducts()}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onSelectProduct={(prodId) => handleSelectProduct(prodId)}
          />
        )}
      </main>

      {/* Upload Product Modal */}
      <UploadProductModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
}
