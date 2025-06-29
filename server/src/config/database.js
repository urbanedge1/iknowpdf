import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

// Create Supabase client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create client for user operations
export const createUserClient = (accessToken) => {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

// Test database connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}