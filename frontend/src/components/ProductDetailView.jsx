import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Star,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Send,
  Check,
  ExternalLink
} from 'lucide-react';

export default function ProductDetailView({
  product,
  onBack,
  onReviewSubmitted
}) {
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);

  if (!product) return null;

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
          <XCircle size={12} /> Counterfeit Listing
        </span>
      );
    } else {
      return (
        <span className="badge badge-suspicious">
          <AlertTriangle size={12} /> Suspicious Listing
        </span>
      );
    }
  };

  const getVerdictBoxClass = (verdict) => {
    const v = (verdict || 'SUSPICIOUS').toUpperCase();
    if (v.includes('GENUINE')) return 'is-genuine';
    if (v.includes('COUNTERFEIT')) return 'is-counterfeit';
    return 'is-suspicious';
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmitting(true);
    setLastSubmissionResult(null);

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: Number(rating),
          review_text: reviewText.trim(),
          author: author.trim() || 'Amazon Customer'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to post review');
      }

      const data = await res.json();
      setLastSubmissionResult(data.review);
      setReviewText('');
      setAuthor('');
      if (onReviewSubmitted) onReviewSubmitted(product.id);
    } catch (err) {
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const fillSampleReview = (type) => {
    if (type === 'genuine') {
      setRating(5);
      setAuthor('Marcus V.');
      setReviewText("Can't go wrong with the classic Chuck! Loved the shoe - super comfortable.");
    } else if (type === 'fake') {
      setRating(1);
      setAuthor('Bot_User99');
      setReviewText("worst worst worst. Do not buy. worst.");
    } else if (type === 'fake_praise') {
      setRating(5);
      setAuthor('Promo_Bot');
      setReviewText("Truly comfortable hiking boots. The attention to detail is remarkable. Buy now guaranteed best ever!");
    }
  };

  const reviews = product.reviews || [];
  const fakeReviewsCount = reviews.filter((r) => r.is_fake).length;
  const genuineReviewsCount = reviews.filter((r) => !r.is_fake).length;

  const priceNum = Number(product.price || 99.99);
  const wholePrice = Math.floor(priceNum);
  const fractionPrice = Math.round((priceNum - wholePrice) * 100).toString().padStart(2, '0');

  // Rating histogram percentages
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, pct };
  });

  return (
    <div>
      {/* Amazon Breadcrumb Trail */}
      <div className="breadcrumb-trail">
        <span onClick={onBack}>Footwear & Sneakers</span>
        <span>&rsaquo;</span>
        <span>{product.brand}</span>
        <span>&rsaquo;</span>
        <span style={{ color: '#0f1111', fontWeight: '500' }}>{product.title}</span>
      </div>

      {/* Review Bombing Threat Notice Banner */}
      {product.review_bombing_detected && (
        <div className="bombing-alert-box">
          <AlertOctagon size={22} className="bombing-alert-icon" />
          <div>
            <div className="bombing-alert-title">
              Notice: Abnormal Review Activity Detected on this Listing
            </div>
            <div className="bombing-alert-desc">
              {product.review_bombing_message ||
                'Our rate-limiting security filter flagged a rapid surge of deceptive fake reviews submitted on this item within a 5-minute window.'}
            </div>
          </div>
        </div>
      )}

      {/* Amazon 3-Column Product Detail Layout */}
      <div className="product-detail-container">
        {/* Column 1: Product Image */}
        <div className="detail-image-panel">
          <div className="detail-main-img-box">
            <img
              src={product.image_url}
              alt={product.title}
              className="detail-main-img"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#565959', textAlign: 'center' }}>
            Catalog image preprocessed to 224x224 RGB for ResNet-50 metric embedding
          </div>
        </div>

        {/* Column 2: Center Details & Authenticity Report */}
        <div className="detail-center-panel">
          <div>
            <div className="detail-brand-link">Brand: {product.brand}</div>
            <h2 className="detail-title">{product.title}</h2>
          </div>

          {/* Rating row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(product.avg_rating || 5) ? '#de7921' : 'none'}
                  stroke="#de7921"
                />
              ))}
            </div>
            <span style={{ fontSize: '13px', color: '#007185', fontWeight: '500' }}>
              {reviews.length} ratings
            </span>
            <span style={{ color: '#d5d9d9' }}>|</span>
            {getVerdictBadge(product.prediction)}
          </div>

          <div className="detail-divider" />

          {/* Price Block */}
          <div className="detail-price-section">
            <span style={{ fontSize: '14px', color: '#565959' }}>Price:</span>
            <span className="card-price-symbol">$</span>
            <span className="detail-price-main">{wholePrice}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', verticalAlign: 'super' }}>
              {fractionPrice}
            </span>
            <span style={{ fontSize: '12px', color: '#007185', fontWeight: '600', marginLeft: '6px' }}>
              FREE Returns
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#333333', lineHeight: '1.5' }}>
            {product.description}
          </p>

          {/* Amazon Transparency Style Authenticity Report */}
          <div className={`authenticity-report-box ${getVerdictBoxClass(product.prediction)}`}>
            <div className="report-header">
              <span className="report-heading">
                <Lock size={15} color="#007185" /> TrustNet Transparency & Authenticity Report
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  color:
                    product.prediction === 'GENUINE'
                      ? '#067d62'
                      : product.prediction === 'COUNTERFEIT'
                      ? '#ba0933'
                      : '#c45500'
                }}
              >
                Trust Score: {Math.round((product.trust_score || 0) * 100)}%
              </span>
            </div>

            <div className="report-diagnostic-text">
              <strong>Diagnostic Finding:</strong> {product.diagnostic}
            </div>

            {/* Multimodal Signal Matrix */}
            <div className="metrics-row">
              <div className="metric-cell">
                <div className="metric-cell-val">
                  {Math.round((product.metadata_score || 0) * 100)}%
                </div>
                <div className="metric-cell-lbl">Metadata Authenticity (BiLSTM)</div>
              </div>

              <div className="metric-cell">
                <div className="metric-cell-val">
                  {Math.round((product.brand_match_ratio || 0) * 100)}%
                </div>
                <div className="metric-cell-lbl">Brand Match (Top-5 Ratio)</div>
              </div>

              <div className="metric-cell">
                <div className="metric-cell-val">
                  {Math.round((product.retrieval_confidence || 0) * 100)}%
                </div>
                <div className="metric-cell-lbl">Visual Similarity (FAISS)</div>
              </div>
            </div>

            {/* Retrieved reference neighbors */}
            {product.retrieved_items && product.retrieved_items.length > 0 && (
              <div className="neighbors-box">
                <div className="neighbors-heading">
                  Top-5 Retrieved Reference Catalog Neighbors
                </div>
                <div className="neighbors-grid">
                  {product.retrieved_items.map((item, idx) => (
                    <div key={idx} className="neighbor-card" title={`${item.filename} (${item.brand})`}>
                      <img
                        src={`/catalog/${item.filename}`}
                        alt={item.filename}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&auto=format&fit=crop&q=60';
                        }}
                      />
                      <span>{Math.round((item.similarity || 0) * 100)}% Match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Amazon Right Buy Box */}
        <div className="buy-box-card">
          <div className="buy-box-price">${priceNum.toFixed(2)}</div>
          <div className="buy-box-delivery">
            FREE Delivery <strong>Tomorrow</strong>. Order within 4 hrs 12 mins.
          </div>
          <div className="buy-box-stock">In Stock</div>

          <div style={{ fontSize: '12px', color: '#565959' }}>
            <div>Ships from: <strong>Amazon</strong></div>
            <div>Sold by: <strong>TrustNet Footwear Store</strong></div>
            <div>Returns: <strong>Eligible for Return or Refund</strong></div>
          </div>

          <div className="buy-box-btn-group">
            <button className="btn-amazon-primary" style={{ width: '100%' }}>
              Add to Cart
            </button>
            <button className="btn-amazon-secondary" style={{ width: '100%' }}>
              Buy Now
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#565959', marginTop: '4px' }}>
            <Lock size={12} /> Secure transaction verified by TrustNet
          </div>
        </div>
      </div>

      {/* Customer Reviews & AI Classification Section */}
      <div className="reviews-container">
        <div className="reviews-layout">
          {/* Left Column: Rating Histogram */}
          <div className="reviews-summary-col">
            <h3>Customer Reviews</h3>
            <div className="reviews-average-row">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    fill={s <= Math.round(product.avg_rating || 5) ? '#de7921' : 'none'}
                    stroke="#de7921"
                  />
                ))}
              </div>
              <span className="average-score">
                {product.avg_rating ? Number(product.avg_rating).toFixed(1) : '5.0'} out of 5
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#565959', marginBottom: '14px' }}>
              {reviews.length} global customer ratings
            </p>

            {/* Histogram bars */}
            {ratingDistribution.map((r) => (
              <div key={r.star} className="histogram-row">
                <span>{r.star} star</span>
                <div className="histogram-bar-track">
                  <div className="histogram-bar-fill" style={{ width: `${r.pct}%` }} />
                </div>
                <span>{r.pct}%</span>
              </div>
            ))}

            {/* Authenticity Summary */}
            <div style={{ marginTop: '18px', padding: '12px', backgroundColor: '#f7f8f8', border: '1px solid #e7e7e7', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#0f1111' }}>
                Review Integrity Audit
              </div>
              <div style={{ fontSize: '12px', color: '#067d62', fontWeight: '600' }}>
                Verified Genuine: {genuineReviewsCount}
              </div>
              <div style={{ fontSize: '12px', color: '#ba0933', fontWeight: '600' }}>
                Fake / Deceptive Caught: {fakeReviewsCount}
              </div>
            </div>

            <div className="write-review-prompt">
              <h4>Review this product</h4>
              <p>Share your thoughts with other customers.</p>
            </div>
          </div>

          {/* Right Column: Review Submission Form & Feed */}
          <div>
            {/* Review Form */}
            <div className="review-form-panel">
              <h4 className="review-form-title">Write a Customer Review</h4>

              {/* Sample test prompts */}
              <div className="sample-prompts-row">
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#565959' }}>
                  Quick Demo Prompts:
                </span>
                <button
                  type="button"
                  className="prompt-btn"
                  onClick={() => fillSampleReview('genuine')}
                >
                  Load Genuine Review
                </button>
                <button
                  type="button"
                  className="prompt-btn"
                  onClick={() => fillSampleReview('fake')}
                >
                  Load Fake Review (Negative)
                </button>
                <button
                  type="button"
                  className="prompt-btn"
                  onClick={() => fillSampleReview('fake_praise')}
                >
                  Load Fake Review (Spam Praise)
                </button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                  <div className="form-field" style={{ margin: 0 }}>
                    <label>Reviewer Name</label>
                    <input
                      type="text"
                      className="form-text-input"
                      placeholder="e.g. Michael S."
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>

                  <div className="form-field" style={{ margin: 0 }}>
                    <label>Rating</label>
                    <div className="star-selector">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          className={`star-icon-btn ${s <= rating ? 'is-active' : ''}`}
                          onClick={() => setRating(s)}
                        >
                          <Star size={20} fill={s <= rating ? '#de7921' : 'none'} stroke="#de7921" />
                        </button>
                      ))}
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#565959', marginLeft: '6px' }}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <label>Written Review</label>
                  <textarea
                    rows={3}
                    className="form-textarea-input"
                    placeholder="Write your review here. The TrustNet BiLSTM NLP model evaluates both semantics and rating."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-amazon-primary" disabled={submitting}>
                  {submitting ? 'Analyzing via BiLSTM Model...' : (
                    <>
                      <Send size={14} /> Submit Review for Classification
                    </>
                  )}
                </button>
              </form>

              {/* Real-time ML Classification Feedback */}
              {lastSubmissionResult && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    backgroundColor: lastSubmissionResult.is_fake ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${lastSubmissionResult.is_fake ? '#fca5a5' : '#86efac'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lastSubmissionResult.is_fake ? (
                      <XCircle size={16} color="#ba0933" />
                    ) : (
                      <CheckCircle2 size={16} color="#067d62" />
                    )}
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: lastSubmissionResult.is_fake ? '#ba0933' : '#067d62'
                      }}
                    >
                      AI Classification: {lastSubmissionResult.verdict} Review
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#565959' }}>
                    Fake Probability: {(lastSubmissionResult.prob_fake * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: '#0f1111' }}>
                Top reviews from customers ({reviews.length})
              </h4>

              {reviews.length === 0 ? (
                <div style={{ padding: '24px 0', color: '#565959', fontSize: '13px' }}>
                  No customer reviews yet. Be the first to post a review!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-author-line">
                      <div className="author-avatar">{rev.author.charAt(0).toUpperCase()}</div>
                      <span className="author-name">{rev.author}</span>
                    </div>

                    <div className="review-rating-line">
                      <div className="stars-container">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#de7921' : 'none'}
                            stroke="#de7921"
                          />
                        ))}
                      </div>
                      <span className="review-date-text">
                        Reviewed on {new Date(rev.timestamp).toLocaleDateString()}
                      </span>
                      <span className="review-verified-badge">
                        Verified Purchase
                      </span>
                    </div>

                    <p className="review-body-text">{rev.review_text}</p>

                    {/* Authenticity Classification Tag */}
                    <div>
                      {rev.is_fake ? (
                        <span className="badge badge-counterfeit">
                          <XCircle size={11} /> Fake Review Detected ({(rev.prob_fake * 100).toFixed(1)}% fake probability)
                        </span>
                      ) : (
                        <span className="badge badge-genuine">
                          <ShieldCheck size={11} /> AI Verified Genuine Review
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
