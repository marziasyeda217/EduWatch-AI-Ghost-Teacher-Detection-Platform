// EduWatch Configuration & Settings Store

const EDUWATCH_STORAGE_KEYS = {
  FIREBASE_CONFIG: "eduwatch_firebase_config",
  FIREBASE_ENABLED: "eduwatch_firebase_enabled",
  APP_DATA: "eduwatch_data_store",
  APP_SETTINGS: "eduwatch_app_settings",
  GROK_API_KEY: "eduwatch_grok_api_key",
  GOOGLE_MAPS_KEY: "eduwatch_google_maps_key",
  SUPABASE_URL: "eduwatch_supabase_url",
  SUPABASE_KEY: "eduwatch_supabase_key"
};

const DEFAULT_SETTINGS = {
  geofenceMaxRadiusMeters: 10, // Strict 10-meter perimeter
  livenessConfidenceThreshold: 0.70,
  mismatchParentThreshold: 1, // 1 'No' report against a check-in triggers flag
  mockGpsEnabled: false,
  soundEffects: true,
  // Secrets are never shipped in source — set them via the Settings panel (stored in localStorage)
  grokApiKey: "",
  googleMapsApiKey: "",
  supabaseUrl: "https://pmxtzltbncgcybmhfcuf.supabase.co",
  supabaseKey: "sb_publishable_tlk5huM2NkaKaR0EUpTUGg_eqOl91he"
};

class ConfigStore {
  constructor() {
    this.settings = this.loadSettings();
    this.firebaseConfig = this.loadFirebaseConfig();
    this.isFirebaseEnabled = localStorage.getItem(EDUWATCH_STORAGE_KEYS.FIREBASE_ENABLED) === "true";
    this.grokApiKey = localStorage.getItem(EDUWATCH_STORAGE_KEYS.GROK_API_KEY) || DEFAULT_SETTINGS.grokApiKey;
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(EDUWATCH_STORAGE_KEYS.APP_SETTINGS);
      const parsed = stored ? JSON.parse(stored) : {};
      if (parsed.geofenceMaxRadiusMeters > 15) {
        parsed.geofenceMaxRadiusMeters = 10;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.warn("Could not load settings from storage, using defaults", e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.grokApiKey !== undefined) {
      this.saveGrokApiKey(newSettings.grokApiKey);
    }
    localStorage.setItem(EDUWATCH_STORAGE_KEYS.APP_SETTINGS, JSON.stringify(this.settings));
  }

  getGrokApiKey() {
    return this.grokApiKey || localStorage.getItem(EDUWATCH_STORAGE_KEYS.GROK_API_KEY) || DEFAULT_SETTINGS.grokApiKey;
  }

  saveGrokApiKey(key) {
    this.grokApiKey = (key || "").trim();
    localStorage.setItem(EDUWATCH_STORAGE_KEYS.GROK_API_KEY, this.grokApiKey);
  }

  loadFirebaseConfig() {
    try {
      const stored = localStorage.getItem(EDUWATCH_STORAGE_KEYS.FIREBASE_CONFIG);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn("Could not load Firebase config from storage", e);
      return null;
    }
  }

  saveFirebaseConfig(config, enable = true) {
    if (config) {
      localStorage.setItem(EDUWATCH_STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
      localStorage.setItem(EDUWATCH_STORAGE_KEYS.FIREBASE_ENABLED, enable ? "true" : "false");
      this.firebaseConfig = config;
      this.isFirebaseEnabled = enable;
    } else {
      localStorage.removeItem(EDUWATCH_STORAGE_KEYS.FIREBASE_CONFIG);
      localStorage.setItem(EDUWATCH_STORAGE_KEYS.FIREBASE_ENABLED, "false");
      this.firebaseConfig = null;
      this.isFirebaseEnabled = false;
    }
  }
}

window.EduWatchConfig = new ConfigStore();
