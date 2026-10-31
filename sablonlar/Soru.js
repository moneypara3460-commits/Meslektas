// Hem "soru" hem "sinav" şablonu
import { t as dt } from '../dil';
import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Secenek, Aciklama, Konusma, Giris, R } from '../ui';
import { Gorsel, gorselVar } from '../gorseller';
import { karistir, yildizHesap } from '../motor/kurallar';
import { ses, titret } from '../motor/his';

export default function Soru({ gorev, paket, onBitir, onKapat }) {
  const sinav = gorev.sablon === 'sinav';
  const sorular = useMemo(() => karistir(gorev.sorular).map((s) => ({ ...s, sira: karistir(s.secenekler.map((m, j) => ({ m, j }))) })), [gorev]);
  const [i, setI] = useState(0); const [secim, setSecim] = useState(null); const [dogru, setDogru] = useState(0);
  const s = sorular[i]; const ad = paket.meslek.metinler?.karakter?.usta || 'Usta';
  const sec = (j) => { if (secim != null) return; setSecim(j); if (j === s.dogru) { setDogru((d) => d + 1); ses('dogru'); titret('orta'); } else { ses('yanlis'); titret('hata'); } };
  const devam = () => {
    if (i < sorular.length - 1) { setI(i + 1); setSecim(null); return; }
    const n = sorular.length;
    if (sinav) {
      const yuzde = Math.round((dogru / n) * 100); const gecti = yuzde >= gorev.gecmeYuzde;
      onBitir({ sinav: true, gecti, yildiz: gecti ? 3 : 0, d1: ['%' + yuzde, 'başarı'], d2: gecti ? [`${dogru}/${n}`, 'doğru'] : ['%' + gorev.gecmeYuzde, 'gerekli'],
        ipucu: gecti ? null : 'Bilgi kartlarına göz atıp tekrar dene. Sınav sınırsız tekrar edilebilir.' });
    } else {
      const y = yildizHesap(dogru, n);
      onBitir({ yildiz: y, d1: [`${dogru}/${n}`, 'doğru'], d2: [n - dogru, 'yanlış'], ipucu: y === 3 ? 'Hepsi doğru, harika!' : 'Üç yıldız için hepsini doğru bil.', bilgi: gorev.bilgiKarti });
    }
  };
  const cevaplandi = secim != null; const ok = secim === s.dogru;
  return (
    <Ekran alt={cevaplandi ? <Dugme yazi={i === sorular.length - 1 ? dt('Sonucu gör') : dt('Devam')} onPress={devam} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`${i + 1}/${sorular.length}`} onKapat={onKapat} ilerleme={i / sorular.length} />
      <Konusma kim="usta" ruh={!cevaplandi ? 'notr' : ok ? 'mutlu' : 'kizgin'} ad={ad} metin={s.soru} />
      {gorselVar(s.gorsel) ? <Giris key={'g' + i} style={{ alignItems: 'center', marginBottom: 14 }}><Gorsel ad={s.gorsel} boyut={200} /></Giris> : null}
      {s.secenekGorselleri ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {s.sira.map(({ j }) => {
            const d = !cevaplandi ? null : j === s.dogru ? 'dogru' : j === secim ? 'yanlis' : 'soluk';
            return (
              <Pressable key={i + '-' + j} disabled={cevaplandi} onPress={() => sec(j)} style={{ width: '48.5%', marginBottom: 10, borderRadius: 16, borderWidth: 3, alignItems: 'center', padding: 6, backgroundColor: '#fff',
                borderColor: d === 'dogru' ? R.yesil : d === 'yanlis' ? R.kirmizi : R.cizgi, opacity: d === 'soluk' ? 0.5 : 1 }}>
                <Gorsel ad={s.secenekGorselleri[j]} boyut={130} sadeceCizim />
              </Pressable>
            );
          })}
        </View>
      ) : s.sira.map(({ m, j }) => (
        <Secenek key={i + '-' + j} yazi={m} kapali={cevaplandi} onPress={() => sec(j)}
          durum={!cevaplandi ? null : j === s.dogru ? 'dogru' : j === secim ? 'yanlis' : 'soluk'} />
      ))}
      {cevaplandi ? <Aciklama iyi={ok} metin={(ok ? '✓ Doğru. ' : '✗ Doğrusu: ' + s.secenekler[s.dogru] + '. ') + s.aciklama} /> : null}
    </Ekran>
  );
}
