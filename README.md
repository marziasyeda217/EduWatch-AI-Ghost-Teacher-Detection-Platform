# EduWatch — Pakistan Teacher Attendance Transparency Platform

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
