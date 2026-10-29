// Ses ve titreşim. Sesler Meslektaş için üretildi (telif bize ait).
// Herhangi bir şey çalışmazsa oyun sessizce devam eder; asla çökmez.
import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';

const KAYNAK = {
  tik: require('../sesler/tik.wav'),
  dogru: require('../sesler/dogru.wav'),
  yanlis: require('../sesler/yanlis.wav'),
  basari: require('../sesler/basari.wav'),
  akis: require('../sesler/akis.wav'),
  ogutme: require('../sesler/ogutme.wav'),
};
const oynaticilar = {};

export function ses(ad) {
  try {
    let p = oynaticilar[ad];
    if (!p) { p = createAudioPlayer(KAYNAK[ad]); oynaticilar[ad] = p; }
    p.seekTo(0); p.play();
  } catch (e) {}
}

export function sesDurdur(ad) { try { oynaticilar[ad]?.pause(); } catch (e) {} }

export function titret(tur = 'hafif') {
  try {
    if (tur === 'basari') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (tur === 'hata') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (tur === 'orta') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.selectionAsync();
  } catch (e) {}
}
