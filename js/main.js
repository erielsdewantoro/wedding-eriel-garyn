// ============================================================
// WEDDING INVITATION — Eriel & Garyn
// main.js — Semua logika JavaScript
// ============================================================

// ---- KONFIGURASI (ubah di sini jika perlu) ----
const CONFIG = {
  weddingDate: "2025-07-12T08:00:00", // Tanggal pernikahan
  defaultGuest: "Tamu Undangan", // Nama default jika URL tidak ada ?to=
};

// ============================================================
// 1. PERSONALISASI NAMA TAMU DARI URL
//    Cara pakai: index.html?to=Nama%20Tamu
// ============================================================
function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("to");
  // Decode dan bersihkan nama dari URL
  if (name && name.trim() !== "") {
    return decodeURIComponent(name.trim());
  }
  return CONFIG.defaultGuest;
}

const guestNameEl = document.getElementById("guestName");
if (guestNameEl) {
  guestNameEl.textContent = getGuestName();
}

// ============================================================
// 2. OPENING SCREEN — Tombol "Buka Undangan"
// ============================================================
const openBtn = document.getElementById("openBtn");
const opening = document.getElementById("opening");
const mainContent = document.getElementById("mainContent");
const bgMusic = document.getElementById("bgMusic");

openBtn.addEventListener("click", function () {
  // Animasi fade out opening screen
  opening.classList.add("fade-out");

  setTimeout(function () {
    opening.style.display = "none";
    mainContent.classList.remove("hidden");

    // Coba autoplay musik
    if (bgMusic) {
      bgMusic.play().catch(function () {
        // Autoplay diblokir browser — tidak masalah, user bisa klik tombol musik
        console.log("Autoplay diblokir, klik tombol musik untuk play");
      });
      updateMusicState(true);
    }

    // Mulai countdown
    startCountdown();

    // Animasi fade-up hero setelah konten muncul
    setTimeout(triggerHeroAnimations, 100);

    // Aktifkan scroll reveal
    initScrollReveal();
  }, 800);
});

// ============================================================
// 3. COUNTDOWN TIMER
// ============================================================
function startCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      // Hari H sudah tiba!
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";

      const countdown = document.getElementById("countdown");
      if (countdown) {
        countdown.innerHTML =
          '<p style="color:var(--gold);font-family:var(--font-display);font-size:1.5rem;letter-spacing:0.1em">✨ Hari yang Dinantikan Telah Tiba ✨</p>';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(
      2,
      "0",
    );
    document.getElementById("minutes").textContent = String(minutes).padStart(
      2,
      "0",
    );
    document.getElementById("seconds").textContent = String(seconds).padStart(
      2,
      "0",
    );
  }

  update(); // Panggil langsung agar tidak delay 1 detik
  setInterval(update, 1000);
}

// ============================================================
// 4. HERO ANIMATIONS
// ============================================================
function triggerHeroAnimations() {
  const fadeEls = document.querySelectorAll(".fade-up");
  fadeEls.forEach(function (el, index) {
    setTimeout(function () {
      el.style.animationDelay = "0s";
      el.classList.add("animated");
    }, index * 150);
  });
}

// ============================================================
// 5. SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Stop observing setelah animasi
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
}

// ============================================================
// 6. MUSIC PLAYER
// ============================================================
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicBar = document.getElementById("musicBar");
let isPlaying = false;

function updateMusicState(playing) {
  isPlaying = playing;
  if (playing) {
    musicIcon.className = "fa-solid fa-pause";
    if (musicBar) musicBar.classList.remove("paused");
  } else {
    musicIcon.className = "fa-solid fa-music";
    if (musicBar) musicBar.classList.add("paused");
  }
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
        .catch(function (err) {
          console.log("Tidak bisa play musik:", err);
        });
    }
  });
}

// ============================================================
// 7. GALLERY LIGHTBOX
// ============================================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const galleryItems = document.querySelectorAll(".gallery-item");

