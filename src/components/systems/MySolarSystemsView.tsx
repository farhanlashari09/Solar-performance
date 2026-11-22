import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import {
  PlusCircle,
  CheckCircle,
  MapPin,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { SystemWeatherCard } from '../weather/SystemWeatherCard';

interface MySolarSystemsViewProps {
  onOpenOnboarding: () => void;
  onNavigateToPerformance: () => void;
}

export const MySolarSystemsView: React.FC<MySolarSystemsViewProps> = ({
  onOpenOnboarding,
  onNavigateToPerformance,
}) => {
  const { t } = useLanguage();
  const { systems, activeSystem, setActiveSystemId } = useSolar();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.nav.systems}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your registered photovoltaic installations, inverter data feeds, and hardware specifications.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-emerald-700/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.profile.addNewSystem}</span>
        </button>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systems.map((s) => {
          const isActive = s.id === activeSystem.id;

          return (
            <div
              key={s.id}
              className={`solar-card p-6 flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/20'
                  : 'hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Name, kW, Active indicator */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                          Active System
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.location}</span>
                    </p>
                  </div>

                  <span className="font-extrabold text-base text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    {s.capacityKw} kW
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Inverter Brand & Model</span>
                    <span className="font-semibold text-slate-800">
                      {s.inverterBrand} {s.inverterModel}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Installation Date</span>
                    <span className="font-semibold text-slate-800">
                      {s.installationDate || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Array Sizing</span>
                    <span className="font-semibold text-slate-800">
                      {s.panelCount} × Tier-1 Modules
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Module Spec</span>
                    <span className="font-semibold text-slate-800 truncate block" title={s.panelType}>
                      {s.panelType || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Connection Feed Status */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-500 text-[11px] block">Data Feed Connection:</span>
                      <span className="font-medium text-slate-800">{s.connectionMethod}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.connectionStatus === 'connected'
                        ? 'bg-[#e9f4ed] text-[#2e7158]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.connectionStatus === 'connected'
                      ? 'Live readings'
                      : s.monitoringStatus === 'unconfigured'
                        ? 'Provider not configured'
                        : s.monitoringStatus === 'error'
                          ? 'Connection error'
                          : s.providerStationCode
                            ? 'Awaiting readings'
                            : 'Not connected'}
                  </span>
                </div>

                <div className="mt-4">
                  <SystemWeatherCard location={s.location} compact />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                {!isActive ? (
                  <button
                    onClick={() => setActiveSystemId(s.id)}
                    className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold transition-colors"
                  >
                    Switch to This System
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Currently Selected
                  </span>
                )}

                <button
                  onClick={() => {
                    setActiveSystemId(s.id);
                    onNavigateToPerformance();
                  }}
                  className="py-2 px-3.5 text-emerald-700 hover:underline font-bold flex items-center gap-1"
                >
                  <span>View Diagnostics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
