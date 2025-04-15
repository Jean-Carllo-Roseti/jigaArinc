// const { app, BrowserWindow } = require('electron');
// const { SerialPort } = require('serialport');

// function reverseBits32(n) {
//   let rev = 0;
//   for (let i = 0; i < 32; i++) {
//     rev <<= 1;
//     rev |= n & 1;
//     n >>>= 1;
//   }
//   return rev >>> 0;
// }

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

//   const port = new SerialPort({
//     path: 'COM5',
//     baudRate: 115200
//   });

//   port.on('open', () => {
//     console.log('Porta serial aberta');
//   });

//   let buffer = Buffer.alloc(0);

//   port.on('data', (data) => {
//     buffer = Buffer.concat([buffer, data]);
  
//     while (buffer.length >= 4) {
//       const word = buffer.slice(0, 4);
//       buffer = buffer.slice(4);
  
//       const rawValue = word.readUInt32BE();
  
//       // Imprimir o valor bruto em binário
//       console.log(`Valor bruto (binário) antes da reversão: ${rawValue.toString(2).padStart(32, '0')}`);
  
//       const reversed = reverseBits32(rawValue);
  
//       // Imprimir o valor invertido em binário
//       console.log(`Valor invertido (binário): ${reversed.toString(2).padStart(32, '0')}`);
  
//       const binaryString = reversed.toString(2).padStart(32, '0'); // Defina o binaryString aqui
  
//       // Extração dos campos
//       const label = (reversed >> 24) & 0xFF;
//       const sdi = (reversed >> 22) & 0x03;
//       const dataField = (reversed >> 3) & 0x1FFFFF;
//       const ssm = (reversed >> 1) & 0x03;
//       const parity = reversed & 0x01;
  
//       console.log(`--- Palavra ARINC 429 recebida ---`);
//       console.log(`Binário (32 bits): ${binaryString}`);
//       console.log(`Label (octal): ${label.toString(8).padStart(3, '0')}`);
//       console.log(`SDI: ${sdi}`);
//       console.log(`Data: ${dataField}`);
//       console.log(`SSM: ${ssm}`);
//       console.log(`Parity: ${parity}`);
//       console.log();
//     }
//   });
  
//   port.on('error', (err) => {
//     console.error('Erro na porta serial:', err.message);
//   });
// }

// app.whenReady().then(createWindow);
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { openPort, listSerialPorts } = require('./serialManager');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('renderer/index.html');

  // Habilita o DevTools com clique direito
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

  listSerialPorts().then(ports => {
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('available-ports', ports);
    });
  });

  ipcMain.on('selected-port', (event, selectedPort) => {
    openPort(selectedPort);
  });
}

app.whenReady().then(createWindow);
