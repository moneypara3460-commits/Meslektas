// Genel animasyonlu sahne: HTML/SVG sahneyi WebView içinde oynatır.
// html içindeki window.oynat(adim) bitince 'bitti:adim' mesajı yollar. Web önizlemesinde iframe kullanılır.
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { ses, sesDurdur } from '../motor/his';

let WebView = null;
if (Platform.OS !== 'web') { try { WebView = require('react-native-webview').WebView; } catch (e) {} }

export function webSahneYap(html, adimSesleri = {}, oran = 16 / 10) {
  return forwardRef(function WebSahne(_p, ref) {
    const web = useRef(null); const cerceve = useRef(null);
    const bekleyen = useRef({});
    const mesaj = (m) => { if (typeof m === 'string' && m.startsWith('bitti:')) bekleyen.current[m.slice(6)]?.(); };
    useEffect(() => {
      if (Platform.OS !== 'web') return undefined;
      const f = (e) => mesaj(e.data); window.addEventListener('message', f);
      return () => window.removeEventListener('message', f);
    }, []);
    useImperativeHandle(ref, () => ({
      oynat(adim) {
        return new Promise((coz) => {
          const bitir = () => { delete bekleyen.current[adim]; sesDurdur('akis'); coz(); };
          bekleyen.current[adim] = bitir;
          (adimSesleri[adim] || []).forEach(([s, ms]) => setTimeout(() => ses(s), ms));
          if (Platform.OS === 'web') { try { cerceve.current?.contentWindow?.postMessage('oynat:' + adim, '*'); } catch (e) {} }
          else web.current?.injectJavaScript(`window.oynat && window.oynat(${JSON.stringify(adim)}); true;`);
          setTimeout(() => bekleyen.current[adim] && bitir(), 12000); // emniyet
        });
      },
    }));
    return (
      <View style={{ width: '100%', aspectRatio: oran, borderRadius: 18, overflow: 'hidden', marginBottom: 12, backgroundColor: '#e9e4dc' }}>
        {Platform.OS === 'web'
          ? React.createElement('iframe', { ref: cerceve, srcDoc: html, style: { border: 0, width: '100%', height: '100%' } })
          : WebView ? <WebView ref={web} originWhitelist={['*']} source={{ html }} scrollEnabled={false} bounces={false}
              javaScriptEnabled setSupportMultipleWindows={false} style={{ backgroundColor: 'transparent' }}
              onMessage={(e) => mesaj(e.nativeEvent.data)} /> : null}
      </View>
    );
  });
}
