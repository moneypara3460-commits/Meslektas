// Meslektaş — her mesleği aynı motorla oynatan oyun.
// Bir meslek = icerik/ klasöründe bir JSON paketi. Motor paketi okur, şablonlar görevleri oynatır.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, Animated, Easing, BackHandler, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MESLEKLER } from './icerik';
import { SABLONLAR, SABLON_ETIKET } from './sablonlar';
import { TemaContext, Ekran, Ust, Dugme, Kart, Cubuk, Giris, Karakter, R, st } from './ui';
import { ilerlemeOku, gorevBitti, esitle } from './motor/ilerleme';
import { gorevAcik, kademeAcik, kademeBitti, kademeXp, toplamXp, aktifKademe, maxXp } from './motor/kurallar';
import { supabase } from './motor/supabase';
import { FOTOLAR } from './gorseller';
import { ses, titret } from './motor/his';
import { Linking } from 'react-native';

const VARSAYILAN_TEMA = { ana: '#1f3a5f', vurgu: '#e0a030', zemin: '#f3f1ec' };

export default function App() {
  const [ekran, setEkran] = useState({ ad: 'ana' });
  const [paket, setPaket] = useState(null);
  const [sonuclar, setSonuclar] = useState({});
  const [hepsi, setHepsi] = useState({});
  const [oturum, setOturum] = useState(null);

  const tumunuOku = async () => { const h = {}; for (const p of MESLEKLER) h[p.meslek.id] = await ilerlemeOku(p.meslek.id); setHepsi(h); return h; };
  useEffect(() => {
    tumunuOku();
    supabase.auth.getSession().then(({ data }) => setOturum(data.session));
    const { data: dinle } = supabase.auth.onAuthStateChange((_e, s) => { setOturum(s); if (s) esitle(MESLEKLER.map((p) => p.meslek.id)).then(tumunuOku); });
    return () => dinle.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const geri = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ekran.ad === 'ana') return false;
      setEkran(ekran.ad === 'harita' || ekran.ad === 'hesap' || ekran.ad === 'kaynak' ? { ad: 'ana' } : { ad: 'harita' }); return true;
    });
    return () => geri.remove();
  }, [ekran]);

  const meslekAc = async (p) => { setPaket(p); setSonuclar(await ilerlemeOku(p.meslek.id)); setEkran({ ad: 'harita', ki: null }); };
  const tema = paket && ekran.ad !== 'ana' && ekran.ad !== 'hesap' ? { ...VARSAYILAN_TEMA, ...paket.meslek.renkler } : VARSAYILAN_TEMA;

  let icerik;
  if (ekran.ad === 'ana') icerik = <AnaEkran hepsi={hepsi} oturum={oturum} onMeslek={meslekAc} onHesap={() => setEkran({ ad: 'hesap' })} onKaynak={() => setEkran({ ad: 'kaynak' })} />;
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
      }} /> : <Ekran><Ust baslik={g.baslik} onKapat={() => setEkran({ ad: 'harita', ki: ekran.ki })} /><Text>Bu görev türü bu sürümde yok.</Text></Ekran>;
  } else if (ekran.ad === 'sonuc') icerik = <Sonuc paket={paket} ekran={ekran} onHarita={() => setEkran({ ad: 'harita', ki: ekran.ki })}
      onTekrar={() => setEkran({ ad: 'gorev', ki: ekran.ki, gi: ekran.gi, anahtar: Date.now() })} onBelge={() => setEkran({ ad: 'belge' })} />;
  else if (ekran.ad === 'belge') icerik = <Belge paket={paket} sonuclar={sonuclar} onGeri={() => setEkran({ ad: 'harita' })} />;

  return (
    <SafeAreaProvider>
      <TemaContext.Provider value={tema}>
        <StatusBar style="dark" />
        {icerik}
      </TemaContext.Provider>
    </SafeAreaProvider>
  );
}

