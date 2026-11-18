import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { AlertItem } from '../../types';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  ArrowRight,
  ShieldAlert,
  Info,
  Clock,
  ExternalLink,
  Check,
} from 'lucide-react';

interface AlertsViewProps {
  onNavigate: (route: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onNavigate }) => {
  const { t, isRtl } = useLanguage();
  const { alerts, systems, markAlertAsRead, markAlertAsUnread, markAllAlertsAsRead } = useSolar();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'critical' | 'info'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (unreadOnly && alert.isRead) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.alerts.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {alerts.filter(a => !a.isRead).length} Unread
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.alerts.subtitle}
          </p>
        </div>

        {/* Global Action: Mark All Read */}
        <button
          onClick={markAllAlertsAsRead}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.alerts.markAllRead}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="solar-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </span>

          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              severityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.alerts.filterAll}
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              severityFilter === 'critical'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Critical Only
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              severityFilter === 'warning'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setSeverityFilter('info')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              severityFilter === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Informational
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>{t.alerts.filterUnread}</span>
        </label>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="solar-card p-12 text-center text-slate-400 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700">{t.alerts.noAlertsFound}</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const system = systems.find(s => s.id === alert.systemId);
            return (
              <div
                key={alert.id}
                className={`solar-card p-5 transition-all border-l-4 ${
                  alert.severity === 'critical'
                    ? 'border-l-rose-500 bg-white'
                    : alert.severity === 'warning'
                    ? 'border-l-amber-500 bg-white'
                    : 'border-l-blue-500 bg-white'
                } ${!alert.isRead ? 'shadow-sm ring-1 ring-emerald-500/10' : 'opacity-90'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Affects: <span className="font-bold text-slate-800">{system?.name || alert.systemId}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.date}
                      </span>
                      {!alert.isRead && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[9px] font-extrabold uppercase">
                          New
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 pt-0.5">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {alert.explanation}
                    </p>

                    {/* Suggested Action Box */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                      <span className="font-bold text-slate-800 block mb-0.5">
                        💡 {t.alerts.suggestedAction}:
                      </span>
                      <span className="text-slate-600">{alert.suggestedAction}</span>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {alert.actionRoute && (
                      <button
                        onClick={() => onNavigate(alert.actionRoute!)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>
                          {alert.actionRoute === 'performance'
                            ? t.alerts.inspectPerformance
                            : alert.actionRoute === 'technicians'
                            ? t.alerts.bookTechnician
                            : 'Open Action'}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        alert.isRead
                          ? markAlertAsUnread(alert.id)
                          : markAlertAsRead(alert.id)
                      }
                      className="text-xs text-slate-400 hover:text-slate-700 py-1 px-2 font-medium"
                    >
                      {alert.isRead ? t.alerts.markAsUnread : t.alerts.markAsRead}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
