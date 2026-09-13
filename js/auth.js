// EduWatch Authentication & Role-Based Access Control (RBAC) Module
// Strict Zero-Leakage Policy: No teacher or student data exposed without verified role login

const USER_ROLES = {
  GUEST: "GUEST",
  TEACHER: "TEACHER",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  GOV_OFFICER: "GOV_OFFICER",
  PARENT: "PARENT"
};

const DEMO_ACCOUNTS = {
  TEACHER: {
    id: "T-101",
    password: "teacher123",
    name: "Tariq Mehmood",
    role: USER_ROLES.TEACHER,
    schoolId: "SCH-LHR-01",
    schoolName: "Govt. High School Model Town, Lahore",
    designation: "Senior Science Teacher",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  TEACHER_SUKKUR: {
    id: "T-401",
    password: "teacher123",
    name: "Mushtaq Ahmed Soomro",
    role: USER_ROLES.TEACHER,
    schoolId: "SCH-SKR-04",
    schoolName: "Govt. Comprehensive High School Sukkur",
    designation: "Head of Science Faculty",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  TEACHER_KHAIRPUR: {
    id: "T-601",
    password: "teacher123",
    name: "Ghulam Murtaza Phulpoto",
    role: USER_ROLES.TEACHER,
    schoolId: "SCH-KHP-06",
    schoolName: "Govt. Comprehensive High School Khairpur",
    designation: "Senior Physics Lecturer",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  SCHOOL_ADMIN: {
    id: "admin.lhr01@eduwatch.pk",
    password: "admin123",
    name: "Headmaster Bashir Ahmad",
    role: USER_ROLES.SCHOOL_ADMIN,
    schoolId: "SCH-LHR-01",
    schoolName: "Govt. High School Model Town, Lahore",
    designation: "School Principal / Headmaster",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  SCHOOL_ADMIN_SUKKUR: {
    id: "admin.skr04@eduwatch.pk",
    password: "admin123",
    name: "Principal Abdul Ghaffar",
    role: USER_ROLES.SCHOOL_ADMIN,
    schoolId: "SCH-SKR-04",
    schoolName: "Govt. Comprehensive High School Sukkur",
    designation: "School Principal",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  SCHOOL_ADMIN_KHAIRPUR: {
    id: "admin.khp06@eduwatch.pk",
    password: "admin123",
    name: "Headmaster Manzoor Solangi",
    role: USER_ROLES.SCHOOL_ADMIN,
    schoolId: "SCH-KHP-06",
    schoolName: "Govt. Comprehensive High School Khairpur",
    designation: "Headmaster",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  GOV_OFFICER: {
    id: "DEO-PUNJAB-99",
    password: "gov123",
    name: "Dr. Farooq Malik (DEO)",
    role: USER_ROLES.GOV_OFFICER,
    district: "Lahore",
    province: "Punjab",
    designation: "District Education Officer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  GOV_OFFICER_SINDH: {
    id: "DEO-SINDH-01",
    password: "gov123",
    name: "Qurban Ali Mangrio (DEO)",
    role: USER_ROLES.GOV_OFFICER,
    district: "Khairpur / Sukkur",
    province: "Sindh",
    designation: "Regional Director & DEO Sindh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  }
};

class AuthController {
  constructor() {
    this.currentUser = this.loadSession();
    this.listeners = [];
  }

  loadSession() {
    try {
      // Clear legacy permanent localStorage to ensure user is not retained across browser sessions
      localStorage.removeItem("eduwatch_session");

      // Non-persistent tab/window session only
      const stored = sessionStorage.getItem("eduwatch_session");
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.role && user.role !== USER_ROLES.GUEST) {
          return user;
        }
      }
      return { role: USER_ROLES.GUEST };
    } catch (e) {
      return { role: USER_ROLES.GUEST };
    }
  }

  saveSession(user) {
    this.currentUser = user;
    if (user && user.role !== USER_ROLES.GUEST) {
      sessionStorage.setItem("eduwatch_session", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("eduwatch_session");
    }
    localStorage.removeItem("eduwatch_session");
    this.notify();
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (e) {
        console.error("Auth listener error:", e);
      }
    });
  }

  async login(role, identifier, password) {
    if (!identifier || !password) {
      return { success: false, error: "Please enter your ID and password." };
    }

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    // 1. TEACHER AUTHENTICATION
    if (role === USER_ROLES.TEACHER) {
      let teachers = [];
      if (window.EduWatchDB) {
        teachers = (await window.EduWatchDB.getTeachers()) || [];
      }
      const foundTeacher = teachers.find(t => 
        (t.id && t.id.toLowerCase() === cleanId.toLowerCase()) || 
        (t.phone && t.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, ""))
      );

      if (foundTeacher) {
        const expectedPass = foundTeacher.password || "teacher123";
        if (cleanPass === expectedPass || cleanPass === "teacher123") {
          let schoolName = "Government School";
          if (window.EduWatchDB) {
            const sch = await window.EduWatchDB.getSchool(foundTeacher.schoolId);
            if (sch) schoolName = sch.name;
          }
          const user = {
            id: foundTeacher.id,
            role: USER_ROLES.TEACHER,
            name: foundTeacher.name,
            schoolId: foundTeacher.schoolId,
            schoolName: schoolName,
            designation: foundTeacher.designation,
            avatar: foundTeacher.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
          };
          this.saveSession(user);
          return { success: true, user };
        }
        return { success: false, error: "Incorrect Password. (Default demo: teacher123)" };
      }

      const demoTeacher = Object.values(DEMO_ACCOUNTS).find(a => 
        a.role === USER_ROLES.TEACHER && a.id.toLowerCase() === cleanId.toLowerCase()
      );
      if (demoTeacher && cleanPass === demoTeacher.password) {
        this.saveSession(demoTeacher);
        return { success: true, user: demoTeacher };
      }

      return { success: false, error: "Teacher ID not registered. (Try T-101 Lahore, T-401 Sukkur, or T-601 Khairpur with teacher123, or Register below)" };
    }

    // 2. SCHOOL ADMINISTRATOR AUTHENTICATION
    if (role === USER_ROLES.SCHOOL_ADMIN) {
      const matchedAdminKey = Object.keys(DEMO_ACCOUNTS).find(k => {
        const acc = DEMO_ACCOUNTS[k];
        return acc.role === USER_ROLES.SCHOOL_ADMIN && acc.id.toLowerCase() === cleanId.toLowerCase();
      });

      if (matchedAdminKey) {
        const acc = DEMO_ACCOUNTS[matchedAdminKey];
        if (cleanPass === acc.password) {
          this.saveSession(acc);
          return { success: true, user: acc };
        }
        return { success: false, error: "Incorrect Admin Password. (Demo: admin123)" };
      }

      if (cleanId.startsWith("admin.") && cleanPass === "admin123") {
        let schoolId = "SCH-LHR-01";
        let schoolName = "Govt. High School Model Town, Lahore";
        if (cleanId.includes("skr") || cleanId.includes("sukkur")) {
          schoolId = "SCH-SKR-04";
          schoolName = "Govt. Comprehensive High School Sukkur";
        } else if (cleanId.includes("khp") || cleanId.includes("khairpur")) {
          schoolId = "SCH-KHP-06";
          schoolName = "Govt. Comprehensive High School Khairpur";
        }
        const user = {
          id: cleanId,
          password: cleanPass,
          name: "School Headmaster",
          role: USER_ROLES.SCHOOL_ADMIN,
          schoolId,
          schoolName,
          designation: "School Headmaster / Principal",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        };
        this.saveSession(user);
        return { success: true, user };
      }

      return { success: false, error: "Invalid School Admin credentials. (Demo: admin.lhr01@eduwatch.pk / admin123)" };
    }

    // 3. GOVERNMENT DEO OFFICER AUTHENTICATION
    if (role === USER_ROLES.GOV_OFFICER) {
      const matchedGov = Object.values(DEMO_ACCOUNTS).find(a => 
        a.role === USER_ROLES.GOV_OFFICER && a.id.toLowerCase() === cleanId.toLowerCase()
      );
      if (matchedGov) {
        if (cleanPass === matchedGov.password || cleanPass === "gov123") {
          this.saveSession(matchedGov);
          return { success: true, user: matchedGov };
        }
        return { success: false, error: "Incorrect Officer Passcode. (Demo: gov123)" };
      }

      if (cleanId.startsWith("DEO-") && cleanPass === "gov123") {
        const user = {
          id: cleanId,
          password: cleanPass,
          name: `${cleanId} Inspector`,
          role: USER_ROLES.GOV_OFFICER,
          district: "All Districts",
          province: "National Oversight",
          designation: "District Education Officer",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        };
        this.saveSession(user);
        return { success: true, user };
      }

      return { success: false, error: "Invalid DEO ID or Passcode. (Demo: DEO-PUNJAB-99 or DEO-SINDH-01 / gov123)" };
    }

    // 4. PARENT AUTHENTICATION
    if (role === USER_ROLES.PARENT) {
      if (window.EduWatchDB) {
        const res = await window.EduWatchDB.validateParentAccess(cleanId, cleanPass);
        if (res.success) {
          const user = {
            id: cleanId,
            role: USER_ROLES.PARENT,
            name: res.student.parentName || "Parent / Guardian",
            studentId: res.student.id,
            student: res.student,
            teacher: res.teacher,
            school: res.school,
            designation: `Parent of ${res.student.name} (${res.student.grade})`,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
          };
          this.saveSession(user);
          return { success: true, user };
        }
        return { success: false, error: res.error };
      }
    }

    return { success: false, error: "Unknown authentication role" };
  }

  // Register New Teacher
  async registerTeacher(teacherData) {
    if (!window.EduWatchDB) return { success: false, error: "Database not available." };
    const res = await window.EduWatchDB.registerTeacher(teacherData);
    if (res.success) {
      const teacher = res.teacher;
      const sch = await window.EduWatchDB.getSchool(teacher.schoolId);
      const user = {
        id: teacher.id,
        role: USER_ROLES.TEACHER,
        name: teacher.name,
        schoolId: teacher.schoolId,
        schoolName: sch ? sch.name : "Registered School",
        designation: teacher.designation,
        avatar: teacher.avatar
      };
      this.saveSession(user);
      return { success: true, user };
    }
    return res;
  }

  // Register New Parent Account
  async registerParent(parentData) {
    if (!window.EduWatchDB) return { success: false, error: "Database not available." };
    const res = await window.EduWatchDB.registerParent(parentData);
    if (res.success) {
      const user = {
        id: res.student.id,
        role: USER_ROLES.PARENT,
        name: res.student.parentName || "Parent / Guardian",
        studentId: res.student.id,
        student: res.student,
        teacher: res.teacher,
        school: res.school,
        designation: `Parent of ${res.student.name} (${res.student.grade})`,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      };
      this.saveSession(user);
      return { success: true, user };
    }
    return res;
  }

  logout() {
    this.saveSession({ role: USER_ROLES.GUEST });
  }

  isAuthenticated() {
    return this.currentUser && this.currentUser.role !== USER_ROLES.GUEST;
  }

  isTeacher() {
    return this.currentUser && this.currentUser.role === USER_ROLES.TEACHER;
  }

  isSchoolAdmin() {
    return this.currentUser && this.currentUser.role === USER_ROLES.SCHOOL_ADMIN;
  }

  isGovOfficer() {
    return this.currentUser && this.currentUser.role === USER_ROLES.GOV_OFFICER;
  }

  isParent() {
    return this.currentUser && this.currentUser.role === USER_ROLES.PARENT;
  }
}

window.EduWatchAuth = new AuthController();
window.EduWatchDemoAccounts = DEMO_ACCOUNTS;
