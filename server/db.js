import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'solarcare_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Database seed
const initialSeed = {
  users: [
    {
      id: 'usr-001',
      name: 'Farhan khan',
      email: 'farhan@example.com',
      passwordHash: 'solar12345', // In production: bcrypt hash
      isVerified: true,
      preferredLanguage: 'en',
      createdAt: '2026-01-15T10:00:00Z',
      role: 'customer',
    },
    {
      id: 'usr-002',
      name: 'Admin SolarCare',
      email: 'admin@solarcare.com',
      passwordHash: 'admin12345',
      isVerified: true,
      preferredLanguage: 'en',
      createdAt: '2026-02-01T08:30:00Z',
      role: 'admin',
    }
  ],
  verificationCodes: {},
  solarSystems: [
    {
      id: 'sys-1',
      userId: 'usr-001',
      name: 'GreenHome 10kW Rooftop',
      location: 'Lahore, Punjab (DHA Phase 6)',
      capacityKw: 10.0,
      inverterBrand: 'Huawei',
      inverterModel: 'SUN2000-10KTL-M1',
      installationDate: '2023-04-15',
      connectionMethod: 'Huawei FusionSolar Cloud API',
      connectionStatus: 'connected',
      panelCount: 18,
      panelType: '585W Monofacial Tier-1 N-Type TOPCon',
    },
    {
      id: 'sys-2',
      userId: 'usr-001',
      name: 'Sunrise Farm 25kW Agrivoltaic',
      location: 'Multan, Punjab (Bosan Road)',
      capacityKw: 25.0,
      inverterBrand: 'Growatt',
      inverterModel: 'MAX 25KTL3-X',
      installationDate: '2022-11-20',
      connectionMethod: 'Growatt ShineServer API',
      connectionStatus: 'connected',
      panelCount: 46,
      panelType: '550W Bifacial Perc Panels',
    }
  ],
  serviceRequests: [
    {
      id: 'REQ-2026-8841',
      userId: 'usr-001',
      systemId: 'sys-1',
      technicianId: 'tech-1',
      technicianName: 'Engr. Tariq Mehmood',
      problemCategory: 'Panel Cleaning & Dust/Soiling Removal',
      description: 'Dust accumulation after rain storm. Midday yield reduced by ~15%.',
      preferredDate: '2026-10-15',
      createdAt: '2026-10-11 15:30',
      status: 'In Progress',
      statusTimeline: [
        { status: 'Requested', timestamp: '2026-10-11 15:30', note: 'Customer logged service request.' },
        { status: 'Accepted', timestamp: '2026-10-11 17:15', note: 'Technician confirmed arrival schedule.' },
        { status: 'In Progress', timestamp: '2026-10-12 09:45', note: 'Technician arrived on-site. Washing underway.' }
      ]
    }
  ],
  chatLogs: []
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, using seed:', err);
        return { ...initialSeed };
      }
    } else {
      this.save(initialSeed);
      return { ...initialSeed };
    }
  }

  save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  // Users collection
  findUserByEmail(email) {
    if (!email) return null;
    this.data = this.load();
    const clean = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === clean) || null;
  }

  createUser(userData) {
    const cleanEmail = userData.email.toLowerCase().trim();
    if (this.findUserByEmail(cleanEmail)) {
      throw new Error('An account already exists with this email address.');
    }
    const isAdminEmail = cleanEmail === 'admin@solarcare.com' || cleanEmail.startsWith('admin@');
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: userData.password,
      isVerified: true,
      preferredLanguage: userData.preferredLanguage || 'en',
      createdAt: new Date().toISOString(),
      role: userData.role || (isAdminEmail ? 'admin' : 'customer'),
    };
    this.data.users.push(newUser);
    // CRITICAL: Do NOT auto-create fake dummy solar systems for new users.
    // The user must complete their real solar setup on the onboarding screen!
    this.save();
    return newUser;
  }

  // Verification codes
  saveVerificationCode(email, code) {
    const clean = email.toLowerCase().trim();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    this.data.verificationCodes[clean] = {
      code,
      expiresAt,
      isVerified: false,
    };
    this.save();
  }

  verifyCode(email, code) {
    const clean = email.toLowerCase().trim();
    const record = this.data.verificationCodes[clean];
    if (!record) {
      return { success: false, errorCode: 'CODE_NOT_REQUESTED', message: 'No verification code was requested for this email.' };
    }
    if (Date.now() > record.expiresAt) {
      return { success: false, errorCode: 'CODE_EXPIRED', message: 'Verification code has expired. Please request a new code.' };
    }
    if (record.code.toString() !== code.toString().trim()) {
      return { success: false, errorCode: 'INCORRECT_CODE', message: 'Incorrect 6-digit verification code.' };
    }
    record.isVerified = true;
    this.save();
    return { success: true };
  }

  isEmailVerified(email) {
    const clean = email.toLowerCase().trim();
    const record = this.data.verificationCodes[clean];
    return !!(record && record.isVerified);
  }

  updatePassword(email, newPassword) {
    const clean = email.toLowerCase().trim();
    const user = this.findUserByEmail(clean);
    if (!user) {
      throw new Error('Account not found for this email address.');
    }
    user.passwordHash = newPassword;
    delete this.data.verificationCodes[clean];
    this.save();
    return true;
  }

  // Solar systems
  getSolarSystemsForUser(userId) {
    return this.data.solarSystems.filter(s => s.userId === userId);
  }

  addSolarSystem(systemData) {
    const newSys = {
      ...systemData,
      id: `sys-${Date.now()}`
    };
    this.data.solarSystems.push(newSys);
    this.save();
    return newSys;
  }

  // Maintenance
  getServiceRequestsForUser(userId) {
    return this.data.serviceRequests.filter(r => !r.userId || r.userId === userId);
  }

  addServiceRequest(requestData) {
    const newReq = {
      ...requestData,
      id: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Requested',
      statusTimeline: [
        {
          status: 'Requested',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          note: 'Customer logged service request in SolarCare database.'
        }
      ]
    };
    this.data.serviceRequests.unshift(newReq);
    this.save();
    return newReq;
  }

  updateServiceRequestStatus(id, newStatus, note = '') {
    const req = this.data.serviceRequests.find(r => r.id === id);
    if (!req) return null;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    req.status = newStatus;
    req.statusTimeline.push({
      status: newStatus,
      timestamp: now,
      note: note || `Status updated to ${newStatus}`
    });
    this.save();
    return req;
  }

  resetDatabase() {
    this.data = JSON.parse(JSON.stringify(initialSeed));
    this.save();
    return this.data;
  }
}

export const db = new Database();
