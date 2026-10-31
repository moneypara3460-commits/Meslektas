// Meslektaş — her mesleği aynı motorla oynatan oyun.
// Bir meslek = icerik/ klasöründe bir JSON paketi. Motor paketi okur, şablonlar görevleri oynatır.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, Animated, Easing, BackHandler, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MESLEKLER, icerikDili, ceviriVar } from './icerik';
import { SABLONLAR, SABLON_ETIKET } from './sablonlar';
import { TemaContext, Ekran, Ust, Dugme, Kart, Cubuk, Giris, Karakter, R, st, MARKA, Logo, Gradyan } from './ui';
import { ilerlemeOku, gorevBitti, esitle } from './motor/ilerleme';
import { gorevAcik, kademeAcik, kademeBitti, kademeXp, toplamXp, aktifKademe, maxXp } from './motor/kurallar';
import { supabase } from './motor/supabase';
import { FOTOLAR } from './gorseller';
import { ses, titret } from './motor/his';
import { Linking } from 'react-native';
import { Pusula } from './Pusula';
import { t, dilNe, dilOku, dilYaz, DilContext, DILLER } from './dil';
import { Modal } from 'react-native';
import { pusulaOku, analiz, TIPLER } from './motor/pusula';

const VARSAYILAN_TEMA = { ana: MARKA.lacivert, vurgu: MARKA.mavi2, zemin: MARKA.zemin };
// Her mesleğin simgesi (tanıtım sitesiyle aynı)
const IKON = { barista: '☕', asci: '🍳', servis: '🍽️', mimar: '📐', insaat: '🏗️', freze: '⚙️', kaynak: '🔥', yazilim: '💻', grafik: '🎨', muhasebe: '📊', itfaiye: '🚒', satis: '🛒' };
const ikonu = (p) => IKON[p.meslek.id] || p.kademeler[1]?.rozet?.ikon || '⭐';
const kategori = (p) => { const k = t(p.meslek.kategori); return dilNe() === 'tr' ? k.replace(/i/g, 'İ').toUpperCase() : k.toUpperCase(); };

export default function App() {
  const [ekran, setEkran] = useState({ ad: 'acilis' });
  const [paket, setPaket] = useState(null);
  const [sonuclar, setSonuclar] = useState({});
  const [hepsi, setHepsi] = useState({});
  const [oturum, setOturum] = useState(null);
  const [pusula, setPusula] = useState(null);
  const [dil, setDilDurum] = useState(dilNe());
  const setDil = (d) => { dilYaz(d); icerikDili(d); setDilDurum(d); };

  const tumunuOku = async () => { const h = {}; for (const p of MESLEKLER) h[p.meslek.id] = await ilerlemeOku(p.meslek.id); setHepsi(h); return h; };
  useEffect(() => {
    tumunuOku(); pusulaOku().then(setPusula); dilOku().then((d) => { icerikDili(d); setDilDurum(d); });
    supabase.auth.getSession().then(({ data }) => setOturum(data.session));
    const { data: dinle } = supabase.auth.onAuthStateChange((_e, s) => { setOturum(s); if (s) esitle(MESLEKLER.map((p) => p.meslek.id)).then(tumunuOku); });
    return () => dinle.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const geri = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ekran.ad === 'ana' || ekran.ad === 'acilis') return false;
      setEkran(ekran.ad === 'harita' || ekran.ad === 'hesap' || ekran.ad === 'kaynak' || ekran.ad === 'pusula' ? { ad: 'ana' } : { ad: 'harita' }); return true;
    });
    return () => geri.remove();
  }, [ekran]);

  const meslekAc = async (p) => { setPaket(p); setSonuclar(await ilerlemeOku(p.meslek.id)); setEkran({ ad: 'harita', ki: null }); };
  const tema = VARSAYILAN_TEMA; // Uygulamanın tamamı marka renklerinde
  const koyuUst = ['acilis', 'ana', 'hesap', 'harita'].includes(ekran.ad);

  let icerik;
  if (ekran.ad === 'acilis') icerik = <Acilis onBasla={() => setEkran({ ad: 'ana' })} onHesap={() => setEkran({ ad: 'hesap' })} oturum={oturum} />;
  else if (ekran.ad === 'ana') icerik = <AnaEkran hepsi={hepsi} oturum={oturum} onMeslek={meslekAc} onHesap={() => setEkran({ ad: 'hesap' })} onKaynak={() => setEkran({ ad: 'kaynak' })}
    pusula={pusula} onPusula={() => setEkran({ ad: 'pusula' })} />;
  else if (ekran.ad === 'pusula') icerik = <Pusula kayit={pusula} onGeri={() => { pusulaOku().then(setPusula); setEkran({ ad: 'ana' }); }}
    onMeslek={(p) => { pusulaOku().then(setPusula); meslekAc(p); }} />;
  else if (ekran.ad === 'kaynak') icerik = <Kaynaklar onGeri={() => setEkran({ ad: 'ana' })} />;
  else if (ekran.ad === 'hesap') icerik = <HesapEkrani oturum={oturum} onGeri={() => { tumunuOku(); setEkran({ ad: 'ana' }); }} />;
  else if (ekran.ad === 'harita') icerik = <Harita paket={paket} sonuclar={sonuclar} kiBaslangic={ekran.ki}
    onGeri={() => { tumunuOku(); setEkran({ ad: 'ana' }); }} onGorev={(ki, gi) => setEkran({ ad: 'gorev', ki, gi, anahtar: Date.now() })} onBelge={() => setEkran({ ad: 'belge' })} />;
  else if (ekran.ad === 'gorev') {
    const k = paket.kademeler[ekran.ki]; const g = k.gorevler[ekran.gi]; const S = SABLONLAR[g.sablon];
    icerik = S ? <S key={ekran.anahtar} gorev={g} paket={paket} onKapat={() => setEkran({ ad: 'harita', ki: ekran.ki })}
      onBitir={async (s) => {
        let yeni = sonuclar;
        if (!s.sinav || s.gecti) yeni = await gorevBitti(paket, g, s.yildiz);
        const kademeYeniBitti = !kademeBitti(paket, ekran.ki, sonuclar) && kademeBitti(paket, ekran.ki, yeni);
        setSonuclar(yeni);
        setEkran({ ad: 'sonuc', ki: ekran.ki, gi: ekran.gi, s, rozet: kademeYeniBitti ? k.rozet : null });
      }} /> : <Ekran><Ust baslik={g.baslik} onKapat={() => setEkran({ ad: 'harita', ki: ekran.ki })} /><Text>{t('Bu görev türü bu sürümde yok.')}</Text></Ekran>;
  } else if (ekran.ad === 'sonuc') icerik = <Sonuc paket={paket} ekran={ekran} onHarita={() => setEkran({ ad: 'harita', ki: ekran.ki })}
      onTekrar={() => setEkran({ ad: 'gorev', ki: ekran.ki, gi: ekran.gi, anahtar: Date.now() })} onBelge={() => setEkran({ ad: 'belge' })} />;
  else if (ekran.ad === 'belge') icerik = <Belge paket={paket} sonuclar={sonuclar} onGeri={() => setEkran({ ad: 'harita' })} />;

  return (
    <SafeAreaProvider>
      <DilContext.Provider value={{ dil, setDil }}>
      <TemaContext.Provider value={tema}>
        <StatusBar style={koyuUst ? "light" : "dark"} />
        {icerik}
      </TemaContext.Provider>
      </DilContext.Provider>
    </SafeAreaProvider>
  );
}

