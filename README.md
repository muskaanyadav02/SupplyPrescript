# 🚚 SupplyPrescript
### AI-Powered Predictive & Prescriptive Supply Chain Optimization System

## 📌 Project Overview

SupplyPrescript is an AI-driven supply chain optimization platform developed as an internship team project. It predicts potential shipment disruptions using Machine Learning and recommends optimal actions using Prescriptive Analytics to minimize delays, costs, and operational risks.

The system combines Machine Learning, Optimization Techniques, FastAPI, React, and Data Visualization to provide intelligent decision support for supply chain management.

---

## 🚀 Features

- 📦 Shipment Monitoring
- 🤖 Delay Prediction using XGBoost
- 📊 Interactive Analytics Dashboard
- ⚙️ Prescriptive Decision Optimization using PuLP
- 📈 Business KPIs and Performance Analytics
- 🔗 REST API using FastAPI
- 💾 SQLite Database Integration
- 🎨 Modern React Dashboard

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- SQLite
- Pandas
- XGBoost
- PuLP

### Frontend
- React.js
- Vite
- JavaScript (ES6)
- Recharts
- Papa Parse
- Tailwind CSS

### Database
- SQLite

### Tools
- Git & GitHub
- VS Code
- Jupyter Notebook

---

## 📂 Project Structure

```
SupplyPrescript/
│
├── frontend/              # React Dashboard
├── src/
│   ├── backend/           # FastAPI Backend
│   ├── database/          # SQLite Database
│   ├── models/            # ML Models
│   ├── optimization/      # Prescriptive Analytics
│   └── notebooks/         # Data Analysis & Model Training
│
├── requirements.txt
└── README.md
```

---

## 👥 Team Members & Contributions

| Team Member | Role | Contribution |
|-------------|------|--------------|
| **Muskaan Yadav** | Team Leader & Machine Learning Engineer | Led project development, performed data preprocessing, feature engineering, trained XGBoost prediction model, managed GitHub repository, and coordinated the team. |
| **Suraj Narayan** | Data Engineer | Built the ETL pipeline, cleaned and transformed the dataset, managed data ingestion, and prepared data for machine learning. |
| **Rahul IDiga** | Frontend Developer | Developed the React dashboard, designed the user interface, implemented interactive charts using Recharts, integrated frontend components, and improved dashboard responsiveness. |
| **Asby Eldhose Shibu** | Backend Engineer | Assisted in backend development, API implementation, database integration, and server-side functionality. |
| **Sruthy S Nair** | **Optimization Engineer** | Developed the prescriptive optimization model using PuLP, implemented cost and time optimization, generated optimal shipment recommendations, and assisted in integrating optimization with the backend APIs. |

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/muskaanyadav02/SupplyPrescript.git
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## ▶️ Run Backend

```bash
cd src/backend
python -m uvicorn main:app --reload
```

Backend API:

```
http://127.0.0.1:8000


---

## ▶️ Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

## 📊 Machine Learning Model

- Algorithm: XGBoost Classifier
- Task: Shipment Delay Prediction
- Output:
  - Delay Probability
  - Estimated Delay (Days)

---

## 🎯 Future Improvements

- Deploy on Cloud
- User Authentication
- Live Shipment Tracking
- Real-Time Data Integration
- Advanced Business Intelligence Dashboard

---

## 📜 Internship Project

This project was developed as part of an internship program to demonstrate practical implementation of:

- Machine Learning
- Predictive Analytics
- Prescriptive Analytics
- Backend Development
- Frontend Dashboard Development
- Team Collaboration using Git & GitHub

---

## 📄 License

This project is developed for educational and internship purposes.