// const { app, BrowserWindow, ipcMain, Menu } = require('electron');
// const { openPort, listSerialPorts } = require('./serialManager');
// const serialManager = require('./serialManager');

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false
//     }
//   });

//   win.loadFile('renderer/index.html');

//   // Habilita o DevTools com clique direito
//   win.webContents.on('context-menu', (event, params) => {
//     const contextMenu = Menu.buildFromTemplate([
//       {
//         label: 'Inspecionar elemento',
//         click: () => {
//           win.webContents.inspectElement(params.x, params.y);
//         }
//       }
//     ]);
//     contextMenu.popup(win);
//   });

//   listSerialPorts().then(ports => {
//     win.webContents.on('did-finish-load', () => {
//       win.webContents.send('available-ports', ports);
//     });
//   });

//   ipcMain.on('selected-port', (event, selectedPort) => {
//     openPort(selectedPort);
//   });
// }

// app.whenReady().then(createWindow);

const path = require('path'); // Adicione isso no topo se ainda não estiver
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

// Importa todas as funções do serialManager
const serialManager = require('./serialManager');

// Desestrutura as funções que você já usa normalmente
const { openPort, listSerialPorts, setMainWindow } = serialManager;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // ⬇️ Aqui é onde a mágica acontece: passamos a janela principal para o serialManager
  setMainWindow(win);

  // Carrega a interface
  win.loadFile('renderer/index.html');

  // Ativa menu de contexto para inspecionar elementos com clique direito
  win.webContents.on('context-menu', (event, params) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Inspecionar elemento',
        click: () => {
          win.webContents.inspectElement(params.x, params.y);
        }
      }
    ]);
    contextMenu.popup(win);
  });

  // Envia lista de portas disponíveis quando a janela termina de carregar
  listSerialPorts().then(ports => {
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('available-ports', ports);
    });
  });

  // Quando o renderer escolher uma porta, abrimos ela
  ipcMain.on('selected-port', (event, selectedPort) => {
    openPort(selectedPort);
  });
}

app.whenReady().then(createWindow);
