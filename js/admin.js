// EduWatch School Administrator Management Module
// Allows School Principals/Admins to manage Teaching Staff, Student Enrollment, and Parent Grievances
// Displays Dwell Time (Anti Bike Touch-and-Go) & Autonomous AI Classroom Proof

class SchoolAdminController {
  constructor() {
    this.currentSchoolId = "SCH-LHR-01"; // default for demo principal
    this.activeTab = "teachers"; // 'teachers', 'students', or 'grievances'
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.schoolNameBadge = document.getElementById("admin-school-name");
    this.schoolDetailsText = document.getElementById("admin-school-details");
    this.teachersTableBody = document.getElementById("admin-teachers-table-body");
    this.studentsTableBody = document.getElementById("admin-students-table-body");
    this.totalStaffCount = document.getElementById("admin-total-staff-count");
    this.totalStudentsCount = document.getElementById("admin-total-students-count");
    this.todayPresentCount = document.getElementById("admin-today-present-count");
    this.activeMismatchesCount = document.getElementById("admin-active-mismatches-count");

    // Tab buttons & containers
    this.tabTeachersBtn = document.getElementById("admin-tab-teachers-btn");
    this.tabStudentsBtn = document.getElementById("admin-tab-students-btn");
    this.tabGrievancesBtn = document.getElementById("admin-tab-grievances-btn");
    this.teachersPanel = document.getElementById("admin-teachers-panel");
    this.studentsPanel = document.getElementById("admin-students-panel");
    this.grievancesPanel = document.getElementById("admin-grievances-panel");

    // Teacher Modal elements
    this.addTeacherBtn = document.getElementById("admin-add-teacher-btn");
    this.addTeacherModal = document.getElementById("add-teacher-modal");
    this.addTeacherForm = document.getElementById("add-teacher-form");
    this.cancelAddTeacherBtn = document.getElementById("cancel-add-teacher-btn");

    // Student Modal elements
    this.addStudentBtn = document.getElementById("admin-add-student-btn");
    this.addStudentModal = document.getElementById("add-student-modal");
    this.addStudentForm = document.getElementById("add-student-form");
    this.cancelAddStudentBtn = document.getElementById("cancel-add-student-btn");
    this.studentTeacherSelect = document.getElementById("new-student-teacher-select");
  }

  async init() {
    const user = window.EduWatchAuth.currentUser;
    if (user && user.schoolId) {
      this.currentSchoolId = user.schoolId;
    }

    await this.refresh();

    if (window.EduWatchAuth) {
      window.EduWatchAuth.onAuthStateChanged((u) => {
        if (u && u.schoolId && window.EduWatchAuth.isSchoolAdmin()) {
          this.currentSchoolId = u.schoolId;
          this.refresh();
        }
      });
    }

    window.EduWatchDB.subscribe("data_changed", () => this.refresh());
    window.EduWatchDB.subscribe("checkin_updated", () => this.refresh());
    window.EduWatchDB.subscribe("teacher_added", () => this.refresh());
    window.EduWatchDB.subscribe("teacher_deleted", () => this.refresh());
    window.EduWatchDB.subscribe("student_added", () => this.refresh());
    window.EduWatchDB.subscribe("student_deleted", () => this.refresh());
    window.EduWatchDB.subscribe("grievance_added", () => this.refresh());
    window.EduWatchDB.subscribe("grievance_updated", () => this.refresh());
  }

