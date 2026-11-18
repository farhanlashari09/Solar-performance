// SolarCare Comprehensive Solar Engineering AI Brain
// - Strict Domain Relevance Classifier: rejects off-topic queries
// - Deep Multilingual Solar Engineering Knowledge: answers in English Urdu or Roman Urdu

// Helper to detect language
export function detectLanguage(text, preferredLang = 'en') {
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ur';
  }
  const romanUrduWords = [
    'kya', 'kia', 'mera', 'meri', 'meray', 'hai', 'hain', 'kaise', 'kese', 'kitna', 'kitni', 'kitnay',
    'kyun', 'chal', 'sakta', 'sakti', 'bijli', 'chahiye', 'lagwana', 'batao', 'dekhna', 'safai',
    'kharab', 'paani', 'taar', 'chhat', 'garmi', 'dhoop', 'ghantay', 'wali', 'wala', 'karwayein'
  ];
  const lower = text.toLowerCase();
  const hasRomanWords = romanUrduWords.some(w => new RegExp(`\\b${w}\\b`).test(lower));
  if (hasRomanWords) {
    return 'ur-roman';
  }
  return preferredLang || 'en';
}

// Comprehensive set of solar / photovoltaic / inverter / battery / electrical domain keywords
const SOLAR_DOMAIN_KEYWORDS = [
  // Core solar terms
  'solar', 'sun', 'sunlight', 'pv', 'photovoltaic', 'panel', 'panels', 'cell', 'cells',
  'inverter', 'inverters', 'inverex', 'huawei', 'growatt', 'solis', 'goodwe', 'sungrow', 'knox', 'fronius', 'voltronic', 'crown',
  // Electrical units & parameters
  'kw', 'kwh', 'watt', 'watts', 'unit', 'units', 'voltage', 'volt', 'volts', 'current', 'amp', 'amps', 'ampere',
  'mppt', 'voc', 'isc', 'vmp', 'imp', 'string', 'dc', 'ac', 'grid', 'transformerless', 'phase', '3-phase', 'single phase',
  // Net metering & tariffs
  'net metering', 'net-metering', 'green meter', 'wapda', 'k-electric', 'disco', 'lesco', 'iesco', 'mepco', 'gepco', 'ke',
  'bill', 'billing', 'tariff', 'peak', 'off-peak', 'nepra', 'fpa', 'export', 'import',
  // Batteries & storage
  'battery', 'batteries', 'lithium', 'lifepo4', 'tubular', 'lead acid', 'lead-acid', 'backup', 'ups', 'ah', 'c-rate', 'dod', 'bms', 'cycle life',
  // System types
  'hybrid', 'on-grid', 'on grid', 'off-grid', 'off grid', 'grid-tied', 'grid tied',
  // Physical / environmental
  'dust', 'cleaning', 'soiling', 'wash', 'clean', 'dirt', 'rain', 'haze', 'smog', 'fog', 'temperature', 'heat', 'irradiance', 'shading', 'shade',
  'tilt', 'angle', 'azimuth', 'direction', 'south', 'north', 'structure', 'l2', 'l3', 'elevated',
  // Panel tech
  'bifacial', 'monofacial', 'monocrystalline', 'polycrystalline', 'topcon', 'perc', 'n-type', 'p-type', 'tier-1', 'tier 1', 'hotspot', 'diode',
  // Wiring & safety
  'wire', 'wiring', 'cable', 'cables', 'mc4', 'earthing', 'grounding', 'breaker', 'fuse', 'spd', 'surge', 'shock', 'arc', 'fire', 'leakage',
  // Loads & appliances
  'ac', 'air conditioner', 'inverter ac', 'ton', 'water pump', 'motor', 'tubewell', 'refrigerator', 'fridge', 'load', 'consumption',
  // Urdu / Roman Urdu solar vocabulary
  'bijli', 'dhoop', 'sooraj', 'safai', 'dhona', 'mitti', 'gard', 'taar', 'chhat', 'chhat par', 'saya', 'units', 'kilo watt', 'plate', 'plates',
  'batteri', 'battery', 'kharabi', 'bana raha', 'banata', 'chalega', 'chal sakta'
];

