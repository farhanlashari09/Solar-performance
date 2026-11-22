import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { Language } from '../../types';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CloudSun,
  Globe,
  Grid2X2,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const LANG_OPTIONS: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ur-roman', label: 'Roman Urdu', short: 'UR' },
  { code: 'ur', label: 'اردو', short: 'اردو' },
];

const referenceDay = new Date();
referenceDay.setDate(referenceDay.getDate() - 1);
const referenceWeek = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(referenceDay);
  date.setDate(referenceDay.getDate() - 6 + index);
  return date;
});
const previousMonth = new Date(referenceDay.getFullYear(), referenceDay.getMonth(), 0);
const chartRanges = {
  day: {
    values: [24, 33, 28, 54, 46, 61, 38, 72, 50, 81, 57, 68, 43, 62, 36, 51, 30, 43, 22],
    labels: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
    total: '44.1 kWh',
    caption: `Illustrative · ${referenceDay.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    target: '48 kWh',
    progress: 92,
  },
  week: {
    values: [20, 42, 34, 55, 48, 77, 62, 52, 69, 58, 84, 70, 63, 76, 52, 67, 55, 88, 74],
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    total: '286.4 kWh',
    caption: `Illustrative · ${referenceWeek[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })}–${referenceWeek[6].toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    target: '320 kWh',
    progress: 90,
  },
  month: {
    values: [18, 30, 26, 47, 42, 65, 50, 60, 75, 58, 81, 72, 68, 85, 74, 90, 71, 83, 78],
    labels: ['1', '5', '9', '13', '17', '21', '25', '30'],
    total: '1,248 kWh',
    caption: `Illustrative · ${previousMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}`,
    target: '1,320 kWh',
    progress: 95,
  },
} as const;

type ChartRange = keyof typeof chartRanges;

const CAROUSEL_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=1800',
    alt: 'Rows of solar panels beneath a clear sky',
  },
  {
    src: '/images/solar-monitoring-display.jpg',
    alt: 'Illustrative solar monitoring dashboard display',
  },
  {
    src: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1800&q=90',
    alt: 'Aerial solar panel array surrounded by green land',
  },
  {
    src: '/images/solar-panel-inspection.jpg',
    alt: 'Installer checking a rooftop solar panel',
  },
  {
    src: '/images/solar-panels-with-inverters.jpg',
    alt: 'Solar panels and inverters installed at a solar farm',
  },
  {
    src: '/images/scenic-solar-array.jpg',
    alt: 'Solar panels in a scenic mountain landscape',
  },
] as const;

interface LiveWeather {
  tempC: number;
  feelsC: number;
  condition: string;
  humidityPct: number;
  windKmh: number;
  cloudsPct: number;
  irradianceWm2: number;
  forecast: Array<{ date: string; maxC: number; minC: number; code: number }>;
  locationName: string;
}

