// ============================================================
// WEDDING — Eriel & Garyn | main.js
// ============================================================
const CONFIG = {
  weddingDate: "2026-05-09T08:00:00",
  defaultGuest: "Tamu Undangan",
  rateLimit: 2,
  rateWindow: 5 * 60000,
  protectLinks: false,
};

// ── Supabase ──────────────────────────────────────────────────
const SUPABASE_URL = "https://tdlkbhzlvxovsrinhtha.supabase.co";
const SUPABASE_KEY = "sb_publishable_7i2Hp2kbkWmklAnaRXBHLA_uUKufVJK";

async function sbGet(ep) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + ep, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
  });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function sbPost(table, data) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + table, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t);
  }
  return true;
}
async function sbPatch(table, filter, data) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?" + filter, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(r.status);
  return true;
}

// ── Guest dari URL ────────────────────────────────────────────
const guestName = (function () {
  const p = new URLSearchParams(window.location.search);
  const n = p.get("to");
  return n && n.trim() ? decodeURIComponent(n.trim()) : CONFIG.defaultGuest;
})();
const el = document.getElementById("guestName");
if (el) el.textContent = guestName;

// ── Protect link ──────────────────────────────────────────────
async function checkAccess() {
  if (!CONFIG.protectLinks || guestName === CONFIG.defaultGuest) return true;
  try {
    const d = await sbGet(
      "guests?select=id&name=eq." + encodeURIComponent(guestName),
    );
    return d && d.length > 0;
  } catch {
    return true;
  }
}

// ── Track open ────────────────────────────────────────────────
async function trackOpen(name) {
  if (name === CONFIG.defaultGuest) return;
  try {
    const ex = await sbGet(
      "guests?select=id&name=eq." + encodeURIComponent(name),
    );
    if (ex && ex.length > 0) {
      await sbPatch("guests", "id=eq." + ex[0].id, {
        opened: true,
        opened_at: new Date().toISOString(),
      });
    } else {
      await sbPost("guests", {
        name,
        slug: slugify(name),
        opened: true,
        opened_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("Track skip:", e.message);
  }
}

// ── Opening ───────────────────────────────────────────────────
const openBtn = document.getElementById("openBtn");
const opening = document.getElementById("opening");
const mainContent = document.getElementById("mainContent");
const bgMusic = document.getElementById("bgMusic");

openBtn &&
  openBtn.addEventListener("click", async function () {
    const ok = await checkAccess();
    if (!ok) {
      openBtn.style.display = "none";
      document.getElementById("notFoundMsg")?.classList.remove("hidden");
      return;
    }
    trackOpen(guestName);
    opening.classList.add("fade-out");
    setTimeout(function () {
      opening.style.display = "none";
      mainContent.classList.remove("hidden");
      if (bgMusic) {
        bgMusic.play().catch(() => {});
        updateMusicState(true);
      }
      startCountdown();
      setTimeout(triggerHeroAnimations, 100);
      initScrollReveal();
      initBottomNav();
      initStack();
      initThumbs();
      loadMessages();
      checkMemoryPage();
    }, 800);
  });

// ── Countdown ─────────────────────────────────────────────────
function startCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      const el = document.getElementById("countdown");
      if (el)
        el.innerHTML =
          '<p style="font-family:var(--font-display);color:var(--gold);font-size:1.1rem;letter-spacing:.06em">✨ Hari yang Dinantikan Telah Tiba ✨</p>';
      return;
    }
    const pad = (n) => String(Math.floor(n)).padStart(2, "0");
    document.getElementById("days").textContent = pad(diff / 86400000);
    document.getElementById("hours").textContent = pad(
      (diff % 86400000) / 3600000,
    );
    document.getElementById("minutes").textContent = pad(
      (diff % 3600000) / 60000,
    );
    document.getElementById("seconds").textContent = pad((diff % 60000) / 1000);
  }
  tick();
  setInterval(tick, 1000);
}

