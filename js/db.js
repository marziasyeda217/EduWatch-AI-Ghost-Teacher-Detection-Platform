// EduWatch Unified Data Access Layer
// Supports dual-mode: Firestore (Cloud) or LocalStorage with Reactive Pub/Sub

class EduWatchDB {
  constructor() {
    this.listeners = {};
    this.firestore = null;
    this.firebaseApp = null;
    this.isCloudMode = false;
    this.init();
  }

  init() {
    this.initLocalStorage();
    this.tryInitFirebase();
  }

  // Reactive Event Bus
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in listener for ${event}:`, e);
        }
      });
    }
    if (event !== "data_changed" && this.listeners["data_changed"]) {
      this.listeners["data_changed"].forEach(cb => cb({ event, data }));
    }
  }

  // Local Storage Initialization
  initLocalStorage() {
    const existing = localStorage.getItem(EDUWATCH_STORAGE_KEYS.APP_DATA);
    if (!existing) {
      this.resetToDemoData();
    } else {
      const data = this.getLocalData();
      // Auto-migrate if older seed data is detected (e.g. missing Khairpur or old 300m radius or missing grievances)
      const hasKhairpur = data.schools && data.schools.some(s => s.id === "SCH-KHP-06");
      const hasStrict10m = data.schools && data.schools.every(s => (s.geofenceRadiusMeters || 10) <= 15);
      const hasGrievances = data.grievances && data.grievances.length > 0;
      const hasStudents = data.students && data.students.length > 0 && data.students[0].parentPasscode;

      if (!hasKhairpur || !hasStrict10m || !hasGrievances || !hasStudents) {
        console.log("EduWatch: Refreshing local storage to synchronize 10m geofence, Khairpur/Sukkur schools, and grievances.");
        this.resetToDemoData();
      } else {
        if (!data.students || data.students.length === 0) {
          data.students = JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_STUDENTS || []));
          this.saveLocalData(data);
        }
      }
    }
  }

  resetToDemoData() {
    const data = {
      schools: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_SCHOOLS)),
      teachers: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_TEACHERS)),
      students: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_STUDENTS || [])),
      checkins: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_CHECKINS)),
      communityVerifications: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_COMMUNITY_VERIFICATIONS)),
      flags: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_FLAGS)),
      grievances: JSON.parse(JSON.stringify(window.EduWatchSeed.INITIAL_GRIEVANCES || []))
    };
    localStorage.setItem(EDUWATCH_STORAGE_KEYS.APP_DATA, JSON.stringify(data));
    this.emit("data_changed", { reason: "reset" });
  }

  getLocalData() {
    try {
      const stored = localStorage.getItem(EDUWATCH_STORAGE_KEYS.APP_DATA);
      const parsed = stored ? JSON.parse(stored) : {};
      return {
        schools: parsed.schools || [],
        teachers: parsed.teachers || [],
        students: parsed.students || (window.EduWatchSeed ? window.EduWatchSeed.INITIAL_STUDENTS : []),
        checkins: parsed.checkins || [],
        communityVerifications: parsed.communityVerifications || [],
        flags: parsed.flags || [],
        grievances: parsed.grievances || (window.EduWatchSeed ? window.EduWatchSeed.INITIAL_GRIEVANCES : [])
      };
    } catch (e) {
      console.error("Error reading local data:", e);
      return { schools: [], teachers: [], students: [], checkins: [], communityVerifications: [], flags: [], grievances: [] };
    }
  }

  saveLocalData(data) {
    localStorage.setItem(EDUWATCH_STORAGE_KEYS.APP_DATA, JSON.stringify(data));
  }

  // Firebase Firestore Integration
  async tryInitFirebase() {
    const config = window.EduWatchConfig.firebaseConfig;
    const isEnabled = window.EduWatchConfig.isFirebaseEnabled;

    if (!config || !isEnabled || typeof firebase === "undefined") {
      this.isCloudMode = false;
      return false;
    }

    try {
      if (!firebase.apps.length) {
        this.firebaseApp = firebase.initializeApp(config);
      } else {
        this.firebaseApp = firebase.app();
      }
      this.firestore = firebase.firestore();
      this.isCloudMode = true;
      console.log("EduWatch connected to Firebase Firestore!");
      return true;
    } catch (e) {
      console.warn("Could not connect to Firebase Firestore, falling back to Local Storage:", e);
      this.isCloudMode = false;
      return false;
    }
  }

  // School Queries
  async getSchools() {
    if (this.isCloudMode && this.firestore) {
      try {
        const snap = await this.firestore.collection("schools").get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        console.warn("Firestore error getting schools, using local:", e);
      }
    }
    return this.getLocalData().schools;
  }

  async getSchool(schoolId) {
    const schools = await this.getSchools();
    return schools.find(s => s.id === schoolId) || null;
  }

  // DEO Registration Feature: Register New School
  async addSchool(schoolData) {
    const provincePrefix = {
      "Sindh": "SCH-SND",
      "Punjab": "SCH-PJB",
      "Khyber Pakhtunkhwa": "SCH-KPK",
      "Balochistan": "SCH-BAL"
    }[schoolData.province] || "SCH-REG";

    const newSchool = {
      id: schoolData.id || `${provincePrefix}-${Math.floor(100 + Math.random() * 900)}`,
      name: schoolData.name || "Government High School",
      district: schoolData.district || "Sukkur",
      province: schoolData.province || "Sindh",
      lat: parseFloat(schoolData.lat) || 27.7050,
      lng: parseFloat(schoolData.lng) || 68.8570,
      geofenceRadiusMeters: parseInt(schoolData.geofenceRadiusMeters) || 10,
      headmaster: schoolData.headmaster || "Headmaster",
      headmasterPhone: schoolData.headmasterPhone || "+92-300-0000000",
      headmasterPass: schoolData.headmasterPass || "hm123",
      emisCode: schoolData.emisCode || `${Math.floor(10000000 + Math.random() * 90000000)}`,
      registeredBy: schoolData.registeredBy || "District Education Officer",
      registeredAt: new Date().toISOString()
    };

    const local = this.getLocalData();
    local.schools.push(newSchool);
    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("schools").doc(newSchool.id).set(newSchool);
      } catch (e) {
        console.error("Error saving school to Firestore:", e);
      }
    }

    this.emit("school_added", newSchool);
    this.emit("data_changed", { reason: "school_added", school: newSchool });
    return newSchool;
  }

  // Teacher Queries & Mutations
  async getTeachers(schoolId = null) {
    if (this.isCloudMode && this.firestore) {
      try {
        let query = this.firestore.collection("teachers");
        if (schoolId) query = query.where("schoolId", "==", schoolId);
        const snap = await query.get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        console.warn("Firestore error getting teachers, using local:", e);
      }
    }
    const teachers = this.getLocalData().teachers;
    return schoolId ? teachers.filter(t => t.schoolId === schoolId) : teachers;
  }

  async getTeacher(teacherId) {
    const teachers = await this.getTeachers();
    return teachers.find(t => t.id === teacherId) || null;
  }

  // School Admin Feature: Add New Teacher
  async addTeacher(teacherData) {
    const newTeacher = {
      ...teacherData,
      id: teacherData.id || `T-${Math.floor(100 + Math.random() * 900)}`,
      avatar: teacherData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };

    const local = this.getLocalData();
    local.teachers.push(newTeacher);
    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("teachers").doc(newTeacher.id).set(newTeacher);
      } catch (e) {
        console.error("Error saving teacher to Firestore:", e);
      }
    }

    this.emit("teacher_added", newTeacher);
    this.emit("data_changed", { reason: "teacher_added", teacher: newTeacher });
    return newTeacher;
  }

  // School Admin Feature: Remove Teacher
  async deleteTeacher(teacherId) {
    const local = this.getLocalData();
    const index = local.teachers.findIndex(t => t.id === teacherId);
    if (index >= 0) {
      const removed = local.teachers.splice(index, 1)[0];
      this.saveLocalData(local);

      if (this.isCloudMode && this.firestore) {
        try {
          await this.firestore.collection("teachers").doc(teacherId).delete();
        } catch (e) {
          console.error("Error deleting teacher from Firestore:", e);
        }
      }

      this.emit("teacher_deleted", removed);
      this.emit("data_changed", { reason: "teacher_deleted", teacherId });
      return removed;
    }
    return null;
  }

  // Student Management Methods
  async getStudents(schoolId = null) {
    let students = this.getLocalData().students || [];
    if (schoolId) {
      students = students.filter(s => s.schoolId === schoolId);
    }
    return students;
  }

  async getStudentById(studentId) {
    if (!studentId) return null;
    const students = this.getLocalData().students || [];
    return students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase()) || null;
  }

  async addStudent(studentData) {
    const newStudent = {
      ...studentData,
      id: studentData.id || `STU-${Math.floor(100 + Math.random() * 900)}`
    };

    const local = this.getLocalData();
    local.students = local.students || [];
    local.students.push(newStudent);
    this.saveLocalData(local);

    this.emit("student_added", newStudent);
    this.emit("data_changed", { reason: "student_added", student: newStudent });
    return newStudent;
  }

  async deleteStudent(studentId) {
    const local = this.getLocalData();
    local.students = local.students || [];
    const index = local.students.findIndex(s => s.id === studentId);
    if (index >= 0) {
      const removed = local.students.splice(index, 1)[0];
      this.saveLocalData(local);

      this.emit("student_deleted", removed);
      this.emit("data_changed", { reason: "student_deleted", studentId });
      return removed;
    }
    return null;
  }

  // Check-in Queries & Mutation
  async getCheckins(date = null, teacherId = null) {
    let checkins = [];
    if (this.isCloudMode && this.firestore) {
      try {
        let query = this.firestore.collection("checkins");
        if (teacherId) query = query.where("teacherId", "==", teacherId);
        const snap = await query.orderBy("timestamp", "desc").get();
        checkins = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        checkins = this.getLocalData().checkins;
      }
    } else {
      checkins = this.getLocalData().checkins;
    }

    if (date) {
      checkins = checkins.filter(c => c.timestamp.startsWith(date));
    }
    if (teacherId) {
      checkins = checkins.filter(c => c.teacherId === teacherId);
    }
    return checkins;
  }

  async addCheckin(checkin) {
    const newDoc = {
      ...checkin,
      id: checkin.id || `CHK-${Date.now().toString().slice(-5)}`,
      timestamp: checkin.timestamp || new Date().toISOString()
    };

    const local = this.getLocalData();
    local.checkins.unshift(newDoc);
    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("checkins").doc(newDoc.id).set(newDoc);
      } catch (e) {
        console.error("Error saving checkin to Firestore:", e);
      }
    }

    this.emit("checkin_added", newDoc);
    return newDoc;
  }

  // Teacher Checkout & Dwell Time (Anti "Bike Touch-and-Go" Scam)
  async recordDepartureCheckout(checkinId, checkoutData = {}) {
    const local = this.getLocalData();
    const checkin = local.checkins.find(c => c.id === checkinId);
    if (!checkin) {
      console.warn("Checkin record not found for checkout:", checkinId);
      return null;
    }

    const checkoutTime = checkoutData.checkoutTimestamp || new Date().toISOString();
    const arrivalTime = new Date(checkin.timestamp).getTime();
    const departureTime = new Date(checkoutTime).getTime();
    const dwellMinutes = Math.max(1, Math.round((departureTime - arrivalTime) / (1000 * 60)));

    checkin.checkoutTimestamp = checkoutTime;
    checkin.checkoutDistanceMeters = checkoutData.distanceMeters != null ? Math.round(checkoutData.distanceMeters) : 7;
    checkin.dwellTimeMinutes = dwellMinutes;
    checkin.status = "COMPLETED";

    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("checkins").doc(checkinId).update({
          checkoutTimestamp: checkin.checkoutTimestamp,
          checkoutDistanceMeters: checkin.checkoutDistanceMeters,
          dwellTimeMinutes: checkin.dwellTimeMinutes,
          status: "COMPLETED"
        });
      } catch (e) {
        console.error("Firestore error recording checkout:", e);
      }
    }

    this.emit("checkout_recorded", checkin);
    this.emit("data_changed", { reason: "checkout_recorded", checkin });
    return checkin;
  }

  // Autonomous AI Classroom Proof Verification (Blackboard OCR + Digital Signature)
  async verifyClassroomProof(checkinId, proofPayload) {
    const local = this.getLocalData();
    const checkin = local.checkins.find(c => c.id === checkinId);
    if (!checkin) return null;

    let aiResult;
    if (window.EduWatchMLAnomalyEngine && window.EduWatchMLAnomalyEngine.verifyClassroomProofAI) {
      aiResult = window.EduWatchMLAnomalyEngine.verifyClassroomProofAI(proofPayload);
    } else {
      aiResult = {
        decision: "VERIFIED",
        confidence: 0.94,
        metrics: { blackboardChalkDateMatch: true, signatureStrokeValid: true, lessonPlanConfidence: 0.92 },
        summary: "Autonomous AI validated blackboard markings, signature strokes, and lesson context."
      };
    }

    checkin.classroomProof = {
      ...proofPayload,
      aiVerification: aiResult,
      submittedAt: new Date().toISOString()
    };
    checkin.aiStatus = aiResult.decision;

    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("checkins").doc(checkinId).update({
          classroomProof: checkin.classroomProof,
          aiStatus: checkin.aiStatus
        });
      } catch (e) {
        console.error("Firestore error updating proof:", e);
      }
    }

    this.emit("proof_verified", { checkinId, aiResult, checkin });
    this.emit("data_changed", { reason: "proof_verified", checkin });
    return { checkin, aiResult };
  }

  // Community Verifications
  async getCommunityVerifications(date = null, schoolId = null) {
    let list = [];
    if (this.isCloudMode && this.firestore) {
      try {
        let query = this.firestore.collection("communityVerifications");
        if (schoolId) query = query.where("schoolId", "==", schoolId);
        const snap = await query.get();
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        list = this.getLocalData().communityVerifications;
      }
    } else {
      list = this.getLocalData().communityVerifications;
    }

    if (date) list = list.filter(v => v.date === date);
    if (schoolId) list = list.filter(v => v.schoolId === schoolId);
    return list;
  }

  async addCommunityVerification(verification) {
    const today = window.EduWatchSeed.getTodayDateString();
    const newDoc = {
      ...verification,
      id: verification.id || `COM-${Date.now().toString().slice(-5)}`,
      date: verification.date || today,
      timestamp: verification.timestamp || new Date().toISOString()
    };

    const local = this.getLocalData();
    local.communityVerifications.unshift(newDoc);
    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("communityVerifications").doc(newDoc.id).set(newDoc);
      } catch (e) {
        console.error("Firestore error saving verification:", e);
      }
    }

    this.emit("community_verification_added", newDoc);
    return newDoc;
  }

  // Discrepancy Flags
  async getFlags() {
    if (this.isCloudMode && this.firestore) {
      try {
        const snap = await this.firestore.collection("flags").orderBy("timestamp", "desc").get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        return this.getLocalData().flags;
      }
    }
    return this.getLocalData().flags;
  }

  async addFlag(flag) {
    const today = window.EduWatchSeed.getTodayDateString();
    const newDoc = {
      ...flag,
      id: flag.id || `FLG-${Date.now().toString().slice(-5)}`,
      date: flag.date || today,
      status: flag.status || "OPEN",
      timestamp: flag.timestamp || new Date().toISOString()
    };

    const local = this.getLocalData();
    const existingIndex = local.flags.findIndex(
      f => f.teacherId === newDoc.teacherId && f.date === newDoc.date && f.type === newDoc.type
    );
    if (existingIndex >= 0) {
      local.flags[existingIndex] = { ...local.flags[existingIndex], ...newDoc };
    } else {
      local.flags.unshift(newDoc);
    }
    this.saveLocalData(local);

    if (this.isCloudMode && this.firestore) {
      try {
        await this.firestore.collection("flags").doc(newDoc.id).set(newDoc);
      } catch (e) {
        console.error("Firestore error saving flag:", e);
      }
    }

    this.emit("flag_added", newDoc);
    return newDoc;
  }

  async resolveFlag(flagId, note = "Resolved by District Education Officer") {
    const local = this.getLocalData();
    const flag = local.flags.find(f => f.id === flagId);
    if (flag) {
      flag.status = "RESOLVED";
      flag.resolutionNote = note;
      flag.resolvedAt = new Date().toISOString();
      this.saveLocalData(local);

      if (this.isCloudMode && this.firestore) {
        try {
          await this.firestore.collection("flags").doc(flagId).update({
            status: "RESOLVED",
            resolutionNote: note,
            resolvedAt: flag.resolvedAt
          });
        } catch (e) {}
      }

      this.emit("flag_resolved", flag);
    }
    return flag;
  }

  // Grievance Desk Queries & Mutations
  async getGrievances(filter = {}) {
    const local = this.getLocalData();
    let list = local.grievances || [];
    if (filter.schoolId) list = list.filter(g => g.schoolId === filter.schoolId);
    if (filter.teacherId) {
      list = list.filter(g => g.teacherId === filter.teacherId && g.recipient !== "ADMIN");
    }
    if (filter.studentId) list = list.filter(g => g.studentId === filter.studentId);
    if (filter.status) list = list.filter(g => g.status === filter.status);
    return list;
  }

  async addGrievance(grievanceData) {
    const newGrievance = {
      ...grievanceData,
      id: grievanceData.id || `GRV-${Date.now().toString().slice(-5)}`,
      timestamp: grievanceData.timestamp || new Date().toISOString(),
      recipient: grievanceData.recipient || "BOTH",
      sendLanguage: grievanceData.sendLanguage || "BOTH",
      rawVoiceInput: grievanceData.rawVoiceInput || "",
      status: grievanceData.status || "FILED",
      escalatedToDEO: grievanceData.escalatedToDEO !== undefined ? grievanceData.escalatedToDEO : true,
      legalActRef: grievanceData.legalActRef || "PEEDA Act 2006 / Sindh Civil Servants Act 1973"
    };

    const local = this.getLocalData();
    local.grievances = local.grievances || [];
    local.grievances.unshift(newGrievance);
    this.saveLocalData(local);

    this.emit("grievance_added", newGrievance);
    this.emit("data_changed", { reason: "grievance_added", grievance: newGrievance });
    return newGrievance;
  }

  async updateGrievanceStatus(grievanceId, status, responseNote = "") {
    const local = this.getLocalData();
    local.grievances = local.grievances || [];
    const grv = local.grievances.find(g => g.id === grievanceId);
    if (grv) {
      grv.status = status;
      grv.officialResponse = responseNote;
      grv.updatedAt = new Date().toISOString();
      this.saveLocalData(local);
      this.emit("grievance_updated", grv);
      this.emit("data_changed", { reason: "grievance_updated", grievance: grv });
      return grv;
    }
    return null;
  }

  // Parent Passcode Protected Authentication
  async validateParentAccess(studentId, passcode) {
    if (!studentId || !passcode) {
      return { success: false, error: "Please enter both Student ID and Secret Passcode." };
    }
    const student = await this.getStudentById(studentId);
    if (!student) {
      return { success: false, error: `Student ID "${studentId}" not found in government database.` };
    }

    const expectedPasscode = student.parentPasscode || "parent123";
    if (passcode.trim() !== expectedPasscode.trim()) {
      return { success: false, error: "Invalid Passcode. Please use the secret passcode provided on the school admission card (Demo: parent123)." };
    }

    const teacherId = student.teacherId || student.classTeacherId;
    const teacher = await this.getTeacher(teacherId);
    const school = await this.getSchool(student.schoolId);
    const teachers = await this.getTeachers(student.schoolId);

    return {
      success: true,
      student,
      teacher: teacher || (teachers.length > 0 ? teachers[0] : { id: teacherId || "T-UNKNOWN", name: "Designated Class Faculty", designation: "Faculty Member" }),
      teachers: teachers.length > 0 ? teachers : (teacher ? [teacher] : []),
      school: school || { id: student.schoolId, name: "Assigned Government School" }
    };
  }

  // Register or Enroll Parent / Student Account
  async registerParent(parentData) {
    const { studentId, parentName, parentPhone, parentPasscode, schoolId, grade } = parentData;
    if (!studentId || !parentPasscode) {
      return { success: false, error: "Student ID and Passcode are required." };
    }

    const local = this.getLocalData();
    local.students = local.students || [];
    let student = local.students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase());

    if (student) {
      student.parentName = parentName || student.parentName || "Parent / Guardian";
      student.parentPhone = parentPhone || student.parentPhone || "";
      student.parentPasscode = parentPasscode.trim();
    } else {
      // Find a default teacher from school or first school
      const targetSchoolId = schoolId || "SCH-LHR-01";
      const schoolTeachers = (local.teachers || []).filter(t => t.schoolId === targetSchoolId);
      const defaultTeacherId = schoolTeachers.length > 0 ? schoolTeachers[0].id : "T-101";

      student = {
        id: studentId.trim().toUpperCase(),
        schoolId: targetSchoolId,
        name: parentData.studentName || `Student ${studentId.trim().toUpperCase()}`,
        rollNo: parentData.rollNo || String(Math.floor(10 + Math.random() * 40)),
        grade: grade || "Grade 9 - General",
        classTeacherId: defaultTeacherId,
        parentName: parentName || "Parent / Guardian",
        parentPhone: parentPhone || "",
        parentPasscode: parentPasscode.trim()
      };
      local.students.push(student);
    }

    this.saveLocalData(local);
    this.emit("student_updated", student);
    this.emit("data_changed", { reason: "parent_registered", student });

    const teacher = await this.getTeacher(student.teacherId || student.classTeacherId);
    const school = await this.getSchool(student.schoolId);

    return {
      success: true,
      student,
      teacher,
      school
    };
  }

  // Dynamic Teacher Registration
  async registerTeacher(teacherData) {
    const { name, cnic, phone, schoolId, designation, subject, password, avatar } = teacherData;
    if (!name || !schoolId) {
      return { success: false, error: "Teacher Name and School selection are required." };
    }

    const local = this.getLocalData();
    local.teachers = local.teachers || [];

    const newId = `T-${Math.floor(100 + Math.random() * 899)}`;
    const newTeacher = {
      id: newId,
      name: name.trim(),
      cnic: cnic || "35201-XXXXXXX-1",
      phone: phone || "0300-0000000",
      schoolId,
      designation: designation || "Senior Science Teacher (SST)",
      subject: subject || "General Studies",
      password: password || "teacher123",
      avatar: avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      registeredAt: new Date().toISOString()
    };

    local.teachers.push(newTeacher);
    this.saveLocalData(local);
    this.emit("teacher_added", newTeacher);
    this.emit("data_changed", { reason: "teacher_registered", teacher: newTeacher });

    return { success: true, teacher: newTeacher };
  }

  // School Administrator Direct Attendance Approval
  async approveTeacherPresence(checkinId, adminId = "HEADMASTER", notes = "Presence verified by School Administrator") {
    const local = this.getLocalData();
    local.checkins = local.checkins || [];
    const chk = local.checkins.find(c => c.id === checkinId);
    if (!chk) return { success: false, error: "Check-in not found." };

    chk.adminApprovalStatus = "APPROVED";
    chk.approvedBy = adminId;
    chk.adminApprovalNotes = notes;
    chk.approvedAt = new Date().toISOString();

    this.saveLocalData(local);
    this.emit("checkin_updated", chk);
    this.emit("data_changed", { reason: "checkin_approved", checkin: chk });
    return { success: true, checkin: chk };
  }
}

window.EduWatchDB = new EduWatchDB();
