// const path = require('path'); // Adicione isso no topo se ainda não estiver
// const { app, BrowserWindow, ipcMain, Menu } = require('electron');

// // Importa todas as funções do serialManager
// const serialManager = require('./serialManager');

// // Desestrutura as funções que você já usa normalmente
// const { openPort, listSerialPorts, setMainWindow } = serialManager;

// let mainWindow; // Definindo a variável mainWindow globalmente

// // Função para criar a janela
// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true
//     }
//   });

//   // Passa a janela principal para o serialManager
//   setMainWindow(mainWindow);

//   // Carrega a interface
//   mainWindow.loadFile('renderer/index.html');

//   // Ativa menu de contexto para inspecionar elementos com clique direito
//   mainWindow.webContents.on('context-menu', (event, params) => {
//     const contextMenu = Menu.buildFromTemplate([
//       {
//         label: 'Inspecionar elemento',
//         click: () => {
//           mainWindow.webContents.inspectElement(params.x, params.y);
//         }
//       }
//     ]);
//     contextMenu.popup(mainWindow);
//   });

//   // Envia lista de portas disponíveis quando a janela termina de carregar
//   listSerialPorts().then(ports => {
//     mainWindow.webContents.on('did-finish-load', () => {
//       mainWindow.webContents.send('available-ports', ports);
//     });
//   });

//   // Quando o renderer escolher uma porta, abre ela
//   ipcMain.on('selected-port', (event, selectedPort) => {
//     openPort(selectedPort);
//   });
// }

// // Função para enviar dados para a UI
// function sendToUI(window, channel, payload) {
//   // console.log(`Enviando para UI no canal ${channel} com dados:`, payload);
//   if (window?.webContents) {
//     window.webContents.send(channel, payload);
//   } else {
//     console.warn(`UI não disponível para canal ${channel}`);
//   }
// }

// // Chama listSerialPorts depois que a janela principal estiver criada
// app.whenReady().then(() => {
//   createWindow();
//   listSerialPorts().then(ports => {
//     sendToUI(mainWindow, 'available-ports', ports); // Envia a lista de portas
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// const SerialPort = require('serialport');
// SerialPort.list().then(ports => {
//   console.log(ports);
// }).catch(err => {
//   console.error('Erro ao listar portas:', err);
// });


// const path = require('path'); 
// const { app, BrowserWindow, ipcMain, Menu } = require('electron');
// // const SerialPort = require('serialport'); // Módulo serialport
// const { SerialPort } = require('serialport');
// const { list } = require('@serialport/list');
// const { listSerialPorts, openPort, setMainWindow } = require('./serialManager'); // Usando funções de serialManager

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true
//     }
//   });

//   setMainWindow(mainWindow);
//   mainWindow.loadFile('renderer/index.html'); // Carrega o HTML da UI

//   // Adiciona um menu de contexto para inspecionar elementos (útil para desenvolvedores)
//   mainWindow.webContents.on('context-menu', (event, params) => {
//     const contextMenu = Menu.buildFromTemplate([
//       {
//         label: 'Inspecionar elemento',
//         click: () => {
//           mainWindow.webContents.inspectElement(params.x, params.y);
//         }
//       }
//     ]);
//     contextMenu.popup(mainWindow);
//   });

//   // Envia a lista de portas seriais para a interface quando a janela terminar de carregar
//   listSerialPorts().then(ports => {
//     mainWindow.webContents.send('available-ports', ports);
//   }).catch(err => {
//     console.error('Erro ao listar portas:', err);
//   });
// }

// // Função para enviar dados para a UI
// function sendToUI(window, channel, payload) {
//   if (window?.webContents) {
//     window.webContents.send(channel, payload);
//   } else {
//     console.warn(`UI não disponível para canal ${channel}`);
//   }
// }

// app.whenReady().then(() => {
//   createWindow();

//   // Listando as portas seriais disponíveis após a criação da janela
//   SerialPort.list().then(ports => {
//     console.log('Portas seriais disponíveis:', ports);
//     sendToUI(mainWindow, 'available-ports', ports); // Envia para o renderer
//   }).catch(err => {
//     console.error('Erro ao listar portas:', err);
//   });
// });

// list().then(ports => {
//   console.log('Portas seriais disponíveis:', ports);
//   sendToUI(mainWindow, 'available-ports', ports);
// }).catch(err => {
//   console.error('Erro ao listar portas:', err);
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });


