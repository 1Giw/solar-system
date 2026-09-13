# 📋 Panduan Push ke GitHub

## Langkah-langkah Lengkap

### 1. Buka Terminal di Folder Project

Buka terminal/command prompt di folder project solar-system kamu.

### 2. Jalankan Perintah Berikut (Copy-Paste Satu per Satu)

```bash
# Inisialisasi git repository
git init

# Tambahkan semua file ke staging
git add .

# Commit perubahan
git commit -m "feat: Interactive 3D Solar System with Three.js"

# Tambahkan remote repository (Ganti dengan URL repo kamu)
git remote add origin https://github.com/1Giw/solar-system.git

# Rename branch ke main
git branch -M main

# Push ke GitHub
git push -u origin main
```

### 3. GitHub akan Meminta Login

Saat menjalankan perintah terakhir, GitHub akan meminta:
- **Username**: Masukkan username GitHub kamu (1Giw)
- **Password/Token**: 
  - Jika menggunakan password biasa, masukkan password GitHub
  - Jika sudah enable 2FA, gunakan Personal Access Token (PAT)

### 4. Cara Membuat Personal Access Token (Jika Diperlukan)

1. Buka https://github.com/settings/tokens
2. Klik **Generate new token (classic)**
3. Beri nama token (misal: "solar-system-deploy")
4. Pilih scope: **repo** (full control)
5. Klik **Generate token**
6. **COPY TOKEN** (hanya muncul sekali!)
7. Gunakan token ini sebagai password saat push

### 5. Aktifkan GitHub Pages

Setelah push berhasil:

1. Buka https://github.com/1Giw/solar-system
2. Klik tab **Settings** (di atas kanan)
3. Di sidebar kiri, klik **Pages**
4. Di bagian **Build and deployment**:
   - **Source**: Pilih `GitHub Actions`
5. Tunggu 2-3 menit untuk deploy pertama

### 6. Cek Website Kamu

Website akan live di: **https://1giw.github.io/solar-system/**

Kamu bisa cek progress deploy di tab **Actions** repository.

---

## 🔧 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/1Giw/solar-system.git
```

### Error: "Updates were rejected"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: "Authentication failed"
- Pastikan username dan password/token benar
- Gunakan Personal Access Token jika 2FA aktif
- Cek token masih valid di https://github.com/settings/tokens

### Website tidak muncul di GitHub Pages
- Cek tab **Actions** apakah build berhasil
- Pastikan `base: '/solar-system/'` ada di vite.config.js
- Tunggu 5-10 menit setelah push pertama

---

## 📝 Update Kode di Masa Depan

Setelah perubahan code, cukup jalankan:

```bash
git add .
git commit -m "update: deskripsi perubahan"
git push
```

GitHub Actions akan otomatis rebuild dan deploy! 🚀

---

## ✅ Checklist

- [ ] Git sudah terinstall di komputer
- [ ] Repository sudah dibuat di GitHub (https://github.com/1Giw/solar-system)
- [ ] Semua perintah git berhasil dijalankan tanpa error
- [ ] GitHub Pages sudah diaktifkan (Source: GitHub Actions)
- [ ] Website sudah bisa diakses di https://1giw.github.io/solar-system/

---

**Selamat! Solar System Explorer kamu sekarang live di internet!** 🎉🌌
