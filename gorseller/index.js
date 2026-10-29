// Görsel sistemi: önce gerçek fotoğraf, yüklenemezse kendi çizimimiz.
// Kural: yalnızca CC0 / kamu malı ya da atıfla serbest (CC BY, CC BY-SA) fotoğraflar; logo ve tanınabilir yüz yok.
// Her fotoğrafın kaynağı, yazarı ve lisansı FOTOLAR'da durur; "Görsel kaynakları" ekranında gösterilir.
import React, { useState } from 'react';
import { Image } from 'react-native';
import { Cizim, CIZIMLER } from './cizimler';

const UA = { 'User-Agent': 'Meslektas/0.1 (https://github.com/moneypara3460-commits/Meslektas)' };

export const FOTOLAR = {
  'espresso-makinesi': {
    uri: 'https://pd.w.org/2025/03/89167cba34a40cab2.44816739-768x1024.jpg',
    yazar: 'Jayson Gumanid', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/89167cba34/',
  },
  ogutucu: {
    uri: 'https://pd.w.org/2025/09/83168dba78f879cb5.84628665-768x1024.jpeg',
    yazar: 'Abishkaar Chettri', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/83168dba78/',
  },
  tamper: {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tamper_and_tamping_mat.jpg/960px-Tamper_and_tamping_mat.jpg',
    yazar: 'Dorian Bodnariuc', lisans: 'CC BY-SA 3.0', kaynak: 'https://commons.wikimedia.org/wiki/File:Tamper_and_tamping_mat.jpg',
  },
  espresso: {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Espresso_shot.jpg/960px-Espresso_shot.jpg',
    yazar: 'Dorian Bodnariuc', lisans: 'CC BY-SA 3.0', kaynak: 'https://commons.wikimedia.org/wiki/File:Espresso_shot.jpg',
  },
};

export const gorselVar = (ad) => !!(ad && (FOTOLAR[ad] || CIZIMLER[ad]));

// sadeceCizim: resimli şıklarda hepsi aynı tarzda olsun diye (fotoğraf/çizim farkı cevabı ele vermesin)
export function Gorsel({ ad, boyut = 160, sadeceCizim = false }) {
  const [hata, setHata] = useState(false);
  const f = FOTOLAR[ad];
  if (f && !hata && !(sadeceCizim && CIZIMLER[ad])) {
    return <Image source={{ uri: f.uri, headers: UA }} onError={() => setHata(true)}
      style={{ width: boyut, height: boyut * 0.875, borderRadius: 14, backgroundColor: '#e6dccd' }} resizeMode="cover" />;
  }
  return <Cizim ad={ad} boyut={boyut} />;
}
