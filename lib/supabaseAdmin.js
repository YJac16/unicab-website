const { createClient } = require('@supabase/supabase-js');

let adminClient = null;

const getSupabaseConfig = () => ({
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

const isSupabaseConfigured = () => {
  const { url, serviceKey } = getSupabaseConfig();
  return Boolean(url && serviceKey);
};

const getSupabaseAdmin = () => {
  if (adminClient) {
    return adminClient;
  }

  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
};

module.exports = {
  getSupabaseAdmin,
  isSupabaseConfigured,
};
