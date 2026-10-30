// Ortak görünüm parçaları. Renkler her mesleğin paketinden gelir (meslek.renkler).
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

// Marka renkleri: tanıtım sitesiyle aynı (lacivert, mavi, gök mavisi, beyaz).
export const MARKA = { lacivert: '#0a1f44', lacivert2: '#12305f', mavi: '#1e63d6', mavi2: '#3b82f6', gok: '#7cc4ff', buz: '#eef5ff', zemin: '#f2f7ff' };

export const R = {
  yazi: '#0f1e36', soluk: '#5d6b82', cizgi: '#dbe6f5', kagit: '#ffffff',
  yesil: '#16a34a', yesilAcik: '#e7f8ee', kirmizi: '#dc4b3e', kirmiziAcik: '#fdecea', altin: '#f5b301',
};

export const TemaContext = React.createContext({ ana: MARKA.lacivert, vurgu: MARKA.mavi2, zemin: MARKA.zemin });
export const useTema = () => React.useContext(TemaContext);

export function Ekran({ children, kaydir = true, alt }) {
  const t = useTema(); const ins = useSafeAreaInsets();
  const ic = <View style={{ padding: 18, paddingBottom: 28 }}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: t.zemin, paddingTop: ins.top }}>
      {kaydir ? <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">{ic}</ScrollView> : <View style={{ flex: 1 }}>{ic}</View>}
      {alt ? <View style={{ padding: 18, paddingBottom: 18 + ins.bottom, borderTopWidth: 1, borderColor: R.cizgi, backgroundColor: t.zemin }}>{alt}</View> : null}
    </View>
  );
}

export function Ust({ baslik, sayac, onKapat, ilerleme }) {
  const t = useTema();
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {onKapat ? <Pressable onPress={onKapat} hitSlop={12} style={[st.kapat, { borderColor: R.cizgi }]}><Text style={{ fontSize: 16, fontWeight: '900', color: t.ana }}>✕</Text></Pressable> : null}
        <Text style={[st.ustBaslik, { color: t.ana }]} numberOfLines={1}>{baslik}</Text>
        {sayac ? <Text style={{ color: R.soluk, fontWeight: '600' }}>{sayac}</Text> : null}
      </View>
      {ilerleme != null ? <Cubuk oran={ilerleme} style={{ marginTop: 10 }} /> : null}
    </View>
  );
}

