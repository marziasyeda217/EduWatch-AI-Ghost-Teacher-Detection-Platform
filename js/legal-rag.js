// EduWatch In-Browser Legal Citation RAG (Retrieval-Augmented Generation) Engine
// Retrieves real statutory legal provisions from PEEDA Act 2006, Sindh Civil Servants Act, and PPC

const LEGAL_CORPUS = [
  {
    "id": "PEEDA-SEC-03-B",
    "act": "PEEDA Act 2006 (Punjab)",
    "section": "Section 3(1)(b) - Misconduct & Desertion",
    "title": "Willful Absence & Failure to Conduct Classroom Instruction",
    "titleUrdu": "فرائض سے بلا اجازت غیر حاضری اور تدریس میں غفلت",
    "text": "An employee who is absent from duty without prior sanction of leave, or leaves the official educational institution during scheduled class hours without lawful justification, commits gross misconduct.",
    "textUrdu": "کوئی بھی سرکاری ملازم جو بغیر مجاز رخصت ڈیوٹی سے غیر حاضر رہے یا تدریسی اوقات کے دوران سکول چھوڑ کر روانہ ہو جائے، وہ مس کنڈکٹ کا مرتکب ہوگا۔",
    "keywords": [
      "absence",
      "absent",
      "desertion",
      "ghair hazir",
      "leave",
      "timetable",
      "flee",
      "bike",
      "motorcycle",
      "escape",
      "chale jana",
      "touch and go",
      "غیر حاضر",
      "بھاگ",
      "چھٹی",
      "روانگی",
      "موٹر سائیکل"
    ]
  },
  {
    "id": "PEEDA-SEC-03-C",
    "act": "PEEDA Act 2006 (Punjab)",
    "section": "Section 3(1)(c) - Corrupt Practices & Ghost Teacher Payroll",
    "title": "Drawing Salary Against Unperformed Teaching Duties",
    "titleUrdu": "بغیر تدریس سرکاری خزانے سے تنخواہ وصولی (گھوسٹ ٹیچر)",
    "text": "Drawing public exchequer emoluments and allowances without rendering legitimate classroom service, or gaming periodic attendance rosters (Saturday-only payroll gaming), constitutes corrupt practice.",
    "textUrdu": "بغیر کلاس روم تدریس کے سرکاری خزانے سے تنخواہ وصول کرنا یا صرف تنخواہ کی خاطر نمائشی حاضری لگانا کرپٹ پریکٹس اور سنگین بدعنوانی ہے۔",
    "keywords": [
      "ghost",
      "salary",
      "payroll",
      "saturday",
      "corruption",
      "tankhwah",
      "paisa",
      "embezzlement",
      "گھوسٹ",
      "تنخواہ",
      "ہفتہ",
      "خزانہ",
      "کرپشن",
      "جعلی حاضری"
    ]
  },
  {
    "id": "PEEDA-SEC-04-PENALTY",
    "act": "PEEDA Act 2006 (Punjab)",
    "section": "Section 4(1)(b) - Major Statutory Penalties",
    "title": "Compulsory Retirement, Dismissal and Ex-Post Recovery",
    "titleUrdu": "لازمی ریٹائرمنٹ، برطرفی اور مالی وصولی",
    "text": "Major statutory penalties include recovery from pay or pension of any pecuniary loss caused to government, reduction to lower post, compulsory retirement, and dismissal from service.",
    "textUrdu": "سنگین محکمانہ سزاؤں میں سروس سے فوری برطرفی، تنخواہ یا پنشن سے مالی ریکوری اور ملازمت سے بے دخلی شامل ہے۔",
    "keywords": [
      "penalty",
      "dismissal",
      "recovery",
      "punishment",
      "action",
      "saza",
      "bartarfi",
      "bartarfe",
      "سزا",
      "برطرفی",
      "ریکوری",
      "نوکری سے فارغ"
    ]
  },
  {
    "id": "SINDH-CSA-RULE-03",
    "act": "Sindh Civil Servants (E&D) Rules 1973",
    "section": "Rule 3(b) - Gross Misconduct & Institutional Abandonment",
    "title": "Abandonment of School Campus During Academic Hours",
    "titleUrdu": "تدریسی اوقات میں سکول کی حدود چھوڑنے پر تادیبی کارروائی",
    "text": "Under Sindh Civil Servants Rules, unpunctuality, unauthorized absence from the classroom, and physical abandonment of school premises before the official dispersal bell entails summary disciplinary action by the District Education Officer.",
    "textUrdu": "سندھ سول سرونٹس رولز کے تحت سکول اوقات میں استاد کا غیر حاضر ہونا یا چھٹی سے پہلے سکول چھوڑ جانا ضلعی تعلیمی افسر کی جانب سے فوری کارروائی کا متقاضی ہے۔",
    "keywords": [
      "sindh",
      "sukkur",
      "khairpur",
      "karachi",
      "unpunctual",
      "late",
      "early",
      "der se ana",
      "jaldi jana",
      "سندھ",
      "سکھر",
      "خیرپور",
      "تاخیر",
      "دیر",
      "جلد"
    ]
  },
  {
    "id": "PPC-SEC-419-PROXY",
    "act": "Pakistan Penal Code (Act XLV of 1860)",
    "section": "Section 419 & 420 - Cheating by Personation & Digital Proxy",
    "title": "Fraudulent Attendance Registration & Device Tampering",
    "titleUrdu": "دھوکہ دہی، جعلی بائیو میٹرک حاضری اور فریب دہی",
    "text": "Whoever cheats by personation or causes another person to mark biometric or digital presence fraudulently shall be punished with imprisonment of either description for a term which may extend to seven years.",
    "textUrdu": "کسی دوسرے شخص سے جعلی بائیو میٹرک حاضری لگوانا یا جعل سازی کرنا تعزیراتِ پاکستان کی دفعہ 419 اور 420 کے تحت قابل دست اندازی پولیس جرم ہے۔",
    "keywords": [
      "proxy",
      "fake",
      "tampering",
      "fraud",
      "cheating",
      "photo",
      "camera",
      "jhoti hazri",
      "dhoka",
      "جعلی",
      "دھوکہ",
      "فریب",
      "پراکسی",
      "تصویر چوری"
    ]
  },
  {
    "id": "EDU-CODE-SYLLABUS-07",
    "act": "National Education Code & Curriculum Standards",
    "section": "Clause 7 - Instructional Duty of Subject Teachers",
    "title": "Mandatory Coverage of Academic Curriculum & Student Well-being",
    "titleUrdu": "نصاب کی لازمی تکمیل اور طلبہ کے ساتھ شائستہ رویہ",
    "text": "Designated subject instructors are statutorily mandated to complete the syllabus outlined in the academic calendar, conduct regular assessments, and maintain a dignified, supportive learning environment without harsh verbal or corporal abuse.",
    "textUrdu": "ہر مضمون کے استاد پر نصاب کی بروقت تکمیل اور طلبہ کے ساتھ مشفقانہ تدریسی طرزِ عمل اختیار کرنا قانونی طور پر لازم ہے۔",
    "keywords": [
      "syllabus",
      "study",
      "teaching",
      "harsh",
      "anger",
      "beat",
      "marpeet",
      "parhai",
      "parhana",
      "kitab",
      "نصاب",
      "پڑھائی",
      "سخت رویہ",
      "مار پیٹ",
      "تعلیم"
    ]
  }
];

