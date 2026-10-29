// İlerleme: önce telefonda kaydedilir (internetsiz de oynanır), hesap açıksa sunucuya da yazılır.
// Sunucu XP'yi kendisi hesaplar ve kilitleri kontrol eder; telefondaki kayıt yalnızca hız ve çevrimdışı içindir.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { gorevXp } from './kurallar';

const anahtar = (meslekId) => `meslektas:ilerleme:${meslekId}`;
const BEKLEYEN = 'meslektas:bekleyen';

export async function ilerlemeOku(meslekId) {
  try { return JSON.parse((await AsyncStorage.getItem(anahtar(meslekId))) || '{}') || {}; } catch { return {}; }
}

async function yerelYaz(meslekId, gorevId, yildiz, xp) {
  const s = await ilerlemeOku(meslekId);
  const e = s[gorevId];
  s[gorevId] = { yildiz: Math.max(yildiz, e?.yildiz || 0), xp: Math.max(xp, e?.xp || 0) };
  await AsyncStorage.setItem(anahtar(meslekId), JSON.stringify(s));
  return s;
}

async function bekleyenler() {
  try { return JSON.parse((await AsyncStorage.getItem(BEKLEYEN)) || '[]') || []; } catch { return []; }
}

async function sunucuyaGonder(meslekId, gorevId, yildiz) {
  const { data, error } = await supabase.rpc('gorev_tamamla', { p_meslek: meslekId, p_gorev: gorevId, p_yildiz: yildiz });
  if (error) throw error;
  return data;
}

// Görev bitti: yereli güncelle, oturum varsa sunucuya gönder, yoksa sıraya koy
export async function gorevBitti(paket, gorev, yildiz) {
  const meslekId = paket.meslek.id;
  const xp = gorevXp(gorev, yildiz);
  const sonuclar = await yerelYaz(meslekId, gorev.id, yildiz, xp);
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    try { await sunucuyaGonder(meslekId, gorev.id, yildiz); }
    catch (e) { await siraya(meslekId, gorev.id, yildiz); }
  } else {
    await siraya(meslekId, gorev.id, yildiz);
  }
  return sonuclar;
}

async function siraya(meslekId, gorevId, yildiz) {
  const b = await bekleyenler();
  b.push({ meslekId, gorevId, yildiz });
  await AsyncStorage.setItem(BEKLEYEN, JSON.stringify(b.slice(-500)));
}

// Giriş yapınca: bekleyen sonuçları sırayla gönder, sonra sunucudaki ilerlemeyi telefona indir
export async function esitle(meslekIdler) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const b = await bekleyenler();
  const kalan = [];
  for (const x of b) {
    try { await sunucuyaGonder(x.meslekId, x.gorevId, x.yildiz); }
    catch (e) { if (!/kilitli|yok|gecersiz|gecilmedi/.test(String(e.message))) kalan.push(x); }
  }
  await AsyncStorage.setItem(BEKLEYEN, JSON.stringify(kalan));
  const { data, error } = await supabase.from('gorev_sonuclari').select('meslek_id,gorev_id,yildiz,xp');
  if (error) return false;
  for (const id of meslekIdler) {
    const s = await ilerlemeOku(id);
    for (const r of data.filter((r) => r.meslek_id === id)) {
      const e = s[r.gorev_id];
      s[r.gorev_id] = { yildiz: Math.max(r.yildiz, e?.yildiz || 0), xp: Math.max(r.xp, e?.xp || 0) };
    }
    await AsyncStorage.setItem(anahtar(id), JSON.stringify(s));
  }
  return true;
}
