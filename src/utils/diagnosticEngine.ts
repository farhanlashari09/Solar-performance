import { DiagnosticResult, SolarSystem, DailyProduction } from '../types';

export function evaluateSystemPerformance(system: SolarSystem, dailyData: DailyProduction[]): DiagnosticResult {
  const telemetryIsLive = system.telemetry?.source === 'Huawei FusionSolar'
    && Number.isFinite(Date.parse(system.telemetry.lastUpdatedAt));
  const hasDatedHistory = dailyData.length > 0;

  if (!telemetryIsLive || !hasDatedHistory) {
    const connected = system.monitoringStatus === 'connected' && telemetryIsLive;
    return {
      status: 'Insufficient Data',
      performancePct: null,
      deviationPct: null,
      summary: connected
        ? 'Live readings are available; production history is not available yet.'
        : 'No verified live readings are available for this system.',
      reasons: [
        connected
          ? 'The provider has returned a current system snapshot.'
          : 'System setup details do not verify a provider connection.',
        'Performance diagnostics require dated production history, which has not been received.',
      ],
      recommendations: [
        system.providerStationCode
          ? 'Refresh the FusionSolar connection after server credentials are configured.'
          : 'Ask an administrator to link the correct FusionSolar station.',
      ],
      confidence: 'Inconclusive',
      dataSourceNote: telemetryIsLive
        ? `Huawei FusionSolar · last updated ${system.telemetry?.lastUpdatedAt}`
        : system.monitoringError || 'No provider readings received.',
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
