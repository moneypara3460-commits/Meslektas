// Meslek tanıtımı: mesleğe ilk girişte oynayan ~9 saniyelik animasyonlu önizleme.
// Video dosyası yok; her şey kodla çiziliyor, yazılar seçili dilde.
import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gradyan, MARKA } from './ui';
import { t } from './dil';

const anahtar = (id) => 'meslektas:tanitim:' + id;
export async function tanitimGoruldu(id) { try { return (await AsyncStorage.getItem(anahtar(id))) === '1'; } catch (e) { return true; } }
export function tanitimKaydet(id) { AsyncStorage.setItem(anahtar(id), '1').catch(() => {}); }

// ---- sahne parçacıkları ----
// p = { ch | renk, boyut, x, y, dx, dy, egri, sure, gecikme }  (x/y sahne merkezine göre)
function patlama(n, x, y, uzunluk, renkler, boyut = 7, sure = 900) {
  return Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n + (i % 2 ? 0.25 : -0.15); const u = uzunluk * (0.7 + (i % 3) * 0.15);
    return { renk: renkler[i % renkler.length], boyut, x, y, dx: Math.cos(a) * u, dy: Math.sin(a) * u, egri: -14, sure, gecikme: (i % 4) * 140 };
  });
}
const buhar = (x, y, renk = 'rgba(255,255,255,0.75)') => [0, 1, 2].map((i) => ({ renk, boyut: 12, x: x + (i - 1) * 16, y, dx: (i - 1) * 6, dy: -70, egri: 0, sure: 1700, gecikme: i * 550 }));
const dusen = (liste, y0 = -110, y1 = 20) => liste.map((ch, i) => ({ ch, boyut: 26, x: -50 + i * 38, y: y0, dx: 0, dy: y1 - y0, egri: 0, sure: 1300, gecikme: i * 380 }));

const SAHNE = {
  barista: { ana: '☕', parca: buhar(0, -40) },
  asci: { ana: '🍳', parca: [...buhar(0, -40), ...patlama(8, 0, 10, 70, ['#fb923c', '#facc15'], 6, 800)] },
  servis: { ana: '🍽️', parca: [{ ch: '🍷', boyut: 34, x: -140, y: -10, dx: 80, dy: 0, egri: 0, sure: 1500, gecikme: 0 }, ...patlama(6, 0, -10, 90, ['#fde68a', '#ffffff'], 5, 1100)] },
  mimar: { ana: '📐', cizgi: [[-110, 60, 220], [-110, 80, 150], [-110, 100, 190], [-60, 40, 4, 80]] },
  insaat: { ana: '🏗️', parca: dusen(['🧱', '🧱', '🧱', '🧱']) },
  freze: { ana: '⚙️', don: true, parca: patlama(10, 40, 30, 90, ['#cbd5e1', '#94a3b8', '#facc15'], 5, 700) },
  kaynak: { ana: '👨‍🏭', parca: patlama(14, 40, 40, 100, ['#facc15', '#fb923c', '#fff7ae'], 5, 650) },
  yazilim: { ana: '💻', kod: true },
  grafik: { ana: '🎨', parca: patlama(8, 0, 0, 110, ['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7'], 14, 1300) },
  muhasebe: { ana: '🧾', sutun: [40, 70, 55, 95] },
  itfaiye: { ana: '🚒', parca: [0, 1, 2, 3, 4].map((i) => ({ ch: '💧', boyut: 18, x: 30, y: -30, dx: 90 + i * 12, dy: 40, egri: 70, sure: 1100, gecikme: i * 200 })) },
  satis: { ana: '🛒', parca: dusen(['🛍️', '🍎', '🥖', '🧃'], -120, 0) },
};

function Parca({ p }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([Animated.delay(p.gecikme), Animated.timing(v, { toValue: 1, duration: p.sure, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, []);
  const g = [0, 0.25, 0.5, 0.75, 1];
  const ty = g.map((k) => p.y + p.dy * k - p.egri * 4 * k * (1 - k));
  const stil = {
    position: 'absolute', left: '50%', top: '50%',
    opacity: v.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, 1, 1, 0] }),
    transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [p.x, p.x + p.dx] }) }, { translateY: v.interpolate({ inputRange: g, outputRange: ty }) },
      { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1, 0.8] }) }],
  };
  return p.ch ? <Animated.Text style={[stil, { fontSize: p.boyut, marginLeft: -p.boyut / 2, marginTop: -p.boyut / 2 }]}>{p.ch}</Animated.Text>
    : <Animated.View style={[stil, { width: p.boyut, height: p.boyut, borderRadius: p.boyut / 2, backgroundColor: p.renk, marginLeft: -p.boyut / 2, marginTop: -p.boyut / 2 }]} />;
}

