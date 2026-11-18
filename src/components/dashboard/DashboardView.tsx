import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Sun,
  Zap,
  TrendingUp,
  CloudSun,
  AlertTriangle,
  Wrench,
  MessageSquare,
  ArrowRight,
  Info,
  Calendar,
  Thermometer,
  Wind,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
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
  const { activeSystem, weeklyReadings, hourlyReadings, diagnosticResult, weather, alerts } = useSolar();
  const { serviceRequests } = useMaintenance();
  const { currentUser } = useAuth();

  const [chartTimeframe, setChartTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Today's values
  const todayRecord = weeklyReadings[weeklyReadings.length - 1];
  const actualKwh = todayRecord ? todayRecord.actualKwh : 0;
  const expectedKwh = todayRecord ? todayRecord.expectedKwh : 0;

  // Formula: Performance percentage = (Actual production / Expected production) × 100
  const performancePct =
    expectedKwh > 0 ? Number(((actualKwh / expectedKwh) * 100).toFixed(1)) : null;

  const recentAlerts = alerts.filter(a => a.systemId === activeSystem.id).slice(0, 2);
  const recentMaintenance = serviceRequests.filter(r => r.systemId === activeSystem.id).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-darkest via-brand-dark to-slate-900 text-white p-6 sm:p-8 shadow-lg shadow-emerald-950/20 border border-emerald-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>{t.demoDataBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.dashboard.welcome}, {currentUser?.name || 'Homeowner'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitoring <span className="text-white font-semibold">{activeSystem.name}</span> ({activeSystem.capacityKw} kW, {activeSystem.inverterBrand}) located in {activeSystem.location}.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('performance')}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{t.dashboard.actionViewPerf}</span>
            </button>
            <button
              onClick={onOpenNewServiceRequest}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-500/30"
            >
              <Wrench className="w-4 h-4 text-slate-950" />
              <span>{t.dashboard.actionRequestMaint}</span>
            </button>
            <button
              onClick={onOpenAssistant}
              className="py-2.5 px-4 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-400/20"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{t.dashboard.actionAskAssistant}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Status & Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Actual Production */}
        <div className="solar-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t.dashboard.todayActual}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {todayRecord?.isMissingData ? '—' : actualKwh}
            </span>
            <span className="text-sm font-semibold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Cumulative since 06:00 AM (Demo)</span>
          </p>
        </div>

        {/* Card 2: Expected Production */}
        <div className="solar-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t.dashboard.expectedProduction}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {expectedKwh}
            </span>
            <span className="text-sm font-semibold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Calculated solar irradiance baseline
          </p>
        </div>

        {/* Card 3: Performance Ratio & Formula */}
        <div className="solar-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold">{t.dashboard.performancePercentage}</span>
              <div
                title={t.dashboard.formulaNote}
                className="cursor-help text-slate-400 hover:text-slate-600"
              >
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${performancePct && performancePct >= 88 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${performancePct === null ? 'text-slate-400' : performancePct >= 88 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {performancePct !== null ? `${performancePct}%` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate" title={t.dashboard.formulaNote}>
            {t.dashboard.formulaNote}
          </p>
        </div>

        {/* Card 4: System Health & Diagnostic Verdict */}
        <div className="solar-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.dashboard.systemHealth}</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1">
              <StatusBadge status={diagnosticResult.status} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 truncate" title={diagnosticResult.summary}>
            {diagnosticResult.summary}
          </p>
        </div>
      </div>

      {/* Main Grid: Production Chart & Weather Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production History Chart (2 Cols) */}
        <div className="lg:col-span-2 solar-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {t.dashboard.productionHistory}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {t.demoDataBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.dashboard.actualVsExpectedLegend}
              </p>
            </div>

            {/* Timeframe Toggles */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                onClick={() => setChartTimeframe('day')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartTimeframe === 'day'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dashboard.timeframeDay} (Hourly)
              </button>
              <button
                onClick={() => setChartTimeframe('week')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartTimeframe === 'week'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dashboard.timeframeWeek} (7 Days)
              </button>
              <button
                onClick={() => setChartTimeframe('month')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  chartTimeframe === 'month'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.dashboard.timeframeMonth} (30 Days)
              </button>
            </div>
          </div>

          {/* Render Responsive SVG Chart */}
          {chartTimeframe === 'day' && (
            <div>
              <div className="h-64 w-full relative">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 600 220"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="170" x2="600" y2="170" stroke="#f1f5f9" strokeWidth="1" />

                  {/* SVG Bars for Hourly Comparison */}
                  {hourlyReadings.map((reading, i) => {
                    const x = i * (600 / hourlyReadings.length) + 10;
                    const maxKwh = 6.0;
                    const hActual = Math.max(2, (reading.actualKwh / maxKwh) * 160);
                    const hExpected = Math.max(2, (reading.expectedKwh / maxKwh) * 160);
                    const yActual = 180 - hActual;
                    const yExpected = 180 - hExpected;
                    const isHovered = hoveredPointIndex === i;

                    return (
                      <g
                        key={reading.hour}
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        className="cursor-pointer"
                      >
                        {/* Expected Bar (grey back) */}
                        <rect
                          x={x}
                          y={yExpected}
                          width="14"
                          height={hExpected}
                          rx="3"
                          fill="#cbd5e1"
                          opacity="0.6"
                        />
                        {/* Actual Bar (green front) */}
                        <rect
                          x={x + 4}
                          y={yActual}
                          width="14"
                          height={hActual}
                          rx="3"
                          fill={isHovered ? '#059669' : '#10b981'}
                        />
                        {/* Hour Label */}
                        <text
                          x={x + 7}
                          y="200"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                          fontWeight="500"
                        >
                          {reading.hour.split(':')[0]}h
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Hourly Chart Details / Hover Tooltip */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                    <span className="font-semibold text-slate-700">Actual Production</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-300 inline-block"></span>
                    <span className="font-semibold text-slate-700">Modeled Baseline</span>
                  </div>
                </div>
                {hoveredPointIndex !== null && hourlyReadings[hoveredPointIndex] && (
                  <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
                    {hourlyReadings[hoveredPointIndex].hour} — Actual: {hourlyReadings[hoveredPointIndex].actualKwh} kWh | Expected: {hourlyReadings[hoveredPointIndex].expectedKwh} kWh | Irradiance: {hourlyReadings[hoveredPointIndex].irradianceWm2} W/m²
                  </div>
                )}
              </div>
            </div>
          )}

          {chartTimeframe === 'week' && (
            <div>
              <div className="h-64 w-full flex items-end justify-between gap-3 pt-6 pb-2">
                {weeklyReadings.map((day, idx) => {
                  const maxDayKwh = activeSystem.capacityKw * 4.5 || 50;
                  const pctActual = Math.min(100, (day.actualKwh / maxDayKwh) * 100);
                  const pctExpected = Math.min(100, (day.expectedKwh / maxDayKwh) * 100);

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.actualKwh} kWh
                      </div>
                      <div className="w-full flex items-end justify-center gap-1.5 h-44 bg-slate-50 rounded-xl p-1 relative border border-slate-100">
                        {/* Expected Bar */}
                        <div
                          style={{ height: `${pctExpected}%` }}
                          className="w-3 bg-slate-300 rounded-t-sm"
                          title={`Expected: ${day.expectedKwh} kWh`}
                        ></div>
                        {/* Actual Bar */}
                        <div
                          style={{ height: `${pctActual}%` }}
                          className={`w-3.5 rounded-t-sm transition-all ${
                            day.isMissingData
                              ? 'bg-slate-200'
                              : day.status === 'issue'
                              ? 'bg-rose-500'
                              : day.status === 'attention'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          title={`Actual: ${day.actualKwh} kWh (${day.weatherCondition})`}
                        ></div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full">
                        {day.date.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Needs Attention
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> System Issue
                </span>
                <span>Values shown in cumulative kilowatt-hours (kWh)</span>
              </div>
            </div>
          )}

          {chartTimeframe === 'month' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-500">Monthly generation comparison for active system:</p>
              <div className="space-y-2.5">
                {[
                  { month: 'Jun 2026', actual: 1090, expected: 1150, ratio: 94.8 },
                  { month: 'Jul 2026', actual: 980, expected: 1040, ratio: 94.2 },
                  { month: 'Aug 2026', actual: 1010, expected: 1060, ratio: 95.3 },
                  { month: 'Sep 2026', actual: 1045, expected: 1100, ratio: 95.0 },
                  { month: 'Oct 2026 (MTD)', actual: 412, expected: 445, ratio: 92.6 },
                ].map((m) => (
                  <div key={m.month} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800">{m.month}</span>
                      <span className="text-emerald-700">{m.ratio}% Performance Ratio</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, m.ratio)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Actual: {m.actual} kWh</span>
                      <span>Expected: {m.expected} kWh</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Local Solar Weather Summary (1 Col) */}
        <div className="solar-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">{t.dashboard.weatherTitle}</h3>
              <CloudSun className="w-5 h-5 text-amber-500" />
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50/50 border border-amber-200/60 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900">{weather.tempC}°C</span>
                  <p className="text-xs font-semibold text-amber-800 mt-0.5">{weather.condition}</p>
                </div>
                <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" />
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                {weather.summary}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {t.dashboard.irradiance}
                </span>
                <span className="font-bold text-slate-900">{weather.irradianceWm2} W/m²</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  {t.dashboard.temperature}
                </span>
                <span className="font-bold text-slate-900">{weather.tempC}°C Ambient</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-500" />
                  Wind Speed & UV
                </span>
                <span className="font-bold text-slate-900">{weather.windSpeedKmh} km/h • UV {weather.uvIndex}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('performance')}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Weather Correlation</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Alerts & Recent Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Alerts Card */}
        <div className="solar-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">{t.dashboard.recentAlerts}</h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{t.viewDetails}</span>
              <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {recentAlerts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t.dashboard.noAlerts}</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onNavigate(alt.actionRoute || 'alerts')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                      {alt.title}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${alt.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {alt.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {alt.explanation}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1.5">{alt.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance Card */}
        <div className="solar-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">{t.dashboard.recentMaintenance}</h3>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{t.viewDetails}</span>
              <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {recentMaintenance.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t.dashboard.noMaintenance}</p>
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onNavigate('maintenance')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {m.problemCategory}
                    </span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {m.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Tech: {m.technicianName}</span>
                    <span className="font-mono text-emerald-700 font-bold">{m.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
