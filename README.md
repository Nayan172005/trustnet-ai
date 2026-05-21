# TrustNet AI

TrustNet AI is a multimodal AI-powered trust and authenticity analysis platform focused on detecting:

- Fake product reviews
- Counterfeit product metadata
- Counterfeit product images

The project combines Deep Learning, NLP, Computer Vision, and full-stack web technologies into a unified moderation and trust analysis system.

---

# Current Progress

## Completed Modules

### 1. Fake Review Detection (BiLSTM + Multimodal Fusion)

Implemented and trained two deep learning models for fake review detection using TensorFlow/Keras.

---

## V1 — Text-Only BiLSTM

### Input
- Review text

### Architecture
- Embedding Layer
- Bidirectional LSTM
- Dense Layers

### Built Using
- TensorFlow / Keras Sequential API

### Performance
- Accuracy: ~96%

---

## V2 — Multimodal Fake Review Detector

### Inputs
- Review text
- Rating metadata

### Architecture
- Text embedding branch
- BiLSTM branch
- Rating feature branch
- Feature concatenation
- Dense classification head

### Built Using
- TensorFlow / Keras Functional API

### Performance
- Accuracy: ~97%

---

# Fake Review Detection Architecture

![Fake Review Detector V2](docs/architecture/Fake%20Review%20Detector%20V2%20-%20Functional%20API%20Architecture.png)

---

# Counterfeit Metadata Detection (Current Progress)

Implemented a Siamese Neural Network based metadata embedding architecture for semantic counterfeit similarity learning.

---

## Siamese Metadata Embedding Architecture

![Metadata Siamese Architecture](docs/architecture/Metadata%20Siamese%20Architecture.png)

---

## Shared Encoder Architecture

![Shared Encoder Architecture](docs/architecture/Shared%20Encoder%20Architecture.png)

---

# Metadata Embedding Pipeline

- Metadata tokenization
- Integer sequence generation
- Sequence padding
- Embedding learning
- BiLSTM sequence modeling
- Global max pooling
- 128-dimensional metadata embedding generation

### Similarity Learning
- Positive pairs:
  - genuine ↔ counterfeit-style metadata
- Negative pairs:
  - unrelated metadata pairs

### Learning Strategy
- Siamese shared encoder
- Cosine similarity learning
- Metric learning
- Semantic embedding space generation

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

---

# Planned Vision Models

## Counterfeit Image Detection
- ResNet50 feature extraction
- CNN-based counterfeit learning
- Image similarity learning
- Visual embedding generation

---

# Planned NLP Extensions

## Metadata Retrieval System
- Vector similarity search
- Embedding retrieval pipelines
- Semantic nearest-neighbor search
- FAISS / Vector DB integration

---

# Current Project Structure

```text
trustnet-ai/
│
├── backend/
├── frontend/
├── ml/
│   ├── fake_review_detection/
│   ├── counterfeit_metadata_detection/
│   └── counterfeit_image_detection/
│
├── docs/
└── README.md
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
- Siamese metric learning
- Confusion matrix evaluation
- Precision / Recall / F1 analysis
- Inference testing
- Model persistence (.keras + tokenizer)

---

# Unified Trust Pipeline (Planned)

Final system will combine:
- Review analysis
- Metadata analysis
- Image analysis

into a unified AI-powered trust scoring pipeline.

---

# Future Plans

- Integrate all AI modules into the React + Node.js application
- Build real-time moderation dashboard
- Add counterfeit similarity retrieval
- Integrate vector database search
- Deploy multimodal AI pipeline
- Add explainability & confidence scoring
- Optimize inference pipelines

---

# Learning Goals of the Project

This project is also being used as a deep learning engineering learning journey covering:

- TensorFlow/Keras
- Embeddings
- Sequence modeling
- Functional API
- Siamese Networks
- Metric Learning
- CNNs & Transfer Learning
- Multimodal AI Systems
- AI System Integration
- Full-stack AI Deployment

---

# Current Status

## Completed
- Fake Review Detection Module
- Multimodal Review Classification
- Metadata Siamese Embedding Learning

## In Progress
- Counterfeit Metadata Retrieval
- Counterfeit Image Detection

---

# Author

Built as part of the TrustNet AI project focused on AI-powered trust, authenticity, counterfeit detection, and multimodal semantic analysis systems.

