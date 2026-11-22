import { createHash } from 'node:crypto';

const REQUIRED_SETTINGS = ['FUSIONSOLAR_BASE_URL', 'FUSIONSOLAR_USERNAME', 'FUSIONSOLAR_PASSWORD'];

export function getFusionSolarConfiguration() {
  const missing = REQUIRED_SETTINGS.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    return { configured: false, message: 'FusionSolar credentials are not configured on the server.' };
  }

  let baseUrl;
  try {
    baseUrl = new URL(process.env.FUSIONSOLAR_BASE_URL);
  } catch {
    return { configured: false, message: 'FusionSolar base URL is invalid.' };
  }
  if (baseUrl.protocol !== 'https:') {
    return { configured: false, message: 'FusionSolar base URL must use HTTPS.' };
  }

  return { configured: true, baseUrl: baseUrl.toString().replace(/\/+$/, '') };
}

export function getMonitoringProviderStatus() {
  const fusionSolar = getFusionSolarConfiguration();
  return [
    {
      id: 'huawei-fusionsolar',
      name: 'Huawei FusionSolar',
      status: fusionSolar.configured
        ? 'configured'
        : fusionSolar.message === 'FusionSolar credentials are not configured on the server.'
          ? 'needs-credentials'
          : 'configuration-error',
      supportsLiveTelemetry: true,
      message: fusionSolar.configured
        ? 'Server credentials are configured; link a Huawei station to request real readings.'
        : fusionSolar.message,
      documentationUrl: 'https://support.huawei.com/enterprise/en/fusionsolar',
    },
    {
      id: 'growatt-shineserver',
      name: 'Growatt ShineServer',
      status: 'not-verified',
      supportsLiveTelemetry: false,
      message: 'A documented, no-cost vendor API and its access terms could not be verified; no adapter is enabled.',
      documentationUrl: 'https://server.growatt.com/',
    },
    {
      id: 'soliscloud',
      name: 'SolisCloud',
      status: 'not-verified',
      supportsLiveTelemetry: false,
      message: 'Public vendor API documentation and no-cost access terms could not be verified; no adapter is enabled.',
      documentationUrl: 'https://www.soliscloud.com/',
    },
  ];
}

export function isVerifiedFusionSolarTelemetry(telemetry) {
  const timestamp = Date.parse(telemetry?.lastUpdatedAt);
  const hasMeasurement = [
    telemetry?.activePowerKw,
    telemetry?.dailyEnergyKwh,
    telemetry?.totalEnergyKwh,
  ].some((value) => typeof value === 'number' && Number.isFinite(value));

  return telemetry?.source === 'Huawei FusionSolar'
    && Number.isFinite(timestamp)
    && timestamp <= Date.now()
    && hasMeasurement;
}

function isSuccessful(response) {
  return response?.success !== false && (response?.code === undefined || response.code === 0 || response.code === '0');
}

async function postJson(url, payload, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`FusionSolar returned HTTP ${response.status}.`);
  const result = await response.json();
  if (!isSuccessful(result)) throw new Error('FusionSolar rejected the request.');
  return { result, response };
}

function cookieHeader(response) {
  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new Error('FusionSolar login did not return a session cookie.');
  return cookie.split(/,(?=[^;,]+=)/).map((part) => part.split(';', 1)[0].trim()).join('; ');
}

export function parseStationKpi(responseData, stationCode, lastUpdatedAt = new Date().toISOString()) {
  const station = Array.isArray(responseData)
    ? responseData.find((candidate) => candidate.stationCode === stationCode)
    : responseData?.stationCode && responseData.stationCode !== stationCode
      ? undefined
      : responseData;
  const values = station?.dataItemMap;
  if (!values || typeof values !== 'object') {
    throw new Error('FusionSolar returned no station KPI data.');
  }

  const numeric = (key) => {
    if (values[key] === undefined || values[key] === null || String(values[key]).trim() === '') return undefined;
    const value = Number(values[key]);
    return Number.isFinite(value) ? value : undefined;
  };
  const telemetry = {
    source: 'Huawei FusionSolar',
    lastUpdatedAt,
    ...(numeric('active_power') !== undefined ? { activePowerKw: numeric('active_power') } : {}),
    ...(numeric('day_cap') !== undefined ? { dailyEnergyKwh: numeric('day_cap') } : {}),
    ...(numeric('total_cap') !== undefined ? { totalEnergyKwh: numeric('total_cap') } : {}),
  };

  if (telemetry.activePowerKw === undefined && telemetry.dailyEnergyKwh === undefined && telemetry.totalEnergyKwh === undefined) {
    throw new Error('FusionSolar returned no supported production measurements.');
  }
  return telemetry;
}

export async function fetchStationTelemetry(stationCode) {
  if (!stationCode || typeof stationCode !== 'string') {
    throw new Error('A FusionSolar station code must be linked by an administrator.');
  }
  const config = getFusionSolarConfiguration();
  if (!config.configured) {
    const error = new Error(config.message);
    error.code = 'FUSIONSOLAR_UNCONFIGURED';
    throw error;
  }

  const passwordHash = createHash('sha256').update(process.env.FUSIONSOLAR_PASSWORD).digest('hex');
  const login = await postJson(`${config.baseUrl}/thirdData/login`, {
    userName: process.env.FUSIONSOLAR_USERNAME,
    systemCode: passwordHash,
  });
  const cookie = cookieHeader(login.response);
  const xsrfToken = login.response.headers.get('xsrf-token') || login.response.headers.get('x-xsrf-token');
  const headers = {
    Cookie: cookie,
    ...(xsrfToken ? { 'XSRF-TOKEN': xsrfToken } : {}),
  };
  const { result } = await postJson(`${config.baseUrl}/thirdData/getStationRealKpi`, {
    stationCodes: [stationCode],
  }, headers);
  return parseStationKpi(result.data, stationCode);
}
