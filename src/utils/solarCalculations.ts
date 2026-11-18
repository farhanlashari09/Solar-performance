import { HourlyReading, DailyProduction, AlertItem } from '../types';

/**
 * Generates dynamic hourly generation curve scaled to the user's actual solar system capacity (kW)
 */
export function generateDynamicHourly(capacityKw: number): HourlyReading[] {
  if (!capacityKw || capacityKw <= 0) return [];

  // Distribution curve percentages from 6:00 to 18:00 (peak around 12:00)
  const curve = [
    { hour: '06:00', expPct: 0.02, actPct: 0.018, irradiance: 90, temp: 23 },
    { hour: '07:00', expPct: 0.08, actPct: 0.075, irradiance: 230, temp: 25 },
    { hour: '08:00', expPct: 0.18, actPct: 0.172, irradiance: 420, temp: 27 },
    { hour: '09:00', expPct: 0.32, actPct: 0.305, irradiance: 610, temp: 29 },
    { hour: '10:00', expPct: 0.44, actPct: 0.422, irradiance: 770, temp: 31 },
    { hour: '11:00', expPct: 0.51, actPct: 0.490, irradiance: 880, temp: 33 },
    { hour: '12:00', expPct: 0.54, actPct: 0.525, irradiance: 940, temp: 34 },
    { hour: '13:00', expPct: 0.48, actPct: 0.460, irradiance: 860, temp: 34 },
    { hour: '14:00', expPct: 0.37, actPct: 0.352, irradiance: 710, temp: 33 },
    { hour: '15:00', expPct: 0.23, actPct: 0.215, irradiance: 520, temp: 31 },
    { hour: '16:00', expPct: 0.11, actPct: 0.100, irradiance: 290, temp: 29 },
    { hour: '17:00', expPct: 0.03, actPct: 0.025, irradiance: 100, temp: 27 },
  ];

  return curve.map((c) => ({
    hour: c.hour,
    actualKwh: Number((capacityKw * c.actPct).toFixed(1)),
    expectedKwh: Number((capacityKw * c.expPct).toFixed(1)),
    irradianceWm2: c.irradiance,
    ambientTempC: c.temp,
  }));
}

/**
 * Generates dynamic 7-day weekly production scaled to user's actual solar system capacity (kW)
 */
export function generateDynamicWeekly(capacityKw: number): DailyProduction[] {
  if (!capacityKw || capacityKw <= 0) return [];

  // Realistic daily multipliers based on solar hours (approx 4.6 - 5.4 peak hours in South Asia)
  const days: {
    date: string;
    mult: number;
    eff: number;
    weather: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Dusty' | 'Rainy' | 'Missing';
    status: 'normal' | 'attention' | 'issue' | 'insufficient';
  }[] = [
    { date: 'Oct 15', mult: 5.1, eff: 0.96, weather: 'Sunny', status: 'normal' },
    { date: 'Oct 16', mult: 4.9, eff: 0.94, weather: 'Sunny', status: 'normal' },
    { date: 'Oct 17', mult: 4.4, eff: 0.88, weather: 'Partly Cloudy', status: 'normal' },
    { date: 'Oct 18', mult: 5.2, eff: 0.95, weather: 'Sunny', status: 'normal' },
    { date: 'Oct 19', mult: 4.8, eff: 0.92, weather: 'Dusty', status: 'normal' },
    { date: 'Oct 20', mult: 5.0, eff: 0.94, weather: 'Sunny', status: 'normal' },
    { date: 'Oct 21 (Today)', mult: 4.9, eff: 0.93, weather: 'Sunny', status: 'normal' },
  ];

  return days.map((d) => {
    const expected = Number((capacityKw * d.mult).toFixed(1));
    const actual = Number((expected * d.eff).toFixed(1));
    return {
      date: d.date,
      actualKwh: actual,
      expectedKwh: expected,
      weatherCondition: d.weather,
      peakSunHours: Number((d.mult).toFixed(1)),
      status: d.status,
    };
  });
}

/**
 * Generates dynamic 6-month monthly aggregations for user's solar system
 */
export function generateDynamicMonthly(capacityKw: number) {
  if (!capacityKw || capacityKw <= 0) return [];

  const months = [
    { period: 'May', factor: 142, eff: 0.96 },
    { period: 'Jun', factor: 138, eff: 0.95 },
    { period: 'Jul', factor: 125, eff: 0.93 },
    { period: 'Aug', factor: 128, eff: 0.94 },
    { period: 'Sep', factor: 132, eff: 0.95 },
    { period: 'Oct (MTD)', factor: 85, eff: 0.94 },
  ];

  return months.map((m) => {
    const expected = Math.round(capacityKw * m.factor);
    const actual = Math.round(expected * m.eff);
    return {
      period: `${m.period} 2026`,
      actualKwh: actual,
      expectedKwh: expected,
      performanceRatio: Number((m.eff * 100).toFixed(1)),
    };
  });
}

/**
 * Generates initial system alerts tailored to the newly configured system
 */
export function generateInitialAlerts(systemId: string, systemName: string, capacityKw: number): AlertItem[] {
  return [
    {
      id: `alt-${Date.now()}-1`,
      systemId,
      title: 'Solar System Calibration Complete',
      category: 'Inverter',
      date: 'Just now',
      severity: 'info',
      explanation: `${systemName} (${capacityKw} kW) has been calibrated. Live inverter telemetry monitoring is now active.`,
      suggestedAction: 'View real-time generation on your dashboard.',
      isRead: false,
    },
    {
      id: `alt-${Date.now()}-2`,
      systemId,
      title: 'Favorable Weather Irradiance',
      category: 'Grid / Weather',
      date: '15 mins ago',
      severity: 'info',
      explanation: 'Clear sky conditions detected in your region. Optimal PV generation efficiency expected today.',
      suggestedAction: 'Keep panels clean for maximum solar harvest.',
      isRead: false,
    },
  ];
}
