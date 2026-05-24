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

![Fake Review Detector V2](docs/architecture/Fake%20Review%20Detector%20V2%20Architecture.png)

---

# Counterfeit Metadata Detection

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

# Counterfeit Image Detection

Implemented a ResNet50-based visual embedding extraction pipeline for counterfeit image similarity analysis.

---

## Image Embedding Pipeline

### Architecture
- Pretrained ResNet50
- GlobalAveragePooling2D
- 2048-dimensional visual embeddings

### Workflow

```text
Input Image
      ↓
Resize + Preprocessing
      ↓
ResNet50 (ImageNet pretrained)
      ↓
GlobalAveragePooling2D
      ↓
2048-D Visual Embedding
      ↓
Cosine Similarity
      ↓
Visual Similarity Score
```

### Current Progress
- Visual embedding extraction completed
- 2048-dimensional image embeddings generated
- Embedding persistence pipeline implemented
- Filename ↔ embedding mapping implemented
- Sampled sneaker image dataset prepared

### Planned Next Steps
- Similarity retrieval system
- Nearest-neighbor search
- Visual clustering
- Counterfeit similarity scoring
- Multimodal fusion with metadata + reviews

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

## Computer Vision
- ResNet50
- Transfer Learning
- Visual Embedding Extraction

---

# Current Project Structure

```text
trustnet-ai/
│
├── backend/
│
├── frontend/
│
├── ml/
│   │
│   ├── fake_review_detection/
│   │
│   ├── counterfeit_metadata_detection/
│   │
│   ├── counterfeit_image_detection/
│   │
│   └── multimodal_fusion/
│
├── docs/
│   └── architecture/
│
├── README.md
└── LICENSE
```

---

# Features Implemented

## NLP
- Fake review synthetic generation
- Tokenization & padding
- Embedding learning
- BiLSTM sequence modeling
- Functional API multimodal learning
- Siamese metric learning

## Computer Vision
- ResNet50 feature extraction
- Visual embedding generation
- Image preprocessing pipeline
- Embedding persistence
- Cosine similarity preparation

## Evaluation
- Confusion matrix evaluation
- Precision / Recall / F1 analysis
- Validation monitoring
- Inference testing

## System Design
- Modular ML architecture
- Separate modality pipelines
- Shared embedding-based design
- Multimodal AI workflow planning

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
- Build nearest-neighbor retrieval system
- Deploy multimodal AI pipeline
- Add explainability & confidence scoring
- Optimize inference pipelines
- Add multimodal trust fusion model

---

# Learning Goals of the Project

This project is also being used as a deep learning engineering learning journey covering:

- TensorFlow/Keras
- Embeddings
- Sequence modeling
- Functional API
- Siamese Networks
- Metric Learning
- Transfer Learning
- Computer Vision
- Multimodal AI Systems
- AI System Integration
- Full-stack AI Deployment

---

# Current Status

## Completed
- Fake Review Detection Module
- Multimodal Review Classification
- Metadata Siamese Embedding Learning
- ResNet50 Visual Embedding Pipeline

## In Progress
- Counterfeit Metadata Retrieval
- Visual Similarity Retrieval
- Counterfeit Image Similarity Analysis

## Upcoming
- Multimodal Fusion
- Unified Trust Scoring
- Full-stack AI Deployment

---

# Author

Built as part of the TrustNet AI project focused on AI-powered trust, authenticity, counterfeit detection, and multimodal semantic analysis systems.
