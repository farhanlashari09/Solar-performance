import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { StatusBadge } from '../common/StatusBadge';
import { Activity, ArrowRight, Database, MapPin, ShieldAlert, Sun, Zap } from 'lucide-react';

interface PerformanceViewProps {
  onNavigateToMaintenance: () => void;
  onNavigateToTechnicians: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  onNavigateToMaintenance,
  onNavigateToTechnicians,
}) => {
  const { t } = useLanguage();
  const { activeSystem, diagnosticResult } = useSolar();
  const telemetry = activeSystem.telemetry;
  const lastUpdated = telemetry?.lastUpdatedAt && Number.isFinite(Date.parse(telemetry.lastUpdatedAt))
    ? new Date(telemetry.lastUpdatedAt).toLocaleString()
    : 'No live readings received';

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.performance.title}</h1>
          <p className="mt-1 text-xs text-slate-500">{activeSystem.name} · {activeSystem.capacityKw} kW</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <MapPin className="h-3.5 w-3.5" />
          {activeSystem.location || 'Location not set'}
        </span>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Current output', value: telemetry?.activePowerKw, unit: 'kW', icon: Zap },
          { label: 'Today’s energy', value: telemetry?.dailyEnergyKwh, unit: 'kWh', icon: Sun },
          { label: 'Lifetime energy', value: telemetry?.totalEnergyKwh, unit: 'kWh', icon: Activity },
        ].map(({ label, value, unit, icon: Icon }) => (
          <article key={label} className="solar-card rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <Icon className="h-4 w-4 text-[#477b61]" strokeWidth={1.8} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
              <span className="ml-2 text-sm font-medium text-slate-500">{unit}</span>
            </p>
          </article>
        ))}
      </section>

      <section className="solar-card rounded-2xl bg-white p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.performance.diagnosticCardTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{diagnosticResult.summary}</h2>
              <StatusBadge status={diagnosticResult.status} />
            </div>
          </div>
          <div className="rounded-xl bg-[#f7f8f5] px-4 py-3 text-xs text-slate-500">
            <p>Data source: {telemetry?.source || 'Not connected'}</p>
            <p className="mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>
        <div className="grid gap-6 py-5 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
              <ShieldAlert className="h-4 w-4 text-[#b58a2b]" strokeWidth={1.8} />
              What is available
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {telemetry
                ? 'A current FusionSolar snapshot is available. Dated hourly and daily history has not been received, so performance ratios and fault diagnoses are withheld.'
                : activeSystem.monitoringError || 'No verified measurements are available. Setup values are not used to simulate production.'}
            </p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
              <Database className="h-4 w-4 text-[#477b61]" strokeWidth={1.8} />
              Provider details
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {activeSystem.providerStationCode
                ? `FusionSolar station ${activeSystem.providerStationCode} · ${activeSystem.monitoringStatus || 'awaiting readings'}`
                : 'No provider station is linked. Ask an administrator to link the correct station.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onNavigateToMaintenance}
            className="inline-flex items-center gap-2 rounded-xl bg-[#eff5ef] px-4 py-2.5 text-xs font-semibold text-[#2e634d] transition hover:bg-[#e4eee4]"
          >
            Request maintenance <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onNavigateToTechnicians}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Find a technician <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <section className="solar-card rounded-2xl border-dashed bg-[#f8faf8] p-8 text-center">
        <Activity className="mx-auto h-8 w-8 text-[#4c8066]" strokeWidth={1.7} />
        <h2 className="mt-3 text-sm font-semibold text-slate-700">Historical production is not available</h2>
        <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-slate-500">
          This view will show dated records when the connected provider supplies them. No demo timeline or capacity-based estimate is shown here.
        </p>
      </section>
    </div>
  );
};
