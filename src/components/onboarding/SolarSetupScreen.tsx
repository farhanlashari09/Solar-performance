import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { useAuth } from '../../context/AuthContext';
import { ConnectionStatus, Language } from '../../types';
import {
  Sun,
  Zap,
  MapPin,
  Calendar,
  Layers,
  BatteryCharging,
  Cpu,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Check,
} from 'lucide-react';

const COMMON_INVERTER_BRANDS = [
  'Huawei',
  'Sungrow',
  'Growatt',
  'Inverex',
  'Knox',
  'Fronius',
  'GoodWe',
  'Solis',
  'SMA',
  'Crown Micro',
  'Voltronic Power',
  'Other / Custom',
];

const COMMON_CITIES = [
  'Lahore, Punjab',
  'Karachi, Sindh',
  'Islamabad / Rawalpindi',
  'Multan, Punjab',
  'Faisalabad, Punjab',
  'Peshawar, KPK',
  'Gujranwala, Punjab',
  'Sialkot, Punjab',
  'Quetta, Balochistan',
  'Other Location',
];

const LANG_OPTIONS: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ur-roman', label: 'Roman Urdu', short: 'UR' },
  { code: 'ur', label: 'اردو', short: 'اردو' },
];

const LanguageSwitcher: React.FC<{ language: Language; setLanguage: (l: Language) => void; dark?: boolean }> = ({ language, setLanguage, dark }) => {
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];
  const btnBase = dark
    ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm cursor-pointer'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer';

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className={btnBase} title="Switch Language">
        <Globe className="w-3.5 h-3.5" />
        <span>{current.short}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[150px]">
          {LANG_OPTIONS.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                language === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-[11px] text-slate-400 w-8">{lang.short}</span>
              <span>{lang.label}</span>
              {language === lang.code && <Check className="w-3 h-3 ml-auto text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const SolarSetupScreen: React.FC = () => {
  const { language, setLanguage, isRtl } = useLanguage();
  const { addSolarSystem } = useSolar();
  const { currentUser, logout } = useAuth();

  const msg = (en: string, ur: string, roman: string) => {
    if (language === 'ur') return ur;
    if (language === 'ur-roman') return roman;
    return en;
  };

  const [name, setName] = useState(msg('My Rooftop Solar', 'میرا سولر پلانٹ', 'Mera Rooftop Solar'));
  const [location, setLocation] = useState('Lahore, Punjab');
  const [capacityKw, setCapacityKw] = useState('10.0');
  const [inverterBrand, setInverterBrand] = useState('Huawei');
  const [inverterModel, setInverterModel] = useState('SUN2000-10KTL-M1');
  const [panelCount, setPanelCount] = useState('18');
  const [panelType, setPanelType] = useState('585W Monofacial Tier-1 N-Type TOPCon');
  const [connectionMethod, setConnectionMethod] = useState('WiFi Inverter Cloud Datalogger');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [batteryType, setBatteryType] = useState('none');
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState('0');
  const [installationDate, setInstallationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-update estimated panel count when capacity changes
  const handleCapacityChange = (val: string) => {
    setCapacityKw(val);
    const kw = parseFloat(val);
    if (!isNaN(kw) && kw > 0) {
      const estCount = Math.round((kw * 1000) / 585);
      setPanelCount(estCount.toString());
    }
  };

  const parsedKw = parseFloat(capacityKw) || 10.0;
  const estDailyKwh = (parsedKw * 4.6).toFixed(1);
  const estMonthlyKwh = Math.round(parsedKw * 138);
  const estCo2SavingsTons = (parsedKw * 1.2).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const kw = parseFloat(capacityKw) || 10.0;
    const count = parseInt(panelCount) || Math.round((kw * 1000) / 585);

    addSolarSystem({
      name: name.trim() || msg('My Solar Plant', 'میرا سولر سسٹم', 'Mera Solar Plant'),
      location: location.trim() || 'Pakistan',
      capacityKw: kw,
      inverterBrand,
      inverterModel: inverterModel.trim() || `${inverterBrand}-SmartInverter`,
      installationDate: installationDate || new Date().toISOString().split('T')[0],
      connectionMethod,
      connectionStatus,
      panelCount: count,
      panelType,
      batteryCapacityKwh: batteryType !== 'none' ? parseFloat(batteryCapacityKwh) || 5.0 : 0,
    });

    setIsSubmitting(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-brand-darkest via-brand-dark to-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden ${isRtl ? 'font-urdu' : ''}`}>
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Language Switcher top right */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher language={language} setLanguage={setLanguage} dark />
      </div>

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-brand-dark to-emerald-800 text-white px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-md">
              <Sun className="w-8 h-8 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {msg('Step 2: Solar Plant Setup', 'مرحلہ 2: سولر پلانٹ سیٹ اپ', 'Step 2: Solar Plant Setup')}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {msg('Welcome', 'خوش آمدید', 'Welcome')}, {currentUser?.name || 'Solar Homeowner'}!
              </h1>
              <p className="text-xs text-emerald-100 mt-0.5">
                {msg(
                  'Enter your solar plant specifications so your dashboard reflects your actual generation capacity.',
                  'اپنے سولر سسٹم کی تفصیلات درج کریں تاکہ ڈیش بورڈ آپ کی اصل پیداوری صلاحیت کے مطابق کام کرے۔',
                  'Apne solar system ki details darj karein taake dashboard aap ke system ke mutabiq calculation kare.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-emerald-200 hover:text-white underline self-start sm:self-auto cursor-pointer"
          >
            {msg('Logout', 'لاگ آؤٹ', 'Logout')}
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-emerald-950 px-8 py-3.5 border-b border-emerald-900 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>
              {msg('Configuring', 'ترتیب دیا جا رہا ہے', 'Configure kar rahe hain')}{' '}
              <strong className="text-white font-mono">{parsedKw} kW</strong> System:
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              {msg('Est. Daily Yield:', 'تخمینہ روزانہ پیداوار:', 'Est. Daily Yield:')}{' '}
              <strong className="text-emerald-300 font-mono">~{estDailyKwh} kWh</strong>
            </span>
            <span>
              {msg('Monthly Est:', 'ماہانہ تخمینہ:', 'Monthly Est:')}{' '}
              <strong className="text-emerald-300 font-mono">~{estMonthlyKwh} kWh</strong>
            </span>
            <span>
              {msg('Annual CO2 Saved:', 'سالانہ کاربن کی بچت:', 'Annual CO2 Saved:')}{' '}
              <strong className="text-amber-300 font-mono">~{estCo2SavingsTons} {msg('Tons', 'ٹن', 'Tons')}</strong>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* System Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Solar System Name', 'سولر سسٹم کا نام', 'Solar System Ka Naam')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GreenHome 10kW Rooftop"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
            </div>

            {/* City / Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('City / Location', 'شہر یا مقام', 'Location / Shehar')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  list="city-options"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lahore, Punjab"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <datalist id="city-options">
                  {COMMON_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Total System Capacity kW */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('System Capacity (kW)', 'سسٹم کی صلاحیت (کلو واٹ)', 'System Capacity (kW)')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Zap className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="500"
                  required
                  value={capacityKw}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  placeholder="e.g. 10.0"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-bold text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {msg(
                  'What is your inverter / generation capacity? (e.g. 5, 8, 10, 15, 20 kW)',
                  'آپ کے انورٹر کی صلاحیت کتنے کلو واٹ ہے؟ (مثلاً 5، 8، 10، 15 کلو واٹ)',
                  'Aap ke inverter ki capacity kitne kW hai? (e.g. 5, 8, 10, 15, 20 kW)'
                )}
              </p>
            </div>

            {/* Inverter Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Inverter Brand', 'انورٹر برانڈ', 'Inverter Brand')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={inverterBrand}
                onChange={(e) => setInverterBrand(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              >
                {COMMON_INVERTER_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Inverter Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Inverter Model (Optional)', 'انورٹر ماڈل (اختیاری)', 'Inverter Model (Optional)')}
              </label>
              <input
                type="text"
                value={inverterModel}
                onChange={(e) => setInverterModel(e.target.value)}
                placeholder="e.g. SUN2000-10KTL-M1 or Nitrox-10kW"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Panel Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Panel Count', 'سولر پینلز کی تعداد', 'Panels Ki Tadaad')}
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={panelCount}
                  onChange={(e) => setPanelCount(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Panel Type & Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Panel Type / Rating', 'پینل کی قسم', 'Panel Ki Type')}
              </label>
              <select
                value={panelType}
                onChange={(e) => setPanelType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="585W Monofacial Tier-1 N-Type TOPCon">585W Monofacial N-Type TOPCon (Tier-1)</option>
                <option value="550W Bifacial Double Glass Perc">550W Bifacial Double Glass Perc</option>
                <option value="545W Mono PERC Half-Cell">545W Mono PERC Half-Cell</option>
                <option value="600W+ High Efficiency Modules">600W+ High Efficiency Modules</option>
                <option value="Standard Polycrystalline Panels">Standard Polycrystalline Panels</option>
              </select>
            </div>

            {/* Datalogger / Connection Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Telemetry Connection', 'ٹیلی میٹری کنکشن', 'Connection Method')}
              </label>
              <select
                value={connectionMethod}
                onChange={(e) => setConnectionMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="WiFi Inverter Cloud Datalogger">WiFi Inverter Cloud Datalogger (Real-time)</option>
                <option value="4G GSM IoT Datalogger">4G GSM IoT Datalogger</option>
                <option value="Local RS485 Modbus Direct">Local RS485 Modbus Direct</option>
                <option value="Manual Meter Telemetry">Manual Meter Telemetry</option>
              </select>
            </div>

            {/* Battery Storage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Battery Storage (Optional)', 'بیٹری اسٹوریج (اختیاری)', 'Battery Storage (Optional)')}
              </label>
              <select
                value={batteryType}
                onChange={(e) => setBatteryType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="none">{msg('No Battery (On-Grid Net Metering)', 'کوئی بیٹری نہیں (آن گرڈ نیٹ میٹرنگ)', 'No Battery (On-Grid Net Metering)')}</option>
                <option value="lithium">{msg('Lithium-ion 48V (LiFePO4)', 'لیتھیم آئن 48V', 'Lithium-ion 48V (LiFePO4)')}</option>
                <option value="tubular">{msg('Tubular Lead Acid Bank', 'ٹیوبلر لیڈ ایسڈ بینک', 'Tubular Lead Acid Bank')}</option>
                <option value="high-voltage">{msg('High Voltage Commercial Battery', 'ہائی وولٹیج کمرشل بیٹری', 'High Voltage Commercial Battery')}</option>
              </select>
            </div>

            {/* Installation Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {msg('Installation Date', 'تنصیب کی تاریخ', 'Installation Date')}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {msg(
                  `Your dashboard will be customized based on your ${parsedKw} kW solar capacity.`,
                  `آپ کا ڈیش بورڈ آپ کی ${parsedKw} کلو واٹ صلاحیت کے مطابق چلے گا۔`,
                  `Aap ka dashboard ab is system ki capacity (${parsedKw} kW) ke mutabiq chalega.`
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || parsedKw <= 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>
                {msg('Save System & Launch Dashboard', 'سسٹم محفوظ کریں اور ڈیش بورڈ کھولیں', 'Save System & Launch Dashboard')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
