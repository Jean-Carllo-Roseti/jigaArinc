const { contextBridge, ipcRenderer } = require('electron');

// Expondo a API para o renderer.js
contextBridge.exposeInMainWorld('serial', {
  openSerialPort: (port) => ipcRenderer.send('selected-port', port),
  onAvailablePorts: (callback) => ipcRenderer.on('available-ports', callback),
  onDecodedData: (callback) => ipcRenderer.on('decoded-data', callback)
});

// Canal para os dados ARINC (direto no ipcRenderer)
ipcRenderer.on('decoded-data', (event, data) => {
  window.dispatchEvent(new CustomEvent('decoded-data', { detail: data }));
});