const weatherCondition = (code: number) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorms';
  return 'Cloudy';
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp }) => {
  const { language, setLanguage, isRtl } = useLanguage();
  const { activeSystem } = useSolar();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>('day');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<'loading' | 'live' | 'error'>('loading');

  const t = (en: string, ur: string, roman: string) => {
    if (language === 'ur') return ur;
    if (language === 'ur-roman') return roman;
    return en;
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCarouselIndex((index) => (index + 1) % CAROUSEL_IMAGES.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const location = activeSystem.location.trim();
    if (!location) {
      setLiveWeather(null);
      setWeatherStatus('error');
      return () => controller.abort();
    }

    const loadWeather = async () => {
      setWeatherStatus('loading');
      try {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
        const geocodeResponse = await fetch(geocodeUrl, { signal: controller.signal });
        if (!geocodeResponse.ok) throw new Error('Weather location lookup failed');
        const geocode = await geocodeResponse.json();
        const place = geocode.results?.[0];
        if (!place) throw new Error('Weather location was not found');

        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,shortwave_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        const forecastResponse = await fetch(forecastUrl, { signal: controller.signal });
        if (!forecastResponse.ok) throw new Error('Live weather request failed');
        const forecast = await forecastResponse.json();
        const current = forecast.current;
        if (!current) throw new Error('Live weather data is unavailable');

        setLiveWeather({
          tempC: Math.round(current.temperature_2m),
          feelsC: Math.round(current.apparent_temperature),
          condition: weatherCondition(current.weather_code),
          humidityPct: Math.round(current.relative_humidity_2m),
          windKmh: Math.round(current.wind_speed_10m),
          cloudsPct: Math.round(current.cloud_cover),
          irradianceWm2: Math.round(current.shortwave_radiation ?? 0),
          forecast: (forecast.daily?.time ?? []).map((date: string, index: number) => ({
            date,
            maxC: Math.round(forecast.daily.temperature_2m_max[index]),
            minC: Math.round(forecast.daily.temperature_2m_min[index]),
            code: forecast.daily.weather_code[index],
          })),
          locationName: [place.name, place.admin1].filter(Boolean).join(', '),
        });
        setWeatherStatus('live');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setWeatherStatus('error');
      }
    };

    void loadWeather();
    return () => controller.abort();
  }, [activeSystem.location]);

  const currentLanguage = LANG_OPTIONS.find((option) => option.code === language) || LANG_OPTIONS[0];
  const navigation = [
    { label: t('Overview', 'جائزہ', 'Overview'), href: '#overview', icon: LayoutDashboard },
    { label: t('Solar Farms', 'سولر فارمز', 'Solar Farms'), href: '#farms', icon: Sun },
    { label: t('Panels', 'پینلز', 'Panels'), href: '#panels', icon: Grid2X2 },
    { label: t('Inverters', 'انورٹرز', 'Inverters'), href: '#inverters', icon: Zap },
    { label: t('Weather', 'موسم', 'Weather'), href: '#weather', icon: CloudSun },
  ];
  const palette = {
    page: dark ? 'bg-[#171c19]' : 'bg-[#b8bab7]',
    frame: dark ? 'bg-[#232925] text-[#edf0ec]' : 'bg-[#f2f3f1] text-[#191d1a]',
    panel: dark ? 'bg-[#2c322e] border-white/[0.08]' : 'bg-white border-black/[0.06]',
    inset: dark ? 'bg-[#242a26]' : 'bg-[#f7f8f6]',
    text: dark ? 'text-[#f4f6f3]' : 'text-[#171b18]',
    sub: dark ? 'text-white/60' : 'text-[#707672]',
    faint: dark ? 'text-white/40' : 'text-[#989e99]',
    line: dark ? 'border-white/[0.09]' : 'border-black/[0.07]',
    active: dark ? 'bg-[#39413b] text-white' : 'bg-white text-[#191d1a] shadow-sm',
    hover: dark ? 'hover:bg-white/[0.08]' : 'hover:bg-black/[0.04]',
    footer: dark ? 'border-white/[0.09] text-white/50' : 'border-black/[0.07] text-[#808681]',
  };
  const activeChart = chartRanges[chartRange];
  const chartPoints = activeChart.values
    .map((value, index) => `${(index / (activeChart.values.length - 1)) * 100},${82 - value * 0.66}`)
    .join(' ');
  const chartAreaPoints = `0,100 ${chartPoints} 100,100`;
  const faqs = [
    {
      q: t('Which solar inverters can I monitor?', 'کون سے سولر انورٹر مانیٹر کیے جا سکتے ہیں؟', 'Kin solar inverters ko monitor kar sakta hoon?'),
      a: t(
        'SolarCare supports common inverter brands and connection types. Your available data depends on the inverter and monitoring connection configured for your system.',
        'SolarCare عام انورٹر برانڈز اور کنکشن کی اقسام کو سپورٹ کرتا ہے۔ دستیاب ڈیٹا آپ کے انورٹر اور مانیٹرنگ کنکشن پر منحصر ہے۔',
        'SolarCare aam inverter brands aur connection types ko support karta hai. Data aap ke inverter aur monitoring connection par depend karta hai.'
      ),
    },
    {
      q: t('What should I do about an inverter warning?', 'انورٹر وارننگ پر کیا کرنا چاہیے؟', 'Inverter warning par kya karna chahiye?'),
      a: t(
        'Note the inverter brand and exact warning, then use the Solar Assistant or contact a qualified technician. Never open equipment or touch live solar wiring.',
        'انورٹر کا برانڈ اور وارننگ نوٹ کریں، پھر سولر اسسٹنٹ یا ماہر ٹیکنیشن سے رابطہ کریں۔ سامان نہ کھولیں اور بجلی کی تاروں کو نہ چھوئیں۔',
        'Inverter ka brand aur exact warning note karein, phir Solar Assistant ya qualified technician se rabta karein. Live wiring ko kabhi na chhuyein.'
      ),
    },
    {
      q: t('Is the dashboard data live?', 'کیا ڈیش بورڈ کا ڈیٹا لائیو ہے؟', 'Kya dashboard ka data live hai?'),
      a: t(
        'This landing-page dashboard is an illustrative preview. Your signed-in dashboard uses the readings and connection status available for your registered solar system.',
        'یہ لینڈنگ پیج ڈیش بورڈ ایک نمونہ پیش منظر ہے۔ لاگ ان کے بعد آپ کے ڈیش بورڈ میں رجسٹرڈ سسٹم کی دستیاب ریڈنگز اور کنکشن کی حالت دکھائی جاتی ہے۔',
        'Yeh landing page dashboard sirf preview hai. Login ke baad aap ke registered system ki available readings aur connection status dikhte hain.'
      ),
    },
  ];

  const themeToggle = (
    <button
      type="button"
      onClick={() => setDark((value) => !value)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${palette.hover} ${palette.sub}`}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${palette.page} ${isRtl ? 'font-urdu' : ''}`}>
      <div className="mx-auto max-w-[1640px] px-2.5 py-2.5 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
        <main
          id="overview"
          className={`dashboard-frame dashboard-enter overflow-hidden rounded-[22px] border shadow-[0_24px_70px_rgba(24,30,26,0.16)] sm:rounded-[28px] ${palette.frame} ${palette.line}`}
        >
          <header className={`relative z-30 flex min-h-[68px] items-center justify-between gap-4 border-b px-4 py-3 sm:px-6 lg:px-7 ${palette.line}`}>
            <a href="#overview" className="flex shrink-0 items-center gap-2.5" aria-label="SolarCare overview">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${dark ? 'bg-[#3b473d] text-[#d9e584]' : 'bg-[#191d1a] text-[#f4d346]'}`}>
                <Sun className="h-5 w-5" />
              </span>
              <span className={`text-lg font-bold tracking-tight ${palette.text}`}>SolarCare</span>
            </a>

            <nav aria-label="Main navigation" className={`hidden items-center gap-1 rounded-full p-1 md:flex ${palette.inset}`}>
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-[11px] font-medium transition ${palette.sub} ${palette.hover}`}
                >
                  {t(item.label, item.label, item.label)}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-1 sm:flex">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLanguageOpen((open) => !open)}
                  aria-label="Choose language"
                  aria-expanded={languageOpen}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium transition ${palette.hover} ${palette.sub}`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {currentLanguage.short}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {languageOpen && (
                  <div className={`absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border p-1.5 shadow-xl ${palette.panel}`}>
                    {LANG_OPTIONS.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => { setLanguage(option.code); setLanguageOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${palette.hover} ${palette.text}`}
                      >
                        {option.label}
                        {language === option.code && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {themeToggle}
              <button type="button" onClick={onLogin} className="ml-1 hidden rounded-full border border-current/10 px-4 py-2 text-xs font-semibold transition hover:border-current/25 lg:inline-flex">
                {t('Log in', 'لاگ ان', 'Log in')}
              </button>
              <button type="button" onClick={onSignUp} className={`hidden rounded-full px-4 py-2 text-xs font-semibold transition lg:inline-flex ${dark ? 'bg-[#d9e584] text-[#20251f] hover:bg-[#eff5bd]' : 'bg-[#1d2921] text-white hover:bg-[#3b5940]'}`}>
                {t('Get started', 'شروع کریں', 'Shuru karein')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition sm:hidden ${palette.hover} ${palette.text}`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {mobileOpen && (
              <div className={`absolute inset-x-3 top-full z-40 mt-1 rounded-2xl border p-3 shadow-xl sm:hidden ${palette.panel}`}>
                <nav aria-label="Mobile navigation" className="grid gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium ${palette.sub} ${palette.hover}`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
                <div className={`my-3 flex items-center justify-between border-t pt-3 ${palette.line}`}>
                  <div className="flex gap-1">
                    {LANG_OPTIONS.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => setLanguage(option.code)}
                        aria-pressed={language === option.code}
                        className={`rounded-full px-2.5 py-1.5 text-[10px] ${language === option.code ? 'bg-emerald-100 text-emerald-900' : palette.sub}`}
                      >
                        {option.short}
                      </button>
                    ))}
                  </div>
                  {themeToggle}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setMobileOpen(false); onLogin(); }} className={`rounded-full border px-3 py-2.5 text-xs font-semibold ${palette.line}`}>
                    {t('Log in', 'لاگ ان', 'Log in')}
                  </button>
                  <button type="button" onClick={() => { setMobileOpen(false); onSignUp(); }} className={`rounded-full px-3 py-2.5 text-xs font-semibold ${dark ? 'bg-[#d9e584] text-[#20251f]' : 'bg-[#1d2921] text-white'}`}>
                    {t('Get started', 'شروع کریں', 'Shuru karein')}
                  </button>
                </div>
              </div>
            )}

          </header>

          <div className="grid gap-3 p-3 md:grid-cols-[52px_minmax(260px,0.82fr)_minmax(0,1.8fr)] lg:gap-4 lg:p-4">
            <aside className={`hidden flex-col items-center justify-between rounded-2xl border py-3 md:flex ${palette.panel}`}>
              <nav aria-label="Dashboard shortcuts" className="flex flex-col items-center gap-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${index === 0 ? (dark ? 'bg-[#f2f3ef] text-[#171b18]' : 'bg-[#191d1a] text-white') : `${palette.sub} ${palette.hover}`}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </nav>
              <div className="flex flex-col items-center gap-2">
                <a href="#support" title="Technician support" aria-label="Technician support" className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${palette.sub} ${palette.hover}`}>
                  <Wrench className="h-4 w-4" />
                </a>
                <a href="#support" title="Profile and support" aria-label="Profile and support" className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${palette.sub} ${palette.hover}`}>
                  <Settings className="h-4 w-4" />
                </a>
              </div>
            </aside>

            <div className="min-w-0 space-y-3">
              <section id="weather" className={`dashboard-panel rounded-2xl border p-4 sm:p-5 ${palette.panel}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${palette.text}`}>{t('System conditions', 'سسٹم کی صورتحال', 'System conditions')}</p>
                    <p className={`mt-1 max-w-[150px] truncate text-[10px] ${palette.sub}`}>
                      {liveWeather?.locationName
                        || activeSystem.location
                        || t('Location not set', 'مقام درج نہیں', 'Location not set')}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${weatherStatus === 'live' ? 'bg-emerald-500/10 text-emerald-600' : palette.inset + ' ' + palette.sub}`}>
                    {weatherStatus === 'live' ? t('LIVE', 'لائیو', 'Live') : weatherStatus === 'loading' ? t('LOADING', 'لوڈنگ', 'Loading') : t('UNAVAILABLE', 'دستیاب نہیں', 'Unavailable')}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="flex items-end gap-3">
                    <span className={`text-[42px] font-medium leading-none tracking-tight ${palette.text}`}>
                      {weatherStatus === 'live' && liveWeather ? `${liveWeather.tempC}°` : '—'}
                    </span>
                    <span className={`mb-1 text-[10px] leading-4 ${palette.sub}`}>
                      {weatherStatus === 'live' && liveWeather ? liveWeather.condition : weatherStatus === 'loading' ? t('Loading weather', 'موسم لوڈ ہو رہا ہے', 'Weather load ho raha hai') : t('Weather unavailable', 'موسم دستیاب نہیں', 'Weather unavailable')}
                      {weatherStatus === 'live' && liveWeather && <><br />{t(`Feels like ${liveWeather.feelsC}°`, `${liveWeather.feelsC}° محسوس`, `Feels like ${liveWeather.feelsC}°`)}</>}
                    </span>
                  </div>
                  <CloudSun className="h-10 w-10 text-[#e8b733] drop-shadow-sm" strokeWidth={1.6} />
                </div>

                <div className={`mt-5 grid grid-cols-4 divide-x text-center ${palette.line}`}>
                  {[
                    { label: t('Irradiance', 'تابکاری', 'Irradiance'), value: weatherStatus === 'live' && liveWeather ? `${liveWeather.irradianceWm2} W/m²` : '—' },
                    { label: t('Humidity', 'نمی', 'Humidity'), value: weatherStatus === 'live' && liveWeather ? `${liveWeather.humidityPct}%` : '—' },
                    { label: t('Wind', 'ہوا', 'Wind'), value: weatherStatus === 'live' && liveWeather ? `${liveWeather.windKmh} km/h` : '—' },
                    { label: t('Clouds', 'بادل', 'Clouds'), value: weatherStatus === 'live' && liveWeather ? `${liveWeather.cloudsPct}%` : '—' },
                  ].map((item) => (
                    <div key={item.label} className="px-1">
                      <p className={`truncate text-[9px] ${palette.sub}`}>{item.label}</p>
                      <p className={`mt-1 text-[10px] font-semibold ${palette.text}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 grid grid-cols-5 border-t pt-3 ${palette.line}`}>
                  {(liveWeather?.forecast ?? []).slice(0, 5).map((forecast, index) => {
                    const Icon = forecast.code <= 1 ? Sun : CloudSun;
                    const date = new Date(`${forecast.date}T12:00:00`);
                    const day = index === 0
                      ? t('Today', 'آج', 'Aaj')
                      : date.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short' });
                    return (
                      <div key={forecast.date} className="flex flex-col items-center gap-1">
                        <span className={`text-[9px] ${palette.sub}`}>{day}</span>
                        <Icon className={`h-3.5 w-3.5 ${forecast.code <= 1 ? 'text-[#e7ba39]' : 'text-sky-500'}`} />
                        <span className={`text-[8px] ${palette.faint}`}>{forecast.maxC}°/{forecast.minC}°</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="energy" className={`dashboard-panel rounded-2xl border p-4 sm:p-5 ${palette.panel}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-sm font-semibold ${palette.text}`}>{t('Energy production', 'توانائی کی پیداوار', 'Energy production')}</h2>
                    <p className={`mt-1 text-[10px] ${palette.sub}`}>{activeChart.caption} · {activeChart.total}</p>
                  </div>
                  <div role="group" aria-label="Energy chart range" className={`flex rounded-lg p-0.5 ${palette.inset}`}>
                    {(['day', 'week', 'month'] as const).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setChartRange(range)}
                        aria-pressed={chartRange === range}
                        className={`rounded-md px-2 py-1.5 text-[9px] font-medium transition ${chartRange === range ? palette.active : palette.sub}`}
                      >
                        {range === 'day' ? t('Daily', 'روزانہ', 'Daily') : range === 'week' ? t('Weekly', 'ہفتہ وار', 'Weekly') : t('Monthly', 'ماہانہ', 'Monthly')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 h-[150px]">
                  <svg key={chartRange} viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${activeChart.caption} solar energy production chart`} className="dashboard-chart h-full w-full overflow-visible">
                    <defs>
                      <linearGradient id="energy-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#8bc978" stopOpacity=".3" />
                        <stop offset="100%" stopColor="#8bc978" stopOpacity=".02" />
                      </linearGradient>
                    </defs>
                    {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="dashboard-chart-grid" />)}
                    {[0, 14, 28, 42, 56, 70, 84, 100].map((x) => <line key={x} x1={x} x2={x} y1="8" y2="90" className="dashboard-chart-grid dashboard-chart-grid-vertical" />)}
                    <polygon points={chartAreaPoints} fill="url(#energy-fill)" />
                    <polyline points={chartPoints} pathLength="100" className="dashboard-chart-line" />
                  </svg>
                </div>
                <div className={`mt-1 flex justify-between font-mono text-[8px] ${palette.sub}`}>
                  {activeChart.labels.map((label) => <span key={label}>{label}</span>)}
                </div>
              </section>

              <section className={`dashboard-panel rounded-2xl border p-4 sm:p-5 ${palette.panel}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-sm font-semibold ${palette.text}`}>{t('Production vs target', 'پیداوار بمقابلہ ہدف', 'Production vs target')}</h2>
                    <p className={`mt-1 text-[10px] ${palette.sub}`}>
                      {chartRange === 'day'
                        ? t('Reference-day example', 'مثالی دن کا حوالہ', 'Reference day example')
                        : chartRange === 'week'
                          ? t('Reference-week example', 'مثالی ہفتے کا حوالہ', 'Reference week example')
                          : t('Previous-month example', 'گزشتہ ماہ کی مثال', 'Pichlay mahinay ki misaal')}
                    </p>
                  </div>
                  <span className={`text-xl font-semibold ${palette.text}`}>{activeChart.progress}%</span>
                </div>
                <div className={`mt-4 h-3 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-[#eceee9]'}`}>
                  <div key={chartRange} className="dashboard-target-fill h-full rounded-full" style={{ width: `${activeChart.progress}%` }} />
                </div>
                <div className={`mt-2 flex justify-between text-[9px] ${palette.sub}`}>
                  <span>{activeChart.total} {t('produced', 'پیداوار', 'produced')}</span>
                  <span>{t('Target', 'ہدف', 'Target')} {activeChart.target}</span>
                </div>
              </section>
            </div>

            <section id="farms" className="dashboard-site relative min-h-[760px] overflow-hidden rounded-2xl bg-[#3f4942] md:min-h-[720px]">
              {CAROUSEL_IMAGES.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={index === carouselIndex ? t(image.alt, image.alt, image.alt) : ''}
                  aria-hidden={index !== carouselIndex}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${index === carouselIndex ? 'dashboard-carousel-active opacity-100' : 'opacity-0'}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/65" />
              <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <a href="#overview" aria-label="Back to overview" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25">
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  </a>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{t('Solar site preview', 'سولر سائٹ کا پیش منظر', 'Solar site preview')}</h2>
                    <p className="mt-0.5 text-[9px] text-white/65">
                      {carouselIndex === 1
                        ? t('Illustrative image · Not live telemetry', 'نمائشی تصویر · براہِ راست ٹیلی میٹری نہیں', 'Illustrative image · Live telemetry nahin')
                        : t('Sample system · Illustrative data', 'نمونہ سسٹم · نمائشی ڈیٹا', 'Sample system · Illustrative data')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <a href="#energy" aria-label="View energy chart" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition hover:bg-white/20">
                    <Activity className="h-3.5 w-3.5" />
                  </a>
                  <a href="#panels" aria-label="View panel information" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition hover:bg-white/20">
                    <Grid2X2 className="h-3.5 w-3.5" />
                  </a>
                  <button type="button" onClick={onSignUp} aria-label="Create an account to add a solar system" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition hover:bg-white/20">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-[170px] right-4 z-20 flex gap-1.5 sm:bottom-[150px] sm:right-5" role="group" aria-label="Solar site images">
                {CAROUSEL_IMAGES.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setCarouselIndex(index)}
                    aria-label={`Show solar image ${index + 1}`}
                    aria-current={index === carouselIndex}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === carouselIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/85'}`}
                  />
                ))}
              </div>

              <div className="dashboard-site-overlay absolute inset-x-3 bottom-3 top-14 z-10 flex flex-col justify-between gap-2.5 sm:inset-x-4 sm:bottom-4 sm:top-16 sm:gap-3">
                <div className="grid justify-items-end">
                  <article className="dashboard-glass-card w-full max-w-[270px] rounded-2xl border border-white/20 bg-[#30322e]/70 p-3.5 text-white shadow-xl backdrop-blur-xl sm:max-w-[290px] sm:p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold">{t('Network performance', 'نیٹ ورک کارکردگی', 'Network performance')}</p>
                        <p className="mt-1 text-[9px] text-white/55">{t('System health overview', 'سسٹم صحت کا جائزہ', 'System health overview')}</p>
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><ArrowUpRight className="h-3.5 w-3.5" /></span>
                    </div>
                    <div className="relative mx-auto mt-1 h-[105px] w-full max-w-[210px]">
                      <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label="Illustrative efficiency 94.2 percent">
                        <defs>
                          <linearGradient id="efficiency-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" stopColor="#5dc878" />
                            <stop offset="57%" stopColor="#d7cc4c" />
                            <stop offset="100%" stopColor="#f09a42" />
                          </linearGradient>
                        </defs>
                        <path d="M18 105 A82 82 0 0 1 182 105" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="10" pathLength="100" />
                        <path d="M18 105 A82 82 0 0 1 182 105" fill="none" stroke="url(#efficiency-gradient)" strokeWidth="10" strokeLinecap="butt" pathLength="100" strokeDasharray="100" strokeDashoffset="8" className="dashboard-gauge-progress" />
                        <text x="100" y="82" textAnchor="middle" className="dashboard-gauge-value">94.2%</text>
                        <text x="100" y="98" textAnchor="middle" className="dashboard-gauge-label">{t('Efficiency', 'کارکرد', 'Efficiency')}</text>
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-white/15 pt-2.5 text-[8px]">
                      {[
                        { label: t('Online', 'آن لائن', 'Online'), value: '11 / 12', color: 'bg-[#64cf82]' },
                        { label: t('Panels', 'پینل', 'Panels'), value: '48 active', color: 'bg-[#e4c64d]' },
                        { label: t('Capacity', 'صلاحیت', 'Capacity'), value: '34.8 kW', color: 'bg-[#f0a14b]' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="flex items-center gap-1 text-white/60"><span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />{item.label}</p>
                          <p className="mt-1 font-semibold text-white/90">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <article id="panels" className="dashboard-glass-card min-w-0 rounded-2xl border border-white/20 bg-[#30322e]/75 p-3.5 text-white shadow-xl backdrop-blur-xl sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-semibold">{t('Panel inventory', 'پینل انوینٹری', 'Panel inventory')}</h3>
                        <p className="mt-1 text-[9px] text-white/55">{t('Sample telemetry readings', 'نمونہ ٹیلی میٹری ریڈنگز', 'Sample telemetry readings')}</p>
                      </div>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[380px] text-left text-[9px]">
                        <thead className="text-white/55">
                          <tr>
                            <th className="pb-2 font-medium">{t('Array', 'ارے', 'Array')}</th>
                            <th className="pb-2 font-medium">{t('Temp', 'درجہ حرارت', 'Temp')}</th>
                            <th className="pb-2 font-medium">{t('Voltage', 'وولٹیج', 'Voltage')}</th>
                            <th className="pb-2 font-medium">{t('Efficiency', 'کارکردگی', 'Efficiency')}</th>
                            <th className="pb-2 font-medium">{t('Status', 'حالت', 'Status')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {[
                            ['Array 01', '42°C', '42.1 V', '96.0%', 'Active'],
                            ['Array 01', '43°C', '42.0 V', '95.1%', 'Active'],
                            ['Array 02', '45°C', '41.7 V', '93.3%', 'Review'],
                            ['Array 02', '44°C', '41.9 V', '94.2%', 'Active'],
                          ].map((row, index) => (
                            <tr key={`${row[0]}-${index}`}>
                              <td className="py-2 pr-2 font-medium">{row[0]}</td>
                              <td className="py-2 pr-2 text-white/75">{row[1]}</td>
                              <td className="py-2 pr-2 text-white/75">{row[2]}</td>
                              <td className="py-2 pr-2 text-white/75">{row[3]}</td>
                              <td className="py-2">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] ${row[4] === 'Active' ? 'bg-emerald-400/15 text-emerald-100' : 'bg-amber-300/15 text-amber-100'}`}>
                                  <span className={`h-1 w-1 rounded-full ${row[4] === 'Active' ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                                  {row[4]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </article>
              </div>
            </section>
          </div>

          <div className={`flex flex-col gap-3 border-t px-4 py-3 text-[10px] sm:flex-row sm:items-center sm:justify-between sm:px-6 ${palette.footer}`}>
            <p>{t('Illustrative dashboard preview · Your registered system data appears after sign in.', 'نمونہ ڈیش بورڈ · لاگ ان کے بعد آپ کے سسٹم کا ڈیٹا نظر آئے گا۔', 'Dashboard preview · Login ke baad aap ke system ka data nazar aaye ga.')}</p>
            <button type="button" onClick={onSignUp} className={`inline-flex items-center gap-1.5 self-start font-semibold transition hover:gap-2.5 sm:self-auto ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              {t('Set up your system', 'اپنا سسٹم سیٹ کریں', 'Apna system set karein')}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </main>

        <section id="panels-info" className={`scroll-mt-6 px-1 py-14 sm:px-2 sm:py-20 lg:py-24 ${dark ? 'text-white' : 'text-[#1b211d]'}`}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`dashboard-kicker ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>{t('Built around your system', 'آپ کے سسٹم کے لیے', 'Aap ke system ke liye')}</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t('Everything you need to run solar with confidence.', 'اعتماد کے ساتھ سولر چلانے کے لیے سب کچھ۔', 'Solar ko yaqeen ke sath chalane ke liye sab kuch.')}</h2>
              </div>
              <p className={`max-w-md text-sm leading-6 ${palette.sub}`}>{t('One place to understand performance, spot issues, and get trusted help.', 'کارکردگی سمجھنے، مسائل پہچاننے اور قابل اعتماد مدد کے لیے ایک جگہ۔', 'Performance samajhne, masail pehchanne aur bharosemand madad ke liye aik jagah.')}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: Activity, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80', alt: t('Solar panels monitored for energy production', 'توانائی کی پیداوار کے لیے زیر نگرانی سولر پینلز', 'Energy production ke liye monitor hotay solar panels'), title: t('Performance monitoring', 'کارکردگی کی نگرانی', 'Performance monitoring'), text: t('Review production, trends, and system health in one clear view.', 'پیداوار، رجحانات اور سسٹم کی صحت ایک واضح منظر میں دیکھیں۔', 'Production, trends aur system health aik jagah dekhein.') },
                { icon: ShieldCheck, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80', alt: t('Technician inspecting electrical equipment', 'الیکٹریکل آلات کا معائنہ کرتا ٹیکنیشن', 'Electrical equipment inspect karta technician'), title: t('Guided diagnostics', 'رہنمائی کے ساتھ تشخیص', 'Guided diagnostics'), text: t('Understand common alerts and explore safe next steps for your system.', 'عام الرٹس سمجھیں اور محفوظ اگلے اقدامات دیکھیں۔', 'Aam alerts samjhein aur mehfooz aglay qadam dekhein.') },
                { icon: Wrench, image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80', alt: t('Support team discussing a customer request', 'صارف کی درخواست پر گفتگو کرتی معاونت ٹیم', 'Customer ki request par baat karti support team'), title: t('Technician support', 'ٹیکنیشن معاونت', 'Technician support'), text: t('Find solar professionals for inspection, maintenance, and repair.', 'معائنے، دیکھ بھال اور مرمت کے لیے سولر ماہرین تلاش کریں۔', 'Inspection, maintenance aur repair ke liye solar experts dhoondein.') },
              ].map(({ icon: Icon, image, alt, title, text }) => (
                <article key={title} className={`dashboard-feature-card rounded-2xl border p-5 sm:p-6 ${palette.panel}`}>
                  <div className="relative h-40 overflow-hidden rounded-xl sm:h-48">
                    <img src={image} alt={alt} loading="lazy" className="dashboard-feature-image h-full w-full object-cover" />
                    <span className={`absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg backdrop-blur ${dark ? 'bg-[#232925]/85 text-emerald-300' : 'bg-white/90 text-emerald-800'}`}><Icon className="h-5 w-5" /></span>
                  </div>
                  <h3 className={`mt-5 text-base font-semibold ${palette.text}`}>{title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${palette.sub}`}>{text}</p>
                  <button type="button" onClick={onSignUp} className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    {t('Explore SolarCare', 'SolarCare دیکھیں', 'SolarCare dekhein')}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="inverters" className={`scroll-mt-6 rounded-[22px] border p-5 sm:rounded-[28px] sm:p-8 lg:p-10 ${palette.frame} ${palette.line}`}>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className={`dashboard-kicker ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>{t('Solar knowledge, within reach', 'سولر معلومات، آپ کے ساتھ', 'Solar maloomat, aap ke sath')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t('A clearer answer to every solar question.', 'ہر سولر سوال کا واضح جواب۔', 'Har solar sawal ka wazeh jawab.')}</h2>
              <p className={`mt-4 max-w-md text-sm leading-6 ${palette.sub}`}>{t('Ask about panels, inverters, batteries, wiring, system sizing, and everyday performance.', 'پینلز، انورٹرز، بیٹری، وائرنگ، سسٹم کے سائز اور روزمرہ کارکردگی کے بارے میں پوچھیں۔', 'Panels, inverter, battery, wiring, system sizing aur performance ke sawal poochein.')}</p>
              <button type="button" onClick={onSignUp} className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold transition ${dark ? 'bg-[#d9e584] text-[#20251f] hover:bg-[#eff5bd]' : 'bg-[#1d2921] text-white hover:bg-[#3b5940]'}`}>
                {t('Get started with SolarCare', 'SolarCare شروع کریں', 'SolarCare shuru karein')}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div id="support" className="space-y-2">
              {faqs.map((faq, index) => {
                const expanded = openFaq === index;
                return (
                  <article key={faq.q} className={`rounded-2xl border px-4 sm:px-5 ${palette.panel} ${palette.line}`}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(expanded ? null : index)}
                      aria-expanded={expanded}
                      className={`flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold ${palette.text}`}
                    >
                      {faq.q}
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${palette.sub} ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded && <p className={`max-w-3xl pb-4 text-sm leading-6 ${palette.sub}`}>{faq.a}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <footer className={`flex flex-col gap-4 px-2 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 ${dark ? 'text-white/55' : 'text-[#59615b]'}`}>
          <a href="#overview" className="flex items-center gap-2 font-semibold text-inherit">
            <Sun className="h-4 w-4 text-emerald-600" />
            SolarCare
          </a>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" onClick={onLogin} className={`transition ${dark ? 'hover:text-emerald-300' : 'hover:text-emerald-800'}`}>{t('Log in', 'لاگ ان', 'Log in')}</button>
            <button type="button" onClick={onSignUp} className={`transition ${dark ? 'hover:text-emerald-300' : 'hover:text-emerald-800'}`}>{t('Create account', 'اکاؤنٹ بنائیں', 'Account banayen')}</button>
            <a href="mailto:farhanlashari61675@gmail.com" className={`transition ${dark ? 'hover:text-emerald-300' : 'hover:text-emerald-800'}`}>farhanlashari61675@gmail.com</a>
          </div>
          <span>© {CURRENT_YEAR} SolarCare</span>
        </footer>
      </div>
    </div>
  );
};