// ── Kalender (tombol di bawah countdown) ─────────────────────
function addToCalendar(type) {
  const title = encodeURIComponent("Pernikahan Eriel & Garyn");
  const details = encodeURIComponent(
    "Akad Nikah 08.00 WIB | Resepsi 11.00–16.00 WIB",
  );
  const loc = encodeURIComponent("Jakarta");

  if (type === "google") {
    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      title +
      "&dates=20260509T080000/20260509T160000" +
      "&details=" +
      details +
      "&location=" +
      loc;
    window.open(url, "_blank");
  } else if (type === "ical") {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "DTSTART:20260509T080000",
      "DTEND:20260509T160000",
      "SUMMARY:Pernikahan Eriel & Garyn",
      "DESCRIPTION:Akad 08.00 | Resepsi 11.00 WIB",
      "LOCATION:Jakarta",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "undangan-eriel-garyn.ics";
    a.click();
    showToast("📅 File kalender diunduh!");
    return;
  } else if (type === "outlook") {
    const url =
      "https://outlook.live.com/calendar/0/deeplink/compose?subject=" +
      title +
      "&startdt=2026-05-09T08:00:00&enddt=2026-05-09T16:00:00" +
      "&body=" +
      details +
      "&location=" +
      loc;
    window.open(url, "_blank");
  }
  showToast("📅 Membuka kalender...");
}

// ── Memory page link ──────────────────────────────────────────
function checkMemoryPage() {
  const link = document.getElementById("memoryLink");
  if (link && Date.now() > new Date(CONFIG.weddingDate).getTime()) {
    link.style.display = "inline-flex";
  }
}

// ── Hero animations ───────────────────────────────────────────
function triggerHeroAnimations() {
  document.querySelectorAll(".fade-up").forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add("animated");
    }, i * 130);
  });
}

// ── Scroll reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    obs.observe(el);
  });
}

// ── Bottom nav ────────────────────────────────────────────────
function initBottomNav() {
  const items = document.querySelectorAll(".bnav-item");
  const secIds = [
    "hero",
    "couple",
    "story",
    "events",
    "gallery",
    "gift",
    "guestbook",
  ];
  const obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        // Map section → nav
        const map = {
          hero: "hero",
          couple: "couple",
          story: "couple",
          events: "events",
          gallery: "gallery",
          gift: "gallery",
          guestbook: "guestbook",
        };
        const active = map[id] || id;
        items.forEach(function (it) {
          it.classList.toggle(
            "active",
            it.getAttribute("data-section") === active,
          );
        });
      });
    },
    { threshold: 0.45 },
  );
  secIds.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
  items.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(item.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ── Gallery Stack (Card stack swipeable + auto loop) ──────────
function initStack() {
  const stackEl = document.getElementById("galleryStack");
  if (!stackEl) return;

  const cards = Array.from(stackEl.querySelectorAll(".stack-card"));
  if (!cards.length) return;

  const dotsEl = document.getElementById("stackDots");
  let current = 0;
  let autoTimer = null;
  let dragStart = null;
  let isDragging = false;

  // Build dots
  if (dotsEl) {
    cards.forEach(function (_, i) {
      const d = document.createElement("div");
      d.className = "stack-dot" + (i === 0 ? " active" : "");
      d.addEventListener("click", function () {
        goTo(i);
        resetAuto();
      });
      dotsEl.appendChild(d);
    });
  }

  function updatePositions() {
    cards.forEach(function (card, i) {
      card.classList.remove(
        "pos-0",
        "pos-1",
        "pos-2",
        "pos-hidden",
        "dragging",
      );
      const rel = (i - current + cards.length) % cards.length;
      if (rel === 0) card.classList.add("pos-0");
      else if (rel === 1) card.classList.add("pos-1");
      else if (rel === 2) card.classList.add("pos-2");
      else card.classList.add("pos-hidden");
    });
    if (dotsEl) {
      dotsEl.querySelectorAll(".stack-dot").forEach(function (d, i) {
        d.classList.toggle("active", i === current);
      });
    }
  }

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    updatePositions();
  }
  function next() {
    goTo(current + 1);
  }

  function startAuto() {
    autoTimer = setInterval(next, 3200);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // ── Touch / Mouse drag ──
  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  stackEl.addEventListener("mousedown", function (e) {
    dragStart = getClientX(e);
    isDragging = true;
  });
  stackEl.addEventListener(
    "touchstart",
    function (e) {
      dragStart = getClientX(e);
      isDragging = true;
      resetAuto();
    },
    { passive: true },
  );

  stackEl.addEventListener("mouseup", function (e) {
    if (!isDragging || dragStart === null) return;
    const diff = dragStart - getClientX(e);
    if (Math.abs(diff) > 35) {
      diff > 0 ? next() : goTo(current - 1);
      resetAuto();
    }
    isDragging = false;
    dragStart = null;
  });
  stackEl.addEventListener("touchend", function (e) {
    if (!isDragging || dragStart === null) return;
    const diff = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      diff > 0 ? next() : goTo(current - 1);
    }
    isDragging = false;
    dragStart = null;
  });
  stackEl.addEventListener("mouseleave", function () {
    isDragging = false;
    dragStart = null;
  });

  // Click top card → lightbox
  stackEl.addEventListener("click", function (e) {
    if (isDragging) return;
    const top = cards[current];
    if (!top) return;
    const src = top.getAttribute("data-src");
    if (src) openLightbox(src);
  });

  updatePositions();
  startAuto();
}

