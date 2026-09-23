(function () {
  "use strict";

  var ANAHTAR = "ntp2-tema";

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

      kutu.appendChild(buyuk);
      kutu.appendChild(kapatDugme);
      kutu.addEventListener("click", function (e) {
        if (e.target === kutu) kapat();
      });
      document.body.appendChild(kutu);
      document.documentElement.style.overflow = "hidden";
      acik = kutu;
      kapatDugme.focus();
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
    function bak() {
      dugme.classList.toggle("gorunur", window.scrollY > 400);
    }
    window.addEventListener("scroll", bak, { passive: true });
    bak();
  })();

  /* ---------- 8) baskida cevaplar acik olsun ---------- */
  (function () {
    var acilanlar = [];
    function once() {
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
})();
