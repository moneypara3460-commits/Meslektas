// Şablon kayıt defteri. Yeni bir beceri oyunu = yeni dosya + buraya bir satır.
import Bilgi from './Bilgi';
import Soru from './Soru';
import Senaryo from './Senaryo';
import Uyum from './Uyum';
import Siralama from './Siralama';
import Siniflandirma from './Siniflandirma';
import Hesap from './Hesap';
import Zamanlama from './Zamanlama';
import Ayar from './Ayar';
import Kopurtme from './Kopurtme';

export const SABLONLAR = {
  bilgi: Bilgi, soru: Soru, sinav: Soru, senaryo: Senaryo, uyum: Uyum, siralama: Siralama,
  siniflandirma: Siniflandirma, hesap: Hesap, zamanlama: Zamanlama, ayar: Ayar, kopurtme: Kopurtme,
};

export const SABLON_ETIKET = {
  bilgi: 'Bilgi kartları', soru: 'Soru', sinav: 'Kademe sınavı', senaryo: 'Senaryo', uyum: 'Kendini tanı', siralama: 'Sıralama',
  siniflandirma: 'Yerleştir', hesap: 'Hesap', zamanlama: 'Beceri', ayar: 'Beceri', kopurtme: 'Beceri',
};
