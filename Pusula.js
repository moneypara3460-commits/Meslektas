// Meslek Pusulası ekranları: tanıtım → 30 soru → sonuç.
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ekran, Ust, Dugme, Kart, Cubuk, Giris, R, st } from './ui';
import { SORULAR, CEVAPLAR, TIPLER, puanla, analiz, pusulaYaz } from './motor/pusula';
import { MESLEKLER, meslekBul } from './icerik';
import { ses, titret } from './motor/his';

const ANA = '#1f3a5f'; const VURGU = '#e0a030';
const NOT = 'Bu test ilgi alanlarını gösterir; bilimsel bir tanı veya kariyer danışmanlığı yerine geçmez.';

export function Pusula({ kayit, onGeri, onMeslek }) {
  const [asama, setAsama] = useState(kayit ? 'sonuc' : 'giris');
  const [puanlar, setPuanlar] = useState(kayit?.puanlar || null);
  if (asama === 'giris') return <Tanitim onBasla={() => setAsama('test')} onGeri={onGeri} />;
  if (asama === 'test') return <Test onGeri={() => setAsama(puanlar ? 'sonuc' : 'giris')}
    onBitti={async (c) => { const p = puanla(c); await pusulaYaz(p); setPuanlar(p); ses('basari'); titret('basari'); setAsama('sonuc'); }} />;
  return <Sonuc puanlar={puanlar} onGeri={onGeri} onMeslek={onMeslek} onTekrar={() => setAsama('test')} />;
}

function Tanitim({ onBasla, onGeri }) {
  return (
    <Ekran alt={<Dugme yazi="Teste başla" onPress={onBasla} />}>
      <Ust baslik="Meslek Pusulası" onKapat={onGeri} />
      <Giris><View style={{ alignItems: 'center', marginVertical: 18 }}><Text style={{ fontSize: 72 }}>🧭</Text></View></Giris>
      <Giris gecikme={80}><Text style={[st.baslik, { textAlign: 'center' }]}>Sana hangi meslek yakışır?</Text></Giris>
      <Giris gecikme={160}><Text style={[st.alt, { textAlign: 'center', marginTop: 8, marginBottom: 20 }]}>
        30 kısa cümle, yaklaşık 4 dakika. Her cümle için sana ne kadar uyduğunu seç. Doğru ya da yanlış cevap yok; ilk aklına geleni seç.</Text></Giris>
      <Giris gecikme={240}><Kart>
        {[['30', 'soru'], ['6', 'ilgi tipi'], ['4 dk', 'süre']].map(([a, b]) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
            <Text style={{ width: 60, fontSize: 20, fontWeight: '900', color: ANA }}>{a}</Text><Text style={{ color: R.yazi, fontSize: 15 }}>{b}</Text></View>))}
      </Kart></Giris>
      <Text style={{ color: R.soluk, fontSize: 12, textAlign: 'center', marginTop: 16 }}>{NOT}</Text>
    </Ekran>
  );
}

