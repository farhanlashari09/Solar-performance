# SolarCare — Smart Solar Performance & Telemetry Platform

A complete, production-ready, full-stack solar energy monitoring and after-sales maintenance web application designed for personal use and multi-user deployments.

---

## 🚀 Ek Click Se Chalane Ka Tareeqa (How to Run with 1 Click)

Aap platform ko **sirf aik file run karke** poora chala sakte hain:

### Option 1 (Windows Users - Sab Se Aasan):
> **`run.bat`** ya **`start.bat`** par double-click karein!
> 
> Ye script khud:
> 1. Check karegi ke Node.js install hai ya nahi.
> 2. Pehli dafa dependencies (`npm install`) verify karegi.
> 3. Backend Express API server (`http://localhost:5000`) shuru karegi.
> 4. Frontend Vite development server (`http://localhost:5173`) launch karegi.
> 5. Aap ke browser me khud bakhud platform open kar degi!

### Option 2 (Terminal Command):
```bash
npm start
```
ya
```bash
node start-platform.js
```

---

## 📧 Gmail / Email Real Verification Setup (Asal Gmail Par Code Bhejna)

System me **Nodemailer** integrated hai jo user ke Gmail account par **6-digit security OTP code** bhejta hai (aur website ke screen par code show nahi hota taa-ke security barqarar rahe).

1. Apne folder me mojood **`.env`** file ko kisi bhi text editor (Notepad, VS Code) me open karein.
2. Apne Google Account me **2-Step Verification** enable karein.
3. [Google App Passwords](https://myaccount.google.com/apppasswords) par ja kar **16-character App Password** generate karein.
4. `.env` file me darj karein:
   ```env
   GMAIL_USER=apna_email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
5. *Note:* Agar `.env` me Gmail password na dala gaya ho, to system development ke liye terminal log me code dikhata hai, lekin **frontend par code kabhi display nahi hota**.

---

## 🛡️ Authentication & Verification Flow (Sign Up, Login, Forgot Password)

### 1. Sign Up (Naya Account Banana):
- **Email Validation:** User jo Gmail ya Email enter kare ga, system pehle us ka format verify kare ga.
- **Email OTP Dispatch:** Backend 6-digit random code generate karta hai aur user ke Gmail par email send karta hai.
- **Screen Par Code Nahi Dikhata:** Frontend par code nahi dikhaya jata; user ko apna Gmail Inbox ya Spam folder check karna hota hai.
- **Code Verification:** User email se 6-digit code dekh kar enter karta hai to backend use verify karta hai.
- **Strong Password Checklist:** Password kam az kam 8 characters, 1 bara harf (A-Z), 1 chota harf (a-z), 1 number (0-9), aur 1 special character (@, #, $, etc.) hona lazmi hai. Live visual checklist sath sath checkmark deti hai.

### 2. Login:
- Agar user aisi email darj kare jis par pehle account nahi bana, to foran error aata hai:
  `"Is email par koi account registered nahi hai. Barah-e-karam pehle Sign Up karein."`
- Agar password ghalat ho to clear notice aata hai.
- Sahi credentials par login ho kar session mehfooz ho jata hai.

### 3. Forgot Password (Password Reset):
- User apna registered Gmail enter karta hai.
- Agar account exist karta hai to us ke Gmail par 6-digit recovery code dispatch hota hai.
- Code verify hone ke baad user naya strong password set karta hai aur database me update ho jata hai.

---

## ☀️ New User Solar Setup (No Dummy Data!)

Jab naya user sign up kar ke pehli dafa login karta hai:
- Use **koi fake ya dummy dashboard data nahi dikhaya jata**.
- Screen par dedicated **Solar Plant Setup View** aati hai jo user se us ke solar system ki asal maloomat leti hai:
  - System Ka Naam (e.g. *Mera Ghar 10kW*)
  - Shehar / Location (e.g. *Lahore, Punjab*)
  - Inverter Capacity in kW (e.g. *5kW, 8kW, 10kW, 15kW, 20kW*)
  - Inverter Brand (Huawei, Sungrow, Growatt, Inverex, Knox, Fronius, GoodWe, Solis, etc.)
  - Solar Panel Count aur Panel Type (e.g. 585W N-Type TOPCon)
  - Telemetry Connection Type (WiFi Datalogger, Cloud, RS485)
  - Battery Storage (None, Lithium 48V, Tubular)
  - Installation Date
- Save karne ke baad, **Dashboard ki tamaam calculations (Daily production, Hourly curves, Monthly yield, Savings) us user ke enter kiye huway kW ke mutabiq dynamically calculate hoti hain!**

---

## 📁 File Structure & Organization

```
Solar performance/
├── run.bat                     # Windows 1-Click Launch Script (Recommended)
├── start.bat                   # Launcher alias
├── start-platform.js           # Multi-process orchestrator (Backend + Frontend)
├── .env                        # Gmail SMTP & server configuration
├── .env.example                # Configuration template
├── package.json                # Project dependencies & npm scripts
├── index.html                  # Main HTML entry point
│
├── server/                     # Backend API & Database Engine
│   ├── index.js                # Express REST API endpoints & route handlers
│   ├── mailer.js               # Nodemailer email dispatch service
│   ├── db.js                   # JSON-based database engine
│   ├── aiBrain.js              # Multilingual Solar AI chatbot brain
│   └── data/
│       └── solarcare_db.json   # Persistent database file
│
└── src/                        # Frontend React + TypeScript application
    ├── components/
    │   ├── auth/AuthFlow.tsx                 # Login, Sign Up, OTP, Forgot Password
    │   ├── onboarding/SolarSetupScreen.tsx   # Dedicated New User Solar Setup View
    │   ├── onboarding/OnboardingModal.tsx    # Additional system modal
    │   ├── dashboard/DashboardView.tsx       # Live production telemetry dashboard
    │   ├── performance/PerformanceView.tsx   # Diagnostic analysis & solar curves
    │   ├── systems/MySolarSystemsView.tsx    # Solar systems management
    │   ├── technicians/TechniciansView.tsx   # Verified technicians directory
    │   ├── maintenance/MaintenanceHub.tsx    # Booking & tracking service requests
    │   ├── alerts/AlertsView.tsx             # System alerts & notifications
    │   ├── assistant/SolarAssistantChatbot.tsx # Floating multilingual solar AI
    │   └── common/Header.tsx & Sidebar.tsx   # Navigation & language selector
    │
    ├── context/
    │   ├── AuthContext.tsx                   # User session & auth state
    │   ├── SolarContext.tsx                  # Dynamic solar system math & telemetry
    │   ├── MaintenanceContext.tsx            # Service requests state
    │   └── LanguageContext.tsx               # English, Urdu, Roman Urdu switcher
    │
    ├── utils/
    │   ├── solarCalculations.ts              # Mathematical models for solar curves
    │   └── diagnosticEngine.ts               # Rule-based diagnostic evaluator
    │
    └── services/
        └── api.ts                            # REST API communication client
```

---

## 🌐 Localization Languages
Aap header ke dropdown se language tabdeel kar sakte hain:
- **English (`en`)**
- **اردو (`ur`)** — Mukammal Right-to-Left (RTL) layout
- **Roman Urdu (`ur-roman`)** — Aasan guftagu wali Roman Urdu

---

## 🛑 Band Karne Ka Tareeqa (How to Stop)
Terminal ya Command Prompt window me **`Ctrl + C`** dabayein ya window ko close kar dein.