// ── Thumbnail click → lightbox ────────────────────────────────
function initThumbs() {
  document.querySelectorAll(".gthumb").forEach(function (th) {
    th.addEventListener("click", function () {
      const src = th.getAttribute("data-src");
      if (src) openLightbox(src);
    });
  });
}

// ── Lightbox ──────────────────────────────────────────────────
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src) {
  if (!lightbox) return;
  lightboxImg.src = src;
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  if (lightbox) lightbox.classList.remove("active");
  document.body.style.overflow = "";
}
lightboxClose && lightboxClose.addEventListener("click", closeLightbox);
lightbox &&
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeLightbox();
});

// ── Music ─────────────────────────────────────────────────────
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicBar = document.getElementById("musicBar");
let isPlaying = false;

function updateMusicState(on) {
  isPlaying = on;
  if (musicIcon)
    musicIcon.className = on ? "fa-solid fa-pause" : "fa-solid fa-music";
  if (musicBar) musicBar.classList.toggle("paused", !on);
}
musicToggle &&
  musicToggle.addEventListener("click", function () {
    if (!bgMusic) return;
    if (isPlaying) {
      bgMusic.pause();
      updateMusicState(false);
    } else {
      bgMusic
        .play()
        .then(function () {
          updateMusicState(true);
        })
        .catch(() => {});
    }
  });

// ── Rate limiter ──────────────────────────────────────────────
function getRateData() {
  try {
    return JSON.parse(
      localStorage.getItem("wb_rate") || '{"count":0,"start":0}',
    );
  } catch {
    return { count: 0, start: 0 };
  }
}
function checkRateLimit() {
  const now = Date.now(),
    d = getRateData();
  if (now - d.start > CONFIG.rateWindow) {
    localStorage.setItem("wb_rate", JSON.stringify({ count: 0, start: now }));
    return true;
  }
  return d.count < CONFIG.rateLimit;
}
function incrementRate() {
  const now = Date.now();
  let d = getRateData();
  if (now - d.start > CONFIG.rateWindow) d = { count: 0, start: now };
  d.count++;
  localStorage.setItem("wb_rate", JSON.stringify(d));
}
function getRemainingMins() {
  const d = getRateData();
  return Math.max(
    1,
    Math.ceil((CONFIG.rateWindow - (Date.now() - d.start)) / 60000),
  );
}
function updateRateLimitInfo() {
  const el = document.getElementById("rateLimitInfo");
  if (!el) return;
  if (!checkRateLimit()) {
    el.textContent =
      "⏳ Batas pengiriman. Coba lagi dalam " + getRemainingMins() + " menit.";
  } else {
    const d = getRateData();
    el.textContent =
      d.count > 0
        ? "(" + d.count + "/" + CONFIG.rateLimit + " ucapan dalam 5 menit ini)"
        : "";
  }
}

// ── Guestbook ─────────────────────────────────────────────────
const submitBtn = document.getElementById("submitBtn");
const gbNameEl = document.getElementById("gbName");
const gbAttendEl = document.getElementById("gbAttend");
const gbMsgEl = document.getElementById("gbMessage");
const msgListEl = document.getElementById("messagesList");
const charCountEl = document.getElementById("charCount");

if (gbNameEl && guestName !== CONFIG.defaultGuest) gbNameEl.value = guestName;

gbMsgEl &&
  gbMsgEl.addEventListener("input", function () {
    if (charCountEl) charCountEl.textContent = gbMsgEl.value.length;
  });

