// Genel şablon: her öğeyi doğru kategoriye koy (depolama, görev dağıtımı, alet türü...)
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Aciklama, Kart, Giris, R, useTema } from '../ui';
import { karistir } from '../motor/kurallar';
import { ses, titret } from '../motor/his';

export default function Siniflandirma({ gorev, onBitir, onKapat }) {
  const t = useTema();
  const ogeler = useMemo(() => karistir(gorev.ogeler), [gorev]);
  const [i, setI] = useState(0); const [secim, setSecim] = useState(null); const [hata, setHata] = useState(0);
  const o = ogeler[i]; const cevaplandi = secim != null; const ok = secim === o?.kategori;
  const kat = (id) => gorev.kategoriler.find((k) => k.id === id);
  const sec = (id) => { if (cevaplandi) return; setSecim(id); if (id !== o.kategori) { setHata(hata + 1); ses('yanlis'); titret('hata'); } else { ses('dogru'); titret('orta'); } };
  const devam = () => {
    if (i < ogeler.length - 1) { setI(i + 1); setSecim(null); return; }
    const y = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
    onBitir({ yildiz: y, d1: [`${ogeler.length - hata}/${ogeler.length}`, 'doğru'], d2: [hata, 'hata'], ipucu: y === 3 ? 'Hepsi yerli yerinde!' : 'Üç yıldız için hiç hata yapma.', bilgi: gorev.bilgiKarti });
  };
  return (
    <Ekran alt={cevaplandi ? <Dugme yazi={i === ogeler.length - 1 ? 'Sonucu gör' : 'Sıradaki'} onPress={devam} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`${i + 1}/${ogeler.length}`} onKapat={onKapat} ilerleme={i / ogeler.length} />
      {i === 0 && !cevaplandi ? <Text style={{ fontSize: 15, color: R.soluk, marginBottom: 12, lineHeight: 21 }}>{gorev.aciklama}</Text> : null}
      <Giris key={i}>
        <Kart style={{ alignItems: 'center', paddingVertical: 26, marginBottom: 16 }}>
          <Text style={{ fontSize: 60 }}>{o.ikon}</Text>
          <Text style={{ fontSize: 21, fontWeight: '900', color: t.ana, marginTop: 8, textAlign: 'center' }}>{o.ad}</Text>
        </Kart>
      </Giris>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {gorev.kategoriler.map((k) => {
          const d = !cevaplandi ? null : k.id === o.kategori ? 'dogru' : k.id === secim ? 'yanlis' : 'soluk';
          return (
            <Pressable key={k.id} onPress={() => sec(k.id)} style={{ width: '48.5%', marginBottom: 10, borderRadius: 16, borderWidth: 2, padding: 12, alignItems: 'center',
              borderColor: d === 'dogru' ? R.yesil : d === 'yanlis' ? R.kirmizi : R.cizgi, backgroundColor: d === 'dogru' ? R.yesilAcik : d === 'yanlis' ? R.kirmiziAcik : '#fff', opacity: d === 'soluk' ? 0.5 : 1 }}>
              <Text style={{ fontSize: 28 }}>{k.ikon}</Text>
              <Text style={{ fontWeight: '800', color: R.yazi, marginTop: 4, textAlign: 'center' }}>{k.ad}</Text>
              {k.not ? <Text style={{ fontSize: 12, color: R.soluk, textAlign: 'center' }}>{k.not}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      {cevaplandi ? <Aciklama iyi={ok} metin={(ok ? '✓ ' : '✗ Doğrusu: ' + kat(o.kategori).ad + '. ') + o.aciklama} /> : null}
    </Ekran>
  );
}
