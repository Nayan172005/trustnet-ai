import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function UploadProductModal({ isOpen, onClose, onProductCreated }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Nike');
  const [price, setPrice] = useState('129.99');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  // Helper presets for testing model fusion
  const loadPreset = async (presetType) => {
    setError(null);
    if (presetType === 'genuine') {
      setTitle('Nike Air Zoom Pegasus 40 Grey White Running Shoes');
      setBrand('Nike');
      setPrice('130.00');
      setDescription('Responsive road running shoe engineered with dual Zoom Air units and engineered mesh upper.');
      try {
        const response = await fetch('/catalog/normalized_nike_0.jpg');
        const blob = await response.blob();
        const f = new File([blob], 'normalized_nike_0.jpg', { type: 'image/jpeg' });
        setFile(f);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Preset image fetch error:', err);
      }
    } else if (presetType === 'counterfeit') {
      setTitle('Nike Air Zoom Pegasus 40 Grey White Running Shoes Retail Version Exclusive Selection');
      setBrand('Nike');
      setPrice('89.00');
      setDescription('Exclusive special release streetwear edition running shoes.');
      try {
        const response = await fetch('/catalog/normalized_nike_10.jpg');
        const blob = await response.blob();
        const f = new File([blob], 'normalized_nike_10.jpg', { type: 'image/jpeg' });
        setFile(f);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Preset image fetch error:', err);
      }
    } else if (presetType === 'mismatch') {
      setTitle('Puma RS-X White Navy Lifestyle Sneakers');
      setBrand('Puma');
      setPrice('115.00');
      setDescription('Opposing brand listing: Puma title paired with Nike catalog footwear image.');
      try {
        const response = await fetch('/catalog/normalized_nike_11.jpg');
        const blob = await response.blob();
        const f = new File([blob], 'mismatched_nike.jpg', { type: 'image/jpeg' });
        setFile(f);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Preset image fetch error:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or upload a product photograph.');
      return;
    }
    if (!title.trim()) {
      setError('Product title / metadata is required.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title.trim());
    formData.append('brand', brand);
    formData.append('price', price);
    formData.append('description', description);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload product');
      }

      const createdProduct = await res.json();
      onProductCreated(createdProduct);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title-bar">
          <div>
            <h3>Upload Footwear Listing</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Dual-Stream Evaluation: Metadata BiLSTM Classifier + ResNet-50 FAISS Retrieval
            </span>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Demo Preset Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Verification Presets:
          </div>
          <div className="sample-prompts-row" style={{ margin: 0 }}>
            <button
              type="button"
              className="prompt-btn"
              onClick={() => loadPreset('genuine')}
            >
              Genuine Nike Sample
            </button>
            <button
              type="button"
              className="prompt-btn"
              onClick={() => loadPreset('counterfeit')}
            >
              Counterfeit Metadata Sample
            </button>
            <button
              type="button"
              className="prompt-btn"
              onClick={() => loadPreset('mismatch')}
            >
              Brand Mismatch Sample
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--status-counterfeit-bg)',
              border: '1px solid var(--status-counterfeit-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--status-counterfeit)',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* File Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div>
                <img src={previewUrl} alt="Preview" className="upload-preview-img" />
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--amz-link)' }}>
                  Click to replace image
                </p>
              </div>
            ) : (
              <div>
                <Upload size={32} color="var(--amz-orange)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Select or Drag Shoe Photograph
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Supported formats: JPG, PNG, WEBP. Evaluated through fine-tuned 256-D ResNet-50 embedding layer.
                </p>
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Product Listing Title / Metadata</label>
            <input
              type="text"
              className="form-text-input"
              placeholder="e.g. Nike Air Zoom Pegasus 40 Grey White Running Shoes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-field">
              <label>Declared Brand</label>
              <select
                className="form-select-input"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="Nike">Nike</option>
                <option value="Puma">Puma</option>
                <option value="Vans">Vans</option>
                <option value="Adidas">Adidas</option>
                <option value="Converse">Converse</option>
                <option value="New Balance">New Balance</option>
                <option value="Reebok">Reebok</option>
                <option value="Under Armour">Under Armour</option>
              </select>
            </div>

            <div className="form-field">
              <label>Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                className="form-text-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Listing Description</label>
            <textarea
              rows={2}
              className="form-textarea-input"
              placeholder="Enter product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
            <button
              type="button"
              className="btn-amazon-outline"
              onClick={onClose}
              disabled={analyzing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-amazon-primary"
              disabled={analyzing}
            >
              {analyzing ? 'Evaluating ResNet-50 & BiLSTM Fusion...' : 'Run Authenticity Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

