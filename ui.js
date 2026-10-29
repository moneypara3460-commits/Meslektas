// Ortak görünüm parçaları. Renkler her mesleğin paketinden gelir (meslek.renkler).
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const R = {
  yazi: '#2a211b', soluk: '#8a7a6d', cizgi: '#e6dccd', kagit: '#fffaf2',
  yesil: '#2f7d5b', yesilAcik: '#e3f2ea', kirmizi: '#c8553d', kirmiziAcik: '#fbe6e1', altin: '#d9a441',
};

export const TemaContext = React.createContext({ ana: '#3b2418', vurgu: '#d9a441', zemin: '#f6efe4' });
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
        {onKapat ? <Pressable onPress={onKapat} hitSlop={12} style={st.kapat}><Text style={{ fontSize: 18, color: t.ana }}>✕</Text></Pressable> : null}
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
        style={[st.dugme, ikincil ? { backgroundColor: 'transparent', borderWidth: 2, borderColor: t.ana } : { backgroundColor: t.ana }, kapali && { opacity: 0.45 }]}>
        <Text style={[st.dugmeYazi, { color: ikincil ? t.ana : '#fff' }]}>{yazi}</Text>
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

export const st = StyleSheet.create({
  kapat: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffffaa', marginRight: 10 },
  ustBaslik: { flex: 1, fontSize: 18, fontWeight: '800' },
  dugme: { paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  dugmeYazi: { fontSize: 16, fontWeight: '800' },
  secenek: { borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 10 },
  aciklama: { borderLeftWidth: 4, borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 12 },
  kart: { backgroundColor: R.kagit, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: R.cizgi },
  balon: { flex: 1, marginLeft: 10, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: R.cizgi },
  baslik: { fontSize: 24, fontWeight: '900', color: R.yazi },
  alt: { fontSize: 15, color: R.soluk, lineHeight: 21 },
});
