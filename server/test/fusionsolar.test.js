import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFusionSolarConfiguration,
  getMonitoringProviderStatus,
  isVerifiedFusionSolarTelemetry,
  parseStationKpi,
} from '../fusionsolar.js';

test('station KPI parsing preserves provider readings and their timestamp', () => {
  const lastUpdatedAt = new Date(Date.now() - 60_000).toISOString();
  const telemetry = parseStationKpi([{
    stationCode: 'station-1',
    dataItemMap: { active_power: '4.25', day_cap: '18.7', total_cap: '9241.3' },
  }], 'station-1', lastUpdatedAt);

  assert.deepEqual(telemetry, {
    source: 'Huawei FusionSolar',
    lastUpdatedAt,
    activePowerKw: 4.25,
    dailyEnergyKwh: 18.7,
    totalEnergyKwh: 9241.3,
  });
  assert.ok(Date.parse(telemetry.lastUpdatedAt) < Date.now());
});

test('empty or unsupported provider data is not converted into zero readings', () => {
  assert.throws(() => parseStationKpi({
    dataItemMap: { active_power: '', day_cap: null, total_cap: 'unavailable' },
  }, 'station-1'), /no supported production measurements/i);
});

test('KPI parsing rejects a station response that does not match the linked station', () => {
  assert.throws(() => parseStationKpi([{
    stationCode: 'different-station',
    dataItemMap: { active_power: '4.25' },
  }], 'station-1'), /no station KPI data/i);
});

test('future-dated or empty telemetry is not considered verified', () => {
  assert.equal(isVerifiedFusionSolarTelemetry({
    source: 'Huawei FusionSolar',
    lastUpdatedAt: new Date(Date.now() + 60_000).toISOString(),
    dailyEnergyKwh: 12,
  }), false);
  assert.equal(isVerifiedFusionSolarTelemetry({
    source: 'Huawei FusionSolar',
    lastUpdatedAt: new Date(Date.now() - 60_000).toISOString(),
  }), false);
});

test('FusionSolar is unconfigured when backend credentials are absent', () => {
  const settings = ['FUSIONSOLAR_BASE_URL', 'FUSIONSOLAR_USERNAME', 'FUSIONSOLAR_PASSWORD'];
  const previous = Object.fromEntries(settings.map((key) => [key, process.env[key]]));
  try {
    for (const key of settings) delete process.env[key];
    assert.deepEqual(getFusionSolarConfiguration(), {
      configured: false,
      message: 'FusionSolar credentials are not configured on the server.',
    });

    test('only providers with verified API support are advertised for live readings', () => {
      const integrations = getMonitoringProviderStatus();
      assert.deepEqual(integrations.map(({ id, supportsLiveTelemetry }) => [id, supportsLiveTelemetry]), [
        ['huawei-fusionsolar', true],
        ['growatt-shineserver', false],
        ['soliscloud', false],
      ]);
      assert.ok(integrations.filter((provider) => !provider.supportsLiveTelemetry)
        .every((provider) => provider.status === 'not-verified'));
    });

    test('invalid FusionSolar configuration is reported without exposing credentials', () => {
      const settings = {
        FUSIONSOLAR_BASE_URL: process.env.FUSIONSOLAR_BASE_URL,
        FUSIONSOLAR_USERNAME: process.env.FUSIONSOLAR_USERNAME,
        FUSIONSOLAR_PASSWORD: process.env.FUSIONSOLAR_PASSWORD,
      };
      try {
        process.env.FUSIONSOLAR_BASE_URL = 'http://example.test';
        process.env.FUSIONSOLAR_USERNAME = 'test-user';
        process.env.FUSIONSOLAR_PASSWORD = 'test-password';
        const provider = getMonitoringProviderStatus().find(({ id }) => id === 'huawei-fusionsolar');
        assert.equal(provider.status, 'configuration-error');
        assert.equal(provider.message, 'FusionSolar base URL must use HTTPS.');
        assert.equal(JSON.stringify(provider).includes('test-password'), false);
      } finally {
        for (const [key, value] of Object.entries(settings)) {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        }
      }
    });
  } finally {
    for (const key of settings) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