// ---------------- Ana ekran: meslek seçimi ----------------
function AnaEkran({ hepsi, oturum, onMeslek, onHesap, onKaynak }) {
  const sallan = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.sequence([
    Animated.timing(sallan, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    Animated.timing(sallan, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])).start(); }, []);
  return (
    <Ekran>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: VARSAYILAN_TEMA.ana, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ color: VARSAYILAN_TEMA.vurgu, fontSize: 26, fontWeight: '900' }}>M</Text></View>
        <Text style={[st.baslik, { flex: 1 }]}>Meslektaş</Text>
        <Pressable onPress={onHesap} hitSlop={10} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: R.cizgi }}>
          <Text style={{ fontWeight: '800', color: VARSAYILAN_TEMA.ana }}>{oturum ? '👤 Hesabım' : 'Giriş yap'}</Text></Pressable>
      </View>
      <Text style={[st.alt, { marginBottom: 18 }]}>Bir meslek seç; meraktan ustalığa, oynayarak öğren.</Text>
      {MESLEKLER.map((p, i) => {
        const s = hepsi[p.meslek.id] || {}; const xp = toplamXp(p, s);
        const max = p.kademeler.reduce((t, k) => t + k.gorevler.reduce((a, g) => a + maxXp(g), 0), 0);
        const ki = aktifKademe(p, s); const renk = p.meslek.renkler || VARSAYILAN_TEMA;
        const rozet = p.kademeler.filter((_, j) => kademeBitti(p, j, s)).length;
        return (
          <Giris key={p.meslek.id} gecikme={i * 90}>
            <Pressable onPress={() => onMeslek(p)} style={{ borderRadius: 22, backgroundColor: renk.ana, padding: 18, marginBottom: 14, overflow: 'hidden' }}>
              <Animated.Text style={{ position: 'absolute', right: 14, top: 10, fontSize: 64, opacity: 0.9, transform: [{ rotate: sallan.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) }] }}>
                {p.kademeler[1]?.rozet?.ikon || '⭐'}</Animated.Text>
              <Text style={{ color: renk.vurgu, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>{p.meslek.kategori.toUpperCase()}</Text>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 2 }}>{p.meslek.ad}</Text>
              <Text style={{ color: '#ffffffcc', marginTop: 4, marginRight: 70 }} numberOfLines={2}>{p.meslek.tanim}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                <View style={{ flex: 1, marginRight: 12 }}><Cubuk oran={xp / max} renk={renk.vurgu} /></View>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{xp ? `${p.kademeler[ki].ad} · ${rozet}/${p.kademeler.length} rozet` : 'Başla →'}</Text>
              </View>
            </Pressable>
          </Giris>
        );
      })}
      <Text style={{ color: R.soluk, textAlign: 'center', marginTop: 8, fontSize: 13 }}>Yeni meslekler yolda. İçerikler uzman onayından geçecek.</Text>
      <Pressable onPress={onKaynak} hitSlop={10}><Text style={{ color: R.soluk, textAlign: 'center', marginTop: 12, fontSize: 13, textDecorationLine: 'underline' }}>Görsel kaynakları</Text></Pressable>
    </Ekran>
  );
}