// Checks if query belongs to the solar / energy domain
export function isSolarDomainQuery(query) {
  const clean = query.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  return SOLAR_DOMAIN_KEYWORDS.some(kw => {
    if (kw.includes(' ')) {
      return clean.includes(kw);
    }
    return words.includes(kw) || clean.includes(kw);
  });
}

// Helper to remove any *, # or comma from output text
function cleanText(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[*#,،]/g, '');
}

export function generateSolarAIResponse(query, userLang = 'en') {
  const lang = detectLanguage(query, userLang);
  const q = query.toLowerCase();

  let result = null;

  // STRICT RELEVANCE GUARD: REJECT OUT-OF-DOMAIN QUESTIONS
  if (!isSolarDomainQuery(query)) {
    if (lang === 'ur') {
      result = {
        reply: `⚠️ غیر متعلقہ سوال:

میں سولر کیئر اسسٹنٹ ہوں جو کہ صرف شمسی توانائی (Solar Energy) سولر پینلز انورٹرز بیٹریوں نیٹ میٹرنگ اور بجلی کے سسٹمز کا ماہر ہے۔

میں غیر متعلقہ موضوعات (جیسے عام باتیں کوڈنگ کھانے پکانے یا دیگر متفرق سوالات) پر جوابات فراہم نہیں کرتا۔

👉 براہ کرم شمسی توانائی اور اپنے سولر سسٹم سے متعلق سوال پوچھیں۔`,
        suggestions: [
          'میرا سولر سسٹم آج کم بجلی کیوں بنا رہا ہے؟',
          'سولر پینلز کی صفائی کتنے دنوں بعد کروانی چاہیے؟',
          'کیا 5kW سسٹم پر 1.5 ٹن انورٹر AC چل سکتا ہے؟'
        ],
        isWarning: false
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `⚠️ Ghair Mutalliqah (Irrelevant) Sawal:

Main SolarCare Assistant hoon jo sirf Solar Energy Solar Panels Inverters Batteries Net-Metering aur photovoltaic bijli ke masail ka specialist hai.

Main solar ke ilawa kisi doosray topic (maslan aam baatein coding recipes ya general knowledge) ka jawab nahi de sakta.

👉 Barahe karam sirf solar system inverters aur bijli ki generation se mutalliq relevant sawal poochein.`,
        suggestions: [
          'Mera solar system kam bijli kyun bana raha hai?',
          'Solar panels ki cleaning kitnay din baad karayein?',
          'Kya 5kW solar par 1.5 ton inverter AC chal sakta hai?'
        ],
        isWarning: false
      };
    } else {
      result = {
        reply: `⚠️ Irrelevant Question Detected:

I am the SolarCare Assistant an AI specialized exclusively in solar energy photovoltaic panels inverters battery storage systems net-metering tariffs and PV maintenance.

I cannot answer questions unrelated to solar energy or electrical power systems.

👉 Please ask a relevant question about solar systems inverter error codes generation sizing or panel maintenance.`,
        suggestions: [
          'Why is my solar production low today?',
          'Can I run a 1.5 ton inverter AC on a 5kW system?',
          'What is the difference between On-Grid and Hybrid inverters?'
        ],
        isWarning: false
      };
    }
  }

  // 1. SIZING / RUNNING APPLIANCES (AC water pump load feasibility)
  else if (q.includes('ac') || q.includes('air conditioner') || q.includes('motor') || q.includes('pump') || q.includes('tubewell') || q.includes('load') || q.includes('chal') || q.includes('run')) {
    if (lang === 'ur') {
      result = {
        reply: `سولر سسٹم پر ایئر کنڈیشنر (AC) اور بھاری لوڈ چلانے کا تفصیلی تجزیہ:

1. 1.5 ٹن انورٹر اے سی کی کھپت:
   - شروع میں (Starting Peak): تقریباً 1800W سے 2000W
   - ٹھنڈک برقرار رکھنے پر (Normal Running): 800W سے 1200W (درجہ حرارت کی سیٹنگ کے مطابق)۔
2. سسٹم کی صلاحیت کا موازنہ:
   - 5kW سولر سسٹم: دن کے وقت (صبح 10 سے سہ پہر 3:30 تک) ایک 1.5 ٹن انورٹر اے سی اور گھر کی لائٹس پنکھے اور فریج آسانی سے چلا سکتا ہے۔
   - 10kW سولر سسٹم: بیک وقت دو سے تین 1.5 ٹن انورٹر اے سی اور 1 ہارس پاور کا پانی کا پمپ بغیر کسی پریشانی کے چلا سکتا ہے۔
3. رات کے وقت چلانا:
   - رات کو اے سی چلانے کے لیے کم از کم 10 سے 15 کلوواٹ آور کی لیتھیم (LiFePO4) بیٹری درکار ہوتی ہے جو کافی مہنگی پڑتی ہے۔
   - اس لیے نیٹ میٹرنگ کے ذریعے دن کی اضافی بجلی واپڈا کو بھیج کر رات کو واپس استعمال کرنا سب سے سستا اور پائیدار حل ہے۔`,
        suggestions: ['کیا 5kW سسٹم پر واٹر پمپ چل سکتا ہے؟', 'سولر کے لیے کون سی بیٹری بہترین ہے؟']
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `Solar System Par AC Aur Heavy Load Chalane Ka Analysis:

1. 1.5 Ton Inverter AC Ki Consumption:
   - Starting mein taqreeban 1800W se 2000W power leta hai.
   - Room thanda honay ke baad 800W se 1200W par drop ho jata hai.
2. System Capacity Guidelines:
   - 5 kW System: Din ki dhoop mein 1 Inverter AC (1.5 Ton) + normal household load (fans lights fridge) araam se chala sakta hai.
   - 10 kW System: Ek waqt mein 2 se 3 Inverter ACs aur 1-HP water pump chala sakta hai.
3. Raat Ko Chalane Ka Tareeqa:
   - Raat ko battery par AC chalana bohat mehanga parta hai kyunke 10-15 kWh LiFePO4 battery chahiye hoti hai.
   - Net-Metering sab se best solution hai: din ko extra units export karein aur raat ko grid se utilize karein!`,
        suggestions: ['5kW system rozana kitnay units banata hai?', 'Lithium vs Tubular battery konsi behtar hai?']
      };
    } else {
      result = {
        reply: `Appliance Load Sizing & Inverter AC Feasibility:

1. Power Consumption for a 1.5-Ton Inverter AC:
   - Peak compressor startup draw: ~1800W - 2000W
   - Modulated cooling draw: ~800W - 1200W (depending on thermostat setpoint).
2. Capacity Breakdown:
   - 5 kW Solar Array: Comfortably runs one 1.5-Ton Inverter AC plus baseline household essentials (refrigerator LED lights fans) during peak sunlight hours (10:00 AM - 3:30 PM).
   - 10 kW Solar Array: Effortlessly powers two to three 1.5-Ton Inverter ACs concurrently alongside an induction water pump.
3. Night-time Running Strategy:
   - Running ACs off-grid overnight demands large storage (~10-15 kWh LiFePO4 battery bank). With grid-tied Net Metering daytime exported green units offset night-time grid usage far more economically.`,
        suggestions: ['How many units does a 10kW system generate daily?', 'Which battery chemistry is best for solar backup?']
      };
    }
  }

  // 2. DAILY UNITS PRODUCTION & GENERATION CALCULATIONS
  else if (q.includes('unit') || q.includes('units') || q.includes('kwh') || q.includes('produce') || q.includes('kitnay unit') || q.includes('generation') || q.includes('kitni bijli')) {
    if (lang === 'ur') {
      result = {
        reply: `پاکستان میں سولر سسٹم کی یومیہ اور ماہانہ یونٹس پیداوار:

اوسطاً 1 کلوواٹ (1 kW) کا معیاری سولر سسٹم روزانہ 3.8 سے 4.5 یونٹس (kWh) بجلی پیدا کرتا ہے۔

• 3 کلوواٹ سسٹم: 12 سے 14 یونٹس روزانہ (~360 - 420 یونٹس ماہانہ)
• 5 کلوواٹ سسٹم: 19 سے 23 یونٹس روزانہ (~570 - 690 یونٹس ماہانہ)
• 10 کلوواٹ سسٹم: 38 سے 46 یونٹس روزانہ (~1150 - 1380 یونٹس ماہانہ)
• 15 کلوواٹ سسٹم: 58 سے 68 یونٹس روزانہ (~1750 - 2050 یونٹس ماہانہ)

موسمی فرق: گرمیوں میں لمبے دن کی وجہ سے پیداوار 20% بڑھ جاتی ہے جبکہ سردیوں میں دھند یا چھوٹے دنوں کی وجہ سے پیداوار میں 20% سے 25% کمی واقع ہوتی ہے۔`,
        suggestions: ['کیا پینلز گندے ہونے سے یونٹس کم بنتے ہیں؟', 'نیٹ میٹرنگ کے یونٹس کا حساب کیسے ہوتا ہے؟']
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `Solar System Daily Units (kWh) Generation Benchmark:

Pakistan mein average 1 kW solar array rozana 3.8 se 4.5 units banata hai:

• 3 kW System: 12 se 14 units rozana (~360 - 420 units monthly)
• 5 kW System: 19 se 23 units rozana (~570 - 690 units monthly)
• 10 kW System: 38 se 46 units rozana (~1150 - 1380 units monthly)
• 15 kW System: 58 se 68 units rozana (~1750 - 2050 units monthly)

Mausami Asraat: May se July mein dhoop lambi honay se peak generation hoti hai jabke December aur January mein smog aur chotay dino ki wajah se units thori kam banti hain.`,
        suggestions: ['10kW system lagwane ka kharcha kitna ata hai?', 'Net metering units rollover kaisay hotay hain?']
      };
    } else {
      result = {
        reply: `Photovoltaic Generation Benchmarks (kWh / Units):

On average a well-aligned Tier-1 solar array generates 3.8 to 4.5 kWh (Units) per installed kW per day:

• 3 kW Array: ~12 - 14 units/day (~360 - 420 units/month)
• 5 kW Array: ~19 - 23 units/day (~570 - 690 units/month)
• 10 kW Array: ~38 - 46 units/day (~1150 - 1380 units/month)
• 15 kW Array: ~58 - 68 units/day (~1750 - 2050 units/month)

Factors Affecting Yield: Solar panel tilt angle (optimal: 28°-32° True South) cleaning frequency (every 10-14 days in dusty climates) and zero module shading.`,
        suggestions: ['How does dust soiling affect daily yield?', 'What is the payback period for a 10kW system?']
      };
    }
  }

  // 3. BATTERIES (Lithium LiFePO4 vs Tubular lifespan maintenance)
  else if (q.includes('battery') || q.includes('lithium') || q.includes('tubular') || q.includes('lifepo4') || q.includes('backup') || q.includes('acid')) {
    if (lang === 'ur') {
      result = {
        reply: `لیتھیم (LiFePO4) بمقابلہ ٹیوبلر (Lead-Acid) بیٹریاں:

1. لیتھیم آئرن فاسفیٹ (LiFePO4):
   - زندگی: 10 سے 12 سال (4000 سے 6000 سائیکلز)۔
   - قابل استعمال گنجائش: 90% تک گہری ڈسچارج ہو سکتی ہے۔
   - دیکھ بھال: صفر دیکھ بھال اسمارٹ BMS تحفظ بدبو یا تیزاب سے پاک۔
2. ٹیوبلر لیڈ ایسڈ بیٹری:
   - زندگی: 2 سے 3 سال (800 سے 1200 سائیکلز)۔
   - قابل استعمال گنجائش: صرف 50% تک استعمال کر سکتے ہیں ورنہ پلیٹیں خراب ہو جاتی ہیں۔
   - دیکھ بھال: ہر ماہ تیزابی پانی (ڈسٹلڈ واٹر) چیک کرنا اور ڈالنا پڑتا ہے۔

💡 فیصلہ: اگر بجٹ اجازت دے تو ہائبرڈ انورٹر کے ساتھ ہمیشہ لیتھیم LiFePO4 بیٹری لگائیں یہ طویل مدت میں بہت سستی پڑتی ہے۔`,
        suggestions: ['کیا لیتھیم بیٹری دھماکے کا خطرہ رکھتی ہے؟', 'ہائبرڈ انورٹر اور آن گرڈ میں کیا فرق ہے؟']
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `Lithium (LiFePO4) vs Tubular Battery Comparison:

1. Lithium Iron Phosphate (LiFePO4):
   - Life: 10 se 12 saal (4000+ charging cycles).
   - Depth of Discharge (DOD): 90% capacity use kar saktay hain.
   - Maintenance: Zero maintenance. Na paani daalna parta hai na smell aati hai.
2. Tubular Lead-Acid Battery:
   - Life: Sirf 2 se 3 saal.
   - Depth of Discharge: Maximum 50% use kar saktay hain.
   - Maintenance: Har maheenay distilled water top-up karna lazmi hai.

💡 Faisla: Hybrid inverter ke liye Lithium LiFePO4 battery best aur long-term sasti option hai.`,
        suggestions: ['Battery backup kitnay ghantay chalega?', 'Inverter battery settings kaisay set karein?']
      };
    } else {
      result = {
        reply: `Lithium (LiFePO4) vs Deep-Cycle Tubular Lead-Acid Batteries:

1. Lithium Iron Phosphate (LiFePO4):
   - Cycle Life: 4000 to 6000 cycles (~10-12 years lifespan).
   - Usable Depth of Discharge (DOD): 90% usable capacity.
   - Maintenance: Maintenance-free non-toxic integrated Battery Management System (BMS).
2. Tubular Lead-Acid:
   - Cycle Life: 800 to 1200 cycles (~2-3 years).
   - Usable Depth of Discharge (DOD): Strictly limited to 50% to prevent sulfation.
   - Maintenance: Requires regular distilled water top-ups and terminal corrosion cleaning.

💡 Verdict: For modern hybrid inverters (Huawei Growatt Solis GoodWe) LiFePO4 offers far lower levelized cost of storage over a 10-year period.`,
        suggestions: ['How to calculate required battery capacity?', 'What is an on-grid vs hybrid inverter?']
      };
    }
  }

  // 4. ON-GRID vs HYBRID vs OFF-GRID INVERTERS
  else if (q.includes('hybrid') || q.includes('on-grid') || q.includes('on grid') || q.includes('off-grid') || q.includes('off grid') || q.includes('grid-tied')) {
    if (lang === 'ur') {
      result = {
        reply: `آن گرڈ (On-Grid) بمقابلہ ہائبرڈ (Hybrid) انورٹرز:

1. آن گرڈ انورٹر (On-Grid):
   - صرف واپڈا گرڈ کے ساتھ مل کر کام کرتا ہے اور نیٹ میٹرنگ کے ذریعے یونٹس ایکسپورٹ کرتا ہے۔
   - فائدہ: سب سے زیادہ قابل اعتماد اور کم قیمت۔
   - نقصان: لوڈ شیڈنگ کے دوران اینٹی آئی لینڈنگ سیفٹی کی وجہ سے بند ہو جاتا ہے۔
2. ہائبرڈ انورٹر (Hybrid):
   - گرڈ سولر پینلز اور بیٹریوں تینوں کو بیک وقت کنٹرول کرتا ہے۔
   - فائدہ: لوڈ شیڈنگ میں بیک اپ دیتا ہے اور نیٹ میٹرنگ کو بھی سپورٹ کرتا ہے۔
   - نقصان: آن گرڈ کے مقابلے میں قیمت قدرے زیادہ ہوتی ہے۔`,
        suggestions: ['کیا آن گرڈ انورٹر پر لوڈ شیڈنگ میں بجلی مل سکتی ہے؟', 'نیٹ میٹرنگ کے لیے کون سے انورٹرز منظور شدہ ہیں؟']
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `On-Grid vs Hybrid Inverters Ka Farq:

1. On-Grid Inverter:
   - Yeh inverter direct WAPDA grid ke sath attach hota hai aur batteries support nahi karta.
   - Faida: Sasta high efficiency (98%+) Net-Metering ke liye standard.
   - Khaami: Agar WAPDA ki light chali jaye to safety ke liye foran band ho jata hai.
2. Hybrid Inverter:
   - Solar + Grid + Batteries teeno ko manage karta hai.
   - Faida: Load shedding mein ghar ko bina rukawat bijli deta hai aur extra units WAPDA ko export bhi karta hai.
   - Khaami: On-grid se qeemat zyada hoti hai.`,
        suggestions: ['Net metering ke liye konsa inverter approved hai?', 'Lithium battery hybrid inverter se kaisay connect karein?']
      };
    } else {
      result = {
        reply: `On-Grid vs Hybrid Inverter Comparison:

1. On-Grid (Grid-Tied) Inverter:
   - Synchronizes directly with the public utility grid; requires no batteries.
   - Pros: Highest efficiency (98.4%+) lowest initial cost gold standard for Net Metering.
   - Cons: Automatically decouples during power outages due to mandatory Anti-Islanding safety regulations (IEEE 1547).
2. Hybrid (Multi-Mode) Inverter:
   - Manages photovoltaic generation battery storage and grid export concurrently.
   - Pros: Provides sub-10ms UPS power during load shedding while retaining net-metering export capability.
   - Cons: Higher initial capital investment.`,
        suggestions: ['Which inverters are approved for net-metering?', 'What is anti-islanding protection?']
      };
    }
  }

  // 5. TILT ANGLE DIRECTION & SHADING
  else if (q.includes('tilt') || q.includes('angle') || q.includes('direction') || q.includes('south') || q.includes('shade') || q.includes('shading')) {
    if (lang === 'ur') {
      result = {
        reply: `سولر پینلز کا درست رخ اور زاویہ (Tilt Angle & Direction):

1. رخ (Direction): پاکستان اور شمالی نصف کرہ میں تمام سولر پینلز کا رخ بالکل جنوب (True South) کی جانب ہونا چاہیے تاکہ دن بھر سورج کا زیادہ سے زیادہ سامنا رہے۔
2. زاویہ (Tilt Angle):
   - سالانہ بہترین فکسڈ زاویہ: 28° سے 32° ڈگری۔
   - گرمیوں میں سورج اونچا ہوتا ہے (15°-20°) جبکہ سردیوں میں سورج جھکا ہوا ہوتا ہے (40°-45°)۔
3. سایہ کا اثر (Shading Loss):
   - اگر ایک پینل کے چھوٹے حصے پر بھی پانی کی ٹینکی یا دیوار کا سایہ پڑے تو بائی پاس ڈائیوڈز متحرک ہو جاتے ہیں جس سے پوری اسٹرنگ کی پیداوار 30% سے 50% تک گر سکتی ہے۔`,
        suggestions: ['کیا ایڈجسٹ ایبل اسٹرکچر لگوانا چاہیے؟', 'بائی فیشل پینلز کا کیا فائدہ ہے؟']
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `Solar Panels Ka Sahi Angle Aur Direction:

1. Direction: Hamesha panels ka rukh True South (Junub) ki taraf hona chahiye.
2. Tilt Angle:
   - Fixed Year-Round Angle: 28° se 32° degree Pakistan ke liye sab se behtareen hai.
3. Shading Ka Nuqsan:
   - Agar kisi ek panel par bhi halka sa saya aye to internal bypass diodes on ho jatay hain aur poori string voltage drop ho sakti hai. Is liye rooftop ko 100% shade-free hona chahiye.`,
        suggestions: ['L2 vs L3 structure mein kya farq hai?', 'Bifacial solar panels kaisay kaam kartay hain?']
      };
    } else {
      result = {
        reply: `Photovoltaic Array Orientation & Tilt Angle:

1. Azimuth (Direction): In the Northern Hemisphere (Pakistan South Asia) panels must face True South (180° Azimuth) for maximum annual energy capture.
2. Tilt Angle:
   - Fixed Year-Round Angle: 28° to 30° delivers optimal annual performance balance.
3. Partial Shading Mitigation:
   - Even 5% partial shading on a single cell triggers internal bypass diodes causing an impedance mismatch that drops string power by 25%-40%. Keep arrays strictly clear of parapet walls water tanks and antenna poles.`,
        suggestions: ['What is the difference between L2 and L3 structures?', 'How does bifacial albedo gain work?']
      };
    }
  }

  // 6. GENERAL TECHNICAL SOLAR ASSISTANCE
  else {
    if (lang === 'ur') {
      result = {
        reply: `سولر انجینئرنگ کی رہنمائی:

آپ کے سوال کے حوالے سے اہم تکنیکی و عملی نکات:

1. سولر کارکردگی: پینلز کی پیداوار دھوپ کی شدت (Irradiance) ماحول کی گرمی اور شیشے کی صفائی پر منحصر ہوتی ہے۔
2. انورٹر کا کردار: انورٹر سسٹم کا دل ہے۔ اس بات کی تصدیق کریں کہ انورٹر پر کوئی سرخ لائٹ یا وارننگ کوڈ نہیں آ رہا اور وولٹیج درست رینج میں ہیں۔
3. حفاظتی انتباہ: ہائی وولٹیج ڈی سی وائرنگ اور انورٹر کو خود کھولنے سے گریز کریں۔ کسی بھی خرابی کی صورت میں پلیٹ فارم پر موجود تصدیق شدہ ٹیکنیشن سے رجوع کریں۔

💡 مزید تفصیلی جواب کے لیے اپنے انورٹر کا برانڈ (Huawei Growatt Solis GoodWe) یا مخصوص مسئلہ بیان کریں۔`,
        suggestions: ['میرا سسٹم آج کم بجلی کیوں بنا رہا ہے؟', 'پینلز کی صفائی کتنے دنوں بعد کروانی چاہیے؟', 'نیٹ میٹرنگ کے بل کا حساب کیسے ہوتا ہے؟']
      };
    } else if (lang === 'ur-roman') {
      result = {
        reply: `Solar Engineering Specialist Ka Jawab:

Aap ke solar sawal ke hawalay se zaroori maloomat:

1. Performance Factor: Solar panels ki output dhoop ki shiddat angle aur safai par depend karti hai.
2. Inverter Health: Inverter par hamesha green normal status light honi chahiye. Agar koi red light ya error code aaye to notice karein.
3. Safety Warning: Live DC wiring ko kabhi nange haath se na chhuwein. High voltage shock se bachne ke liye certified technician bulayein.

💡 Mazeed specific jankari ke liye apna Inverter Model ya masla likhein!`,
        suggestions: ['Solar production kam hone ki wajoohat?', 'Solar panels ki cleaning kaisay karein?', 'Net metering bill kaisay calculate hota hai?']
      };
    } else {
      result = {
        reply: `Solar Engineering Technical Advisory:

Here is an analysis regarding your solar inquiry:

1. Photovoltaic Physics: Solar generation is governed by ambient irradiance (W/m2) module cell temperature (cells lose ~0.35% power per °C rise above 25°C standard test condition) and optical glass transmittance.
2. Inverter Operation: Modern string inverters (Huawei Growatt Solis GoodWe) continuously optimize Maximum Power Point Tracking (MPPT). Ensure DC isolators and AC surge protection devices (SPDs) remain engaged.
3. Safety Notice: DC array voltages frequently reach 500V-800V DC. Never touch exposed MC4 contacts or attempt inverter internal repairs without certified high-voltage safety credentials.

💡 Feel free to ask specific questions regarding inverter error codes net-metering regulations battery storage sizing or panel degradation rates!`,
        suggestions: ['Why is solar production low today?', 'How often should solar panels be cleaned?', 'What does my inverter error code mean?']
      };
    }
  }

  // Ensure output is sanitized from any *, # or comma characters
  return {
    reply: cleanText(result.reply),
    suggestions: (result.suggestions || []).map(cleanText),
    isWarning: !!result.isWarning
  };
}