// ---------------- Dil seçici (🌐 TR) ----------------
function DilSecici() {
  const { dil, setDil } = React.useContext(DilContext); const [acik, setAcik] = useState(false); const ins = useSafeAreaInsets();
  return (
    <>
      <Pressable onPress={() => setAcik(true)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, marginRight: 8,
        backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' }}>
        <Text style={{ fontSize: 14, marginRight: 5 }}>🌐</Text><Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{dil.toUpperCase()}</Text>
      </Pressable>
      <Modal visible={acik} transparent animationType="fade" onRequestClose={() => setAcik(false)}>
        <Pressable onPress={() => setAcik(false)} style={{ flex: 1, backgroundColor: 'rgba(10,31,68,0.45)' }}>
          <View style={{ position: 'absolute', top: ins.top + 60, right: 16, width: 220, backgroundColor: '#fff', borderRadius: 18, padding: 6,
            shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 }}>
            <Text style={{ color: R.soluk, fontWeight: '800', fontSize: 11, letterSpacing: 1, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 }}>🌐 {t('Dil').toUpperCase()}</Text>
            {DILLER.map(([k, ad]) => (
              <Pressable key={k} onPress={() => { setDil(k); setAcik(false); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, backgroundColor: dil === k ? MARKA.mavi : 'transparent' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: dil === k ? '#fff' : R.yazi }}>{ad}</Text>
                <Text style={{ fontSize: 11, fontWeight: '900', color: dil === k ? '#fff' : R.soluk }}>{k.toUpperCase()}</Text>
              </Pressable>))}
            <Text style={{ color: R.soluk, fontSize: 11.5, paddingHorizontal: 10, paddingTop: 8 }}>🇹🇷 {t('Oyundaki tüm bilgi ve kurallar Türkiye\'de geçerli mevzuata göredir.')}</Text>
            {dil !== 'tr' && MESLEKLER.some((p) => !ceviriVar(dil, p.meslek.id)) ? <Text style={{ color: R.soluk, fontSize: 11.5, paddingHorizontal: 10, paddingVertical: 6 }}>{t('Bazı meslekler henüz bu dilde değil; Türkçe açılır.')}</Text> : <View style={{ height: 8 }} />}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ---------------- Açılış ekranı ----------------
function Acilis({ onBasla, onHesap, oturum }) {
  const ins = useSafeAreaInsets();
  const yuz = useRef(new Animated.Value(0)).current; const gir = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(gir, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(yuz, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(yuz, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])).start();
  }, []);
  const kay = (d) => ({ transform: [{ translateY: yuz.interpolate({ inputRange: [0, 1], outputRange: [0, d] }) }] });
  const cip = (ik, ust, alt, stil, d, beyaz) => (
    <Animated.View style={[{ position: 'absolute', flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 16,
      backgroundColor: beyaz ? '#fff' : 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: beyaz ? '#fff' : 'rgba(255,255,255,0.28)' }, stil, kay(d)]}>
      <Text style={{ fontSize: 20, marginRight: 8 }}>{ik}</Text>
      <View><Text style={{ fontWeight: '900', fontSize: 13, color: beyaz ? MARKA.lacivert : '#fff' }}>{t(ust)}</Text>
        <Text style={{ fontSize: 10.5, fontWeight: '600', color: beyaz ? R.soluk : '#bcd3f3' }}>{t(alt)}</Text></View>
    </Animated.View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: MARKA.lacivert }}>
      <Gradyan renkler={['#1f4fa3', MARKA.lacivert2, MARKA.lacivert]} />
      <View style={{ position: 'absolute', top: ins.top + 10, right: 16, zIndex: 5 }}><DilSecici /></View>
      <View style={{ flex: 1, paddingTop: ins.top + 16, paddingHorizontal: 22 }}>
        <View style={{ height: 320, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(124,196,255,0.25)', borderStyle: 'dashed' }} />
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(59,130,246,0.30)' }} />
          <Animated.View style={{ opacity: gir, transform: [{ scale: gir.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
            <Logo yukseklik={130} yazi={false} />
          </Animated.View>
          {cip('🏅', 'Çırak Barista', 'Rozet kazandın!', { top: 4, left: 0 }, 8, true)}
          {cip('⚡', '+20 XP', 'Mükemmel sıralama', { top: 70, right: 0 }, -10)}
          {cip('⭐', '3 / 3 yıldız', 'Kademe sınavı', { bottom: 40, left: 0 }, -8)}
          {cip('🧭', 'Pusula', 'Sana en yakın: Aşçı', { bottom: 0, right: 4 }, 10, true)}
        </View>
        <Animated.View style={{ opacity: gir, alignItems: 'center', marginTop: 14 }}>
          <Text style={{ fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1 }}>Meslek<Text style={{ color: MARKA.gok }}>taş</Text></Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 8, lineHeight: 30 }}>
            {t('Bir mesleği')} <Text style={{ color: MARKA.gok }}>{t('oynayarak')}</Text>{dilNe() === 'tr' ? ' öğren.' : t('öğren.')}</Text>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            {[[String(MESLEKLER.length), 'meslek'], ['5', 'kademe'], ['30', 'soruluk Pusula']].map(([a, b], j) => (
              <View key={j} style={{ alignItems: 'center', marginHorizontal: 12 }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>{a}</Text>
                <Text style={{ color: '#a9c2e6', fontSize: 12 }}>{t(b)}</Text>
              </View>))}
          </View>
        </Animated.View>
        <View style={{ flex: 1, minHeight: 20 }} />
        <View style={{ paddingBottom: ins.bottom + 22 }}>
          <Pressable onPress={onBasla} style={({ pressed }) => ({ backgroundColor: '#fff', borderRadius: 18, paddingVertical: 17, alignItems: 'center', borderBottomWidth: 4, borderColor: '#c9dbf6', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: MARKA.lacivert }}>{t('Hadi başlayalım  →')}</Text>
          </Pressable>
          <Pressable onPress={oturum ? onBasla : onHesap} hitSlop={10} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#c8d9f2', fontWeight: '700' }}>{oturum ? `👤 ${oturum.user.email}` : t('Hesabın var mı? Giriş yap')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ---------------- Ana ekran: meslek seçimi ----------------
function AnaEkran({ hepsi, oturum, onMeslek, onHesap, onKaynak, pusula, onPusula }) {
  const ins = useSafeAreaInsets(); const { width } = useWindowDimensions();
  const kartG = (Math.min(width, 520) - 18 * 2 - 12) / 2;
  const veriler = MESLEKLER.map((p) => {
    const s = hepsi[p.meslek.id] || {}; const xp = toplamXp(p, s);
    const max = p.kademeler.reduce((t, k) => t + k.gorevler.reduce((a, g) => a + maxXp(g), 0), 0);
    const rozet = p.kademeler.filter((_, j) => kademeBitti(p, j, s)).length;
    return { p, s, xp, max, rozet, ki: aktifKademe(p, s) };
  });
  const toplamXpHepsi = veriler.reduce((t, v) => t + v.xp, 0); const toplamRozet = veriler.reduce((t, v) => t + v.rozet, 0);
  const devam = veriler.filter((v) => v.xp > 0 && v.xp < v.max).sort((a, b) => b.xp / b.max - a.xp / a.max)[0];
  return (
    <View style={{ flex: 1, backgroundColor: MARKA.zemin }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 + ins.bottom }}>
        <View style={{ paddingTop: ins.top + 10, paddingHorizontal: 18, paddingBottom: 70, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden', backgroundColor: MARKA.lacivert }}>
          <Gradyan renkler={['#1f4fa3', MARKA.lacivert2, MARKA.lacivert]} />
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(59,130,246,0.25)', top: -90, right: -70 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}><Logo yukseklik={46} /></View>
            <DilSecici />
            <Pressable onPress={onHesap} hitSlop={10} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' }}>
              <Text style={{ fontWeight: '800', color: '#fff' }}>{oturum ? t('👤 Hesabım') : t('Giriş yap')}</Text></Pressable>
          </View>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 18, letterSpacing: -0.5, lineHeight: 31 }}>{t('Bugün hangi mesleği\ndeneyeceksin?')}</Text>
          <Text style={{ color: '#c8d9f2', fontSize: 14, marginTop: 6 }}>{t('Meraktan ustalığa, oynayarak öğren.')}</Text>
        </View>

        <View style={{ flexDirection: 'row', marginHorizontal: 18, marginTop: -46, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 14, borderWidth: 1, borderColor: R.cizgi,
          shadowColor: MARKA.lacivert, shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
          {[[String(MESLEKLER.length), 'meslek', '🧰'], [String(toplamXpHepsi), 'toplam XP', '⚡'], [String(toplamRozet), 'rozet', '🏅']].map(([a, b, ik], j) => (
            <View key={j} style={{ flex: 1, alignItems: 'center', borderLeftWidth: j ? 1 : 0, borderColor: R.cizgi }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: MARKA.lacivert }}>{a}</Text>
              <Text style={{ fontSize: 12, color: R.soluk, fontWeight: '700' }}>{ik} {t(b)}</Text>
            </View>))}
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          {devam ? <Giris><DevamKarti v={devam} onPress={() => onMeslek(devam.p)} /></Giris> : null}
          <PusulaKarti pusula={pusula} onPress={onPusula} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: MARKA.mavi, borderRadius: 99, paddingVertical: 5, paddingLeft: 5, paddingRight: 14, borderWidth: 1.5, borderColor: MARKA.mavi2 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: MARKA.lacivert, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}><Text style={{ fontSize: 14 }}>🧰</Text></View>
              <Text style={{ color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 13 }}>{t('MESLEKLER')}</Text>
            </View>
            <View style={{ flex: 1, height: 1, backgroundColor: R.cizgi, marginLeft: 12 }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {veriler.map((v, i) => <Giris key={v.p.meslek.id} gecikme={i * 60}><MeslekKarti v={v} genislik={kartG} onPress={() => onMeslek(v.p)} /></Giris>)}
          </View>
          <View style={{ marginTop: 6, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#b9d0f0', alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>✨</Text>
            <Text style={{ fontWeight: '900', color: MARKA.lacivert, marginTop: 4 }}>{t('Yeni meslekler yolda')}</Text>
            <Text style={{ color: R.soluk, fontSize: 12, textAlign: 'center', marginTop: 4 }}>{t('Meslektaş kurslara ön hazırlık amaçlıdır; resmî eğitim veya sertifika yerine geçmez.')}</Text>
            <Text style={{ color: MARKA.lacivert, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 6 }}>🇹🇷 {t('Oyundaki tüm bilgi ve kurallar Türkiye\'de geçerli mevzuata göredir.')}</Text>
          </View>
          <Pressable onPress={onKaynak} hitSlop={10}><Text style={{ color: R.soluk, textAlign: 'center', marginTop: 14, fontSize: 13, textDecorationLine: 'underline' }}>{t('Görsel kaynakları')}</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// İki sütunlu düzenli meslek kartı — hepsi aynı boyda, aynı renk ailesinde
function MeslekKarti({ v, genislik, onPress }) {
  const { p, xp, max, rozet, ki } = v; const basladi = xp > 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ width: genislik, height: 196, marginBottom: 12, borderRadius: 22, backgroundColor: '#fff', padding: 14,
      borderWidth: 1, borderColor: R.cizgi, borderBottomWidth: 4, borderBottomColor: '#c7d9f3', transform: [{ scale: pressed ? 0.97 : 1 }],
      shadowColor: MARKA.lacivert, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 })}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ width: 54, height: 54, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderColor: '#1749a8' }}>
          <Gradyan renkler={[MARKA.mavi2, MARKA.mavi]} yon="capraz" />
          <Text style={{ fontSize: 28 }}>{ikonu(p)}</Text>
        </View>
        {rozet ? <View style={{ backgroundColor: '#fff6d6', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ fontSize: 11, fontWeight: '900', color: '#a16207' }}>🏅 {rozet}/{p.kademeler.length}</Text></View> : null}
      </View>
      <Text style={{ color: MARKA.mavi, fontWeight: '800', fontSize: 9.5, letterSpacing: 0.8, marginTop: 12 }} numberOfLines={1}>{kategori(p)}</Text>
      <Text style={{ color: MARKA.lacivert, fontSize: 17, fontWeight: '900', marginTop: 3, lineHeight: 21 }} numberOfLines={2}>{t(p.meslek.ad)}</Text>
      <View style={{ flex: 1 }} />
      <Cubuk oran={xp / max} renk={MARKA.mavi2} yukseklik={6} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: basladi ? MARKA.lacivert : R.soluk, flexShrink: 1 }} numberOfLines={1}>{basladi ? p.kademeler[ki].ad : t('5 kademe')}</Text>
        <View style={{ backgroundColor: basladi ? MARKA.lacivert : MARKA.buz, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: basladi ? '#fff' : MARKA.mavi }}>{basladi ? t('Devam') : t('Başla')} →</Text></View>
      </View>
    </Pressable>
  );
}

// Yarım kalan meslek: büyük "devam et" kartı
function DevamKarti({ v, onPress }) {
  const { p, xp, max, ki } = v;
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 22, overflow: 'hidden', padding: 16, marginBottom: 14, backgroundColor: MARKA.mavi }}>
      <Gradyan renkler={[MARKA.mavi2, MARKA.mavi, MARKA.lacivert2]} yon="capraz" />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 30 }}>{ikonu(p)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: MARKA.gok, fontWeight: '900', fontSize: 11, letterSpacing: 1.2 }}>{t('KALDIĞIN YERDEN DEVAM ET')}</Text>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 19, marginTop: 2 }} numberOfLines={1}>{t(p.meslek.ad)}</Text>
          <Text style={{ color: '#dbe8fb', fontSize: 13, marginTop: 2 }}>{t('{0} kademesi · %{1}', p.kademeler[ki].ad, Math.round(xp / max * 100))}</Text>
        </View>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: MARKA.mavi, fontSize: 16, fontWeight: '900' }}>▶</Text></View>
      </View>
      <Cubuk oran={xp / max} renk="#fff" yukseklik={6} style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.25)' }} />
    </Pressable>
  );
}

