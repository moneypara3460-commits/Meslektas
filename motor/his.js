// Ses ve titreşim. Sesler Meslektaş için üretildi (telif bize ait).
// Herhangi bir şey çalışmazsa oyun sessizce devam eder; asla çökmez.
import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';

import { SESLER } from '../sesler/veri';
const KAYNAK = Object.fromEntries(Object.entries(SESLER).map(([k, uri]) => [k, { uri }]));
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
