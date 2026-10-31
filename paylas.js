// Paylaşılabilir sonuç kartı: kademe rozeti, tamamlama belgesi ve Meslek Pusulası sonucu.
// Telefonda kart resim olarak paylaşılır; resim alınamazsa (ör. web önizleme) yazı olarak paylaşılır.
import React, { useRef, useState } from 'react';
import { View, Text, Modal, Pressable, Share, Platform, ActivityIndicator } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Gradyan, Logo, Dugme, MARKA } from './ui';
import { t } from './dil';

export const SITE = 'moneypara3460-commits.github.io/meslektas-site';

// v = { ikon, ust, baslik, alt, etiketler: [] , metin }
export function PaylasKarti({ v }) {
  return (
    <View style={{ width: 300, height: 375, borderRadius: 28, overflow: 'hidden', padding: 22 }}>
      <Gradyan renkler={[MARKA.mavi, MARKA.lacivert]} />
      <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: MARKA.mavi2, opacity: 0.18, top: -90, right: -90 }} />
      <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: MARKA.gok, opacity: 0.1, bottom: -60, left: -60 }} />

      <Logo yukseklik={30} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, borderColor: 'rgba(124,196,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 56 }}>{v.ikon}</Text>
        </View>
        <Text style={{ color: MARKA.gok, fontWeight: '900', fontSize: 11, letterSpacing: 1.5, marginTop: 14, textAlign: 'center' }}>{v.ust}</Text>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 24, textAlign: 'center', marginTop: 4 }} numberOfLines={2}>{v.baslik}</Text>
        {v.alt ? <Text style={{ color: '#dbeafe', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }} numberOfLines={3}>{v.alt}</Text> : null}
        {v.etiketler && v.etiketler.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
          {v.etiketler.map((e, i) => <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, margin: 3 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{e}</Text></View>)}
        </View> : null}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 10, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{t('Sen de dene 👉 Meslektaş')}</Text>
        <Text style={{ color: MARKA.gok, fontSize: 10, marginTop: 2 }}>{SITE}</Text>
      </View>
    </View>
  );
}

export function PaylasModal({ v, onKapat }) {
  const kart = useRef(null);
  const [mesgul, setMesgul] = useState(false);
  if (!v) return null;
  const metin = `${v.metin || `${v.ust}: ${v.baslik}`}\n${t('Sen de dene 👉 Meslektaş')}\nhttps://${SITE}`;
  const paylas = async () => {
    setMesgul(true);
    try {
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(kart, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('Sonucunu paylaş') });
      } else await Share.share({ message: metin });
    } catch (e) {
      try { await Share.share({ message: metin }); } catch (_) {}
    }
    setMesgul(false);
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onKapat}>
      <Pressable onPress={onKapat} style={{ flex: 1, backgroundColor: 'rgba(5,15,35,0.75)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Pressable onPress={() => {}} style={{ alignItems: 'center' }}>
          <View ref={kart} collapsable={false} style={{ borderRadius: 28 }}><PaylasKarti v={v} /></View>
          <View style={{ width: 300, marginTop: 16 }}>
            {mesgul ? <ActivityIndicator color="#fff" style={{ marginVertical: 14 }} />
              : <Dugme yazi={t('📤 Paylaş')} onPress={paylas} />}
            <Pressable onPress={onKapat} style={{ padding: 12, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{t('Kapat')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
