import axios from 'axios';
import { getSupabase } from '../lib/supabase';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});





// Add a request interceptor to include the auth token
api.interceptors.request.use(async (config: any) => {
  try {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error('Error attaching auth token:', err);
  }
  return config;
});

export default api;

