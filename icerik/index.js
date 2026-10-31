// Oyundaki meslekler. Yeni meslek = yeni JSON paketi + buraya bir satır.
// Çeviriler icerik/ceviri/<dil>/<meslek>.json dosyalarında: Türkçe paketteki metinlerin sırayla çevirisi.
// Bilgiler ve kurallar her dilde Türkiye'deki mevzuata göredir.
import barista from './barista.json';
import asci from './asci.json';
import servis from './servis.json';
import mimar from './mimar.json';
import insaat from './insaat.json';
import freze from './freze.json';
import kaynak from './kaynak.json';
import yazilim from './yazilim.json';
import grafik from './grafik.json';
import muhasebe from './muhasebe.json';
import itfaiye from './itfaiye.json';
import satis from './satis.json';
import { CEVIRILER } from './ceviri';

const TURKCE = [barista, asci, servis, mimar, insaat, freze, kaynak, yazilim, grafik, muhasebe, itfaiye, satis];

// Seçili dildeki paketler. Dizi yerinde güncellenir; böylece her yer aynı listeyi görür.
export const MESLEKLER = [...TURKCE];
export const meslekBul = (id) => MESLEKLER.find((p) => p.meslek.id === id);

// araclar/ceviri.py içindeki CEVIR ile aynı olmalı
const CEVIR = new Set(['aciklama', 'ad', 'baslik', 'birim', 'calismaKosullari', 'erkenMetni', 'gecMetni', 'giris', 'ipucu', 'kademeler',
  'kalemler', 'kaynaklar', 'kural', 'maddeler', 'metin', 'musteri', 'neden', 'not', 'secenekler', 'senaryoBasla',
  'senaryoBitir', 'sonraki', 'soru', 'tanim', 'tehlikeMetni', 'terim', 'ucYildiz', 'usta']);

function topla(o, anahtar, out) {
  if (Array.isArray(o)) o.forEach((v) => topla(v, anahtar, out));
  else if (o && typeof o === 'object') Object.keys(o).forEach((k) => topla(o[k], k, out));
  else if (typeof o === 'string' && CEVIR.has(anahtar)) out.push(o);
  return out;
}
function ozet(metinler) {
  const s = metinler.join('\u0001'); let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}
function degistir(o, anahtar, sira) {
  if (Array.isArray(o)) return o.map((v) => degistir(v, anahtar, sira));
  if (o && typeof o === 'object') { const y = {}; Object.keys(o).forEach((k) => { y[k] = degistir(o[k], k, sira); }); return y; }
  if (typeof o === 'string' && CEVIR.has(anahtar)) return sira.metinler[sira.i++];
  return o;
}
const onbellek = {};
function cevir(p, dil) {
  const c = CEVIRILER[dil] && CEVIRILER[dil][p.meslek.id];
  if (!c) return p;
  const kaynak = topla(p, null, []);
  if (kaynak.length !== c.n || ozet(kaynak) !== c.ozet) return p; // Türkçe içerik değişmiş: eski çeviriyi kullanma
  return degistir(p, null, { metinler: c.metinler, i: 0 });
}
export function icerikDili(dil) {
  if (!onbellek[dil]) onbellek[dil] = dil === 'tr' ? TURKCE : TURKCE.map((p) => cevir(p, dil));
  MESLEKLER.splice(0, MESLEKLER.length, ...onbellek[dil]);
}
export const ceviriVar = (dil, id) => dil === 'tr' || !!(CEVIRILER[dil] && CEVIRILER[dil][id]);
