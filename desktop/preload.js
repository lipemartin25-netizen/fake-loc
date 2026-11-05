// Fake Loc Desktop — Preload script
// Exposes a minimal, validated API to the renderer via contextBridge.
// No direct Node.js access is available in the renderer.
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fakeLoc', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),

  // File dialogs (native OS)
  saveDialog: (options) => ipcRenderer.invoke('file:saveDialog', options),
  openDialog: (options) => ipcRenderer.invoke('file:openDialog', options),

  // File I/O (restricted to user-chosen paths)
  readTextFile: (filePath) => ipcRenderer.invoke('file:readText', filePath),
  writeTextFile: (filePath, content) => ipcRenderer.invoke('file:writeText', filePath, content),

  // Platform identifier
  platform: process.platform,
});
