// Genel beceri şablonu: gösterge yükselir, hedef aralığa girince DURDUR.
// Örnek: kızartma yağı sıcaklığı, etin iç sıcaklığı, boya kuruma süresi, kaynak akımı...
import { t as dt } from '../dil';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { Ekran, Ust, Dugme, Aciklama, Kart, R, useTema } from '../ui';

export default function Zamanlama({ gorev, onBitir, onKapat }) {
  const t = useTema();
  const [ti, setTi] = useState(0); const [durum, setDurum] = useState('hazir'); // hazir | akiyor | bitti
  const [deger, setDeger] = useState(null); const [puan, setPuan] = useState(0); const [mesaj, setMesaj] = useState(null);
  const tur = gorev.turlar[ti];
  const a = useRef(new Animated.Value(0)).current; const anlik = useRef(tur.baslangic);
  useEffect(() => { const id = a.addListener(({ value }) => { anlik.current = tur.baslangic + value * (tur.bitis - tur.baslangic); }); return () => a.removeListener(id); }, [ti]);

  const degerlendir = (v, kendiDurdu) => {
    const ok = kendiDurdu && v >= tur.hedef[0] && v <= tur.hedef[1];
    if (ok) setPuan((p) => p + 1);
    const yuvarla = Math.round(v);
    setMesaj({ iyi: ok, metin: ok ? `✓ ${yuvarla} ${tur.birim}. Tam zamanında!`
      : !kendiDurdu || v >= tur.tehlike ? `✗ ${yuvarla} ${tur.birim}. ${tur.tehlikeMetni}`
      : v < tur.hedef[0] ? `✗ ${yuvarla} ${tur.birim}. ${tur.erkenMetni}` : `✗ ${yuvarla} ${tur.birim}. ${tur.gecMetni}` });
    setDeger(v); setDurum('bitti');
  };
  const basla = () => {
    a.setValue(0); setMesaj(null); setDurum('akiyor');
    Animated.timing(a, { toValue: 1, duration: tur.sure * 1000, easing: Easing.in(Easing.quad), useNativeDriver: false })
      .start(({ finished }) => { if (finished) degerlendir(tur.bitis, false); });
  };
  const durdur = () => { if (durum !== 'akiyor') return; a.stopAnimation(); degerlendir(anlik.current, true); };
  const ileri = () => {
    if (ti < gorev.turlar.length - 1) { setTi(ti + 1); setDurum('hazir'); setMesaj(null); setDeger(null); a.setValue(0); return; }
    const n = gorev.turlar.length; const y = puan === n ? 3 : puan >= Math.ceil(n * 0.6) ? 2 : 1;
    onBitir({ yildiz: y, d1: [`${puan}/${n}`, 'tam zamanında'], d2: [n - puan, 'kaçan'], ipucu: y === 3 ? 'Zamanlaman kusursuz!' : 'Üç yıldız için her turda hedefe dur.', bilgi: gorev.bilgiKarti });
  };
  const yuzde = (v) => ((v - tur.baslangic) / (tur.bitis - tur.baslangic)) * 100;
  const boy = a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const renk = a.interpolate({ inputRange: [0, (tur.hedef[0] - tur.baslangic) / (tur.bitis - tur.baslangic), (tur.tehlike - tur.baslangic) / (tur.bitis - tur.baslangic), 1], outputRange: ['#5f8fb0', t.vurgu, R.kirmizi, '#7a1f12'] });
  return (
    <Ekran alt={durum === 'hazir' ? <Dugme yazi={dt('Başlat')} onPress={basla} /> : durum === 'bitti' ? <Dugme yazi={ti === gorev.turlar.length - 1 ? dt('Sonucu gör') : dt('Sonraki tur')} onPress={ileri} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`Tur ${ti + 1}/${gorev.turlar.length}`} onKapat={onKapat} ilerleme={ti / gorev.turlar.length} />
      {ti === 0 && durum === 'hazir' ? <Text style={{ color: R.soluk, marginBottom: 12, lineHeight: 20 }}>{gorev.aciklama}</Text> : null}
      <Kart style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: t.ana }}>{tur.ad}</Text>
        <Text style={{ color: R.soluk, marginTop: 4 }}>{tur.not}</Text>
        <Text style={{ marginTop: 8, fontWeight: '800', color: R.yesil }}>Hedef: {tur.hedef[0]}–{tur.hedef[1]} {tur.birim}</Text>
      </Kart>
      <View style={{ flexDirection: 'row', height: 300, marginBottom: 16 }}>
        <View style={{ width: 70, borderRadius: 35, backgroundColor: '#fff', borderWidth: 2, borderColor: R.cizgi, overflow: 'hidden', justifyContent: 'flex-end' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: `${yuzde(tur.hedef[0])}%`, height: `${yuzde(tur.hedef[1]) - yuzde(tur.hedef[0])}%`, backgroundColor: R.yesilAcik, borderTopWidth: 2, borderBottomWidth: 2, borderColor: R.yesil }} />
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: `${yuzde(tur.tehlike)}%`, height: 2, backgroundColor: R.kirmizi }} />
          <Animated.View style={{ height: boy, backgroundColor: renk, opacity: 0.85 }} />
        </View>
        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
          <Text style={{ color: R.yesil, fontWeight: '800' }}>▬ hedef aralık</Text>
          <Text style={{ color: R.kirmizi, fontWeight: '800', marginTop: 4 }}>▬ tehlike: {tur.tehlike} {tur.birim}</Text>
          {deger != null ? <Text style={{ fontSize: 40, fontWeight: '900', color: R.yazi, marginTop: 18 }}>{Math.round(deger)} {tur.birim}</Text> : null}
          {durum === 'akiyor' ? (
            <Pressable onPress={durdur} style={{ marginTop: 20, height: 120, borderRadius: 60, backgroundColor: R.kirmizi, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>DURDUR</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {mesaj ? <Aciklama iyi={mesaj.iyi} metin={mesaj.metin} /> : null}
    </Ekran>
  );
}
