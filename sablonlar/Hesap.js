// Maliyet hesabı ve fiyat belirleme
import { t as dt } from '../dil';
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Secenek, Aciklama, Kart, Cubuk, R, useTema } from '../ui';
import { karistir } from '../motor/kurallar';

const tl = (x) => x.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';

export default function Hesap({ gorev, onBitir, onKapat }) {
  const t = useTema();
  const [ui, setUi] = useState(0); const [puan, setPuan] = useState(0);
  const [adim, setAdim] = useState(1); const [secim, setSecim] = useState(null); const [sonuc, setSonuc] = useState(null);
  const u = gorev.urunler[ui];
  const toplam = useMemo(() => Math.round(u.kalemler.reduce((a, k) => a + k[1], 0) * 100) / 100, [ui]);
  const secenekler = useMemo(() => karistir([toplam, toplam * 0.6, toplam * 1.5, toplam + 20].map((x, j) => ({ v: Math.round(x * 10) / 10, j }))), [ui]);
  const [fiyat, setFiyat] = useState(Math.round((toplam * 2) / 5) * 5 + 5);
  const oran = (toplam / fiyat) * 100; const iyi = oran >= gorev.hedefOran[0] && oran <= gorev.hedefOran[1];

  const toplamSec = (o) => { if (secim) return; setSecim(o); if (o.j === 0) setPuan((p) => p + 1); setTimeout(() => setAdim(2), 1100); };
  const onayla = () => {
    if (iyi) setPuan((p) => p + 1);
    setSonuc(iyi ? `✓ ${fiyat} TL iyi bir fiyat: malzeme %${oran.toFixed(0)}, kalan ${tl(fiyat - toplam)} kira, personel, enerji ve kâra gider.`
      : oran > gorev.hedefOran[1] ? `✗ Fiyat düşük: malzeme %${oran.toFixed(0)}. Diğer giderlere yeterli para kalmaz.` : `✗ Fiyat yüksek: malzeme %${oran.toFixed(0)}. Müşteri pahalı bulup rakibe gidebilir.`);
    setAdim(3);
  };
  const ileri = () => {
    if (ui < gorev.urunler.length - 1) {
      const sonraki = gorev.urunler[ui + 1]; const tp = sonraki.kalemler.reduce((a, k) => a + k[1], 0);
      setUi(ui + 1); setAdim(1); setSecim(null); setSonuc(null); setFiyat(Math.round((tp * 2) / 5) * 5 + 5); return;
    }
    const max = gorev.urunler.length * 2; const y = puan === max ? 3 : puan >= max * 0.6 ? 2 : 1;
    onBitir({ yildiz: y, d1: [`${puan}/${max}`, 'doğru karar'], d2: [gorev.urunler.length, 'ürün'], ipucu: gorev.kural, bilgi: gorev.bilgiKarti });
  };
  return (
    <Ekran alt={adim === 2 ? <Dugme yazi={dt('Bu fiyatı onayla')} onPress={onayla} /> : adim === 3 ? <Dugme yazi={ui === gorev.urunler.length - 1 ? dt('Sonucu gör') : dt('Sonraki ürün')} onPress={ileri} /> : null}>
      <Ust baslik={gorev.baslik} sayac={`Ürün ${ui + 1}/${gorev.urunler.length}`} onKapat={onKapat} ilerleme={ui / gorev.urunler.length} />
      {ui === 0 && adim === 1 ? <Text style={{ color: R.soluk, marginBottom: 12, lineHeight: 20 }}>{gorev.aciklama}</Text> : null}
      <Kart style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: t.ana, marginBottom: 10 }}>{u.ikon} {u.ad}</Text>
        {u.kalemler.map((k, j) => (
          <View key={j} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderColor: R.cizgi }}>
            <Text style={{ flex: 1, color: R.yazi }}>{k[0]}</Text><Text style={{ fontWeight: '700', color: R.yazi }}>{tl(k[1])}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
          <Text style={{ fontWeight: '900', color: R.yazi }}>Malzeme toplamı</Text><Text style={{ fontWeight: '900', color: t.ana }}>{secim ? tl(toplam) : '?'}</Text>
        </View>
      </Kart>
      {adim === 1 ? <>
        <Text style={{ fontWeight: '800', color: R.soluk, marginBottom: 8 }}>MALZEME TOPLAMI KAÇ?</Text>
        {secenekler.map((o) => <Secenek key={o.j} yazi={tl(o.v)} kapali={!!secim} onPress={() => toplamSec(o)} durum={!secim ? null : o.j === 0 ? 'dogru' : o === secim ? 'yanlis' : 'soluk'} />)}
      </> : null}
      {adim === 2 ? <Kart>
        <Text style={{ fontWeight: '800', color: R.soluk, marginBottom: 10 }}>SATIŞ FİYATINI BELİRLE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          {[-5, 5].map((d, k) => k === 0 ? <Pressable key={d} onPress={() => setFiyat(Math.max(5, fiyat + d))} style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: t.ana, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>−</Text></Pressable> : null)}
          <Text style={{ fontSize: 34, fontWeight: '900', color: R.yazi, marginHorizontal: 22, minWidth: 110, textAlign: 'center' }}>{fiyat} TL</Text>
          <Pressable onPress={() => setFiyat(Math.min(1000, fiyat + 5))} style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: t.ana, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>+</Text></Pressable>
        </View>
        <Text style={{ color: iyi ? R.yesil : R.kirmizi, fontWeight: '900', textAlign: 'center', marginBottom: 6 }}>Malzeme oranı: %{oran.toFixed(0)} (hedef %{gorev.hedefOran[0]}–{gorev.hedefOran[1]})</Text>
        <Cubuk oran={Math.min(1, oran / 100)} renk={iyi ? R.yesil : R.kirmizi} />
        <Text style={{ color: R.soluk, marginTop: 8, textAlign: 'center' }}>Diğer giderlere kalan: {tl(fiyat - toplam)}</Text>
      </Kart> : null}
      {sonuc ? <Aciklama iyi={sonuc.startsWith('✓')} metin={sonuc} /> : null}
    </Ekran>
  );
}
