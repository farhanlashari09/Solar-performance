import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import {
  Sun,
  Moon,
  Zap,
  ShieldCheck,
  TrendingUp,
  Wrench,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  LogIn,
  UserPlus,
  Menu,
  X,
  Activity,
  BarChart2,
  Clock,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

// ─── Lang options ─────────────────────────────────────────────────────────────
const LANG_OPTIONS: { code: Language; label: string; short: string }[] = [
  { code: 'en',       label: 'English',    short: 'EN' },
  { code: 'ur-roman', label: 'Roman Urdu', short: 'UR' },
  { code: 'ur',       label: 'اردو',       short: 'اردو' },
];

// ─── LandingPage ─────────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp }) => {
  const { language, setLanguage, isRtl } = useLanguage();

  const [dark,       setDark]       = useState(true);   // default: dark mode
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [openFaq,    setOpenFaq]    = useState<number | null>(0);

  // ── Translation helper ─────────────────────────────────────────────────────
  const t = (en: string, ur: string, roman: string) => {
    if (language === 'ur')       return ur;
    if (language === 'ur-roman') return roman;
    return en;
  };

  const curLang = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];

  // ── Theme tokens ───────────────────────────────────────────────────────────
const th = {
  bg:          dark ? 'bg-[#050505]' : 'bg-white',
  bgCard:      dark ? 'bg-[#111111]' : 'bg-white',
  bgCardHover: dark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-slate-50',
  bgSubtle:    dark ? 'bg-[#0b0b0b]' : 'bg-[#f5f5f5]',
  bgInput:     dark ? 'bg-[#111111]' : 'bg-white',

  border:      dark ? 'border-white/10' : 'border-black/10',
  borderFocus: dark ? 'border-emerald-400/60' : 'border-emerald-600',

  text:        dark ? 'text-white' : 'text-[#111111]',
  textSub:     dark ? 'text-white/70' : 'text-[#444444]',
  textMuted:   dark ? 'text-white/45' : 'text-[#666666]',
  textLabel:   dark ? 'text-emerald-300' : 'text-emerald-800',

  nav:         dark
    ? 'bg-[#050505]/95 border-white/10'
    : 'bg-white/95 border-black/10 shadow-sm',
  navLink:     dark
    ? 'text-white/70 hover:text-white'
    : 'text-[#444444] hover:text-emerald-800',

  card:        dark
    ? 'bg-[#111111] border-white/10 hover:border-emerald-400/40'
    : 'bg-white border-black/10 shadow-sm hover:border-emerald-300 hover:shadow-lg',

  faqClosed:   dark ? 'bg-[#111111] border-white/10' : 'bg-white border-black/10 shadow-sm',
  faqOpen:     dark ? 'bg-emerald-400/10 border-emerald-300/40' : 'bg-emerald-50 border-emerald-300 shadow-sm',
  faqQ:        dark ? 'text-white/85 hover:text-white' : 'text-[#111111] hover:text-emerald-800',
  faqQOpen:    dark ? 'text-emerald-200' : 'text-emerald-800',
  faqA:        dark ? 'text-white/65' : 'text-[#444444]',

  footerBg:    'bg-[#050505] border-white/10 text-white',

  metricLabel: dark ? 'text-white/65' : 'text-[#555555]',
  metricVal:   dark ? 'text-white' : 'text-[#111111]',
  metricSub:   dark ? 'text-white/65' : 'text-[#555555]',

  toggleBg:    dark
    ? 'bg-[#111111] border-white/10 text-white/85'
    : 'bg-white border-black/10 text-[#111111] shadow-sm',

  stepNum:     dark ? 'text-white/[0.05]' : 'text-emerald-100',
  stepCard:    dark
    ? 'bg-[#111111] border-white/10 hover:border-emerald-400/40'
    : 'bg-white border-black/10 shadow-sm hover:border-emerald-300',
};

  // ── Reused RTL-aware class ─────────────────────────────────────────────────
  const urduLH = isRtl ? 'leading-[2.4]' : '';
  const urduP  = isRtl ? 'leading-[2.4]' : 'leading-relaxed';

  // ── Data ──────────────────────────────────────────────────────────────────
  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: t('AI Diagnostics',       'AI تشخیص',          'AI Diagnostics'),
      desc:  t('Pinpoints faults — shading, drift, panel damage — before they cut your yield.',
               'سائے، ڈرفٹ یا پینل نقصان کی فوری نشاندہی۔',
               'Shading, drift aur panel nuqsan ki fehri nishaan-dehi.'),
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: t('Live Telemetry',       'لائیو ٹیلی میٹری',  'Live Telemetry'),
      desc:  t('String-level power and voltage, refreshed every 30 seconds.',
               'ہر 30 سیکنڈ میں سٹرنگ لیول وولٹیج اور پاور ریڈنگ۔',
               'Har 30 seconds mein string-level voltage aur power reading.'),
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: t('Net-Metering Audit',   'نیٹ میٹرنگ آڈٹ',   'Net-Metering Audit'),
      desc:  t('Cross-checks exported units against WAPDA / LESCO billing automatically.',
               'بجلی کے بل کا خودکار آڈٹ۔',
               'Bill ka khudkaar audit.'),
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      title: t('Certified Technicians','تصدیق شدہ ٹیکنیشنز', 'Certified Technicians'),
      desc:  t('Book a vetted solar engineer in your city — upfront pricing, no hidden fees.',
               'اپنے شہر کے تصدیق شدہ انجینئر کی بکنگ — شفاف قیمت۔',
               'Apne shehar ke verified engineer ki booking — shuruaat se clear rate.'),
    },
  ];

  const faqs = [
    {
      q: t('Which inverters are supported?',
           'کون سے انورٹر سپورٹڈ ہیں؟',
           'Kon se inverters supported hain?'),
      a: t('Growatt, Huawei, Sungrow, Fronius, Sofar, Inverex, and Knox — via existing WiFi datalogger, no extra hardware.',
           'گروواٹ، ہواوے، سن گرو، فرونیوس، سوفر، انورٹیکس اور نوکس — موجودہ وائی فائی ڈیٹا لاگر کے ذریعے، کوئی اضافی ہارڈ ویئر نہیں۔',
           'Growatt, Huawei, Sungrow, Fronius, Sofar, Inverex, aur Knox — WiFi datalogger se, koi extra hardware nahi.'),
    },
    {
      q: t('Is there a free plan?',
           'کیا مفت پلان دستیاب ہے؟',
           'Kya free plan available hai?'),
      a: t('Yes. Single-system residential owners get live telemetry and fault alerts at no cost.',
           'جی ہاں۔ ایک سسٹم والے صارفین کو لائیو ٹیلی میٹری اور الرٹس مفت ملتے ہیں۔',
           'Ji haan. Single system ke maalik ko live telemetry aur alerts bilkul free milte hain.'),
    },
    {
      q: t('How accurate is AI fault detection?',
           'AI تشخیص کتنی درست ہے؟',
           'AI fault detection kitni accurate hai?'),
      a: t('Our model compares local irradiance data against measured DC input, achieving 99.4% accuracy.',
           'ہمارا ماڈل مقامی تابکاری ڈیٹا اور DC ان پٹ کا موازنہ کرتا ہے — 99.4٪ درستگی۔',
           'Hamara model local irradiance aur DC input ka mawazna karta hai — 99.4% accuracy.'),
    },
    {
      q: t('How do I book a technician?',
           'ٹیکنیشن کیسے بک کریں؟',
           'Technician kaise book karein?'),
      a: t('Log in → Technicians tab → pick a rated engineer near you → one-tap booking with upfront rate.',
           'لاگ ان → ٹیکنیشنز ٹیب → قریبی انجینئر → ایک ٹیپ بکنگ۔',
           'Log in → Technicians tab → nearby engineer → ek tap booking.'),
    },
  ];

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${th.bg} ${th.text} selection:bg-emerald-500/30 ${isRtl ? 'font-urdu' : ''}`}>

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${th.nav}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="#" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center shadow-emerald-sm">
              <Sun className="w-5 h-5 text-solar animate-spin-slow" />
            </div>
            <span className={`font-extrabold text-xl tracking-normal ${th.text}`}>
              Solar <span className="text-emerald-500 font-extrabold">Care</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {[
              { href: '#features',     label: t('Features',    'خصوصیات',  'Features')    },
              { href: '#how-it-works', label: t('How It Works','طریقہ کار', 'How It Works') },
              { href: '#faq',          label: t('FAQ',         'سوالات',   'FAQ')          },
            ].map(item => (
              <a key={item.href} href={item.href} className={`transition-colors duration-150 ${th.navLink}`}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: controls */}
          <div className="flex items-center gap-2">

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${th.toggleBg}`}
            >
              {dark
                ? <><Sun  className="w-3.5 h-3.5 text-solar" /><span className="hidden sm:inline">{t('Light', 'لائٹ', 'Light')}</span></>
                : <><Moon className="w-3.5 h-3.5 text-emerald-600" /><span className="hidden sm:inline">{t('Dark', 'ڈارک', 'Dark')}</span></>
              }
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(o => !o)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${th.toggleBg}`}
              >
                <Globe className="w-3.5 h-3.5" />
                {curLang.short}
              </button>
              {langOpen && (
                <div className={`absolute right-0 mt-2 w-36 rounded-xl shadow-xl border py-1 z-50 ${th.bgCard} ${th.border}`}>
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.code}
                      onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        language === opt.code
                          ? dark ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold'
                          : dark ? 'text-white/60 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                      {language === opt.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LOG IN */}
            <button
              onClick={onLogin}
              className={`hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                dark
                  ? 'text-white/80 border-white/10 hover:bg-white/[0.07] hover:text-white hover:border-white/20'
                  : 'text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('Log In', 'لاگ ان', 'Log In')}
            </button>

            {/* SIGN UP */}
            <button
              onClick={onSignUp}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-emerald-sm transition-all duration-200 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {t('Sign Up', 'سائن اپ', 'Sign Up')}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer ${th.toggleBg}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className={`md:hidden border-t px-4 py-5 space-y-4 transition-colors duration-300 ${th.bgCard} ${th.border}`}>
            <nav className={`flex flex-col gap-3 text-sm font-medium border-b pb-4 ${th.border}`}>
              {[
                { href: '#features',     label: t('Features',    'خصوصیات',  'Features')    },
                { href: '#how-it-works', label: t('How It Works','طریقہ کار', 'How It Works') },
                { href: '#faq',          label: t('FAQ',         'سوالات',   'FAQ')          },
              ].map(item => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={th.navLink}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-1 pb-1">
              {LANG_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => setLanguage(opt.code)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                    language === opt.code
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : dark ? 'text-white/40 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {opt.short}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setMobileOpen(false); onLogin(); }}
                className={`py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                  dark ? 'border-white/10 text-white/80 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                {t('Log In', 'لاگ ان', 'Log In')}
              </button>
              <button onClick={() => { setMobileOpen(false); onSignUp(); }}
                className="py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-500 transition-colors">
                {t('Sign Up', 'سائن اپ', 'Sign Up')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-28 sm:pt-32 sm:pb-36">

        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2000&q=85"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${dark ? 'bg-black/35' : 'bg-white/45'}`}
        />

       <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center solar-enter">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border ${
            dark
              ? 'bg-white/[0.05] border-white/[0.10] text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 solar-pulse" />
            {t('Solar Monitoring & After-Sales Platform', 'سولر مانیٹرنگ اور آفٹر سیلز پلیٹ فارم', 'Solar Monitoring & After-Sales Platform')}
          </div>

          {/* Headline */}
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 ${urduLH} ${th.text}`}
            style={{ lineHeight: isRtl ? '1.7' : '1.1' }}>
            {t('Your Solar System,', 'آپ کا سولر سسٹم،', 'Aapka Solar System,')}
            <br />
            <span className="shimmer-text">
              {t('Always at Peak.', 'ہمیشہ بہترین کارکردگی پر۔', 'Hamesha Best Performance Par.')}
            </span>
          </h1>

          {/* Subline — 1 sentence */}
          <p className={`solar-reveal-delay mx-auto max-w-xl text-base sm:text-lg mb-10 font-normal ${th.textSub} ${urduP}`}>
            {t(
              'Real-time AI fault detection, certified technician booking, and net-metering audit — in one platform.',
              'ریئل ٹائم AI تشخیص، تصدیق شدہ ٹیکنیشن بکنگ، اور نیٹ میٹرنگ آڈٹ — ایک پلیٹ فارم میں۔',
              'Real-time AI fault detection, certified technician booking, aur net-metering audit — ek platform mein.'
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSignUp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-emerald-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
            >
              {t('Get Started Free', 'مفت شروع کریں', 'Get Started Free')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogin}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
                dark
                  ? 'text-white/70 bg-white/[0.05] border-white/10 hover:bg-white/[0.09] hover:text-white'
                  : 'text-slate-700 bg-white border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {t('Log In to Account', 'اکاؤنٹ میں لاگ ان', 'Account mein Log In')}
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 sm:py-32 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <span className={`text-xs font-bold uppercase tracking-widest mb-3 block ${th.textLabel}`}>
              {t('Core Capabilities', 'بنیادی صلاحیتیں', 'Core Capabilities')}
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${th.text} ${urduLH}`}>
              {t('Built for Solar Performance.', 'سولر کارکردگی کے لیے بنایا گیا۔', 'Solar Performance ke liye banaya gaya.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 100}ms` }}
                className={`solar-card solar-reveal group p-6 rounded-2xl border transition-all duration-300 cursor-default ${th.card}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 ${
                  dark ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {f.icon}
                </div>
                <h3 className={`text-base font-bold mb-2 ${th.text}`}>{f.title}</h3>
                <p className={`text-sm ${th.textSub} ${urduP}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className={`py-24 sm:py-32 border-y transition-colors duration-300 scroll-mt-16 ${dark ? 'bg-[#0b0b0b] border-white/[0.07]' : 'bg-[#f5f5f5] border-black/10'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <span className={`text-xs font-bold uppercase tracking-widest mb-3 block ${th.textLabel}`}>
              {t('Getting Started', 'شروعات', 'Getting Started')}
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${th.text} ${urduLH}`}>
              {t('Three Steps. Zero Hardware.', 'تین مراحل۔ کوئی ہارڈ ویئر نہیں۔', 'Teen Marahil. Koi Hardware Nahi.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <UserPlus className="w-5 h-5" />,
                title: t('Create Account',         'اکاؤنٹ بنائیں',       'Account Banayen'),
                desc:  t('Sign up with your email in under 60 seconds.',
                         '60 سیکنڈ میں ای میل سے سائن اپ کریں۔',
                         '60 seconds mein email se sign up karein.'),
              },
              {
                step: '02',
                icon: <BarChart2 className="w-5 h-5" />,
                title: t('Connect Your Inverter',  'انورٹر کنیکٹ کریں',   'Inverter Connect Karein'),
                desc:  t('Enter your inverter WiFi credentials — we do the rest.',
                         'وائی فائی اسناد درج کریں — باقی ہم کریں گے۔',
                         'WiFi credentials darj karein — baqi hum karein ge.'),
              },
              {
                step: '03',
                icon: <TrendingUp className="w-5 h-5" />,
                title: t('Monitor & Act',           'مانیٹر اور عمل کریں', 'Monitor aur Amal Karein'),
                desc:  t('Live data, AI alerts, and technician booking — from one dashboard.',
                         'لائیو ڈیٹا، AI الرٹس اور بکنگ — سب ایک ڈیش بورڈ میں۔',
                         'Live data, AI alerts aur booking — sab ek dashboard mein.'),
              },
            ].map((step, i) => (
              <div key={i} style={{ animationDelay: `${i * 100}ms` }} className={`solar-card solar-reveal relative p-8 rounded-2xl border transition-all duration-300 group ${th.stepCard}`}>
                <div className={`absolute top-5 right-6 text-6xl font-black select-none transition-colors ${th.stepNum}`}>
                  {step.step}
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white mb-5">
                  {step.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${th.text}`}>{step.title}</h3>
                <p className={`text-sm ${th.textSub} ${urduP}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LIVE METRICS PREVIEW
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              <span className={`text-xs font-bold uppercase tracking-widest mb-3 block ${th.textLabel}`}>
                {t('Live Dashboard', 'لائیو ڈیش بورڈ', 'Live Dashboard')}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${th.text} ${urduLH}`}>
                {t('See every watt. Catch every fault.', 'ہر واٹ دیکھیں۔ ہر خرابی پکڑیں۔', 'Har watt dekhein. Har kharabi pakrein.')}
              </h2>
              <p className={`text-base mb-8 ${th.textSub} ${urduP}`}>
                {t(
                  'Your dashboard refreshes every 30 seconds with string-level voltage, inverter temperature, and yield vs. forecast.',
                  'ہر 30 سیکنڈ میں ڈیش بورڈ اپ ڈیٹ ہوتا ہے — وولٹیج، درجہ حرارت اور پیداوار کا موازنہ۔',
                  'Har 30 seconds mein dashboard update hota hai — voltage, temperature aur yield comparison.'
                )}
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  t('String-level power & voltage',    'سٹرنگ لیول پاور اور وولٹیج',   'String-level power & voltage'),
                  t('Inverter temperature monitoring', 'انورٹر درجہ حرارت مانیٹرنگ', 'Inverter temperature monitoring'),
                  t('Daily & monthly yield tracking',  'روزانہ اور ماہانہ پیداوار',   'Daily & monthly yield tracking'),
                  t('Push alerts on anomalies',        'فوری پش الرٹس',               'Fauri push alerts'),
                ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${th.textSub} ${urduLH}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignUp}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-emerald-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              >
                {t('Start Monitoring', 'مانیٹرنگ شروع کریں', 'Monitoring Shuru Karein')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right — metric cards */}
            {/* Right — image-backed metric cards */}
<div className="relative isolate overflow-hidden rounded-3xl min-h-[360px] p-4 sm:p-6">
  <img
    src="https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1400&q=85"
    alt="Solar panels under a bright sky"
    loading="lazy"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />

  {/* Light tint preserves image detail while keeping the cards readable. */}
  <div
    aria-hidden="true"
    className="absolute inset-0 bg-black/20"
  />

  <div className="relative z-10 grid h-full grid-cols-2 gap-4">
    {[
      {
        icon: <Zap className="w-5 h-5 text-orange-500" />,
        label: t('Current Output', 'موجودہ آؤٹ پٹ', 'Current Output'),
        value: '8.42 kW',
        sub: '94% rated capacity',
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
        label: t('Inverter Health', 'انورٹر کی صحت', 'Inverter Health'),
        value: '98.8%',
        sub: 'Temp: 41 °C',
      },
      {
        icon: <Activity className="w-5 h-5 text-emerald-500" />,
        label: t("Today's Yield", 'آج کی پیداوار', 'Aaj ki Yield'),
        value: '44.1 kWh',
        sub: '+12% vs avg',
      },
      {
        icon: <Clock className={`w-5 h-5 ${th.textMuted}`} />,
        label: t('Last Sync', 'آخری سنک', 'Aakhri Sync'),
        value: '< 30 s',
        sub: 'All strings live',
      },
    ].map((card, i) => (
      <div
        key={i}
        style={{ animationDelay: `${i * 100}ms` }}
        className={`solar-card solar-reveal min-h-[145px] rounded-2xl border p-4 sm:p-5 backdrop-blur-md ${
          dark
            ? 'border-white/20 bg-black/75'
            : 'border-white/70 bg-white/90 shadow-lg'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`text-xs font-medium ${th.metricLabel} ${urduLH}`}>
            {card.label}
          </span>
          {card.icon}
        </div>
        <p className={`text-xl sm:text-2xl font-extrabold ${th.metricVal}`}>
          {card.value}
        </p>
        <p className={`mt-2 text-xs font-medium ${th.metricSub}`}>
          {card.sub}
        </p>
      </div>
    ))}
  </div>
</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
      ══════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 sm:py-32 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <span className={`text-xs font-bold uppercase tracking-widest mb-3 block ${th.textLabel}`}>
              {t('Common Questions', 'عام سوالات', 'Common Questions')}
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${th.text} ${urduLH}`}>
              {t('Got Questions?', 'سوالات ہیں؟', 'Sawalaat Hain?')}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${isOpen ? th.faqOpen : th.faqClosed}`}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer text-sm font-semibold transition-colors ${isOpen ? th.faqQOpen : th.faqQ} ${urduLH}`}
                  >
                    <span>{faq.q}</span>
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${dark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className={`px-6 pb-5 text-sm animate-fade-in ${th.faqA} ${urduP}`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className={`border-t transition-colors duration-300 ${th.footerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/40 border border-emerald-500/30 flex items-center justify-center">
                <Sun className="w-4 h-4 text-solar" />
              </div>
              <span className="font-extrabold text-base text-white tracking-normal">
                Solar <span className="text-emerald-400">Care</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-white/35 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" />
                {t('All Systems Operational', 'تمام سسٹمز فعال', 'All Systems Operational')}
              </span>
              <button onClick={onLogin}  className="hover:text-white/70 cursor-pointer transition-colors">{t('Log In',  'لاگ ان',  'Log In')}</button>
              <button onClick={onSignUp} className="hover:text-white/70 cursor-pointer transition-colors">{t('Sign Up', 'سائن اپ', 'Sign Up')}</button>
            </div>
          </div>

          <div className={`mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/20`}>
            <p>© {new Date().getFullYear()} SolarCare Technologies. All rights reserved.</p>
            <p>{t('Engineered for clean energy.', 'صاف توانائی کے لیے۔', 'Clean energy ke liye.')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
