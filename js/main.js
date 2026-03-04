// ============================================================
// WEDDING INVITATION — Eriel & Garyn
// main.js — Versi lengkap dengan tracking & Supabase
// ============================================================

const CONFIG = {
  weddingDate: "2025-07-12T08:00:00",
  defaultGuest: "Tamu Undangan",
};

// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = "https://tdlkbhzlvxovsrinhtha.supabase.co";
const SUPABASE_KEY = "sb_publishable_7i2Hp2kbkWmklAnaRXBHLA_uUKufVJK";
const SUPABASE_READY = SUPABASE_URL.includes("supabase.co");

async function supabaseFetch(endpoint, options = {}) {
  const url = SUPABASE_URL + "/rest/v1/" + endpoint;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error("Supabase error: " + res.status);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ============================================================
// 1. NAMA TAMU DARI URL
// ============================================================
function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("to");
  if (name && name.trim() !== "") return decodeURIComponent(name.trim());
  return CONFIG.defaultGuest;
}

const guestName = getGuestName();
const guestNameEl = document.getElementById("guestName");
if (guestNameEl) guestNameEl.textContent = guestName;

// ============================================================
// 2. TRACKING — Catat ke Supabase saat tamu buka undangan
// ============================================================
async function trackGuestOpen(name) {
  if (!SUPABASE_READY || name === CONFIG.defaultGuest) return;
  try {
    const existing = await supabaseFetch(
      "guests?select=id&name=eq." + encodeURIComponent(name),
    );
    if (existing && existing.length > 0) {
      await supabaseFetch("guests?id=eq." + existing[0].id, {
        method: "PATCH",
        body: JSON.stringify({
          opened: true,
          opened_at: new Date().toISOString(),
        }),
        prefer: "return=minimal",
      });
    } else {
      await supabaseFetch("guests", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          slug: name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
          opened: true,
          opened_at: new Date().toISOString(),
        }),
        prefer: "return=minimal",
      });
    }
    console.log("Tracking OK:", name);
  } catch (err) {
    console.log("Tracking gagal:", err.message);
  }
}

// ============================================================
// 3. OPENING SCREEN
// ============================================================
const openBtn = document.getElementById("openBtn");
const opening = document.getElementById("opening");
const mainContent = document.getElementById("mainContent");
const bgMusic = document.getElementById("bgMusic");

openBtn.addEventListener("click", function () {
  trackGuestOpen(guestName); // <- tracking di sini!
  opening.classList.add("fade-out");
  setTimeout(function () {
    opening.style.display = "none";
    mainContent.classList.remove("hidden");
    if (bgMusic) {
      bgMusic.play().catch(function () {});
      updateMusicState(true);
    }
    startCountdown();
    setTimeout(triggerHeroAnimations, 100);
    initScrollReveal();
  }, 800);
});

// ============================================================
// 4. COUNTDOWN
// ============================================================
function startCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  function update() {
    const diff = target - Date.now();
    if (diff <= 0) {
      const el = document.getElementById("countdown");
      if (el)
        el.innerHTML =
          '<p style="color:var(--gold);font-family:var(--font-display);font-size:1.5rem">✨ Hari yang Dinantikan Telah Tiba ✨</p>';
      return;
    }
    document.getElementById("days").textContent = String(
      Math.floor(diff / 86400000),
    ).padStart(2, "0");
    document.getElementById("hours").textContent = String(
      Math.floor((diff % 86400000) / 3600000),
    ).padStart(2, "0");
    document.getElementById("minutes").textContent = String(
      Math.floor((diff % 3600000) / 60000),
    ).padStart(2, "0");
    document.getElementById("seconds").textContent = String(
      Math.floor((diff % 60000) / 1000),
    ).padStart(2, "0");
  }
  update();
  setInterval(update, 1000);
}

// ============================================================
// 5. HERO ANIMATIONS
// ============================================================
function triggerHeroAnimations() {
  document.querySelectorAll(".fade-up").forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add("animated");
    }, i * 150);
  });
}

// ============================================================
// 6. SCROLL REVEAL
// ============================================================
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
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    obs.observe(el);
  });
}

// ============================================================
// 7. MUSIC PLAYER
// ============================================================
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicBar = document.getElementById("musicBar");
let isPlaying = false;

function updateMusicState(playing) {
  isPlaying = playing;
  if (musicIcon)
    musicIcon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-music";
  if (musicBar) musicBar.classList.toggle("paused", !playing);
}

if (musicToggle) {
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
        .catch(function () {});
    }
  });
}

