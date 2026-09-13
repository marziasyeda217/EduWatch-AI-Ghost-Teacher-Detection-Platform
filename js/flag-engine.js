// EduWatch Automated Discrepancy & Flagging Engine
// Analyzes check-ins vs community reports & GPS bounds to flag "Ghost Teachers"
// Integrates Machine Learning Anomaly Detection (Random Forest Temporal Clustering)

class FlagEngine {
  constructor() {
    this.initListeners();
  }

  initListeners() {
    // Whenever a new check-in or community report occurs, run evaluation
    window.EduWatchDB.subscribe("checkin_added", async (checkin) => {
      await this.evaluateTeacher(checkin.teacherId, checkin.schoolId);
    });

    window.EduWatchDB.subscribe("checkout_recorded", async (checkin) => {
      await this.evaluateTeacher(checkin.teacherId, checkin.schoolId);
    });

    window.EduWatchDB.subscribe("community_verification_added", async (verification) => {
      await this.evaluateTeacher(verification.teacherId, verification.schoolId);
    });
  }

  // Haversine formula to compute accurate distance in meters between two lat/lng pairs
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // Evaluate single teacher for today
  async evaluateTeacher(teacherId, schoolId, date = window.EduWatchSeed.getTodayDateString()) {
    const school = await window.EduWatchDB.getSchool(schoolId);
    const teacher = await window.EduWatchDB.getTeacher(teacherId);
    if (!school || !teacher) return;

    const checkins = await window.EduWatchDB.getCheckins(date, teacherId);
    const verifications = (await window.EduWatchDB.getCommunityVerifications(date, schoolId))
      .filter(v => v.teacherId === teacherId);

    const latestCheckin = checkins.length > 0 ? checkins[0] : null;

    // 1. Check Strict 10-Meter Geofence Breach
    if (latestCheckin) {
      const sLat = school.lat || school.latitude;
      const sLng = school.lng || school.longitude;
      const distance = latestCheckin.distanceMeters != null ? latestCheckin.distanceMeters : this.calculateDistance(
        latestCheckin.latitude,
        latestCheckin.longitude,
        sLat,
        sLng
      );

      const maxRadius = school.geofenceRadiusMeters || 10;

      if (distance > maxRadius) {
        await window.EduWatchDB.addFlag({
          teacherId,
          schoolId,
          date,
          type: "GEOFENCE_VIOLATION",
          severity: "HIGH",
          reason: `Check-in recorded at ${distance}m from ${school.name} (Strict 10m perimeter violation). Out-of-bounds attendance attempt.`,
          evidence: {
            checkinDistance: `${distance}m`,
            schoolBoundary: `${maxRadius}m`,
            timestamp: latestCheckin.timestamp
          }
        });
      }

      // 2. Check Touch-and-Go Bike Scam (Dwell Time < 30 mins)
      if (latestCheckin.dwellTimeMinutes != null && latestCheckin.dwellTimeMinutes < 30) {
        await window.EduWatchDB.addFlag({
          teacherId,
          schoolId,
          date,
          type: "TOUCH_AND_GO_ABANDONMENT",
          severity: "HIGH",
          reason: `Touch-and-Go Pattern: Dwell time was only ${latestCheckin.dwellTimeMinutes} mins (standard requirement: 240+ mins). Suspected motorbike quick check-in and immediate campus abandonment.`,
          evidence: {
            arrival: latestCheckin.timestamp,
            departure: latestCheckin.checkoutTimestamp,
            dwellMinutes: latestCheckin.dwellTimeMinutes
          }
        });
      }
    }

    // 3. Check Ghost Teacher Discrepancy (Check-in = Present, but Community says Absent)
    if (latestCheckin && verifications.length > 0) {
      const noVotes = verifications.filter(v => v.parentResponse === "no").length;
      const yesVotes = verifications.filter(v => v.parentResponse === "yes").length;
      const unsureVotes = verifications.filter(v => v.parentResponse === "unsure").length;

      if (noVotes >= (window.EduWatchConfig?.settings?.mismatchParentThreshold || 2)) {
        await window.EduWatchDB.addFlag({
          teacherId,
          schoolId,
          date,
          type: "GHOST_TEACHER_SUSPECTED",
          severity: "CRITICAL",
          reason: `Discrepancy detected: Teacher submitted digital check-in, but ${noVotes} parent/committee report(s) confirm teacher was ABSENT from classroom.`,
          evidence: {
            checkinTime: new Date(latestCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            communityVotes: { yes: yesVotes, no: noVotes, unsure: unsureVotes },
            latestNote: verifications.find(v => v.parentResponse === "no")?.notes || "Marked absent by parent inspection."
          }
        });
      }
    }
  }

  // Scan all teachers and schools to refresh flags and apply ML Anomaly Engine
  async runAudit() {
    const schools = await window.EduWatchDB.getSchools();
    const allCheckins = await window.EduWatchDB.getCheckins();
    const allVerifications = await window.EduWatchDB.getCommunityVerifications();
    const allTeachers = await window.EduWatchDB.getTeachers();

    // 1. Rule-based evaluation per teacher
    for (const school of schools) {
      const teachers = await window.EduWatchDB.getTeachers(school.id);
      for (const teacher of teachers) {
        await this.evaluateTeacher(teacher.id, school.id);
      }
    }

    // 2. Machine Learning Anomaly Detector (Saturday-Only Payroll Gaming & Cluster Outliers)
    if (window.EduWatchMLAnomalyEngine && window.EduWatchMLAnomalyEngine.detectAttendanceAnomalies) {
      for (const teacher of allTeachers) {
        const teacherCheckins = allCheckins.filter(c => c.teacherId === teacher.id);
        const schoolVerifs = allVerifications.filter(v => v.teacherId === teacher.id);
        const anomalies = window.EduWatchMLAnomalyEngine.detectAttendanceAnomalies(
          teacher,
          teacherCheckins,
          schoolVerifs
        );

        for (const anom of anomalies) {
          await window.EduWatchDB.addFlag({
            teacherId: teacher.id,
            schoolId: teacher.schoolId,
            date: window.EduWatchSeed.getTodayDateString(),
            type: anom.type,
            severity: anom.severity,
            reason: anom.reason,
            mlConfidence: anom.confidence,
            mlEngine: "RandomForest-TemporalCluster-v2.4",
            evidence: anom.evidence
          });
        }
      }
    }
  }
}

window.EduWatchFlagEngine = new FlagEngine();
