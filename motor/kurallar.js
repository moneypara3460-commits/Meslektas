// Oyun kuralları. Sunucudaki gorev_tamamla() fonksiyonuyla AYNI mantık; biri değişirse öbürü de değişmeli.

export function gorevXp(g, yildiz) {
  if (g.sablon === 'bilgi' || g.sablon === 'uyum' || g.sablon === 'sinav') return g.xp;
  const y = Math.max(1, yildiz);
  if (g.sablon === 'siralama') return g.puanlama.temelXp + y * g.puanlama.yildizBasinaXp;
  return g.temelXp + y * g.yildizBasinaXp;
}

export function maxXp(g) { return gorevXp(g, 3); }

export function kademeBitti(paket, ki, sonuclar) {
  const gs = paket.kademeler[ki].gorevler;
  return !!sonuclar[gs[gs.length - 1].id];
}

export function kademeAcik(paket, ki, sonuclar) {
  return ki === 0 || !!paket.kademeler[ki].acikBaslar || kademeBitti(paket, ki - 1, sonuclar);
}

export function gorevAcik(paket, ki, gi, sonuclar) {
  if (!kademeAcik(paket, ki, sonuclar)) return false;
  if (gi === 0) return true;
  return !!sonuclar[paket.kademeler[ki].gorevler[gi - 1].id];
}

export function kademeXp(paket, ki, sonuclar) {
  return paket.kademeler[ki].gorevler.reduce((t, g) => t + (sonuclar[g.id]?.xp || 0), 0);
}

export function toplamXp(paket, sonuclar) {
  return paket.kademeler.reduce((t, _, ki) => t + kademeXp(paket, ki, sonuclar), 0);
}

// Oyuncunun kaldığı kademe: açık olup bitmemiş en ileri kademe
export function aktifKademe(paket, sonuclar) {
  for (let i = paket.kademeler.length - 1; i >= 0; i--) {
    if (kademeAcik(paket, i, sonuclar) && !kademeBitti(paket, i, sonuclar)) return i;
  }
  return paket.kademeler.length - 1;
}

export function yildizHesap(dogru, toplam) {
  return dogru === toplam ? 3 : dogru / toplam >= 0.6 ? 2 : 1;
}

export function karistir(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
