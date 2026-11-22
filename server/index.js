import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, isAdminEmail } from './db.js';
import { generateSolarAIResponse } from './aiBrain.js';
import { sendOtpEmail, isValidEmail } from './mailer.js';
import { canAccessSystem, configureAuth, createSession, requireAdmin, requireAuth, revokeSession } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

dotenv.config();
configureAuth(() => db.data.users, (user) => isAdminEmail(user.email));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend build if available
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Helper: Password complexity validation
function validatePasswordComplexity(pw) {
  if (!pw || typeof pw !== 'string' || pw.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}

// ==========================================
// 1. AUTHENTICATION & REGISTRATION ENDPOINTS
// ==========================================

// Screen A: Check if Email Already Exists
app.post('/api/auth/check-email', (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.json({ exists: false, valid: false });
  }
  const cleanEmail = email.toLowerCase().trim();
  const existingUser = db.findUserByEmail(cleanEmail);
  res.json({
    exists: !!existingUser,
    valid: true,
    email: cleanEmail
  });
});

// Screen A: Send Verification Code to User's Real Gmail/Email
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_EMAIL',
      message: 'Please provide a valid email address.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  // If user is already registered, reject immediately
  const existingUser = db.findUserByEmail(cleanEmail);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      errorCode: 'EMAIL_ALREADY_EXISTS',
      message: 'This email is already registered. Please login instead.'
    });
  }

  // Generate secure 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.saveVerificationCode(cleanEmail, code);

  // Send real email via Nodemailer
  const mailResult = await sendOtpEmail(cleanEmail, code, 'signup');

  res.json({
    success: true,
    mailDelivered: mailResult.delivered,
    message: `Verification code sent to ${cleanEmail}. Please check your Gmail inbox or spam folder.`,
    email: cleanEmail,
    expiresIn: '10 minutes'
  });
});

// Screen B: Verify Email Code
app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email address and 6-digit verification code are required.'
    });
  }

  const result = db.verifyCode(email, code);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: 'Email address verified successfully.',
    verifiedEmail: email.toLowerCase().trim()
  });
});

// Screen C: Create Password & Register User
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, preferredLanguage } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email and password are required.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Password requirements check
  if (!validatePasswordComplexity(password)) {
    return res.status(400).json({
      success: false,
      errorCode: 'PASSWORD_COMPLEXITY_FAILED',
      message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    });
  }

  // Strict rule: check if email was verified in Screen B
  if (!db.isEmailVerified(cleanEmail)) {
    return res.status(403).json({
      success: false,
      errorCode: 'EMAIL_NOT_VERIFIED',
      message: 'Email verification is required before setting password.'
    });
  }

  // Check if account already exists
  if (db.findUserByEmail(cleanEmail)) {
    return res.status(409).json({
      success: false,
      errorCode: 'EMAIL_ALREADY_EXISTS',
      message: 'An account already exists with this email address. Please login instead.'
    });
  }

  try {
    const newUser = db.createUser({ email: cleanEmail, password, name, preferredLanguage });
    res.status(201).json({
      success: true,
      message: 'Account created successfully in SolarCare.',
      token: createSession(newUser),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        preferredLanguage: newUser.preferredLanguage || 'en',
        createdAt: newUser.createdAt,
        role: isAdminEmail(cleanEmail) ? 'admin' : 'customer'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Screen D: Login
// Critical requirement: If account not found in DB -> return clear 404 error
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email and password are required.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = db.findUserByEmail(cleanEmail);

  // 1. Account not found check
  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: 'ACCOUNT_NOT_FOUND',
      message: 'No account found for this email address. Please sign up first.'
    });
  }

  // 2. Password mismatch check
  if (user.passwordHash !== password) {
    return res.status(401).json({
      success: false,
      errorCode: 'INVALID_CREDENTIALS',
      message: 'Incorrect password. Please verify your credentials or reset your password.'
    });
  }

  // 3. Successful login
  const isAdmin = isAdminEmail(cleanEmail);
  res.json({
    success: true,
    message: 'Login successful.',
    token: createSession(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt,
      role: isAdmin ? 'admin' : 'customer'
    }
  });
});

app.get('/api/auth/session', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  revokeSession(req.sessionToken);
  res.json({ success: true });
});

// Screen E: Forgot Password - Send recovery code to User's Gmail
app.post('/api/auth/forgot-password/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_EMAIL',
      message: 'Please provide a valid email address.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = db.findUserByEmail(cleanEmail);
  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: 'ACCOUNT_NOT_FOUND',
      message: 'No account registered with this email address.'
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.saveVerificationCode(cleanEmail, code);

  // Send real email via Nodemailer
  const mailResult = await sendOtpEmail(cleanEmail, code, 'forgot');

  // Do NOT return code to frontend
  res.json({
    success: true,
    mailDelivered: mailResult.delivered,
    message: `Password recovery code sent to ${cleanEmail}. Please check your Gmail inbox or spam folder.`,
    email: cleanEmail
  });
});

// Screen E: Forgot Password - Verify Recovery Code
app.post('/api/auth/forgot-password/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email and 6-digit code are required.'
    });
  }

  const verification = db.verifyCode(email, code);
  if (!verification.success) {
    return res.status(400).json(verification);
  }

  res.json({ success: true, message: 'Recovery code verified successfully.' });
});

