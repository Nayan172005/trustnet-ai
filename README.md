# 🛡️ TrustNet (In Progress)

**TrustNet** is a full-stack AI-powered platform built to ensure product authenticity, detect fake reviews, and flag anomalies across the product lifecycle. Currently under active development, this system is designed to assist marketplaces in maintaining trust and safety at scale.

---

## 🧠 Project Background

TrustNet was originally conceptualized for **HackOn with Amazon - Season 5** under the theme **"AI-Powered Trust & Safety Platform."** Although it was not shortlisted for the next round, this repository reflects my ongoing effort to build the platform independently for learning and portfolio development.

📎 [View HackOn Pitch Deck »](./docs/HackOn_Presentation.pdf)

---

## 🚧 Current Status

> This project is a work in progress.

- [x] Frontend–backend structure initialized
- [x] Basic API setup in Node.js and Express
- [x] MongoDB integration for product/review data
- [ ] Counterfeit detection module (ResNet + product metadata)
- [ ] Review classification via LLM API (Mistral → Zephyr planned)
- [ ] Timeline anomaly detection (Isolation Forest)
- [ ] Moderator/admin dashboard

---

## 🛠️ Tech Stack (Planned)

| Layer        | Technologies                          |
|--------------|----------------------------------------|
| Frontend     | React.js                               |
| Backend      | Node.js, Express.js                    |
| Database     | MongoDB + Mongoose                     |
| AI Models    | ResNet-50, DistilBERT, Isolation Forest|
| LLM          | Local Zephyr (planned), Stream API     |

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
