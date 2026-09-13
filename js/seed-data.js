// EduWatch Seed Data: Realistic Pakistan Government Schools, Faculty & Strict 10m Geofences

const INITIAL_SCHOOLS = [
  {
    id: "SCH-LHR-01",
    name: "Govt. High School Model Town",
    nameUrdu: "گورنمنٹ ہائی سکول ماڈل ٹاؤن",
    tehsil: "Model Town",
    district: "Lahore",
    province: "Punjab",
    latitude: 31.4826,
    longitude: 74.3211,
    geofenceRadiusMeters: 10,
    totalStudents: 680,
    contactNumber: "+92 42 99230101"
  },
  {
    id: "SCH-RWP-02",
    name: "Govt. Girls Higher Secondary School Satellite Town",
    nameUrdu: "گورنمنٹ گرلز ہائر سیکنڈری سکول سیٹلائٹ ٹاؤن",
    tehsil: "Rawalpindi Urban",
    district: "Rawalpindi",
    province: "Punjab",
    latitude: 33.6421,
    longitude: 73.0673,
    geofenceRadiusMeters: 10,
    totalStudents: 850,
    contactNumber: "+92 51 9290202"
  },
  {
    id: "SCH-PEW-03",
    name: "Govt. Primary School Gulbahar",
    nameUrdu: "گورنمنٹ پرائمری سکول گل بہار",
    tehsil: "Peshawar Cantt",
    district: "Peshawar",
    province: "KPK",
    latitude: 34.0151,
    longitude: 71.5249,
    geofenceRadiusMeters: 10,
    totalStudents: 420,
    contactNumber: "+92 91 9210303"
  },
  {
    id: "SCH-SKR-04",
    name: "Govt. Comprehensive High School Sukkur",
    nameUrdu: "گورنمنٹ جامع ہائی اسکول سکھر",
    tehsil: "Sukkur City",
    district: "Sukkur",
    province: "Sindh",
    latitude: 27.7052,
    longitude: 68.8574,
    geofenceRadiusMeters: 10,
    totalStudents: 590,
    contactNumber: "+92 71 5620404"
  },
  {
    id: "SCH-QTA-05",
    name: "Govt. Sandeman High School Quetta",
    nameUrdu: "گورنمنٹ سنڈیمن ہائی اسکول کوئٹہ",
    tehsil: "Quetta City",
    district: "Quetta",
    province: "Balochistan",
    latitude: 30.1798,
    longitude: 66.9750,
    geofenceRadiusMeters: 10,
    totalStudents: 710,
    contactNumber: "+92 81 9200505"
  },
  {
    id: "SCH-KHP-06",
    name: "Govt. Comprehensive High School Khairpur",
    nameUrdu: "گورنمنٹ جامع ہائی اسکول خیرپور میرس",
    tehsil: "Khairpur Mirs",
    district: "Khairpur",
    province: "Sindh",
    latitude: 27.5295,
    longitude: 68.7592,
    geofenceRadiusMeters: 10,
    totalStudents: 520,
    contactNumber: "+92 243 920044"
  }
];

