import { useCallback, useEffect, useState } from 'react';

export interface SolarWeatherDay {
  date: string;
  highC: number;
  lowC: number;
  condition: string;
}

export interface SolarWeather {
  locationName: string;
  tempC: number;
  apparentTempC: number;
  humidityPct: number;
  windKmh: number;
  condition: string;
  forecast: SolarWeatherDay[];
}

type WeatherState =
  | { location: string; status: 'loading' | 'error'; data: null }
  | { location: string; status: 'live'; data: SolarWeather };

interface GeocodingResponse {
  results?: Array<{
    name: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

interface ForecastResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

const weatherCondition = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorms';
  return 'Unavailable';
};

export const useSolarWeather = (location: string) => {
  const normalizedLocation = location.trim();
  const [state, setState] = useState<WeatherState>({
    location: '',
    status: 'loading',
    data: null,
  });
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback(() => {
    setState({ location: normalizedLocation, status: 'loading', data: null });
    setRetryToken((token) => token + 1);
  }, [normalizedLocation]);

  useEffect(() => {
    const timer = window.setInterval(retry, 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [retry]);

  useEffect(() => {
    const controller = new AbortController();
    if (!normalizedLocation) {
      return () => controller.abort();
    }

    const loadWeather = async () => {
      try {
        const cityName = normalizedLocation.split(/[,(]/, 1)[0].trim();
        const searchTerms = Array.from(new Set([normalizedLocation, cityName].filter(Boolean)));
        let place: NonNullable<GeocodingResponse['results']>[number] | undefined;

        for (const searchTerm of searchTerms) {
          const geocodingResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=en&format=json`,
            { signal: controller.signal },
          );
          if (!geocodingResponse.ok) throw new Error('Location lookup failed');
          const geocoding = await geocodingResponse.json() as GeocodingResponse;
          place = geocoding.results?.[0];
          if (place) break;
        }
        if (!place || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
          throw new Error('Location not found');
        }

        const forecastResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`,
          { signal: controller.signal },
        );
        if (!forecastResponse.ok) throw new Error('Weather request failed');
        const forecast = await forecastResponse.json() as ForecastResponse;
        const current = forecast.current;
        const daily = forecast.daily;
        if (!current || !daily
          || ![
            current.temperature_2m,
            current.apparent_temperature,
            current.relative_humidity_2m,
            current.wind_speed_10m,
            current.weather_code,
          ].every(Number.isFinite)
          || daily.time.length !== daily.temperature_2m_max.length
          || daily.time.length !== daily.temperature_2m_min.length
          || daily.time.length !== daily.weather_code.length
          || !daily.temperature_2m_max.every(Number.isFinite)
          || !daily.temperature_2m_min.every(Number.isFinite)
          || !daily.weather_code.every(Number.isFinite)) {
          throw new Error('Weather data is incomplete');
        }

        setState({
          location: normalizedLocation,
          status: 'live',
          data: {
            locationName: [place.name, place.admin1].filter(Boolean).join(', '),
            tempC: Math.round(current.temperature_2m),
            apparentTempC: Math.round(current.apparent_temperature),
            humidityPct: Math.round(current.relative_humidity_2m),
            windKmh: Math.round(current.wind_speed_10m),
            condition: weatherCondition(current.weather_code),
            forecast: daily.time.map((date, index) => ({
              date,
              highC: Math.round(daily.temperature_2m_max[index]),
              lowC: Math.round(daily.temperature_2m_min[index]),
              condition: weatherCondition(daily.weather_code[index]),
            })),
          },
        });
      } catch {
        if (!controller.signal.aborted) {
          setState({ location: normalizedLocation, status: 'error', data: null });
        }
      }
    };

    void loadWeather();
    return () => controller.abort();
  }, [normalizedLocation, retryToken]);

  const displayState: WeatherState = !normalizedLocation
    ? { location: normalizedLocation, status: 'error', data: null }
    : state.location === normalizedLocation
      ? state
      : { location: normalizedLocation, status: 'loading', data: null };
  return { ...displayState, retry };
};
