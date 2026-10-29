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
  tencere: { uri: 'https://pd.w.org/2026/10/1106adfe7fc0bee00.64550116-768x1024.jpg', yazar: 'Carlos Moreno', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/1106adfe7f/' },
  'kizgin-yag': { uri: 'https://pd.w.org/2026/01/184696a6bc6c86f29.10430111-768x460.jpg', yazar: 'Bijay Kumal', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/184696a6bc/' },
  corba: { uri: 'https://pd.w.org/2026/10/1276ac0b6695ceff3.34699452-768x1024.jpg', yazar: 'Dilip Modhavadiya', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/1276ac0b66/' },
  ocak: { uri: 'https://pd.w.org/2025/08/444689cd1c1e142e0.99289815-768x421.jpeg', yazar: 'Topher', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/444689cd1c/' },
  'kurulu-masa': { uri: 'https://pd.w.org/2025/03/8567dfc10bb53809.27261764-768x1024.jpg', yazar: 'WordPress Photo Directory katkıcısı', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/8567dfc10b/' },
  'servis-tabagi': { uri: 'https://pd.w.org/2025/06/935685c7804df3132.65263741-768x1024.jpg', yazar: 'KafleG', lisans: 'CC0', kaynak: 'https://wordpress.org/photos/photo/935685c780/' },
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
