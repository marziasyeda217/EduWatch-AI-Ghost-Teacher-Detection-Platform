# EduWatch — Pakistan Teacher Attendance Transparency Platform

> **Hackathon Prototype Scope** | AI Geo-Attendance + Citizen Audit Layer  
> Built for zero-friction demoing, zero build pipelines, and high-impact live presentations.

---

## 🚀 Quickstart (Run in 5 Seconds)

Because EduWatch is built with plain HTML, Tailwind CSS CDN, and vanilla ES6 JavaScript, **no build step or `npm install` is required**.

You can run it in any of these ways:

### Option A: Python Built-in Server (Recommended)
```bash
cd C:\Users\marzi\.gemini\antigravity\scratch\eduwatch
python -m http.server 8080
```
Open **http://localhost:8080** in your browser.

### Option B: Node.js / npx serve
```bash
npx serve C:\Users\marzi\.gemini\antigravity\scratch\eduwatch -p 8080
```

### Option C: Direct File Opening
Double-click `index.html` to open it in Chrome / Edge. (Note: Running via a local HTTP server like Option A is recommended for webcam and geolocation browser security policies).

---

## 🎯 Hackathon Judge Demo Walkthrough (3-Minute Winning Flow)

1. **The Problem Statement**:
   - Pakistan's public education system loses billions to "ghost teachers" (teachers who appear on government payrolls but rarely or never physically teach in classrooms).
   - Existing biometric machines are static, prone to power outages, and lack citizen verification.

2. **Step 1: Teacher Check-in Portal (`Teacher Check-in` Tab)**:
   - Select **"Govt. High School Model Town (Lahore)"** and teacher **"Tariq Mehmood"**.
   - Show the **GPS Geofence** detection (300m campus boundary).
   - Click **"Open Webcam Feed"** &rarr; Click **"Run Liveness & Capture"**.
   - Watch the interactive AI liveness test (blinking/micro-expression verification) and see the security geotag and timestamp watermarked directly on the photo canvas.
   - Click **"Submit AI Geo-Check-in"**.

3. **Step 2: Community Verification Portal (`Community Audit` Tab)**:
   - Switch to the Community view (representing parents, school council members, or village elders).
   - View Tariq Mehmood: his app check-in claims he is present!
   - As a parent inspector, click **"No / غیر حاضر"** and enter a note: *"Classroom empty during Grade 9 period"*.

4. **Step 3: Discrepancy Flagging Engine in Action (`Dashboard` Tab)**:
   - Switch to the **Dashboard**.
   - Show the live **Discrepancy & Ghost Teacher Alert**:
     - The engine immediately detected a conflict: Tariq Mehmood submitted a digital check-in, but parents reported him absent!
   - Show the Chart.js visual graphs (Attendance by School, Verification Breakdown).
   - Explore the **Interactive Pakistan Map** (Leaflet) with green normal schools and red flagged schools surrounded by their 300m geofence rings.
   - Demonstrate the accountability loop: Click **"Mark Resolved"** to show how District Education Officers (DEOs) resolve or escalate flags.

---

## 🔑 APIs & Cloud Services Configuration

EduWatch works **100% out of the box** using its internal reactive storage layer pre-loaded with realistic Pakistani schools and staff data.

If you want to demonstrate **real-time cross-device sync** (e.g. check in from your phone while the judge watches the dashboard update live on a laptop):

1. Go to the [Firebase Console](https://console.firebase.google.com/) & create a free project.
2. Enable **Firestore Database** in test mode (`allow read, write: if true;`).
3. Copy your Web App config object:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "your-app.firebaseapp.com",
     "projectId": "your-project-id",
     "storageBucket": "your-app.appspot.com",
     "messagingSenderId": "123456789",
     "appId": "1:123456789:web:abcdef"
   }
   ```
4. In EduWatch, click the **Gear icon (⚙️) / Storage Status** at the top right.
5. Paste your JSON, check **"Enable Cloud Firestore Sync"**, and click **Save & Reconnect**.

### Optional Services (Roadmap):
- **Twilio SMS**: Can be added to fire automated SMS alerts to parents when a ghost teacher flag is created.
- **Google Maps**: Can replace OpenStreetMap if a Google Maps API Key is provided.

---

## 📁 Project Structure

```
eduwatch/
├── index.html           # Main Single Page App (SPA) shell
├── css/
│   └── style.css        # Scanner beams, Urdu font bindings, glassmorphism UI
├── js/
│   ├── config.js        # Settings store & Firebase credential manager
│   ├── seed-data.js     # Pre-loaded Pakistani schools (Lahore, Rawalpindi, Peshawar, Quetta, Sukkur)
│   ├── db.js            # Dual-mode data access layer (Firestore + LocalStorage)
│   ├── flag-engine.js   # Automated discrepancy & ghost teacher audit engine
│   ├── teacher.js       # Teacher webcam, liveness challenge & GPS geofencing
│   ├── community.js     # Parent / School Management Committee audit voting
│   ├── dashboard.js     # Public analytics, Chart.js visuals, KPI cards, flag feed
│   └── map.js           # Leaflet interactive map with geofence perimeters
└── README.md            # Documentation & Presentation Guide
```
