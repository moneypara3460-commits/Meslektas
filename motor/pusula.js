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
  { tip: 'R', metin: 'Elinle bir şey yapmayı (tamir, yemek, montaj gibi) sever misin?' },
  { tip: 'S', metin: 'Yeni insanlarla tanışmak hoşuna gider mi?' },
  { tip: 'A', metin: 'Giydiğin ya da yaptığın şeylerin güzel görünmesine dikkat eder misin?' },
  { tip: 'C', metin: 'Odan ya da çalıştığın yer genelde düzenli midir?' },
  { tip: 'E', metin: 'Bir grupta liderliği üstlenmeyi sever misin?' },
  { tip: 'I', metin: 'Bir şeyin neden öyle olduğunu merak eder misin?' },
  { tip: 'S', metin: 'Birine yardım edince mutlu olur musun?' },
  { tip: 'R', metin: 'Bütün gün oturmak yerine ayakta, hareket ederek çalışmak ister misin?' },
  { tip: 'I', metin: 'Bir sorun çıkınca önce sebebini bulmaya çalışır mısın?' },
  { tip: 'A', metin: 'İşleri kendi tarzınla yapmayı sever misin?' },
  { tip: 'E', metin: 'İnsanları bir fikre ikna etmekte iyi misin?' },
  { tip: 'C', metin: 'Kurallara uyarak çalışmak seni rahatlatır mı?' },
  { tip: 'R', metin: 'Bozulan bir eşyayı açıp kurcalamak hoşuna gider mi?' },
  { tip: 'A', metin: 'Renklere, tatlara ya da kokulara çok dikkat eder misin?' },
  { tip: 'S', metin: 'Bir müşteriyi memnun etmek seni sevindirir mi?' },
  { tip: 'I', metin: 'Yeni bir konuyu derinlemesine öğrenmek hoşuna gider mi?' },
  { tip: 'C', metin: 'Rakamlara ve küçük ayrıntılara dikkat eder misin?' },
  { tip: 'E', metin: 'Bir gün kendi işini kurmak ister misin?' },
  { tip: 'A', metin: 'Yeni bir şey tasarlamak ya da kendi tarifini uydurmak hoşuna gider mi?' },
  { tip: 'R', metin: 'Bilgisayar başında değil, elle tutulur bir şey ürettiğin bir iş ister misin?' },
  { tip: 'S', metin: 'Bildiğin bir şeyi başkasına öğretmeyi sever misin?' },
  { tip: 'C', metin: 'Bir işi bitirince her şeyi tek tek kontrol eder misin?' },
  { tip: 'I', metin: 'Bir işi farklı yollarla deneyip en iyisini bulmayı sever misin?' },
  { tip: 'E', metin: 'Acele bir durumda hızlıca karar verebilir misin?' },
  { tip: 'S', metin: 'Kalabalık, hareketli yerlerde bulunmak hoşuna gider mi?' },
  { tip: 'A', metin: 'Çizmek, süslemek ya da bir yeri dekore etmek hoşuna gider mi?' },
  { tip: 'R', metin: 'Alet edevat (tornavida, bıçak, makine) kullanmak hoşuna gider mi?' },
  { tip: 'I', metin: 'Bilim, deney ya da araştırma videoları ilgini çeker mi?' },
  { tip: 'C', metin: 'Bir işe başlamadan önce plan yapar mısın?' },
  { tip: 'E', metin: 'Bir hedef koyup ona ulaşmak için yarışmayı sever misin?' },
];

// Üç basit cevap: Evet = 5, Kararsızım = 3, Hayır = 1 (puanlama aynı ölçekte kalır).
export const CEVAPLAR = [
  { deger: 5, yazi: 'Evet', ikon: '✓', renk: '#2f7d5b' },
  { deger: 3, yazi: 'Kararsızım', ikon: '~', renk: '#8a7a6d' },
  { deger: 1, yazi: 'Hayır', ikon: '✕', renk: '#c8553d' },
];

// Oyundaki mesleklerin ilgi profili (0–1). Yeni meslek eklenince buraya bir satır.
export const MESLEK_PROFIL = {
  barista: { R: 0.8, I: 0.35, A: 0.6, S: 0.9, E: 0.3, C: 0.6 },
  asci: { R: 1, I: 0.4, A: 0.9, S: 0.3, E: 0.35, C: 0.7 },
  servis: { R: 0.5, I: 0.1, A: 0.3, S: 1, E: 0.7, C: 0.7 },
  mimar: { R: 0.5, I: 0.7, A: 1, S: 0.35, E: 0.5, C: 0.7 },
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

// cevaplar: soru sırasına göre 1/3/5 dizisi → her tip için 0–100 puan
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
