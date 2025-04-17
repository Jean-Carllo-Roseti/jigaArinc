// const { contextBridge, ipcRenderer } = require('electron');

// // Expondo a API para o renderer.js
// contextBridge.exposeInMainWorld('serial', {
//   openSerialPort: (port) => ipcRenderer.send('selected-port', port),
//   onAvailablePorts: (callback) => ipcRenderer.on('available-ports', callback),
//   onDecodedData: (callback) => ipcRenderer.on('decoded-data', callback)
// });

// // Canal para os dados ARINC (direto no ipcRenderer)
// ipcRenderer.on('decoded-data', (event, data) => {
//   window.dispatchEvent(new CustomEvent('decoded-data', { detail: data }));
// });

// ipcRenderer.on('label-270-alert', (event, data) => {
//   window.dispatchEvent(new CustomEvent('label-270-alert', { detail: data }));
// });

// ipcRenderer.on('label-271-alert', (event, data) => {
//   window.dispatchEvent(new CustomEvent('label-271-alert', { detail: data }));
// });

// // Adicionando a escuta para as portas disponíveis
// ipcRenderer.on('available-ports', (event, ports) => {
//   console.log('Portas disponíveis:', ports);
//   // Aqui você pode manipular a UI para mostrar as portas
// });

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('serial', {
  // openSerialPort: (port) => ipcRenderer.send('selected-port', port),
  // requestPorts: () => ipcRenderer.invoke('request-ports'), // Alterado de send() para invoke()
  // openSerialPort: (port) => ipcRenderer.send('selected-port', port),

  requestPorts: () => ipcRenderer.invoke('request-ports'),
  onAvailablePorts: (callback) => {
      ipcRenderer.on('available-ports', (event, ports) => callback(ports));
  },

  // onAvailablePorts: (callback) => {
  //   ipcRenderer.on('available-ports', (event, ports) => callback(ports));
  // },

  onDecodedData: (callback) => {
    ipcRenderer.on('decoded-data', (event, data) => callback(data));
  }
});

// Eventos personalizados (para quem quiser usar o window.dispatchEvent)
ipcRenderer.on('decoded-data', (event, data) => {
  window.dispatchEvent(new CustomEvent('decoded-data', { detail: data }));
});

ipcRenderer.on('label-270-alert', (event, data) => {
  window.dispatchEvent(new CustomEvent('label-270-alert', { detail: data }));
});

ipcRenderer.on('label-271-alert', (event, data) => {
  window.dispatchEvent(new CustomEvent('label-271-alert', { detail: data }));
});
