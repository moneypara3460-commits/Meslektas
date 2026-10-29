// Görsel sistemi: önce gerçek fotoğraf (varsa), yoksa kendi çizimimiz.
// Fotoğraf eklemek: dosyayı gorseller/foto/ içine koy, FOTOLAR'a satır ekle, kaynağını KAYNAKLAR'a yaz.
import React from 'react';
import { Image } from 'react-native';
import { Cizim, CIZIMLER } from './cizimler';

// Yalnızca Pexels / Unsplash; logo ve tanınabilir yüz yok.
export const FOTOLAR = {
  // ornek: portafiltre: require('./foto/portafiltre.jpg'),
};
export const KAYNAKLAR = {
  // ornek: portafiltre: 'https://www.pexels.com/photo/...',
};

export const gorselVar = (ad) => !!(ad && (FOTOLAR[ad] || CIZIMLER[ad]));

export function Gorsel({ ad, boyut = 160 }) {
  if (FOTOLAR[ad]) return <Image source={FOTOLAR[ad]} style={{ width: boyut, height: boyut * 0.875, borderRadius: 14 }} resizeMode="cover" />;
  return <Cizim ad={ad} boyut={boyut} />;
}
