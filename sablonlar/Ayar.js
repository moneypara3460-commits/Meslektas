// Barista'ya özel: öğütücü ayarı. Büyük sayı = kalın öğütme = hızlı akış.
import { t as dt } from '../dil';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Aciklama, Kart, R, useTema } from '../ui';

export default function Ayar({ gorev, onBitir, onKapat }) {
  const t = useTema();
  const [ti, setTi] = useState(0); const tur = gorev.turlar[ti];
  const [ayar, setAyar] = useState(tur.baslangic); const [deneme, setDeneme] = useState(0);
  const [gecmis, setGecmis] = useState([]); const [bitti, setBitti] = useState(false); const [puanlar, setPuanlar] = useState([]);
  const sure = (x) => Math.round(27.5 + (tur.ideal - x) * 2.5);
  const shot = () => {
    const s = sure(ayar); const ok = s >= gorev.hedef[0] && s <= gorev.hedef[1]; const d = deneme + 1;
    setDeneme(d); setGecmis([...gecmis, { ayar, s, ok }]);
    if (ok || d >= gorev.maxDeneme) { setBitti(true); setPuanlar([...puanlar, ok ? Math.max(1, 4 - d) : 0]); }
  };
  const ileri = () => {
    if (ti < gorev.turlar.length - 1) { const n = gorev.turlar[ti + 1]; setTi(ti + 1); setAyar(n.baslangic); setDeneme(0); setGecmis([]); setBitti(false); return; }
    const p = puanlar.reduce((a, b) => a + b, 0); const max = gorev.turlar.length * 3;
    const y = p >= max - 1 ? 3 : p >= max / 2 ? 2 : 1;
    onBitir({ yildiz: y, d1: [`${puanlar.filter(Boolean).length}/${gorev.turlar.length}`, 'tutturulan'], d2: [p, 'puan'], ipucu: 'Bir seferde tek şeyi değiştir.', bilgi: gorev.bilgiKarti });
  };
  const son = gecmis[gecmis.length - 1];
  return (
    <Ekran alt={bitti ? <Dugme yazi={ti === gorev.turlar.length - 1 ? dt('Sonucu gör') : dt('Sonraki tur')} onPress={ileri} /> : <Dugme yazi={`Test shotu çek (${deneme}/${gorev.maxDeneme})`} onPress={shot} />}>
      <Ust baslik={gorev.baslik} sayac={`Tur ${ti + 1}/${gorev.turlar.length}`} onKapat={onKapat} ilerleme={ti / gorev.turlar.length} />
      {ti === 0 && !gecmis.length ? <Text style={{ color: R.soluk, marginBottom: 12, lineHeight: 20 }}>{gorev.aciklama}</Text> : null}
      <Kart style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: t.ana }}>🎛️ {tur.ad}</Text><Text style={{ color: R.soluk, marginTop: 4 }}>{tur.not}</Text>
      </Kart>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Pressable disabled={bitti} onPress={() => setAyar(Math.max(1, ayar - 1))} style={{ padding: 14, borderRadius: 14, backgroundColor: t.ana }}><Text style={{ color: '#fff', fontWeight: '900' }}>◀ İncelt</Text></Pressable>
        <Text style={{ fontSize: 40, fontWeight: '900', marginHorizontal: 20, color: R.yazi }}>{ayar}</Text>
        <Pressable disabled={bitti} onPress={() => setAyar(Math.min(20, ayar + 1))} style={{ padding: 14, borderRadius: 14, backgroundColor: t.ana }}><Text style={{ color: '#fff', fontWeight: '900' }}>Kalınlaştır ▶</Text></Pressable>
      </View>
      {gecmis.map((g, j) => <Text key={j} style={{ color: g.ok ? R.yesil : R.kirmizi, fontWeight: '700', marginBottom: 4 }}>{j + 1}. deneme · ayar {g.ayar} → {g.s} sn {g.ok ? '✓' : g.s < gorev.hedef[0] ? '(hızlı, ekşi)' : '(yavaş, acı)'}</Text>)}
      {son ? <Aciklama iyi={son.ok} metin={son.ok ? '✓ Ayar tuttu! Akış hedefte.' : bitti ? '✗ Deneme hakkın bitti. Kısa ve ekşi → incelt, uzun ve acı → kalınlaştır.' : son.s < gorev.hedef[0] ? 'Çok hızlı aktı: öğütmeyi incelt.' : 'Çok yavaş aktı: öğütmeyi kalınlaştır.'} /> : null}
    </Ekran>
  );
}
