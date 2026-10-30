// Oyundaki meslekler. Yeni meslek = yeni JSON paketi + buraya bir satır.
import barista from './barista.json';
import asci from './asci.json';
import servis from './servis.json';
import mimar from './mimar.json';
import insaat from './insaat.json';
import freze from './freze.json';
import kaynak from './kaynak.json';
import yazilim from './yazilim.json';
import grafik from './grafik.json';
import muhasebe from './muhasebe.json';

export const MESLEKLER = [barista, asci, servis, mimar, insaat, freze, kaynak, yazilim, grafik, muhasebe];
export const meslekBul = (id) => MESLEKLER.find((p) => p.meslek.id === id);
