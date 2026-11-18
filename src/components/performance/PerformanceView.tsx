import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Info,
  Sun,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';

interface PerformanceViewProps {
  onNavigateToMaintenance: () => void;
  onNavigateToTechnicians: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  onNavigateToMaintenance,
  onNavigateToTechnicians,
}) => {
  const { t, isRtl } = useLanguage();
  const { activeSystem, weeklyReadings, diagnosticResult, weather } = useSolar();

  const [activeFilter, setActiveFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedRecordDate, setSelectedRecordDate] = useState<string | null>(null);

  const today = weeklyReadings[weeklyReadings.length - 1];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.performance.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {activeSystem.name} ({activeSystem.capacityKw} kW)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.performance.subtitle}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveFilter('daily')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFilter === 'daily'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Telemetry
          </button>
          <button
            onClick={() => setActiveFilter('weekly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFilter === 'weekly'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7-Day History
          </button>
          <button
            onClick={() => setActiveFilter('monthly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFilter === 'monthly'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Aggregates
          </button>
        </div>
      </div>

      {/* Transparent Rule-Based Diagnostic Engine Verdict Card */}
      <div className={`solar-card p-6 border-l-4 ${
        diagnosticResult.status === 'Normal'
          ? 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/40 via-white to-white'
          : diagnosticResult.status === 'Needs Attention'
          ? 'border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white'
          : diagnosticResult.status === 'Possible System Issue'
          ? 'border-l-rose-500 bg-gradient-to-r from-rose-50/40 via-white to-white'
          : 'border-l-slate-400 bg-gradient-to-r from-slate-50 via-white to-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.performance.diagnosticCardTitle}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
                Rule-Based Engine v2.4
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">
                {diagnosticResult.summary}
              </h2>
              <StatusBadge status={diagnosticResult.status} />
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">{t.performance.metricEfficiency}</span>
              <span className="text-lg font-extrabold text-slate-900">
                {diagnosticResult.performancePct !== null ? `${diagnosticResult.performancePct}%` : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">{t.performance.metricDeviation}</span>
              <span className={`text-lg font-extrabold ${diagnosticResult.deviationPct && diagnosticResult.deviationPct < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {diagnosticResult.deviationPct !== null ? `${diagnosticResult.deviationPct > 0 ? '+' : ''}${diagnosticResult.deviationPct}%` : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Confidence Level</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {diagnosticResult.confidence}
              </span>
            </div>
          </div>
        </div>

        {/* Data Source & Notice */}
        <div className="py-3 flex flex-wrap items-center justify-between text-xs text-slate-500 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{diagnosticResult.dataSourceNote}</span>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            *Transparent demo engine. Does not label a fault as confirmed without multi-point telemetric evidence.
          </p>
        </div>

        {/* Deep Explanations & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Possible Explanations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.performance.possibleExplanations}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              {diagnosticResult.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.performance.recommendedNextSteps}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              {diagnosticResult.recommendations.map((step, i) => (
                <li key={i} className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0"></span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            {/* Contextual Action Button */}
            {diagnosticResult.status === 'Needs Attention' && (
              <button
                onClick={onNavigateToMaintenance}
                className="mt-3.5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Schedule Gentle Panel Cleaning Service</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
            {diagnosticResult.status === 'Possible System Issue' && (
              <button
                onClick={onNavigateToTechnicians}
                className="mt-3.5 w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Find Qualified {activeSystem.inverterBrand} Technician</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Historical Telemetry Log Table */}
      <div className="solar-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.performance.historicalRecordsTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Daily recorded output, solar irradiance context, and transparent classification status.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Showing 7 entries for {activeSystem.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">{t.performance.tableDate}</th>
                <th className="py-3 px-3.5">{t.performance.tableActual}</th>
                <th className="py-3 px-3.5">{t.performance.tableExpected}</th>
                <th className="py-3 px-3.5">{t.performance.tableDeviation}</th>
                <th className="py-3 px-3.5">{t.performance.tableWeather}</th>
                <th className="py-3 px-3.5">{t.performance.tableStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeklyReadings.map((day) => {
                const variance = day.expectedKwh > 0 ? ((day.actualKwh - day.expectedKwh) / day.expectedKwh) * 100 : 0;
                const isSelected = selectedRecordDate === day.date;

                return (
                  <tr
                    key={day.date}
                    onClick={() => setSelectedRecordDate(day.date)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="py-3 px-3.5 font-semibold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {day.date}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {day.isMissingData ? (
                        <span className="text-slate-400 italic">Data Missing</span>
                      ) : (
                        `${day.actualKwh} kWh`
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {day.expectedKwh} kWh
                    </td>
                    <td className="py-3 px-3.5">
                      {day.isMissingData ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className={`font-bold ${variance < -15 ? 'text-amber-700' : variance < -25 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {day.weatherCondition} • {day.peakSunHours} PSH
                    </td>
                    <td className="py-3 px-3.5">
                      <StatusBadge
                        status={
                          day.status === 'normal'
                            ? 'Normal'
                            : day.status === 'attention'
                            ? 'Needs Attention'
                            : day.status === 'issue'
                            ? 'Possible System Issue'
                            : 'Insufficient Data'
                        }
                        size="sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
