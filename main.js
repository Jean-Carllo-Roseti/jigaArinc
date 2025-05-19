const path = require('path');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const serialManager = require('./serialManager'); // Importe o módulo completo
const { SerialPort } = require('serialport');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // Apenas uma vez
      sandbox: true,
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

app.whenReady().then(async () => {
  try {
    createWindow();

    // Solicitar as portas
    const ports = await serialManager.listSerialPorts();
    mainWindow.webContents.send('available-ports', ports);  // Corrigido o envio das portas para a UI

    // Configuração dos handlers IPC
    ipcMain.handle('request-ports', async () => {
      try {
        const ports = await serialManager.listSerialPorts(); // Agora não está comentado
        return ports;
      } catch (error) {
        console.error('Erro ao listar portas:', error);
        throw error;
      }
    });

    ipcMain.handle('serialport-write', (_, data) => {
      return serialManager.sendData(data);
    });


    ipcMain.handle('serialport-open', async (event, port) => {
      console.log(`Tentando abrir a porta: ${port}`);  // Log da tentativa
    
      try {
        const serialPort = new SerialPort({ path: port, baudRate: 9600 });
        console.log(`Conectado com sucesso à porta ${port}`);
        
        // Retorne um objeto confirmando a conexão bem-sucedida
        return { success: true, message: `Conectado com sucesso à porta ${port}` };
      } catch (error) {
        console.error(`Erro ao conectar à porta ${port}:`, error);
        
        // Retorne um erro de forma consistente
        return { success: false, message: `Erro ao conectar: ${error.message}` };
      }
    });
    
    ipcMain.on('selected-port', (_, port) => {
      console.log(`Tentando abrir a porta: ${port}`);
      serialManager.openPort(port)
        .then(() => {
          console.log(`Porta ${port} aberta com sucesso!`);
        })
        .catch((err) => {
          console.error(`Erro ao abrir a porta ${port}:`, err);
        });
    });
  } catch (err) {
    console.error('Erro ao iniciar o aplicativo:', err);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