export function Cubuk({ oran, renk, style, yukseklik = 8 }) {
  const t = useTema(); const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: Math.max(0, Math.min(1, oran)), duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [oran]);
  return (
    <View style={[{ height: yukseklik, borderRadius: 99, backgroundColor: R.cizgi, overflow: 'hidden' }, style]}>
      <Animated.View style={{ height: '100%', borderRadius: 99, backgroundColor: renk || t.vurgu, width: a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function Dugme({ yazi, onPress, ikincil, kapali, style }) {
  const t = useTema(); const s = useRef(new Animated.Value(1)).current;
  const bas = (v) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      <Pressable disabled={kapali} onPress={onPress} onPressIn={() => bas(0.96)} onPressOut={() => bas(1)}
        style={[st.dugme, ikincil ? { backgroundColor: '#fff', borderWidth: 2, borderColor: R.cizgi, borderBottomWidth: 4 } : { backgroundColor: MARKA.mavi, borderBottomWidth: 4, borderColor: '#1749a8' }, kapali && { opacity: 0.45 }]}>
        <Text style={[st.dugmeYazi, { color: ikincil ? MARKA.lacivert : '#fff' }]}>{yazi}</Text>
      </Pressable>
    </Animated.View>
  );
}

// Cevap seçeneği: durum = null | 'dogru' | 'yanlis' | 'soluk'
export function Secenek({ yazi, durum, onPress, kapali }) {
  const bg = durum === 'dogru' ? R.yesilAcik : durum === 'yanlis' ? R.kirmiziAcik : '#fff';
  const kenar = durum === 'dogru' ? R.yesil : durum === 'yanlis' ? R.kirmizi : R.cizgi;
  return (
    <Pressable disabled={kapali} onPress={onPress} style={[st.secenek, { backgroundColor: bg, borderColor: kenar, opacity: durum === 'soluk' ? 0.55 : 1 }]}>
      <Text style={{ fontSize: 16, color: R.yazi, lineHeight: 22 }}>{yazi}</Text>
    </Pressable>
  );
}

export function Aciklama({ iyi, metin }) {
  if (!metin) return null;
  return (
    <Giris>
      <View style={[st.aciklama, { backgroundColor: iyi ? R.yesilAcik : R.kirmiziAcik, borderColor: iyi ? R.yesil : R.kirmizi }]}>
        <Text style={{ color: R.yazi, fontSize: 15, lineHeight: 21 }}>{metin}</Text>
      </View>
    </Giris>
  );
}

export function Kart({ children, style }) { return <View style={[st.kart, style]}>{children}</View>; }

// Ekrana yumuşak giriş animasyonu
export function Giris({ children, gecikme = 0, style }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 380, delay: gecikme, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  return <Animated.View style={[style, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>{children}</Animated.View>;
}

// Karakter yüzü: kim = 'usta' | 'musteri', ruh = 'mutlu' | 'notr' | 'kizgin'
export function Karakter({ kim = 'usta', ruh = 'notr', boyut = 72 }) {
  const t = useTema();
  const ten = kim === 'musteri' ? '#e8b48f' : '#d9a07a';
  const agiz = ruh === 'mutlu' ? 'M24 40 q8 8 16 0' : ruh === 'kizgin' ? 'M24 43 q8 -6 16 0' : 'M25 41 h14';
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 64 64">
      <Circle cx="32" cy="30" r="20" fill={ten} />
      {kim === 'usta'
        ? <><Rect x="14" y="4" width="36" height="12" rx="6" fill="#fff" stroke={t.ana} strokeWidth="1.5" /><Rect x="12" y="14" width="40" height="4" rx="2" fill={t.ana} /></>
        : <Path d="M14 24 q2 -18 18 -18 q16 0 18 18 q-6 -8 -18 -8 q-12 0 -18 8z" fill="#2e2a28" />}
      {ruh === 'kizgin' ? <Path d="M20 22 l8 3 M44 22 l-8 3" stroke="#3b2418" strokeWidth="2.5" strokeLinecap="round" /> : null}
      <Circle cx="25" cy="29" r="2.6" fill="#3b2418" /><Circle cx="39" cy="29" r="2.6" fill="#3b2418" />
      <Path d={agiz} stroke="#3b2418" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Rect x="18" y="56" width="28" height="7" rx="2" fill={kim === 'usta' ? t.vurgu : '#5f8fb0'} />
    </Svg>
  );
}

export function Konusma({ kim, ruh, ad, metin }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
      <Karakter kim={kim} ruh={ruh} />
      <View style={st.balon}>
        {ad ? <Text style={{ color: R.soluk, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>{ad.toUpperCase()}</Text> : null}
        <Text style={{ fontSize: 17, lineHeight: 24, color: R.yazi }}>{metin}</Text>
      </View>
    </View>
  );
}

// Arka plan geçişi (rounded kapsayıcı overflow:'hidden' olmalı)
export function Gradyan({ renkler = [MARKA.lacivert2, MARKA.lacivert], yon = 'dikey', style }) {
  const id = useRef('g' + Math.random().toString(36).slice(2)).current;
  const [x2, y2] = yon === 'yatay' ? ['1', '0'] : yon === 'capraz' ? ['1', '1'] : ['0', '1'];
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs><LinearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
        {renkler.map((r, i) => <Stop key={i} offset={String(i / (renkler.length - 1))} stopColor={r} />)}
      </LinearGradient></Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

// Meslektaş logosu — tanıtım sitesindekiyle aynı çizim, hareketsiz (çekiç havada).
export function Logo({ yukseklik = 56, yazi = true, yaziRenk = '#fff', yaziBoyut }) {
  const g = yukseklik * 184 / 122;
  const ic = (
    <Svg width={g} height={yukseklik} viewBox="96 72 184 122">
      <Rect x="100" y="76" width="110" height="110" rx="26" fill="#1e63d6" />
      <Rect x="100" y="76" width="110" height="55" rx="26" fill="#3b82f6" />
      <Rect x="100" y="106" width="110" height="25" fill="#3b82f6" />
      <Path d="M124 162V100h14l17 26 17-26h14v62h-15V126l-16 23-16-23v36z" fill="#fff" />
      <Rect x="246" y="150" width="9" height="34" rx="3" fill="#cbd5e1" /><Rect x="260" y="150" width="9" height="34" rx="3" fill="#cbd5e1" />
      <Rect x="242" y="182" width="15" height="7" rx="3" fill="#5a3826" /><Rect x="258" y="182" width="15" height="7" rx="3" fill="#5a3826" />
      <Rect x="244" y="112" width="28" height="42" rx="8" fill="#f97316" />
      <Rect x="244" y="132" width="28" height="4" fill="#fde68a" /><Rect x="244" y="142" width="28" height="4" fill="#fde68a" />
      <Rect x="270" y="118" width="7" height="26" rx="3" fill="#f97316" /><Circle cx="273" cy="146" r="4" fill="#f1c6a0" />
      <Circle cx="258" cy="98" r="12" fill="#f1c6a0" /><Circle cx="253" cy="98" r="1.6" fill="#24324d" />
      <Path d="M250 104q4 3 8 0" stroke="#24324d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M245 95a13 13 0 0 1 26 0z" fill="#facc15" />
      <Rect x="240" y="93" width="34" height="5" rx="2" fill="#eab308" /><Rect x="256" y="83" width="4" height="10" rx="2" fill="#eab308" />
      <G transform="rotate(58 262 120)">
        <Path d="M262 120L244 116" stroke="#f97316" strokeWidth="7" strokeLinecap="round" fill="none" />
        <Circle cx="242" cy="115" r="4.5" fill="#f1c6a0" />
        <G transform="rotate(-8 242 115)">
          <Rect x="226" y="112" width="30" height="5" rx="2" fill="#8a5a3c" />
          <Rect x="216" y="100" width="12" height="24" rx="3" fill="#6b7280" />
          <Rect x="216" y="100" width="4" height="24" rx="2" fill="#9ca3af" />
        </G>
      </G>
    </Svg>
  );
  if (!yazi) return ic;
  const b = yaziBoyut || Math.round(yukseklik * 0.42);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {ic}
      <Text style={{ fontSize: b, fontWeight: '900', color: yaziRenk, marginLeft: 6, letterSpacing: -0.5 }}>Meslek<Text style={{ color: MARKA.gok }}>taş</Text></Text>
    </View>
  );
}

export const st = StyleSheet.create({
  kapat: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, marginRight: 10 },
  ustBaslik: { flex: 1, fontSize: 18, fontWeight: '800' },
  dugme: { paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  dugmeYazi: { fontSize: 16, fontWeight: '800' },
  secenek: { borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 10 },
  aciklama: { borderLeftWidth: 4, borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 12 },
  kart: { backgroundColor: R.kagit, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: R.cizgi, shadowColor: '#0a1f44', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  balon: { flex: 1, marginLeft: 10, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: R.cizgi },
  baslik: { fontSize: 24, fontWeight: '900', color: R.yazi },
  alt: { fontSize: 15, color: R.soluk, lineHeight: 21 },
});
