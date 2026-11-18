# ☀️ SolarCare - Comprehensive Project Documentation & Technical Audit Report
**Project Name:** SolarCare (Smart Solar Performance & Telemetry Platform)  
**Document Purpose:** Complete System Overview, Architecture, Implemented Work, Technical Drawbacks, and Discussion Points for Senior Developers & Academic Supervisors  
**Date:** November 2026  
**Status:** Functional Prototype / Full-Stack Platform (Alpha Release)

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Target Audience & Use Cases](#2-target-audience--use-cases)
3. [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
4. [Implemented Modules & Functional Specifications](#4-implemented-modules--functional-specifications)
   - 4.1 Authentication, Real Gmail OTP & Security Flow
   - 4.2 Zero-Dummy-Data User Onboarding
   - 4.3 Solar Physics & Dynamic Telemetry Engine
   - 4.4 Diagnostic & Automated Alerting Engine
   - 4.5 Maintenance Hub & Local Technician Directory
   - 4.6 Trilingual Internationalization (EN / Roman Urdu / Urdu Nastaliq RTL)
   - 4.7 Domain-Specific Solar AI Assistant (SolarCare Brain)
5. [Current Technical Drawbacks & Architectural Limitations (Audit)](#5-current-technical-drawbacks--architectural-limitations-audit)
6. [Discussion Points & Questions for Senior Developers / Supervisors](#6-discussion-points--questions-for-senior-developers--supervisors)
7. [Recommended Future Roadmap & Enhancement Plan](#7-recommended-future-roadmap--enhancement-plan)
8. [Local Deployment & Verification Guide](#8-local-deployment--verification-guide)

---

## 1. Executive Summary & Problem Statement

### The Problem in the Solar Industry:
In Pakistan and many emerging solar markets, rooftop solar installations (residential 5kW–20kW and commercial 25kW–100kW+) have expanded rapidly. However, owners face several recurring issues after installation:
1. **Lack of Transparent Telemetry:** Homeowners rely on fragmented inverter apps (Huawei FusionSolar, Growatt ShinePhone, Inverex, Sungrow) that often provide confusing graphs, incorrect currency calculations, or no localized advice.
2. **Undetected Performance Degradation:** Dust accumulation (soiling), shading from newly built neighboring structures, faulty DC strings, or grid voltage fluctuations reduce generation by 15%–35% without the owner ever knowing.
3. **No Centralized After-Sales Maintenance:** When inverters trip or panels require cleaning/servicing, users cannot easily connect with vetted, certified solar technicians.
4. **Language & Usability Barrier:** Most existing platforms are exclusively in technical English, ignoring users who prefer Roman Urdu or traditional Urdu.

### The SolarCare Solution:
**SolarCare** is a unified, user-centric solar telemetry and maintenance platform. It provides:
- Live and historical generation tracking based on actual installed hardware specifications.
- Intelligent diagnostics that flag soiling, inverter clipping, and grid drops.
- A full-lifecycle service hub connecting homeowners to local verified technicians.
- Strict security verification via real 6-digit Gmail OTP codes.
- Complete trilingual support (English, Roman Urdu, and Urdu Nastaliq with native RTL).

---

## 2. Target Audience & Use Cases

| Stakeholder | Use Case |
| :--- | :--- |
| **Residential Solar Homeowners** | Monitor daily yield (kWh), detect dust buildup, verify net-metering export, book technician cleaning. |
| **Commercial / Agricultural Operators** | Monitor multi-string installations (10kW–50kW+), track battery state of charge (SoC), monitor CO₂ savings. |
| **Solar Installers & EPC Companies** | Provide after-sales diagnostic access to clients, reduce false service calls via automated pre-diagnostics. |
| **Solar Technicians / Service Engineers** | Receive verified service requests, view historical plant performance to diagnose faults before site visits. |

---

## 3. System Architecture & Technology Stack

```
+---------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                   |
|   React 19 + TypeScript + Tailwind CSS + Lucide Icons + Vite 5 (Port: 5000)     |
|   - Trilingual UI (English / Roman Urdu / Urdu Nastaliq RTL)                    |
|   - Real-time Formula Calculation Engine & SVG Data Visualizations              |
+---------------------------------------------------------------------------------+
                                      |
                         REST API Requests (Fetch / JSON)
                                      |
                                      v
+---------------------------------------------------------------------------------+
|                               BACKEND SERVER                                    |
|                     Node.js (v20+) + Express 5 (Port: 5000)                     |
|                                                                                 |
|  [routes/endpoints]                                                             |
|  ├── /api/auth/*         -> Email Validation, OTP Generation, Passwords, Login |
|  ├── /api/systems/*      -> Solar System Specifications CRUD                   |
|  ├── /api/requests/*     -> Service Requests & Maintenance Status Workflow     |
|  └── /api/ai/query       -> Solar Diagnostic & Rules Assistant                  |
+---------------------------------------------------------------------------------+
           |                                                      |
           v                                                      v
+-----------------------+                              +-----------------------+
|    FILE-BASED DB      |                              |     NODEMAILER        |
|  solarcare_db.json    |                              |   Gmail SMTP Transport|
|  - Users              |                              |   - 16-Char Google    |
|  - Verification Codes |                              |     App Password      |
|  - Solar Plants Specs |                              |   - Real 6-Digit OTP  |
|  - Service Requests   |                              |     HTML Delivery     |
+-----------------------+                              +-----------------------+
```

### Technology Matrix:
- **Frontend Core:** React 19, TypeScript (~6.0), Vite 5.
- **Styling:** Tailwind CSS 3.4, PostCSS, custom Urdu typography classes.
- **Iconography:** Lucide-React.
- **Backend API:** Node.js, Express 5.3, CORS, Dotenv.
- **Email Service:** Nodemailer (Gmail SMTP Service via Google App Passwords).
- **Data Persistence:** JSON-based persistent file database (`server/data/solarcare_db.json`).
- **Orchestration:** `start-platform.js` (Unified process launcher, automated build checking, health polling, Chrome auto-opener).

---

## 4. Implemented Modules & Functional Specifications

### 4.1 Authentication, Real Gmail OTP & Security Flow
- **Email Validation:** Rejects invalid syntaxes before dispatching requests.
- **Duplicate Account Prevention (`409 Conflict`):** If an email already exists during sign-up, the platform rejects it with an `EMAIL_ALREADY_EXISTS` code and surfaces a direct "Go to Login" action.
- **Real 6-Digit OTP Delivery via Gmail SMTP:**
  - Secure random 6-digit code generated server-side.
  - Formatted into a responsive HTML email with logo, expiry notice, and security warnings.
  - Sent through user-authenticated Google App Passwords directly to the user's Gmail inbox.
  - The security code is **never** revealed on the frontend browser DOM.
- **Password Strength Enforcement:**
  - Minimum 8 characters.
  - At least 1 uppercase letter (`A-Z`).
  - At least 1 lowercase letter (`a-z`).
  - At least 1 numerical digit (`0-9`).
  - At least 1 special symbol (`!@#$%^&*...`).
  - Matching password and confirmation fields.
  - Real-time interactive UI validation checklist.
- **Database-Backed Login (`404` / `401`):**
  - If email not registered: Returns `ACCOUNT_NOT_FOUND` (`404`) with a 1-click "Create Account (Sign Up)" button.
  - If password mismatch: Returns `INVALID_CREDENTIALS` (`401`).
- **Full 3-Step Forgot Password Flow:**
  - **Step 1:** Registered email entered -> Account existence verified -> 6-digit recovery OTP dispatched to Gmail.
  - **Step 2:** User submits 6-digit code -> Verified against server timestamp (10-minute expiry window) -> Option to "Resend Code" or "Change Email".
  - **Step 3:** Password Reset Screen -> User inputs new strong password -> Password updated in DB -> User redirected to Login with success banner.

### 4.2 Zero-Dummy-Data User Onboarding
- **Requirement Met:** Previously, new users saw pre-loaded dummy plants immediately after registration.
- **New Architecture:**
  - Any user with 0 registered solar systems is intercepted by `SolarSetupScreen`.
  - The user must enter their actual plant parameters:
    - Inverter Capacity (kW).
    - Location / City (Lahore, Karachi, Islamabad, etc.).
    - Inverter Brand (Huawei, Sungrow, Growatt, Inverex, Knox, Fronius, GoodWe, Solis, etc.) and Model.
    - Panel Count & Rating (e.g. 585W N-Type TOPCon, 550W Bifacial).
    - Battery Storage (Lithium LiFePO4, Tubular, or On-Grid Net Metering Only).
    - Telemetry connection type (WiFi Datalogger, 4G IoT, RS485 Modbus).
  - Once saved, all dashboard metrics are dynamically computed according to the user's specific capacity.

### 4.3 Solar Physics & Dynamic Telemetry Engine
Located in `src/utils/solarCalculations.ts`:
- **Bell-Curve Hourly Generation Model:** Simulates diurnal solar irradiance based on peak sun hours (PSH), cloud attenuation factors, and ambient temperature derating.
- **Performance Ratio (PR) Calculation:**
  $$\text{PR} = \frac{\text{Actual Energy Generated (kWh)}}{\text{Expected Nameplate Energy (kWh)}} \times 100$$
- **CO₂ Offset & Green Savings:** Computed using standard grid emission factors ($~0.58\text{ kg CO}_2/\text{kWh}$ for regional grids).

### 4.4 Diagnostic & Automated Alerting Engine
Located in `src/utils/diagnosticEngine.ts`:
- **Soiling Loss Detection:** Compares expected clear-sky yield against actual yield; flags deviations $>12\%$ during consecutive sunny hours as dust/soiling accumulation.
- **Inverter Saturation / Clipping Warning:** Flags when DC input power exceeds inverter AC maximum rated capacity.
- **Grid Loss & Frequency Deviations:** Logs AC disconnect events and trips.
- **Severity-Tiered Alerts:** High (Red), Medium (Amber), Low (Blue), with Mark-as-Read and persistent storage.

### 4.5 Maintenance Hub & Local Technician Directory
- **Verified Technician Directory:** Database of accredited solar engineers categorized by city (Lahore, Karachi, Rawalpindi/Islamabad, Multan), certifications (PEC, Tier-1 OEM Certified), rating, and hourly rate.
- **End-to-End Service Booking:** Users select an issue category (Panel Cleaning, Inverter Error E01/F03, Net-Metering Inspection, Battery Calibration), choose date/time, and create a trackable service ticket.
- **Service Request Lifecycle:** `Requested` $\rightarrow$ `Accepted` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`.

### 4.6 Trilingual Internationalization (EN / Roman Urdu / Urdu Nastaliq)
- Dedicated translation files: `src/i18n/en.ts`, `src/i18n/urRoman.ts`, `src/i18n/ur.ts`.
- **Zero Language Mixing:** Completely purged mixed slash strings (e.g., `Email / ای میل`).
- **Urdu RTL Engine:** Automatically activates `dir="rtl"` and injects native Nastaliq font styling when Urdu is selected.
- Persistent language preference stored in `localStorage` and synced with user database profiles.

### 4.7 Domain-Specific Solar AI Assistant (SolarCare Brain)
Located in `server/aiBrain.js`:
- Knowledge base tailored to local solar hardware and regulations:
  - Troubleshooting Huawei SUN2000 alarm codes, Growatt grid loss, Inverex fault codes.
  - Explanations of NEPRA bidirectional net-metering tariffs, off-peak/peak unit off-setting.
  - Battery DoD (Depth of Discharge) preservation guidelines for lithium and lead-acid banks.

---

## 5. Current Technical Drawbacks & Architectural Limitations (Audit)

*This section provides an objective technical critique to facilitate discussion with Senior Software Engineers and Academic Evaluators.*

```
+----------------------------------------------------------------------------------------------------+
|                                    TECHNICAL AUDIT MATRIX                                          |
+------------------------------+-------------------------------------+-------------------------------+
| COMPONENT                    | CURRENT IMPLEMENTATION              | PRODUCTION-GRADE TARGET       |
+------------------------------+-------------------------------------+-------------------------------+
| 1. Database Storage          | Single JSON file (solarcare_db.json)| PostgreSQL / MongoDB + Prisma |
| 2. Password Security         | Plain-string comparison             | Salted Bcrypt / Argon2 Hashing|
| 3. Session Management        | Client-side localStorage            | HTTP-Only Secure JWT Cookies  |
| 4. Verification Codes        | In-file JSON with manual timestamp  | Redis Cache with auto-TTL     |
| 5. Telemetry Source          | Mathematical algorithmic simulation | IoT Gateway (MQTT / Modbus)   |
| 6. API Rate Limiting         | Uncapped endpoint execution         | express-rate-limit            |
| 7. Concurrency / Clustering  | Single Node.js thread               | Docker Containers + Nginx PM2 |
+------------------------------+-------------------------------------+-------------------------------+
```

### Detailed Breakdown of Drawbacks:

#### 1. Database Concurrency & Data Integrity
- **Current Limitation:** Data is stored in a single flat file (`solarcare_db.json`) using Node's `fs.readFileSync` and `fs.writeFileSync`.
- **Risk:** High concurrent requests (e.g., 50 simultaneous users writing data) will cause race conditions, dirty writes, or JSON corruption because file I/O lacks atomic database locking and ACID transaction guarantees.
- **Senior Dev Feedback Question:** *"Should we migrate directly to PostgreSQL with Prisma ORM or a NoSQL solution like MongoDB?"*

#### 2. Password Hashing & Encryption
- **Current Limitation:** Passwords are currently stored as plain text or simple strings in the JSON file for prototype demonstration.
- **Risk:** In a production breach, plain passwords would be exposed.
- **Correction Needed:** Integrate `bcryptjs` or `argon2` with a salt round factor of 12 before writing any password to disk.

#### 3. Session Persistence & Token Security
- **Current Limitation:** Authentication state is stored in the browser's `localStorage` (`solarcare_user_session`).
- **Risk:** Sensitive user session data in `localStorage` is vulnerable to Cross-Site Scripting (XSS) attacks.
- **Correction Needed:** Implement signed JSON Web Tokens (JWT) stored inside `httpOnly`, `Secure`, `SameSite=Strict` cookies.

#### 4. Temporary OTP Storage Lifecycle
- **Current Limitation:** OTP verification codes reside in `solarcare_db.json` with an `expiresAt` integer check.
- **Risk:** Expired codes accumulate in the JSON file unless manually cleared on password updates.
- **Correction Needed:** Use an in-memory key-value store such as **Redis** with an automated TTL (Time-To-Live) of 600 seconds (`EX 600`), ensuring automated cleanup and sub-millisecond retrieval.

#### 5. Simulated Telemetry vs. Real Hardware Ingestion
- **Current Limitation:** The hourly solar curves are mathematically generated using solar radiation formulas.
- **Risk:** While perfect for UX evaluation, portfolio demos, and prototype testing, it is not receiving live telemetry from an RS485 or WiFi datalogger.
- **Correction Needed:** Introduce an **IoT Telemetry Gateway** (MQTT broker or Modbus TCP bridge) to accept real inverter packets.

#### 6. Missing API Rate Limiting & DoS Protection
- **Current Limitation:** `/api/auth/send-code` and `/api/auth/login` have no rate limits.
- **Risk:** A malicious actor could script requests to spam the Gmail SMTP server, exhausting Google's daily sending quotas or attempting brute-force password attacks.
- **Correction Needed:** Add `express-rate-limit` allowing a maximum of 3 OTP requests per IP per 10 minutes.

---

## 6. Discussion Points & Questions for Senior Developers / Supervisors

When presenting this document to your teachers or senior developers, use these structured questions to lead the discussion:

### Architectural Questions:
1. **Database Selection:**
   > *"Given that solar installations generate time-series telemetry (power readings every 5–15 minutes) alongside relational business data (users, service requests, invoices), would you recommend a hybrid architecture (PostgreSQL for relations + TimescaleDB/InfluxDB for telemetry), or is a pure relational database sufficient?"*

2. **Hardware Telemetry Ingestion:**
   > *"For connecting real rooftop inverters (like Huawei or Growatt) in our region, what is the most reliable architecture: direct RS485 to an ESP32/Raspberry Pi MQTT gateway, or polling manufacturer cloud APIs (e.g. Huawei FusionSolar OpenAPI) via backend cron jobs?"*

3. **Authentication Hardening:**
   > *"What is your preferred authentication setup for an enterprise dashboard: Custom JWT with access & refresh tokens via HTTP-only cookies, or an identity service like Supabase / Firebase Auth / NextAuth?"*

4. **Service Dispatch Workflow:**
   > *"In our technician booking module, how should we handle real-time status updates (e.g. technician en-route, work started)? Would you recommend WebSockets (Socket.io) or Server-Sent Events (SSE)?"*

5. **Deployment & DevOps Strategy:**
   > *"To deploy this platform for 1,000+ pilot homes, should we containerize with Docker Compose (Node backend + PostgreSQL + Redis + Nginx) on a single VPS (DigitalOcean/Linode), or use serverless architectures (Vercel + Supabase)?"*

---

## 7. Recommended Future Roadmap & Enhancement Plan

```
====================================================================================
                              ROADMAP & MILESTONES
====================================================================================

PHASE 1: Security & Database Hardening (Weeks 1 - 3)
├── [ ] Implement Bcrypt password hashing (12 salt rounds)
├── [ ] Implement JWT Authentication with HTTP-Only cookies
├── [ ] Implement express-rate-limit on all /api/auth/* endpoints
└── [ ] Migrate from solarcare_db.json to PostgreSQL via Prisma ORM

PHASE 2: Real Telemetry & IoT Integration (Weeks 4 - 7)
├── [ ] Build MQTT Broker (Mosquitto/Aedes) for IoT Inverter Dataloggers
├── [ ] Support Modbus RTU/TCP parsing for Huawei, Growatt & Inverex
├── [ ] Store 5-minute production time-series in TimescaleDB
└── [ ] Add Automated PDF Energy & Net-Metering Billing Export

PHASE 3: Mobile App & Commercialization (Weeks 8 - 12)
├── [ ] Native Android/iOS App using React Native / Expo
├── [ ] Push Notifications for critical inverter fault codes (Firebase FCM)
├── [ ] Payment Gateway Integration (Stripe / JazzCash / EasyPaisa) for Technician Bookings
└── [ ] Multi-tenant portal for Solar Installers (managing 100+ customer plants)
====================================================================================
```

---

## 8. Local Deployment & Verification Guide

### Quick Start (One-Click):
Double-click **`run.bat`** or **`start.bat`** in the project root directory.

### Manual Terminal Commands:
```bash
# 1. Install dependencies
npm install

# 2. Compile production frontend bundle
npm run build

# 3. Configure environment variables in .env
# Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set for real email delivery

# 4. Start Unified Backend & Frontend Host
node server/index.js

# 5. Access via Browser
http://localhost:5000
```

---

*This document was prepared to serve as a comprehensive technical dossier for architectural reviews, academic grading, and technical mentoring sessions.*

