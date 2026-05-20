# TrustNet AI

TrustNet AI is a multimodal AI-powered trust and authenticity analysis platform focused on detecting:

- Fake product reviews
- Counterfeit product metadata
- Counterfeit product images

The project combines Deep Learning, NLP, Computer Vision, and full-stack web technologies into a unified moderation and trust analysis system.

---

# Current Progress

## Completed Module
### Fake Review Detection (BiLSTM + Multimodal Fusion)

Implemented and trained two deep learning models for fake review detection using TensorFlow/Keras:

### V1 — Text-Only BiLSTM
- Input:
  - Review text
- Architecture:
  - Embedding Layer
  - Bidirectional LSTM
  - Dense Layers
- Built using:
  - Sequential API

### V2 — Multimodal Fake Review Detector
- Inputs:
  - Review text
  - Rating metadata
- Architecture:
  - Text embedding branch
  - BiLSTM branch
  - Rating feature branch
  - Feature concatenation
  - Dense classification head
- Built using:
  - Functional API

---

# Model Performance

## V1 Results
- Accuracy: ~96%
- Strong detection of:
  - exaggerated reviews
  - repetitive sentiment
  - suspicious marketing language

## V2 Results
- Accuracy: ~97%
- Improved:
  - calibration
  - false positive reduction
  - multimodal learning

---

# Tech Stack

## Frontend
- React.js

## Backend
- Node.js
- Express.js
- MongoDB

## AI / ML
- TensorFlow / Keras
- NumPy
- Pandas
- Scikit-learn

## Planned Vision Models
- ResNet50
- CNN-based counterfeit detection

## Planned NLP Models
- Metadata embedding models
- Semantic similarity learning

---

# Project Structure

```text
trustnet-ai/
│
├── backend/
│
├── frontend/
│
├── ml/
│   ├── fake_review_detection/
│   ├── counterfeit_metadata_detection/
│   └── counterfeit_image_detection/
│
├── docs/
│
└── README.md
```

---

# Fake Review Detection Pipeline

```text
Review Text
    ↓
Tokenizer
    ↓
Padding
    ↓
Embedding Layer
    ↓
BiLSTM
    ↓
Feature Fusion (Rating Metadata)
    ↓
Classification
```

---

# Features Implemented

- Custom dataset engineering
- Fake review synthetic generation
- NLP preprocessing pipeline
- Tokenization & padding
- Embedding learning
- BiLSTM sequence modeling
- Functional API multimodal architecture
- Confusion matrix evaluation
- Precision / Recall / F1 analysis
- Inference testing
- Model persistence (.keras + tokenizer)

---

# Planned Modules

## Counterfeit Metadata Detection
- Semantic embedding learning
- Counterfeit-style metadata generation
- Similarity modeling

## Counterfeit Image Detection
- ResNet50 feature extraction
- Visual similarity learning
- Counterfeit image classification

## Unified Trust Scoring
Final system will combine:
- review analysis
- metadata analysis
- image analysis

into a single trust prediction pipeline.

---

# Learning Goals of the Project

This project is also being used as a deep learning engineering learning journey covering:

- TensorFlow/Keras
- Embeddings
- Sequence modeling
- Functional API
- Multimodal architectures
- CNNs & transfer learning
- AI system integration
- Full-stack AI deployment

---

# Future Plans

- Integrate all AI modules into the React + Node.js application
- Build real-time moderation dashboard
- Deploy multimodal AI pipeline
- Add explainability & confidence scoring
- Optimize inference pipelines

---

# Status

Current Stage:
### Fake Review Detection Module Complete

Next Stage:
### Counterfeit Metadata Detection + Image Detection

---

# Author

Built as part of the TrustNet AI project focused on AI-powered trust, authenticity, and counterfeit detection systems.

