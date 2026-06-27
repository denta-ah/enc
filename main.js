const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 700,
    minHeight: 550,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f11',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Crypto core ──────────────────────────────────────────────────────────────

const ITER   = 200000;
const MAGIC  = Buffer.from('ENC1');

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');
}

function encryptBuffer(buf, password) {
  const salt = crypto.randomBytes(16);
  const iv   = crypto.randomBytes(12);
  const key  = deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc  = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag  = cipher.getAuthTag();
  return Buffer.concat([MAGIC, salt, iv, tag, enc]);
}

function decryptBuffer(buf, password) {
  if (buf.slice(0, 4).compare(MAGIC) !== 0) {
    throw new Error('Bukan file terenkripsi valid (magic bytes tidak cocok)');
  }
  const salt       = buf.slice(4, 20);
  const iv         = buf.slice(20, 32);
  const tag        = buf.slice(32, 48);
  const ciphertext = buf.slice(48);
  const key        = deriveKey(password, salt);
  const decipher   = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ── Walk helper ───────────────────────────────────────────────────────────────

function collectFiles(dir, mode) {
  const result = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    try {
      const st = fs.lstatSync(full);
      if (st.isDirectory()) {
        result.push(...collectFiles(full, mode));
      } else if (st.isFile()) {
        const ext  = path.extname(full).toLowerCase();
        const name = path.basename(full).toLowerCase();
        if (mode === 'encrypt') {
          if (
            ext === '.enc' ||
            name === 'encrypt-recursive.js' ||
            name === 'decrypt-recursive.js' ||
            name === 'encryptall.bat'        ||
            name === 'decryptall.bat'
          ) continue;
          result.push(full);
        } else {
          if (ext === '.enc') result.push(full);
        }
      }
    } catch {}
  }
  return result;
}

// ── IPC handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('count-files', async (_e, { folder, mode }) => {
  try {
    const files = collectFiles(folder, mode);
    return { count: files.length, error: null };
  } catch (err) {
    return { count: 0, error: err.message };
  }
});

ipcMain.handle('run-operation', async (_e, { folder, password, mode, deleteOriginal }) => {
  const sender = mainWindow.webContents;
  const files  = collectFiles(folder, mode);
  let ok = 0, fail = 0;

  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    try {
      const data = fs.readFileSync(src);
      let outPath;
      if (mode === 'encrypt') {
        const enc = encryptBuffer(data, password);
        outPath   = src + '.enc';
        fs.writeFileSync(outPath, enc);
      } else {
        const plain = decryptBuffer(data, password);
        outPath     = src.slice(0, -4);
        fs.writeFileSync(outPath, plain);
      }
      if (deleteOriginal) fs.unlinkSync(src);
      ok++;
      sender.send('progress', {
        current: i + 1,
        total: files.length,
        file: path.basename(src),
        status: 'ok'
      });
    } catch (err) {
      fail++;
      sender.send('progress', {
        current: i + 1,
        total: files.length,
        file: path.basename(src),
        status: 'error',
        error: err.message
      });
    }
  }

  return { ok, fail, total: files.length };
});

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());
