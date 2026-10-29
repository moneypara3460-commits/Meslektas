import React, { useState } from 'react';
import { Ekran, Ust, Secenek, Aciklama, Konusma } from '../ui';
import { ses, titret } from '../motor/his';

export default function Uyum({ gorev, paket, onBitir, onKapat }) {
  const [i, setI] = useState(0); const [puan, setPuan] = useState(0); const [secim, setSecim] = useState(null);
  const s = gorev.sorular[i]; const max = gorev.sorular.length * 2;
  const sec = (o, j) => {
    if (secim != null) return; setSecim(j); ses('tik'); titret(); const p = puan + o[1];
    setTimeout(() => {
      if (i < gorev.sorular.length - 1) { setPuan(p); setI(i + 1); setSecim(null); return; }
      const r = gorev.sonuclar.find((x) => p >= x.min) || gorev.sonuclar[gorev.sonuclar.length - 1];
      onBitir({ yildiz: 3, ust: 'SONUCUN', baslik: r.baslik, d1: [`${p}/${max}`, 'uyum puanı'], d2: ['✓', 'tamam'], ipucu: r.metin });
    }, 420);
  };
  return (
    <Ekran>
      <Ust baslik={gorev.baslik} sayac={`${i + 1}/${gorev.sorular.length}`} onKapat={onKapat} ilerleme={i / gorev.sorular.length} />
      {i === 0 ? <Aciklama iyi metin={gorev.aciklama} /> : null}
      <Konusma kim="usta" ruh="mutlu" ad={paket.meslek.metinler?.karakter?.usta} metin={s.soru} />
      {s.secenekler.map((o, j) => <Secenek key={i + '-' + j} yazi={o[0]} durum={secim === j ? 'dogru' : null} onPress={() => sec(o, j)} />)}
    </Ekran>
  );
}