// const path = require('path');
// const { app, BrowserWindow, ipcMain, Menu } = require('electron');
// const { SerialPort } = require('serialport');
// // const { list } = require('@serialport/list');
// const { listSerialPorts, openPort, setMainWindow } = require('./serialManager');

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true
//     }
//   });

//   setMainWindow(mainWindow);
//   mainWindow.loadFile('renderer/index.html');

//   // Menu de contexto (dev tools)
//   mainWindow.webContents.on('context-menu', (event, params) => {
//     const contextMenu = Menu.buildFromTemplate([
//       {
//         label: 'Inspecionar elemento',
//         click: () => {
//           mainWindow.webContents.inspectElement(params.x, params.y);
//         }
//       }
//     ]);
//     contextMenu.popup(mainWindow);
//   });

//   // Envia lista de portas seriais após o carregamento da janela
//   listSerialPorts().then(ports => {
//     mainWindow.webContents.send('available-ports', ports);
//   }).catch(err => {
//     console.error('Erro ao listar portas (serialManager):', err);
//   });
// }

// function sendToUI(window, channel, payload) {
//   if (window?.webContents) {
//     window.webContents.send(channel, payload);
//   } else {
//     console.warn(`UI não disponível para canal ${channel}`);
//   }
// }

// app.whenReady().then(() => {
//   createWindow();

//   // Usa list() da nova versão do serialport
//   SerialPort.list().then(ports => {
//     console.log('Portas seriais disponíveis:', ports);
//     sendToUI(mainWindow, 'available-ports', ports);
//   }).catch(err => {
//     console.error('Erro ao listar portas (serialport):', err);
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// ipcMain.handle('request-ports', async () => {
//   try {
//     const ports = await SerialPort.list();
//     console.log("Portas disponíveis no main process:", ports);  // Verifique se a COM11 está aqui
//     return ports;  // Retorne as portas
//   } catch (error) {
//     console.error("Erro ao listar portas:", error);
//     return [];  // Retorne um array vazio em caso de erro
//   }
// });

// ipcMain.on('request-ports', async () => {
//   await serialManager.refreshSerialPorts();
// });

// ipcMain.on('selected-port', (event, port) => {
//   serialManager.openPort(port);
// });

// // Após o carregamento da janela
// app.whenReady().then(() => {
//   createWindow();

//   // Envia a lista de portas assim que a janela é criada
//   listSerialPorts().then(ports => {
//     console.log('Portas serial disponíveis:', ports);
//     mainWindow.webContents.send('available-ports', ports);  // Envia as portas para o frontend
//   }).catch(err => {
//     console.error('Erro ao listar portas (serialManager):', err);
//   });
// });

// usando ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

const path = require('path');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const serialManager = require('./serialManager'); // Importe o módulo completo
const SerialPort = require('serialport');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      contextIsolation: true,
      enableRemoteModule: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'self'"
    }
  });

  serialManager.setMainWindow(mainWindow);
  mainWindow.loadFile('renderer/index.html'); // Corrigi o caminho para o HTML

  // Menu de contexto (dev tools)
  mainWindow.webContents.on('context-menu', (event, params) => {
    Menu.buildFromTemplate([
      {
        label: 'Inspecionar elemento',
        click: () => mainWindow.webContents.inspectElement(params.x, params.y)
      }
    ]).popup();
  });
}

// Centraliza o envio de dados para a UI
function sendToUI(channel, payload) {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send(channel, payload);
  } else {
    console.warn(`Janela não disponível para enviar via ${channel}`);
  }
}

app.whenReady().then(() => {
  createWindow();

  // Configuração dos handlers IPC
  ipcMain.handle('request-ports', async (event) => {
    // try {
    //   const ports = await serialManager.listSerialPorts();
    //   console.log("Portas disponíveis:", ports);
    //   return ports;
    // } catch (error) {
    //   console.error("Erro ao listar portas:", error);
    //   return [];
    // }

    // return await serialManager.listSerialPorts();
    const ports = await serialManager.listSerialPorts();
    event.sender.send('available-ports', ports);
    return ports;
  });

  ipcMain.on('selected-port', (_, port) => {
    serialManager.openPort(port);
  });

  // Envia portas disponíveis ao iniciar
  serialManager.listSerialPorts()
    .then(ports => sendToUI('available-ports', ports))
    .catch(err => console.error('Erro ao listar portas:', err));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