// Döngülü büyüyen çizgi (plan çizimi, kod satırı, grafik sütunu)
function Buyuyen({ x, y, w, h, renk, gecikme, dikey }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([Animated.delay(gecikme), Animated.timing(v, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }), Animated.delay(2200 - gecikme), Animated.timing(v, { toValue: 0, duration: 300, useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, []);
  const ic = dikey ? { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [h, 0] }) } : { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-w, 0] }) };
  return (
    <View style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: x, marginTop: dikey ? y - h : y, width: w, height: h, overflow: 'hidden', borderRadius: 3 }}>
      <Animated.View style={{ width: w, height: h, backgroundColor: renk, borderRadius: 3, transform: [ic] }} />
    </View>
  );
}

function Sahne({ id, boy }) {
  const s = SAHNE[id] || { ana: '⭐' };
  const sal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = s.don ? Animated.loop(Animated.timing(sal, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }))
      : Animated.loop(Animated.sequence([Animated.timing(sal, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(sal, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, []);
  const anaStil = s.don ? { transform: [{ rotate: sal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }
    : { transform: [{ translateY: sal.interpolate({ inputRange: [0, 1], outputRange: [4, -6] }) }] };
  const kod = ['#7cc4ff', '#f472b6', '#facc15', '#4ade80', '#7cc4ff'];
  return (
    <View style={{ width: 300, height: boy, alignSelf: 'center' }}>
      <View style={{ position: 'absolute', left: 150 - boy * 0.48, top: boy * 0.02, width: boy * 0.96, height: boy * 0.96, borderRadius: boy, backgroundColor: 'rgba(124,196,255,0.16)' }} />
      <View style={{ position: 'absolute', left: 150 - boy * 0.33, top: boy * 0.17, width: boy * 0.66, height: boy * 0.66, borderRadius: boy, borderWidth: 2, borderColor: 'rgba(124,196,255,0.45)', backgroundColor: 'rgba(255,255,255,0.06)' }} />
      {s.cizgi ? s.cizgi.map(([x, y, w, h], i) => <Buyuyen key={'c' + i} x={x} y={y} w={w} h={h || 3} renk="rgba(124,196,255,0.85)" gecikme={i * 350} />) : null}
      {s.kod ? kod.map((r, i) => <Buyuyen key={'k' + i} x={-100 + (i % 2) * 18} y={-70 + i * 14} w={60 + ((i * 37) % 90)} h={7} renk={r} gecikme={i * 300} />) : null}
      {s.sutun ? s.sutun.map((h, i) => <Buyuyen key={'s' + i} dikey x={30 + i * 22} y={70} w={14} h={h} renk={i === 3 ? '#4ade80' : MARKA.gok} gecikme={i * 300} />) : null}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Text style={[{ fontSize: boy * 0.4 }, anaStil]}>{s.ana}</Animated.Text>
      </View>
      {(s.parca || []).map((p, i) => <Parca key={i} p={p} />)}
    </View>
  );
}

// ---- tanıtım ekranı ----
export function MeslekTanitim({ paket, ikon, onBitti }) {
  const { width: W, height: H } = useWindowDimensions(); const ins = useSafeAreaInsets();
  const z = useRef(new Animated.Value(0)).current; // zaman (ms)
  const bitti = useRef(false);
  useEffect(() => {
    const a = Animated.timing(z, { toValue: 9500, duration: 9500, easing: Easing.linear, useNativeDriver: true }); a.start();
    return () => a.stop();
  }, []);
  const kapat = () => { if (bitti.current) return; bitti.current = true; tanitimKaydet(paket.meslek.id); onBitti(); };
  const ara = (bas, son, a = 0, b = 1) => z.interpolate({ inputRange: [bas, son], outputRange: [a, b], extrapolate: 'clamp' });
  const m = paket.meslek; const k = m.calismaKosullari || [];
  const kartlar = [['🧑‍🏫', t('NE YAPAR?'), m.tanim], ['📍', t('ÇALIŞMA ORTAMI'), k[0]], ['⏱️', t('NASIL BİR TEMPO?'), k.slice(1).join(' · ')]].filter((c) => c[2]);
  const sahneBoy = Math.min(250, H * 0.29); const cw = W - 36;
  const ad = t(m.ad).toLocaleUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: '#050f23' }}>
      <Gradyan renkler={['#17407f', MARKA.lacivert, '#050f23']} />
      {/* üst: ilerleme + geç */}
      <View style={{ position: 'absolute', top: ins.top + 10, left: 18, right: 18, zIndex: 5 }}>
        <View style={{ height: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
          <Animated.View style={{ width: cw, height: 3, backgroundColor: MARKA.gok, transform: [{ translateX: ara(0, 9500, -cw / 2, 0) }, { scaleX: ara(0, 9500, 0.001, 1) }] }} />
        </View>
        <Pressable onPress={kapat} hitSlop={12} style={{ alignSelf: 'flex-end', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{t('Geç ⏭')}</Text>
        </Pressable>
      </View>

      {/* 1: simge ve ad */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: H * 0.27, alignItems: 'center', zIndex: 4,
        opacity: ara(2100, 2700, 1, 0), transform: [{ translateY: ara(2100, 2700, 0, -140) }, { scale: ara(2100, 2700, 1, 0.55) }] }}>
        <Animated.View style={{ position: 'absolute', top: 30, width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: MARKA.gok,
          opacity: ara(350, 1500, 0.9, 0), transform: [{ scale: ara(350, 1500, 0.6, 2.6) }] }} />
        <Animated.Text style={{ color: MARKA.gok, fontWeight: '900', fontSize: 12, letterSpacing: 3, opacity: ara(400, 900) }}>{t('MESLEK TANITIMI')}</Animated.Text>
        <Animated.Text style={{ fontSize: 96, marginVertical: 8, transform: [{ scale: z.interpolate({ inputRange: [200, 750, 1000], outputRange: [0, 1.15, 1], extrapolate: 'clamp' }) },
          { rotate: ara(200, 1000, -40, 0).interpolate({ inputRange: [-40, 0], outputRange: ['-40deg', '0deg'] }) }] }}>{ikon}</Animated.Text>
        <Animated.Text numberOfLines={2} style={{ color: '#fff', fontSize: ad.length > 14 ? 26 : 36, fontWeight: '900', letterSpacing: ad.length > 14 ? 2 : 6, textAlign: 'center', paddingHorizontal: 20,
          opacity: ara(750, 1300), transform: [{ translateY: ara(750, 1300, 20, 0) }] }}>{ad}</Animated.Text>
      </Animated.View>

      {/* 2–5: sahne, bilgiler, kademeler, düğme */}
      <View style={{ flex: 1, paddingTop: ins.top + 64, paddingHorizontal: 18, paddingBottom: ins.bottom + 18 }}>
        <Animated.View style={{ opacity: ara(2600, 3200), transform: [{ scale: ara(2600, 3200, 0.9, 1) }] }}>
          <Sahne id={m.id} boy={sahneBoy} />
        </Animated.View>
        <View style={{ marginTop: 6 }}>
          {kartlar.map(([ik, bas, yazi], i) => (
            <Animated.View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderColor: 'rgba(124,196,255,0.25)', borderRadius: 18, padding: 11, marginTop: 8,
              opacity: ara(4400 + i * 550, 4900 + i * 550), transform: [{ translateX: ara(4400 + i * 550, 4900 + i * 550, 60, 0) }] }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderBottomWidth: 3, borderColor: '#1749a8' }}>
                <Gradyan renkler={[MARKA.mavi2, MARKA.mavi]} /><Text style={{ fontSize: 18 }}>{ik}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: MARKA.gok, fontWeight: '900', fontSize: 10.5, letterSpacing: 1.3 }}>{bas}</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13.5 }} numberOfLines={2}>{yazi}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View style={{ marginTop: 18, opacity: ara(6100, 6500) }}>
          <View style={{ position: 'absolute', left: 30, right: 30, top: 21, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <Animated.View style={{ width: cw - 60, height: 4, backgroundColor: MARKA.gok, transform: [{ translateX: ara(6300, 8200, -(cw - 60) / 2, 0) }, { scaleX: ara(6300, 8200, 0.001, 1) }] }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {paket.kademeler.map((kd, i) => {
              const b = 6400 + i * 450;
              return (
                <View key={i} style={{ width: 62, alignItems: 'center' }}>
                  <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#173562', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View style={{ position: 'absolute', top: -2, left: -2, width: 46, height: 46, borderRadius: 23, overflow: 'hidden', borderWidth: 2, borderColor: MARKA.gok,
                      opacity: ara(b, b + 350), transform: [{ scale: ara(b, b + 350, 0.6, 1.08) }] }}>
                      <Gradyan renkler={[MARKA.mavi2, MARKA.mavi]} />
                    </Animated.View>
                    <Animated.Text style={{ fontSize: 19, opacity: ara(b, b + 350, 0.35, 1) }}>{kd.rozet.ikon}</Animated.Text>
                  </View>
                  <Animated.Text numberOfLines={2} style={{ color: '#fff', fontSize: 10.5, fontWeight: '800', textAlign: 'center', marginTop: 6, opacity: ara(b, b + 350, 0.5, 1) }}>{kd.ad}</Animated.Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />
        <Animated.View style={{ opacity: ara(8300, 8700), transform: [{ translateY: ara(8300, 8700, 30, 0) }, { scale: z.interpolate({ inputRange: [8300, 8600, 8800], outputRange: [0.9, 1.04, 1], extrapolate: 'clamp' }) }] }}>
          <Pressable onPress={kapat} style={{ backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 5, borderColor: '#c7d7f0' }}>
            <Text style={{ color: MARKA.lacivert, fontWeight: '900', fontSize: 18 }}>{t('Hadi başlayalım! →')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
