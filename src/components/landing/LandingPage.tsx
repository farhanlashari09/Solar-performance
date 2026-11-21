import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Check,
  ChevronDown,
  Globe,
  LogIn,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
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

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp }) => {
  const { language, setLanguage, isRtl } = useLanguage();
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const t = (en: string, ur: string, roman: string) => {
    if (language === 'ur') return ur;
    if (language === 'ur-roman') return roman;
    return en;
  };
  const currentLanguage = LANG_OPTIONS.find((option) => option.code === language) || LANG_OPTIONS[0];

  const theme = {
    page: dark ? 'bg-[#f1f0e8] text-[#213127]' : 'bg-[#f8f8f3] text-[#213127]',
    section: dark ? 'bg-[#f1f0e8] text-[#213127]' : 'bg-white text-[#213127]',
  };

  const features = [
    {
      label: t('01 / Insight', '۰۱ / بصیرت', '01 / Insight'),
      title: t('Know what your system is doing.', 'اپنے سسٹم کی کارکردگی جانیں۔', 'Apne system ki performance jaanain.'),
      body: t(
        'Clear production and health signals help you spot changes early.',
        'پیداوار اور صحت کی واضح معلومات تبدیلی جلد پہچاننے میں مدد دیتی ہیں۔',
        'Production aur health ki wazeh maloomat tabdeeli jaldi pakarne mein madad deti hain.'
      ),
      icon: <Activity className="h-5 w-5" />,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1100&q=85',
      alt: t('Solar panels in sunlight', 'دھوپ میں سولر پینل', 'Dhoop mein solar panels'),
    },
    {
      label: t('02 / Protection', '۰۲ / تحفظ', '02 / Protection'),
      title: t('Catch issues before they grow.', 'مسئلہ بڑھنے سے پہلے پہچانیں۔', 'Masla barhne se pehle pehchanain.'),
      body: t(
        'Practical alerts and guided diagnostics turn system data into a next step.',
        'مفید الرٹس اور تشخیص، سسٹم کے ڈیٹا کو اگلے قدم میں بدلتے ہیں۔',
        'Alerts aur diagnostics system data ko aglay qadam mein badalte hain.'
      ),
      icon: <ShieldCheck className="h-5 w-5" />,
      image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1100&q=85',
      alt: t('Solar installation viewed from above', 'اوپر سے سولر سسٹم کا منظر', 'Solar installation ka aerial view'),
    },
    {
      label: t('03 / Support', '۰۳ / معاونت', '03 / Support'),
      title: t('Get the right help, simply.', 'درست مدد آسانی سے حاصل کریں۔', 'Sahi madad asani se hasil karein.'),
      body: t(
        'Find qualified technicians and get solar-specific guidance in your language.',
        'ماہر ٹیکنیشن تلاش کریں اور اپنی زبان میں سولر رہنمائی حاصل کریں۔',
        'Maher technician dhoondein aur apni zaban mein solar rehnumai hasil karein.'
      ),
      icon: <BatteryCharging className="h-5 w-5" />,
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1100&q=85',
      alt: t('Technician working on an energy system', 'توانائی کے نظام پر کام کرتا ٹیکنیشن', 'Energy system par kaam karta technician'),
    },
  ];

  const faqs = [
    {
      question: t('Which solar inverters can I monitor?', 'کون سے سولر انورٹر مانیٹر کیے جا سکتے ہیں؟', 'Kin solar inverters ko monitor kar sakta hoon?'),
      answer: t(
        'SolarCare supports common inverter brands and connection types. Your available data depends on your inverter and its monitoring connection.',
        'SolarCare عام انورٹر برانڈز اور کنکشن کی اقسام کو سپورٹ کرتا ہے۔ دستیاب ڈیٹا آپ کے انورٹر اور کنکشن پر منحصر ہے۔',
        'SolarCare aam inverter brands aur connection types ko support karta hai. Data aap ke inverter aur connection par depend karta hai.'
      ),
    },
    {
      question: t('Can I get help with an inverter warning?', 'کیا انورٹر وارننگ پر مدد مل سکتی ہے؟', 'Inverter warning par madad mil sakti hai?'),
      answer: t(
        'Yes. Share the inverter brand and exact warning shown on its display. For electrical faults, do not open equipment or touch wiring—contact a qualified technician.',
        'جی ہاں۔ انورٹر کا برانڈ اور اسکرین پر دکھائی دینے والی وارننگ بتائیں۔ برقی خرابی کی صورت میں سامان نہ کھولیں اور تاروں کو نہ چھوئیں—ماہر ٹیکنیشن سے رابطہ کریں۔',
        'Ji haan. Inverter brand aur screen par dikhne wali warning share karein. Electrical fault mein equipment na kholein—qualified technician se rabta karein.'
      ),
    },
    {
      question: t('Is my solar data updated in real time?', 'کیا سولر ڈیٹا فوری اپ ڈیٹ ہوتا ہے؟', 'Kya solar data foran update hota hai?'),
      answer: t(
        'Updates depend on the connection configured for your system. The dashboard shows the latest readings available to SolarCare.',
        'اپ ڈیٹس آپ کے سسٹم کے کنکشن پر منحصر ہیں۔ ڈیش بورڈ SolarCare کو دستیاب تازہ ترین ریڈنگز دکھاتا ہے۔',
        'Updates aap ke system connection par depend karti hain. Dashboard latest available readings dikhata hai.'
      ),
    },
  ];

  const navigation = [
    { href: '#platform', label: t('Platform', 'پلیٹ فارم', 'Platform') },
    { href: '#approach', label: t('How it works', 'طریقہ کار', 'Tareeqa-e-kaar') },
    { href: '#support', label: t('Support', 'معاونت', 'Support') },
  ];

  return (
    <div className={`min-h-screen ${theme.page} ${isRtl ? 'font-urdu' : ''}`}>
      <header className="relative z-30 px-3 pt-3 sm:px-5 sm:pt-5">
        <div className={`landing-frame relative min-h-[min(760px,calc(100svh-24px))] overflow-hidden rounded-[24px] sm:rounded-[32px] ${dark ? 'landing-frame-dark' : 'landing-frame-light'}`}>
          <img
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2400&q=90"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="landing-hero-image absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className={`landing-hero-shade absolute inset-0 ${dark ? 'landing-hero-shade-dark' : 'landing-hero-shade-light'}`} />

          <nav className="relative z-20 flex items-center justify-between gap-4 px-5 py-5 sm:px-9 sm:py-7 lg:px-12">
            <a href="#" className="flex items-center gap-2.5 text-white" aria-label="SolarCare home">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-md">
                <Sun className="h-4 w-4 text-[#d9e8a7]" />
              </span>
              <span className="text-sm font-semibold tracking-[0.12em]">SOLARCARE</span>
            </a>

            <div className="hidden items-center gap-8 rounded-full border border-white/20 bg-black/10 px-6 py-3 text-xs text-white/90 backdrop-blur-md md:flex">
              {navigation.map((item) => (
                <a key={item.href} href={item.href} className="landing-nav-link">{item.label}</a>
              ))}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((open) => !open)}
                  aria-label="Choose language"
                  className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/10 px-3 py-2 text-xs text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {currentLanguage.short}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-white/15 bg-[#1d2b20]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl">
                    {LANG_OPTIONS.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => { setLanguage(option.code); setLangOpen(false); }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-white/10"
                      >
                        {option.label}
                        {language === option.code && <Check className="h-3.5 w-3.5 text-[#cce09e]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDark((value) => !value)}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/10 text-white backdrop-blur-md transition hover:bg-white/15"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button type="button" onClick={onLogin} className="landing-glass-button hidden lg:inline-flex">
                <LogIn className="h-3.5 w-3.5" />
                {t('Log in', 'لاگ ان', 'Log in')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/10 text-white backdrop-blur-md sm:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </nav>

          {mobileOpen && (
            <div className="absolute inset-x-4 top-[76px] z-30 rounded-2xl border border-white/20 bg-[#1d2b20]/95 p-4 text-white shadow-2xl backdrop-blur-xl sm:hidden">
              <nav className="grid gap-1">
                {navigation.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2.5 text-sm hover:bg-white/10">
                    {item.label}
                  </a>
                ))}
              </nav>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/15 pt-3">
                  <div className="flex flex-wrap gap-1">
                    {LANG_OPTIONS.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => setLanguage(option.code)}
                        aria-pressed={language === option.code}
                        className={`rounded-full px-2.5 py-1.5 text-[10px] transition ${
                          language === option.code ? 'bg-white/20 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {option.short}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDark((value) => !value)}
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white"
                  >
                    {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setMobileOpen(false); onLogin(); }} className="landing-glass-button justify-center">
                  {t('Log in', 'لاگ ان', 'Log in')}
                </button>
                <button type="button" onClick={() => { setMobileOpen(false); onSignUp(); }} className="landing-light-button justify-center">
                  {t('Get started', 'شروع کریں', 'Shuru karein')}
                </button>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden">
            <span className="landing-ghost-word select-none">SOLAR</span>
          </div>

          <div className="relative z-10 flex min-h-[min(660px,calc(100svh-100px))] flex-col justify-end px-6 pb-8 pt-20 sm:px-10 sm:pb-10 lg:min-h-[650px] lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:pb-14">
            <div className="landing-hero-copy max-w-[650px]">
              <p className="landing-eyebrow mb-4 text-white/80">
                <span className="landing-live-dot" />
                {t('A clearer view of your energy', 'آپ کی توانائی کی واضح تصویر', 'Aap ki energy ki wazeh tasveer')}
              </p>
              <h1 className="landing-display-title max-w-3xl text-white">
                {t('Make every ray', 'ہر کرن سے', 'Har kiran se')}
                <br />
                <span>{t('work harder.', 'زیادہ فائدہ اٹھائیں۔', 'zyada faida uthayen.')}</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                {t(
                  'Understand your solar performance, get expert guidance, and keep your system running at its best.',
                  'اپنے سولر سسٹم کی کارکردگی سمجھیں، ماہر رہنمائی حاصل کریں، اور اسے بہترین حالت میں رکھیں۔',
                  'Solar system ki performance samjhein, expert rehnumai lein, aur use behtareen halat mein rakhein.'
                )}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={onSignUp} className="landing-light-button">
                  {t('Get started', 'شروع کریں', 'Shuru karein')}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={onLogin} className="landing-glass-button">
                  <LogIn className="h-3.5 w-3.5" />
                  {t('Log in to your account', 'اپنے اکاؤنٹ میں لاگ ان', 'Apne account mein log in')}
                </button>
              </div>
            </div>

            <div className="landing-energy-card mt-10 w-full max-w-[330px] self-end rounded-[22px] border border-white/25 bg-[#182319]/45 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6 lg:mb-1 lg:ml-8 lg:mt-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="landing-eyebrow text-white/65">{t('Your energy, live', 'آپ کی توانائی، لائیو', 'Aap ki energy, live')}</p>
                  <p className="mt-3 text-3xl font-medium tracking-tight">8.42 <span className="text-base text-white/70">kW</span></p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#d9e8a7]">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-5 flex items-end gap-1.5" aria-label="Illustrative daily production trend">
                {[30, 42, 34, 58, 46, 72, 53, 84, 64, 100, 74, 91, 61, 76, 46, 69, 39, 55, 33, 48, 28, 40, 20, 32].map((height, index) => (
                  <span
                    key={index}
                    className={`landing-chart-bar ${index > 18 ? 'opacity-40' : ''}`}
                    style={{ height: `${height}%`, animationDelay: `${index * 35}ms` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-xs">
                <span className="text-white/65">{t("Today's production", 'آج کی پیداوار', 'Aaj ki production')}</span>
                <span className="font-medium text-[#d9e8a7]">44.1 kWh <span className="text-white/60">↗</span></span>
              </div>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
                {t('Illustrative system preview', 'نمونہ سسٹم پیش منظر', 'Misaali system preview')}
              </p>
            </div>
          </div>

          <a href="#platform" className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70 transition hover:text-white lg:flex">
            {t('Scroll to explore', 'مزید دیکھیں', 'Mazeed dekhein')}
            <ArrowDown className="h-3 w-3" />
          </a>
        </div>
      </header>

      <main>
        <section className={`border-b border-[#dfe3d8] px-5 py-7 sm:px-10 lg:px-16 ${theme.section}`}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
            {[
              { value: '01', label: t('One clear dashboard', 'ایک واضح ڈیش بورڈ', 'Aik wazeh dashboard') },
              { value: '24/7', label: t('System visibility', 'سسٹم کی نگرانی', 'System ki nigraani') },
              { value: 'AI', label: t('Guided diagnostics', 'AI تشخیص', 'AI tashkhees') },
              { value: 'LOCAL', label: t('Expert support', 'ماہر معاونت', 'Expert support') },
            ].map((item) => (
              <div key={item.value} className="flex items-center gap-3">
                <span className="font-mono text-sm text-[#527449]">{item.value}</span>
                <span className="text-xs text-[#68766b] sm:text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="platform" className={`px-5 py-20 sm:px-10 sm:py-28 lg:px-16 ${theme.section}`}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-5 md:grid-cols-[1fr_0.7fr] md:items-end">
              <div>
                <p className="landing-eyebrow text-[#68835c]">{t('A better way to manage solar', 'سولر مینجمنٹ کا بہتر طریقہ', 'Solar management ka behtar tareeqa')}</p>
                <h2 className="landing-section-title mt-4 max-w-2xl">
                  {t('Energy insight, without the noise.', 'توانائی کی سمجھ، غیر ضروری پیچیدگی کے بغیر۔', 'Energy insight, baghair uljhan ke.')}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[#68766b] md:justify-self-end">
                {t(
                  'The tools you need to understand performance, care for your system, and find trusted support.',
                  'کارکردگی سمجھنے، سسٹم کی دیکھ بھال اور قابل اعتماد مدد کے لیے ضروری ٹولز۔',
                  'Performance samajhne, system ki dekh bhaal aur bharosemand madad ke tools.'
                )}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <article key={feature.label} className="landing-editorial-card group overflow-hidden rounded-[22px] border border-[#dfe3d8] bg-white">
                  <div className="relative h-56 overflow-hidden">
                    <img src={feature.image} alt={feature.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c2a1c]/55 to-transparent" />
                    <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-md">
                      {feature.icon}
                    </span>
                    <span className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/80">{feature.label}</span>
                    {index === 0 && <span className="absolute bottom-5 right-5 h-2 w-2 rounded-full bg-[#d9e8a7] shadow-[0_0_16px_4px_rgba(217,232,167,0.55)]" />}
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="font-display text-xl leading-snug text-[#26362d]">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#68766b]">{feature.body}</p>
                    <a href="#support" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#527449] transition hover:gap-3">
                      {t('Explore the platform', 'پلیٹ فارم دیکھیں', 'Platform dekhein')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="approach" className="relative overflow-hidden bg-[#26392b] px-5 py-20 text-white sm:px-10 sm:py-28 lg:px-16">
          <div className="pointer-events-none absolute -right-36 -top-40 h-[440px] w-[440px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-[320px] w-[320px] rounded-full border border-white/10" />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="landing-eyebrow text-[#c9d7a3]">{t('Simple by design', 'سادہ اور آسان', 'Saada aur asaan')}</p>
              <h2 className="landing-section-title mt-4 max-w-lg text-white">
                {t('From sunlight to insight.', 'دھوپ سے بہتر سمجھ تک۔', 'Dhoop se behtar samajh tak.')}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                {t(
                  'Bring your system into focus, understand what matters, and take your next step with confidence.',
                  'اپنے سسٹم کو سمجھیں، اہم باتوں پر توجہ دیں اور اعتماد سے اگلا قدم اٹھائیں۔',
                  'System ko samjhein, zaroori baton par tawajjo dein aur yaqeen se agla qadam uthayen.'
                )}
              </p>
              <button type="button" onClick={onSignUp} className="landing-light-button mt-7">
                {t('Start with your system', 'اپنے سسٹم سے شروع کریں', 'Apne system se shuru karein')}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { n: '01', title: t('Connect', 'کنیکٹ کریں', 'Connect karein'), text: t('Add your solar system details.', 'اپنے سولر سسٹم کی تفصیل شامل کریں۔', 'Solar system ki tafseel shamil karein.') },
                { n: '02', title: t('Understand', 'سمجھیں', 'Samjhein'), text: t('See readings, trends, and alerts.', 'ریڈنگز، رجحانات اور الرٹس دیکھیں۔', 'Readings, trends aur alerts dekhein.') },
                { n: '03', title: t('Take action', 'اقدام کریں', 'Qadam uthayen'), text: t('Get guidance or find a technician.', 'رہنمائی لیں یا ٹیکنیشن تلاش کریں۔', 'Rehnumai lein ya technician dhoondein.') },
              ].map((step) => (
                <div key={step.n} className="rounded-[20px] border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.1]">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9d7a3]">{step.n} / 03</span>
                  <h3 className="font-display mt-9 text-xl">{step.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/60">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="support" className={`px-5 py-20 sm:px-10 sm:py-28 lg:px-16 ${theme.section}`}>
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="landing-eyebrow text-[#68835c]">{t('Questions, answered', 'آپ کے سوالات کے جواب', 'Aap ke sawalat ke jawab')}</p>
              <h2 className="landing-section-title mt-4">{t('Good energy starts with clarity.', 'بہتر توانائی کی شروعات واضح سمجھ سے۔', 'Behtar energy ki shuruat wazeh samajh se.')}</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#68766b]">
                {t(
                  'Get practical, solar-specific help for panels, inverters, batteries, wiring, and system performance.',
                  'پینلز، انورٹرز، بیٹری، وائرنگ اور کارکردگی کے لیے سولر سے متعلق عملی رہنمائی۔',
                  'Panels, inverter, battery, wiring aur system performance ke liye solar rehnumai.'
                )}
              </p>
              <a href="mailto:farhanlashari61675@gmail.com" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#527449] hover:text-[#26362d]">
                {t('Talk to our team', 'ہماری ٹیم سے رابطہ کریں', 'Hamari team se rabta karein')}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={faq.question} className="border-b border-[#dfe3d8]">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="font-display text-base text-[#26362d] sm:text-lg">{faq.question}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dfe3d8] text-[#527449] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                    {isOpen && <p className="max-w-2xl pb-5 text-sm leading-7 text-[#68766b]">{faq.answer}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-[#1d2b20] px-5 py-8 text-white sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <Sun className="h-4 w-4 text-[#d9e8a7]" />
            </span>
            <span className="text-xs font-semibold tracking-[0.12em]">SOLARCARE</span>
          </a>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/65">
            <button type="button" onClick={onLogin} className="transition hover:text-white">{t('Log in', 'لاگ ان', 'Log in')}</button>
            <button type="button" onClick={onSignUp} className="transition hover:text-white">{t('Create account', 'اکاؤنٹ بنائیں', 'Account banayen')}</button>
            <a href="mailto:farhanlashari61675@gmail.com" className="transition hover:text-white">farhanlashari61675@gmail.com</a>
            <span className="font-mono text-[10px] text-white/40">© {CURRENT_YEAR} SOLARCARE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
