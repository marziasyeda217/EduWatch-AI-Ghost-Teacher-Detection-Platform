// EduWatch Supabase PostgreSQL Cloud Client Integration
// Connects EduWatch transparently to Supabase backend when credentials are provided

class EduWatchSupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.url = '';
    this.anonKey = '';
  }

  async init() {
    this.url = localStorage.getItem('eduwatch_supabase_url') || window.EduWatchConfig?.settings?.supabaseUrl || 'https://pmxtzltbncgcybmhfcuf.supabase.co';
    this.anonKey = localStorage.getItem('eduwatch_supabase_key') || window.EduWatchConfig?.settings?.supabaseKey || 'sb_publishable_tlk5huM2NkaKaR0EUpTUGg_eqOl91he';

    if (this.url && this.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.url, this.anonKey);
        const { data, error } = await this.client.from('schools').select('id').limit(1);
        if (!error) {
          this.isConnected = true;
          console.log('EduWatch successfully connected to Supabase PostgreSQL database!');
        } else {
          console.warn('Supabase connection test notice:', error.message);
          if (error.code === '42501' || (error.message && error.message.includes('permission denied'))) {
            console.info('Supabase project reached! Tables exist, awaiting PostgreSQL GRANT to anon role.');
          }
        }
      } catch (e) {
        console.warn('Error initializing Supabase client:', e);
      }
    }
  }

  configure(url, key) {
    if (!url || !key) {
      localStorage.removeItem('eduwatch_supabase_url');
      localStorage.removeItem('eduwatch_supabase_key');
      this.client = null;
      this.isConnected = false;
      return false;
    }
    localStorage.setItem('eduwatch_supabase_url', url.trim());
    localStorage.setItem('eduwatch_supabase_key', key.trim());
    this.url = url.trim();
    this.anonKey = key.trim();
    if (window.supabase) {
      this.client = window.supabase.createClient(this.url, this.anonKey);
      this.isConnected = true;
      return true;
    }
    return false;
  }

  async getTable(tableName, queryModifier = null) {
    if (!this.isConnected || !this.client) return null;
    try {
      let q = this.client.from(tableName).select('*');
      if (queryModifier) q = queryModifier(q);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase getTable error on ' + tableName + ':', e.message);
      return null;
    }
  }

  async upsert(tableName, record) {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client.from(tableName).upsert(record).select();
      if (error) throw error;
      return data?.[0] || record;
    } catch (e) {
      console.warn('Supabase upsert error on ' + tableName + ':', e.message);
      return null;
    }
  }

  async testConnection(url, key) {
    if (!window.supabase) {
      return { success: false, error: 'Supabase JS library not loaded' };
    }
    try {
      const testClient = window.supabase.createClient(url.trim(), key.trim());
      const { data, error } = await testClient.from('schools').select('id, name').limit(1);
      if (error) {
        if (error.code === '42501' || (error.message && error.message.includes('permission denied'))) {
          return {
            success: false,
            needsGrant: true,
            error: 'Project reached and table "schools" was verified! However, PostgreSQL table privileges must be granted to the anon role. Run the 4-line GRANT SQL script in Supabase SQL Editor.'
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, count: data ? data.length : 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

window.EduWatchSupabase = new EduWatchSupabaseService();
