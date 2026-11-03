(function () {
  "use strict";

  var ANAHTAR = "bdt249-tema";

  function sec(s, kok) { return (kok || document).querySelector(s); }
  function hepsi(s, kok) {
    return Array.prototype.slice.call((kok || document).querySelectorAll(s));
  }

  /* ---------- 1) sag menu: kaydirinca aktif baslik ---------- */
  (function () {
    var baglar = hepsi("#toc a");
    var basliklar = hepsi("article h2[id]");
    if (!baglar.length || !basliklar.length || !window.IntersectionObserver) return;
    var harita = {};
    baglar.forEach(function (a) { harita[a.getAttribute("href").slice(1)] = a; });
    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        baglar.forEach(function (b) { b.classList.remove("active"); });
        if (harita[g.target.id]) harita[g.target.id].classList.add("active");
      });
    }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });
    basliklar.forEach(function (h) { gozcu.observe(h); });
  })();

  /* ---------- 2) mobil bolum menusu: baglantiya basinca kapan ---------- */
  (function () {
    var kutu = sec(".toc-mobil");
    if (!kutu) return;
    kutu.addEventListener("click", function (e) {
      if (e.target.closest("nav a")) kutu.removeAttribute("open");
    });
  })();

  /* ---------- 3) Konular menusu: disari tiklama ve ESC ---------- */
  (function () {
    var menu = sec(".konu-menu");
    if (!menu) return;
    document.addEventListener("click", function (e) {
      if (menu.hasAttribute("open") && !menu.contains(e.target)) {
        menu.removeAttribute("open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.hasAttribute("open")) {
        menu.removeAttribute("open");
        var ozet = sec("summary", menu);
        if (ozet) ozet.focus();
      }
    });
  })();

  /* ---------- 4) acik / koyu tema ---------- */
  (function () {
    var dugme = sec(".tema-dugme");
    if (!dugme) return;
    function simdiki() {
      var d = document.documentElement.getAttribute("data-theme");
      if (d) return d;
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark" : "light";
    }
    dugme.setAttribute("aria-label",
      simdiki() === "dark" ? "Açık temaya geç" : "Koyu temaya geç");
    dugme.addEventListener("click", function () {
      var yeni = simdiki() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", yeni);
      try { localStorage.setItem(ANAHTAR, yeni); } catch (e) { /* engelliyse sorun degil */ }
      dugme.setAttribute("aria-label",
        yeni === "dark" ? "Açık temaya geç" : "Koyu temaya geç");
    });
  })();

  /* ---------- 5) kod bloklarina kopyala dugmesi ---------- */
  (function () {
    function metniKopyala(metin) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(metin);
      }
      return new Promise(function (tamam, hata) {
        var alan = document.createElement("textarea");
        alan.value = metin;
        alan.setAttribute("readonly", "");
        alan.style.position = "fixed";
        alan.style.left = "-9999px";
        document.body.appendChild(alan);
        alan.select();
        try {
          document.execCommand("copy") ? tamam() : hata();
        } catch (e) { hata(e); } finally { document.body.removeChild(alan); }
      });
    }

    hepsi(".code").forEach(function (blok) {
      var bas = sec(".code-head", blok);
      var pre = sec("pre", blok);
      if (!bas || !pre || sec(".kopyala", bas)) return;
      var ad = sec(".name", bas);
      var dugme = document.createElement("button");
      dugme.type = "button";
      dugme.className = "kopyala";
      dugme.textContent = "Kopyala";
      dugme.setAttribute("aria-label",
        "Kod bloğunu kopyala" + (ad ? ": " + ad.textContent : ""));
      dugme.addEventListener("click", function () {
        metniKopyala(pre.innerText).then(function () {
          dugme.textContent = "Kopyalandı ✓";
          dugme.classList.add("oldu");
          setTimeout(function () {
            dugme.textContent = "Kopyala";
            dugme.classList.remove("oldu");
          }, 1500);
        }, function () {
          dugme.textContent = "Kopyalanamadı";
          setTimeout(function () { dugme.textContent = "Kopyala"; }, 1500);
        });
      });
      bas.appendChild(dugme);
    });
  })();

  /* ---------- 6) gorseli tam ekran ac (img ve svg) ---------- */
  (function () {
    var gorseller = hepsi("figure.diagram img, figure.diagram svg");
    if (!gorseller.length) return;
    var acik = null, oncekiOdak = null;

    function kapat() {
      if (!acik) return;
      document.body.removeChild(acik);
      acik = null;
      document.documentElement.style.overflow = "";
      if (oncekiOdak) oncekiOdak.focus();
    }

    function etiketi(oge) {
      if (oge.tagName.toLowerCase() === "svg") {
        var b = oge.querySelector("title");
        return b ? b.textContent : "Görsel";
      }
      return oge.alt || "Görsel";
    }

    function ac(oge) {
      kapat();
      oncekiOdak = document.activeElement;
      var kutu = document.createElement("div");
      kutu.className = "kutu";
      kutu.setAttribute("role", "dialog");
      kutu.setAttribute("aria-modal", "true");
      kutu.setAttribute("aria-label", etiketi(oge));

      var buyuk;
      if (oge.tagName.toLowerCase() === "svg") {
        buyuk = oge.cloneNode(true);
        buyuk.removeAttribute("tabindex");
      } else {
        buyuk = document.createElement("img");
        buyuk.src = oge.currentSrc || oge.src;
        buyuk.alt = oge.alt || "";
      }

      var kapatDugme = document.createElement("button");
      kapatDugme.type = "button";
      kapatDugme.className = "kapat";
      kapatDugme.textContent = "×";
      kapatDugme.setAttribute("aria-label", "Görseli kapat");
      kapatDugme.addEventListener("click", kapat);

      var ipucu = document.createElement("p");
      ipucu.className = "ipucu";
      ipucu.textContent = "Görseli parmağınızla kaydırın · Telefonu yan çevirirseniz tamamını görürsünüz";

      kutu.appendChild(buyuk);
      kutu.appendChild(kapatDugme);
      kutu.appendChild(ipucu);
      kutu.addEventListener("click", function (e) {
        if (e.target === kutu) kapat();
      });
      document.body.appendChild(kutu);
      document.documentElement.style.overflow = "hidden";
      acik = kutu;
      kapatDugme.focus({ preventScroll: true });

      /* dar ekranda gorsel kaydirilabilir; baslangicta ortasi gorunsun */
      function ortala() {
        if (acik !== kutu) return;
        if (!window.matchMedia || !window.matchMedia("(max-width: 699.98px)").matches) return;
        kutu.scrollLeft = (kutu.scrollWidth - kutu.clientWidth) / 2;
        kutu.scrollTop = (kutu.scrollHeight - kutu.clientHeight) / 2;
      }
      ortala();
      if (buyuk.tagName.toLowerCase() === "img" && !buyuk.complete) {
        buyuk.addEventListener("load", ortala);
      }
    }

    gorseller.forEach(function (oge) {
      oge.addEventListener("click", function () { ac(oge); });
      oge.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ac(oge);
        }
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") kapat();
    });
  })();

  /* ---------- 6a) canli kod ciktisi: iframe yuksekligi icerige esit ---------- */
  (function () {
    var cerceveler = hepsi("figure.cikti iframe");
    if (!cerceveler.length) return;
    function ayarla(f) {
      var b;
      try { b = f.contentDocument; } catch (e) { return; }
      if (!b || !b.documentElement || b.readyState !== "complete") return;
      var k = b.documentElement;
      /* scrollHeight iframe'in kendi yuksekliginden kucuk olamaz (kuculmez);
         <html>'in yuksekligi ise yalnizca icerige (body kenar boslugu dahil) baglidir.
         Ikinci tur: ilk ayarda dikey kaydirma cubugu kalkinca genislik degisebilir. */
      for (var tur = 0; tur < 2; tur++) {
        var h = Math.ceil(k.getBoundingClientRect().height);
        /* icerik yatayda tasarsa iframe icinde kaydirma cubugu cikar: onun yuksekligi eklenir */
        if (k.scrollWidth > k.clientWidth) h += Math.max(0, f.contentWindow.innerHeight - k.clientHeight);
        /* kisa ciktilar (tek satir, navbar) de tarayici penceresi gibi gorunsun: en az 120px */
        f.style.height = Math.max(h, 120) + "px";
      }
    }
    cerceveler.forEach(function (f) {
      f.addEventListener("load", function () { ayarla(f); });
      ayarla(f);
    });
    var bekleme = null;
    window.addEventListener("resize", function () {
      clearTimeout(bekleme);
      bekleme = setTimeout(function () { cerceveler.forEach(ayarla); }, 120);
    });
  })();

  /* ---------- 6b) yazdir dugmesi (Ctrl+P ile ayni yol; cevaplar 8. bolumde acilir) ---------- */
  hepsi(".yazdir-dugme").forEach(function (d) {
    d.addEventListener("click", function () { window.print(); });
  });

  /* ---------- 7) yukari cik ---------- */
  (function () {
    var dugme = document.createElement("button");
    dugme.type = "button";
    dugme.className = "yukari";
    dugme.innerHTML = "&#8593;";
    dugme.setAttribute("aria-label", "Sayfanın başına dön");
    dugme.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(dugme);
    /* sayfa sonunda dugme alt bilginin ustune cikar, baglantilari ortmez */
    var alt = document.querySelector("footer.alt");
    function bak() {
      dugme.classList.toggle("gorunur", window.scrollY > 400);
      var ek = alt ? Math.max(0, window.innerHeight - alt.getBoundingClientRect().top) : 0;
      dugme.style.transform = ek ? "translateY(-" + Math.ceil(ek) + "px)" : "";
    }
    window.addEventListener("scroll", bak, { passive: true });
    window.addEventListener("resize", bak);
    bak();
  })();

  /* ---------- 8) baskida cevaplar acik olsun ---------- */
  (function () {
    var acilanlar = [];
    function once() {
      hepsi("img[loading=lazy], iframe[loading=lazy]").forEach(function (i) { i.loading = "eager"; });
      acilanlar = hepsi("details:not([open])");
      acilanlar.forEach(function (d) { d.setAttribute("open", ""); });
    }
    function sonra() {
      acilanlar.forEach(function (d) { d.removeAttribute("open"); });
      acilanlar = [];
    }
    window.addEventListener("beforeprint", once);
    window.addEventListener("afterprint", sonra);
    if (window.matchMedia) {
      var mq = window.matchMedia("print");
      if (mq.addEventListener) {
        mq.addEventListener("change", function (e) { e.matches ? once() : sonra(); });
      }
    }
  })();

  /* ---------- 9) HTML/CSS kod renklendirme (highlight.js, yerel kopya) ---------- */
  (function () {
    if (!window.hljs) return;   /* MD klasorundeki tek dosyalik kopyalarda yuklu degil */
    /* bloklarda yorum span'leri var; hljs duz metni yeniden kurar, uyari basmasin */
    window.hljs.configure({ ignoreUnescapedHTML: true });
    var ATLA_AD = /komut istemi|kalıp|şablon|readme/i;

    hepsi(".code").forEach(function (blok) {
      var pre = sec("pre", blok);
      if (!pre) return;
      var ad = sec(".code-head .name", blok);
      if (ad && ATLA_AD.test(ad.textContent)) return;

      /* yesil / kirmizi isaretli yorumlar (.ok / .no): renklendirmeden sonra geri eklenir */
      var isaretli = hepsi("span.ok, span.no", pre).map(function (s) {
        return { metin: s.textContent, sinif: s.classList.contains("ok") ? "ok" : "no" };
      });

      if (!/language-/.test(pre.className)) return;   /* dil md'deki kod blogundan gelir */
      window.hljs.highlightElement(pre);

      if (!isaretli.length) return;
      hepsi(".hljs-comment", pre).forEach(function (yorum) {
        for (var i = 0; i < isaretli.length; i++) {
          if (isaretli[i].metin === yorum.textContent) {
            yorum.classList.add(isaretli[i].sinif);
            isaretli.splice(i, 1);
            return;
          }
        }
      });
    });
  })();

  /* ---------- 10) okuma cubugu (yalnizca konu sayfalari) ---------- */
  (function () {
    var ust = sec(".topbar");
    if (!ust || !sec("#toc")) return;
    var cubuk = document.createElement("div");
    cubuk.className = "okuma";
    cubuk.setAttribute("aria-hidden", "true");
    ust.appendChild(cubuk);
    var bekliyor = false;
    function guncelle() {
      bekliyor = false;
      var enfazla = document.documentElement.scrollHeight - window.innerHeight;
      var oran = enfazla > 0 ? Math.min(1, Math.max(0, window.scrollY / enfazla)) : 0;
      cubuk.style.transform = "scaleX(" + oran + ")";
    }
    function iste() {
      if (bekliyor) return;
      bekliyor = true;
      window.requestAnimationFrame(guncelle);
    }
    window.addEventListener("scroll", iste, { passive: true });
    window.addEventListener("resize", iste);
    iste();
  })();

  /* ---------- 11) etkilesimli demolar: <... data-demo="ad"> ---------- */
  /* her demo yalniz kendi kokunde secim yapar (id yok, data-*); biri hata verirse digerleri calisir */
  (function () {
    var demolar = {};

    /* kutu modeli: width / padding / border / margin kaydiricilari */
    demolar["kutu-modeli"] = function (kok) {
      function k(ad) { return sec('[data-km="' + ad + '"]', kok); }
      var w = k("w"), p = k("p"), b = k("b"), m = k("m"), sahne = k("sahne");
      function guncelle() {
        var W = +w.value, P = +p.value, B = +b.value, M = +m.value;
        k("wo").textContent = W + "px"; k("po").textContent = P + "px";
        k("bo").textContent = B + "px"; k("mo").textContent = M + "px";
        var toplam = W + 2 * P + 2 * B, dis = toplam + 2 * M;
        var olcek = Math.min(1, Math.max(0.2, (sahne.clientWidth - 24) / dis));
        function px(x) { return (x * olcek) + "px"; }
        k("margin").style.padding = px(M);
        k("border").style.padding = px(B);
        k("padding").style.padding = px(P);
        k("icerik").style.width = px(W);
        k("icerik").style.minHeight = px(60);
        k("toplam").textContent = toplam + "px";
        k("formul").textContent = "width + 2 × padding + 2 × border = " + W + " + " + (2 * P) + " + " + (2 * B) + " = " + toplam + "px";
        k("dis").textContent = "margin dâhil yer kaplama: " + toplam + " + 2 × " + M + " = " + dis + "px" + (olcek < 1 ? " (şekil sığsın diye küçültüldü)" : "");
        k("kod").textContent = ".kutu {\n  width: " + W + "px;\n  padding: " + P + "px;\n  border: " + B + "px solid;\n  margin: " + M + "px;\n}";
      }
      [w, p, b, m].forEach(function (el) { el.addEventListener("input", guncelle); });
      window.addEventListener("resize", guncelle);
      guncelle();
    };

    /* canli editor: textarea -> iframe srcdoc (betik izni yok); data-kip="css" ya da "html" */
    demolar["editor"] = function (kok) {
      function ed(ad) { return sec('[data-ed="' + ad + '"]', kok); }
      function sablon(ad) {
        var t = ed(ad);
        if (!t) return "";
        return t.content ? t.content.textContent : t.textContent;
      }
      var kip = kok.getAttribute("data-kip") === "html" ? "html" : "css";
      var alan = ed("kod"), cerceve = sec("figure.cikti iframe", kok), dugme = ed("bastan");
      var sabit = sablon("sabit-html"), baslangic = sablon("baslangic");
      var bas = '<!DOCTYPE html><meta charset="utf-8">';
      var zaman = null;
      function belge(kod) { return kip === "css" ? bas + "<style>" + kod + "</style>" + sabit : bas + kod; }
      function yenile() { clearTimeout(zaman); zaman = null; cerceve.srcdoc = belge(alan.value); }
      function iste() { clearTimeout(zaman); zaman = setTimeout(yenile, 300); }
      alan.addEventListener("input", iste);
      alan.addEventListener("keydown", function (e) {
        if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          var s = alan.selectionStart, son = alan.selectionEnd;
          alan.value = alan.value.slice(0, s) + "  " + alan.value.slice(son);
          alan.selectionStart = alan.selectionEnd = s + 2;
          iste();
        } else if (e.key === "Escape" || e.key === "Esc") {
          alan.blur();   /* klavye tuzagi olmasin: Esc ile kod alanindan cikilir */
        }
      });
      dugme.addEventListener("click", function () { alan.value = baslangic; yenile(); });
    };

    /* yol bulucu: baslangic dosyasindan hedefe goreli yol (basa / konmaz) */
    demolar["yol-bulucu"] = function (kok) {
      function y(ad) { return sec('[data-yb="' + ad + '"]', kok); }
      var bas = y("bas"), hedef = y("hedef");
      var KOK_AD = "mini_site/";
      var METIN = { "index.html": "Ana Sayfa", "hakkinda.html": "Hakkında", "iletisim.html": "İletişim",
        "urunler.html": "Ürünler", "foto.jpg": "Kahve fincanı", "logo.png": "Logo" };
      function kod(t) { return "<code>" + t + "</code>"; }
      function klasorAdi(parcalar) { return parcalar.length ? parcalar[parcalar.length - 1] + "/" : KOK_AD; }
      function guncelle() {
        var b = bas.value, h = hedef.value;
        hepsi(".yb-agac li", kok).forEach(function (li) {
          var yol = li.getAttribute("data-yol");
          li.classList.toggle("yb-bas", yol === b);
          li.classList.toggle("yb-hedef", yol === h);
        });
        if (b === h) {
          y("yol").textContent = "Zaten bu sayfadasınız.";
          y("adim").textContent = "";
          y("kod").textContent = "";
          y("kod").hidden = true;
          return;
        }
        var bk = b.split("/"); bk.pop();
        var hk = h.split("/"); var dosya = hk.pop();
        var i = 0;
        while (i < bk.length && i < hk.length && bk[i] === hk[i]) i++;
        var parca = [], adim = [], n = 1, k;
        for (k = bk.length; k > i; k--) {
          parca.push("..");
          adim.push(n++ + ") " + kod("../") + " ile bir üst klasöre (" + klasorAdi(bk.slice(0, k - 1)) + ") çıkın.");
        }
        for (k = i; k < hk.length; k++) {
          parca.push(hk[k]);
          adim.push(n++ + ") " + kod(hk[k] + "/") + " klasörüne girin.");
        }
        parca.push(dosya);
        if (adim.length) adim.push(n + ") " + kod(dosya) + " dosyası.");
        else adim.push("1) " + kod(dosya) + " aynı klasörde (" + klasorAdi(bk) + ") olduğu için yalnızca dosya adı yazılır.");
        var yol = parca.join("/");
        y("yol").textContent = yol;
        y("adim").innerHTML = adim.join(" ");   /* metinler sabit listeden gelir, kullanici girdisi yok */
        var metin = METIN[dosya] || dosya;
        y("kod").hidden = false;
        y("kod").textContent = /\.(jpe?g|png)$/.test(dosya)
          ? "<img src=\"" + yol + "\" alt=\"" + metin + "\">"
          : "<a href=\"" + yol + "\">" + metin + "</a>";   /* kacisli tirnak: dogrula.py bunu baglanti sanmasin */
      }
      bas.addEventListener("change", guncelle);
      hedef.addEventListener("change", guncelle);
      guncelle();
    };

    /* get / post: form gercekten gonderilmez, adres cubugu ve istek govdesi gosterilir */
    demolar["get-post"] = function (kok) {
      function g(ad) { return sec('[data-gp="' + ad + '"]', kok); }
      /* application/x-www-form-urlencoded: bosluk +, ozel ASCII karakterler %XX;
         Turkce harfler adres cubugundaki gibi okunur birakilir */
      function kodla(s) {
        var c, i, sonuc = "";
        for (i = 0; i < s.length; i++) {
          c = s.charAt(i);
          if (c === " ") sonuc += "+";
          else if (/[A-Za-z0-9*\-._]/.test(c) || s.charCodeAt(i) > 127) sonuc += c;
          else sonuc += "%" + ("0" + s.charCodeAt(i).toString(16).toUpperCase()).slice(-2);
        }
        return sonuc;
      }
      function yaz(kutu, parcalar) {
        kutu.textContent = "";
        parcalar.forEach(function (p) {
          if (typeof p === "string") { kutu.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement("span");
          s.className = "gp-sifre";
          s.textContent = p.sifre;
          kutu.appendChild(s);
        });
      }
      g("form").addEventListener("submit", function (e) {
        e.preventDefault();
        var ad = g("ad").value, sifre = g("sifre").value;
        var secili = sec('input[type="radio"]:checked', kok);
        var yontem = secili ? secili.value : "get";
        if (!ad.replace(/\s+/g, "")) {
          g("uyari").textContent = "Ad alanını doldurun.";
          return;
        }
        g("uyari").textContent = "";
        var veri = "ad=" + kodla(ad) + "&sifre=" + kodla(sifre);
        if (yontem === "get") {
          yaz(g("adres"), ["iletisim.html?ad=" + kodla(ad) + "&", { sifre: "sifre=" + kodla(sifre) }]);
          g("istek").hidden = true;
          g("sonuc").textContent = "GET veriyi adrese ekledi; şifre adres çubuğunda, geçmişte ve paylaşılan bağlantıda görünür.";
        } else {
          yaz(g("adres"), ["iletisim.html"]);
          yaz(g("govde"), [veri]);
          g("istek").hidden = false;
          g("sonuc").textContent = "POST veriyi isteğin gövdesinde gönderdi; adres çubuğuna yazmadı. Not: POST veriyi şifrelemez; gerçek güvenlik için sitenin https kullanması gerekir.";
        }
      });
    };

    /* secici vurgulayici: ornek sayfada secicinin sectigi ogeler isaretlenir */
    demolar["secici"] = function (kok) {
      function s(ad) { return sec('[data-ss="' + ad + '"]', kok); }
      var giris = s("giris"), sayfa = s("sayfa");
      var dugmeler = hepsi("[data-ss-hizli]", kok);
      /* eslestirme ornek sayfanin ayri bir kopyasinda yapilir: "div p" gibi seciciler
         demonun disindaki (sitedeki) div'lere bakmasin, ornek tek basina bir sayfa gibi davransin */
      var ogeler = hepsi("*", sayfa);
      var belge = document.implementation.createHTMLDocument("");
      belge.body.innerHTML = sayfa.innerHTML;
      var kopya = Array.prototype.slice.call(belge.body.querySelectorAll("*"));
      function tur(t) {
        if (t.indexOf(",") >= 0) return "grup seçicisi";
        if (/^#[A-Za-z][\w-]*$/.test(t)) return "id seçicisi";
        if (/^\.[A-Za-z_-][\w-]*$/.test(t)) return "class seçicisi";
        if (/^[A-Za-z][A-Za-z0-9]*$/.test(t)) return "etiket seçicisi";
        return "birleşik seçici";
      }
      function guncelle() {
        var t = giris.value.replace(/^\s+|\s+$/g, "");
        hepsi(".ss-secili", sayfa).forEach(function (el) { el.classList.remove("ss-secili"); });
        dugmeler.forEach(function (d) { d.setAttribute("aria-pressed", String(d.getAttribute("data-ss-hizli") === t)); });
        s("uyari").textContent = "";
        s("tur").textContent = "";
        if (!t) { s("sonuc").textContent = "Bir seçici yazın."; return; }
        var eslesen, bulunan = [];
        try { eslesen = belge.querySelectorAll(t); }
        catch (e) {
          s("sonuc").textContent = "Hiçbir öğe seçilmedi.";
          s("uyari").textContent = "Geçersiz seçici. Yazımı kontrol edin.";
          return;
        }
        Array.prototype.forEach.call(eslesen, function (el) {
          var i = kopya.indexOf(el);   /* html, head, body ornek sayfanin parcasi degil */
          if (i >= 0) { ogeler[i].classList.add("ss-secili"); bulunan.push(ogeler[i]); }
        });
        s("sonuc").textContent = bulunan.length ? bulunan.length + " öğe seçildi." : "Hiçbir öğe seçilmedi.";
        s("tur").textContent = "Seçici türü: " + tur(t);
      }
      giris.addEventListener("input", guncelle);
      dugmeler.forEach(function (d) {
        d.addEventListener("click", function () { giris.value = d.getAttribute("data-ss-hizli"); guncelle(); });
      });
      guncelle();
    };

    hepsi("[data-demo]").forEach(function (kok) {
      var kur = demolar[kok.getAttribute("data-demo")];
      if (!kur) return;
      try { kur(kok); } catch (e) { if (window.console) console.error("demo kurulamadi:", e); }
    });
  })();

})();
