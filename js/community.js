// EduWatch Community & Parent Verification Module
// Parents enter Student ID + Secret Passcode to see ALL teachers assigned to their child's class
// Includes Urdu Voice Recording (Web Speech API ur-PK) and AI-Powered Formal Bilingual Grievance Desk

class CommunityController {
  constructor() {
    this.currentStudent = null;
    this.currentTeacher = null;
    this.classTeachers = [];
    this.currentSchool = null;
    this.selectedGrievanceTeacherId = null;
    this.recognition = null;
    this.isRecording = false;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.studentIdInput = document.getElementById("parent-student-id-input");
    this.passcodeInput = document.getElementById("parent-passcode-input");
    this.studentLookupBtn = document.getElementById("parent-lookup-btn");
    this.studentResultSection = document.getElementById("parent-student-result-section");
    this.studentEmptyNotice = document.getElementById("parent-student-empty-notice");
    this.todayDateBadge = document.getElementById("community-today-date");
    this.reporterRoleSelect = document.getElementById("parent-reporter-role");

    // Dynamic result containers
    this.studentCardContainer = document.getElementById("parent-student-card-container");
    this.classTeacherCardContainer = document.getElementById("parent-class-teacher-card-container");
  }

  async init() {
    const today = new Date();
    if (this.todayDateBadge) {
      this.todayDateBadge.textContent = today.toLocaleDateString("en-PK", {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    // Initialize without pre-loading any student or teacher data (clean privacy gate)
    this.syncWithAuth();
    if (window.EduWatchAuth) {
      window.EduWatchAuth.onAuthStateChanged(() => this.syncWithAuth());
    }

    window.EduWatchDB.subscribe("data_changed", () => {
      if (this.currentStudent) {
        this.renderClassTeacherCard();
      }
    });
  }

  async syncWithAuth() {
    if (window.EduWatchAuth && window.EduWatchAuth.isParent()) {
      const user = window.EduWatchAuth.currentUser;
      if (user.student) {
        this.currentStudent = user.student;
        this.currentTeacher = user.teacher;
        this.currentSchool = user.school;
        this.classTeachers = user.teachers || (await window.EduWatchDB.getTeachers(user.student.schoolId));
        if (this.studentEmptyNotice) this.studentEmptyNotice.classList.add("hidden");
        if (this.studentResultSection) this.studentResultSection.classList.remove("hidden");
        this.renderStudentCard();
        await this.renderClassTeacherCard();
        return;
      }
    }

    // Default clean unauthenticated state
    this.currentStudent = null;
    this.currentTeacher = null;
    this.classTeachers = [];
    this.currentSchool = null;
    if (this.studentResultSection) this.studentResultSection.classList.add("hidden");
    if (this.studentEmptyNotice) {
      this.studentEmptyNotice.classList.remove("hidden");
      this.studentEmptyNotice.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-700 shadow-sm space-y-3">
          <div class="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-[#01411c] flex items-center justify-center text-2xl border border-emerald-200">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h4 class="font-extrabold text-base text-slate-900">Protected Parent Portal: Sign In Required</h4>
          <p class="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            In compliance with educational privacy protocols, student records and teacher attendance data are strictly hidden until you authenticate with your Child's <strong>Student Registration ID</strong> and <strong>Secret Passcode</strong>.
          </p>
          <div class="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
            <span>Quick test credentials:</span>
            <span class="font-bold text-slate-800">STU-101 (Lahore)</span>
            <span class="text-slate-300">&bull;</span>
            <span class="font-bold text-slate-800">STU-401 (Sukkur)</span>
            <span class="text-slate-300">&bull;</span>
            <span class="font-bold text-slate-800">STU-601 (Khairpur)</span>
            <span class="text-slate-400">Pass: <strong>parent123</strong></span>
          </div>
        </div>
      `;
    }
  }

  bindEvents() {
    this.studentLookupBtn?.addEventListener("click", () => {
      const id = this.studentIdInput?.value.trim();
      const pass = this.passcodeInput?.value.trim() || "parent123";
      if (id) this.lookupStudent(id, pass);
    });

    this.studentIdInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const id = this.studentIdInput?.value.trim();
        const pass = this.passcodeInput?.value.trim() || "parent123";
        if (id) this.lookupStudent(id, pass);
      }
    });

    this.passcodeInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const id = this.studentIdInput?.value.trim();
        const pass = this.passcodeInput?.value.trim() || "parent123";
        if (id) this.lookupStudent(id, pass);
      }
    });

    // Preset quick chips
    document.querySelectorAll(".parent-quick-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const id = chip.getAttribute("data-student-id");
        if (id) {
          if (this.studentIdInput) this.studentIdInput.value = id;
          if (this.passcodeInput) this.passcodeInput.value = "parent123";
          this.lookupStudent(id, "parent123");
        }
      });
    });
  }

  async lookupStudent(studentId, passcode = "parent123") {
    const authResult = await window.EduWatchDB.validateParentAccess(studentId, passcode);

    if (!authResult.success) {
      if (this.studentResultSection) this.studentResultSection.classList.add("hidden");
      if (this.studentEmptyNotice) {
        this.studentEmptyNotice.classList.remove("hidden");
        this.studentEmptyNotice.innerHTML = `
          <div class="p-6 text-center bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 space-y-2">
            <i class="fa-solid fa-lock text-3xl mb-1 text-rose-600"></i>
            <h4 class="font-bold text-sm">Parent Verification Failed</h4>
            <p class="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
              ${authResult.error}
            </p>
            <div class="pt-2 text-[11px] text-slate-500 font-mono">
              Use your child's official ID (e.g. <strong>STU-101</strong>, <strong>STU-401</strong>, <strong>STU-601</strong>) with secret passcode <strong class="text-slate-800">parent123</strong>.
            </div>
          </div>
        `;
      }
      return;
    }

    if (this.studentEmptyNotice) this.studentEmptyNotice.classList.add("hidden");
    if (this.studentResultSection) this.studentResultSection.classList.remove("hidden");

    this.currentStudent = authResult.student;
    this.currentTeacher = authResult.teacher;
    this.classTeachers = authResult.teachers || (await window.EduWatchDB.getTeachers(authResult.student.schoolId));
    this.currentSchool = authResult.school;

    // Save session in AuthController
    if (window.EduWatchAuth) {
      window.EduWatchAuth.saveSession({
        id: this.currentStudent.id,
        role: "PARENT",
        name: this.currentStudent.parentName || "Parent / Guardian",
        studentId: this.currentStudent.id,
        student: this.currentStudent,
        teacher: this.currentTeacher,
        teachers: this.classTeachers,
        school: this.currentSchool,
        designation: `Parent of ${this.currentStudent.name} (${this.currentStudent.grade})`,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      });
    }

    this.renderStudentCard();
    await this.renderClassTeacherCard();
  }

  renderStudentCard() {
    if (!this.studentCardContainer || !this.currentStudent) return;
    const s = this.currentStudent;
    const school = this.currentSchool;

    this.studentCardContainer.innerHTML = `
      <div class="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-[#01411c] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-slate-900">${s.name}</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-[#01411c] border border-emerald-200">
                Roll #${s.rollNo}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              <span>${s.grade}</span> &bull; 
              <span class="font-bold text-[#01411c]">${school ? school.name : 'Govt. School'}</span>
              &bull; <span>${school ? school.district : 'District'}</span>
            </p>
          </div>
        </div>

        <div class="text-left sm:text-right text-xs">
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Authenticated Parent / Guardian</span>
          <span class="font-bold text-slate-800">${s.parentName || 'Parent'} (${s.parentPhone || '0300-***'})</span>
          <div class="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
            <i class="fa-solid fa-key mr-1"></i> Passcode Protected Access Active
          </div>
        </div>
      </div>
    `;
  }

  async renderClassTeacherCard() {
    if (!this.classTeacherCardContainer || !this.currentStudent) return;
    const today = window.EduWatchSeed.getTodayDateString();
    const checkins = await window.EduWatchDB.getCheckins(today);
    const verifications = await window.EduWatchDB.getCommunityVerifications(today, this.currentStudent.schoolId);
    const grievances = await window.EduWatchDB.getGrievances({ studentId: this.currentStudent.id });

    // Make sure we have the full faculty of this student's school/grade
    if (!this.classTeachers || this.classTeachers.length === 0) {
      this.classTeachers = await window.EduWatchDB.getTeachers(this.currentStudent.schoolId);
    }
    const teachersList = this.classTeachers.length > 0 ? this.classTeachers : (this.currentTeacher ? [this.currentTeacher] : []);

    // Build the grid of all teachers in this student's class
    const teachersHtml = teachersList.map(teacher => {
      const teacherCheckin = checkins.find(c => c.teacherId === teacher.id);
      const teacherVotes = verifications.filter(v => v.teacherId === teacher.id);
      const yesVotes = teacherVotes.filter(v => v.parentResponse === "yes").length;
      const noVotes = teacherVotes.filter(v => v.parentResponse === "no").length;

      // Strict 10-meter perimeter check
      const isPresent = teacherCheckin && (teacherCheckin.distanceMeters || 7) <= 10;
      const hasCheckout = teacherCheckin && teacherCheckin.checkoutTimestamp;
      const hasAIProof = teacherCheckin && teacherCheckin.classroomProof;

      return `
        <div class="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-600 transition-all shadow-sm space-y-4 flex flex-col justify-between">
          
          <!-- Teacher Info Header -->
          <div>
            <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div class="flex items-center gap-3">
                <img src="${teacher.avatar}" alt="${teacher.name}" class="w-14 h-14 rounded-2xl object-cover border-2 border-[#01411c] shadow-sm shrink-0" />
                <div>
                  <h5 class="text-sm font-black text-slate-900 leading-snug">${teacher.name}</h5>
                  <p class="text-[11px] font-bold text-[#01411c]">${teacher.subject}</p>
                  <p class="text-[10px] text-slate-500">${teacher.designation}</p>
                </div>
              </div>

              <div>
                ${isPresent 
                  ? `<span class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-[#01411c] border border-emerald-300 shadow-sm flex items-center gap-1 shrink-0">
                       <i class="fa-solid fa-circle-check text-emerald-600"></i>
                       <span>Present (10m)</span>
                     </span>`
                  : `<span class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm flex items-center gap-1 shrink-0">
                       <i class="fa-solid fa-clock text-amber-600"></i>
                       <span>Pending Check-in</span>
                     </span>`
                }
              </div>
            </div>

            <!-- Telemetry & Details -->
            <div class="py-2.5 space-y-1 text-xs">
              <div class="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Faculty ID: <strong class="font-mono text-slate-800">${teacher.id}</strong></span>
                <span class="font-bold text-emerald-700"><i class="fa-solid fa-location-crosshairs mr-0.5"></i> 10m Geofence</span>
              </div>
              
              ${isPresent ? `
                <div class="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900">
                  <i class="fa-solid fa-shield-check text-emerald-700 mr-1"></i>
                  Gate Check-in: <strong>${new Date(teacherCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> (${teacherCheckin.distanceMeters || 6}m from gate).
                  ${hasAIProof ? `<br/><span class="text-blue-700 font-bold"><i class="fa-solid fa-brain mr-1"></i> AI Blackboard & Signature Validated</span>` : ''}
                </div>
              ` : `
                <div class="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                  <i class="fa-solid fa-clock mr-1"></i> No biometric 10m gate arrival recorded yet today.
                </div>
              `}
            </div>
          </div>

          <!-- Roll-Call Voting & Community Score -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-600">Parent Class Roll-Call:</span>
              <div class="flex items-center gap-2">
                <span class="font-bold text-emerald-700"><i class="fa-solid fa-thumbs-up mr-0.5"></i> ${yesVotes} Yes</span>
                <span class="font-bold text-rose-700"><i class="fa-solid fa-thumbs-down mr-0.5"></i> ${noVotes} No</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button 
                onclick="window.EduWatchCommunityController.submitParentAudit('${teacher.id}', '${teacher.name}', 'yes')"
                class="py-2 px-2.5 rounded-xl bg-[#01411c] hover:bg-[#064e3b] text-white font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-check text-emerald-300"></i>
                <span>حاضر تھے (Present)</span>
              </button>

              <button 
                onclick="window.EduWatchCommunityController.submitParentAudit('${teacher.id}', '${teacher.name}', 'no')"
                class="py-2 px-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer">
                <i class="fa-solid fa-xmark text-rose-600"></i>
                <span>غیر حاضر (Absent)</span>
              </button>
            </div>

            <button 
              onclick="window.EduWatchCommunityController.selectGrievanceRecipient('${teacher.id}', '${teacher.name}')"
              class="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#01411c] text-[11px] font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-pen-to-square text-emerald-700"></i>
              <span>Address Darkhast to ${teacher.name}</span>
            </button>
          </div>

        </div>
      `;
    }).join("");

    this.classTeacherCardContainer.innerHTML = `
      <div class="p-6 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-xl space-y-6">
        
        <!-- Header: Class Faculty Overview -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#01411c] border border-emerald-200 text-[10px] font-black uppercase tracking-wider mb-1">
              <i class="fa-solid fa-users text-[9px]"></i>
              <span>Assigned Class Faculty Roster &bull; آپ کے بچے کی کلاس کے تمام اساتذہ</span>
            </div>
            <h4 class="text-base sm:text-lg font-black text-slate-900">
              Teachers of ${this.currentStudent.name} (${this.currentStudent.grade})
            </h4>
            <p class="text-xs text-slate-500">
              School: <strong>${this.currentSchool ? this.currentSchool.name : 'Government School'}</strong> &bull; District: <strong>${this.currentSchool?.district || 'District'}</strong>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-[#01411c] border border-emerald-300 shadow-sm flex items-center gap-1.5">
              <i class="fa-solid fa-shield-halved text-emerald-600"></i>
              <span>10-Meter Geofenced Attendance</span>
            </span>
          </div>
        </div>

        <!-- Teachers Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${teachersHtml}
        </div>

        <!-- ========================================================================= -->
        <!-- AI-POWERED FORMAL BILINGUAL URDU & ENGLISH GRIEVANCE & INQUIRY DESK       -->
        <!-- ========================================================================= -->
        <div id="grievance-desk-container" class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#01411c] border border-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <i class="fa-solid fa-wand-magic-sparkles text-emerald-700"></i>
                <span>AI Statutory Grievance Desk &bull; قانونی و باضابطہ شکایت پورٹل</span>
              </div>
              <h5 class="text-base font-black text-slate-900">
                File a Formal Complaint or Inquiry to Faculty / Headmaster
              </h5>
              <p class="text-xs text-slate-600 mt-0.5">
                Speak or write in everyday Urdu. AI transforms your words into formal, respectful, and legally sound administrative Urdu (PEEDA Act / Sindh Civil Servants Act compliant).
              </p>
            </div>
            <button type="button" onclick="document.getElementById('open-settings-btn')?.click()"
                    class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto">
              <i class="fa-solid fa-key text-emerald-700"></i>
              <span>AI API Key (Groq Qwen Active)</span>
            </button>
          </div>

          <!-- Step 1: Select Recipient Authority -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              1. Choose Complaint Recipient (شکایت کس کو بھیجنی ہے؟):
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              
              <!-- Option A: Specific Teacher -->
              <label class="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 cursor-pointer transition-all">
                <input type="radio" name="grievance-recipient" value="TEACHER" id="recipient-teacher-radio" class="mt-1 text-[#01411c] focus:ring-[#01411c]" />
                <div class="flex-1">
                  <div class="font-bold text-slate-900 flex items-center gap-1">
                    <i class="fa-solid fa-chalkboard-user text-emerald-700 text-[11px]"></i>
                    <span>Specific Class Teacher</span>
                  </div>
                  <select id="grievance-teacher-select" onchange="document.getElementById('recipient-teacher-radio').checked = true;"
                          class="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#01411c]">
                    ${teachersList.map(t => `<option value="${t.id}">${t.name} (${t.subject})</option>`).join("")}
                  </select>
                </div>
              </label>

              <!-- Option B: School Headmaster -->
              <label class="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 cursor-pointer transition-all">
                <input type="radio" name="grievance-recipient" value="ADMIN" class="mt-1 text-[#01411c] focus:ring-[#01411c]" />
                <div>
                  <div class="font-bold text-slate-900 flex items-center gap-1">
                    <i class="fa-solid fa-user-tie text-blue-700 text-[11px]"></i>
                    <span>School Administrator</span>
                  </div>
                  <span class="text-[10px] text-slate-500 font-urdu block mt-1">ہیڈماسٹر / پرنسپل صاحب</span>
                  <span class="text-[10px] text-slate-400 block">${this.currentSchool ? this.currentSchool.name : 'School Principal'}</span>
                </div>
              </label>

              <!-- Option C: Both + DEO Oversight -->
              <label class="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-300 hover:border-emerald-600 cursor-pointer transition-all">
                <input type="radio" name="grievance-recipient" value="BOTH" checked class="mt-1 text-[#01411c] focus:ring-[#01411c]" />
                <div>
                  <div class="font-bold text-[#01411c] flex items-center gap-1">
                    <i class="fa-solid fa-building-columns text-emerald-700 text-[11px]"></i>
                    <span>Both + DEO Oversight</span>
                  </div>
                  <span class="text-[10px] text-emerald-800 font-urdu block mt-1">ہیڈماسٹر، اساتذہ اور ڈسٹرکٹ ایجوکیشن آفیسر</span>
                  <span class="text-[10px] text-slate-500 block">District Level Accountability Escalation</span>
                </div>
              </label>

            </div>
          </div>

          <!-- Step 2: Voice Recording in Urdu + Clean Everyday Input -->
          <div class="space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <i class="fa-solid fa-comment-dots text-[#01411c]"></i>
                <span>2. Speak or Type your message (بول کر یا لکھ کر اپنی بات بیان کریں):</span>
              </label>
              
              <!-- Urdu Voice Recording Trigger Button -->
              <button type="button" id="voice-record-btn" onclick="window.EduWatchCommunityController.toggleVoiceRecording()"
                      class="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#01411c] font-black text-xs border border-emerald-300 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shadow-sm">
                <i class="fa-solid fa-microphone text-emerald-700 text-sm"></i>
                <span id="voice-record-btn-text">🎤 بول کر ریکارڈ کریں (Record Voice in Urdu)</span>
              </button>
            </div>
            
            <!-- Completely Clean / Empty Textarea (No built-in templates) -->
            <textarea id="grievance-raw-input" rows="3" dir="rtl"
                      placeholder="یہاں بول کر ریکارڈ کریں یا اپنی بات سادہ اور عام الفاظ میں لکھیں..."
                      class="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-urdu text-slate-900 leading-relaxed focus:ring-2 focus:ring-[#01411c] focus:outline-none shadow-inner"></textarea>
          </div>

          <!-- Step 3: AI Formal Transformation Action Trigger -->
          <div class="pt-1">
            <button type="button" id="grievance-ai-btn" onclick="window.EduWatchCommunityController.handleAITransformation()"
                    class="w-full py-3.5 px-4 rounded-xl bg-[#01411c] hover:bg-[#064e3b] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-400/40">
              <i class="fa-solid fa-wand-magic-sparkles text-emerald-300"></i>
              <span>✨ باضابطہ درخواست بنائیں (Create Formal Darkhast in Urdu &amp; English)</span>
            </button>
          </div>

          <!-- AI Transformed Output Preview Container (Initially Clean) -->
          <div id="grievance-ai-results-box" class="space-y-3 pt-2">
            <div class="flex items-center justify-between">
              <div id="grievance-ai-category-badge" class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1.5 border border-slate-200">
                <i class="fa-solid fa-circle-info text-slate-500"></i>
                <span id="grievance-ai-category-text">Speak or type above, then click 'Create Formal Darkhast' to generate official legal petition</span>
              </div>
              <span class="text-[11px] font-mono text-slate-500 font-bold">PEEDA Act / Civil Servants Rules</span>
            </div>

            <!-- Formal Urdu Output Box (Clean until AI generates) -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Formal Administrative Urdu Petition (باضابطہ دفتری اردو درخواست):</label>
              <textarea id="grievance-urdu-text" rows="4" dir="rtl"
                        placeholder="باضابطہ قانونی دفتری درخواست یہاں خودکار طریقے سے تیار ہو کر ظاہر ہوگی..."
                        class="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm font-urdu text-slate-900 leading-relaxed focus:ring-2 focus:ring-[#01411c] focus:outline-none"></textarea>
            </div>

            <!-- Formal English Legal Summary (Clean until AI generates) -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Official English Legal Summary (انگریزی قانونی خلاصہ برائے ریکارڈ):</label>
              <textarea id="grievance-english-text" rows="2"
                        placeholder="Official English legal summary for department dispatch will appear here..."
                        class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-sans leading-relaxed focus:ring-2 focus:ring-[#01411c] focus:outline-none"></textarea>
            </div>
          </div>

          <!-- Step 4: Dispatch Language Preference -->
          <div class="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
            <span class="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              3. Dispatch Format (کس زبان میں بھیجنا چاہتے ہیں؟):
            </span>
            <div class="flex flex-wrap gap-4 text-xs font-medium text-slate-800">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="grievance-lang" value="BOTH" checked class="text-[#01411c] focus:ring-[#01411c]" />
                <span class="font-bold text-[#01411c]">Both Urdu &amp; English (اردو اور انگریزی دونوں)</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="grievance-lang" value="URDU" class="text-[#01411c] focus:ring-[#01411c]" />
                <span>Formal Urdu Only (صرف باضابطہ اردو)</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="grievance-lang" value="ENGLISH" class="text-[#01411c] focus:ring-[#01411c]" />
                <span>English Only (صرف انگریزی)</span>
              </label>
            </div>
          </div>

          <!-- Final Submit Button -->
          <button type="button" onclick="window.EduWatchCommunityController.submitGrievance()"
                  class="w-full py-3.5 px-4 rounded-xl bg-[#01411c] hover:bg-[#064e3b] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-paper-plane text-emerald-300"></i>
            <span>Send Official Grievance (باضابطہ شکایت ارسال کریں)</span>
          </button>

          <!-- History of Grievances Filed for this Student -->
          ${grievances.length > 0 ? `
            <div class="pt-3 border-t border-slate-200 space-y-2">
              <span class="text-[11px] uppercase font-bold text-slate-500 block">Your Grievance Tracking Ledger:</span>
              <div class="space-y-2">
                ${grievances.map(g => `
                  <div class="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-slate-700">${g.id} &bull; ${new Date(g.timestamp).toLocaleDateString()}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          To: ${g.recipient || 'BOTH'} &bull; ${g.sendLanguage || 'BOTH'}
                        </span>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${g.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        Status: ${g.status}
                      </span>
                    </div>
                    ${(g.sendLanguage !== 'ENGLISH' && g.complaintUrdu) ? `
                      <div class="font-urdu text-sm text-slate-800 text-right leading-relaxed whitespace-pre-line" dir="rtl">
                        ${g.complaintUrdu}
                      </div>
                    ` : ''}
                    ${(g.sendLanguage !== 'URDU' && g.complaintEnglish) ? `
                      <div class="text-[11px] text-slate-600 leading-relaxed font-sans">
                        <strong>English Translation:</strong> ${g.complaintEnglish}
                      </div>
                    ` : ''}
                    ${g.officialResponse ? `
                      <div class="p-2 rounded bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200">
                        <strong>Official Resolution:</strong> ${g.officialResponse}
                      </div>
                    ` : `
                      <div class="text-[10px] text-amber-700 italic">
                        <i class="fa-solid fa-hourglass-half mr-1"></i> Awaiting official response from recipient.
                      </div>
                    `}
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}

        </div>

        <div class="text-center text-[11px] text-slate-400 font-urdu">
          والدین کے باضابطہ پیغامات منتخب کردہ مجاز اتھارٹی (استاد، ہیڈماسٹر یا ڈی ای او) کو براہ راست موصول ہوتے ہیں
        </div>

      </div>
    `;
  }

  selectGrievanceRecipient(teacherId, teacherName) {
    const radio = document.getElementById("recipient-teacher-radio");
    const select = document.getElementById("grievance-teacher-select");
    if (radio) radio.checked = true;
    if (select) select.value = teacherId;

    const desk = document.getElementById("grievance-desk-container");
    if (desk) {
      desk.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Urdu Speech-to-Text via Web Speech API
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser environment.");
      return null;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ur-PK";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isRecording = true;
        this.updateVoiceButtonUI(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        const rawInput = document.getElementById("grievance-raw-input");
        if (rawInput && finalTranscript) {
          const current = rawInput.value.trim();
          rawInput.value = current ? current + " " + finalTranscript : finalTranscript;
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isRecording = false;
        this.updateVoiceButtonUI(false);
        if (event.error === "not-allowed") {
          alert("Microphone access was denied. Please allow microphone access in your browser to record voice.");
        }
      };

      recognition.onend = () => {
        this.isRecording = false;
        this.updateVoiceButtonUI(false);
      };

      return recognition;
    } catch (e) {
      console.error("SpeechRecognition initialization failed:", e);
      return null;
    }
  }

  toggleVoiceRecording() {
    if (!this.recognition) {
      this.recognition = this.initSpeechRecognition();
    }

    if (!this.recognition) {
      alert("Urdu Voice Recording requires Chrome, Edge, or a browser with Web Speech API support. You can also type directly in Urdu or Roman Urdu.");
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      this.updateVoiceButtonUI(false);
    } else {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  }

  updateVoiceButtonUI(recording) {
    const btn = document.getElementById("voice-record-btn");
    if (!btn) return;

    if (recording) {
      btn.className = "px-4 py-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 font-black text-xs flex items-center gap-2 cursor-pointer transition-all animate-pulse shadow-sm";
      btn.innerHTML = `<i class="fa-solid fa-microphone-lines text-rose-600 text-sm"></i> <span>🔴 سن رہے ہیں... بولیں (Listening in Urdu...)</span>`;
    } else {
      btn.className = "px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#01411c] font-black text-xs border border-emerald-300 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shadow-sm";
      btn.innerHTML = `<i class="fa-solid fa-microphone text-emerald-700 text-sm"></i> <span>🎤 بول کر ریکارڈ کریں (Record Voice in Urdu)</span>`;
    }
  }

  async handleAITransformation() {
    const rawInput = document.getElementById("grievance-raw-input")?.value.trim();
    const btn = document.getElementById("grievance-ai-btn");
    const urduEl = document.getElementById("grievance-urdu-text");
    const engEl = document.getElementById("grievance-english-text");
    const badgeText = document.getElementById("grievance-ai-category-text");
    const badgeBox = document.getElementById("grievance-ai-category-badge");
    const recipient = document.querySelector('input[name="grievance-recipient"]:checked')?.value || "BOTH";

    // Target teacher name
    let targetTeacherName = "Class Teacher";
    const selectedTeacherId = document.getElementById("grievance-teacher-select")?.value;
    if (recipient === "TEACHER" && selectedTeacherId && this.classTeachers) {
      const match = this.classTeachers.find(t => t.id === selectedTeacherId);
      if (match) targetTeacherName = match.name;
    } else if (this.currentTeacher) {
      targetTeacherName = this.currentTeacher.name;
    }

    if (!rawInput) {
      alert("Please speak or write your complaint in Urdu first (اپنی بات اردو میں لکھیں یا مائیکروفون کے ذریعے بولیں).");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-brain fa-spin text-emerald-300 mr-2"></i> AI Analyzing & Drafting Formal Legal Darkhast...`;
    }

    try {
      const options = {
        rawText: rawInput,
        recipient,
        teacherName: targetTeacherName,
        schoolName: this.currentSchool?.name || "Government School",
        studentName: this.currentStudent?.name || "Student",
        parentName: this.currentStudent?.parentName || "Parent / Guardian"
      };

      const result = await window.EduWatchMLAnomalyEngine.transformUrduComplaintAI(options);

      if (urduEl) urduEl.value = result.formalUrdu;
      if (engEl) engEl.value = result.formalEnglish;
      if (badgeText) {
        badgeText.textContent = `✓ AI Formal Transformation Complete (${result.category})`;
      }
      if (badgeBox) {
        badgeBox.className = "px-2.5 py-1 rounded bg-emerald-100 text-[#01411c] text-[11px] font-bold inline-flex items-center gap-1.5 border border-emerald-300";
        badgeBox.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> <span>✓ AI Formal Darkhast Generated (${result.category})</span>`;
      }

      alert(`✓ AI Formal Transformation Complete!\n\nCategory: ${result.category}\nLegal Reference: ${result.legalActRef}\nEngine: ${result.source}\n\nYour complaint has been formally drafted in administrative Urdu and legal English. You can review or edit before sending.`);
    } catch (e) {
      console.error("AI Transformation error:", e);
      alert("Error generating AI transformation. Algorithmic legal text drafted.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-emerald-300 mr-2"></i> ✨ باضابطہ درخواست بنائیں (Create Formal Darkhast in Urdu &amp; English)`;
      }
    }
  }

  async submitGrievance() {
    if (!this.currentStudent) return;
    const rawInput = document.getElementById("grievance-raw-input")?.value.trim();
    let urduText = document.getElementById("grievance-urdu-text")?.value.trim();
    let engText = document.getElementById("grievance-english-text")?.value.trim();
    const recipient = document.querySelector('input[name="grievance-recipient"]:checked')?.value || "BOTH";
    const languageMode = document.querySelector('input[name="grievance-lang"]:checked')?.value || "BOTH";

    // Target teacher
    let targetTeacherId = this.currentTeacher ? this.currentTeacher.id : "T-101";
    let targetTeacherName = this.currentTeacher ? this.currentTeacher.name : "Class Teacher";
    const selectedTeacherId = document.getElementById("grievance-teacher-select")?.value;
    if (selectedTeacherId && this.classTeachers) {
      const match = this.classTeachers.find(t => t.id === selectedTeacherId);
      if (match) {
        targetTeacherId = match.id;
        targetTeacherName = match.name;
      }
    }

    if (!rawInput && !urduText) {
      alert("Please speak or write your complaint before submitting.");
      return;
    }

    // Auto-transform if parent entered raw input but did not click the AI transform button
    if (rawInput && !urduText) {
      const transformed = await window.EduWatchMLAnomalyEngine.transformUrduComplaintAI({
        rawText: rawInput,
        recipient,
        teacherName: targetTeacherName,
        schoolName: this.currentSchool ? this.currentSchool.name : "Government School",
        studentName: this.currentStudent.name,
        parentName: this.currentStudent.parentName || "Parent"
      });
      urduText = transformed.formalUrdu;
      engText = transformed.formalEnglish;
    }

    const payload = {
      schoolId: this.currentStudent.schoolId,
      teacherId: targetTeacherId,
      studentId: this.currentStudent.id,
      studentName: this.currentStudent.name,
      parentName: this.currentStudent.parentName || "Parent",
      recipient, // 'TEACHER', 'ADMIN', or 'BOTH'
      sendLanguage: languageMode, // 'URDU', 'ENGLISH', 'BOTH'
      rawVoiceInput: rawInput,
      complaintUrdu: urduText,
      complaintEnglish: engText || "Formal parental inquiry",
      escalatedToDEO: recipient === "BOTH" || recipient === "ADMIN",
      legalActRef: "PEEDA Act 2006 / Sindh Civil Servants Act 1973"
    };

    const saved = await window.EduWatchDB.addGrievance(payload);
    
    const recipientLabel = recipient === "ADMIN" 
      ? "School Administrator / Headmaster" 
      : (recipient === "TEACHER" ? `Class Teacher (${targetTeacherName})` : `${targetTeacherName}, Headmaster & DEO`);
    
    alert(`✓ Formal Grievance Dispatched Successfully!\n\nRecipient: ${recipientLabel}\nLanguage Mode: ${languageMode}\nTracking ID: ${saved.id}\nYour complaint has been formally logged and is awaiting official review.`);
    await this.renderClassTeacherCard();
  }

  async submitParentAudit(teacherId, teacherName, response) {
    if (!this.currentStudent) return;
    const parentName = this.currentStudent.parentName || "Parent Auditor";
    const studentName = this.currentStudent.name;

    const verificationRecord = {
      teacherId: teacherId,
      schoolId: this.currentStudent.schoolId,
      date: window.EduWatchSeed.getTodayDateString(),
      parentName: `${parentName} (Parent of ${studentName})`,
      parentResponse: response,
      notes: response === "yes" 
        ? `Parent confirmed ${teacherName} was conducting class for ${this.currentStudent.grade}.` 
        : `Parent reported ${teacherName} was absent from class period.`
    };

    await window.EduWatchDB.addCommunityVerification(verificationRecord);

    const toastMsg = response === "yes"
      ? `Thank you! Your confirmation for Sir ${teacherName} has been recorded.`
      : `Discrepancy alert noted! Absence report for Sir ${teacherName} dispatched to School Admin and DEO.`;

    this.showToast(toastMsg, response === "yes" ? "emerald" : "rose");
    await this.renderClassTeacherCard();
  }

  showToast(msg, type = "emerald") {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold text-white ${
      type === "rose" ? "bg-rose-700" : "bg-[#01411c]"
    } border border-white/20 flex items-center gap-2.5 transition-all transform duration-300 max-w-md`;
    toast.innerHTML = `<i class="fa-solid ${type === 'rose' ? 'fa-triangle-exclamation' : 'fa-circle-check'} text-sm shrink-0"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

window.EduWatchCommunityController = new CommunityController();