const INITIAL_TEACHERS = [
  {
    id: "T-101",
    schoolId: "SCH-LHR-01",
    name: "Tariq Mehmood",
    designation: "Senior Science Teacher (SST - BPS 16)",
    subject: "Mathematics & Physics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "0300-4567891"
  },
  {
    id: "T-102",
    schoolId: "SCH-LHR-01",
    name: "Fatima Noor",
    designation: "Elementary School Teacher (EST - BPS 15)",
    subject: "Chemistry & Biology",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "0333-5678902"
  },
  {
    id: "T-103",
    schoolId: "SCH-LHR-01",
    name: "Asim Raza",
    designation: "Computer Science Instructor (BPS 16)",
    subject: "Computer Science",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    phone: "0321-6789013",
    forceSaturdayAnomaly: true // Intentional ML test pattern: Saturday-Only Payroll scammer
  },
  {
    id: "T-201",
    schoolId: "SCH-RWP-02",
    name: "Ayesha Siddiqui",
    designation: "Senior Subject Specialist (SSS - BPS 17)",
    subject: "English Literature",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    phone: "0345-7890124"
  },
  {
    id: "T-202",
    schoolId: "SCH-RWP-02",
    name: "Zainab Bibi",
    designation: "EST Arts (BPS 15)",
    subject: "Urdu & Islamic Studies",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    phone: "0312-8901235"
  },
  {
    id: "T-301",
    schoolId: "SCH-PEW-03",
    name: "Muhammad Khan",
    designation: "Primary School Teacher (PST - BPS 14)",
    subject: "General Studies",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "0331-9012346"
  },
  {
    id: "T-302",
    schoolId: "SCH-PEW-03",
    name: "Gulzar Ahmad",
    designation: "PST Science (BPS 14)",
    subject: "Mathematics & Pashto",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    phone: "0344-0123457"
  },
  {
    id: "T-401",
    schoolId: "SCH-SKR-04",
    name: "Abdul Rehman",
    designation: "Senior Subject Specialist (BPS 17)",
    subject: "Chemistry & Sindhi",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    phone: "0301-1234568"
  },
  {
    id: "T-402",
    schoolId: "SCH-SKR-04",
    name: "Ghulam Mustafa",
    designation: "Senior Science Teacher (SST - BPS 16)",
    subject: "Mathematics & Physics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "0300-3344556"
  },
  {
    id: "T-403",
    schoolId: "SCH-SKR-04",
    name: "Farzana Memon",
    designation: "EST Humanities (BPS 15)",
    subject: "English & Islamiyat",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "0322-7788990"
  },
  {
    id: "T-501",
    schoolId: "SCH-QTA-05",
    name: "Sardar Mengal",
    designation: "SST Social Sciences (BPS 16)",
    subject: "Pakistan Studies",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    phone: "0336-2345679"
  },
  {
    id: "T-502",
    schoolId: "SCH-QTA-05",
    name: "Naseebullah Kakar",
    designation: "Senior Science Teacher (SST - BPS 16)",
    subject: "Mathematics & Science",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "0335-8899001"
  },
  {
    id: "T-601",
    schoolId: "SCH-KHP-06",
    name: "Nadeem Soomro",
    designation: "Senior Science Teacher (SST - BPS 16)",
    subject: "Physics & Mathematics",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    phone: "0302-9876541"
  },
  {
    id: "T-602",
    schoolId: "SCH-KHP-06",
    name: "Suhail Abbasi",
    designation: "Elementary School Teacher (EST - BPS 15)",
    subject: "English & Sindhi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "0334-1122334"
  }
];

function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

