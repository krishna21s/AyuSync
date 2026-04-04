<div align="center">
  <img src="./frontend/public/logo.png" alt="AyuSync Logo" width="120" />
  <h1>🌿 AyuSync</h1>
  <p><strong>Your Ultimate AI-Powered Health & Medicine Companion</strong></p>
  <p>Providing seamless medication management, intelligent health predictions, and real-time alerts tailored for patients and caretakers.</p>
</div>

---

## 📖 Overview

**AyuSync** is a full-stack, AI-driven healthcare platform designed to simplify medication management and holistic wellness tracking. By leveraging advanced Large Language Models (LLM) through the Groq API, modern 3D visualizations, and automated WhatsApp alerts, AyuSync transforms complex medical routines into an intuitive, seamless daily experience.

Whether you're manually logging medications or relying on our automated prescription scanning, the platform absorbs your health data to generate intelligent routines, custom diet plans, and proactive health risk assessments.

## 🚀 Proposed Solution Architecture

The core philosophy of AyuSync revolves around simplifying inputs and maximizing intelligent outputs. 

![Proposed Solution Architecture](./frontend/public/placeholder.svg) *(Replace this placeholder link with your architecture diagram image if added to the repository)*

### The Flow:
1. **Intake Strategy**
   - **Manual Input:** Users can manually document their daily medications.
   - **Prescription Scan (OCR):** Upload a prescription image, and our system automatically retrieves the medical data.
2. **The Intelligence Core** 
   - Powered by **AI (Groq LLM / Llama 3.1)**, AyuSync processes the ingested medical data to understand pharmacological combinations, dosages, and user health profiles.
3. **Automated Outputs**
   - **Smart Routine:** Dynamically schedules your day based on medication timings.
   - **Smart Reminders:** Intelligent alerting system, including automated fallback WhatsApp messages to caretakers if doses are missed.
   - **Meal Planner:** AI-generated dietary recommendations specifically tailored to complement your ongoing medications (e.g., advising low-sodium diets or avoiding specific contraindicating foods).
   - **Workout Planner:** Personalized exercise suggestions to maintain mobility and heart health without overexertion.
   - **Health Risk Prediction:** Advanced predictive modeling that anticipates side-effects. Features a fully immersive **3D Organ Visualizer** mapping exactly which organs are targeted and which represent potential risk zones for every selected medicine.

---

## ✨ Key Features

- **Interactive 3D Pharmacological Visualizer:** View the effects of your medication mapped directly onto 3D anatomical models (Skeletal, Vascular, Visceral, Nervous systems) in real-time.
- **WhatsApp Fallback Alerting:** Deep integration with Twilio to automatically send alert messages to a designated caretaker if a patient forgets a critical dose.
- **AI Prescription Parser:** Optical Character Recognition (OCR) combined with LLM processing to effortlessly digitize handwritten or printed prescriptions.
- **Intelligent Analytics Dashboard:** Track medicine adherence, water intake routines, and view detailed analytical health reports.
- **Real-Time Generative Health Advice:** Need to know what yoga or diet fits your daily multivitamin and blood pressure medication? AyuSync's AI will generate it for you on the fly. 

---

## 🛠️ Tech Stack

### Frontend 💻
- **Framework:** React + Vite
- **Styling:** Tailwind CSS & Framer Motion (for fluid micro-animations and aesthetic UI)
- **3D Graphics:** React Three Fiber & `@react-three/drei`
- **Routing & State:** React Router DOM, React Query
- **Icons:** Lucide React

### Backend ⚙️
- **Framework:** FastAPI (Python)
- **Database:** SQLite with SQLAlchemy ORM
- **AI / LLM:** Groq API (Llama 3.1 8b instant model)
- **Task Scheduling:** APScheduler (for background CRON reminder jobs)
- **Messaging:** Twilio API (for WhatsApp integration)

---

## ⚙️ Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ayusync.git
cd ayusync
```

### 2. Backend Setup
Navigate to the backend directory and set up your Python environment.
```bash
cd backend
python -m venv .venv

# Activate virtual environment (Windows)
.venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with the following configuration:
```env
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite:///./healthai.db

# Groq API Configuration
GROQ_API_KEY_1=your_groq_api_key_here

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Run the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory.
```bash
cd frontend
npm install
```

Run the Vite development server:
```bash
npm run dev
```

The application should now be accessible at `http://localhost:8080/` (or whichever port Vite successfully binds to).
---
<div align="center">
  <p>Made with ❤️ to empower smarter, digital-first healthcare.</p>
</div>
