// Fake Loc Desktop — Electron main process
// Security: nodeIntegration disabled, contextIsolation enabled, sandbox enabled.
// The renderer loads the static Vite build from extraResources.
'use strict';

const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

function getWebappPath() {
  if (isDev) {
    // In development, serve from the web dist folder directly
    return path.join(__dirname, '..', 'web', 'dist');
  }
  // In production, serve from extraResources
  return path.join(process.resourcesPath, 'webapp');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 480,
    minHeight: 600,
    title: 'Fake Loc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          " script-src 'self';" +
          " style-src 'self' 'unsafe-inline';" +
          " img-src 'self' data: https://*.tile.openstreetmap.org;" +
          " connect-src 'self' https://*.supabase.co;" +
          " font-src 'self';" +
          " object-src 'none';" +
          " base-uri 'self';"
        ],
      },
    });
  });

  // Block navigation to external URLs
  win.webContents.on('will-navigate', (event, url) => {
    const parsed = new URL(url);
    if (parsed.protocol !== 'file:') {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Block new window creation; open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const webappPath = getWebappPath();
  const indexPath = path.join(webappPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    win.loadFile(indexPath);
  } else {
    win.loadURL('data:text/html,<h1>Build not found</h1><p>Run <code>npm run build:web</code> in the web directory first.</p>');
  }

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

// IPC handlers — minimal surface, validated inputs
ipcMain.handle('app:getVersion', () => app.getVersion());

ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'));

ipcMain.handle('file:saveDialog', async (_event, options) => {
  const { dialog } = require('electron');
  const result = await dialog.showSaveDialog(options || {});
  return result;
});

ipcMain.handle('file:openDialog', async (_event, options) => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(options || {});
  return result;
});

ipcMain.handle('file:readText', async (_event, filePath) => {
  if (typeof filePath !== 'string' || filePath.length > 4096) {
    throw new Error('Invalid file path');
  }
  return fs.promises.readFile(filePath, 'utf-8');
});

ipcMain.handle('file:writeText', async (_event, filePath, content) => {
  if (typeof filePath !== 'string' || filePath.length > 4096) {
    throw new Error('Invalid file path');
  }
  if (typeof content !== 'string' || content.length > 10_000_000) {
    throw new Error('Content too large');
  }
  await fs.promises.writeFile(filePath, content, 'utf-8');
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
