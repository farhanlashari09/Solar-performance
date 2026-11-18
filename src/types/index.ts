export type Language = 'en' | 'ur' | 'ur-roman';

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  avatar?: string;
  preferredLanguage: Language;
  createdAt: string;
  role?: 'admin' | 'customer';
}

export type ConnectionStatus = 'demo' | 'connected' | 'unavailable';

export interface SolarSystem {
  id: string;
  name: string;
  location: string;
  capacityKw: number;
  inverterBrand: string;
  inverterModel: string;
  installationDate: string;
  connectionMethod: string;
  connectionStatus: ConnectionStatus;
  panelCount: number;
  panelType: string;
  batteryCapacityKwh?: number;
}

export interface HourlyReading {
  hour: string; // e.g. "06:00", "07:00"
  actualKwh: number;
  expectedKwh: number;
  irradianceWm2: number; // Solar irradiance W/m²
  ambientTempC: number;
}

export interface DailyProduction {
  date: string;
  actualKwh: number;
  expectedKwh: number;
  weatherCondition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Dusty' | 'Rainy' | 'Missing';
  peakSunHours: number;
  status: 'normal' | 'attention' | 'issue' | 'insufficient';
  isMissingData?: boolean;
}

export interface MonthlyProduction {
  month: string;
  actualKwh: number;
  expectedKwh: number;
  performanceRatio: number;
}

export type DiagnosticStatus = 'Normal' | 'Needs Attention' | 'Possible System Issue' | 'Insufficient Data';

export interface DiagnosticResult {
  status: DiagnosticStatus;
  performancePct: number | null;
  deviationPct: number | null;
  summary: string;
  reasons: string[];
  recommendations: string[];
  confidence: 'High' | 'Moderate' | 'Inconclusive';
  dataSourceNote: string;
}

export interface AlertItem {
  id: string;
  systemId: string;
  title: string;
  category: 'Performance' | 'Inverter' | 'Grid / Weather' | 'Maintenance';
  date: string;
  severity: 'warning' | 'critical' | 'info';
  explanation: string;
  suggestedAction: string;
  isRead: boolean;
  actionRoute?: string;
}

export interface Technician {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  phone: string;
  serviceArea: string; // e.g. "Lahore Central & DHA", "Karachi North & South", "Islamabad / Rawalpindi"
  distanceKm: number; // Estimated distance from solar owner's home in km
  supportedInverters: string[]; // e.g. ["Huawei", "Growatt", "Solis", "GoodWe", "Inverex"]
  isVerified: boolean;
  verificationBadge: string;
  availability: 'Available Today' | 'Next Available: Tomorrow' | 'Booked This Week';
  experienceYears: number;
  rating: number;
  completedJobsCount: number;
  specialization: string;
  hourlyRatePkr: number;
  bio: string;
  certifications: string[];
}

export type ServiceStatus = 'Requested' | 'Accepted' | 'In Progress' | 'Completed';

export interface ServiceRequest {
  id: string; // e.g. "REQ-2026-8841"
  systemId: string;
  technicianId?: string;
  technicianName?: string;
  problemCategory: string;
  description: string;
  preferredDate: string;
  photoUrl?: string;
  photoName?: string;
  createdAt: string;
  status: ServiceStatus;
  statusTimeline: {
    status: ServiceStatus;
    timestamp: string;
    note: string;
  }[];
  workReport?: {
    completedDate: string;
    technicianNotes: string;
    workPerformed: string;
    partsReplaced?: string;
    beforeKwhDaily: number;
    afterKwhDaily: number;
    improvementPct: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language: Language;
  suggestions?: string[];
  isWarning?: boolean;
}

export interface WeatherInfo {
  tempC: number;
  condition: string;
  irradianceWm2: number;
  humidityPct: number;
  windSpeedKmh: number;
  uvIndex: number;
  summary: string;
}