// Ana ekrandaki Meslek Pusulası kartı: test çözülmediyse davet, çözüldüyse sonuç özeti.
function PusulaKarti({ pusula, onPress }) {
  let alt = t('30 kısa soru · 3 dakika · Evet ya da Hayır'); let ust = t('Sana hangi meslek yakışır?');
  if (pusula) {
    const a = analiz(pusula.puanlar, MESLEKLER.map((p) => p.meslek.id));
    const m = MESLEKLER.find((p) => p.meslek.id === a.meslekler[0]?.id);
    ust = m ? t('Sana en yakışan: {0}', t(m.meslek.ad)) : t('Pusulan hazır');
    alt = t('{0} – {1} · sonucu gör', t(TIPLER[a.kod[0]].ad), t(TIPLER[a.kod[1]].ad));
  }
  return (
    <Giris>
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 22, overflow: 'hidden', padding: 16, marginBottom: 16, backgroundColor: MARKA.lacivert }}>
        <Gradyan renkler={[MARKA.lacivert, MARKA.lacivert2, '#1f4fa3']} yon="yatay" />
        <View style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: 'rgba(124,196,255,0.3)', borderStyle: 'dashed' }} />
        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 3, borderColor: MARKA.gok }}><Text style={{ fontSize: 30 }}>🧭</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: MARKA.gok, fontWeight: '900', fontSize: 11, letterSpacing: 1.2 }}>{t('MESLEK PUSULASI')}</Text>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17, marginTop: 2 }}>{ust}</Text>
          <Text style={{ color: '#bcd3f3', fontSize: 13, marginTop: 2 }}>{alt}</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>›</Text>
      </Pressable>
    </Giris>
  );
}