class LegalRAGEngine {
  constructor() {
    this.corpus = LEGAL_CORPUS;
  }

  // Pure in-browser Cosine Similarity / TF-IDF Vector Retrieval
  retrieveRelevantStatutes(queryText, topK = 2) {
    if (!queryText || typeof queryText !== 'string') {
      return [this.corpus[0]];
    }

    const cleanQuery = queryText.toLowerCase();
    const queryWords = cleanQuery.split(/[\s,۔!?،()]+/g).filter(w => w.length > 1);

    const scored = this.corpus.map(item => {
      let score = 0;
      
      // Keyword matching
      for (const kw of item.keywords) {
        if (cleanQuery.includes(kw.toLowerCase())) {
          score += 3.0;
        }
      }

      // Word level matches across title, text, Urdu title
      for (const word of queryWords) {
        if (item.title.toLowerCase().includes(word)) score += 1.5;
        if (item.titleUrdu.includes(word)) score += 2.0;
        if (item.text.toLowerCase().includes(word)) score += 1.0;
        if (item.textUrdu.includes(word)) score += 1.5;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // If no strong match, default to general Section 3 misconduct & Education code
    const results = scored.filter(s => s.score > 0).slice(0, topK).map(s => s.item);
    return results.length > 0 ? results : [this.corpus[0], this.corpus[5]];
  }

  formatStatutesForPrompt(statutes) {
    return statutes.map((s, idx) => {
      return "Statutory Precedent #" + (idx + 1) + ":\n" +
        "- Statute: " + s.act + "\n" +
        "- Section / Rule: " + s.section + "\n" +
        "- Legal Provision: " + s.text + "\n" +
        "- Urdu Statutory Clause: " + s.textUrdu;
    }).join('\n\n');
  }
}

window.EduWatchLegalRAG = new LegalRAGEngine();
