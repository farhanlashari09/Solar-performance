import { Language } from '../types';

export interface ChatKnowledgeResponse {
  keywords: string[];
  reply: {
    en: string;
    ur: string;
    'ur-roman': string;
  };
  suggestions: {
    en: string[];
    ur: string[];
    'ur-roman': string[];
  };
  isWarning?: boolean;
}

export const defaultQuestionsByLang = {
  en: [
    'Why is my solar production low today?',
    'How can I improve solar panel performance?',
    'How often should solar panels be cleaned?',
    'What does my inverter error code mean?',
    'Why do I still get an electricity bill after solar installation?',
  ],
  ur: [
    'میرا سولر سسٹم آج کم بجلی کیوں بنا رہا ہے؟',
    'سولر پینلز کی کارکردگی کیسے بہتر بنائی جا سکتی ہے؟',
    'سولر پینلز کی صفائی کتنے دنوں بعد کروانی چاہیے؟',
    'انورٹر کا ایرر کوڈ کیا ظاہر کرتا ہے؟',
    'سولر لگانے کے بعد بھی بجلی کا بل کیوں آ رہا ہے؟',
  ],
  'ur-roman': [
    'Mera solar system kam bijli kyun bana raha hai?',
    'Solar panels ki performance kaise behtar karein?',
    'Solar panels ki maintenance kab karwani chahiye?',
    'Inverter error code ka kia matlab hota hai?',
    'Bijli ka bill solar lagwane ke baad bhi kyun aa raha hai?',
  ],
};