const INITIAL_CHECKINS = [
  {
    id: "CHK-001",
    teacherId: "T-101",
    schoolId: "SCH-LHR-01",
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    checkInTime: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    checkOutTime: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    dwellMinutes: 180,
    latitude: 31.48261,
    longitude: 74.32112,
    distanceMeters: 6, // Strictly within 10m gate perimeter!
    withinGeofence: true,
    faceMatchResult: "pass",
    livenessScore: 0.98,
    verifiedSelfie: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    classroomVerified: true,
    aiProofVerification: {
      verified: true,
      confidence: "98.4",
      aiVerdict: "AI Verified: Blackboard chalkboard text, handwritten signature, and timestamp validated without administrative bias."
    }
  },
  {
    id: "CHK-002",
    teacherId: "T-102",
    schoolId: "SCH-LHR-01",
    timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    checkInTime: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    checkOutTime: null, // Still on campus!
    dwellMinutes: 168,
    latitude: 31.48259,
    longitude: 74.32108,
    distanceMeters: 7, // Strictly within 10m!
    withinGeofence: true,
    faceMatchResult: "pass",
    livenessScore: 0.97,
    verifiedSelfie: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    classroomVerified: true,
    aiProofVerification: {
      verified: true,
      confidence: "96.5",
      aiVerdict: "AI Verified: In-class session confirmed via live blackboard snapshot."
    }
  },
  {
    id: "CHK-003",
    teacherId: "T-201",
    schoolId: "SCH-RWP-02",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    checkInTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    checkOutTime: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    dwellMinutes: 228,
    latitude: 33.64212,
    longitude: 73.06728,
    distanceMeters: 5, // Strictly within 10m!
    withinGeofence: true,
    faceMatchResult: "pass",
    livenessScore: 0.99,
    verifiedSelfie: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    classroomVerified: true
  },
  {
    id: "CHK-004",
    teacherId: "T-401",
    schoolId: "SCH-SKR-04",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    checkInTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    checkOutTime: null,
    dwellMinutes: 12, // Touch-and-Go anomaly!
    latitude: 27.7120, // 850m away!
    longitude: 68.8640,
    distanceMeters: 890,
    withinGeofence: false,
    faceMatchResult: "pass",
    livenessScore: 0.92,
    verifiedSelfie: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    classroomVerified: false
  },
  // Multi-day historical check-ins to demonstrate ML Saturday-Only Pattern Detection for T-103
  {
    id: "CHK-HIST-01",
    teacherId: "T-103",
    schoolId: "SCH-LHR-01",
    timestamp: "2026-09-05T08:15:00.000Z", // Saturday
    checkInTime: "2026-09-05T08:15:00.000Z",
    checkOutTime: null,
    dwellMinutes: 15,
    distanceMeters: 8,
    withinGeofence: true,
    faceMatchResult: "pass",
    livenessScore: 0.91,
    classroomVerified: false
  },
  {
    id: "CHK-HIST-02",
    teacherId: "T-103",
    schoolId: "SCH-LHR-01",
    timestamp: "2026-08-29T08:10:00.000Z", // Saturday
    checkInTime: "2026-08-29T08:10:00.000Z",
    checkOutTime: null,
    dwellMinutes: 20,
    distanceMeters: 7,
    withinGeofence: true,
    faceMatchResult: "pass",
    livenessScore: 0.93,
    classroomVerified: false
  }
];

const INITIAL_COMMUNITY_VERIFICATIONS = [
  {
    id: "COM-001",
    teacherId: "T-101",
    schoolId: "SCH-LHR-01",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    parentName: "M. Akram (Parent)",
    parentResponse: "yes",
    notes: "Teacher was present in Grade 9 Math period. Taught quadratic equations."
  },
  {
    id: "COM-002",
    teacherId: "T-102",
    schoolId: "SCH-LHR-01",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    parentName: "Nasreen Bibi",
    parentResponse: "yes",
    notes: "Present in 8th grade science lab."
  },
  {
    id: "COM-003",
    teacherId: "T-103",
    schoolId: "SCH-LHR-01",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    parentName: "Tariq Bashir (Parent)",
    parentResponse: "no",
    notes: "Computer lab was locked. Sir Asim was not present in school during school hours."
  }
];

const INITIAL_FLAGS = [
  {
    id: "FLG-001",
    teacherId: "T-103",
    schoolId: "SCH-LHR-01",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    type: "GHOST_TEACHER_ML_DETECTED",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    reason: "ML Algorithm Alert (94% Probability): Teacher exhibits Saturday-Only payroll gaming pattern and zero classroom dwell time.",
    mlAnomaly: {
      type: "SATURDAY_ONLY_GHOST",
      score: 94,
      explanation: "Teacher attends almost exclusively on Saturdays, habitually absent Mon–Fri."
    },
    evidence: {
      checkinDistance: "8m",
      communityVotes: { yes: 0, no: 2, unsure: 0 }
    }
  },
  {
    id: "FLG-002",
    teacherId: "T-401",
    schoolId: "SCH-SKR-04",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    type: "GEOFENCE_VIOLATION",
    severity: "HIGH",
    status: "OPEN",
    reason: "Check-in attempted 890m away from Govt. Comprehensive High School Sukkur (Allowed: 10m Gate Perimeter).",
    evidence: {
      checkinDistance: "890m",
      locationName: "Off-campus location near Sukkur Station Rd"
    }
  }
];

