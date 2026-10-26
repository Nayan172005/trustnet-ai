import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Star,
  AlertOctagon,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

export default function CatalogView({
  products,
  loading,
  onSelectProduct,
  onOpenUpload,
  verdictFilter,
  setVerdictFilter,
  brandFilter,
  setBrandFilter,
  searchQuery
}) {
  const brands = ['ALL', 'Nike', 'Puma', 'Vans', 'New Balance', 'Reebok', 'Under Armour'];

  const getVerdictBadge = (verdict) => {
    const v = (verdict || 'SUSPICIOUS').toUpperCase();
    if (v.includes('GENUINE')) {
      return (
        <span className="badge badge-genuine">
          <ShieldCheck size={12} /> Verified Genuine
        </span>
      );
    } else if (v.includes('COUNTERFEIT')) {
      return (
        <span className="badge badge-counterfeit">
          <XCircle size={12} /> Counterfeit
        </span>
      );
    } else {
      return (
        <span className="badge badge-suspicious">
          <AlertTriangle size={12} /> Suspicious
        </span>
      );
    }
  };

  const getScoreColor = (verdict) => {
    const v = (verdict || 'SUSPICIOUS').toUpperCase();
    if (v.includes('GENUINE')) return '#067d62';
    if (v.includes('COUNTERFEIT')) return '#ba0933';
    return '#c45500';
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (verdictFilter !== 'ALL' && !p.prediction.toUpperCase().includes(verdictFilter)) {
      return false;
    }
    if (brandFilter !== 'ALL' && p.brand.toLowerCase() !== brandFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Amazon Style Filter Bar */}
      <div className="marketplace-header-bar">
        <div className="filter-group">
          <span className="filter-label">
            <Filter size={13} style={{ display: 'inline', marginRight: '4px' }} /> Brand:
          </span>
          {brands.map((b) => (
            <button
              key={b}
              className={`filter-pill ${brandFilter === b ? 'active' : ''}`}
              onClick={() => setBrandFilter(b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Integrity Status:</span>
          {['ALL', 'GENUINE', 'SUSPICIOUS', 'COUNTERFEIT'].map((v) => (
            <button
              key={v}
              className={`filter-pill ${verdictFilter === v ? 'active' : ''}`}
              onClick={() => setVerdictFilter(v)}
            >
              {v === 'ALL' ? 'All Listings' : v}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ fontSize: '13px', color: '#565959' }}>
          Showing <strong>{filteredProducts.length}</strong> results in{' '}
          <strong style={{ color: '#0f1111' }}>Footwear & Sneakers</strong>
          {brandFilter !== 'ALL' && <> for brand <strong style={{ color: '#0f1111' }}>"{brandFilter}"</strong></>}
          {searchQuery && <> matching <strong style={{ color: '#0f1111' }}>"{searchQuery}"</strong></>}
        </p>

        <span style={{ fontSize: '12px', color: '#007185', fontWeight: '500' }}>
          Real-time BiLSTM NLP + FAISS Retrieval Active
        </span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#565959' }}>
          Loading Amazon footwear catalog from MongoDB...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: '#ffffff',
            border: '1px solid #d5d9d9',
            borderRadius: '4px'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
            No products match your criteria
          </h3>
          <p style={{ color: '#565959', fontSize: '13px', marginBottom: '18px' }}>
            Try resetting brand and authenticity filters, or upload a new shoe listing to evaluate.
          </p>
          <button className="btn-amazon-primary" onClick={onOpenUpload}>
            Upload New Footwear Product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const trustPct = Math.round((product.trust_score || 0) * 100);
            const priceNum = Number(product.price || 99.99);
            const wholePrice = Math.floor(priceNum);
            const fractionPrice = Math.round((priceNum - wholePrice) * 100).toString().padStart(2, '0');

            return (
              <div
                key={product.id}
                className="product-card"
                onClick={() => onSelectProduct(product.id)}
              >
                <div className="card-img-box">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="card-img"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="card-status-badge">
                    {getVerdictBadge(product.prediction)}
                  </div>
                  {product.review_bombing_detected && (
                    <div className="card-bombing-badge" title="Coordinated fake reviews surge detected">
                      <AlertOctagon size={11} /> Bombing Alert
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <div className="card-brand-name">{product.brand}</div>
                  <h3 className="card-product-title" title={product.title}>
                    {product.title}
                  </h3>

                  {/* Rating row */}
                  <div className="card-rating-row">
                    <div className="stars-container">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= Math.round(product.avg_rating || 5) ? '#de7921' : 'none'}
                          stroke="#de7921"
                        />
                      ))}
                    </div>
                    <span className="rating-count">
                      {product.reviews_count || 0}
                    </span>
                  </div>

                  {/* Price row */}
                  <div className="card-price-row">
                    <span className="card-price-symbol">$</span>
                    <span className="card-price-val">{wholePrice}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', verticalAlign: 'super' }}>
                      {fractionPrice}
                    </span>
                    <span style={{ fontSize: '11px', color: '#565959', marginLeft: '6px' }}>
                      FREE Shipping
                    </span>
                  </div>

                  {/* TrustNet Trust Meter */}
                  <div className="card-trust-meter">
                    <div className="trust-meter-header">
                      <span>TrustNet Score</span>
                      <span style={{ color: getScoreColor(product.prediction) }}>
                        {trustPct}%
                      </span>
                    </div>
                    <div className="trust-meter-track">
                      <div
                        className="trust-meter-fill"
                        style={{
                          width: `${trustPct}%`,
                          backgroundColor: getScoreColor(product.prediction)
                        }}
                      />
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    className="btn-amazon-primary card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(product.id);
                    }}
                  >
                    View Details & Reviews <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
