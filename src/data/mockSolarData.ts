import { SolarSystem, HourlyReading, DailyProduction, WeatherInfo } from '../types';

export const initialSolarSystems: SolarSystem[] = [
  {
    id: 'sys-1',
    name: 'GreenHome 10kW Rooftop',
    location: 'Lahore, Punjab (DHA Phase 6)',
    capacityKw: 10.0,
    inverterBrand: 'Huawei',
    inverterModel: 'SUN2000-10KTL-M1',
    installationDate: '2023-04-15',
    connectionMethod: 'Simulated Inverter Cloud Telemetry',
    connectionStatus: 'demo',
    panelCount: 18,
    panelType: '585W Monofacial Tier-1 N-Type TOPCon',
  },
  {
    id: 'sys-2',
    name: 'Sunrise Farm 25kW Agrivoltaic',
    location: 'Multan, Punjab (Bosan Road)',
    capacityKw: 25.0,
    inverterBrand: 'Growatt',
    inverterModel: 'MAX 25KTL3-X',
    installationDate: '2022-11-20',
    connectionMethod: 'Simulated Inverter Cloud Telemetry',
    connectionStatus: 'demo',
    panelCount: 46,
    panelType: '550W Bifacial Perc Panels',
  },
  {
    id: 'sys-3',
    name: 'Commercial Office 50kW',
    location: 'Karachi, Sindh (Korangi Industrial Area)',
    capacityKw: 50.0,
    inverterBrand: 'Solis',
    inverterModel: 'Solis-50K-HV-5G',
    installationDate: '2024-01-10',
    connectionMethod: 'WiFi Inverter Modbus Logger',
    connectionStatus: 'unavailable',
    panelCount: 92,
    panelType: '550W Monocrystalline',
  },
];

// Current Weather Summary
export const mockWeatherInfo: WeatherInfo = {
  tempC: 31,
  condition: 'Sunny & Clear',
  irradianceWm2: 825,
  humidityPct: 36,
  windSpeedKmh: 12,
  uvIndex: 8.5,
  summary: 'High solar irradiance with clear skies. Favorable photovoltaic conditions with mild ambient haze.',
};

// Hourly Readings for System 1 (Today: Actual 32.4 kWh vs Expected 35.0 kWh)
export const mockHourlyReadingsSys1: HourlyReading[] = [
  { hour: '06:00', actualKwh: 0.1, expectedKwh: 0.2, irradianceWm2: 85, ambientTempC: 22 },
  { hour: '07:00', actualKwh: 0.8, expectedKwh: 0.9, irradianceWm2: 240, ambientTempC: 24 },
  { hour: '08:00', actualKwh: 1.9, expectedKwh: 2.1, irradianceWm2: 430, ambientTempC: 26 },
  { hour: '09:00', actualKwh: 3.2, expectedKwh: 3.4, irradianceWm2: 610, ambientTempC: 28 },
  { hour: '10:00', actualKwh: 4.4, expectedKwh: 4.6, irradianceWm2: 780, ambientTempC: 30 },
  { hour: '11:00', actualKwh: 5.1, expectedKwh: 5.3, irradianceWm2: 890, ambientTempC: 32 },
  { hour: '12:00', actualKwh: 5.4, expectedKwh: 5.6, irradianceWm2: 940, ambientTempC: 33 },
  { hour: '13:00', actualKwh: 4.7, expectedKwh: 5.0, irradianceWm2: 860, ambientTempC: 33 },
  { hour: '14:00', actualKwh: 3.6, expectedKwh: 3.9, irradianceWm2: 710, ambientTempC: 32 },
  { hour: '15:00', actualKwh: 2.1, expectedKwh: 2.4, irradianceWm2: 520, ambientTempC: 31 },
  { hour: '16:00', actualKwh: 0.9, expectedKwh: 1.2, irradianceWm2: 290, ambientTempC: 29 },
  { hour: '17:00', actualKwh: 0.2, expectedKwh: 0.4, irradianceWm2: 95, ambientTempC: 27 },
];

