#!/usr/bin/env python3
"""Meslek içerik çevirisi aracı.

  python3 araclar/ceviri.py cikar barista            -> araclar/_cevir/barista.tr.txt (numaralı satırlar)
  python3 araclar/ceviri.py yaz barista en dosya.txt  -> icerik/ceviri/en/barista.json
  python3 araclar/ceviri.py liste                     -> icerik/ceviri/index.js yeniden üretilir

Kural: icerik/index.js içindeki CEVIR anahtarlarıyla aynı. Bir metin, en yakın sözlük anahtarı
CEVIR listesindeyse çevrilir. Sıra = JSON'daki sıra (Python ve JavaScript ikisi de korur).
"""
import json, os, re, sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CEVIR = {'aciklama', 'ad', 'baslik', 'birim', 'calismaKosullari', 'erkenMetni', 'gecMetni', 'giris', 'ipucu', 'kademeler',
         'kalemler', 'kaynaklar', 'kural', 'maddeler', 'metin', 'musteri', 'neden', 'not', 'secenekler', 'senaryoBasla',
         'senaryoBitir', 'sonraki', 'soru', 'tanim', 'tehlikeMetni', 'terim', 'ucYildiz', 'usta'}
DILLER = ['en', 'de', 'ar']


def topla(o, anahtar=None, out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items(): topla(v, k, out)
    elif isinstance(o, list):
        for v in o: topla(v, anahtar, out)
    elif isinstance(o, str) and anahtar in CEVIR:
        out.append(o)
    return out


def ozet(metinler):  # icerik/index.js içindeki ozet() ile aynı (djb2, 32 bit)
    h = 5381
    for ch in '\u0001'.join(metinler):
        if ord(ch) > 0xFFFF:  # JS charCodeAt ile aynı olsun diye vekil çiftlere böl
            v = ord(ch) - 0x10000
            for c in (0xD800 + (v >> 10), 0xDC00 + (v & 0x3FF)):
                h = ((h * 33) ^ c) & 0xFFFFFFFF
        else:
            h = ((h * 33) ^ ord(ch)) & 0xFFFFFFFF
    return h


def paket(mid):
    return json.load(open(os.path.join(KOK, 'icerik', mid + '.json'), encoding='utf-8'))


def cikar(mid):
    m = topla(paket(mid))
    d = os.path.join(os.path.dirname(KOK), '_cevir'); os.makedirs(d, exist_ok=True)
    yol = os.path.join(d, mid + '.tr.txt')
    with open(yol, 'w', encoding='utf-8') as f:
        for i, s in enumerate(m, 1): f.write(f'{i}\t' + s.replace('\n', '\\n') + '\n')
    print(yol, len(m), 'metin')


def yaz(mid, dil, dosya):
    m = topla(paket(mid))
    satir = {}
    for l in open(dosya, encoding='utf-8'):
        l = l.rstrip('\n')
        if not l.strip(): continue
        n, _, s = l.partition('\t')
        satir[int(n)] = s.replace('\\n', '\n')
    eksik = [i for i in range(1, len(m) + 1) if not satir.get(i, '').strip()]
    fazla = [i for i in satir if i > len(m)]
    if eksik or fazla: sys.exit(f'HATA {mid}/{dil}: eksik {eksik[:20]} fazla {fazla[:20]} (toplam {len(m)})')
    # sayı ve süre gibi rakamlar korunmuş mu? (uyarı)
    for i, s in enumerate(m, 1):
        a = re.findall(r'\d+', s); b = re.findall(r'[\d٠-٩]+', satir[i])
        if dil != 'ar' and sorted(a) != sorted(b): print(f'  uyarı {i}: rakamlar farklı | {s[:60]} | {satir[i][:60]}')
    d = os.path.join(KOK, 'icerik', 'ceviri', dil); os.makedirs(d, exist_ok=True)
    json.dump({'ozet': ozet(m), 'n': len(m), 'metinler': [satir[i] for i in range(1, len(m) + 1)]},
              open(os.path.join(d, mid + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'{mid}/{dil}: {len(m)} metin yazıldı')
    liste()


def liste():
    d = os.path.join(KOK, 'icerik', 'ceviri')
    satirlar = ['// Otomatik üretilir: python3 araclar/ceviri.py liste', 'export const CEVIRILER = {']
    for dil in DILLER:
        dd = os.path.join(d, dil)
        ids = sorted(f[:-5] for f in os.listdir(dd) if f.endswith('.json')) if os.path.isdir(dd) else []
        satirlar.append(f'  {dil}: {{ ' + ', '.join(f"{i}: require('./{dil}/{i}.json')" for i in ids) + ' },')
    satirlar.append('};')
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.js'), 'w', encoding='utf-8').write('\n'.join(satirlar) + '\n')


if __name__ == '__main__':
    k = sys.argv[1]
    if k == 'cikar': [cikar(x) for x in sys.argv[2:]]
    elif k == 'yaz': yaz(sys.argv[2], sys.argv[3], sys.argv[4])
    elif k == 'liste': liste()
