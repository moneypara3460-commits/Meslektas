// Meslek Pusulası — ilgi testi.
// Holland (RIASEC) ilgi modeli temel alındı: 6 ilgi tipi × 5 soru = 30 soru.
// Sorular tamamen bize ait (hazır ölçeklerden kopya yok). Bilimsel tanı değildir; yön bulma amaçlıdır.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TIPLER = {
  R: { ad: 'Gerçekçi', lakap: 'Eli işe yatkın', renk: '#b5651d',
    tanim: 'Elle tutulur işler, aletler ve hareket sende. Sonucunu gözünle gördüğün işlerde parlıyorsun.' },
  I: { ad: 'Araştırmacı', lakap: 'Meraklı çözümcü', renk: '#3d6fa8',
    tanim: 'Bir şeyin nedenini bulmadan rahat etmezsin. Öğrenmek, denemek ve geliştirmek seni çalıştırır.' },
  A: { ad: 'Sanatsal', lakap: 'Yaratıcı ruh', renk: '#8e4fa3',
    tanim: 'Güzellik, tat ve tarz senin için önemli. İşine kendi imzanı atmak istersin.' },
  S: { ad: 'Sosyal', lakap: 'İnsan insanı', renk: '#2f8f6b',
    tanim: 'İnsanlarla olmak sana enerji verir. Birini mutlu etmek en büyük ödülün.' },
  E: { ad: 'Girişimci', lakap: 'Lider ruhlu', renk: '#c8553d',
    tanim: 'Sorumluluk almaktan, yönetmekten ve hedefe koşmaktan çekinmezsin.' },
  C: { ad: 'Düzenli', lakap: 'Düzen ustası', renk: '#5a6b7b',
    tanim: 'Planlı, kurallı ve eksiksiz çalışırsın. Her şey yerli yerinde olunca huzur bulursun.' },
};

// Sıra karışık: aynı tipten sorular art arda gelmesin.
export const SORULAR = [
  { tip: 'R', metin: 'Bir şeyi elimle yapıp sonucunu hemen görmek hoşuma gider.' },
  { tip: 'S', metin: 'Yeni insanlarla tanışıp sohbet etmek bana enerji verir.' },
  { tip: 'A', metin: 'Bir şeyin göze güzel görünmesi benim için önemlidir.' },
  { tip: 'C', metin: 'Çalıştığım yerin derli toplu ve düzenli olması benim için önemlidir.' },
  { tip: 'E', metin: 'Bir ekipte sorumluluk almayı, gerekirse yönetmeyi severim.' },
  { tip: 'I', metin: 'Bir şeyin neden öyle olduğunu merak eder, araştırırım.' },
  { tip: 'S', metin: 'Birinin derdini dinleyip ona yardım etmekten mutlu olurum.' },
  { tip: 'R', metin: 'Gün boyu ayakta, hareket ederek çalışmak bana iyi gelir.' },
  { tip: 'I', metin: 'Bir sorunla karşılaşınca önce nedenini bulmaya çalışırım.' },
  { tip: 'A', metin: 'Hazır kalıplar yerine kendi tarzımı katmayı severim.' },
  { tip: 'E', metin: 'İnsanları bir fikre ikna etmekte iyiyimdir.' },
  { tip: 'C', metin: 'Kurallara ve belirli bir düzene göre çalışmayı tercih ederim.' },
  { tip: 'R', metin: 'Bir aletin ya da makinenin nasıl çalıştığını kurcalayarak öğrenirim.' },
  { tip: 'A', metin: 'Renkler, tatlar, kokular ya da sesler konusunda hassasımdır.' },
  { tip: 'S', metin: 'Bir müşterinin ya da misafirin memnun ayrılması beni çok sevindirir.' },
  { tip: 'I', metin: 'Yeni bir konuyu derinlemesine öğrenmek beni heyecanlandırır.' },
  { tip: 'C', metin: 'Rakamlara, ölçülere ve ayrıntılara dikkat ederim.' },
  { tip: 'E', metin: 'Bir gün kendi işimi kurmayı ya da bir yeri yönetmeyi hayal ederim.' },
  { tip: 'A', metin: 'Yeni bir fikir, tasarım ya da tarif uydurmak hoşuma gider.' },
  { tip: 'R', metin: 'Masa başı iş yerine elle tutulur bir şey ürettiğim işi seçerim.' },
  { tip: 'S', metin: 'Bir şeyi başkasına anlatıp öğretmeyi severim.' },
  { tip: 'C', metin: 'Her şeyin yerli yerinde olduğunu kontrol etmek hoşuma gider.' },
  { tip: 'I', metin: 'Farklı yöntemleri deneyip hangisinin daha iyi olduğunu karşılaştırırım.' },
  { tip: 'E', metin: 'Baskı altında hızlı karar verebilirim.' },
  { tip: 'S', metin: 'Kalabalık ve hareketli ortamlarda kendimi iyi hissederim.' },
  { tip: 'A', metin: 'Yaptığım işle insanları şaşırtmak, etkilemek isterim.' },
  { tip: 'R', metin: 'Bir tarifi ya da talimatı adım adım uygulamak bana keyif verir.' },
  { tip: 'I', metin: 'Bir işi yaparken "bunu nasıl daha iyi yaparım" diye düşünürüm.' },
  { tip: 'C', metin: 'Bir işi planlayıp sırasıyla, eksiksiz bitirmeyi severim.' },
  { tip: 'E', metin: 'Hedef koyup o hedefe ulaşmak için yarışmak beni motive eder.' },
];

