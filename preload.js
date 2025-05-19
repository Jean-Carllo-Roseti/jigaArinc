const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('serial', {
//   requestPorts: () => ipcRenderer.invoke('request-ports'),
//   onAvailablePorts: (callback) => {
//       ipcRenderer.on('available-ports', (event, ports) => callback(ports));
//   },

//   onDecodedData: (callback) => {
//     ipcRenderer.on('decoded-data', (event, data) => callback(data));
//   },

//   openSerialPort: (port) => ipcRenderer.send('selected-port', port),
// });

// const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('serial', {
  requestPorts: () => ipcRenderer.invoke('request-ports'),
  onAvailablePorts: (callback) => ipcRenderer.on('available-ports', (event, ports) => callback(ports)),
  openSerialPort: (port) => ipcRenderer.invoke('serialport-open', port),
  sendData: (data) => ipcRenderer.invoke('serialport-write', data)
  // openSerialPort: (port) => ipcRenderer.send('open-serial-port', port),
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
