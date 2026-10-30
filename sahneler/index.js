// Animasyonlu sahne kayıt defteri. Paketteki görevde "sahne": "<ad>" yazınca o sahne oynar;
// adımın "animasyon" alanı (yoksa id'si) sahnedeki window.oynat(...) adını verir.
import { webSahneYap } from './WebSahne';
import espressoHtml from './espressoHtml';
import mutfakHtml from './mutfakHtml';
import salonHtml from './salonHtml';
import cizimHtml from './cizimHtml';

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
};
