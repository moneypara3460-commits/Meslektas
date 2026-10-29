import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Meslektaş'ın KENDİ Supabase projesi (BAKPLANLA'dan ayrı). Bu anahtar herkese açık olacak şekilde tasarlanmıştır;
// veriyi RLS kuralları ve gorev_tamamla() fonksiyonu korur.
export const SUPABASE_URL = 'https://xpzfgumoiopmravoyniu.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_XBy1cRfWH0byWtj0O0DRYw_eSyALzg4';

// Oturum anahtarı telefonda şifreli kasada (SecureStore) durur; web'de AsyncStorage.
const guvenliDepo = Platform.OS === 'web' ? AsyncStorage : {
  getItem: (k) => SecureStore.getItemAsync(k.replace(/[^A-Za-z0-9._-]/g, '_')),
  setItem: (k, v) => SecureStore.setItemAsync(k.replace(/[^A-Za-z0-9._-]/g, '_'), v),
  removeItem: (k) => SecureStore.deleteItemAsync(k.replace(/[^A-Za-z0-9._-]/g, '_')),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: guvenliDepo, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
