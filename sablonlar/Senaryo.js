import React, { useMemo, useState } from 'react';
import { Ekran, Ust, Dugme, Secenek, Aciklama, Konusma } from '../ui';
import { karistir, yildizHesap } from '../motor/kurallar';

export default function Senaryo({ gorev, paket, onBitir, onKapat }) {
  const m = paket.meslek.metinler || {}; const adlar = m.karakter || { usta: 'Usta', musteri: 'Müşteri' };
  const adimlar = useMemo(() => gorev.adimlar.map((a) => ({ ...a, sira: karistir(a.secenekler) })), [gorev]);
  const [i, setI] = useState(-1); const [secim, setSecim] = useState(null); const [dogru, setDogru] = useState(0);
  if (i < 0) {
    return (
      <Ekran alt={<Dugme yazi={m.senaryoBasla || 'Başla'} onPress={() => setI(0)} />}>
        <Ust baslik={gorev.baslik} onKapat={onKapat} ilerleme={0} />
        <Konusma kim="usta" ruh="mutlu" ad={adlar.usta} metin={gorev.giris} />
      </Ekran>
    );
  }
  const a = adimlar[i]; const cevaplandi = secim != null; const ok = cevaplandi && secim.dogru;
  const sec = (o) => { if (cevaplandi) return; setSecim(o); if (o.dogru) setDogru((d) => d + 1); };
  const devam = () => {
    if (i < adimlar.length - 1) { setI(i + 1); setSecim(null); return; }
    const n = adimlar.length; const y = yildizHesap(dogru, n);
    onBitir({ yildiz: y, d1: [`${dogru}/${n}`, 'doğru karar'], d2: [n - dogru, 'hatalı karar'], ipucu: y === 3 ? (m.ucYildiz || 'Kusursuz!') : 'Üç yıldız için her kararı doğru ver.', bilgi: gorev.bilgiKarti });
  };
  return (
    <Ekran alt={cevaplandi ? <Dugme yazi={i === adimlar.length - 1 ? (m.senaryoBitir || 'Bitir') : 'Devam'} onPress={devam} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`${i + 1}/${adimlar.length}`} onKapat={onKapat} ilerleme={i / adimlar.length} />
      <Konusma kim={a.kim} ruh={!cevaplandi ? a.ruh : ok ? 'mutlu' : 'kizgin'} ad={adlar[a.kim]} metin={a.metin} />
      {a.sira.map((o, j) => (
        <Secenek key={i + '-' + j} yazi={o.metin} kapali={cevaplandi} onPress={() => sec(o)}
          durum={!cevaplandi ? null : o.dogru ? 'dogru' : o === secim ? 'yanlis' : 'soluk'} />
      ))}
      {cevaplandi ? <Aciklama iyi={ok} metin={(ok ? '✓ ' : '✗ ') + secim.aciklama} /> : null}
    </Ekran>
  );
}
