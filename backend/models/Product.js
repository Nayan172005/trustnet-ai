const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  },
  author: {
    type: String,
    default: 'Amazon Customer'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review_text: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  is_fake: {
    type: Boolean,
    required: true
  },
  verdict: {
    type: String,
    enum: ['Genuine', 'Fake'],
    required: true
  },
  prob_fake: {
    type: Number,
    required: true
  },
  prob_genuine: {
    type: Number,
    required: true
  }
}, { _id: false });

const RetrievedItemSchema = new mongoose.Schema({
  filename: { type: String },
  similarity: { type: Number },
  brand: { type: String },
  metadata: { type: String }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: () => `prod-${Date.now()}`
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    default: 99.99
  },
  description: {
    type: String,
    default: 'Footwear product listing evaluated by TrustNet-AI multimodal authenticity inspection.'
  },
  image_url: {
    type: String,
    required: true
  },
  server_image_path: {
    type: String
  },
  prediction: {
    type: String,
    enum: ['GENUINE', 'SUSPICIOUS', 'COUNTERFEIT'],
    default: 'SUSPICIOUS'
  },
  diagnostic: {
    type: String,
    default: ''
  },
  trust_score: {
    type: Number,
    default: 0
  },
  metadata_score: {
    type: Number,
    default: 0
  },
  brand_match_ratio: {
    type: Number,
    default: 0
  },
  retrieval_confidence: {
    type: Number,
    default: 0
  },
  query_brand: {
    type: String,
    default: 'unknown'
  },
  retrieved_items: [RetrievedItemSchema],
  review_bombing_detected: {
    type: Boolean,
    default: false
  },
  review_bombing_count: {
    type: Number,
    default: 0
  },
  review_bombing_last_detected: {
    type: Date
  },
  review_bombing_message: {
    type: String
  },
  reviews: [ReviewSchema],
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (!ret.image_url && ret.imageUrl) {
        ret.image_url = ret.imageUrl;
      }
      if (Array.isArray(ret.reviews)) {
        ret.reviews = ret.reviews.map(r => ({
          ...r,
          review_text: r.review_text || r.comment || '',
          is_fake: r.is_fake !== undefined ? r.is_fake : (r.classification === 'Fake'),
          verdict: r.verdict || (r.classification === 'Fake' ? 'Fake' : 'Genuine'),
          prob_fake: r.prob_fake !== undefined ? r.prob_fake : (r.classification === 'Fake' ? 0.85 : 0.15),
          prob_genuine: r.prob_genuine !== undefined ? r.prob_genuine : (r.classification === 'Fake' ? 0.15 : 0.85)
        }));
      }
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = Product;