// ============================================================
// 8. GALLERY LIGHTBOX
// ============================================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-item").forEach(function (item) {
  item.addEventListener("click", function () {
    const src = item.getAttribute("data-src");
    if (src && lightbox && lightboxImg) {
      lightboxImg.src = src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });
});
if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox)
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeLightbox();
});
function closeLightbox() {
  if (lightbox) lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

// ============================================================
// 9. GUESTBOOK
// ============================================================
const submitBtn = document.getElementById("submitBtn");
const gbName = document.getElementById("gbName");
const gbAttend = document.getElementById("gbAttend");
const gbMessage = document.getElementById("gbMessage");
const msgList = document.getElementById("messagesList");
const charCountEl = document.getElementById("charCount");

if (gbMessage)
  gbMessage.addEventListener("input", function () {
    if (charCountEl) charCountEl.textContent = gbMessage.value.length;
  });
if (gbName && guestName !== CONFIG.defaultGuest) gbName.value = guestName;

loadMessages();

if (submitBtn) {
  submitBtn.addEventListener("click", async function () {
    const name = gbName ? gbName.value.trim() : "";
    const attend = gbAttend ? gbAttend.value : "hadir";
    const message = gbMessage ? gbMessage.value.trim() : "";
    if (!name) {
      showToast("Nama tidak boleh kosong");
      return;
    }
    if (!message) {
      showToast("Pesan tidak boleh kosong");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    const msgObj = {
      id: Date.now(),
      name,
      attend,
      message,
      time: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (SUPABASE_READY) {
      try {
        await supabaseFetch("messages", {
          method: "POST",
          body: JSON.stringify({ name, attend, message }),
          prefer: "return=minimal",
        });
        showToast("✨ Ucapan berhasil dikirim!");
        prependMessage(msgObj);
      } catch (err) {
        showToast("Gagal kirim. Coba lagi ya.");
      }
    } else {
      saveMessage(msgObj);
      prependMessage(msgObj);
      showToast("✨ Ucapan terkirim!");
    }
    if (gbName)
      gbName.value = guestName !== CONFIG.defaultGuest ? guestName : "";
    if (gbMessage) {
      gbMessage.value = "";
    }
    if (charCountEl) charCountEl.textContent = "0";
    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
  });
}

function getAttendLabel(v) {
  return (
    {
      hadir: "✅ Hadir",
      "tidak-hadir": "❌ Tidak Hadir",
      mungkin: "🤔 Belum Pasti",
    }[v] || v
  );
}

function createMessageEl(msg) {
  const el = document.createElement("div");
  el.className = "message-card";
  el.innerHTML = `<div class="message-header"><span class="message-name">${escapeHtml(msg.name)}</span><span class="message-attend">${getAttendLabel(msg.attend)}</span></div><p class="message-text">"${escapeHtml(msg.message)}"</p><p class="message-time">${msg.time}</p>`;
  return el;
}

function prependMessage(msg) {
  if (!msgList) return;
  const empty = msgList.querySelector("p");
  if (empty) empty.remove();
  msgList.insertBefore(createMessageEl(msg), msgList.firstChild);
}

async function loadMessages() {
  if (!msgList) return;
  if (SUPABASE_READY) {
    try {
      const data = await supabaseFetch(
        "messages?select=*&order=created_at.desc&limit=50",
      );
      if (!data || data.length === 0) {
        msgList.innerHTML =
          '<p style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
        return;
      }
      data.forEach(function (row) {
        msgList.appendChild(
          createMessageEl({
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
    } catch (err) {
      msgList.innerHTML =
        '<p style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0">Gagal memuat ucapan.</p>';
    }
  } else {
    const msgs = getSavedMessages();
    if (msgs.length === 0) {
      msgList.innerHTML =
        '<p style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
      return;
    }
    msgs.forEach(function (m) {
      msgList.appendChild(createMessageEl(m));
    });
  }
}

function saveMessage(msg) {
  const l = getSavedMessages();
  l.unshift(msg);
  localStorage.setItem("wedding_messages", JSON.stringify(l.slice(0, 100)));
}
function getSavedMessages() {
  try {
    return JSON.parse(localStorage.getItem("wedding_messages") || "[]");
  } catch {
    return [];
  }
}

// ============================================================
// 10. COPY REKENING
// ============================================================
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

// ============================================================
// 11. TOAST
// ============================================================
const toastEl = document.getElementById("toast");
let toastTimeout;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () {
    toastEl.classList.remove("show");
  }, 3000);
}

// ============================================================
// 12. SMOOTH SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute("href"));
    if (t) t.scrollIntoView({ behavior: "smooth" });
  });
});

console.log("Wedding Invitation loaded! Guest:", guestName);
console.log("Supabase:", SUPABASE_READY ? "Connected" : "Not configured");