submitBtn &&
  submitBtn.addEventListener("click", async function () {
    const name = gbNameEl ? gbNameEl.value.trim() : "";
    const attend = gbAttendEl ? gbAttendEl.value : "hadir";
    const message = gbMsgEl ? gbMsgEl.value.trim() : "";

    if (!name) {
      showToast("⚠️ Nama tidak boleh kosong");
      gbNameEl && gbNameEl.focus();
      return;
    }
    if (!message) {
      showToast("⚠️ Pesan tidak boleh kosong");
      gbMsgEl && gbMsgEl.focus();
      return;
    }

    if (!checkRateLimit()) {
      showToast(
        "⏳ Maks " +
          CONFIG.rateLimit +
          " ucapan per 5 menit. Tunggu " +
          getRemainingMins() +
          " menit lagi.",
      );
      updateRateLimitInfo();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    try {
      await sbPost("messages", { name, attend, message });
      incrementRate();
      updateRateLimitInfo();
      showToast("✨ Ucapan berhasil dikirim! Terima kasih.");
      prependMessage({ name, attend, message, time: fmtNow() });
      if (gbMsgEl) {
        gbMsgEl.value = "";
        if (charCountEl) charCountEl.textContent = "0";
      }
      if (gbNameEl && guestName !== CONFIG.defaultGuest)
        gbNameEl.value = guestName;
    } catch (e) {
      showToast("❌ Gagal kirim. Periksa koneksi.");
      console.error(e);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
  });

function attendLabel(v) {
  return (
    {
      hadir: "✅ Hadir",
      "tidak-hadir": "❌ Tidak Hadir",
      mungkin: "🤔 Belum Pasti",
    }[v] || v
  );
}
function createMsgEl(msg) {
  const el = document.createElement("div");
  el.className = "message-card";
  el.innerHTML =
    '<div class="message-header"><span class="message-name">' +
    esc(msg.name) +
    "</span>" +
    '<span class="message-attend">' +
    attendLabel(msg.attend) +
    "</span></div>" +
    '<p class="message-text">"' +
    esc(msg.message) +
    '"</p>' +
    '<p class="message-time">' +
    msg.time +
    "</p>";
  return el;
}
function prependMessage(msg) {
  if (!msgListEl) return;
  msgListEl.querySelector(".empty-msg")?.remove();
  msgListEl.insertBefore(createMsgEl(msg), msgListEl.firstChild);
  const c = document.getElementById("messagesCount");
  if (c) c.textContent = (parseInt(c.textContent) || 0) + 1 + " ucapan";
  const s = document.querySelector(".messages-scroll");
  if (s) s.scrollTop = 0;
}
async function loadMessages() {
  if (!msgListEl) return;
  try {
    const data = await sbGet(
      "messages?select=*&order=created_at.desc&limit=50",
    );
    const c = document.getElementById("messagesCount");
    if (!data || data.length === 0) {
      msgListEl.innerHTML =
        '<p class="empty-msg" style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
      if (c) c.textContent = "0 ucapan";
      return;
    }
    if (c) c.textContent = data.length + " ucapan";
    msgListEl.innerHTML = "";
    data.forEach(function (row) {
      msgListEl.appendChild(
        createMsgEl({
          name: row.name,
          attend: row.attend,
          message: row.message,
          time: new Date(row.created_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }),
      );
    });
  } catch (e) {
    msgListEl.innerHTML =
      '<p style="text-align:center;color:var(--gray);padding:2rem 0">Gagal memuat ucapan.</p>';
  }
  updateRateLimitInfo();
}

// ── Copy rekening ─────────────────────────────────────────────
function copyText(text) {
  navigator.clipboard
    .writeText(text)
    .then(function () {
      showToast("✅ Nomor berhasil disalin!");
    })
    .catch(function () {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showToast("✅ Nomor berhasil disalin!");
    });
}

// ── Toast ─────────────────────────────────────────────────────
const toastEl = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastEl.classList.remove("show");
  }, 3500);
}

// ── Utils ─────────────────────────────────────────────────────
function slugify(n) {
  return n
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
function esc(t) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(t || ""));
  return d.innerHTML;
}
function fmtNow() {
  return new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

console.log(
  "🎉 Wedding | Guest:",
  guestName,
  "| Protect:",
  CONFIG.protectLinks,
);
