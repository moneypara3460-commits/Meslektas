// Oyundaki meslekler. Yeni meslek = yeni JSON paketi + buraya bir satır.
import barista from './barista.json';
import asci from './asci.json';

export const MESLEKLER = [barista, asci];
export const meslekBul = (id) => MESLEKLER.find((p) => p.meslek.id === id);
