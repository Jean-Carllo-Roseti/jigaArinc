const { SerialPort } = require('serialport');
const mensagensLabel270 = require('./mensagensLabel270');
const mensagensLabel271 = require('./mensagensLabel271');

let mainWindow = null;
let port = null;
let buffer = Buffer.alloc(0);
let labelBuffers = {};

function setMainWindow(win) {
  mainWindow = win;
}

function reverseBits32(n) {
  let rev = 0;
  for (let i = 0; i < 32; i++) {
    rev <<= 1;
    rev |= n & 1;
    n >>>= 1;
  }
  return rev >>> 0;
}

function processBitwiseAlerts(label, dataBin, mensagens, canal) {
  [...dataBin].forEach((bit, index) => {
    if (bit === '1') {
      const mensagem = mensagens[index];
      if (mensagem && mainWindow?.webContents) {
        mainWindow.webContents.send(canal, { bit: index, mensagem });
      }
    }
  });
}

function dispatchAlertsIfNeeded(label, dataBin) {
  if (label === 184) {
    processBitwiseAlerts(label, dataBin, mensagensLabel270, 'label-270-alert');
  } else if (label === 185) {
    processBitwiseAlerts(label, dataBin, mensagensLabel271, 'label-271-alert');
  }
}

function decodeAndSend(wordBuffer) {
  const rawValue = wordBuffer.readUInt32BE();
  const reversed = reverseBits32(rawValue);

  const label = (reversed >> 24) & 0xFF;
  const sdi = (reversed >> 22) & 0x03;
  const dataField = (reversed >> 3) & 0x7FFFF;
  const ssm = (reversed >> 1) & 0x03;
  const parity = reversed & 0x01;

  const labelBin = label.toString(2).padStart(8, '0');
  const sdiBin = sdi.toString(2).padStart(2, '0');
  const dataBin = dataField.toString(2).padStart(19, '0');
  const ssmBin = ssm.toString(2).padStart(2, '0');
  const parityBin = parity.toString(2);
  const formattedBinary = `${parityBin} ${ssmBin} ${dataBin} ${sdiBin} ${labelBin}`;
  const hex = dataField.toString(16).toUpperCase().padStart(6, '0');

  let decimal = dataField;

  dispatchAlertsIfNeeded(label, dataBin);

  // Tratamento especial para labels 182 e 183 (octal 266 e 267)
  if (label === 182 || label === 183) {
    const unidadesBits = dataBin.slice(4, 8);
    const dezenasBits = dataBin.slice(0, 4);

    const unidades = parseInt(unidadesBits, 2);
    const dezenas = parseInt(dezenasBits, 2);

    decimal = dezenas * 10 + unidades;
  }

  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('decoded-data', {
      label: label.toString(8).padStart(3, '0'),
      labelBin,
      sdi,
      sdiBin,
      data: dataField,
      dataBin,
      ssm,
      ssmBin,
      parity,
      parityBin,
      binary: formattedBinary,
      hex,
      decimal
    });
  }
}

function openPort(selectedPort) {
  if (port && port.isOpen) {
    port.close();
  }

  port = new SerialPort({
    path: selectedPort,
    baudRate: 115200
  });

  port.on('open', () => {
    console.log('Porta serial aberta:', selectedPort);
  });

  port.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= 4) {
      const word = buffer.slice(0, 4);
      buffer = buffer.slice(4);

      decodeAndSend(word);
    }
  });

  port.on('error', (err) => {
    console.error('Erro na porta serial:', err.message);
  });
}

async function listSerialPorts() {
  // return await SerialPort.list();
  try {
    const ports = await SerialPort.list();  // Lista todas as portas seriais disponíveis
    console.log('Portas serial disponíveis (serialManager):', ports);  // Log de portas
    return ports;  // Retorna as portas encontradas
  } catch (error) {
    console.error('Erro ao listar portas:', error);
    return [];  // Retorna um array vazio em caso de erro
  }
}


module.exports = {
  openPort,
  listSerialPorts,
  setMainWindow,
  refreshSerialPorts: async () => {
    const ports = await listSerialPorts();
    if (mainWindow?.webContents) {
      mainWindow.webContents.send('available-ports', ports);
    }
  }
};
