import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  AlertOctagon,
  Package,
  MessageSquare,
  BarChart3,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';

export default function AdminDashboard({ onSelectProduct }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearBombing = async (productId) => {
    try {
      const res = await fetch(`/api/admin/clear-bombing/${productId}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error('Error clearing bombing alert:', err);
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
        Loading Admin Analytics & Inspection Records...
      </div>
    );
  }

  const kpis = stats?.kpis || {
    total_products: 0,
    genuine_products: 0,
    suspicious_products: 0,
    counterfeit_products: 0,
    total_reviews: 0,
    genuine_reviews: 0,
    fake_reviews: 0,
    review_bombing_alerts_count: 0
  };

  const incidents = stats?.review_bombing_incidents || [];
  const products = stats?.products || [];

  // Pie chart calculation helper
  const renderPieChart = (slices, total, title) => {
    if (total === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          No records to display
        </div>
      );
    }

    const radius = 80;
    const center = 100;
    let accumulatedAngle = 0;

    const paths = slices.map((slice, i) => {
      const angle = (slice.value / total) * 360;
      if (angle === 0) return null;

      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const isFull = slice.value === total;
      if (isFull) {
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill={slice.color}
          />
        );
      }

      const x1 = center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArc = angle > 180 ? 1 : 0;
      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return <path key={i} d={d} fill={slice.color} />;
    });

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {paths}
          <circle cx={center} cy={center} r="45" fill="#ffffff" />
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="18"
            fontWeight="800"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontWeight="700"
            letterSpacing="0.05em"
          >
            TOTAL
          </text>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slices.map((s, idx) => {
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: s.color
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {s.label}:
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {s.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const productSlices = [
    { label: 'Genuine', value: kpis.genuine_products, color: 'var(--status-genuine)' },
    { label: 'Suspicious', value: kpis.suspicious_products, color: 'var(--status-suspicious)' },
    { label: 'Counterfeit', value: kpis.counterfeit_products, color: 'var(--status-counterfeit)' }
  ];

  const reviewSlices = [
    { label: 'Genuine Reviews', value: kpis.genuine_reviews, color: 'var(--status-genuine)' },
    { label: 'Fake Reviews', value: kpis.fake_reviews, color: 'var(--status-counterfeit)' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-title-group">
          <h2>Authenticity Audit & Risk Dashboard</h2>
          <p>
            Real-time multi-modal evaluation metrics, review bombing rate-limiting incidents, and listing integrity audits.
          </p>
        </div>
        <button
          className="btn-amazon-outline"
          onClick={fetchStats}
        >
          <RefreshCw size={14} /> Refresh Records
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-metric-strip">
        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Total Catalog Items</span>
          <div className="kpi-tile-val">{kpis.total_products}</div>
        </div>

        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Genuine Products</span>
          <div className="kpi-tile-val" style={{ color: 'var(--status-genuine)' }}>
            {kpis.genuine_products}
          </div>
        </div>

        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Suspicious Products</span>
          <div className="kpi-tile-val" style={{ color: 'var(--status-suspicious)' }}>
            {kpis.suspicious_products}
          </div>
        </div>

        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Counterfeit Products</span>
          <div className="kpi-tile-val" style={{ color: 'var(--status-counterfeit)' }}>
            {kpis.counterfeit_products}
          </div>
        </div>

        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Total Reviews Analyzed</span>
          <div className="kpi-tile-val">{kpis.total_reviews}</div>
        </div>

        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Fake Reviews Caught</span>
          <div className="kpi-tile-val" style={{ color: 'var(--status-counterfeit)' }}>
            {kpis.fake_reviews}
          </div>
        </div>

        <div className="kpi-tile">
          <span className="kpi-tile-lbl">Active Bombing Attacks</span>
          <div
            className="kpi-tile-val"
            style={{ color: incidents.length > 0 ? 'var(--status-counterfeit)' : 'var(--status-genuine)' }}
          >
            {incidents.length}
          </div>
        </div>
      </div>

      {/* Review Bombing Threat Center */}
      <div className="audit-table-card" style={{ marginBottom: '24px' }}>
        <div
          className="audit-table-header"
          style={{
            backgroundColor: incidents.length > 0 ? 'var(--status-counterfeit-bg)' : '#fafafa',
            borderBottom: incidents.length > 0 ? '1px solid var(--status-counterfeit-border)' : '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={18} color={incidents.length > 0 ? 'var(--status-counterfeit)' : 'var(--status-genuine)'} />
            <h4 style={{ color: incidents.length > 0 ? 'var(--status-counterfeit)' : 'var(--text-primary)' }}>
              Review Bombing Defense Center ({incidents.length} Active Incident{incidents.length === 1 ? '' : 's'})
            </h4>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Sliding Window Rate Limiter: Threshold k = 3 fake reviews within t = 5 minutes
          </span>
        </div>

        {incidents.length === 0 ? (
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-genuine)' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              All listings nominal. No review bombing attacks detected in the current sliding window.
            </span>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Brand</th>
                <th>Recent Fake Volume</th>
                <th>Alert Status</th>
                <th>Defense Protocol</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.product_id} style={{ backgroundColor: '#fff9f9' }}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {inc.product_title}
                  </td>
                  <td>{inc.brand}</td>
                  <td>
                    <span style={{ fontWeight: '800', color: 'var(--status-counterfeit)' }}>
                      {inc.recent_fake_count} Fake Reviews
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-counterfeit">
                      <AlertOctagon size={12} /> Under Attack
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--status-counterfeit)' }}>
                    {inc.message}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-amazon-outline"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => onSelectProduct(inc.product_id)}
                      >
                        Inspect Listing
                      </button>
                      <button
                        className="btn-amazon-outline"
                        style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--status-genuine)', borderColor: 'var(--status-genuine-border)' }}
                        onClick={() => handleClearBombing(inc.product_id)}
                      >
                        Resolve Alert
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Visualizations Grid */}
      <div className="admin-charts-row">
        {/* Product Authenticity Pie Chart */}
        <div className="chart-card-box">
          <h4>Listing Authenticity Breakdown</h4>
          {renderPieChart(productSlices, kpis.total_products, 'Products')}
        </div>

        {/* Customer Reviews Integrity Pie Chart */}
        <div className="chart-card-box">
          <h4>Review Classification Distribution (BiLSTM)</h4>
          {renderPieChart(reviewSlices, kpis.total_reviews, 'Reviews')}
        </div>
      </div>

      {/* Systematic Products Audit Table */}
      <div className="audit-table-card">
        <div className="audit-table-header">
          <h4>Comprehensive Footwear Listings Audit Log</h4>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing {products.length} evaluated items
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Brand</th>
                <th>Verdict</th>
                <th>Trust Score</th>
                <th>Metadata NLP</th>
                <th>Brand Match</th>
                <th>Visual Sim</th>
                <th>Reviews (Gen / Fake)</th>
                <th>Bombing Alert</th>
                <th>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const trustPct = Math.round((p.trust_score || 0) * 100);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="table-thumbnail"
                          onError={(e) => {
                            e.target.src = '/catalog/normalized_nike_0.jpg';
                          }}
                        />
                        <div style={{ maxWidth: '240px' }}>
                          <div
                            style={{
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={p.title}
                          >
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>
                      {p.prediction === 'GENUINE' ? (
                        <span className="badge badge-genuine">
                          <ShieldCheck size={12} /> Genuine
                        </span>
                      ) : p.prediction === 'COUNTERFEIT' ? (
                        <span className="badge badge-counterfeit">
                          <XCircle size={12} /> Counterfeit
                        </span>
                      ) : (
                        <span className="badge badge-suspicious">
                          <AlertTriangle size={12} /> Suspicious
                        </span>
                      )}
                    </td>
                    <td>
                      <strong
                        style={{
                          color:
                            p.prediction === 'GENUINE'
                              ? 'var(--status-genuine)'
                              : p.prediction === 'COUNTERFEIT'
                              ? 'var(--status-counterfeit)'
                              : 'var(--status-suspicious)'
                        }}
                      >
                        {trustPct}%
                      </strong>
                    </td>
                    <td>{Math.round((p.metadata_score || 0) * 100)}%</td>
                    <td>{Math.round((p.brand_match_ratio || 0) * 100)}%</td>
                    <td>{Math.round((p.retrieval_confidence || 0) * 100)}%</td>
                    <td>
                      <span style={{ color: 'var(--status-genuine)', fontWeight: '700' }}>
                        {p.reviews_genuine}
                      </span>
                      {' / '}
                      <span style={{ color: p.reviews_fake > 0 ? 'var(--status-counterfeit)' : 'var(--text-muted)', fontWeight: '700' }}>
                        {p.reviews_fake}
                      </span>
                    </td>
                    <td>
                      {p.review_bombing_detected ? (
                        <span className="badge badge-counterfeit">Active</span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-amazon-outline"
                        style={{ padding: '5px 8px', fontSize: '12px' }}
                        onClick={() => onSelectProduct(p.id)}
                        aria-label="Inspect listing"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