export const CEVAPLAR = [
  { deger: 1, yazi: 'Hiç bana göre değil' },
  { deger: 2, yazi: 'Pek değil' },
  { deger: 3, yazi: 'Kararsızım' },
  { deger: 4, yazi: 'Bana uyuyor' },
  { deger: 5, yazi: 'Tam bana göre' },
];

// Oyundaki mesleklerin ilgi profili (0–1). Yeni meslek eklenince buraya bir satır.
export const MESLEK_PROFIL = {
  barista: { R: 0.8, I: 0.35, A: 0.6, S: 0.9, E: 0.3, C: 0.6 },
  asci: { R: 1, I: 0.4, A: 0.9, S: 0.3, E: 0.35, C: 0.7 },
  servis: { R: 0.5, I: 0.1, A: 0.3, S: 1, E: 0.7, C: 0.7 },
};

// Henüz oyunda olmayan, tipe göre önerilecek meslekler.
export const YAKINDA = {
  R: ['Elektrikçi', 'Kuaför', 'Mobilya ustası'],
  I: ['Laborant', 'Eczane teknisyeni', 'Yazılımcı'],
  A: ['Pastacı', 'Grafik tasarımcı', 'Fotoğrafçı'],
  S: ['Hemşire', 'Çocuk gelişimci', 'Satış danışmanı'],
  E: ['Emlak danışmanı', 'Mağaza müdürü', 'Etkinlik organizatörü'],
  C: ['Muhasebe elemanı', 'Depo sorumlusu', 'Banka gişe görevlisi'],
};

const KODLAR = Object.keys(TIPLER);

// cevaplar: soru sırasına göre 1–5 dizisi → her tip için 0–100 puan
export function puanla(cevaplar) {
  const p = Object.fromEntries(KODLAR.map((k) => [k, 0]));
  SORULAR.forEach((s, i) => { p[s.tip] += cevaplar[i] || 3; });
  return Object.fromEntries(KODLAR.map((k) => [k, Math.round(((p[k] - 5) / 20) * 100)]));
}

const korelasyon = (a, b) => {
  const ma = KODLAR.reduce((t, k) => t + a[k], 0) / 6; const mb = KODLAR.reduce((t, k) => t + b[k], 0) / 6;
  let ust = 0, sa = 0, sb = 0;
  for (const k of KODLAR) { const x = a[k] - ma, y = b[k] - mb; ust += x * y; sa += x * x; sb += y * y; }
  return sa && sb ? ust / Math.sqrt(sa * sb) : 0;
};

// Kullanıcının profilini mesleklerle karşılaştırır. Uyum = profil şekli (korelasyon) + genel ilgi düzeyi.
export function analiz(puanlar, meslekIdler) {
  const sirali = [...KODLAR].sort((a, b) => puanlar[b] - puanlar[a]);
  const kod = sirali.slice(0, 2);
  const meslekler = meslekIdler.filter((id) => MESLEK_PROFIL[id]).map((id) => {
    const w = MESLEK_PROFIL[id]; const r = korelasyon(puanlar, w);
    const duzey = KODLAR.reduce((t, k) => t + w[k] * puanlar[k], 0) / KODLAR.reduce((t, k) => t + w[k], 0);
    const uyum = Math.round(Math.max(5, Math.min(99, 0.6 * (50 + 50 * r) + 0.4 * duzey)));
    return { id, uyum };
  }).sort((a, b) => b.uyum - a.uyum);
  const yakinda = [...new Set([...YAKINDA[kod[0]].slice(0, 2), ...YAKINDA[kod[1]].slice(0, 2)])];
  const dengeli = puanlar[sirali[0]] - puanlar[sirali[5]] < 15; // her şeye aynı cevabı verdiyse sonuç zayıf
  return { sirali, kod, meslekler, yakinda, dengeli };
}

const ANAHTAR = 'meslektas:pusula';
export async function pusulaOku() { try { const v = await AsyncStorage.getItem(ANAHTAR); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
export async function pusulaYaz(puanlar) {
  const kayit = { puanlar, tarih: new Date().toISOString() };
  try { await AsyncStorage.setItem(ANAHTAR, JSON.stringify(kayit)); } catch (e) { /* telefonda yer yoksa sonuç yine gösterilir */ }
  return kayit;
}