// Harita için koyu üst bant + açık içerik
function HaritaKabuk({ paket, sonuclar, onGeri, children }) {
  const ins = useSafeAreaInsets();
  const max = paket.kademeler.reduce((t, k) => t + k.gorevler.reduce((a, g) => a + maxXp(g), 0), 0); const xp = toplamXp(paket, sonuclar);
  const rozet = paket.kademeler.filter((_, j) => kademeBitti(paket, j, sonuclar)).length;
  return (
    <View style={{ flex: 1, backgroundColor: MARKA.zemin }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 + ins.bottom }}>
        <View style={{ paddingTop: ins.top + 10, paddingHorizontal: 18, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden', backgroundColor: MARKA.lacivert }}>
          <Gradyan renkler={['#1f4fa3', MARKA.lacivert2, MARKA.lacivert]} />
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(59,130,246,0.25)', top: -70, right: -60 }} />
          <Pressable onPress={onGeri} hitSlop={12} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>←</Text></Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <View style={{ width: 66, height: 66, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderBottomWidth: 4, borderColor: '#1749a8' }}>
              <Gradyan renkler={[MARKA.mavi2, MARKA.mavi]} yon="capraz" /><Text style={{ fontSize: 34 }}>{ikonu(paket)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: MARKA.gok, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>{kategori(paket)}</Text>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }} numberOfLines={2}>{t(paket.meslek.ad)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <View style={{ flex: 1, marginRight: 12 }}><Cubuk oran={xp / max} renk={MARKA.gok} yukseklik={8} style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} /></View>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>⚡ {xp} XP · 🏅 {rozet}/{paket.kademeler.length}</Text>
          </View>
          <Text style={{ color: '#bcd3f3', fontSize: 11.5, marginTop: 10 }}>🇹🇷 {t('Bu meslek Türkiye\'deki kurallara ve mevzuata göre anlatılır.')}</Text>
        </View>
        <View style={{ padding: 18 }}>{children}</View>
      </ScrollView>
    </View>
  );
}

