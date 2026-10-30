// Barista · Espresso sahnesi. Telefonda WebView içinde detaylı HTML animasyonu oynar
// (kamera hareketi, ışık, gerçekçi bar). Web önizlemesinde basit sahneye düşer.
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import HTML from './espressoHtml';
import Basit from './EspressoSahneBasit';
import { ses, sesDurdur } from '../motor/his';

const ADIM_SESI = { temizle: ['akis', 300], ogut: ['ogutme', 1400], bastir: ['tik', 900], tak: ['tik', 1700], demle: ['akis', 1000] };

const Zengin = forwardRef(function Zengin(_p, ref) {
  const web = useRef(null);
  const bekleyen = useRef({});
  useImperativeHandle(ref, () => ({
    oynat(adim) {
      return new Promise((coz) => {
        const bitir = () => { delete bekleyen.current[adim]; sesDurdur('akis'); coz(); };
        bekleyen.current[adim] = bitir;
        const s = ADIM_SESI[adim]; if (s) setTimeout(() => ses(s[0]), s[1]);
        web.current?.injectJavaScript(`window.oynat && window.oynat(${JSON.stringify(adim)}); true;`);
        setTimeout(() => bekleyen.current[adim] && bitir(), 9000); // emniyet: mesaj gelmezse oyun takılmasın
      });
    },
  }));
  return (
    <View style={{ width: '100%', aspectRatio: 16 / 10, borderRadius: 18, overflow: 'hidden', marginBottom: 12, backgroundColor: '#efe6d6' }}>
      <WebView ref={web} originWhitelist={['*']} source={{ html: HTML }} scrollEnabled={false} bounces={false}
        javaScriptEnabled setSupportMultipleWindows={false} style={{ backgroundColor: 'transparent' }}
        onMessage={(e) => { const m = e.nativeEvent.data || ''; if (m.startsWith('bitti:')) bekleyen.current[m.slice(6)]?.(); }} />
    </View>
  );
});

export default Platform.OS === 'web' ? Basit : Zengin;