function Test({ onBitti, onGeri }) {
  const [i, setI] = useState(0); const [cevaplar, setCevaplar] = useState([]);
  const kay = useRef(new Animated.Value(1)).current;
  const gec = (yeni) => { kay.setValue(0); Animated.timing(kay, { toValue: 1, duration: 260, useNativeDriver: true }).start(); setI(yeni); };
  const sec = (d) => {
    ses('tik'); titret('hafif');
    const c = [...cevaplar]; c[i] = d; setCevaplar(c);
    if (i + 1 >= SORULAR.length) onBitti(c); else setTimeout(() => gec(i + 1), 140);
  };
  const s = SORULAR[i];
  return (
    <Ekran>
      <Ust baslik="Meslek Pusulası" sayac={`${i + 1}/${SORULAR.length}`} ilerleme={i / SORULAR.length} onKapat={onGeri} />
      <Animated.View style={{ opacity: kay, transform: [{ translateX: kay.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
        <Kart style={{ paddingVertical: 26, marginTop: 10, marginBottom: 22 }}>
          <Text style={{ fontSize: 21, lineHeight: 29, fontWeight: '700', color: R.yazi, textAlign: 'center' }}>{s.metin}</Text>
        </Kart>
        {CEVAPLAR.map((c) => {
          const secili = cevaplar[i] === c.deger;
          return (
            <Pressable key={c.deger} onPress={() => sec(c.deger)}
              style={[st.secenek, { flexDirection: 'row', alignItems: 'center', backgroundColor: secili ? '#fdf3dc' : '#fff', borderColor: secili ? VURGU : R.cizgi }]}>
              <View style={{ flexDirection: 'row', marginRight: 12 }}>
                {[1, 2, 3, 4, 5].map((n) => <View key={n} style={{ width: 7, height: 7 + n * 3, marginRight: 2, borderRadius: 2, alignSelf: 'flex-end',
                  backgroundColor: n <= c.deger ? ANA : R.cizgi }} />)}
              </View>
              <Text style={{ fontSize: 16, color: R.yazi, fontWeight: secili ? '800' : '500' }}>{c.yazi}</Text>
            </Pressable>
          );
        })}
      </Animated.View>
      {i > 0 ? <Pressable onPress={() => gec(i - 1)} hitSlop={10}><Text style={{ color: R.soluk, textAlign: 'center', fontWeight: '700', marginTop: 12, paddingVertical: 8 }}>← Önceki soru</Text></Pressable> : null}
    </Ekran>
  );
}

function Sonuc({ puanlar, onGeri, onMeslek, onTekrar }) {
  const a = analiz(puanlar, MESLEKLER.map((p) => p.meslek.id));
  const [t1, t2] = a.kod; const ilk = a.meslekler[0]; const paket = ilk && meslekBul(ilk.id);
  const renk = paket?.meslek.renkler || { ana: ANA, vurgu: VURGU };
  return (
    <Ekran alt={paket ? <Dugme yazi={`${paket.meslek.ad} ile başla →`} onPress={() => onMeslek(paket)} /> : null}>
      <Ust baslik="Pusulan hazır" onKapat={onGeri} />
      <Giris><Text style={{ color: R.soluk, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>SENİN İLGİ TİPİN</Text>
        <Text style={[st.baslik, { marginTop: 4 }]}>{TIPLER[t1].ad} – {TIPLER[t2].ad}</Text>
        <Text style={[st.alt, { marginTop: 6 }]}>{TIPLER[t1].tanim} {TIPLER[t2].tanim}</Text></Giris>
      {a.dengeli ? <View style={[st.aciklama, { backgroundColor: '#fdf3dc', borderColor: VURGU }]}>
        <Text style={{ color: R.yazi, fontSize: 14 }}>Cevapların birbirine çok yakın çıktı, bu yüzden sonuç net değil. Testi daha kararlı cevaplarla yeniden çözebilirsin.</Text></View> : null}

      {paket ? <Giris gecikme={120}>
        <View style={{ borderRadius: 22, backgroundColor: renk.ana, padding: 18, marginTop: 18 }}>
          <Text style={{ color: renk.vurgu, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>SANA EN YAKIŞAN MESLEK</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', flex: 1 }}>{paket.meslek.ad}</Text>
            <Text style={{ fontSize: 44 }}>{paket.kademeler[1]?.rozet?.ikon || '⭐'}</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 6 }}>%{ilk.uyum} uyum</Text>
          <Cubuk oran={ilk.uyum / 100} renk={renk.vurgu} style={{ marginTop: 6 }} />
        </View>
      </Giris> : null}

      {a.meslekler.length > 1 ? <Giris gecikme={200}><Kart style={{ marginTop: 14 }}>
        <Text style={{ fontWeight: '800', color: R.yazi, marginBottom: 8 }}>Diğer mesleklerle uyumun</Text>
        {a.meslekler.slice(1).map((m) => { const p = meslekBul(m.id); return (
          <Pressable key={m.id} onPress={() => onMeslek(p)} style={{ marginVertical: 6 }}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={{ flex: 1, color: R.yazi, fontWeight: '700' }}>{p.meslek.ad}</Text>
              <Text style={{ color: R.soluk, fontWeight: '700' }}>%{m.uyum}</Text></View>
            <Cubuk oran={m.uyum / 100} renk={p.meslek.renkler?.ana || ANA} yukseklik={6} />
          </Pressable>); })}
      </Kart></Giris> : null}

      <Giris gecikme={280}><Kart style={{ marginTop: 14 }}>
        <Text style={{ fontWeight: '800', color: R.yazi, marginBottom: 8 }}>İlgi haritan</Text>
        {a.sirali.map((k) => (
          <View key={k} style={{ marginVertical: 5 }}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ flex: 1, color: R.yazi, fontWeight: '700' }}>{TIPLER[k].ad} <Text style={{ color: R.soluk, fontWeight: '500' }}>· {TIPLER[k].lakap}</Text></Text>
              <Text style={{ color: R.soluk, fontWeight: '700' }}>{puanlar[k]}</Text></View>
            <Cubuk oran={puanlar[k] / 100} renk={TIPLER[k].renk} yukseklik={6} />
          </View>))}
      </Kart></Giris>

      <Giris gecikme={360}><Kart style={{ marginTop: 14 }}>
        <Text style={{ fontWeight: '800', color: R.yazi, marginBottom: 6 }}>Sana uygun olabilecek diğer meslekler</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {a.yakinda.map((m) => <View key={m} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: R.cizgi, marginRight: 6, marginBottom: 6 }}>
            <Text style={{ color: R.yazi, fontSize: 13 }}>{m}</Text></View>)}
        </View>
        <Text style={{ color: R.soluk, fontSize: 12, marginTop: 4 }}>Bu meslekler yakında oyuna eklenecek.</Text>
      </Kart></Giris>

      <Pressable onPress={onTekrar} hitSlop={10}><Text style={{ color: ANA, textAlign: 'center', fontWeight: '800', marginTop: 18 }}>↻ Testi yeniden çöz</Text></Pressable>
      <Text style={{ color: R.soluk, fontSize: 12, textAlign: 'center', marginTop: 12 }}>{NOT}</Text>
    </Ekran>
  );
}
