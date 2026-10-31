// Adımları doğru sırayla yap. Görevde "sahne" varsa her doğru adımda animasyon oynar ve usta tepki verir.
import { t as dt } from '../dil';
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Aciklama, Kart, Giris, Konusma, R, useTema } from '../ui';
import { karistir } from '../motor/kurallar';
import { SAHNELER } from '../sahneler';
import { ses, titret } from '../motor/his';

const OVGU = ['Güzel!', 'Aynen böyle.', 'Eline sağlık.', 'Tam usta işi.', 'Devam!'];

export default function Siralama({ gorev, paket, onBitir, onKapat }) {
  const t = useTema(); const p = gorev.puanlama;
  const Sahne = gorev.sahne ? SAHNELER[gorev.sahne] : null;
  const sahneRef = useRef(null);
  const karisik = useMemo(() => karistir(gorev.adimlar), [gorev]);
  const [sira, setSira] = useState(0); const [hata, setHata] = useState(0); const [mesaj, setMesaj] = useState(null);
  const [kilit, setKilit] = useState(false);
  const bitti = sira >= gorev.adimlar.length;
  const ustaAdi = paket?.meslek?.metinler?.karakter?.usta || 'Usta';

  const sec = async (a) => {
    if (bitti || kilit) return; const beklenen = gorev.adimlar[sira];
    if (a.id === beklenen.id) {
      titret('orta'); setKilit(true);
      setMesaj({ iyi: true, metin: (Sahne ? OVGU[sira % OVGU.length] + ' ' : '✓ ') + a.neden });
      if (Sahne && sahneRef.current) { try { await sahneRef.current.oynat(a.animasyon || a.id); } catch (e) {} }
      if (sira + 1 >= gorev.adimlar.length) { ses('dogru'); titret('basari'); } else ses('dogru');
      setSira(sira + 1); setKilit(false);
    } else {
      ses('yanlis'); titret('hata'); setHata(hata + 1);
      setMesaj({ iyi: false, metin: (Sahne ? 'Dur, henüz değil. ' : '✗ Henüz değil. ') + 'İpucu: ' + beklenen.ipucu });
    }
  };
  const bitir = () => {
    const y = hata <= p.ucYildizMaxHata ? 3 : hata <= p.ikiYildizMaxHata ? 2 : 1;
    onBitir({ yildiz: y, d1: [gorev.adimlar.length, 'adım'], d2: [hata, 'hata'], ipucu: y === 3 ? 'Hatasız! Ustalar böyle çalışır.' : 'Üç yıldız için hiç hata yapmadan sırala.', bilgi: gorev.bilgiKarti });
  };
  const yapilan = gorev.adimlar.slice(0, sira);
  return (
    <Ekran alt={bitti ? <Dugme yazi={dt('Sonucu gör')} onPress={bitir} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`${sira}/${gorev.adimlar.length}`} onKapat={onKapat} ilerleme={sira / gorev.adimlar.length} />
      {Sahne ? <Sahne ref={sahneRef} /> : null}
      {Sahne ? (
        <Konusma kim="usta" ruh={!mesaj ? 'notr' : mesaj.iyi ? 'mutlu' : 'kizgin'} ad={ustaAdi} metin={mesaj ? mesaj.metin : gorev.aciklama} />
      ) : <>
        <Text style={{ fontSize: 16, color: R.yazi, lineHeight: 22, marginBottom: 12 }}>{gorev.aciklama}</Text>
        {yapilan.length ? <Kart style={{ marginBottom: 12 }}>
          {yapilan.map((a, j) => <Giris key={a.id}><Text style={{ fontSize: 15, color: R.yesil, marginBottom: 4 }}>{j + 1}. {a.ikon} {a.metin}</Text></Giris>)}
        </Kart> : null}
        {mesaj ? <Aciklama iyi={mesaj.iyi} metin={mesaj.metin} /> : null}
      </>}
      {!bitti ? <Text style={{ color: R.soluk, fontWeight: '800', marginBottom: 8 }}>{kilit ? 'İZLE…' : `${sira + 1}. ADIM HANGİSİ?`}</Text> : null}
      {karisik.filter((a) => !yapilan.includes(a)).map((a) => (
        <Pressable key={a.id} disabled={kilit} onPress={() => sec(a)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: R.cizgi, borderRadius: 14, padding: 12, marginBottom: 10, opacity: kilit ? 0.5 : 1 }}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: t.vurgu + '33', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 22 }}>{a.ikon}</Text></View>
          <Text style={{ flex: 1, fontSize: 15, color: R.yazi, lineHeight: 21 }}>{a.metin}</Text>
        </Pressable>
      ))}
    </Ekran>
  );
}
