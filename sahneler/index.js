// Animasyonlu sahne kayıt defteri. Paketteki görevde "sahne": "<ad>" yazınca o sahne oynar;
// adımın "animasyon" alanı (yoksa id'si) sahnedeki window.oynat(...) adını verir.
import { webSahneYap } from './WebSahne';
import espressoHtml from './espressoHtml';
import mutfakHtml from './mutfakHtml';
import salonHtml from './salonHtml';
import cizimHtml from './cizimHtml';
import santiyeHtml from './santiyeHtml';
import frezeHtml from './frezeHtml';
import kaynakHtml from './kaynakHtml';
import kodHtml from './kodHtml';
import tasarimHtml from './tasarimHtml';
import muhasebeHtml from './muhasebeHtml';

export const SAHNELER = {
  espresso: webSahneYap(espressoHtml, {
    temizle: [['akis', 900]], ogut: [['ogutme', 1500]], bastir: [['tik', 1150]], tak: [['tik', 1900]], demle: [['akis', 1100]],
  }),
  mutfak: webSahneYap(mutfakHtml, {
    yika: [['akis', 900]], mercimek: [['akis', 1100]], sogan: [['tik', 1000], ['tik', 1250], ['tik', 1500], ['tik', 1750], ['tik', 2000]],
    pisir: [['akis', 2600]], blender: [['ogutme', 1600]], tat: [['tik', 1500]],
    b_eritt: [['tik', 1600]], b_un: [['tik', 1500]], b_sut: [['akis', 1400]], b_koyulas: [], b_tat: [['tik', 1400]],
  }),
  salon: webSahneYap(salonHtml, {
    topla: [['tik', 1500], ['tik', 1800], ['tik', 2100]], sil: [], kur: [['tik', 600], ['tik', 950], ['tik', 1300]],
    bardak: [['tik', 400], ['tik', 900]], menaj: [['tik', 500]], haber: [['basari', 700]],
  }),
  cizim: webSahneYap(cizimHtml, {
    arsa: [['tik', 900], ['tik', 2600]], aks: [['tik', 700], ['tik', 1500], ['tik', 2300], ['tik', 3100], ['tik', 3900]],
    kolon: [['tik', 750], ['tik', 1000], ['tik', 1250], ['tik', 1500], ['tik', 1750], ['tik', 2000], ['tik', 2250], ['tik', 2500], ['tik', 2750]],
    duvar: [], aciklik: [['tik', 700], ['tik', 1400], ['tik', 2100], ['tik', 2800]], olcu: [['basari', 5200]],
  }),
  santiye: webSahneYap(santiyeHtml, {
    aplikasyon: [['tik', 1900], ['tik', 2400]], donati: [['tik', 2100], ['tik', 2300], ['tik', 2500]],
    paspayi: [['tik', 650], ['tik', 830], ['tik', 1010], ['tik', 1190]], kalip: [['tik', 1300], ['tik', 1800]],
    beton: [['akis', 1300]], vibrator: [['ogutme', 800]], kur: [['akis', 1400], ['basari', 4000]],
  }),
  freze: webSahneYap(frezeHtml, {
    bagla: [['tik', 1300], ['tik', 2100]], takim: [['tik', 1500], ['tik', 1900]], sifir: [['tik', 2700]],
    devir: [['ogutme', 900]], kes: [['ogutme', 900], ['akis', 1000]], olc: [['tik', 2300], ['basari', 4200]],
  }),
  kaynak: webSahneYap(kaynakHtml, {
    temizle: [['ogutme', 1100], ['ogutme', 2800]], hizala: [['tik', 1700], ['tik', 2700]],
    ayar: [['tik', 1000], ['tik', 2900], ['tik', 5300], ['tik', 5650]], punta: [['tik', 1650], ['tik', 3400]],
    kaynak: [['akis', 1600]], kontrol: [['ogutme', 700], ['basari', 2600]],
  }),
  kod: webSahneYap(kodHtml, {
    yeniden: [['tik', 900], ['yanlis', 2200]], bul: [['tik', 900], ['tik', 1300]],
    test: [['tik', 1000], ['tik', 1600], ['tik', 2300], ['tik', 3300], ['yanlis', 3500]], duzelt: [['tik', 1600], ['tik', 2050], ['dogru', 2300]],
    calistir: [['tik', 1000], ['akis', 1300], ['dogru', 2500]], gonder: [['tik', 1100], ['tik', 1700], ['dogru', 3200], ['basari', 4000]],
  }),
  tasarim: webSahneYap(tasarimHtml, {
    brif: [['tik', 1500], ['tik', 1800], ['tik', 2100], ['tik', 2400], ['tik', 2700], ['tik', 3000]], eskiz: [['akis', 900]],
    izgara: [['tik', 1000], ['tik', 1700]], yerlestir: [['tik', 1100], ['tik', 1550], ['tik', 2000]],
    renk: [['tik', 800], ['akis', 1400], ['dogru', 2300]], teslim: [['tik', 900], ['dogru', 2900], ['basari', 4600]],
  }),
  muhasebe: webSahneYap(muhasebeHtml, {
    kontrol: [['tik', 1300], ['tik', 1800], ['tik', 2300], ['tik', 2800], ['tik', 3300]], hesap: [['tik', 1700], ['tik', 2150], ['tik', 2600]],
    kaydet: [['tik', 1300], ['tik', 2000], ['tik', 2700]], denge: [['akis', 1100], ['dogru', 2300]],
    arsiv: [['tik', 1000], ['akis', 1700]], mizan: [['tik', 1300], ['dogru', 2900], ['basari', 3700]],
  }),
};
