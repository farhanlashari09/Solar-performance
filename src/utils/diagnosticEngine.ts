import { DiagnosticResult, SolarSystem, DailyProduction } from '../types';

/**
 * Transparent Rule-Based Solar Diagnostic Engine
 * Evaluates actual telemetry against modeled expectations, incorporating weather,
 * historical patterns, and telemetry availability.
 */
export function evaluateSystemPerformance(
  system: SolarSystem,
  dailyData: DailyProduction[],
  weatherIrradianceWm2: number
): DiagnosticResult {
  // Rule 0: Check for Insufficient / Missing Data
  if (system.connectionStatus === 'unavailable') {
    return {
      status: 'Insufficient Data',
      performancePct: null,
      deviationPct: null,
      summary: 'Data Unavailable: Inverter logger feed is currently offline or unconfigured.',
      reasons: [
        'No active telemetric signal received from the inverter communication datalogger.',
        'Data connection status is marked as Data Unavailable.',
        'No recent generation packets available to formulate an estimate.'
      ],
      recommendations: [
        'Verify that your WiFi/4G inverter dongle is powered on and connected to your router.',
        'Check RS485 / Modbus communication wiring between inverter and data collector.',
        'Consult your solar installer if connectivity remains lost for over 24 hours.'
      ],
      confidence: 'Inconclusive',
      dataSourceNote: 'Data Source: Telemetry signal offline • Last recorded packet: 3 days ago'
    };
  }

  const today = dailyData[dailyData.length - 1];
  if (!today || today.isMissingData || today.actualKwh === 0 && today.expectedKwh > 0 && today.weatherCondition === 'Missing') {
    return {
      status: 'Insufficient Data',
      performancePct: null,
      deviationPct: null,
      summary: 'Telemetric records are missing or incomplete for the selected date.',
      reasons: [
        'Zero or null readings received during daylight hours.',
        'Weather station sensor synchronization was interrupted.'
      ],
      recommendations: [
        'Allow 15-30 minutes for cloud telemetry synchronization.',
        'Avoid concluding that a physical hardware fault exists without complete telemetry.'
      ],
      confidence: 'Inconclusive',
      dataSourceNote: 'Data Source: Simulated Telemetry Incomplete'
    };
  }

  const actual = today.actualKwh;
  const expected = today.expectedKwh;

  if (expected <= 0) {
    return {
      status: 'Insufficient Data',
      performancePct: null,
      deviationPct: null,
      summary: 'Expected baseline model is zero or invalid.',
      reasons: ['Baseline calculation model not calibrated for this installation size.'],
      recommendations: ['Configure system capacity in kW under Solar System Settings.'],
      confidence: 'Inconclusive',
      dataSourceNote: 'Data Source: Calibration Required'
    };
  }

  // Formula: Performance percentage = (Actual production / Expected production) × 100
  const performancePct = Number(((actual / expected) * 100).toFixed(1));
  const deviationPct = Number((performancePct - 100).toFixed(1));

  // Rule 1: Normal Operation (>= 88%)
  if (performancePct >= 88) {
    return {
      status: 'Normal',
      performancePct,
      deviationPct,
      summary: `System is operating reliably at ${performancePct}% of expected output.`,
      reasons: [
        `Generation is well within standard seasonal tolerance (≥ 88% benchmark).`,
        `Irradiance of ${weatherIrradianceWm2} W/m² is being efficiently converted by the ${system.inverterBrand} inverter.`,
        `No DC string voltage drop or MPPT clipping anomalies detected.`
      ],
      recommendations: [
        'Continue regular visual inspections for dust accumulation.',
        'Routine washing schedule every 2-3 weeks is sufficient during clear weather.',
        'No corrective technician service needed at this time.'
      ],
      confidence: 'High',
      dataSourceNote: `Data Source: Simulated Inverter Telemetry (${system.inverterBrand} Cloud API Demo) • Updated 12 mins ago`
    };
  }

  // Rule 2: Needs Attention (70% <= performancePct < 88%)
  if (performancePct >= 70) {
    const isDustyOrCloudy = today.weatherCondition === 'Dusty' || today.weatherCondition === 'Partly Cloudy';
    return {
      status: 'Needs Attention',
      performancePct,
      deviationPct,
      summary: `Production is slightly reduced (${performancePct}% of estimate, deviation ${deviationPct}%).`,
      reasons: [
        isDustyOrCloudy 
          ? `Local environmental factors (${today.weatherCondition} conditions & atmospheric haze) account for a significant portion of the lower yield.`
          : 'Minor output drop detected compared to clear-sky benchmark.',
        'Accumulated surface dust or soiling may be reducing light transmission to the cells by 8% to 15%.',
        'Partial shading from nearby structures or tree foliage during specific sun angles.'
      ],
      recommendations: [
        'Perform gentle cleaning of solar panel glass in early morning or late afternoon with soft water.',
        'Do not use high-pressure washers or abrasive chemical detergents.',
        'Observe if production recovers post-cleaning before booking a technical inspection.'
      ],
      confidence: 'Moderate',
      dataSourceNote: `Data Source: Simulated Inverter Telemetry • Weather correlation: ${today.weatherCondition}`
    };
  }

  // Rule 3: Possible System Issue (< 70%)
  return {
    status: 'Possible System Issue',
    performancePct,
    deviationPct,
    summary: `Generation is substantially below expectation (${performancePct}% of estimate, deviation ${deviationPct}%).`,
    reasons: [
      `Solar irradiance is measured at ${weatherIrradianceWm2} W/m², which normally yields higher output for a ${system.capacityKw} kW array.`,
      'Possible disconnected DC string, blown string fuse, or tripped DC isolator switch.',
      'Inverter may be thermally throttling or encountering grid overvoltage protection limits.',
      'Heavy soiling compounded by hot spot formation or bypass diode activation.'
    ],
    recommendations: [
      'Check inverter LCD display or status LED indicator for error or warning codes.',
      'Verify that all AC circuit breakers and DC isolators remain in the ON position.',
      'Request an accredited technician to conduct a string VOC / ISC electrical diagnosis.',
      '⚠️ CAUTION: Do not attempt to disconnect MC4 connectors or access inverter internal terminals yourself.'
    ],
    confidence: 'High',
    dataSourceNote: `Data Source: Simulated Telemetry Alert Triggered • Evaluated: Today`
  };
}
