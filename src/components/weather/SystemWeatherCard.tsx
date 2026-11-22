import React from 'react';
import { CloudSun, Droplets, RefreshCw, Wind } from 'lucide-react';
import { useSolarWeather } from '../../hooks/useSolarWeather';

interface SystemWeatherCardProps {
  location: string;
  compact?: boolean;
}

export const SystemWeatherCard: React.FC<SystemWeatherCardProps> = ({ location, compact = false }) => {
  const weather = useSolarWeather(location);

  return (
    <section
      className="rounded-2xl border border-[#e7e9e5] bg-[#f7f8f6] p-4"
      aria-label={`Weather for ${location || 'solar system location'}`}
      aria-busy={weather.status === 'loading'}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5eee4] text-[#3b7056]">
            <CloudSun className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-xs font-bold text-slate-800">Local weather</h2>
            <p className="text-[11px] text-slate-500">
              {weather.status === 'live' ? weather.data.locationName : location || 'Location required'}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
          weather.status === 'live'
            ? 'bg-[#e5eee4] text-[#2e5f49]'
            : weather.status === 'loading'
              ? 'bg-[#f8efbb] text-[#83661f]'
              : 'bg-slate-200 text-slate-600'
        }`}>
          {weather.status === 'live' ? 'LIVE' : weather.status === 'loading' ? 'LOADING' : 'UNAVAILABLE'}
        </span>
      </div>

      {weather.status === 'loading' && (
        <p className="mt-4 text-xs text-slate-500">Loading current conditions and forecast…</p>
      )}

      {weather.status === 'error' && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p role="status" className="text-xs text-slate-600">
            {location ? 'Weather is unavailable for this location.' : 'Add a city or location to see local weather.'}
          </p>
          {location && (
            <button
              type="button"
              onClick={weather.retry}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#cfdfcf] px-2.5 py-1.5 text-[11px] font-semibold text-[#2e5f49] transition hover:bg-white"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {weather.status === 'live' && (
        <>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">{weather.data.tempC}°C</span>
              <div className="pb-0.5">
                <p className="text-xs font-semibold text-slate-700">{weather.data.condition}</p>
                <p className="text-[10px] text-slate-500">Feels like {weather.data.apparentTempC}°C</p>
              </div>
            </div>
            <div className="flex gap-3 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1"><Droplets className="h-3.5 w-3.5 text-[#3b7056]" />{weather.data.humidityPct}%</span>
              <span className="inline-flex items-center gap-1"><Wind className="h-3.5 w-3.5 text-[#3b7056]" />{weather.data.windKmh} km/h</span>
            </div>
          </div>
          <div className={`mt-4 grid ${compact ? 'grid-cols-3' : 'grid-cols-5'} gap-2 border-t border-[#e7e9e5] pt-3`}>
            {weather.data.forecast.slice(0, compact ? 3 : 5).map((day) => (
              <div key={day.date} className="min-w-0 text-center">
                <p className="text-[10px] font-semibold text-slate-500">
                  {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="mt-1 truncate text-[10px] text-slate-600" title={day.condition}>{day.condition}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-800">{day.highC}° <span className="font-medium text-slate-500">{day.lowC}°</span></p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-slate-400">Current conditions and 5-day forecast · Open-Meteo</p>
        </>
      )}
    </section>
  );
};
