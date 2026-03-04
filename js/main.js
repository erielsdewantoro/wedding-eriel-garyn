// ============================================================
// WEDDING INVITATION — Eriel & Garyn
// main.js — Fixed version: tracking + guestbook + live messages
// ============================================================

const CONFIG = {
  weddingDate: "2025-07-12T08:00:00",
  defaultGuest: "Tamu Undangan",
};

// ============================================================
// SUPABASE — helper yang benar (handle 204 No Content)
// ============================================================
const SUPABASE_URL = "https://tdlkbhzlvxovsrinhtha.supabase.co";
const SUPABASE_KEY = "sb_publishable_7i2Hp2kbkWmklAnaRXBHLA_uUKufVJK";
const SUPABASE_READY = true;

async function sbGet(endpoint) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + endpoint, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
    },
  });
  if (!res.ok) throw new Error("GET error " + res.status);
  return res.json();
}

async function sbPost(table, data) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + table, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal", // ← 204 kosong, ini yang bener
    },
    body: JSON.stringify(data),
  });
  // 200, 201, 204 = sukses semua
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("POST error " + res.status + ": " + errText);
  }
  return true; // sukses
}

async function sbPatch(table, filter, data) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?" + filter, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PATCH error " + res.status);
  return true;
}

// ============================================================
// 1. NAMA TAMU DARI URL
// ============================================================
function getGuestName() {
  const p = new URLSearchParams(window.location.search);
  const n = p.get("to");
  return n && n.trim() ? decodeURIComponent(n.trim()) : CONFIG.defaultGuest;
}

const guestName = getGuestName();
const guestNameEl = document.getElementById("guestName");
if (guestNameEl) guestNameEl.textContent = guestName;

// ============================================================
// 2. TRACKING — Catat ke Supabase saat "Buka Undangan" diklik
//    Ini yang bikin dashboard berubah dari 0 jadi angka nyata
// ============================================================
async function trackGuestOpen(name) {
  if (name === CONFIG.defaultGuest) return; // skip kalau buka tanpa ?to=
  try {
    // Cek sudah ada belum
    const existing = await sbGet(
      "guests?select=id&name=eq." + encodeURIComponent(name),
    );
    if (existing && existing.length > 0) {
      // Update waktu buka
      await sbPatch("guests", "id=eq." + existing[0].id, {
        opened: true,
        opened_at: new Date().toISOString(),
      });
    } else {
      // Insert baru
      await sbPost("guests", {
        name: name,
        slug: name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        opened: true,
        opened_at: new Date().toISOString(),
      });
    }
    console.log("✅ Tracking OK:", name);
  } catch (err) {
    // Gagal tracking tidak masalah — undangan tetap jalan
    console.warn("Tracking gagal (tidak masalah):", err.message);
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
  trackGuestOpen(guestName); // ← tracking di sini

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
    loadMessages(); // ← load ucapan setelah konten tampil
  }, 800);
});

// ============================================================
// 4. COUNTDOWN
// ============================================================
function startCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      const el = document.getElementById("countdown");
      if (el)
        el.innerHTML =
          '<p style="color:var(--gold);font-family:var(--font-display);font-size:1.4rem;letter-spacing:0.08em">✨ Hari yang Dinantikan Telah Tiba ✨</p>';
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

function updateMusicState(on) {
  isPlaying = on;
  if (musicIcon)
    musicIcon.className = on ? "fa-solid fa-pause" : "fa-solid fa-music";
  if (musicBar) musicBar.classList.toggle("paused", !on);
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
    if (src && lightbox) {
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
// 9. GUESTBOOK — Kirim & Tampilkan Ucapan
// ============================================================
const submitBtn = document.getElementById("submitBtn");
const gbNameEl = document.getElementById("gbName");
const gbAttendEl = document.getElementById("gbAttend");
const gbMessageEl = document.getElementById("gbMessage");
const msgListEl = document.getElementById("messagesList");
const charCountEl = document.getElementById("charCount");

// Isi nama otomatis dari URL
if (gbNameEl && guestName !== CONFIG.defaultGuest) gbNameEl.value = guestName;

// Counter karakter
if (gbMessageEl) {
  gbMessageEl.addEventListener("input", function () {
    if (charCountEl) charCountEl.textContent = gbMessageEl.value.length;
  });
}

// ---- Kirim ucapan ----
if (submitBtn) {
  submitBtn.addEventListener("click", async function () {
    const name = gbNameEl ? gbNameEl.value.trim() : "";
    const attend = gbAttendEl ? gbAttendEl.value : "hadir";
    const message = gbMessageEl ? gbMessageEl.value.trim() : "";

    if (!name) {
      showToast("⚠️ Nama tidak boleh kosong");
      gbNameEl && gbNameEl.focus();
      return;
    }
    if (!message) {
      showToast("⚠️ Pesan tidak boleh kosong");
      gbMessageEl && gbMessageEl.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    try {
      await sbPost("messages", { name, attend, message });

      showToast("✨ Ucapan berhasil dikirim! Terima kasih.");

      // Tampilkan langsung di list tanpa reload
      const msgObj = {
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
      prependMessage(msgObj);

      // Reset form
      if (gbMessageEl) {
        gbMessageEl.value = "";
      }
      if (charCountEl) charCountEl.textContent = "0";
      if (gbNameEl && guestName !== CONFIG.defaultGuest)
        gbNameEl.value = guestName;
    } catch (err) {
      console.error("Submit error:", err);
      showToast("❌ Gagal kirim: " + err.message);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
  });
}

// ---- Tampilkan ucapan di list ----
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
  el.innerHTML = `
    <div class="message-header">
      <span class="message-name">${esc(msg.name)}</span>
      <span class="message-attend">${attendLabel(msg.attend)}</span>
    </div>
    <p class="message-text">"${esc(msg.message)}"</p>
    <p class="message-time">${msg.time}</p>
  `;
  return el;
}

function prependMessage(msg) {
  if (!msgListEl) return;
  const empty = msgListEl.querySelector("p.empty-msg");
  if (empty) empty.remove();
  msgListEl.insertBefore(createMsgEl(msg), msgListEl.firstChild);
  // Update counter
  const countEl = document.getElementById("messagesCount");
  if (countEl) {
    const current = parseInt(countEl.textContent) || 0;
    countEl.textContent = current + 1 + " ucapan";
  }
  // Scroll ke atas agar pesan baru terlihat
  const scrollEl = document.querySelector(".messages-scroll");
  if (scrollEl) scrollEl.scrollTop = 0;
}

async function loadMessages() {
  if (!msgListEl) return;
  try {
    const data = await sbGet(
      "messages?select=*&order=created_at.desc&limit=50",
    );
    if (!data || data.length === 0) {
      msgListEl.innerHTML =
        '<p class="empty-msg" style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
      return;
    }
    msgListEl.innerHTML = "";
    const countEl = document.getElementById("messagesCount");
    if (countEl) countEl.textContent = data.length + " ucapan";
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
  } catch (err) {
    msgListEl.innerHTML =
      '<p style="text-align:center;color:var(--gray);padding:2rem 0">Gagal memuat ucapan.</p>';
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
// 11. TOAST NOTIFICATION
// ============================================================
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

// ============================================================
// UTILITY
// ============================================================
function esc(t) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(t || ""));
  return d.innerHTML;
}

console.log("🎉 Wedding loaded! Guest:", guestName);
