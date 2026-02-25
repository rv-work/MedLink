# 🏥 MedLink – AI-Powered Healthcare & Emergency System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)

**MedLink** is a highly scalable, AI-driven healthcare ecosystem designed to bridge the gap between patients, doctors, and emergency responders. It features a multi-step intelligent consultation system, dual-tier health record storage (Web2 + Web3), and a life-saving motion-triggered SOS pipeline equipped with biometric facial recognition.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#️-tech-stack)
- [Installation & Setup](#️-installation--setup)
- [Environment Variables](#-environment-variables)
- [License & Disclaimer](#️-license--disclaimer)

---

## 🚀 Key Features

### 🤖 Intelligent Medical Consultation

A multi-step RAG-based system that analyzes symptoms using an ML model, references the _"Gale Encyclopedia of Alternative Medicine"_ for trusted remedies, and falls back to verified web data via Gemini AI.

### 👨‍⚕️ Post-Treatment Doctor-Patient Sync

Converts medical prescriptions into automated daily to-do lists for patients. Patients log their progress, and doctors receive daily summary reports to adjust treatments dynamically.

### 📄 AI Report & Prescription Analyzer

A context-aware bot that helps users understand their medical reports and potential side effects of prescribed medicines, sharing a summary of the chat with their doctor for transparency.

### 🔐 Dual-Tier Health Records

Users can choose how to store their medical history:

- **Web2 Path:** AES-256 encrypted centralized storage for everyday users.
- **Web3 Path:** Premium, decentralized storage utilizing IPFS and Ethereum smart contracts for ultimate privacy and data ownership.

### 🚑 Motion-Triggered SOS System

Uses device accelerometers to detect sudden impacts. If the user is unresponsive for **10 seconds**, the system instantly dispatches live location alerts via Call, SMS, and WhatsApp (Twilio) to:

- Emergency contacts
- Nearby hospitals
- MedLink users within a **5 km radius**

### 👤 DeepFace Emergency Access

In critical situations where a patient is unconscious, doctors can scan the victim's face. Using **DeepFace** and **Qdrant** vector database, the system identifies the user and sends a 1-click approval link to family members to unlock the patient's medical history in **under 30 seconds**.

### 🩸 Blood Donation Network

A centralized real-time system to raise urgent blood requests and connect with eligible donors in the vicinity.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A["👤 React Client"] --> B["🟢 Node.js / Express API"]

    B --> C["🍃 MongoDB"]
    B --> D["📲 Twilio\n(Call/SMS/WhatsApp)"]
    B --> E["🔗 WebSockets\n(Real-time)"]
    B --> F["🔐 IPFS + Ethereum\n(Web3 Storage)"]

    A --> G["🧠 Flask ML Service\n(Disease Prediction)"]
    A --> H["👁️ FastAPI\n(Face Recognition)"]

    G --> I["📚 Pinecone\n(Medical RAG)"]
    G --> J["💎 Gemini AI\n+ LangChain"]

    H --> K["🔵 Qdrant\n(Face Embeddings)"]

    B --> G
    B --> H
```

### Data Flow — Emergency SOS Pipeline

```
📱 Device Accelerometer
        │
        ▼
⚡ Impact Detected
        │
        ▼
⏱️ 10 Second Countdown (No Response?)
        │
        ▼
📍 Fetch Live GPS Location
        │
   ┌────┴────┐
   ▼         ▼
📞 Call    💬 WhatsApp / SMS
   │              │
   ▼              ▼
Emergency     Emergency
Contacts      Contacts
   │
   ▼
🏥 Nearby Hospitals
```

### Data Flow — DeepFace Identity Pipeline

```
📷 Doctor Scans Patient Face
        │
        ▼
🧬 DeepFace → Generate Face Embedding
        │
        ▼
🔵 Qdrant Vector DB → Match Identity
        │
        ▼
📲 Send 1-Click Approval Link to Family
        │
        ▼
✅ Medical History Unlocked (< 30 seconds)
```

---

## 🛠️ Tech Stack

### Frontend

| Technology   | Purpose          |
| ------------ | ---------------- |
| React.js     | UI Framework     |
| Tailwind CSS | Styling          |
| Context API  | State Management |

### Backend (Core Services)

| Technology           | Purpose                      |
| -------------------- | ---------------------------- |
| Node.js + Express.js | Core API Server              |
| MongoDB (Mongoose)   | Primary Database             |
| Twilio API           | Call / SMS / WhatsApp Alerts |

### AI, Machine Learning & Biometrics

| Technology       | Purpose                               |
| ---------------- | ------------------------------------- |
| Flask (Python)   | ML Disease Prediction API             |
| FastAPI (Python) | Face Recognition API                  |
| DeepFace         | Biometric Face Identification         |
| Google Gemini    | LLM for Fallback Consultation         |
| LangChain        | LLM Orchestration & RAG Pipeline      |
| Pinecone         | Vector DB for Medical Documents (RAG) |
| Qdrant           | Vector DB for Face Embeddings         |

### Blockchain & Decentralized Storage

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Ethereum   | Blockchain Network           |
| IPFS       | Decentralized File Storage   |
| Solidity   | Smart Contract Language      |
| Hardhat    | Smart Contract Dev & Testing |

---

## ⚙️ Installation & Setup

Follow these steps to run the MedLink ecosystem locally. You will need **multiple terminals** to run all microservices simultaneously.

### Prerequisites

- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas)
- MetaMask / Hardhat Node (for Web3 features)

---

### 1. Clone the Repository

```bash
git clone https://github.com/rv-work/MedLink.git
cd MedLink
```

---

### 2. Setup Node.js Backend (Core API)

```bash
cd server
npm install
npm run dev
```

> Runs on `http://localhost:5000`

---

### 3. Setup Frontend (React Client)

```bash
cd client
npm install
npm run dev
```

> Runs on `http://localhost:5173`

---

### 4. Setup Face Recognition API (FastAPI)

```bash
cd face-service
pip install -r requirements.txt
uvicorn main:app --reload
```

> Runs on `http://localhost:5001`

---

### 5. Setup ML Prediction API (Flask)

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

> Runs on `http://localhost:5002`

---

### 6. Deploy Smart Contracts (Optional – Web3 Features)

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🔑 Environment Variables

Create `.env` files in the respective directories and populate the following keys:

### Node.js Backend — `server/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
WEB3_STORAGE_TOKEN=your_ipfs_token
JWT_SECRET=your_jwt_secret
```

### AI & Python Services — `face-service/.env` & `ml-service/.env`

```env
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENV=your_pinecone_environment
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_api_key
```

> 💡 You can copy `.env.example` files from each directory as a starting point.

## 🛡️ License & Disclaimer

This project is built for **educational and hackathon purposes**.

> ⚠️ The AI consultation features are designed to **assist and educate**, but do **not replace professional medical advice**. Always consult a certified doctor for medical emergencies.

---

## 🤝 Contributors

Built with ❤️ for a better, smarter healthcare future.

---

<p align="center">
  <b>MedLink — Because Every Second Counts.</b>
</p>
