const { contextBridge, ipcRenderer } = require('electron');

// Expondo a API para o renderer.js
contextBridge.exposeInMainWorld('serial', {
  openSerialPort: (port) => ipcRenderer.send('selected-port', port),
  onAvailablePorts: (callback) => ipcRenderer.on('available-ports', callback)
});