// Giriş / hesap ekranları için logolu koyu üst bant
function GirisKabuk({ onGeri, children }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: MARKA.zemin }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 + ins.bottom }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: ins.top + 10, paddingHorizontal: 18, paddingBottom: 70, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden', backgroundColor: MARKA.lacivert, alignItems: 'center' }}>
          <Gradyan renkler={['#1f4fa3', MARKA.lacivert2, MARKA.lacivert]} />
          <Pressable onPress={onGeri} hitSlop={12} style={{ alignSelf: 'flex-start', width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>✕</Text></Pressable>
          <Logo yukseklik={92} yazi={false} />
          <Text style={{ fontSize: 30, fontWeight: '900', color: '#fff', marginTop: 6, letterSpacing: -0.5 }}>Meslek<Text style={{ color: MARKA.gok }}>taş</Text></Text>
        </View>
        <View style={{ marginHorizontal: 18, marginTop: -46, backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: R.cizgi,
          shadowColor: MARKA.lacivert, shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>{children}</View>
      </ScrollView>
    </View>
  );
}

// ---------------- Harita: kademeler ve görevler ----------------
function Harita({ paket, sonuclar, kiBaslangic, onGeri, onGorev, onBelge }) {
  const [ki, setKi] = useState(kiBaslangic ?? aktifKademe(paket, sonuclar));
  const K = paket.kademeler[ki]; const acik = kademeAcik(paket, ki, sonuclar);
  const xp = kademeXp(paket, ki, sonuclar); const hepsiBitti = paket.kademeler.every((_, j) => kademeBitti(paket, j, sonuclar));
  return (
    <HaritaKabuk paket={paket} sonuclar={sonuclar} onGeri={onGeri}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginBottom: 14 }} contentContainerStyle={{ paddingHorizontal: 18 }}>
        {paket.kademeler.map((k, j) => {
          const a = kademeAcik(paket, j, sonuclar); const b = kademeBitti(paket, j, sonuclar); const sec = j === ki;
          return (
            <Pressable key={j} onPress={() => setKi(j)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, marginRight: 8,
              backgroundColor: sec ? MARKA.mavi : '#fff', borderWidth: 1.5, borderColor: sec ? MARKA.mavi2 : R.cizgi, borderBottomWidth: 3, borderBottomColor: sec ? '#1749a8' : '#c7d9f3', opacity: a ? 1 : 0.55 }}>
              <Text style={{ fontWeight: '900', color: sec ? '#fff' : MARKA.lacivert }}>{b ? k.rozet.ikon + ' ' : a ? `${j + 1}. ` : '🔒 '}{k.ad}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Kart style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginRight: 12, opacity: kademeBitti(paket, ki, sonuclar) ? 1 : 0.35 }}>{K.rozet.ikon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: R.yazi }}>{K.ad}</Text>
            <Text style={{ color: R.soluk }}>{t('Rozet: {0}', K.rozet.ad)}</Text>
          </View>
          <Text style={{ fontWeight: '900', color: R.yazi }}>{xp}/{K.hedefXp} XP</Text>
        </View>
        <Cubuk oran={xp / K.hedefXp} style={{ marginTop: 12 }} />
        {!acik ? <Text style={{ color: R.kirmizi, marginTop: 10, fontWeight: '700' }}>{t('🔒 Önceki kademenin sınavını geçince açılır.')}</Text> : null}
      </Kart>
      {K.gorevler.map((g, gi) => {
        const a = gorevAcik(paket, ki, gi, sonuclar); const s = sonuclar[g.id];
        const sinav = g.sablon === 'sinav';
        return (
          <Giris key={g.id} gecikme={gi * 50}>
            <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
              <View style={{ width: 30, alignItems: 'center' }}>
                <View style={{ width: 4, flex: 1, backgroundColor: gi === 0 ? 'transparent' : s || a ? MARKA.mavi2 : R.cizgi }} />
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: s ? R.yesil : a ? MARKA.mavi2 : R.cizgi, borderWidth: 3, borderColor: '#fff' }} />
                <View style={{ width: 4, flex: 1, backgroundColor: gi === K.gorevler.length - 1 ? 'transparent' : s ? MARKA.mavi2 : R.cizgi }} />
              </View>
              <Pressable disabled={!a} onPress={() => onGorev(ki, gi)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: sinav ? MARKA.buz : '#fff',
                borderRadius: 16, borderWidth: sinav ? 2 : 1, borderColor: sinav ? MARKA.mavi2 : R.cizgi, borderBottomWidth: 3, borderBottomColor: sinav ? '#1749a8' : '#c7d9f3', padding: 12, marginVertical: 5, opacity: a ? 1 : 0.55 }}>
                <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: a ? MARKA.buz : '#eef1f5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ fontSize: 24 }}>{a ? g.ikon : '🔒'}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: R.yazi }}>{g.baslik}</Text>
                  <Text style={{ color: R.soluk, fontSize: 13 }}>{t(SABLON_ETIKET[g.sablon] || g.sablon)}{sinav ? ` · %${g.gecmeYuzde}` : ''} · {maxXp(g)} XP</Text>
                </View>
                {s ? <Text style={{ color: R.altin, fontWeight: '900' }}>{g.sablon === 'bilgi' || sinav || g.sablon === 'uyum' ? '✓' : '★'.repeat(s.yildiz) + '☆'.repeat(3 - s.yildiz)}</Text> : null}
              </Pressable>
            </View>
          </Giris>
        );
      })}
      {hepsiBitti ? <Dugme yazi={t('🎓 Tamamlama belgemi göster')} onPress={onBelge} style={{ marginTop: 16 }} /> : null}
    </HaritaKabuk>
  );
}