export const chatbotKnowledgeBase: ChatKnowledgeResponse[] = [
  // Solar sizing and wiring
  {
    keywords: ['size', 'sizing', 'kitna', 'how many panels', 'wire', 'wiring', 'cable', 'mc4', 'earthing', 'grounding', 'spd'],
    reply: {
      en: `For a safe solar system design, match the array, inverter, cable, and protection together:

• Panel-to-inverter voltage must remain inside the inverter MPPT limits, including cold-weather Voc.
• Use the inverter current rating to calculate DC string size and cable cross-section.
• Outdoor DC cables should use suitable UV-resistant solar cable; common roof sizes are 4 mm² or 6 mm² based on length and current.
• Use DC isolators, fuses or breakers, MC4 connectors, surge protection, and a low-resistance earth connection.
• Do not mix old and new panels or panels with different ratings in one string.

Share the inverter model, panel wattage/Voc/Vmp/Isc, and cable run length for a practical string and cable check.`,
      ur: `محفوظ سولر ڈیزائن میں پینل، انورٹر، تار اور حفاظتی آلات کو ایک ساتھ منتخب کرنا ضروری ہے۔ انورٹر کی MPPT حد، سرد موسم کا Voc، تار کا کراس سیکشن، ڈی سی آئسولیٹر، MC4 کنیکٹر، سرج پروٹیکشن اور ارثنگ چیک کریں۔`,
      'ur-roman': `Safe solar design ke liye inverter MPPT range, cold-weather Voc, DC cable size, isolator, MC4 connectors, surge protection aur earthing check karna zaroori hai.`
    },
    suggestions: {
      en: ['What cable size should I use for my solar system?', 'What is a safe earth resistance?'],
      ur: ['سولر سسٹم کے لیے کون سی تار مناسب ہے؟', 'ارثنگ کی بہتر صورت کیا ہے؟'],
      'ur-roman': ['Solar system ke liye cable size kya ho?', 'Earthing kaise theek rakhein?']
    }
  },
  {
    keywords: ['battery', 'backup', 'lifepo4', 'lithium', 'tubular', 'autonomy', 'dod'],
    reply: {
      en: `Battery backup should be sized from the nighttime load, not only the inverter rating.

Estimate Wh = appliance watts × hours of use. Select 24V or 48V storage, then apply the recommended Depth of Discharge: about 90% for LiFePO4 and about 50% for tubular lead-acid. Confirm the battery/inverter communication and current limits.

A 1.5-ton inverter AC can use 800-2000W, so it needs a much larger battery bank than lights and fans.`,
      ur: `بیٹری کا سائز رات کے استعمال، آلوٹگ، وولٹیج اور استعمالی گھنٹوں سے طے کریں۔ لیتھیم میں زیادہ قابل استعمال گنجائش ہے جبکہ ٹیوبلر بیٹری کو محفوظ حد تک استعمال کرنا چاہیے۔`,
      'ur-roman': `Battery backup sizing ke liye nightly load watts, usage hours, battery voltage aur depth-of-discharge use hoti hai. Lithium aur tubular ki limits alag hoti hain.`
    },
    suggestions: {
      en: ['How many kWh battery is needed for overnight backup?', 'Lithium or tubular battery?'],
      ur: ['رات بھر بیک اپ کے لیے کتنی بیٹری چاہیے؟', 'لیتھیم یا ٹیوبلر بیٹری؟'],
      'ur-roman': ['Raat ke backup ke liye battery kitni ho?', 'Lithium ya tubular battery?']
    }
  },
  // 1. Low production
  {
    keywords: ['low', 'kam', 'drop', 'production', 'bijli', 'generate', 'yield', 'bana', 'out'],
    reply: {
      en: `There are 4 common reasons why your solar generation may be lower than expected:

1. **Weather & Atmospheric Haze:** Even on sunny-looking days, high dust, particulate smog, or high ambient heat (above 35°C decreases panel efficiency by ~0.4% per degree) can reduce production.
2. **Dust & Soiling:** In Pakistan and arid regions, dry dust layers can decrease sunlight absorption by 10% to 25%.
3. **Partial Shading:** Trees, water tanks, or neighbouring buildings casting shadows over even one panel can lower the entire string output.
4. **Inverter or Grid Limitation:** If local grid voltage rises above 250V, inverters throttle back (curtailment) to protect circuits.

💡 *Check the 'Performance Analysis' tab to see your irradiance correlation!*`,
      ur: `سولر کی پیداوار میں کمی کی 4 بنیادی اور عام وجوہات ہو سکتی ہیں:

1. **موسمی حالات اور فضائی آلودگی:** بظاہر دھوپ کے باوجود گرد، سموگ یا شدید گرمی (35 ڈگری سے اوپر درجہ حرارت پینلز کی پیداوار 10-15 فیصد تک کم کر دیتا ہے)۔
2. **پینلز پر مٹی اور گرد کا جمنا:** پاکستان کے خشک اور گرد آلود موسم میں مٹی کی تہہ 10 سے 25 فیصد تک دھوپ کو روک دیتی ہے۔
3. **جزوی سایہ (Shading):** پانی کی ٹینکی، درخت یا ارد گرد کی عمارت کا سایہ کسی ایک پینل پر بھی پڑے تو پوری اسٹرنگ کی پیداوار کم ہو جاتی ہے۔
4. **گرڈ وولٹیج کی زیادتی:** اگر واپڈا/ڈسکو کے وولٹیج 250V سے تجاوز کر جائیں تو انورٹر خود بخود پروڈکشن کم کر دیتا ہے۔

💡 *مزید باریک بینی سے جانچنے کے لیے 'کارکردگی کا تجزیہ' صفحہ دیکھیں۔*`,
      'ur-roman': `Solar production kam honay ki 4 aam wajoohat hoti hain:

1. **Mausam aur Haze/Smog:** Bohat tez garmi (35°C se ooper solar panels ki efficiency gir jati hai) ya hawa mein mitti aur smog dhoop ko rokti hai.
2. **Mitti aur Gard (Soiling):** Hamaray mulk mein 10 se 15 din safai na ho to 10% se 25% tak production drop ho sakti hai.
3. **Partial Shading:** Kisi darakht, deewar ya paani ki tanki ka halka sa saya bhi pooray string ko drop kar sakta hai.
4. **Grid Over-Voltage (WAPDA Voltage):** Agar WAPDA ke voltage 250V se barh jayein to inverter generation limit kar deta hai.

💡 *Check karein 'Performance Analysis' tab taake exact graph aur deviation nazar aye!*`
    },
    suggestions: {
      en: ['How often should solar panels be cleaned?', 'What does my inverter error code mean?'],
      ur: ['سولر پینلز کی صفائی کتنے دنوں بعد کروانی چاہیے؟', 'کیا انورٹر پر کوئی ایرر کوڈ آ رہا ہے؟'],
      'ur-roman': ['Solar panels ki cleaning kitnay din baad karayein?', 'Inverter error code ka kia matlab hai?']
    }
  },

  // 2. Panel Cleaning
  {
    keywords: ['clean', 'cleaning', 'safai', 'wash', 'dhona', 'dust', 'soiling', 'maintenance'],
    reply: {
      en: `Best practices for cleaning solar panels:

• **Frequency:** In dusty urban areas (like Lahore, Karachi, Multan), clean panels every **10 to 14 days**. In rain-washed periods, once every 3 to 4 weeks is sufficient.
• **Timing:** Always wash in the **early morning (before 8:30 AM)** or late afternoon when panels are cool. Washing cold water on scorching hot glass can cause micro-cracks or glass shattering!
• **Water Type:** Use soft, demineralized, or RO water whenever possible. Hard bore water leaves permanent white calcium scale stains.
• **Tools:** Use soft microfiber mops or specialized solar brushes. Never use abrasive metal sponges, harsh chemicals, or high-pressure jet sprays directly on electrical seals.

⚠️ *Safety reminder: Never stand or walk on top of solar modules.*`,
      ur: `سولر پینلز کی صفائی کے اہم اور محفوظ اصول:

• **کتنے دنوں بعد؟** لاہور، کراچی اور ملتان جیسے گرد آلود شہروں میں ہر **10 سے 14 دن** بعد صفائی ضروری ہے۔ بارش کے موسم میں 3 سے 4 ہفتے کافی ہیں۔
• **کس وقت دھوئیں؟** ہمیشہ **صبح سویرے (صبح 8:30 سے پہلے)** یا شام کے وقت جب پینلز ٹھنڈے ہوں۔ تپتی دوپہر میں گرم پینل پر ٹھنڈا پانی ڈالنے سے گلاس ٹوٹ سکتا ہے یا اندرونی سیلز کریک ہو سکتے ہیں!
• **پانی کا انتخاب:** حتی الامکان میٹھا یا فلٹر شدہ پانی استعمال کریں۔ کھارے یا بورنگ کے پانی سے شیشے پر سفید نمکیات کے مستقل داغ بن جاتے ہیں۔
• **اوزار:** نرم وائپر یا مائیکرو فائبر برش استعمال کریں۔ کھرچنے والے تار یا تیز کیمیکل کبھی استعمال نہ کریں۔

⚠️ *حفاظتی انتباہ: پینلز کے اوپر کبھی پاؤں رکھ کر نہ چلیں۔*`,
      'ur-roman': `Solar panels ki safai ke ahem tips:

• **Kitnay din baad?** Dusty shehron (Lahore, Karachi, Multan) mein har **10 se 14 din** baad panels dhona zaroori hai.
• **Kis time dhona chahiye?** Hamesha **subah sawere (8:30 AM se pehle)** ya asar ke baad jab panels thanday hon. Dopehr ki dhoop mein garam glass par thanda paani daalnay se glass chatakh sakta hai!
• **Kaisa paani use karein?** Boring ka khara paani use na karein kyunke calcium ke white daagh parh jatay hain. Meetha ya RO filtered paani best hai.
• **Kaisay saaf karein?** Naram wiper ya microfiber brush use karein. Tez pressure washer ya khurdaray kapray se bachein.

⚠️ *Panels ke upar kabhi pair rakh kar na kharay hon.*`
    },
    suggestions: {
      en: ['Request Maintenance for panel cleaning', 'Why do I still get an electricity bill?'],
      ur: ['پینلز کی صفائی کے لیے ٹیکنیشن تلاش کریں', 'سولر لگانے کے بعد بھی بل کیوں آتا ہے؟'],
      'ur-roman': ['Cleaning ke liye technician book karein', 'Solar ke baad bhi bill kyun aa raha hai?']
    }
  },

  // 3. Electricity bill after solar
  {
    keywords: ['bill', 'bijli ka bill', 'cost', 'wapda', 'k-electric', 'disco', 'net metering', 'units', 'peak'],
    reply: {
      en: `Why you might still receive an electricity bill after installing solar:

1. **Peak Hours Units (5 PM - 11 PM):** Under Pakistani DISCO and typical net-metering regulations, solar units exported during off-peak daytime cannot directly offset expensive **Peak Hour** electricity units! Peak units are charged at higher evening tariffs.
2. **Fixed Taxes & Charges:** Utility bills include fixed meter rent, TV fees, fuel price adjustments (FPA), and electricity duties even with net-zero energy balance.
3. **Night-time Grid Consumption:** High AC usage at night draws from the grid if you do not have batteries.
4. **Billing Settlement Cycles:** Net-metering green meter credits are settled quarterly or bi-annually by the distribution company.

💡 *Tip: Shift heavy loads (water pump, washing machines, EV charging) to 10:00 AM – 3:00 PM to maximize direct self-consumption!*`,
      ur: `سولر سسٹم لگانے کے بعد بھی بجلی کا بل آنے کی وجوہات:

1. **پیک آورز کے یونٹس (شام 5 سے رات 11 بجے):** نیٹ میٹرنگ پالیسی کے تحت دن کے وقت بھیجے گئے سولر یونٹس سے شام کے مہنگے **پیک آور یونٹس** براہ راست ایڈجسٹ نہیں ہوتے۔
2. **مقررہ ٹیکسز اور چارجز:** بل میں میٹر رینٹ، ٹی وی فیس، فیول پرائس ایڈجسٹمنٹ (FPA) اور دیگر ٹیکسز بغیر کسی رعایت کے شامل رہتے ہیں۔
3. **رات کے وقت بجلی کا استعمال:** اگر آپ کے پاس بیٹریاں نہیں ہیں تو رات کو اے سی اور دیگر اشیاء کا تمام بوجھ گرڈ سے آتا ہے۔
4. **نیٹ میٹرنگ بلنگ ایڈجسٹمنٹ:** ڈسکو کمپنیاں ہر تین ماہ یا چھ ماہ بعد گرین میٹر کے اضافی یونٹس کا مالیاتی حساب برابر کرتی ہیں۔

💡 *مشورہ: پانی کے پمپ، واشنگ مشین اور استری دن 10 بجے سے دوپہر 3 بجے کے دوران چلائیں تاکہ براہ راست شمسی بجلی کا فائدہ ہو۔*`,
      'ur-roman': `Solar lagane ke baad bhi WAPDA / K-Electric ka bill kyun ata hai?

1. **Peak Hours (Shaam 5 se Raat 11):** Din ko banaye gaye solar units se shaam ke mehengay Peak Units adjust nahi hotay! Peak hours ka alag bill banta hai.
2. **Fixed Taxes & Surcharges:** Meter rent, TV fee, FPA (Fuel Price Adjustment), aur government taxes zero units par bhi aate hain.
3. **Raat Ka Load:** Agar battery system nahi hai to raat ko AC aur lights ka load grid se hi chalay ga.
4. **Billing Settlement Cycle:** Net-metering ke extra units har 3 ya 6 maheenay baad settle hotay hain.

💡 *Tip: Paani ki motor aur washing machines din 10 se 3 baje ke darmiyan chalayein taake direct solar use ho!*`
    },
    suggestions: {
      en: ['How can I improve solar panel performance?', 'Find Technicians for Net-Metering check'],
      ur: ['سولر پینلز کی پیداوار کیسے بہتر کریں؟', 'نیٹ میٹرنگ چیک کرنے کے لیے ٹیکنیشن تلاش کریں'],
      'ur-roman': ['Solar panel performance kaise barhayein?', 'Net-metering check karwanay ke liye technician dhoondein']
    }
  },

  // 4. Inverter Error Codes
  {
    keywords: ['inverter', 'error', 'code', 'fault', 'red light', 'trip', 'growatt', 'huawei', 'solis', 'goodwe', 'warning'],
    reply: {
      en: `Inverter fault codes indicate specific hardware, grid, or cabling protections:

• **Grid Voltage High / Grid Out of Range (e.g. Huawei 2064, Growatt 102, Solis 001):** The local utility grid voltage exceeded 253V, so the inverter safely decoupled from the grid.
• **Insulation Resistance Low / PV Isolation Fault (e.g. Huawei 2032, GoodWe 23):** Moisture in conduit pipes, damaged wire insulation, or wet MC4 connectors touching metal structure.
• **PV Overvoltage / VOC Limit Exceeded:** Too many panels wired in series on one MPPT string.
• **DC Arc Fault:** Loose MC4 joint sparking along the string.

⚠️ **STRICT ELECTRICAL SAFETY NOTICE:**
Never attempt to open inverter metal covers, touch bare DC cables, or bypass DC breakers yourself. DC voltages often exceed 400V - 800V DC and pose lethal electric shock hazards.

*Please tell me your inverter brand (Huawei, Growatt, Solis, GoodWe, Inverex) and the exact error code on the screen, and I will look up the specific diagnostic!*`,
      ur: `انورٹر کے ایرر کوڈز دراصل حفاظتی اقدامات کی نشاندہی کرتے ہیں:

• **گرڈ وولٹیج زیادہ (Grid Voltage High / e.g. Growatt 102, Huawei 2064):** واپڈا کے وولٹیج 253 وولٹ سے اوپر چلے گئے ہیں، اس لیے انورٹر نے حفاظت کے پیش نظر رابطہ منقطع کر لیا۔
• **آئیسولیشن فالٹ (PV Isolation / e.g. GoodWe 23, Huawei 2032):** تاروں میں نمی، پائپ میں پانی یا ننگی تار لوہے کے فریم سے چھو رہی ہے۔
• **ڈی سی آرک فالٹ (DC Arc Fault):** پینلز کے جوائنٹ یا کنیکٹر ڈھیلے ہونے کی وجہ سے سپارکنگ ہو رہی ہے۔

⚠️ **انتہائی اہم حفاظتی تنبیہ:**
کبھی بھی خود انورٹر کا ڈھکن نہ کھولیں اور نہ ہی ڈی سی تاروں کو ننگے ہاتھ سے چھوئیں۔ سولر سسٹم میں 400 سے 800 وولٹ ڈی سی کرنٹ ہوتا ہے جو جان لیوا ثابت ہو سکتا ہے۔

*براہ کرم اپنے انورٹر کا برانڈ (Huawei, Growatt, Solis, GoodWe وغیرہ) اور اسکرین پر آنے والا ایرر کوڈ بتائیں تاکہ میں مکمل تفصیل فراہم کر سکوں۔*`,
      'ur-roman': `Inverter error codes specific safety protections ki wajah se aate hain:

• **Grid Voltage High (e.g. Growatt Error 102, Huawei 2064):** WAPDA ke voltage 253V se zyada ho gaye hain, is liye inverter safe mode mein chala gaya.
• **PV Isolation Fault:** Barish ya nami ki wajah se DC taar frame se touch ho rahi hai.
• **DC Arc Fault:** Koi MC4 connector dheela hai aur sparking kar raha hai.

⚠️ **SAFETY WARNING:**
Inverter ko khud kabhi na kholein aur na live DC taaron ko hath lagayein! 500V se 800V DC current intehai khatarnak hota hai. Hamesha certified technician bulayein.

*Apnay inverter ka brand (Huawei, Growatt, Solis, GoodWe) aur screen par anay wala code batayein taake exact diagnosis bata sakoon!*`
    },
    suggestions: {
      en: ['Find Technicians for Inverter Repair', 'Why is my solar production low today?'],
      ur: ['انورٹر مرمت کے لیے ٹیکنیشن تلاش کریں', 'میرا سولر سسٹم کم بجلی کیوں بنا رہا ہے؟'],
      'ur-roman': ['Inverter repair ke liye technician book karein', 'Mera solar system kam bijli kyun bana raha hai?']
    },
    isWarning: true
  },

  // 5. General / Safety fallback
  {
    keywords: ['safety', 'wire', 'shock', 'open', 'repair', 'wire', 'hazard', 'touch', 'khatra'],
    reply: {
      en: `⚠️ **Solar Electrical Safety Protocol:**
1. Solar panels continuously produce high-voltage DC whenever exposed to daylight; you cannot turn them off simply by pressing a switch!
2. Never cut or disconnect MC4 cables while the system is generating current, as this creates a dangerous high-temperature electric arc.
3. For all internal inverter repairs, capacitor changes, or roof wiring repairs, always hire a verified PEC / certified solar technician through our platform.`,
      ur: `⚠️ **سولر الیکٹریکل سیفٹی پروٹوکول:**
1. دن کی روشنی میں سولر پینلز مسلسل ہائی وولٹیج ڈی سی بجلی بنا رہے ہوتے ہیں، انہیں بٹن دبا کر بند نہیں کیا جا سکتا!
2. کام جاری رہنے کے دوران ایم سی فور کنیکٹر کبھی ہاتھ سے نہ کھینچیں ورنہ شدید الیکٹرک آرک بن سکتا ہے۔
3. انورٹر کے اندرونی پرزوں، کیپیسیٹر یا چھت پر وائرنگ کی مرمت کے لیے ہمیشہ ہمارے پلیٹ فارم سے تصدیق شدہ ٹیکنیشن کی خدمات حاصل کریں۔`,
      'ur-roman': `⚠️ **Solar Electrical Safety Rules:**
1. Dhoop mein solar panels musalsal high voltage DC bana rahay hotay hain, inko aam switch se band nahi kiya ja sakta!
2. Current flow ke doran MC4 connector ko kabhi na kheinchein, shadeed aag ya blast ho sakta hai.
3. Kisi bhi wiring ya inverter fault ke liye SolarCare ke verified technician se rabta karein.`
    },
    suggestions: {
      en: ['Find Technicians', 'Ask another solar question'],
      ur: ['ٹیکنیشن تلاش کریں', 'کوئی اور سوال پوچھیں'],
      'ur-roman': ['Technicians dhoondein', 'Koi aur sawal poochein']
    },
    isWarning: true
  }
];

