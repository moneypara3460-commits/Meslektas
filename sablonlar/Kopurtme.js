// Barista'ya özel: süt köpürtme. Buhar düğmesini basılı tut; uç yüzeydeyse hava (köpük), içerdeyse girdap (ısınma).
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ekran, Ust, Dugme, Aciklama, Kart, Cubuk, R, useTema } from '../ui';

export default function Kopurtme({ gorev, onBitir, onKapat }) {
  const t = useTema();
  const [si, setSi] = useState(0); const sip = gorev.siparisler[si];
  const [isi, setIsi] = useState(5); const [kopuk, setKopuk] = useState(0); const [uc, setUc] = useState('yuzey');
  const [basili, setBasili] = useState(false); const [bitti, setBitti] = useState(null); const [puan, setPuan] = useState(0);
  const durumRef = useRef({}); durumRef.current = { uc, isi };
  useEffect(() => {
    if (!basili || bitti) return;
    const id = setInterval(() => {
      const { uc: u, isi: s } = durumRef.current;
      setIsi((x) => Math.min(80, x + (u === 'yuzey' ? 0.9 : 1.3)));
      if (u === 'yuzey' && s < gorev.havaSiniri) setKopuk((k) => Math.min(70, k + 1.6));
    }, 100);
    return () => clearInterval(id);
  }, [basili, bitti]);
  const bitir = () => {
    const sicakOk = isi >= gorev.sicaklik[0] && isi <= gorev.sicaklik[1]; const kopukOk = kopuk >= sip.kopuk[0] && kopuk <= sip.kopuk[1];
    const p = (sicakOk ? 1 : 0) + (kopukOk ? 1 : 0); setPuan(puan + p);
    setBitti({ iyi: p === 2, metin: `${p === 2 ? '✓' : '✗'} ${Math.round(isi)} °C${isi > gorev.yanma ? ' (süt yandı!)' : sicakOk ? ' ✓' : ''} · köpük %${Math.round(kopuk)}${kopukOk ? ' ✓' : ` (${sip.not} gerekiyordu)`}` });
  };
  const ileri = () => {
    if (si < gorev.siparisler.length - 1) { setSi(si + 1); setIsi(5); setKopuk(0); setUc('yuzey'); setBitti(null); return; }
    const max = gorev.siparisler.length * 2; const y = puan === max ? 3 : puan >= max * 0.6 ? 2 : 1;
    onBitir({ yildiz: y, d1: [`${puan}/${max}`, 'doğru'], d2: [gorev.siparisler.length, 'sipariş'], ipucu: 'Önce hava, sonra girdap.', bilgi: gorev.bilgiKarti });
  };
  return (
    <Ekran alt={bitti ? <Dugme yazi={si === gorev.siparisler.length - 1 ? 'Sonucu gör' : 'Sonraki sipariş'} onPress={ileri} /> : <Dugme yazi="Buharı kapat ve servis et" onPress={bitir} kapali={isi < 20} />}>
      <Ust baslik={gorev.baslik} sayac={`${si + 1}/${gorev.siparisler.length}`} onKapat={onKapat} ilerleme={si / gorev.siparisler.length} />
      <Kart style={{ marginBottom: 14 }}><Text style={{ fontSize: 20, fontWeight: '900', color: t.ana }}>☕ {sip.ad}</Text><Text style={{ color: R.soluk }}>{sip.not} · {gorev.sicaklik[0]}–{gorev.sicaklik[1]} °C</Text></Kart>
      <Text style={{ fontWeight: '800', color: R.yazi }}>Sıcaklık: {Math.round(isi)} °C</Text>
      <Cubuk oran={isi / 80} renk={isi > gorev.yanma ? R.kirmizi : isi >= gorev.sicaklik[0] ? R.yesil : '#5f8fb0'} style={{ marginVertical: 8 }} yukseklik={14} />
      <Text style={{ fontWeight: '800', color: R.yazi }}>Köpük: %{Math.round(kopuk)}</Text>
      <Cubuk oran={kopuk / 70} style={{ marginVertical: 8 }} yukseklik={14} />
      <View style={{ flexDirection: 'row', marginVertical: 12 }}>
        {[['yuzey', 'Uç yüzeyde (hava)'], ['icerde', 'Uç içeride (girdap)']].map(([k, y]) => (
          <Pressable key={k} disabled={!!bitti} onPress={() => setUc(k)} style={{ flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: uc === k ? t.ana : R.cizgi, backgroundColor: uc === k ? t.vurgu + '33' : '#fff' }}>
            <Text style={{ textAlign: 'center', fontWeight: '800', color: R.yazi }}>{y}</Text></Pressable>
        ))}
      </View>
      {!bitti ? <Pressable onPressIn={() => setBasili(true)} onPressOut={() => setBasili(false)} style={{ height: 110, borderRadius: 55, backgroundColor: basili ? R.kirmizi : t.ana, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{basili ? 'Ffffsss…' : 'BUHAR (basılı tut)'}</Text></Pressable> : <Aciklama iyi={bitti.iyi} metin={bitti.metin} />}
    </Ekran>
  );
}