// ---------------- Sonuç ----------------
function Sonuc({ paket, ekran, onHarita, onTekrar, onBelge }) {
  const { s, rozet } = ekran; const g = paket.kademeler[ekran.ki].gorevler[ekran.gi];
  const yildizlar = [0, 1, 2].map(() => useRef(new Animated.Value(0)).current);
  const rozetA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.stagger(220, yildizlar.map((a) => Animated.spring(a, { toValue: 1, useNativeDriver: true, friction: 4 }))).start();
    if (rozet) Animated.spring(rozetA, { toValue: 1, useNativeDriver: true, friction: 3, tension: 40 }).start();
    if (s.sinav && !s.gecti) { ses('yanlis'); titret('hata'); } else if (rozet || s.yildiz === 3) { ses('basari'); titret('basari'); } else ses('dogru');
  }, []);
  const basarisiz = s.sinav && !s.gecti;
  const sonKademe = ekran.ki === paket.kademeler.length - 1;
  const gosterYildiz = !basarisiz && !['bilgi', 'uyum', 'sinav'].includes(g.sablon);
  return (
    <Ekran alt={<>
      <Dugme yazi={t('Haritaya dön')} onPress={onHarita} />
      {!s.tekrarYok ? <Dugme yazi={basarisiz ? t('Tekrar dene') : t('Tekrar oyna')} ikincil onPress={onTekrar} style={{ marginTop: 10 }} /> : null}
      {rozet && sonKademe ? <Dugme yazi={t('🎓 Tamamlama belgesi')} ikincil onPress={onBelge} style={{ marginTop: 10 }} /> : null}
    </>}>
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        {rozet ? <>
          <Text style={{ color: R.soluk, fontWeight: '800', letterSpacing: 1 }}>{t('KADEME TAMAMLANDI')}</Text>
          <Animated.Text style={{ fontSize: 110, marginVertical: 10, transform: [{ scale: rozetA }, { rotate: rozetA.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] }) }] }}>{rozet.ikon}</Animated.Text>
          <Text style={[st.baslik, { textAlign: 'center' }]}>{t('Tebrikler, artık {0}sın!', rozet.ad)}</Text>
        </> : <>
          {s.ust ? <Text style={{ color: R.soluk, fontWeight: '800', letterSpacing: 1 }}>{s.ust}</Text> : null}
          <Karakter kim="usta" ruh={basarisiz ? 'kizgin' : 'mutlu'} boyut={110} />
          <Text style={[st.baslik, { textAlign: 'center', marginTop: 6 }]}>{basarisiz ? t('Bu sefer olmadı') : s.baslik || g.baslik}</Text>
        </>}
        {gosterYildiz ? <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {yildizlar.map((a, j) => <Animated.Text key={j} style={{ fontSize: 46, marginHorizontal: 4, opacity: j < s.yildiz ? 1 : 0.2, transform: [{ scale: a }] }}>⭐</Animated.Text>)}
        </View> : null}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {[s.d1, s.d2].filter(Boolean).map((d, j) => (
            <Kart key={j} style={{ alignItems: 'center', marginHorizontal: 6, minWidth: 120 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: R.yazi }}>{d[0]}</Text><Text style={{ color: R.soluk }}>{d[1]}</Text>
            </Kart>
          ))}
        </View>
        {!basarisiz ? <Text style={{ fontSize: 18, fontWeight: '900', color: R.yesil, marginTop: 14 }}>+{(g.sablon === 'bilgi' || g.sablon === 'uyum' || g.sablon === 'sinav') ? g.xp : (g.puanlama ? g.puanlama.temelXp + s.yildiz * g.puanlama.yildizBasinaXp : g.temelXp + s.yildiz * g.yildizBasinaXp)} XP</Text> : null}
      </View>
      {(rozet ? paket.kademeler[ekran.ki].sonraki : s.ipucu) ? <Text style={[st.alt, { textAlign: 'center', marginTop: 14 }]}>{rozet ? paket.kademeler[ekran.ki].sonraki : s.ipucu}</Text> : null}
      {s.bilgi && !basarisiz ? <Kart style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '900', color: R.yazi, marginBottom: 8 }}>{s.bilgi.baslik}</Text>
        {s.bilgi.maddeler.map((m, j) => <Text key={j} style={{ color: R.yazi, lineHeight: 22 }}>• {m}</Text>)}
      </Kart> : null}
    </Ekran>
  );
}

