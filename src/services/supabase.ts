
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'
import { Database } from '../types/supabase.types'

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })

// Supabase kimlik doğrulama durumu değişikliğini dinlemek için
export const initializeSupabase = (dispatch: any) => {
  // Auth durumunu dinleme
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
        // Kullanıcı oturum açtığında profil bilgilerini çek
        await fetchUserProfile(session.user.id, dispatch);
      } else {
        // Kullanıcı çıkış yaptığında state'i temizle
        dispatch({ type: 'auth/authStateChanged', payload: null });
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};

// Kullanıcı profil bilgilerini getir
const fetchUserProfile = async (userId: string, dispatch: any) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    dispatch({
      type: 'auth/authStateChanged', 
      payload: { user: { id: userId, ...data } }
    });
  } catch (error) {
    console.error('Profil yüklenirken hata:', error);
  }
};
        