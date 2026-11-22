import { DiagnosticResult, SolarSystem, DailyProduction } from '../types';

export function evaluateSystemPerformance(system: SolarSystem, dailyData: DailyProduction[]): DiagnosticResult {
  const telemetryIsLive = false;
  const hasDatedHistory = dailyData.length > 0;

  if (!telemetryIsLive || !hasDatedHistory) {
    const connected = system.monitoringStatus === 'connected' && telemetryIsLive;
    return {
      status: 'Insufficient Data',
      performancePct: null,
      deviationPct: null,
      summary: connected
        ? 'Demo readings are available; production history is not available yet.'
        : 'No live readings are used in demo mode.',
      reasons: [
        connected
          ? 'The system uses saved demonstration information.'
          : 'System setup details are stored as simple demo data.',
        'Performance diagnostics require dated production history, which has not been received.',
      ],
      recommendations: [
        'Ask an administrator to update the system details when needed.',
      ],
      confidence: 'Inconclusive',
      dataSourceNote: telemetryIsLive
        ? `Demo snapshot · last updated ${system.telemetry?.lastUpdatedAt}`
        : 'No external API readings are used.',
    };
  }

  return {
    status: 'Insufficient Data',
    performancePct: null,
    deviationPct: null,
    summary: 'Historical diagnostics are not available.',
    reasons: ['No supported dated production series is available to compare against a baseline.'],
    recommendations: ['Use provider-reported readings only; do not infer system health from incomplete data.'],
    confidence: 'Inconclusive',
    dataSourceNote: 'Provider history is not configured.',
  };
}