// ---------------- Tamamlama belgesi (resmî değil) ----------------
function Belge({ paket, sonuclar, onGeri }) {
  const [ad, setAd] = useState('');
  const B = paket.meslek.tamamlamaBelgesi; const xp = toplamXp(paket, sonuclar);
  return (
    <Ekran>
      <Ust baslik={t('Tamamlama belgesi')} onKapat={onGeri} />
      <TextInput value={ad} onChangeText={setAd} placeholder={t('Belgede görünecek adın')} maxLength={40}
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: R.cizgi, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16 }} />
      <Kart style={{ alignItems: 'center', padding: 24, borderWidth: 3, borderColor: MARKA.mavi2 }}>
        <Text style={{ fontWeight: '900', color: R.soluk, letterSpacing: 2 }}>MESLEKTAŞ</Text>
        <Text style={{ fontSize: 22, fontWeight: '900', textAlign: 'center', color: R.yazi, marginTop: 8 }}>{B.baslik}</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: MARKA.lacivert, marginVertical: 16 }}>{ad || t('Adını yaz')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {paket.kademeler.map((k, j) => <View key={j} style={{ alignItems: 'center', margin: 6 }}><Text style={{ fontSize: 30 }}>{k.rozet.ikon}</Text><Text style={{ fontSize: 11, color: R.soluk }}>{k.ad}</Text></View>)}
        </View>
        <Text style={{ fontWeight: '900', marginTop: 12, color: R.yazi }}>{xp} XP · {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        <Text style={{ fontSize: 12, color: R.soluk, textAlign: 'center', marginTop: 14 }}>{B.not}</Text>
      </Kart>
    </Ekran>
  );
}

