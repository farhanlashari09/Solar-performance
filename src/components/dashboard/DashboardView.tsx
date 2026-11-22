import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { SystemWeatherCard } from '../weather/SystemWeatherCard';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CloudSun,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sun,
  Wrench,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
  onOpenAssistant: () => void;
  onOpenNewServiceRequest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAssistant,
  onOpenNewServiceRequest,
}) => {
  const { t, isRtl } = useLanguage();
  const { activeSystem, diagnosticResult, alerts, refreshMonitoring } = useSolar();
  const { serviceRequests } = useMaintenance();
  const { currentUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const telemetry = activeSystem.telemetry;
  const recentAlerts = alerts.filter((alert) => alert.systemId === activeSystem.id).slice(0, 2);
  const recentMaintenance = serviceRequests.filter((request) => request.systemId === activeSystem.id).slice(0, 2);
  const status = activeSystem.monitoringStatus || (activeSystem.connectionStatus === 'connected' ? 'connected' : 'unlinked');
  const statusText = {
    connected: 'Live connection',
    unlinked: 'Station not linked',
    unconfigured: 'Provider not configured',
    error: 'Connection error',
  }[status];
  const lastUpdated = telemetry?.lastUpdatedAt && Number.isFinite(Date.parse(telemetry.lastUpdatedAt))
    ? new Date(telemetry.lastUpdatedAt).toLocaleString()
    : 'No live readings received';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage('');
    const message = await refreshMonitoring();
    setRefreshMessage(message || 'Live readings updated.');
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#163c31] via-[#1f5946] to-[#285f49] p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Activity className="h-3.5 w-3.5" />
              {statusText}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t.dashboard.welcome}, {currentUser?.name || 'Homeowner'}
              </h1>
              <p className="mt-2 text-sm text-white/75">
                {activeSystem.name} · {activeSystem.capacityKw} kW · {activeSystem.inverterBrand || 'Inverter not specified'}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/65">
                <MapPin className="h-3.5 w-3.5" />
                {activeSystem.location || 'Location not set'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || !activeSystem.providerStationCode}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              title={!activeSystem.providerStationCode ? 'An administrator must link a FusionSolar station first.' : undefined}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh live data
            </button>
            <button
              type="button"
              onClick={onOpenNewServiceRequest}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e5b548] px-4 py-2.5 text-xs font-bold text-[#20372c] transition hover:bg-[#f1c764]"
            >
              <Wrench className="h-4 w-4" />
              {t.dashboard.actionRequestMaint}
            </button>
            <button
              type="button"
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <ShieldCheck className="h-4 w-4" />
              {t.dashboard.actionAskAssistant}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Live system summary">
        {[
          { label: 'Today’s energy', value: telemetry?.dailyEnergyKwh, unit: 'kWh', icon: Zap, accent: 'text-[#a77b1a] bg-[#fbf4df]' },
          { label: 'Current output', value: telemetry?.activePowerKw, unit: 'kW', icon: Sun, accent: 'text-[#2e7158] bg-[#e9f4ed]' },
          { label: 'Lifetime energy', value: telemetry?.totalEnergyKwh, unit: 'kWh', icon: Activity, accent: 'text-[#477b74] bg-[#eaf4f3]' },
        ].map(({ label, value, unit, icon: Icon, accent }) => (
          <article key={label} className="solar-card rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
              <span className="ml-2 text-sm font-medium text-slate-500">{unit}</span>
            </p>
            <p className="mt-2 text-[11px] text-slate-400">{telemetry ? 'Reported by FusionSolar' : 'Waiting for verified provider readings'}</p>
          </article>
        ))}

        <article className="solar-card rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.dashboard.systemHealth}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><ShieldCheck className="h-4 w-4" /></span>
          </div>
          <div className="mt-4"><StatusBadge status={diagnosticResult.status} /></div>
          <p className="mt-2 text-[11px] text-slate-500">{diagnosticResult.summary}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="solar-card rounded-2xl bg-white p-6 lg:col-span-2">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-base font-bold text-slate-900">Production history</h2>
              <p className="mt-1 text-xs text-slate-500">Historical charts will appear when the provider supplies dated production records.</p>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${status === 'connected' ? 'bg-[#e9f4ed] text-[#2e7158]' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
              {statusText}
            </span>
          </div>
          <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-[#f8faf8] px-6 text-center">
            <Activity className="h-8 w-8 text-[#4c8066]" strokeWidth={1.7} />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {telemetry ? 'Live snapshot received; historical series is not available yet.' : 'No production readings yet'}
            </p>
            <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
              {activeSystem.providerStationCode
                ? (activeSystem.monitoringError || 'The dashboard will show measurements after a successful FusionSolar response.')
                : 'Ask an administrator to link this system to its FusionSolar station. No sample readings are generated.'}
            </p>
            <p className="mt-3 text-[11px] text-slate-400">Last updated: {lastUpdated}</p>
          </div>
          {refreshMessage && <p role="status" className="mt-3 text-xs text-slate-500">{refreshMessage}</p>}
        </article>

        <article className="solar-card flex flex-col justify-between rounded-2xl bg-white p-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Connection details</h2>
              <CloudSun className="h-5 w-5 text-[#b58a2b]" strokeWidth={1.7} />
            </div>
            <div className="mt-4 rounded-xl border border-[#e4e9e2] bg-[#f8faf8] p-4">
              <p className="text-xs font-semibold text-slate-700">{activeSystem.connectionMethod || 'Not connected'}</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                {activeSystem.monitoringError || (status === 'connected'
                  ? 'Live readings have been received from the provider.'
                  : 'System setup does not establish a provider connection or create telemetry.')}
              </p>
              <p className="mt-3 text-[11px] text-slate-400">Last provider response: {lastUpdated}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('performance')}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9e5db] bg-[#f2f7f2] px-3 py-2.5 text-xs font-semibold text-[#2e634d] transition hover:bg-[#e8f1e8]"
          >
            View monitoring details <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </article>
      </section>

      <SystemWeatherCard location={activeSystem.location} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="solar-card rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#b58a2b]" />
              <h2 className="text-base font-bold text-slate-900">{t.dashboard.recentAlerts}</h2>
            </div>
            <button type="button" onClick={() => onNavigate('alerts')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#2e7158] hover:underline">
              {t.viewDetails}<ArrowRight className={`h-3 w-3 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {recentAlerts.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">{t.dashboard.noAlerts}</p>
          ) : recentAlerts.map((alert) => (
            <div key={alert.id} className="border-t border-slate-100 py-3">
              <p className="text-xs font-semibold text-slate-800">{alert.title}</p>
              <p className="mt-1 text-xs text-slate-500">{alert.explanation}</p>
            </div>
          ))}
        </article>

        <article className="solar-card rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#2e7158]" />
              <h2 className="text-base font-bold text-slate-900">{t.dashboard.recentMaintenance}</h2>
            </div>
            <button type="button" onClick={() => onNavigate('maintenance')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#2e7158] hover:underline">
              {t.viewDetails}<ArrowRight className={`h-3 w-3 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {recentMaintenance.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">{t.dashboard.noMaintenance}</p>
          ) : recentMaintenance.map((request) => (
            <div key={request.id} className="border-t border-slate-100 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800">{request.problemCategory}</p>
                <StatusBadge status={request.status} size="sm" />
              </div>
              <p className="mt-1 text-xs text-slate-500">{request.description}</p>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
};