// Students mapped with Parent Secret Passcode so parents write passwords to see only their child's class
const INITIAL_STUDENTS = [
  {
    id: "STU-101",
    schoolId: "SCH-LHR-01",
    name: "Ali Raza",
    rollNo: "12",
    grade: "Grade 9 - Section A",
    classTeacherId: "T-101",
    parentName: "M. Akram",
    parentPhone: "0300-4567891",
    parentPasscode: "parent123" // Required parent secret password
  },
  {
    id: "STU-102",
    schoolId: "SCH-LHR-01",
    name: "Zainab Fatima",
    rollNo: "05",
    grade: "Grade 8 - Section B",
    classTeacherId: "T-102",
    parentName: "Nasreen Bibi",
    parentPhone: "0333-5678902",
    parentPasscode: "parent123"
  },
  {
    id: "STU-103",
    schoolId: "SCH-LHR-01",
    name: "Hamza Tariq",
    rollNo: "28",
    grade: "Grade 10 - Section C",
    classTeacherId: "T-103",
    parentName: "Tariq Bashir",
    parentPhone: "0321-6789013",
    parentPasscode: "parent123"
  },
  {
    id: "STU-201",
    schoolId: "SCH-RWP-02",
    name: "Mariam Siddiqui",
    rollNo: "03",
    grade: "Grade 7 - Section A",
    classTeacherId: "T-201",
    parentName: "Zahid Qureshi",
    parentPhone: "0345-7890124",
    parentPasscode: "parent123"
  },
  {
    id: "STU-202",
    schoolId: "SCH-RWP-02",
    name: "Sana Bibi",
    rollNo: "19",
    grade: "Grade 6 - Section B",
    classTeacherId: "T-202",
    parentName: "Imran Khan",
    parentPhone: "0312-8901235",
    parentPasscode: "parent123"
  },
  {
    id: "STU-301",
    schoolId: "SCH-PEW-03",
    name: "Bilal Ahmad",
    rollNo: "08",
    grade: "Grade 5 - Primary",
    classTeacherId: "T-301",
    parentName: "Gulzar Ahmad",
    parentPhone: "0331-9012346",
    parentPasscode: "parent123"
  },
  {
    id: "STU-401",
    schoolId: "SCH-SKR-04",
    name: "Rashid Ali",
    rollNo: "15",
    grade: "Grade 10 - Science",
    classTeacherId: "T-401",
    parentName: "Abdul Karim",
    parentPhone: "0301-1234568",
    parentPasscode: "parent123"
  },
  {
    id: "STU-501",
    schoolId: "SCH-QTA-05",
    name: "Jahangir Mengal",
    rollNo: "22",
    grade: "Grade 9 - Arts",
    classTeacherId: "T-501",
    parentName: "Sardar Mengal",
    parentPhone: "0336-2345679",
    parentPasscode: "parent123"
  },
  {
    id: "STU-601",
    schoolId: "SCH-KHP-06",
    name: "Faraz Soomro",
    rollNo: "11",
    grade: "Grade 9 - Science",
    classTeacherId: "T-601",
    parentName: "Altaf Soomro",
    parentPhone: "0302-9876541",
    parentPasscode: "parent123"
  }
];

// Initial Bilingual Formal Urdu Grievances & Inquiries
const INITIAL_GRIEVANCES = [
  {
    id: "GRV-001",
    studentId: "STU-103",
    teacherId: "T-103",
    schoolId: "SCH-LHR-01",
    parentName: "Tariq Bashir",
    subjectUrdu: "استاد کی مسلسل غیر حاضری اور تعلیمی حرج",
    subjectEn: "Continuous Teacher Absence & Academic Loss",
    messageUrdu: "جناب ہیڈ ماسٹر صاحب و ضلعی تعلیمی افسر (DEO)، گزارش ہے کہ کمپیوٹر سائنس کے استاد مسٹر عاصم رضا پچھلے دو ہفتوں سے باقاعدگی سے نہیں آ رہے ہیں۔ پیڈا ایکٹ کے تحت فوری نوٹس لیا جائے۔",
    messageEn: "Formal Grievance: Computer teacher Mr. Asim Raza has been chronically absent for the past two weeks. Immediate inquiry requested under PEEDA Act.",
    escalateToDeo: true,
    status: "ESCALATED_TO_DEO",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

window.EduWatchSeed = {
  INITIAL_SCHOOLS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_CHECKINS,
  INITIAL_COMMUNITY_VERIFICATIONS,
  INITIAL_FLAGS,
  INITIAL_GRIEVANCES,
  getTodayDateString
};
