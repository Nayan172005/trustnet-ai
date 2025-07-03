# 🛡️ TrustNet (In Progress)

**TrustNet** is a full-stack AI-powered platform built to ensure product authenticity, detect fake reviews, and flag anomalies across the product lifecycle. Currently under active development, this system is designed to assist marketplaces in maintaining trust and safety at scale.

---

## 🧠 Project Background

TrustNet was originally conceptualized for **HackOn with Amazon - Season 5** under the theme **"AI-Powered Trust & Safety Platform."** Although it was not shortlisted for the next round, this repository reflects my ongoing effort to build the platform independently for learning and portfolio development.

📎 [View HackOn Pitch Deck »](./docs/HackOn_Presentation.pdf)

---

## 🚧 Current Status

> This project is a work in progress. Below is a breakdown of completed and pending modules.

- [x] Frontend–backend structure initialized
- [x] Basic API setup in Node.js and Express
- [x] MongoDB integration for product/review data
- [x] 🔗 Mistral-7B LLM integration (for fake review detection)
- [ ] 🧠 Counterfeit detection module (ResNet + product metadata)
- [ ] 📈 Timeline anomaly detection (Isolation Forest)
- [ ] 🧑‍💻 Moderator/admin dashboard with filtering
- [ ] 🔖 Badge-based UI flagging for fake reviews

---

## 🤖 LLM Integration

This project uses the **`mistral-7b-instruct-v0.2.Q4_K_M.gguf`** model for fake review classification, hosted locally using [`text-generation-webui`](https://github.com/oobabooga/text-generation-webui) with OpenAI-compatible API extensions.

The model analyzes reviews and responds with:
- `Classification`: Fake or Real  
- `Explanation`: Reasoning behind the decision

> 🔧 *The LLM layer is modular and can later be fine-tuned or swapped for models like Zephyr or custom-distilled variants.*

### 🔌 LLM Server Setup

We use [`text-generation-webui`](https://github.com/oobabooga/text-generation-webui) to serve the Mistral model via OpenAI-style API endpoints.

POST http://localhost:5001/v1/chat/completions

Make sure to launch it with:
```bash
python server.py --model mistral-7b-instruct-v0.2.Q4_K_M.gguf --api --nowebui --extensions openai --api-port 5001
```

---

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
│   ├── controllers/
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