// Screen E: Forgot Password - Reset Password
app.post('/api/auth/forgot-password/reset', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email, code, and new password are required.'
    });
  }

  if (!validatePasswordComplexity(newPassword)) {
    return res.status(400).json({
      success: false,
      errorCode: 'PASSWORD_COMPLEXITY_FAILED',
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
    });
  }

  const verification = db.verifyCode(email, code);
  if (!verification.success) {
    return res.status(400).json(verification);
  }

  try {
    db.updatePassword(email, newPassword);
    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. SOLAR SYSTEMS ENDPOINTS (USER-SPECIFIC)
// ==========================================

// Solar system access is scoped to the identity established by the server session.
app.get('/api/systems', requireAuth, (req, res) => {
  const systems = db.getSolarSystemsForUser(req.user.id);
  res.json({ success: true, systems });
});

// Add a new solar system for user
app.post('/api/systems', requireAuth, (req, res) => {
  const { name, location, capacityKw, inverterBrand, inverterModel, installationDate, panelCount, panelType, batteryCapacityKwh } = req.body;
  const parsedCapacity = Number(capacityKw);
  if (typeof name !== 'string' || !name.trim()
    || typeof location !== 'string' || !location.trim()
    || !Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
    return res.status(400).json({ success: false, message: 'System name, location, and a valid capacity are required.' });
  }

  const newSystem = db.addSolarSystem({
    userId: req.user.id,
    name: name.trim(),
    location: location.trim(),
    capacityKw: parsedCapacity,
    inverterBrand: typeof inverterBrand === 'string' ? inverterBrand.trim() : '',
    connectionMethod: 'Not connected',
    inverterModel: typeof inverterModel === 'string' ? inverterModel.trim() : '',
    installationDate: typeof installationDate === 'string' ? installationDate : '',
    panelCount: Number.isFinite(Number(panelCount)) ? Number(panelCount) : 0,
    panelType: typeof panelType === 'string' ? panelType : '',
    batteryCapacityKwh: Number.isFinite(Number(batteryCapacityKwh)) ? Number(batteryCapacityKwh) : 0,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, message: 'Solar system added successfully.', system: newSystem });
});

// Update solar system
app.put('/api/systems/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const sys = db.data.solarSystems.find(s => s.id === id);
  if (!sys || !canAccessSystem(req.user, sys)) {
    return res.status(404).json({ success: false, message: 'Solar system not found.' });
  }
  const allowedFields = ['name', 'location', 'capacityKw', 'inverterBrand', 'inverterModel', 'installationDate', 'panelCount', 'panelType', 'batteryCapacityKwh'];
  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) sys[field] = req.body[field];
  }
  db.save();
  res.json({ success: true, message: 'Solar system updated.', system: sys });
});

// Delete solar system
app.delete('/api/systems/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const existing = db.data.solarSystems.find(s => s.id === id);
  if (!existing || !canAccessSystem(req.user, existing)) {
    return res.status(404).json({ success: false, message: 'Solar system not found.' });
  }
  db.data.solarSystems = db.data.solarSystems.filter(s => s.id !== id);
  db.save();
  res.json({ success: true, message: 'Solar system deleted.' });
});

app.get('/api/admin/systems', requireAuth, requireAdmin, (req, res) => {
  const usersById = new Map(db.data.users.map((user) => [user.id, user]));
  const systems = db.data.solarSystems.map((system) => {
    const owner = usersById.get(system.userId);
    return {
      ...system,
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
    };
  });
  res.json({
    success: true,
    systems,
  });
});

// ==========================================
// 3. SERVICE REQUESTS ENDPOINTS
// ==========================================

app.get('/api/requests/user/:userId', (req, res) => {
  const { userId } = req.params;
  const requests = db.getServiceRequestsForUser(userId);
  res.json({ success: true, requests });
});

app.post('/api/requests', (req, res) => {
  const newReq = db.addServiceRequest(req.body);
  res.status(201).json({ success: true, request: newReq });
});

app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const updated = db.updateServiceRequestStatus(id, status, note);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }
  res.json({ success: true, request: updated });
});

// ==========================================
// 4. DATABASE MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/database/overview', requireAuth, requireAdmin, (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: db.data.users.length,
      totalSolarSystems: db.data.solarSystems.length,
      totalServiceRequests: db.data.serviceRequests.length,
      registeredEmails: db.data.users.map(u => ({ email: u.email, name: u.name, createdAt: u.createdAt })),
    },
    raw: {
      users: db.data.users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt })),
      systemsCount: db.data.solarSystems.length,
      requestsCount: db.data.serviceRequests.length,
    }
  });
});

app.post('/api/database/reset', requireAuth, requireAdmin, (req, res) => {
  db.resetDatabase();
  res.json({ success: true, message: 'Database reset to default seed records successfully.' });
});

// ==========================================
// 5. SOLAR ASSISTANT CHATBOT AI ENDPOINT
// ==========================================

app.post('/api/chat', (req, res) => {
  const { query, language } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ success: false, message: 'Query cannot be empty.' });
  }

  const aiResult = generateSolarAIResponse(query, language);
  res.json({
    success: true,
    reply: aiResult.reply,
    suggestions: aiResult.suggestions || [],
    isWarning: !!aiResult.isWarning
  });
});

// SPA Fallback: Serve frontend index.html for any GET route not starting with /api (Express 5 compatible)
if (fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Global Exception Handler Middleware
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error occurred.' });
});

// Start Express Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n================================================================`);
  console.log(`☀️  SolarCare Server is RUNNING & READY!`);
  console.log(`🌐 Dashboard URL: http://localhost:${PORT}  (or http://127.0.0.1:${PORT})`);
  console.log(`🔌 API Health:   http://localhost:${PORT}/api/health`);
  console.log(`================================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[PORT ERROR] Port ${PORT} is already in use by another application!`);
    console.error(`Please close any existing Node processes or specify another port: PORT=5001 node server/index.js\n`);
  } else {
    console.error(`[SERVER ERROR]`, err);
  }
});