galleryItems.forEach(function (item) {
  item.addEventListener("click", function () {
    const src = item.getAttribute("data-src");
    if (src && lightbox && lightboxImg) {
      lightboxImg.src = src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}
if (lightbox) {
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeLightbox();
});

function closeLightbox() {
  if (lightbox) lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

// ============================================================
// 8. SUPABASE CONFIG
//    Isi SUPABASE_URL dan SUPABASE_KEY setelah kamu buat project di Supabase
//    Cara dapat key: Supabase Dashboard → Settings → API
// ============================================================
const SUPABASE_URL = "GANTI_DENGAN_PROJECT_URL"; // contoh: https://abcxyz.supabase.co
const SUPABASE_KEY = "GANTI_DENGAN_ANON_KEY"; // contoh: eyJhbGciOi...

// Cek apakah Supabase sudah dikonfigurasi
const SUPABASE_READY = SUPABASE_URL !== "GANTI_DENGAN_PROJECT_URL";

// Helper: fetch ke Supabase REST API
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
  return res.json();
}

// ============================================================
// 9. GUESTBOOK — SUPABASE + LOCAL STORAGE FALLBACK
// ============================================================
const submitBtn = document.getElementById("submitBtn");
const gbName = document.getElementById("gbName");
const gbAttend = document.getElementById("gbAttend");
const gbMessage = document.getElementById("gbMessage");
const messagesList = document.getElementById("messagesList");
const charCountEl = document.getElementById("charCount");

// Update karakter counter
if (gbMessage) {
  gbMessage.addEventListener("input", function () {
    if (charCountEl) charCountEl.textContent = gbMessage.value.length;
  });
}

// Load pesan yang sudah tersimpan
loadMessages();

if (submitBtn) {
  submitBtn.addEventListener("click", async function () {
    const name = gbName ? gbName.value.trim() : "";
    const attend = gbAttend ? gbAttend.value : "";
    const message = gbMessage ? gbMessage.value.trim() : "";

    if (!name) {
      showToast("⚠️ Nama tidak boleh kosong");
      if (gbName) gbName.focus();
      return;
    }
    if (!message) {
      showToast("⚠️ Pesan tidak boleh kosong");
      if (gbMessage) gbMessage.focus();
      return;
    }

    // Nonaktifkan tombol saat loading
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    const newMsg = {
      id: Date.now(),
      name: name,
      attend: attend,
      message: message,
      time: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (SUPABASE_READY) {
      // Kirim ke Supabase
      try {
        await supabaseFetch("messages", {
          method: "POST",
          body: JSON.stringify({ name, attend, message }),
          prefer: "return=minimal",
        });
        showToast("✨ Ucapan berhasil dikirim! Terima kasih.");
        prependMessage(newMsg);
      } catch (err) {
        console.error(err);
        showToast("❌ Gagal kirim. Coba lagi ya.");
      }
    } else {
      // Fallback localStorage (mode development)
      saveMessage(newMsg);
      prependMessage(newMsg);
      showToast("✨ Ucapan berhasil dikirim! (Mode lokal)");
    }

    // Reset form
    if (gbName) gbName.value = "";
    if (gbMessage) gbMessage.value = "";
    if (charCountEl) charCountEl.textContent = "0";
    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
  });
}

function getAttendLabel(value) {
  const labels = {
    hadir: "✅ Hadir",
    "tidak-hadir": "❌ Tidak Hadir",
    mungkin: "🤔 Belum Pasti",
  };
  return labels[value] || value;
}

function createMessageEl(msg) {
  const el = document.createElement("div");
  el.className = "message-card";
  el.innerHTML = `
    <div class="message-header">
      <span class="message-name">${escapeHtml(msg.name)}</span>
      <span class="message-attend">${getAttendLabel(msg.attend)}</span>
    </div>
    <p class="message-text">"${escapeHtml(msg.message)}"</p>
    <p class="message-time">${msg.time}</p>
  `;
  return el;
}

function prependMessage(msg) {
  if (!messagesList) return;
  const el = createMessageEl(msg);
  messagesList.insertBefore(el, messagesList.firstChild);
}

function saveMessage(msg) {
  const messages = getSavedMessages();
  messages.unshift(msg); // Tambah di depan
  // Batasi 100 pesan di localStorage
  const limited = messages.slice(0, 100);
  localStorage.setItem("wedding_messages", JSON.stringify(limited));
}

function getSavedMessages() {
  try {
    return JSON.parse(localStorage.getItem("wedding_messages") || "[]");
  } catch (e) {
    return [];
  }
}

async function loadMessages() {
  if (!messagesList) return;

  if (SUPABASE_READY) {
    // Load dari Supabase — urutkan terbaru dulu, maks 50
    try {
      const data = await supabaseFetch(
        "messages?select=*&order=created_at.desc&limit=50",
      );
      if (!data || data.length === 0) {
        messagesList.innerHTML = `<p style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Belum ada ucapan. Jadilah yang pertama! 💌</p>`;
        return;
      }
      data.forEach(function (row) {
        const msg = {
          id: row.id,
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
        };
        messagesList.appendChild(createMessageEl(msg));
      });
    } catch (err) {
      console.error("Gagal load pesan dari Supabase:", err);
      messagesList.innerHTML = `<p style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Gagal memuat ucapan. Periksa koneksi.</p>`;
    }
  } else {
    // Fallback localStorage
    const messages = getSavedMessages();
    if (messages.length === 0) {
      messagesList.innerHTML = `<p style="text-align:center;color:var(--gray);font-style:italic;padding:2rem 0;font-family:var(--font-body)">Belum ada ucapan. Jadilah yang pertama! 💌</p>`;
      return;
    }
    messages.forEach(function (msg) {
      messagesList.appendChild(createMessageEl(msg));
    });
  }
}

// ============================================================
// 9. COPY TO CLIPBOARD (Amplop Digital)
// ============================================================
function copyText(text) {
  navigator.clipboard
    .writeText(text)
    .then(function () {
      showToast("✅ Nomor berhasil disalin!");
    })
    .catch(function () {
      // Fallback untuk browser lama
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
// 10. TOAST NOTIFICATION
// ============================================================
const toastEl = document.getElementById("toast");
let toastTimeout;

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () {
    toastEl.classList.remove("show");
  }, 3000);
}

// ============================================================
// 11. UTILITY — Escape HTML (keamanan input)
// ============================================================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ============================================================
// 12. SMOOTH SCROLL untuk navigasi (jika ditambahkan)
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

console.log("🎉 Wedding Invitation — Eriel & Garyn loaded!");
console.log("💡 Tips: Buka dengan ?to=NamaTamu untuk personalisasi");
