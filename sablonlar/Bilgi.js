import React, { useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { Ekran, Ust, Dugme, Kart, Giris, R, useTema } from '../ui';
import { Gorsel, gorselVar } from '../gorseller';

export default function Bilgi({ gorev, onBitir, onKapat }) {
  const t = useTema(); const { width } = useWindowDimensions();
  const [i, setI] = useState(0); const [gorulen, setGorulen] = useState({ 0: true });
  const kw = width - 36; const n = gorev.kartlar.length; const tamam = Object.keys(gorulen).length >= n;
  const kaydir = (e) => { const j = Math.max(0, Math.min(n - 1, Math.round(e.nativeEvent.contentOffset.x / kw))); setI(j); setGorulen((g) => ({ ...g, [j]: true })); };
  return (
    <Ekran alt={<Dugme yazi={tamam ? `Bitir (+${gorev.xp} XP)` : `Kartları kaydır (${Object.keys(gorulen).length}/${n})`} kapali={!tamam}
      onPress={() => onBitir({ yildiz: 3, d1: [n, 'kart'], d2: ['✓', 'öğrenildi'], ipucu: 'Bu bilgiler sıradaki görevlerde karşına çıkacak.', tekrarYok: true })} />}>
      <Ust baslik={gorev.baslik} onKapat={onKapat} sayac={`${i + 1}/${n}`} />
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={kaydir} onScrollEndDrag={kaydir} style={{ marginHorizontal: 0 }}>
        {gorev.kartlar.map((c, j) => (
          <View key={j} style={{ width: kw }}>
            <Kart style={{ marginRight: 0, minHeight: 360, justifyContent: 'center' }}>
              <Giris>{gorselVar(c.gorsel)
                ? <View style={{ alignItems: 'center', marginBottom: 12 }}><Gorsel ad={c.gorsel} boyut={Math.min(220, kw - 60)} /></View>
                : <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 12 }}>{c.ikon}</Text>}</Giris>
              <Text style={{ fontSize: 22, fontWeight: '900', color: t.ana, textAlign: 'center', marginBottom: 10 }}>{c.baslik}</Text>
              <Text style={{ fontSize: 17, lineHeight: 25, color: R.yazi, textAlign: 'center' }}>{c.metin}</Text>
              {c.terim ? <View style={{ alignSelf: 'center', marginTop: 16, backgroundColor: t.vurgu + '33', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 }}>
                <Text style={{ color: t.ana, fontWeight: '800' }}>{c.terim}</Text></View> : null}
            </Kart>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
        {gorev.kartlar.map((_, j) => <View key={j} style={{ width: j === i ? 22 : 8, height: 8, borderRadius: 4, marginHorizontal: 3, backgroundColor: j === i ? t.ana : gorulen[j] ? t.vurgu : R.cizgi }} />)}
      </View>
    </Ekran>
  );
}