// ---------------- Harita: kademeler ve görevler ----------------
function Harita({ paket, sonuclar, kiBaslangic, onGeri, onGorev, onBelge }) {
  const [ki, setKi] = useState(kiBaslangic ?? aktifKademe(paket, sonuclar));
  const K = paket.kademeler[ki]; const acik = kademeAcik(paket, ki, sonuclar);
  const xp = kademeXp(paket, ki, sonuclar); const hepsiBitti = paket.kademeler.every((_, j) => kademeBitti(paket, j, sonuclar));
  return (
    <Ekran>
      <Ust baslik={paket.meslek.ad} onKapat={onGeri} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
        {paket.kademeler.map((k, j) => {
          const a = kademeAcik(paket, j, sonuclar); const b = kademeBitti(paket, j, sonuclar); const sec = j === ki;
          return (
            <Pressable key={j} onPress={() => setKi(j)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, marginRight: 8, marginBottom: 8,
              backgroundColor: sec ? paket.meslek.renkler?.ana || '#333' : '#fff', borderWidth: 1, borderColor: R.cizgi, opacity: a ? 1 : 0.5 }}>
              <Text style={{ fontWeight: '800', color: sec ? '#fff' : R.yazi }}>{b ? k.rozet.ikon + ' ' : a ? '' : '🔒 '}{k.ad}</Text>
            </Pressable>
          );
        })}
      </View>
      <Kart style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginRight: 12, opacity: kademeBitti(paket, ki, sonuclar) ? 1 : 0.35 }}>{K.rozet.ikon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: R.yazi }}>{K.ad}</Text>
            <Text style={{ color: R.soluk }}>Rozet: {K.rozet.ad}</Text>
          </View>
          <Text style={{ fontWeight: '900', color: R.yazi }}>{xp}/{K.hedefXp} XP</Text>
        </View>
        <Cubuk oran={xp / K.hedefXp} style={{ marginTop: 12 }} />
        {!acik ? <Text style={{ color: R.kirmizi, marginTop: 10, fontWeight: '700' }}>🔒 Önceki kademenin sınavını geçince açılır.</Text> : null}
      </Kart>
      {K.gorevler.map((g, gi) => {
        const a = gorevAcik(paket, ki, gi, sonuclar); const s = sonuclar[g.id];
        const sinav = g.sablon === 'sinav';
        return (
          <Giris key={g.id} gecikme={gi * 50}>
            <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
              <View style={{ width: 30, alignItems: 'center' }}>
                <View style={{ width: 4, flex: 1, backgroundColor: gi === 0 ? 'transparent' : s || a ? paket.meslek.renkler?.vurgu || R.altin : R.cizgi }} />
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: s ? R.yesil : a ? paket.meslek.renkler?.vurgu || R.altin : R.cizgi, borderWidth: 3, borderColor: '#fff' }} />
                <View style={{ width: 4, flex: 1, backgroundColor: gi === K.gorevler.length - 1 ? 'transparent' : s ? paket.meslek.renkler?.vurgu || R.altin : R.cizgi }} />
              </View>
              <Pressable disabled={!a} onPress={() => onGorev(ki, gi)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: sinav ? (paket.meslek.renkler?.vurgu || R.altin) + '22' : '#fff',
                borderRadius: 16, borderWidth: sinav ? 2 : 1, borderColor: sinav ? paket.meslek.renkler?.vurgu || R.altin : R.cizgi, padding: 12, marginVertical: 5, opacity: a ? 1 : 0.5 }}>
                <Text style={{ fontSize: 28, marginRight: 12 }}>{a ? g.ikon : '🔒'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: R.yazi }}>{g.baslik}</Text>
                  <Text style={{ color: R.soluk, fontSize: 13 }}>{SABLON_ETIKET[g.sablon] || g.sablon}{sinav ? ` · %${g.gecmeYuzde}` : ''} · {maxXp(g)} XP</Text>
                </View>
                {s ? <Text style={{ color: R.altin, fontWeight: '900' }}>{g.sablon === 'bilgi' || sinav || g.sablon === 'uyum' ? '✓' : '★'.repeat(s.yildiz) + '☆'.repeat(3 - s.yildiz)}</Text> : null}
              </Pressable>
            </View>
          </Giris>
        );
      })}
      {hepsiBitti ? <Dugme yazi="🎓 Tamamlama belgemi göster" onPress={onBelge} style={{ marginTop: 16 }} /> : null}
    </Ekran>
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
      <Dugme yazi="Haritaya dön" onPress={onHarita} />
      {!s.tekrarYok ? <Dugme yazi={basarisiz ? 'Tekrar dene' : 'Tekrar oyna'} ikincil onPress={onTekrar} style={{ marginTop: 10 }} /> : null}
      {rozet && sonKademe ? <Dugme yazi="🎓 Tamamlama belgesi" ikincil onPress={onBelge} style={{ marginTop: 10 }} /> : null}
    </>}>
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        {rozet ? <>
          <Text style={{ color: R.soluk, fontWeight: '800', letterSpacing: 1 }}>KADEME TAMAMLANDI</Text>
          <Animated.Text style={{ fontSize: 110, marginVertical: 10, transform: [{ scale: rozetA }, { rotate: rozetA.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] }) }] }}>{rozet.ikon}</Animated.Text>
          <Text style={[st.baslik, { textAlign: 'center' }]}>Tebrikler, artık {rozet.ad}sın!</Text>
        </> : <>
          {s.ust ? <Text style={{ color: R.soluk, fontWeight: '800', letterSpacing: 1 }}>{s.ust}</Text> : null}
          <Karakter kim="usta" ruh={basarisiz ? 'kizgin' : 'mutlu'} boyut={110} />
          <Text style={[st.baslik, { textAlign: 'center', marginTop: 6 }]}>{basarisiz ? 'Bu sefer olmadı' : s.baslik || g.baslik}</Text>
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
      <Ust baslik="Tamamlama belgesi" onKapat={onGeri} />
      <TextInput value={ad} onChangeText={setAd} placeholder="Belgede görünecek adın" maxLength={40}
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: R.cizgi, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16 }} />
      <Kart style={{ alignItems: 'center', padding: 24, borderWidth: 3, borderColor: paket.meslek.renkler?.vurgu || R.altin }}>
        <Text style={{ fontWeight: '900', color: R.soluk, letterSpacing: 2 }}>MESLEKTAŞ</Text>
        <Text style={{ fontSize: 22, fontWeight: '900', textAlign: 'center', color: R.yazi, marginTop: 8 }}>{B.baslik}</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: paket.meslek.renkler?.ana, marginVertical: 16 }}>{ad || 'Adını yaz'}</Text>
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
  const girdi = { backgroundColor: '#fff', borderWidth: 1, borderColor: R.cizgi, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 10 };
  if (oturum) return (
    <Ekran>
      <Ust baslik="Hesabım" onKapat={onGeri} />
      <Kart><Text style={{ color: R.soluk }}>Giriş yapılan e-posta</Text><Text style={{ fontSize: 18, fontWeight: '800', color: R.yazi }}>{oturum.user.email}</Text>
        <Text style={{ color: R.soluk, marginTop: 10 }}>İlerlemen sunucuya kaydediliyor; telefon değiştirsen de kaybolmaz.</Text></Kart>
      <Dugme yazi="Çıkış yap" ikincil style={{ marginTop: 16 }} onPress={() => calistir(async () => { await supabase.auth.signOut(); })} />
    </Ekran>
  );
  return (
    <Ekran>
      <Ust baslik="Giriş yap" onKapat={onGeri} />
      <Text style={[st.alt, { marginBottom: 14 }]}>Hesapsız da oynayabilirsin. Hesap açarsan ilerlemen ve rozetlerin sunucuda saklanır.</Text>
      <TextInput value={eposta} onChangeText={setEposta} placeholder="E-posta" autoCapitalize="none" keyboardType="email-address" style={girdi} />
      <TextInput value={sifre} onChangeText={setSifre} placeholder="Şifre (en az 8 karakter)" secureTextEntry style={girdi} />
      {bekle ? <ActivityIndicator style={{ marginVertical: 10 }} /> : null}
      {mesaj ? <Text style={{ color: mesaj.iyi ? R.yesil : R.kirmizi, marginBottom: 10 }}>{mesaj.metin}</Text> : null}
      <Dugme yazi="Giriş yap" kapali={bekle} onPress={() => calistir(async () => {
        const { error } = await supabase.auth.signInWithPassword({ email: eposta.trim(), password: sifre }); if (error) throw new Error('Giriş olmadı: e-posta ya da şifre hatalı.'); onGeri(); })} />
      <Dugme yazi="Yeni hesap aç" ikincil kapali={bekle} style={{ marginTop: 10 }} onPress={() => calistir(async () => {
        if (sifre.length < 8) throw new Error('Şifre en az 8 karakter olmalı.');
        const { data, error } = await supabase.auth.signUp({ email: eposta.trim(), password: sifre }); if (error) throw error;
        if (!data.session) setMesaj({ iyi: true, metin: 'Hesap açıldı. E-postana gelen onay bağlantısına dokun, sonra giriş yap.' }); else onGeri(); })} />
    </Ekran>
  );
}

// ---------------- Görsel kaynakları (lisans gereği atıf) ----------------
function Kaynaklar({ onGeri }) {
  return (
    <Ekran>
      <Ust baslik="Görsel kaynakları" onKapat={onGeri} />
      <Text style={[st.alt, { marginBottom: 14 }]}>Oyundaki fotoğraflar ücretsiz lisanslı kaynaklardandır. Çizimler Meslektaş'a aittir.</Text>
      {Object.entries(FOTOLAR).map(([ad, f]) => (
        <Pressable key={ad} onPress={() => Linking.openURL(f.kaynak)}>
          <Kart style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '800', color: R.yazi }}>{ad}</Text>
            <Text style={{ color: R.soluk }}>Fotoğraf: {f.yazar} · Lisans: {f.lisans}</Text>
            <Text style={{ color: '#5f8fb0', textDecorationLine: 'underline' }} numberOfLines={1}>{f.kaynak}</Text>
          </Kart>
        </Pressable>
      ))}
    </Ekran>
  );
}
