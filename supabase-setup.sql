-- ============================================================
-- WEDDING INVITATION — Eriel & Garyn
-- Supabase SQL Setup
-- Jalankan ini di: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ---- TABEL 1: UCAPAN / GUESTBOOK ----
CREATE TABLE IF NOT EXISTS messages (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  attend      TEXT NOT NULL DEFAULT 'hadir',
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- TABEL 2: DAFTAR TAMU ----
CREATE TABLE IF NOT EXISTS guests (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,   -- Untuk URL: ?to=slug
  phone       TEXT,
  opened      BOOLEAN DEFAULT FALSE,  -- Apakah sudah buka undangan?
  opened_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- IZIN AKSES (Row Level Security) ----
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests   ENABLE ROW LEVEL SECURITY;

-- Siapa saja boleh BACA messages (untuk tampilkan di web)
CREATE POLICY "Siapa saja bisa baca pesan"
  ON messages FOR SELECT USING (true);

-- Siapa saja boleh KIRIM pesan baru
CREATE POLICY "Siapa saja bisa kirim pesan"
  ON messages FOR INSERT WITH CHECK (true);

-- Siapa saja boleh BACA data tamu (untuk validasi nama)
CREATE POLICY "Siapa saja bisa baca tamu"
  ON guests FOR SELECT USING (true);

-- Siapa saja boleh UPDATE status opened
CREATE POLICY "Siapa saja bisa update status buka"
  ON guests FOR UPDATE USING (true);

-- ---- CONTOH DATA PESAN (opsional, hapus jika tidak mau) ----
INSERT INTO messages (name, attend, message) VALUES
('Budi Santoso',     'hadir',       'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.'),
('Sari Dewi',        'hadir',       'Barakallahu lakuma wa baraka alaikuma wa jama''a bainakuma fi khair. Aamiin!'),
('Ahmad Fauzi',      'tidak-hadir', 'Mohon maaf tidak bisa hadir, semoga pernikahan kalian penuh berkah dan kebahagiaan selalu!'),
('Rizky Pratama',    'mungkin',     'Insyaallah bisa hadir. Semoga menjadi pasangan yang selalu kompak dan saling mendukung.'),
('Nurul Hidayah',    'hadir',       'Wah akhirnya! Selamat ya, semoga langgeng sampai kakek nenek dan dikaruniai keturunan yang sholeh sholehah!');