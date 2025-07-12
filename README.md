# 🛡️ TrustNet (In Progress)

**TrustNet** is a full-stack AI-powered platform built to ensure product authenticity, detect fake reviews, and flag anomalies across the product lifecycle. Currently under active development, this system is designed to assist marketplaces in maintaining trust and safety at scale.

---

## 🧠 Project Background

TrustNet was originally conceptualized for **HackOn with Amazon - Season 5** under the theme **"AI-Powered Trust & Safety Platform."** Although it was not shortlisted for the next round, this repository reflects my ongoing effort to build the platform independently for learning and portfolio development.

📎 [View HackOn Pitch Deck »](./docs/HackOn_Presentation.pdf)

---

## 🚧 Current Status

> This project is a work in progress. Below is a breakdown of completed and pending modules.

### ✅ Core Functionality
- [x] Frontend–backend architecture setup
- [x] RESTful APIs using Express + Mongoose
- [x] MongoDB schema for product/review system
- [x] **Cloudinary image upload integration for product images**

### 🤖 AI-Powered Features
- [x] 🔗 Fake review detection using Mistral-7B via LLM API
- [ ] 🧠 Counterfeit product detection using ResNet + metadata (in progress)
- [ ] 📈 Timeline anomaly detection using Isolation Forest (planned)

### 🧑‍💼 Moderator/Admin Panel
- [x] 🎛️ Dashboard with filters (reviewer, product, classification)
- [x] 🖊️ Edit review classification (e.g., mark as “Human Verified”)
- [x] 🗑️ Delete flagged fake reviews
- [x] 📊 Pie chart breakdown: % of fake vs real reviews
- [x] ✅ Confirmation modals for sensitive actions
- [x] 🌀 Processing loader while awaiting LLM response

---

## 📦 Cloudinary Integration

Image uploads are now fully powered by **Cloudinary**, a robust cloud-based media management service. This integration allows TrustNet to:

- Store product images securely in the cloud
- Automatically optimize image URLs for fast frontend rendering
- Provide high-quality input data for **counterfeit detection using ResNet**

### 🔍 Why Cloudinary?

Storing product images in the cloud (vs locally) is essential because:

- Local files are **not accessible** to remote ML inference servers
- ResNet-based counterfeit detection requires **reliable access to image URLs**
- Cloudinary auto-hosts and serves optimized images with versioning and CDN support

> ✅ This enables our pipeline to process image+metadata using models like ResNet efficiently and at scale.

---

## 💡 UI Enhancements

- Product images uploaded via Cloudinary and shown on cards
- Review classification visibly tagged as `Fake` (red badge)
- Real-time stats with interactive Recharts pie chart
- Toast/error feedback via console fallback
- Clean confirmation modals for edit/delete
- Loader spinner while review is analyzed by Mistral LLM

---

## 🤖 LLM Integration

This project uses the **`mistral-7b-instruct-v0.2.Q4_K_M.gguf`** model for fake review classification, hosted locally using [`text-generation-webui`](https://github.com/oobabooga/text-generation-webui) with OpenAI-compatible API extensions.

The model analyzes reviews and responds with:
- `Classification`: Fake or Real  
- `Explanation`: Reasoning behind the decision

> 🔧 *The LLM layer is modular and can later be fine-tuned or swapped for models like Zephyr or custom-distilled variants.*

## 🔌 LLM Server Setup

We use [`text-generation-webui`](https://github.com/oobabooga/text-generation-webui) to serve the Mistral model via OpenAI-style API endpoints.

### LLM API Endpoint
POST http://localhost:5001/v1/chat/completions

Make sure to launch it with:
```bash
python server.py --model mistral-7b-instruct-v0.2.Q4_K_M.gguf --api --nowebui --extensions openai --api-port 5001
```

---

## 🧠 Counterfeit Product Detection (In Progress)

We’re building a dedicated counterfeit detection module that:
- Analyzes product image (from Cloudinary)
- Uses metadata like title, brand, and description
- Leverages a pre-trained ResNet model for classification
- Returns result: Counterfeit or Genuine + confidence score

## 🛠️ Tech Stack

| Layer        | Technologies                                     |
|--------------|--------------------------------------------------|
| Frontend     | React.js                                         |
| Backend      | Node.js, Express.js                              |
| Database     | MongoDB, Mongoose                                |
| AI Modules   | ResNet-50, DistilBERT, Isolation Forest (planned)|
| LLM Engine   | Mistral-7B via llama.cpp (OpenAI-compatible API) |

---

## 🗂️ Project Structure

```bash
trustnet-ai/
├── backend/               # Express backend
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── docs/ 
│   └── HackOn_Presentation.pdf
├── public/                # Frontend static assets
├── src/                   # React frontend source
├── .gitignore
├── package.json
└── README.md
```

## 🌐 Local Setup Instructions (Basic)

### Clone the repo-
git clone https://github.com/Nayan172005/trustnet-ai.git
cd trustnet-ai

### Install backend dependencies-
cd backend
npm install

### Install frontend dependencies-
cd ../
npm install

### Start MongoDB (if local)-
mongod

### Start LLM server (if mistral-7b is locally served)-
python server.py --model mistral-7b-instruct-v0.2.Q4_K_M.gguf --api --nowebui --extensions openai --api-port 5001

### Start backend-
cd backend
node server.js

### Start frontend-
cd ../
npm start