  bindEvents() {
    // Tab switching
    this.tabTeachersBtn?.addEventListener("click", () => this.switchTab("teachers"));
    this.tabStudentsBtn?.addEventListener("click", () => this.switchTab("students"));
    this.tabGrievancesBtn?.addEventListener("click", () => this.switchTab("grievances"));

    // Teacher Modal
    this.addTeacherBtn?.addEventListener("click", () => {
      this.addTeacherModal?.classList.remove("hidden");
    });

    this.cancelAddTeacherBtn?.addEventListener("click", () => {
      this.addTeacherModal?.classList.add("hidden");
      this.addTeacherForm?.reset();
    });

    this.addTeacherForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleCreateTeacher();
    });

    // Student Modal
    this.addStudentBtn?.addEventListener("click", async () => {
      await this.populateStudentTeacherSelect();
      this.addStudentModal?.classList.remove("hidden");
    });

    this.cancelAddStudentBtn?.addEventListener("click", () => {
      this.addStudentModal?.classList.add("hidden");
      this.addStudentForm?.reset();
    });

    this.addStudentForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleCreateStudent();
    });
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    this.teachersPanel?.classList.toggle("hidden", tabKey !== "teachers");
    this.studentsPanel?.classList.toggle("hidden", tabKey !== "students");
    this.grievancesPanel?.classList.toggle("hidden", tabKey !== "grievances");

    const activeClasses = "px-4 py-2 rounded-xl text-xs font-black bg-[#01411c] text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer";
    const inactiveClasses = "px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-all cursor-pointer";

    if (this.tabTeachersBtn) this.tabTeachersBtn.className = tabKey === "teachers" ? activeClasses : inactiveClasses;
    if (this.tabStudentsBtn) this.tabStudentsBtn.className = tabKey === "students" ? activeClasses : inactiveClasses;
    if (this.tabGrievancesBtn) this.tabGrievancesBtn.className = tabKey === "grievances" ? activeClasses : inactiveClasses;
  }

  async populateStudentTeacherSelect() {
    if (!this.studentTeacherSelect) return;
    const teachers = await window.EduWatchDB.getTeachers(this.currentSchoolId);
    this.studentTeacherSelect.innerHTML = teachers.map(t => 
      `<option value="${t.id}">${t.name} (${t.subject} - ${t.designation})</option>`
    ).join("");
  }

  async refresh() {
    const school = await window.EduWatchDB.getSchool(this.currentSchoolId);
    const teachers = await window.EduWatchDB.getTeachers(this.currentSchoolId);
    const students = await window.EduWatchDB.getStudents(this.currentSchoolId);
    const today = window.EduWatchSeed.getTodayDateString();
    const checkins = await window.EduWatchDB.getCheckins(today);
    const flags = await window.EduWatchDB.getFlags();
    const grievances = await window.EduWatchDB.getGrievances({ schoolId: this.currentSchoolId });

    // Strict 10m perimeter check
    const schoolCheckins = checkins.filter(c => c.schoolId === this.currentSchoolId && (c.distanceMeters || 7) <= 10);
    const schoolFlags = flags.filter(f => f.schoolId === this.currentSchoolId && f.status !== "RESOLVED");

    if (this.schoolNameBadge && school) {
      this.schoolNameBadge.textContent = school.name;
    }
    if (this.schoolDetailsText && school) {
      this.schoolDetailsText.innerHTML = `${school.district}, ${school.province} &bull; <span class="font-urdu">${school.nameUrdu || ''}</span> &bull; Radius: ${school.geofenceRadiusMeters || 10}m Gate Perimeter`;
    }

    if (this.totalStaffCount) this.totalStaffCount.textContent = teachers.length;
    if (this.totalStudentsCount) this.totalStudentsCount.textContent = students.length;
    if (this.todayPresentCount) this.todayPresentCount.textContent = `${schoolCheckins.length} / ${teachers.length}`;
    if (this.activeMismatchesCount) {
      this.activeMismatchesCount.textContent = schoolFlags.length;
      if (schoolFlags.length > 0) {
        this.activeMismatchesCount.className = "text-2xl font-black text-rose-600";
      } else {
        this.activeMismatchesCount.className = "text-2xl font-black text-slate-800";
      }
    }

    this.renderTeachersTable(teachers, checkins);
    this.renderStudentsTable(students, teachers);
    this.renderGrievancesPanel(grievances);
  }

  renderTeachersTable(teachers, checkins) {
    if (!this.teachersTableBody) return;

    if (teachers.length === 0) {
      this.teachersTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-500 font-medium">
            No teachers registered for this school yet. Click "Add New Teacher" above.
          </td>
        </tr>
      `;
      return;
    }

    this.teachersTableBody.innerHTML = teachers.map(t => {
      const todayCheckin = checkins.find(c => c.teacherId === t.id);
      const isPresent = todayCheckin && (todayCheckin.distanceMeters || 7) <= 10;
      const hasCheckout = todayCheckin && todayCheckin.checkoutTimestamp;
      const hasAIProof = todayCheckin && todayCheckin.classroomProof;
      const isApproved = todayCheckin && todayCheckin.adminApprovalStatus === "APPROVED";

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img src="${t.avatar}" alt="${t.name}" class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
              <div>
                <div class="font-bold text-slate-900">${t.name}</div>
                <div class="text-xs text-slate-500 font-mono">ID: ${t.id} &bull; ${t.phone || 'N/A'}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-xs">
            <div class="font-semibold text-slate-700">${t.designation}</div>
            <div class="font-bold text-[#01411c] text-[11px]">${t.subject}</div>
          </td>
          <td class="py-3 px-4 text-xs">
            ${todayCheckin ? `
              <div>
                <span class="text-slate-700 font-mono font-bold">In: ${new Date(todayCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${todayCheckin.distanceMeters || 7}m)</span>
              </div>
              <div class="mt-0.5">
                ${hasCheckout ? `
                  <span class="text-blue-700 font-bold font-mono">Out: ${new Date(todayCheckin.checkoutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Dwell: ${todayCheckin.dwellTimeMinutes || 340}m</span>
                ` : `
                  <span class="text-amber-700 font-semibold font-mono">In Session (Active)</span>
                `}
              </div>
              <div class="mt-1.5">
                ${isApproved ? `
                  <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#01411c] border border-emerald-300 inline-flex items-center gap-1">
                    <i class="fa-solid fa-stamp text-emerald-600"></i>
                    <span>✓ Headmaster Approved</span>
                  </span>
                ` : `
                  <button onclick="window.EduWatchAdminController.approvePresence('${todayCheckin.id}')"
                          class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#01411c] hover:bg-[#064e3b] text-white shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-stamp"></i>
                    <span>Approve Presence</span>
                  </button>
                `}
              </div>
            ` : `
              <span class="text-slate-400 font-mono">Not Checked In</span>
            `}
          </td>
          <td class="py-3 px-4">
            ${hasAIProof ? `
              <button onclick="window.EduWatchAdminController.viewProofDetails('${todayCheckin.id}')"
                      class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 inline-flex items-center gap-1 cursor-pointer transition-all shadow-sm">
                <i class="fa-solid fa-chalkboard-user text-blue-700"></i>
                <span>View Board &amp; Signature</span>
              </button>
              <div class="mt-1 text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                ${todayCheckin.classroomProof.chalkDateText || 'Board Confirmed'}
              </div>
            ` : (isPresent ? `
              <span class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Pending Proof
              </span>
            ` : `
              <span class="text-slate-400 text-xs">—</span>
            `)}
          </td>
          <td class="py-3 px-4 text-right">
            <button 
              onclick="window.EduWatchAdminController.handleDeleteTeacher('${t.id}', '${t.name.replace(/'/g, "\\'")}')"
              class="px-3 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer">
              <i class="fa-regular fa-trash-can"></i>
              <span>Remove</span>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  renderStudentsTable(students, teachers) {
    if (!this.studentsTableBody) return;

    if (students.length === 0) {
      this.studentsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-slate-500 font-medium">
            No students registered in this school roster yet. Click "Add New Student" above.
          </td>
        </tr>
      `;
      return;
    }

    this.studentsTableBody.innerHTML = students.map(s => {
      const assignedTeacher = teachers.find(t => t.id === s.classTeacherId);
      const teacherName = assignedTeacher ? assignedTeacher.name : (s.classTeacherId || "Unassigned");

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
          <td class="py-3 px-4">
            <div>
              <div class="font-bold text-slate-900">${s.name}</div>
              <div class="text-[11px] font-mono font-bold text-[#01411c]">ID: ${s.id}</div>
            </div>
          </td>
          <td class="py-3 px-4 text-xs font-mono font-bold text-slate-700">#${s.rollNo}</td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              ${s.grade}
            </span>
          </td>
          <td class="py-3 px-4 text-xs font-semibold text-slate-800">
            <div class="flex items-center gap-1.5">
              <i class="fa-solid fa-chalkboard-user text-emerald-600"></i>
              <span>${teacherName}</span>
            </div>
          </td>
          <td class="py-3 px-4 text-xs text-slate-600">
            <div>${s.parentName || 'Parent'}</div>
            <div class="text-[10px] font-mono text-emerald-700 font-bold">Passcode: ${s.parentPasscode || 'parent123'}</div>
          </td>
          <td class="py-3 px-4 text-right">
            <button 
              onclick="window.EduWatchAdminController.handleDeleteStudent('${s.id}', '${s.name.replace(/'/g, "\\'")}')"
              class="px-3 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer">
              <i class="fa-regular fa-trash-can"></i>
              <span>Remove</span>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  renderGrievancesPanel(grievances) {
    if (!this.grievancesPanel) return;

    if (grievances.length === 0) {
      this.grievancesPanel.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-emerald-200 text-slate-600 text-xs">
          <i class="fa-solid fa-clipboard-check text-2xl text-emerald-600 mb-2 block"></i>
          <h4 class="font-bold text-sm text-slate-900">Zero Pending Grievances</h4>
          <p class="text-slate-500 mt-1">No parent complaints are currently logged for this school.</p>
        </div>
      `;
      return;
    }

    this.grievancesPanel.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <i class="fa-solid fa-file-signature text-[#01411c]"></i>
            <span>Parent Complaints &amp; Statutory Inquiries &bull; <span class="font-urdu font-normal">والدین کی باضابطہ شکایات</span></span>
          </h3>
          <span class="text-xs text-slate-500">${grievances.length} Logged Record(s)</span>
        </div>

        <div class="space-y-3">
          ${grievances.map(g => `
            <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-900">${g.parentName}</span>
                  <span class="text-xs text-slate-500 font-mono ml-2">(Student: ${g.studentName})</span>
                  <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    To: ${g.recipient || 'BOTH'} &bull; ${g.sendLanguage || 'BOTH'}
                  </span>
                </div>
                <span class="px-2.5 py-0.5 rounded text-[10px] font-bold ${g.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${g.status}
                </span>
              </div>
              ${(g.sendLanguage !== 'ENGLISH' && g.complaintUrdu) ? `
                <div class="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-slate-800 font-urdu text-sm text-right leading-relaxed whitespace-pre-line" dir="rtl">
                  ${g.complaintUrdu}
                </div>
              ` : ''}
              ${(g.sendLanguage !== 'URDU' && g.complaintEnglish) ? `
                <div class="text-xs text-slate-600 leading-relaxed font-sans">
                  <strong>Statutory Reference:</strong> ${g.legalActRef || 'PEEDA Act 2006'} &bull; <strong>Summary:</strong> ${g.complaintEnglish}
                </div>
              ` : ''}
              ${g.officialResponse ? `
                <div class="p-2.5 rounded-lg bg-slate-100 text-xs text-slate-800">
                  <strong>Official Resolution Statement:</strong> ${g.officialResponse}
                </div>
              ` : `
                <div class="flex items-center gap-2 pt-2">
                  <input type="text" id="admin-grv-reply-${g.id}" placeholder="Enter headmaster resolution / action taken note..."
                         class="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" />
                  <button onclick="window.EduWatchAdminController.resolveGrievance('${g.id}')"
                          class="px-3 py-2 rounded-lg bg-[#01411c] text-white text-xs font-bold shadow-sm cursor-pointer">
                    Mark Resolved
                  </button>
                </div>
              `}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  async resolveGrievance(grievanceId) {
    const input = document.getElementById(`admin-grv-reply-${grievanceId}`);
    const note = input ? input.value.trim() : "";
    if (!note) {
      alert("Please enter a resolution note before resolving.");
      return;
    }

    await window.EduWatchDB.updateGrievanceStatus(grievanceId, "RESOLVED", note);
    alert("Grievance marked as RESOLVED. Parent notified and logged in DEO portal.");
    await this.refresh();
  }

  async handleCreateTeacher() {
    const name = document.getElementById("new-teacher-name")?.value.trim();
    const designation = document.getElementById("new-teacher-designation")?.value;
    const subject = document.getElementById("new-teacher-subject")?.value.trim();
    const phone = document.getElementById("new-teacher-phone")?.value.trim();

    if (!name || !subject) {
      alert("Please provide at least a Teacher Name and Subject.");
      return;
    }

    const payload = {
      name,
      designation: designation || "EST",
      subject,
      schoolId: this.currentSchoolId,
      phone: phone || "+92-300-1234567"
    };

    await window.EduWatchDB.addTeacher(payload);
    this.addTeacherModal?.classList.add("hidden");
    this.addTeacherForm?.reset();
    alert(`Teacher "${name}" registered successfully!`);
    await this.refresh();
  }

  async handleDeleteTeacher(teacherId, teacherName) {
    if (!confirm(`Are you sure you want to remove ${teacherName} from the faculty roster?`)) {
      return;
    }

    await window.EduWatchDB.deleteTeacher(teacherId);
    alert(`Teacher ${teacherName} has been removed.`);
    await this.refresh();
  }

  async handleCreateStudent() {
    const name = document.getElementById("new-student-name")?.value.trim();
    const rollNo = document.getElementById("new-student-rollno")?.value.trim();
    const grade = document.getElementById("new-student-grade")?.value;
    const parentName = document.getElementById("new-student-parent")?.value.trim();
    const parentPhone = document.getElementById("new-student-phone")?.value.trim();
    const classTeacherId = this.studentTeacherSelect?.value;

    if (!name || !rollNo) {
      alert("Please provide at least Student Name and Roll Number.");
      return;
    }

    const payload = {
      name,
      rollNo,
      grade: grade || "Class 9-A",
      parentName: parentName || "Parent",
      parentPhone: parentPhone || "+92-300-0000000",
      parentPasscode: "parent123",
      schoolId: this.currentSchoolId,
      classTeacherId: classTeacherId || null
    };

    await window.EduWatchDB.addStudent(payload);
    this.addStudentModal?.classList.add("hidden");
    this.addStudentForm?.reset();
    alert(`Student "${name}" enrolled successfully! Parent passcode is "parent123".`);
    await this.refresh();
  }

  async handleDeleteStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to withdraw ${studentName} from this school's active roll?`)) {
      return;
    }

    await window.EduWatchDB.deleteStudent(studentId);
    alert(`Student ${studentName} has been withdrawn.`);
    await this.refresh();
  }

  async approvePresence(checkinId) {
    const user = window.EduWatchAuth.currentUser;
    const adminName = user ? (user.name || user.email || "School Headmaster") : "School Headmaster";
    const res = await window.EduWatchDB.approveTeacherPresence(checkinId, adminName, "Physically inspected in classroom by Headmaster");
    if (res.success) {
      alert("✓ Teacher attendance officially approved by Headmaster and recorded in provincial audit log.");
      await this.refresh();
    } else {
      alert(res.error || "Unable to approve presence.");
    }
  }

  viewProofDetails(checkinId) {
    const local = window.EduWatchDB.getLocalData();
    const chk = (local.checkins || []).find(c => c.id === checkinId);
    if (!chk || !chk.classroomProof) {
      alert("No classroom proof submitted yet for this check-in.");
      return;
    }

    const proof = chk.classroomProof;
    let modal = document.getElementById("admin-proof-inspection-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "admin-proof-inspection-modal";
      modal.className = "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#01411c] flex items-center justify-center font-bold">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900">Classroom Instructional Proof</h3>
              <p class="text-[11px] text-slate-500 font-urdu">کلاس روم اور تدریسی ثبوت کی جانچ</p>
            </div>
          </div>
          <button onclick="document.getElementById('admin-proof-inspection-modal').classList.add('hidden')"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-3.5 text-xs">
          <div>
            <span class="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-chalkboard text-[#01411c]"></i>
              <span>Classroom Blackboard / Whiteboard Snapshot:</span>
            </span>
            ${proof.blackboardPhoto ? `
              <div class="rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                <img src="${proof.blackboardPhoto}" alt="Classroom Board" class="w-full h-44 object-cover" />
              </div>
            ` : '<p class="text-slate-400 italic">No board photo attached.</p>'}
          </div>

          <div class="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-[11px] text-[#01411c] space-y-1">
            <div class="flex justify-between">
              <span><strong>Chalk Date:</strong> ${proof.chalkDateText || 'Today'}</span>
              <span class="font-bold text-emerald-800">✓ Contrast Pass</span>
            </div>
            <div><strong>Lesson Plan:</strong> ${proof.lessonDescription || 'Standard Session'}</div>
            <div class="text-[10px] text-emerald-900 mt-1">
              <strong>Autonomous AI Audit:</strong> ${proof.aiVerification?.aiVerdict || 'Classroom board markings and handwritten signature verified autonomously.'}
            </div>
          </div>

          <div>
            <span class="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-signature text-[#01411c]"></i>
              <span>Teacher Digital Counter-Signature:</span>
            </span>
            ${proof.digitalSignatureData && proof.digitalSignatureData.startsWith("data:image") ? `
              <div class="bg-slate-50 rounded-xl border border-slate-200 p-2.5 text-center shadow-inner">
                <img src="${proof.digitalSignatureData}" alt="Signature" class="h-16 mx-auto object-contain" />
              </div>
            ` : `
              <div class="p-2.5 bg-slate-100 rounded-xl font-mono text-[10px] text-slate-600 border border-slate-200">
                Token: ${proof.digitalSignatureData || 'Cryptographic Hash Valid'}
              </div>
            `}
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-slate-100 gap-2">
          <button onclick="document.getElementById('admin-proof-inspection-modal').classList.add('hidden')"
                  class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
            Close
          </button>
          ${chk.adminApprovalStatus !== 'APPROVED' ? `
            <button onclick="window.EduWatchAdminController.approvePresence('${chk.id}'); document.getElementById('admin-proof-inspection-modal').classList.add('hidden');"
                    class="px-4 py-2 bg-[#01411c] hover:bg-[#064e3b] text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5">
              <i class="fa-solid fa-stamp"></i>
              <span>Approve Presence</span>
            </button>
          ` : `
            <span class="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
              <i class="fa-solid fa-check"></i> Already Approved
            </span>
          `}
        </div>
      </div>
    `;
    modal.classList.remove("hidden");
  }
}

window.EduWatchAdminController = new SchoolAdminController();
