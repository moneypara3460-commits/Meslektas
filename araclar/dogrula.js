// Meslek paketi doğrulayıcı: node araclar/dogrula.js
// Her yeni meslek eklenince çalıştır; hata varsa oyun o mesleği bozuk gösterebilir.
const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, '..', 'icerik');
const SABLON = {
  bilgi: ['xp', 'kartlar'], soru: ['temelXp', 'yildizBasinaXp', 'sorular'], sinav: ['xp', 'gecmeYuzde', 'sorular'],
  senaryo: ['temelXp', 'yildizBasinaXp', 'giris', 'adimlar'], uyum: ['xp', 'sorular', 'sonuclar'], siralama: ['adimlar', 'puanlama'],
  siniflandirma: ['temelXp', 'yildizBasinaXp', 'kategoriler', 'ogeler'], hesap: ['temelXp', 'yildizBasinaXp', 'hedefOran', 'urunler', 'kural'],
  zamanlama: ['temelXp', 'yildizBasinaXp', 'turlar'], ayar: ['temelXp', 'yildizBasinaXp', 'hedef', 'maxDeneme', 'turlar'],
  kopurtme: ['temelXp', 'yildizBasinaXp', 'sicaklik', 'yanma', 'havaSiniri', 'siparisler'],
};
const xp = (g) => ['bilgi', 'uyum', 'sinav'].includes(g.sablon) ? g.xp : g.sablon === 'siralama' ? g.puanlama.temelXp + 3 * g.puanlama.yildizBasinaXp : g.temelXp + 3 * g.yildizBasinaXp;
const cizimDosya = fs.readFileSync(path.join(__dirname, '..', 'gorseller', 'cizimler.js'), 'utf8');
const GORSELLER = new Set([...cizimDosya.slice(cizimDosya.indexOf('CIZIMLER = {')).matchAll(/'?([a-z-]+)'?\s*:/g)].map((m) => m[1]));
const gorselKontrol = (ad, yer, H) => { if (ad && !GORSELLER.has(ad)) H.push(`${yer}: "${ad}" adında görsel yok`); };
let hataSay = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const P = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); const H = [];
  const m = P.meslek || {};
  for (const k of ['id', 'ad', 'kategori', 'tanim', 'tamamlamaBelgesi']) if (!m[k]) H.push(`meslek.${k} eksik`);
  if (!m.metinler) H.push('meslek.metinler eksik (senaryo düğmeleri, karakter adları)');
  if (!m.renkler) H.push('meslek.renkler eksik');
  const idler = new Set();
  (P.kademeler || []).forEach((K, ki) => {
    if (!K.rozet?.ad || !K.rozet?.ikon) H.push(`${K.ad}: rozet eksik`);
    let top = 0;
    K.gorevler.forEach((g, gi) => {
      const yer = `${K.ad} / ${g.id || '?'}`;
      if (!g.id || idler.has(g.id)) H.push(`${yer}: id yok ya da tekrar ediyor`); idler.add(g.id);
      if (!SABLON[g.sablon]) { H.push(`${yer}: bilinmeyen şablon "${g.sablon}"`); return; }
      for (const a of SABLON[g.sablon]) if (g[a] == null) H.push(`${yer}: "${a}" alanı eksik`);
      if (!g.baslik || !g.ikon) H.push(`${yer}: başlık/ikon eksik`);
      top += xp(g);
      (g.kartlar || []).forEach((c) => gorselKontrol(c.gorsel, yer, H));
      if (g.sablon !== 'uyum') (g.sorular || []).forEach((s) => { gorselKontrol(s.gorsel, yer, H);
        if (s.secenekGorselleri) { if (s.secenekGorselleri.length !== s.secenekler.length) H.push(`${yer}: resimli şık sayısı tutmuyor`); s.secenekGorselleri.forEach((a) => gorselKontrol(a, yer, H)); } });
      if (g.sorular && g.sablon !== 'uyum') g.sorular.forEach((s, i) => { if (!(s.dogru >= 0 && s.dogru < s.secenekler.length)) H.push(`${yer}: ${i + 1}. sorunun doğru cevabı geçersiz`); if (!s.aciklama) H.push(`${yer}: ${i + 1}. soruda açıklama yok`); });
      if (g.sablon === 'senaryo') g.adimlar.forEach((a, i) => { if (a.secenekler.filter((o) => o.dogru).length !== 1) H.push(`${yer}: ${i + 1}. adımda tam 1 doğru seçenek olmalı`); });
      if (g.sablon === 'siniflandirma') { const ks = new Set(g.kategoriler.map((k) => k.id)); g.ogeler.forEach((o) => { if (!ks.has(o.kategori)) H.push(`${yer}: "${o.ad}" kategorisi yok`); }); }
      if (g.sablon === 'zamanlama') g.turlar.forEach((t) => { if (!(t.baslangic < t.hedef[0] && t.hedef[0] < t.hedef[1] && t.hedef[1] < t.tehlike && t.tehlike <= t.bitis)) H.push(`${yer}: "${t.ad}" sıralaması başlangıç < hedef < tehlike ≤ bitiş olmalı`); });
    });
    if (top !== K.hedefXp) H.push(`${K.ad}: hedefXp ${K.hedefXp}, görevlerin toplamı ${top}`);
    if (ki > 0 && K.gorevler[K.gorevler.length - 1].sablon !== 'sinav') H.push(`${K.ad}: son görev sınav olmalı (rozet sınavla kazanılır)`);
  });
  console.log(H.length ? `✗ ${f}\n  - ` + H.join('\n  - ') : `✓ ${f} (${P.kademeler.length} kademe, ${idler.size} görev, uzman onayı: ${P.uzmanOnayi ? 'var' : 'bekliyor'})`);
  hataSay += H.length;
}
process.exit(hataSay ? 1 : 0);
