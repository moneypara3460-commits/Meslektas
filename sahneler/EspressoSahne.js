// Barista · Espresso sahnesi. Sıralama görevindeki her doğru adımda ilgili animasyon oynar.
// Tüm çizimler Meslektaş'a aittir. Sahne 320x240'lık bir alanda tasarlandı, ekrana göre ölçeklenir.
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import Svg, { Rect, Path, Circle, Ellipse, G } from 'react-native-svg';
import { ses, sesDurdur } from '../motor/his';

const CELIK = '#b8bcc2', CELIK_ACIK = '#dfe3e8', CELIK_KOYU = '#8f949b', KOYU = '#2a211b', KAHVE = '#5a3826', CREMA = '#c98a5a';
const BAS = { x: 110, y: 128 };       // grup başlığının alt ortası
const EV = { x: 205, y: 172 };        // portafiltrenin tezgâhtaki yeri (sol üst)
const TAKILI = { x: BAS.x - 25, y: BAS.y }; // takılıyken sol üst (sepet merkezi = sol + 25)

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const calistir = (anim) => new Promise((r) => anim.start(() => r()));

export default forwardRef(function EspressoSahne(_props, ref) {
  const [W, setW] = useState(0);
  const s = W / 320;

  const v = useRef({
    yikama: new Animated.Value(0), bez: new Animated.Value(0), bezX: new Animated.Value(0),
    tanecik: new Animated.Value(0), tepe: new Animated.Value(0), duz: new Animated.Value(0), sikis: new Animated.Value(1),
    tamper: new Animated.Value(0), tamperGor: new Animated.Value(0),
    pf: new Animated.Value(0), pfDon: new Animated.Value(0), fincan: new Animated.Value(0),
    akis: new Animated.Value(0), dolum: new Animated.Value(0), sayac: new Animated.Value(0), buhar: new Animated.Value(0),
  }).current;
  const [okuma, setOkuma] = useState(null);

  useImperativeHandle(ref, () => ({
    async oynat(adim) {
      if (adim === 'temizle') {
        ses('akis');
        await calistir(Animated.timing(v.yikama, { toValue: 1, duration: 250, useNativeDriver: false }));
        await bekle(700); sesDurdur('akis');
        await calistir(Animated.timing(v.yikama, { toValue: 0, duration: 250, useNativeDriver: false }));
      } else if (adim === 'sil') {
        await calistir(Animated.timing(v.bez, { toValue: 1, duration: 150, useNativeDriver: true }));
        await calistir(Animated.sequence([0, 1, 2].map(() => Animated.sequence([
          Animated.timing(v.bezX, { toValue: 1, duration: 140, useNativeDriver: true }),
          Animated.timing(v.bezX, { toValue: -1, duration: 140, useNativeDriver: true })]))));
        v.bezX.setValue(0);
        await calistir(Animated.timing(v.bez, { toValue: 0, duration: 150, useNativeDriver: true }));
      } else if (adim === 'ogut') {
        ses('ogutme');
        v.tanecik.setValue(0);
        await calistir(Animated.parallel([
          Animated.timing(v.tanecik, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(v.tepe, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true })]));
      } else if (adim === 'dagit') {
        await calistir(Animated.parallel([
          Animated.timing(v.tepe, { toValue: 0, duration: 450, useNativeDriver: true }),
          Animated.timing(v.duz, { toValue: 1, duration: 450, useNativeDriver: true })]));
      } else if (adim === 'bastir') {
        await calistir(Animated.timing(v.tamperGor, { toValue: 1, duration: 150, useNativeDriver: true }));
        await calistir(Animated.timing(v.tamper, { toValue: 1, duration: 420, easing: Easing.in(Easing.quad), useNativeDriver: true }));
        ses('tik');
        await calistir(Animated.timing(v.sikis, { toValue: 0.65, duration: 180, useNativeDriver: true }));
        await bekle(200);
        await calistir(Animated.parallel([
          Animated.timing(v.tamper, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.timing(v.tamperGor, { toValue: 0, duration: 350, useNativeDriver: true })]));
      } else if (adim === 'tak') {
        await calistir(Animated.timing(v.pf, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }));
        ses('tik');
        await calistir(Animated.parallel([
          Animated.timing(v.pfDon, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(v.fincan, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true })]));
      } else if (adim === 'demle') {
        ses('akis');
        const id = v.sayac.addListener(({ value }) => setOkuma({ sn: Math.round(value * 28), g: (value * 36).toFixed(1) }));
        await calistir(Animated.timing(v.akis, { toValue: 1, duration: 300, useNativeDriver: false }));
        await calistir(Animated.parallel([
          Animated.timing(v.dolum, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: false }),
          Animated.timing(v.sayac, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: false }),
          Animated.timing(v.buhar, { toValue: 1, duration: 2400, useNativeDriver: true })]));
        sesDurdur('akis');
        await calistir(Animated.timing(v.akis, { toValue: 0, duration: 250, useNativeDriver: false }));
        v.sayac.removeListener(id);
      }
    },
  }));

  const P = (x) => x * s;
  const pfX = v.pf.interpolate({ inputRange: [0, 1], outputRange: [0, P(TAKILI.x - EV.x)] });
  const pfY = v.pf.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, P(-70), P(TAKILI.y - EV.y)] });
  const pfRot = v.pfDon.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] });

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%', aspectRatio: 320 / 240, borderRadius: 18, overflow: 'hidden', backgroundColor: '#f6efe4', marginBottom: 12 }}>
      {W > 0 ? <>
        {/* Arka plan ve makine */}
        <Svg width={W} height={P(240)} viewBox="0 0 320 240" style={{ position: 'absolute' }}>
          <Rect x="0" y="0" width="320" height="240" fill="#f6efe4" />
          <Rect x="0" y="0" width="320" height="8" fill="#eadfcd" />
          <Rect x="230" y="30" width="70" height="6" rx="3" fill="#d9c7ad" />
          <Rect x="238" y="14" width="14" height="16" rx="3" fill="#fffaf2" stroke="#e6dccd" />
          <Rect x="258" y="18" width="12" height="12" rx="3" fill="#fffaf2" stroke="#e6dccd" />
          <Rect x="276" y="12" width="16" height="18" rx="3" fill="#3b2418" />
          <Rect x="0" y="194" width="320" height="46" fill="#c9a27a" />
          <Rect x="0" y="194" width="320" height="5" fill="#b38a62" />
          <Rect x="30" y="22" width="160" height="104" rx="10" fill={CELIK} />
          <Rect x="30" y="22" width="160" height="16" rx="8" fill={CELIK_ACIK} />
          <Rect x="38" y="10" width="144" height="12" rx="4" fill="#4a3f38" />
          <Circle cx="150" cy="62" r="13" fill="#fffaf2" stroke={KOYU} strokeWidth="2" />
          <Path d="M150 62 L157 55" stroke="#c8553d" strokeWidth="2.5" strokeLinecap="round" />
          <Rect x="52" y="54" width="22" height="10" rx="3" fill={CELIK_KOYU} />
          <Path d="M85 112 L135 112 L131 128 L89 128 Z" fill={CELIK_KOYU} />
          <Rect x="94" y="126" width="32" height="3" fill="#6f747a" />
          <Path d="M180 70 L186 70 L186 150 Q186 158 178 160" stroke={CELIK_KOYU} strokeWidth="5" fill="none" strokeLinecap="round" />
          <Rect x="30" y="126" width="160" height="60" fill="#d1d5da" />
          <Rect x="60" y="186" width="100" height="8" rx="2" fill={CELIK_KOYU} />
          {[66, 76, 86, 96, 106, 116, 126, 136, 146].map((x) => <Rect key={x} x={x} y="187" width="4" height="6" fill="#6f747a" />)}
        </Svg>

        {/* Su yıkama (temizle) */}
        <Animated.View style={{ position: 'absolute', left: P(BAS.x - 4), top: P(BAS.y), width: P(8), borderRadius: P(4), backgroundColor: '#9fd0ea', opacity: 0.85,
          height: v.yikama.interpolate({ inputRange: [0, 1], outputRange: [0, P(58)] }) }} />

        {/* Fincan ve terazi (tak ile gelir) */}
        <Animated.View style={{ position: 'absolute', left: P(BAS.x - 30), top: P(150), width: P(60), height: P(36),
          opacity: v.fincan, transform: [{ translateX: v.fincan.interpolate({ inputRange: [0, 1], outputRange: [P(80), 0] }) }] }}>
          <View style={{ position: 'absolute', left: P(4), top: P(28), width: P(52), height: P(8), borderRadius: P(2), backgroundColor: KOYU }} />
          <View style={{ position: 'absolute', left: P(13), top: P(6), width: P(34), height: P(22), borderBottomLeftRadius: P(10), borderBottomRightRadius: P(10), backgroundColor: '#fffaf2', borderWidth: 1, borderColor: '#e6dccd', overflow: 'hidden' }}>
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: KAHVE,
              height: v.dolum.interpolate({ inputRange: [0, 1], outputRange: [0, P(15)] }) }}>
              <View style={{ height: P(3), backgroundColor: CREMA }} />
            </Animated.View>
          </View>
          <View style={{ position: 'absolute', left: P(46), top: P(10), width: P(8), height: P(10), borderTopRightRadius: P(5), borderBottomRightRadius: P(5), borderWidth: P(2), borderLeftWidth: 0, borderColor: '#e6dccd' }} />
        </Animated.View>

        {/* Akış (demle) */}
        {[-3, 3].map((dx) => (
          <Animated.View key={dx} style={{ position: 'absolute', left: P(BAS.x + dx - 1), top: P(BAS.y + 22), width: P(2.5), backgroundColor: '#7a4a2a', borderRadius: P(1),
            height: v.akis.interpolate({ inputRange: [0, 1], outputRange: [0, P(10)] }) }} />
        ))}

        {/* Buhar */}
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={{ position: 'absolute', left: P(BAS.x - 8 + i * 8), top: P(140), width: P(4), height: P(10), borderRadius: P(2), backgroundColor: '#ffffff',
            opacity: v.buhar.interpolate({ inputRange: [0, 0.2, 0.9, 1], outputRange: [0, 0.7, 0.5, 0] }),
            transform: [{ translateY: v.buhar.interpolate({ inputRange: [0, 1], outputRange: [0, P(-14 - i * 3)] }) }] }} />
        ))}

        {/* Düşen kahve tanecikleri (öğüt) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Animated.View key={i} style={{ position: 'absolute', left: P(EV.x + 14 + (i % 3) * 8), top: P(EV.y - 10), width: P(4), height: P(4), borderRadius: P(2), backgroundColor: KAHVE,
            opacity: v.tanecik.interpolate({ inputRange: [0, 0.05, 0.95, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: v.tanecik.interpolate({ inputRange: [0, 1], outputRange: [P(-90 - i * 18), P(8)] }) }] }} />
        ))}

        {/* Portafiltre (içindeki kahveyle birlikte hareket eder) */}
        <Animated.View style={{ position: 'absolute', left: P(EV.x), top: P(EV.y), width: P(110), height: P(22),
          transform: [{ translateX: pfX }, { translateY: pfY }, { rotate: pfRot }] }}>
          <Svg width={P(110)} height={P(22)} viewBox="0 0 110 22">
            <Path d="M46 6 L104 2 Q110 2 110 7 Q110 12 104 12 L48 14 Z" fill="#3b2418" />
            <Path d="M0 2 L50 2 L47 15 Q44 20 25 20 Q6 20 3 15 Z" fill={CELIK} />
            <Rect x="0" y="0" width="50" height="5" rx="2" fill={CELIK_ACIK} />
            <Rect x="19" y="19" width="12" height="3" fill={CELIK_KOYU} />
          </Svg>
          <Animated.View style={{ position: 'absolute', left: P(6), top: P(-6), width: P(38), height: P(10), borderTopLeftRadius: P(19), borderTopRightRadius: P(19), backgroundColor: KAHVE,
            opacity: v.tepe, transform: [{ scaleY: v.tepe }] }} />
          <Animated.View style={{ position: 'absolute', left: P(5), top: P(1), width: P(40), height: P(4), borderRadius: P(1), backgroundColor: KAHVE,
            opacity: v.duz, transform: [{ scaleY: v.sikis }, { translateY: v.sikis.interpolate({ inputRange: [0.65, 1], outputRange: [P(1), 0] }) }] }} />
        </Animated.View>

        {/* Bez (sil) */}
        <Animated.View style={{ position: 'absolute', left: P(EV.x + 4), top: P(EV.y - 10), width: P(42), height: P(14), borderRadius: P(4), backgroundColor: '#f2c94c',
          opacity: v.bez, transform: [{ translateX: v.bezX.interpolate({ inputRange: [-1, 1], outputRange: [P(-8), P(8)] }) }, { rotate: '-6deg' }] }} />

        {/* Tamper (bastır) */}
        <Animated.View style={{ position: 'absolute', left: P(EV.x + 6), top: P(EV.y - 48), width: P(38), height: P(48), opacity: v.tamperGor,
          transform: [{ translateY: v.tamper.interpolate({ inputRange: [0, 1], outputRange: [P(-40), P(2)] }) }] }}>
          <Svg width={P(38)} height={P(48)} viewBox="0 0 38 48">
            <Path d="M10 2 Q19 -1 28 2 L28 26 Q28 30 23 30 L15 30 Q10 30 10 26 Z" fill="#c8553d" />
            <Rect x="16" y="30" width="6" height="8" fill={CELIK_KOYU} />
            <Rect x="0" y="38" width="38" height="9" rx="2" fill={CELIK} />
          </Svg>
        </Animated.View>

        {/* Süre ve gram göstergesi */}
        {okuma ? (
          <View style={{ position: 'absolute', right: P(10), top: P(56), backgroundColor: KOYU, borderRadius: P(8), paddingHorizontal: P(8), paddingVertical: P(5) }}>
            <Text style={{ color: '#9fd3b4', fontWeight: '900', fontSize: Math.max(11, P(12)) }}>⏱ {okuma.sn} sn</Text>
            <Text style={{ color: '#9fd3b4', fontWeight: '900', fontSize: Math.max(11, P(12)) }}>⚖️ {okuma.g} g</Text>
          </View>
        ) : null}
      </> : null}
    </View>
  );
});
