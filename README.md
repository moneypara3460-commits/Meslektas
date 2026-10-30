# Meslektaş

Her mesleği meraktan ustalığa kadar oynayarak öğreten mobil oyun. Expo (SDK 54) + Supabase.

## Nasıl çalışır?
- **Bir meslek = bir içerik paketi** (`icerik/*.json`). Motor paketi okur; kod değişmeden yeni meslek eklenir.
- Her meslek kendi içinde baştan sona öğretilir (ör. Merak → Çırak → Kalfa → Usta → Baş barista). İşletme sahipliği ayrı bir meslektir, mesleklerin içine konmaz. Her kademe sınavla biter, rozet kazanılır.
- Görevler **şablonlarla** oynanır (`sablonlar/`):
  - Genel (her meslek kullanır): bilgi, soru, sınav, senaryo, uyum, sıralama, hesap, **sınıflandırma**, **zamanlama**
  - Mesleğe özel beceri: ayar ve köpürtme (Barista)
- Animasyonlu sahneler (`sahneler/`): espresso, mutfak, salon, çizim (Mimar: kat planı çizimi), şantiye (İnşaat Teknisyeni: kolon yapımı), freze (Universal Freze: kanal açma), kaynak (Kaynakçı: gazaltı alın kaynağı), kod (Yazılımcı: hata düzeltme), tasarim (Grafik Tasarımcı: afiş tasarlama), muhasebe (Muhasebe Elemanı: fatura kaydı ve mizan)

## Klasörler
| Yol | İçerik |
|---|---|
| `App.js` | Ekranlar: meslek seçimi, harita, görev, sonuç, belge, hesap |
| `ui.js` | Ortak görünüm parçaları ve tema |
| `sablonlar/` | Görev türleri (yeni tür = yeni dosya + `index.js`'e bir satır) |
| `motor/kurallar.js` | Kilit ve XP kuralları (sunucudaki `gorev_tamamla` ile aynı) |
| `motor/ilerleme.js` | Telefonda kayıt + sunucuyla eşitleme |
| `icerik/` | Meslek paketleri |
| `supabase/` | Veritabanı SQL dosyaları |
| `araclar/dogrula.js` | Paket doğrulayıcı: `node araclar/dogrula.js` |

## Güvenlik
- Oyuncu XP veya rozeti kendisi yazamaz; yalnızca `gorev_tamamla()` sunucu fonksiyonu yazar ve XP'yi pakete göre sunucuda hesaplar.
- Ayrı Supabase projesi: **MESLEKTAS** (BAKPLANLA'dan bağımsız).

## Meslekler
| Meslek | Durum |
|---|---|
| Barista | 26 görev · uzman onayı bekliyor |
| Aşçı | 26 görev · uzman onayı bekliyor |
| Salon Servisi (komi → salon şefi) | 26 görev · uzman onayı bekliyor |
| Mimar (stajyer → proje lideri) | 26 görev · uzman onayı bekliyor |
| İnşaat Teknisyeni (çırak → kıdemli tekniker) | 26 görev · uzman onayı bekliyor |
| Universal Freze Operatörü (çırak → baş usta) | 26 görev · uzman onayı bekliyor |
| Kaynakçı (çırak → ustabaşı) | 26 görev · uzman onayı bekliyor |
| Yazılımcı (stajyer → teknik lider) | 26 görev · uzman onayı bekliyor |
| Grafik Tasarımcı (stajyer → sanat yönetmeni) | 26 görev · uzman onayı bekliyor |
| Muhasebe Elemanı (stajyer → muhasebe şefi) | 26 görev · uzman onayı bekliyor |

Tamamlama belgeleri resmî sertifika değildir.

## Görseller
- `gorseller/cizimler.js`: kendi çizimlerimiz (telif bize ait).
- `gorseller/foto/`: (kullanılmıyor) Snack git içe aktarma ikili dosya (jpg, wav) yükleyemiyor; depoya yalnızca .js/.json/.md konur. Sesler `sesler/veri.js` içinde metin, fotoğraflar internet adresinden.
- Eski not: gerçek fotoğraflar. **Yalnızca Pexels/Unsplash**, logo ve tanınabilir yüz yok, her fotoğrafın linki `gorseller/index.js` → `KAYNAKLAR`'a yazılır.
- Fotoğraf varsa o gösterilir, yoksa çizim. İçerikte bilgi kartına `"gorsel": "portafiltre"`, soruya `"gorsel"` ya da resimli şıklar için `"secenekGorselleri"` yazılır.
