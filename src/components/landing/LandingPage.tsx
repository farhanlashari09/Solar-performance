import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  ChevronDown,
  CloudSun,
  Globe,
  LayoutDashboard,
  Mail,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const LANDING_WEATHER_LOCATION = 'Lahore, Pakistan';

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
    src: 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg?auto=compress&cs=tinysrgb&w=1800',
    alt: 'Installer checking a rooftop solar panel',
  },
  {
    src: '/images/solar-panels-with-inverters.jpg',
    alt: 'Solar panels and inverters installed at a solar farm',
  },
  {
    src: '/images/solar-monitoring-display.jpg',
    alt: 'Illustrative solar monitoring dashboard display',
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
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>('day');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeLandingSection, setActiveLandingSection] = useState('#overview');
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
    const loadWeather = async () => {
      setLiveWeather(null);
      setWeatherStatus('loading');
      try {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(LANDING_WEATHER_LOCATION)}&count=1&language=en&format=json`;
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
  }, []);

  const currentLanguage = LANG_OPTIONS.find((option) => option.code === language) || LANG_OPTIONS[0];
  const navigation = [
    { label: t('Overview', 'جائزہ', 'Overview'), href: '#overview', icon: LayoutDashboard },
    { label: t('Solar sites', 'سولر سائٹس', 'Solar sites'), href: '#farms', icon: Sun },
    { label: t('Weather', 'موسم', 'Weather'), href: '#weather', icon: CloudSun },
    { label: t('Support', 'مدد', 'Support'), href: '#support', icon: CircleHelp },
    { label: t('Contact', 'رابطہ', 'Contact'), href: '#contact', icon: Mail },
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
    hover: dark ? 'hover:bg-white/[0.08]' : 'hover:bg-black hover:text-white',
    navHover: dark ? 'hover:bg-white/[0.08]' : 'hover:bg-black hover:text-white',
    footer: dark ? 'border-white/[0.09] text-white/50' : 'border-black/[0.07] text-[#808681]',
  };
  const activeChart = chartRanges[chartRange];
  const chartPoints = activeChart.values
    .map((value, index) => `${(index / (activeChart.values.length - 1)) * 100},${82 - value * 0.66}`)
    .join(' ');
  const chartAreaPoints = `0,100 ${chartPoints} 100,100`;
  const faqs = [
    {
      q: t('How do I get started?', 'شروع کیسے کروں؟', 'Shuru kaisay karoon?'),
      a: t(
        'Create an account, then add your system name, city, and capacity. The saved location is used for local weather.',
        'اکاؤنٹ بنائیں، پھر سسٹم کا نام، شہر اور صلاحیت درج کریں۔ محفوظ کیا گیا مقام مقامی موسم کے لیے استعمال ہوتا ہے۔',
        'Account banayein, phir system ka naam, shehar aur capacity darj karein. Saved location local weather ke liye use hoti hai.'
      ),
    },
    {
      q: t('Are production readings live?', 'کیا پیداوار کی ریڈنگز لائیو ہیں؟', 'Kya production readings live hain?'),
      a: t(
        'The website uses clear demo data so you can explore the dashboard before adding a real system.',
        'ویب سائٹ واضح ڈیمو ڈیٹا استعمال کرتی ہے تاکہ آپ حقیقی سسٹم شامل کرنے سے پہلے ڈیش بورڈ دیکھ سکیں۔',
        'Website clear demo data use karti hai taake aap real system add karne se pehle dashboard explore kar sakein.'
      ),
    },
    {
      q: t('How can I add a solar system?', 'میں سولر سسٹم کیسے شامل کر سکتا ہوں؟', 'Main solar system kaise add karoon?'),
      a: t(
        'Sign in, open My Solar Systems, and add the name, location, capacity, and basic equipment details.',
        'سائن ان کریں، میرے سولر سسٹمز کھولیں اور نام، مقام، صلاحیت اور بنیادی سامان کی تفصیلات شامل کریں۔',
        'Sign in karein, My Solar Systems kholein aur naam, location, capacity aur basic equipment details add karein.'
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

            <nav aria-label="Main navigation" className={`hidden items-center gap-1 rounded-full p-1 lg:flex ${palette.inset}`}>
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveLandingSection(item.href)}
                  className={`rounded-full px-4 py-2 text-[11px] font-medium transition ${
                    activeLandingSection === item.href
                        ? 'bg-black text-white'
                        : `${palette.sub} ${palette.navHover}`
                  }`}
                >
                  {t(item.label, item.label, item.label)}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-1 lg:flex">
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
              className={`flex h-9 w-9 items-center justify-center rounded-full transition lg:hidden ${palette.hover} ${palette.text}`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {mobileOpen && (
              <div className={`absolute inset-x-3 top-full z-40 mt-1 rounded-2xl border p-3 shadow-xl lg:hidden ${palette.panel}`}>
                <nav aria-label="Mobile navigation" className="grid gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setActiveLandingSection(item.href);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                          activeLandingSection === item.href
                            ? 'bg-black text-white'
                            : `${palette.sub} ${palette.navHover}`
                        }`}
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
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setActiveLandingSection(item.href)}
                      title={item.label}
                      aria-label={item.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                        activeLandingSection === item.href
                          ? 'bg-black text-white'
                          : `${palette.sub} ${palette.navHover}`
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </nav>
              <div className="flex flex-col items-center gap-2">
                <a href="#support" title="Support information" aria-label="Support information" className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${palette.sub} ${palette.navHover}`}>
                  <CircleHelp className="h-4 w-4" />
                </a>
                <a href="#contact" title="Contact SolarCare" aria-label="Contact SolarCare" className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${palette.sub} ${palette.navHover}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </aside>

            <div className="min-w-0 space-y-3">
              <section id="weather" className={`dashboard-panel rounded-2xl border p-4 sm:p-5 ${palette.panel}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${palette.text}`}>{t('System conditions', 'سسٹم کی صورتحال', 'System conditions')}</p>
                    <p className={`mt-1 max-w-[150px] truncate text-[10px] ${palette.sub}`}>
                      {liveWeather?.locationName || LANDING_WEATHER_LOCATION}
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
                        className={`rounded-md px-2 py-1.5 text-[9px] font-medium transition ${chartRange === range ? (dark ? 'bg-[#39413b] text-white' : 'bg-[#e3e8e2] text-[#171b18]') : palette.sub} ${palette.navHover}`}
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

            <section id="farms" className="dashboard-site relative min-h-[600px] overflow-hidden rounded-2xl bg-[#3f4942] md:min-h-[620px]">
              {CAROUSEL_IMAGES.map((image, index) => {
                if (index !== carouselIndex && index !== (carouselIndex + 1) % CAROUSEL_IMAGES.length) return null;
                return (
                  <img
                    key={`${image.src}-${index}`}
                    src={image.src}
                    alt={index === carouselIndex ? t(image.alt, image.alt, image.alt) : ''}
                    aria-hidden={index !== carouselIndex}
                    loading={index === carouselIndex ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={index === carouselIndex ? 'high' : 'low'}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${index === carouselIndex ? 'dashboard-carousel-active opacity-100' : 'opacity-0'}`}
                  />
                );
              })}
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
                  <a href="#weather" aria-label="View local weather" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition hover:bg-black hover:text-white">
                    <Activity className="h-3.5 w-3.5" />
                  </a>
                  <a href="#support" aria-label="View support information" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition hover:bg-black hover:text-white">
                    <CircleHelp className="h-3.5 w-3.5" />
                  </a>
                  <button type="button" onClick={onSignUp} aria-label="Create an account to add a solar system" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition hover:bg-black hover:text-white">
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold">{t('Local weather', 'مقامی موسم', 'Local weather')}</p>
                        <p className="mt-1 text-[9px] text-white/65">{liveWeather?.locationName || LANDING_WEATHER_LOCATION}</p>
                      </div>
                      <CloudSun className="h-6 w-6 shrink-0 text-[#e8b733]" />
                    </div>
                    <div className="mt-4 flex items-end gap-2 border-t border-white/15 pt-3">
                      <span className="text-3xl font-semibold leading-none">
                        {weatherStatus === 'live' && liveWeather ? `${liveWeather.tempC}°C` : '—'}
                      </span>
                      <span className="pb-0.5 text-[10px] text-white/70">
                        {weatherStatus === 'live' && liveWeather
                          ? liveWeather.condition
                          : weatherStatus === 'loading'
                            ? t('Loading current conditions', 'موجودہ موسم لوڈ ہو رہا ہے', 'Mojooda mausam load ho raha hai')
                            : t('Weather unavailable', 'موسم دستیاب نہیں', 'Weather unavailable')}
                      </span>
                    </div>
                  </article>
                </div>

                <article className="dashboard-glass-card min-w-0 max-w-xl rounded-2xl border border-white/20 bg-[#30322e]/75 p-4 text-white shadow-xl backdrop-blur-xl sm:p-5">
                  <h3 className="text-sm font-semibold">{t('How SolarCare works', 'SolarCare کیسے کام کرتا ہے', 'SolarCare kaisay kaam karta hai')}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/75">
                    {t(
                      'Add your system location to see local weather and use the simple demo dashboard.',
                      'مقامی موسم دیکھنے اور آسان ڈیمو ڈیش بورڈ استعمال کرنے کے لیے اپنے سسٹم کا مقام درج کریں۔',
                      'Local weather aur simple demo dashboard ke liye system location add karein.'
                    )}
                  </p>
                  <a href="#support" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#e5e9a1] transition hover:gap-2.5">
                    {t('Visit support', 'مدد دیکھیں', 'Support dekhein')} <ArrowRight className="h-3 w-3" />
                  </a>
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

        <section id="services" className={`scroll-mt-6 px-1 py-14 sm:px-2 sm:py-20 lg:py-24 ${dark ? 'text-white' : 'text-[#1b211d]'}`}>
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
                { icon: Activity, image: '/images/solar-monitoring-display.jpg', alt: t('Solar monitoring dashboard display', 'سولر مانیٹرنگ ڈیش بورڈ', 'Solar monitoring dashboard'), title: t('Performance monitoring', 'کارکردگی کی نگرانی', 'Performance monitoring'), text: t('Review production, trends, and system health in one clear view.', 'پیداوار، رجحانات اور سسٹم کی صحت ایک واضح منظر میں دیکھیں۔', 'Production, trends aur system health aik jagah dekhein.') },
                { icon: ShieldCheck, image: '/images/solar-panel-inspection.jpg', alt: t('Technician inspecting a solar installation', 'سولر سسٹم کا معائنہ کرتا ٹیکنیشن', 'Solar system inspect karta technician'), title: t('Guided diagnostics', 'رہنمائی کے ساتھ تشخیص', 'Guided diagnostics'), text: t('Understand common alerts and explore safe next steps for your system.', 'عام الرٹس سمجھیں اور محفوظ اگلے اقدامات دیکھیں۔', 'Aam alerts samjhein aur mehfooz aglay qadam dekhein.') },
                { icon: CircleHelp, image: '/images/scenic-solar-array.jpg', alt: t('Solar installation in a scenic landscape', 'خوبصورت منظر میں سولر تنصیب', 'Scenic solar installation'), title: t('Helpful support', 'مددگار معاونت', 'Madadgar support'), text: t('Find clear setup information and contact SolarCare when you need help.', 'سیٹ اپ کی واضح معلومات دیکھیں اور ضرورت پر SolarCare سے رابطہ کریں۔', 'Setup ki wazeh maloomat aur zaroorat par SolarCare se rabta karein.') },
              ].map(({ icon: Icon, image, alt, title, text }) => (
                <article key={title} className={`dashboard-feature-card rounded-2xl border p-5 sm:p-6 ${palette.panel}`}>
                  <div className="relative h-40 overflow-hidden rounded-xl sm:h-48">
                    <img src={image} alt={alt} loading="lazy" decoding="async" className="dashboard-feature-image h-full w-full object-cover" />
                    <span className={`absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg backdrop-blur ${dark ? 'bg-[#232925]/85 text-emerald-300' : 'bg-white/90 text-emerald-800'}`}><Icon className="h-5 w-5" /></span>
                  </div>
                  <h3 className={`mt-5 text-base font-semibold ${palette.text}`}>{title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${palette.sub}`}>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="support" className={`scroll-mt-6 rounded-[22px] border p-5 sm:rounded-[28px] sm:p-8 lg:p-10 ${palette.frame} ${palette.line}`}>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className={`dashboard-kicker ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>{t('Solar knowledge, within reach', 'سولر معلومات، آپ کے ساتھ', 'Solar maloomat, aap ke sath')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t('A clearer answer to every solar question.', 'ہر سولر سوال کا واضح جواب۔', 'Har solar sawal ka wazeh jawab.')}</h2>
              <p className={`mt-4 max-w-md text-sm leading-6 ${palette.sub}`}>{t('Create an account, add your system location, and explore local weather and simple demo monitoring.', 'اکاؤنٹ بنائیں، اپنے سسٹم کا مقام درج کریں اور مقامی موسم اور آسان ڈیمو مانیٹرنگ دیکھیں۔', 'Account banayein, system location add karein aur local weather aur simple demo monitoring explore karein.')}</p>
              <button type="button" onClick={onSignUp} className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold transition ${dark ? 'bg-[#d9e584] text-[#20251f] hover:bg-[#eff5bd]' : 'bg-[#1d2921] text-white hover:bg-[#3b5940]'}`}>
                {t('Get started with SolarCare', 'SolarCare شروع کریں', 'SolarCare shuru karein')}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
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

        <section id="contact" className={`scroll-mt-6 mt-8 flex flex-col gap-4 rounded-[22px] border p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[28px] sm:p-8 ${palette.frame} ${palette.line}`}>
          <div>
            <h2 className={`text-lg font-semibold ${palette.text}`}>{t('Contact SolarCare', 'SolarCare سے رابطہ', 'SolarCare se rabta')}</h2>
            <p className={`mt-1 text-sm ${palette.sub}`}>{t('For help with setup or your account, email us.', 'سیٹ اپ یا اکاؤنٹ میں مدد کے لیے ہمیں ای میل کریں۔', 'Setup ya account mein madad ke liye email karein.')}</p>
          </div>
          <a href="mailto:farhanlashari61675@gmail.com" className={`inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold transition ${dark ? 'bg-[#d9e584] text-[#20251f] hover:bg-[#eff5bd]' : 'bg-[#1d2921] text-white hover:bg-[#3b5940]'}`}>
            <Mail className="h-4 w-4" />
            farhanlashari61675@gmail.com
          </a>
        </section>

        <footer className={`flex flex-col gap-4 px-2 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 ${dark ? 'text-white/55' : 'text-[#59615b]'}`}>
          <a href="#overview" className="flex items-center gap-2 font-semibold text-inherit">
            <Sun className="h-4 w-4 text-emerald-600" />
            SolarCare
          </a>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" onClick={onLogin} className={`transition ${dark ? 'hover:text-emerald-300' : 'hover:text-emerald-800'}`}>{t('Log in', 'لاگ ان', 'Log in')}</button>
            <button type="button" onClick={onSignUp} className={`transition ${dark ? 'hover:text-emerald-300' : 'hover:text-emerald-800'}`}>{t('Create account', 'اکاؤنٹ بنائیں', 'Account banayen')}</button>
          </div>
          <span>© {CURRENT_YEAR} SolarCare</span>
        </footer>
      </div>
    </div>
  );
};