// 7-Day History for System 1
export const mockWeeklySys1: DailyProduction[] = [
  { date: 'Oct 06', actualKwh: 34.8, expectedKwh: 35.5, weatherCondition: 'Sunny', peakSunHours: 5.6, status: 'normal' },
  { date: 'Oct 07', actualKwh: 33.2, expectedKwh: 35.0, weatherCondition: 'Sunny', peakSunHours: 5.4, status: 'normal' },
  { date: 'Oct 08', actualKwh: 28.4, expectedKwh: 34.5, weatherCondition: 'Partly Cloudy', peakSunHours: 4.6, status: 'attention' },
  { date: 'Oct 09', actualKwh: 35.1, expectedKwh: 35.2, weatherCondition: 'Sunny', peakSunHours: 5.7, status: 'normal' },
  { date: 'Oct 10', actualKwh: 31.9, expectedKwh: 34.8, weatherCondition: 'Dusty', peakSunHours: 5.1, status: 'normal' },
  { date: 'Oct 11', actualKwh: 33.6, expectedKwh: 35.0, weatherCondition: 'Sunny', peakSunHours: 5.5, status: 'normal' },
  { date: 'Oct 12 (Today)', actualKwh: 32.4, expectedKwh: 35.0, weatherCondition: 'Sunny', peakSunHours: 5.3, status: 'normal' },
];

// System 2 Data: Reduced Production / Needs Attention scenario (heavy dust accumulation)
export const mockWeeklySys2: DailyProduction[] = [
  { date: 'Oct 06', actualKwh: 86.2, expectedKwh: 89.0, weatherCondition: 'Sunny', peakSunHours: 5.5, status: 'normal' },
  { date: 'Oct 07', actualKwh: 82.0, expectedKwh: 88.5, weatherCondition: 'Dusty', peakSunHours: 5.3, status: 'normal' },
  { date: 'Oct 08', actualKwh: 71.5, expectedKwh: 88.0, weatherCondition: 'Dusty', peakSunHours: 5.1, status: 'attention' },
  { date: 'Oct 09', actualKwh: 64.0, expectedKwh: 87.5, weatherCondition: 'Dusty', peakSunHours: 5.0, status: 'attention' },
  { date: 'Oct 10', actualKwh: 58.2, expectedKwh: 88.0, weatherCondition: 'Dusty', peakSunHours: 5.2, status: 'issue' },
  { date: 'Oct 11', actualKwh: 55.4, expectedKwh: 87.8, weatherCondition: 'Sunny', peakSunHours: 5.4, status: 'issue' },
  { date: 'Oct 12 (Today)', actualKwh: 54.2, expectedKwh: 88.0, weatherCondition: 'Sunny', peakSunHours: 5.5, status: 'issue' },
];

// System 3 Data: Insufficient Data / Missing Telemetry case
export const mockWeeklySys3: DailyProduction[] = [
  { date: 'Oct 06', actualKwh: 0, expectedKwh: 175.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
  { date: 'Oct 07', actualKwh: 0, expectedKwh: 174.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
  { date: 'Oct 08', actualKwh: 0, expectedKwh: 176.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
  { date: 'Oct 09', actualKwh: 0, expectedKwh: 175.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
  { date: 'Oct 10', actualKwh: 0, expectedKwh: 172.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
  { date: 'Oct 11', actualKwh: 0, expectedKwh: 175.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
  { date: 'Oct 12 (Today)', actualKwh: 0, expectedKwh: 175.0, weatherCondition: 'Missing', peakSunHours: 0, status: 'insufficient', isMissingData: true },
];

// 30-Day Monthly Aggregations
export const mockMonthlySys1 = [
  { period: 'May 2026', actualKwh: 1140, expectedKwh: 1180, performanceRatio: 96.6 },
  { period: 'Jun 2026', actualKwh: 1090, expectedKwh: 1150, performanceRatio: 94.8 },
  { period: 'Jul 2026', actualKwh: 980, expectedKwh: 1040, performanceRatio: 94.2 },
  { period: 'Aug 2026', actualKwh: 1010, expectedKwh: 1060, performanceRatio: 95.3 },
  { period: 'Sep 2026', actualKwh: 1045, expectedKwh: 1100, performanceRatio: 95.0 },
  { period: 'Oct 2026 (MTD)', actualKwh: 412, expectedKwh: 445, performanceRatio: 92.6 },
];
