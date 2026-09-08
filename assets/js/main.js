/* ==========================================================================
   Bold Homz — shared front-end behaviour
   (نفس الملف بيشتغل في كل الصفحات، بيقرأ data-page من الـ body)
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var page = document.body.getAttribute("data-page") || "home";
  var projectName = document.body.getAttribute("data-project-name") || CFG.brand || "Bold Homz";

  var phone = (CFG.phones && CFG.phones[page]) || "";
  var waNumber = (CFG.whatsapp && CFG.whatsapp[page]) || "";

  /* عشان أي اسم مشروع/وحدة بالإنجليزي وسط جملة عربي (WhatsApp, La Vista City, ...)
     يفضل يتقرأ صح في تطبيق الواتساب بدل ما يظهر مقلوب — بنعزل كل جزء إنجليزي
     بعلامات اتجاه غير مرئية (LRI/PDI) قبل ما نبني رابط الواتساب. */
  var LRI = "⁦"; // Left-to-Right Isolate
  var PDI = "⁩"; // Pop Directional Isolate
  function isolateLatin(str) {
    return String(str).replace(
      /[A-Za-z][A-Za-z0-9 .,'&-]*[A-Za-z0-9]|[A-Za-z]/g,
      function (m) {
        return LRI + m + PDI;
      }
    );
  }

  /* ---------------- 1) تعبئة أرقام الهاتف والواتساب من config.js ---------------- */
  function applyContactInfo() {
    // نص الرقم
    document.querySelectorAll("[data-tel-text]").forEach(function (el) {
      el.textContent = phone;
    });

    // روابط الاتصال
    document.querySelectorAll("[data-tel]").forEach(function (el) {
      el.setAttribute("href", "tel:" + phone.replace(/[^\d+]/g, ""));
    });

    // روابط الواتساب
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var customMsg = el.getAttribute("data-wa-msg");
      var msg = customMsg
        ? customMsg
        : "مرحباً، أنا مهتم بمعرفة تفاصيل أكثر عن " + projectName;
      el.setAttribute(
        "href",
        "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(isolateLatin(msg))
      );
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* ---------------- 2) قائمة الموبايل ---------------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
      });
    });
  }

  /* ---------------- 3) الهيدر: ظل عند التمرير + اختفاء عند النزول وظهور عند الصعود
     + قفل قائمة الموبايل تلقائيًا لو مفتوحة وحصل سكرول ---------------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    var nav = document.querySelector(".main-nav");
    if (!header) return;

    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;

      header.classList.toggle("scrolled", y > 8);

      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
      }

      if (y > lastY && y > 90) {
        header.classList.add("nav-hidden");
      } else {
        header.classList.remove("nav-hidden");
      }

      lastY = y;
      ticking = false;
    }

    document.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );

    onScroll();
  }

  /* ---------------- 4) ظهور العناصر عند التمرير ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- 5) معرض الصور (Lightbox بسيط) ---------------- */
  function initGallery() {
    var items = document.querySelectorAll(".g-item");
    var box = document.querySelector(".lightbox");
    if (!items.length || !box) return;
    var titleEl = box.querySelector("[data-lightbox-title]");
    var imgEl = box.querySelector("[data-lightbox-img]");

    function open(title, src) {
      if (src && imgEl) {
        imgEl.src = src;
        imgEl.alt = title || "";
        imgEl.hidden = false;
        if (titleEl) titleEl.hidden = true;
      } else {
        if (imgEl) {
          imgEl.hidden = true;
          imgEl.removeAttribute("src");
        }
        if (titleEl) {
          titleEl.hidden = false;
          titleEl.textContent = title;
        }
      }
      box.classList.add("open");
      document.documentElement.style.overflow = "hidden";
    }
    function close() {
      box.classList.remove("open");
      document.documentElement.style.overflow = "";
    }

    items.forEach(function (el) {
      el.addEventListener("click", function () {
        var photo = el.querySelector("img");
        open(el.getAttribute("data-title") || projectName, photo ? photo.src : null);
      });
    });
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });
    var closeBtn = box.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------- 6) سكرول سلس لأي لينك داخلي (#id) مع مراعاة ارتفاع الهيدر الثابت ---------------- */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var hash = link.getAttribute("href");
      if (!hash || hash.length < 2) return;

      link.addEventListener("click", function (e) {
        var target = document.getElementById(hash.slice(1));
        if (!target) return;

        e.preventDefault();

        var headerH =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
            10
          ) || 76;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;

        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", hash);
        }
      });
    });
  }

  /* ---------------- 7) فورم "اكتبلنا ميزانيتك" -> واتساب ---------------- */
  function initBudgetForm() {
    var form = document.querySelector("#budgetForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var down = (form.querySelector("#downPayment") || {}).value || "";
      var installment = (form.querySelector("#monthlyInstallment") || {}).value || "";

      if (!down && !installment) {
        var firstInput = form.querySelector("input");
        if (firstInput) firstInput.focus();
        return;
      }

      var lines = [
        "مرحباً، أنا مهتم بوحدة في " + projectName + " ومحتاج ترشيحات مناسبة لميزانيتي:",
        down ? "المقدم المتاح: " + down + " ج.م" : null,
        installment ? "القسط الشهري المناسب: " + installment + " ج.م / شهر" : null
      ].filter(Boolean);

      var msg = isolateLatin(lines.join("\n"));
      var url = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg);
      window.open(url, "_blank", "noopener");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyContactInfo();
    initMobileNav();
    initHeaderScroll();
    initReveal();
    initGallery();
    initAnchorScroll();
    initBudgetForm();
  });
})();
