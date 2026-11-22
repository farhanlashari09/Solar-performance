# SolarCare — Solar Monitoring & Service Platform

SolarCare manages solar-system details and displays provider readings only after a verified connection. It does not generate production measurements from system capacity.

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

## Solar system setup and monitoring

System name, location, and capacity are required. Saving setup does not mark a system connected or create telemetry. Current production cards remain empty until a successful provider response; historical charts and diagnostics remain unavailable until dated provider history is supported.

Authenticated dashboards and registered-system cards show current weather and a five-day local forecast from Open-Meteo's free geocoding and forecast APIs. Weather requests use the required system location and show loading or unavailable states instead of estimated conditions.

### Administrator access

Administrator access is restricted server-side to `admin@solarcare.com`. No other account email receives the administrator role or administrator-only fleet/provider-linking permissions.

### Huawei FusionSolar setup

1. Enable Northbound API access for the Huawei account and use its HTTPS regional API host.
2. Set these **backend-only** environment variables before starting the Express server:
   ```env
   FUSIONSOLAR_BASE_URL=https://intl.fusionsolar.huawei.com
   FUSIONSOLAR_USERNAME=your-northbound-api-user
   FUSIONSOLAR_PASSWORD=your-northbound-api-password
   ```
   Use the region host and credentials issued for your account. Do not prefix these with `VITE_`, expose them to the browser, or commit actual values.
3. In the authenticated Admin Control Center, enter each Huawei installation’s station code and choose **Link**. A provider selection during system setup is only a request for integration; it does not connect the system.
4. Admins can refresh each linked station’s readings. Owners can see and refresh only their own systems. Status changes to connected only after FusionSolar returns supported measurements. Until configured and linked, the UI reports the exact disconnected/unconfigured state and shows no sample telemetry.

The current integration requests station real-time KPIs (`active_power`, `day_cap`, and `total_cap`) from the FusionSolar Northbound API. It does not fetch dated production history. The station mapping is managed by an authenticated administrator, and all provider credentials remain on the backend. Access tokens are server-issued, expire after 12 hours, and are held in server memory; restarting the backend requires users to sign in again.

### Other monitoring providers

The admin fleet lists Growatt ShineServer and SolisCloud as **not verified** and does not offer a connection or reading path for them. The public Growatt monitoring portal ([ShineServer](https://server.growatt.com/)) and SolisCloud portal ([SolisCloud](https://www.soliscloud.com/)) were accessible, but publicly available official developer documentation and no-cost API access terms could not be verified for either integration. This is not a claim that the vendors do not offer partner APIs; do not enter account credentials or rely on unofficial/reverse-engineered endpoints. A supported adapter can be enabled after the vendor confirms an official API, permitted use, access terms, and account eligibility. No other provider is represented as free without that confirmation.

The supplied monitoring-display image is illustrative only; its displayed metrics and status indicators are not connected to SolarCare data. The auth page labels the background image accordingly.

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
│   ├── auth.js                 # Server-issued sessions and access control
│   ├── fusionsolar.js          # Server-only Huawei Northbound API adapter
│   ├── aiBrain.js              # Multilingual Solar AI chatbot brain
│   ├── test/                   # Focused auth and provider tests
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
    │   ├── SolarContext.tsx                  # User-scoped systems and verified telemetry state
    │   ├── MaintenanceContext.tsx            # Service requests state
    │   └── LanguageContext.tsx               # English, Urdu, Roman Urdu switcher
    │
    ├── utils/
    │   └── diagnosticEngine.ts               # Rule-based evaluator for verified readings
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
