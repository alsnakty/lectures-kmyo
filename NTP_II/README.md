# Nesne Tabanlı Programlama II

Karaisalı Meslek Yüksekokulu · Bilgisayar Programcılığı

Dersin haftalık konu anlatımları. Her sayfa tek başına okunabilir; kod örnekleri,
tablolar, şemalar ve konu sonu testi içerir. Sayfalar tarayıcıda açılır, kurulum
gerektirmez.

**Site:** <https://alsnakty.github.io/lectures-kmyo/NTP_II/>

## Haftalık konular

| Hafta | Konu |
|---|---|
| 1 | [Giriş: Python ile Neler Yapılır](giris.html) |
| 2 | [Fonksiyonlar](fonksiyonlar.html) |
| 3 | [Hata Yönetimi](hata-yonetimi.html) |
| 4-5 | [Dosya İşlemleri](dosya-islemleri.html) |
| 6 | [Sınıflara Giriş](siniflar.html) |
| 7 | [Metotlar ve Dunder](metotlar.html) |
| 10 | [Kalıtım](kalitim.html) |
| 11 | [Polimorfizm ve Kapsülleme](polimorfizm.html) |
| 12 | [Modüller](moduller.html) |
| 13 | [Veri Kütüphaneleri](veri-kutuphaneleri.html) |
| 14 | [Python ile Başka Neler Yapılır](neler-yapilir.html) |

Sınav ve ara haftalar: 8. hafta vize · 9. hafta vize çözümü ve sınıf tekrarı ·
15. hafta final. Tam plan ana sayfadadır.

Dönem projesi yönergesi: [NTP_II_Proje_Yonergesi.pdf](NTP_II_Proje_Yonergesi.pdf)

## Yerelde açmak

Depoyu indirip `NTP_II/index.html` dosyasına çift tıklamanız yeterlidir;
internet bağlantısı gerekmez. Tarayıcı yerel dosyalar arasında geçişi
kısıtlarsa klasörün içinde küçük bir sunucu açabilirsiniz:

```
python -m http.server 8000
```

Ardından `http://localhost:8000` adresine girin.

## Klasör düzeni

```
index.html                  ana sayfa (haftalık plan)
giris.html … neler-yapilir.html   konu sayfaları
css/ders.css                ortak stil
js/ders.js                  ortak betik
images/                     şemalar
404.html                    bulunamadı sayfası
NTP_II_Proje_Yonergesi.pdf  dönem projesi yönergesi
```

Sayfalar saf HTML, CSS ve JavaScript ile yazılmıştır; dış kütüphane, yazı tipi
indirmesi veya CDN çağrısı yoktur.
