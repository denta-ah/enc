# FileVault — Panduan Instalasi

Aplikasi enkripsi file dengan tampilan GUI modern berbasis Electron.

---

## Struktur File

```
FileVault/
├── main.js              ← Electron entry point (proses utama)
├── preload.js           ← Context bridge Electron
├── index.html           ← Tampilan UI
├── package.json         ← Konfigurasi npm
├── encrypt-recursive.js ← Script enkripsi (CLI / dipakai GUI)
├── decrypt-recursive.js ← Script dekripsi (CLI / dipakai GUI)
├── EncryptAll.bat       ← Shortcut enkripsi via CMD
└── DecryptAll.bat       ← Shortcut dekripsi via CMD
```

---

## Cara Install & Jalankan (GUI Electron)

### Prasyarat
- **Node.js** v18+ → https://nodejs.org
- **npm** (sudah termasuk bersama Node.js)

### Langkah
```bash
# 1. Masuk ke folder FileVault
cd FileVault

# 2. Install Electron
npm install

# 3. Jalankan aplikasi
npm start
```

---

## Cara Pakai via CMD (tanpa GUI)

Cukup jalankan langsung:
```
EncryptAll.bat   ← untuk enkripsi folder ini
DecryptAll.bat   ← untuk dekripsi folder ini
```

Atau manual:
```bash
node encrypt-recursive.js "C:\Data\Rahasia" "password_kuat" [delete]
node decrypt-recursive.js "C:\Data\Rahasia" "password_kuat" [delete]
```

---

## Format Enkripsi

Setiap file dienkripsi menjadi `namafile.ext.enc` dengan struktur:

```
[MAGIC 4B][SALT 16B][IV 12B][AUTH-TAG 16B][CIPHERTEXT]
```

- Algoritma : AES-256-GCM
- Derivasi kunci : PBKDF2-SHA256, 200.000 iterasi
- Salt & IV : acak per file (tidak pernah diulang)

---

## Paket sebagai .exe (Opsional)

```bash
npm install -g electron-builder
electron-builder --win --x64
```

Hasil installer ada di folder `dist/`.

---

> ⚠️ **Penting**: Simpan password Anda di tempat aman.
> File yang terenkripsi **tidak bisa dipulihkan** tanpa password yang benar.
