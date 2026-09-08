/* ==========================================================================
   Bold Homz — Cookie notice (تنبيه إعلامي فقط)
   - مفيش زرار "موافق" لأنها رسالة معلوماتية مش نظام موافقة/تتبع.
   - بتظهر مرة واحدة بس في نفس الـ session (sessionStorage).
   - بتختفي تلقائيًا بعد مدة، وفيها progress bar بيوضح الوقت المتبقي.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "bh_cookie_notice_seen";
  var SHOW_DELAY = 900;      // قبل الظهور بعد تحميل الصفحة
  var VISIBLE_DURATION = 9000; // مدة الظهور قبل الاختفاء التلقائي

  if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

  var CFG = window.SITE_CONFIG || {};
  var privacyUrl = CFG.privacyUrl || "/privacy-policy";

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "cookie-toast";
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-live", "polite");
    wrap.innerHTML =
      '<div class="ct-top">' +
        '<div class="ct-emoji" aria-hidden="true">🍪</div>' +
        '<div class="ct-text">' +
          "بنستخدم الكوكيز لتحسين تجربتك على الموقع. " +
          '<a href="' + privacyUrl + '">تفاصيل أكتر في سياسة الخصوصية</a>' +
        "</div>" +
        '<button type="button" class="ct-close" aria-label="إغلاق">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="ct-bar-wrap"><div class="ct-bar"></div></div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function dismiss(toast) {
    toast.classList.remove("show");
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toast = build();
    var bar = toast.querySelector(".ct-bar");
    var closeBtn = toast.querySelector(".ct-close");
    var autoTimer;

    closeBtn.addEventListener("click", function () {
      clearTimeout(autoTimer);
      dismiss(toast);
    });

    setTimeout(function () {
      toast.classList.add("show");

      // progress bar: يبدأ ممتلئ ويتقلص لحد ما يخلص الوقت
      requestAnimationFrame(function () {
        bar.style.transition = "transform " + VISIBLE_DURATION + "ms linear";
        bar.style.transform = "scaleX(0)";
      });

      autoTimer = setTimeout(function () {
        dismiss(toast);
      }, VISIBLE_DURATION);
    }, SHOW_DELAY);
  });
})();
