// Oyundaki meslekler. Yeni meslek = yeni JSON paketi + buraya bir satır.
import barista from './barista.json';
import asci from './asci.json';
import servis from './servis.json';
import mimar from './mimar.json';

export const MESLEKLER = [barista, asci, servis, mimar];
export const meslekBul = (id) => MESLEKLER.find((p) => p.meslek.id === id);