// ---------------- Hesap ----------------
function HesapEkrani({ oturum, onGeri }) {
  const [eposta, setEposta] = useState(''); const [sifre, setSifre] = useState('');
  const [mesaj, setMesaj] = useState(null); const [bekle, setBekle] = useState(false);
  const calistir = async (f) => { setBekle(true); setMesaj(null); try { await f(); } catch (e) { setMesaj({ iyi: false, metin: e.message }); } setBekle(false); };
  const girdi = { backgroundColor: MARKA.zemin, borderWidth: 1.5, borderColor: R.cizgi, borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 12, color: R.yazi };
  if (oturum) return (
    <GirisKabuk onGeri={onGeri}>
      <Text style={{ fontSize: 24, fontWeight: '900', color: MARKA.lacivert, marginBottom: 12 }}>{t('Hesabım')}</Text>
      <Kart><Text style={{ color: R.soluk }}>{t('Giriş yapılan e-posta')}</Text><Text style={{ fontSize: 18, fontWeight: '800', color: R.yazi }}>{oturum.user.email}</Text>
        <Text style={{ color: R.soluk, marginTop: 10 }}>{t('İlerlemen sunucuya kaydediliyor; telefon değiştirsen de kaybolmaz.')}</Text></Kart>
      <Dugme yazi={t('Çıkış yap')} ikincil style={{ marginTop: 16 }} onPress={() => calistir(async () => { await supabase.auth.signOut(); })} />
    </GirisKabuk>
  );
  return (
    <GirisKabuk onGeri={onGeri}>
      <Text style={{ fontSize: 24, fontWeight: '900', color: MARKA.lacivert }}>{t('Hoş geldin 👋')}</Text>
      <Text style={[st.alt, { marginBottom: 16, marginTop: 4 }]}>{t('Hesapsız da oynayabilirsin. Hesap açarsan ilerlemen ve rozetlerin sunucuda saklanır, telefon değişse de kaybolmaz.')}</Text>
      <TextInput value={eposta} onChangeText={setEposta} placeholder={t('E-posta')} autoCapitalize="none" keyboardType="email-address" style={girdi} />
      <TextInput value={sifre} onChangeText={setSifre} placeholder={t('Şifre (en az 8 karakter)')} secureTextEntry style={girdi} />
      {bekle ? <ActivityIndicator style={{ marginVertical: 10 }} /> : null}
      {mesaj ? <Text style={{ color: mesaj.iyi ? R.yesil : R.kirmizi, marginBottom: 10 }}>{mesaj.metin}</Text> : null}
      <Dugme yazi={t('Giriş yap')} kapali={bekle} onPress={() => calistir(async () => {
        const { error } = await supabase.auth.signInWithPassword({ email: eposta.trim(), password: sifre }); if (error) throw new Error(t('Giriş olmadı: e-posta ya da şifre hatalı.')); onGeri(); })} />
      <Dugme yazi={t('Yeni hesap aç')} ikincil kapali={bekle} style={{ marginTop: 10 }} onPress={() => calistir(async () => {
        if (sifre.length < 8) throw new Error(t('Şifre en az 8 karakter olmalı.'));
        const { data, error } = await supabase.auth.signUp({ email: eposta.trim(), password: sifre }); if (error) throw error;
        if (!data.session) setMesaj({ iyi: true, metin: t('Hesap açıldı. E-postana gelen onay bağlantısına dokun, sonra giriş yap.') }); else onGeri(); })} />
    </GirisKabuk>
  );
}

// ---------------- Görsel kaynakları (lisans gereği atıf) ----------------
function Kaynaklar({ onGeri }) {
  return (
    <Ekran>
      <Ust baslik={t('Görsel kaynakları')} onKapat={onGeri} />
      <Text style={[st.alt, { marginBottom: 14 }]}>{t("Oyundaki fotoğraflar ücretsiz lisanslı kaynaklardandır. Çizimler Meslektaş'a aittir.")}</Text>
      {Object.entries(FOTOLAR).map(([ad, f]) => (
        <Pressable key={ad} onPress={() => Linking.openURL(f.kaynak)}>
          <Kart style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '800', color: R.yazi }}>{ad}</Text>
            <Text style={{ color: R.soluk }}>{t('Fotoğraf: {0} · Lisans: {1}', f.yazar, f.lisans)}</Text>
            <Text style={{ color: '#5f8fb0', textDecorationLine: 'underline' }} numberOfLines={1}>{f.kaynak}</Text>
          </Kart>
        </Pressable>
      ))}
    </Ekran>
  );
}
