
const KAHEL_CONFIG = {
  // Your Tenant App link (the Google Apps Script URL that ends in /exec)
  loginUrl: "https://script.google.com/macros/s/AKfycbwWvWQ45BJdoqR25eMPkfiiECeH3LpW-UPGIDGLG5npmIyczwxgN-pQl9UQf2m6YxH5/exec",

  // Your Telegram bot's username, without the @ (example: KahelBot)
  telegramBot: "kahelSupport",

  // Limited offer: lifetime access for the first clients on each plan.
  // Update "claimed" whenever a lifetime slot on that plan is sold.
  // When claimed reaches total, that plan switches back to "annual plan".
  lifetime: {
    starter: { total: 20, claimed: 8 },
    duo:     { total: 20, claimed: 15 },
    pro:     { total: 20, claimed: 18 }
  },

  // Optional public email shown in the footer; leave "" to hide it
  contactEmail: ""
};

(function () {
  const C = KAHEL_CONFIG;
  document.documentElement.classList.add("js");

  /* ---------- Login button ---------- */
  document.querySelectorAll("[data-signin]").forEach(function (a) {
    if (C.loginUrl) {
      a.href = C.loginUrl;
    } else {
      a.addEventListener("click", function (e) { e.preventDefault(); alertMissing("Login link"); });
    }
  });

  /* ---------- Get access: opens the Telegram bot ----------
     ?start=<plan> tells the bot which plan the visitor tapped. */
  document.querySelectorAll("[data-getaccess]").forEach(function (a) {
    const bot = (C.telegramBot || "").replace(/^@/, "").trim();
    if (bot) {
      const plan = a.getAttribute("data-plan") || "website";
      a.href = "https://t.me/" + bot + "?start=" + encodeURIComponent(plan);
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.addEventListener("click", function (e) { e.preventDefault(); alertMissing("Telegram bot"); });
    }
  });

  function alertMissing(what) {
    // Only shows while the site is not yet connected (see KAHEL_CONFIG above).
    window.alert("Almost there: the " + what + " is not connected yet. Add it in assets/js/site.js.");
  }

  /* ---------- Email in footer ---------- */
  document.querySelectorAll("[data-email]").forEach(function (a) {
    if (C.contactEmail) {
      a.href = "mailto:" + C.contactEmail;
      a.textContent = C.contactEmail;
    } else {
      (a.closest("li") || a).hidden = true;
    }
  });

  /* ---------- Lifetime offer counters (one per plan) ---------- */
  document.querySelectorAll("[data-plan-card]").forEach(function (card) {
    const cfg = (C.lifetime || {})[card.getAttribute("data-plan-card")];
    const offer = card.querySelector("[data-offer]");
    const annual = card.querySelector("[data-annual]");
    const term = card.querySelector("[data-term]");
    if (!cfg || !offer) return;
    const total = Math.max(1, Number(cfg.total) || 20);
    const claimed = Math.min(total, Math.max(0, Number(cfg.claimed) || 0));
    if (claimed >= total) {
      // Offer is over: show the normal annual plan, without strikethrough.
      offer.hidden = true;
      if (term) term.hidden = true;
      if (annual) annual.outerHTML = "<span>annual plan</span>";
      return;
    }
    const meter = offer.querySelector("[data-meter]");
    meter.setAttribute("aria-valuemax", String(total));
    meter.setAttribute("aria-valuenow", String(claimed));
    meter.querySelector("span").style.width = (claimed / total * 100) + "%";
    offer.querySelector("[data-total]").textContent = String(total);
    offer.querySelector("[data-offer-count]").textContent =
      claimed + " of " + total + " claimed, " + (total - claimed) + " left";
  });

  /* ---------- Year in footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Audience switch (owners / accountants) ---------- */
  document.querySelectorAll("[data-switch]").forEach(function (sw) {
    const target = document.getElementById(sw.getAttribute("data-switch"));
    sw.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        sw.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        target.setAttribute("data-audience", btn.value);
      });
    });
  });
})();
