// Adımları doğru sırayla yap. Yanlış adımda ipucu çıkar; doğru adımda nedeni öğrenilir.
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Aciklama, Kart, Giris, R, useTema } from '../ui';
import { karistir } from '../motor/kurallar';

export default function Siralama({ gorev, onBitir, onKapat }) {
  const t = useTema(); const p = gorev.puanlama;
  const karisik = useMemo(() => karistir(gorev.adimlar), [gorev]);
  const [sira, setSira] = useState(0); const [hata, setHata] = useState(0); const [mesaj, setMesaj] = useState(null);
  const bitti = sira >= gorev.adimlar.length;
  const sec = (a) => {
    if (bitti) return; const beklenen = gorev.adimlar[sira];
    if (a.id === beklenen.id) { setSira(sira + 1); setMesaj({ iyi: true, metin: '✓ ' + a.neden }); }
    else { setHata(hata + 1); setMesaj({ iyi: false, metin: '✗ Henüz değil. İpucu: ' + beklenen.ipucu }); }
  };
  const bitir = () => {
    const y = hata <= p.ucYildizMaxHata ? 3 : hata <= p.ikiYildizMaxHata ? 2 : 1;
    onBitir({ yildiz: y, d1: [gorev.adimlar.length, 'adım'], d2: [hata, 'hata'], ipucu: y === 3 ? 'Hatasız! Ustalar böyle çalışır.' : 'Üç yıldız için hiç hata yapmadan sırala.', bilgi: gorev.bilgiKarti });
  };
  const yapilan = gorev.adimlar.slice(0, sira);
  return (
    <Ekran alt={bitti ? <Dugme yazi="Sonucu gör" onPress={bitir} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`${sira}/${gorev.adimlar.length}`} onKapat={onKapat} ilerleme={sira / gorev.adimlar.length} />
      <Text style={{ fontSize: 16, color: R.yazi, lineHeight: 22, marginBottom: 12 }}>{gorev.aciklama}</Text>
      {yapilan.length ? <Kart style={{ marginBottom: 12 }}>
        {yapilan.map((a, j) => <Giris key={a.id}><Text style={{ fontSize: 15, color: R.yesil, marginBottom: 4 }}>{j + 1}. {a.ikon} {a.metin}</Text></Giris>)}
      </Kart> : null}
      {mesaj ? <Aciklama iyi={mesaj.iyi} metin={mesaj.metin} /> : null}
      {!bitti ? <Text style={{ color: R.soluk, fontWeight: '800', marginBottom: 8 }}>{sira + 1}. ADIM HANGİSİ?</Text> : null}
      {karisik.filter((a) => !yapilan.includes(a)).map((a) => (
        <Pressable key={a.id} onPress={() => sec(a)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: R.cizgi, borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: t.vurgu + '33', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 22 }}>{a.ikon}</Text></View>
          <Text style={{ flex: 1, fontSize: 15, color: R.yazi, lineHeight: 21 }}>{a.metin}</Text>
        </Pressable>
      ))}
    </Ekran>
  );
}
