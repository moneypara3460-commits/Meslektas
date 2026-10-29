# Meslektaş

Her mesleği meraktan ustalığa kadar oynayarak öğreten mobil oyun. Expo (SDK 54) + Supabase.

## Nasıl çalışır?
- **Bir meslek = bir içerik paketi** (`icerik/*.json`). Motor paketi okur; kod değişmeden yeni meslek eklenir.
- Her meslek 5 kademe: Merak → Çırak → Kalfa → Usta → İşletme sahibi. Her kademe sınavla biter, rozet kazanılır.
- Görevler **şablonlarla** oynanır (`sablonlar/`):
  - Genel (her meslek kullanır): bilgi, soru, sınav, senaryo, uyum, sıralama, hesap, **sınıflandırma**, **zamanlama**
  - Mesleğe özel beceri: ayar ve köpürtme (Barista)

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

Tamamlama belgeleri resmî sertifika değildir.
