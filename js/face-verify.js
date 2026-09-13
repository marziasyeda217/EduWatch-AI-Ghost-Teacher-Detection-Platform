// EduWatch Face Verification Engine — Biometric Identity Layer
// Real face recognition: face-api.js 128-dim descriptors, euclidean match, blink liveness (eye aspect ratio).
// Enrollment reference is stored per-teacher in localStorage; a check-in face that does not match is blocked.

class EduWatchFaceVerifyService {
  constructor() {
    this.modelsReady = null;
    this.weightsUrl = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
    this.matchThreshold = 0.55; // same-person cutoff (face-api convention is 0.6; stricter here to resist proxies)
    this.blinkOpenEar = 0.31;
    this.blinkClosedEar = 0.26;
    this.storageKey = "eduwatch_face_enrollment";
    this._queue = Promise.resolve(); // serializes GPU inference — concurrent calls can deadlock WebGL
  }

  _enqueue(job) {
    const next = this._queue.then(job, job);
    this._queue = next.then(() => {}, () => {});
    return next;
  }

  _withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(label + " timed out")), ms))
    ]);
  }

  isLibraryLoaded() {
    return typeof window.faceapi !== "undefined";
  }

  async loadModels() {
    if (!this.isLibraryLoaded()) throw new Error("face-api.js library not loaded from CDN");
    if (!this.modelsReady) {
      const f = window.faceapi;
      this.modelsReady = (async () => {
        await f.nets.tinyFaceDetector.loadFromUri(this.weightsUrl);
        await f.nets.faceLandmark68Net.loadFromUri(this.weightsUrl);
        await f.nets.faceRecognitionNet.loadFromUri(this.weightsUrl);
      })();
    }
    return this.modelsReady;
  }

  async detectFace(input) {
    await this.loadModels();
    const f = window.faceapi;
    return await this._enqueue(() =>
      this._withTimeout(
        f
          .detectSingleFace(input, new f.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptor(),
        20000,
        "Face detection"
      )
    );
  }

  async detectLandmarks(input) {
    await this.loadModels();
    const f = window.faceapi;
    return await this._enqueue(() =>
      this._withTimeout(
        f
          .detectSingleFace(input, new f.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
          .withFaceLandmarks(),
        8000,
        "Landmark detection"
      )
    );
  }

  eyeAspectRatio(landmarks) {
    const pts = landmarks.positions;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const oneEye = (p) =>
      (dist(pts[p[1]], pts[p[5]]) + dist(pts[p[2]], pts[p[4]])) / (2 * dist(pts[p[0]], pts[p[3]]));
    return (oneEye([36, 37, 38, 39, 40, 41]) + oneEye([42, 43, 44, 45, 46, 47])) / 2;
  }

  // Live blink liveness: requires eyes-open baseline, a closed frame, then recovery.
  // A printed photo or phone screen cannot blink.
  async watchForBlink(video, opts = {}) {
    const timeoutMs = opts.timeoutMs || 10000;
    const onProgress = opts.onProgress || (() => {});
    const start = Date.now();
    let sawOpen = false;
    let sawClosed = false;

    while (Date.now() - start < timeoutMs) {
      const det = await this.detectLandmarks(video).catch(() => null);
      if (!det) {
        onProgress({ face: false, elapsed: Date.now() - start, timeoutMs });
      } else {
        const ear = this.eyeAspectRatio(det.landmarks);
        if (ear > this.blinkOpenEar) {
          if (sawClosed) return { blinked: true, ear };
          sawOpen = true;
        } else if (ear < this.blinkClosedEar && sawOpen) {
          sawClosed = true;
        }
        onProgress({ face: true, ear, elapsed: Date.now() - start, timeoutMs, sawClosed });
      }
      await new Promise((r) => setTimeout(r, 120));
    }
    return { blinked: false, reason: sawOpen ? "no-blink" : "no-face" };
  }

  static euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) * (a[i] - b[i]);
    return Math.sqrt(sum);
  }

  getEnrollments() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || "{}");
    } catch (e) {
      return {};
    }
  }

  getEnrollment(teacherId) {
    return this.getEnrollments()[teacherId] || null;
  }

  isEnrolled(teacherId) {
    return !!this.getEnrollment(teacherId);
  }

  enroll(teacherId, descriptor, photoDataUrl) {
    const all = this.getEnrollments();
    all[teacherId] = {
      descriptor: Array.from(descriptor),
      photo: photoDataUrl,
      enrolledAt: new Date().toISOString()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(all));
    return all[teacherId];
  }

  clearEnrollment(teacherId) {
    const all = this.getEnrollments();
    delete all[teacherId];
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  clearAll() {
    localStorage.removeItem(this.storageKey);
  }

  verify(teacherId, descriptor) {
    const enr = this.getEnrollment(teacherId);
    if (!enr) return { match: null, reason: "not-enrolled" };
    const d = EduWatchFaceVerifyService.euclideanDistance(enr.descriptor, Array.from(descriptor));
    const confidence = Math.max(0, Math.min(1, 1 - d / 0.7));
    return { match: d <= this.matchThreshold, distance: Math.round(d * 1000) / 1000, confidence };
  }
}

window.EduWatchFaceVerify = new EduWatchFaceVerifyService();