function cleanOutput(str: string): string {
  if (!str) return '';
  return str.replace(/[*#,،]/g, '');
}

export function findChatbotResponse(userText: string, lang: Language): { reply: string; suggestions: string[]; isWarning?: boolean } {
  const normalized = userText.toLowerCase().trim();

  // Look for match in knowledge base
  for (const item of chatbotKnowledgeBase) {
    const matched = item.keywords.some(k => normalized.includes(k.toLowerCase()));
    if (matched) {
      return {
        reply: cleanOutput(item.reply[lang] || item.reply.en),
        suggestions: (item.suggestions[lang] || item.suggestions.en).map(cleanOutput),
        isWarning: item.isWarning,
      };
    }
  }

  // Fallback response by language
  const fallbackReplies = {
    en: `Thank you for your question. While I analyze your query please note that for specific inverter error codes or system capacity sizing you can share your inverter model (Huawei Growatt Solis etc.) or check our 'Performance Analysis' and 'Find Technicians' directory for certified on-site inspections.`,
    ur: `آپ کے سوال کا شکریہ۔ اگر آپ اپنے انورٹر کے ایرر یا سسٹم کی گنجائش کے بارے میں پوچھ رہے ہیں تو برائے مہربانی اپنے انورٹر کا برانڈ اور ماڈل بتائیں۔ مزید برآں آپ تفصیلی جانچ کے لیے 'کارکردگی کا تجزیہ' دیکھ سکتے ہیں یا تصدیق شدہ ٹیکنیشن سے رجوع کر سکتے ہیں۔`,
    'ur-roman': `Aap ke sawal ka shukriya. Agar aap inverter error ya generation ke baray mein pooch rahay hain to barahe karam apna inverter model batayein. Mazeed tafseelat ke liye aap 'Performance Analysis' dekh saktay hain ya hamaray platform se certified technician book kar saktay hain.`
  };

  return {
    reply: cleanOutput(fallbackReplies[lang] || fallbackReplies.en),
    suggestions: (defaultQuestionsByLang[lang] || defaultQuestionsByLang.en).map(cleanOutput),
  };
}
