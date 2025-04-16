const { mockARINCData } = require('./mockData');   // Importando os dados mock
const { SerialPort } = require('serialport');

let mainWindow = null;

function setMainWindow(win) {
  mainWindow = win;
}

let port = null;
let buffer = Buffer.alloc(0);
let labelBuffers = {};

function reverseBits32(n) {
  let rev = 0;
  for (let i = 0; i < 32; i++) {
    rev <<= 1;
    rev |= n & 1;
    n >>>= 1;
  }
  return rev >>> 0;
}

function sendMockDataToFrontend() {
  mockARINCData.forEach((data) => {
    const binaryString = data.binary;
    const reversed = reverseBits32(parseInt(binaryString, 2));

    const label = (reversed >> 24) & 0xFF;
    const sdi = (reversed >> 22) & 0x03;
    const dataField = (reversed >> 3) & 0x7FFFF;
    const ssm = (reversed >> 1) & 0x03;
    const parity = reversed & 0x01;

    // Representações binárias
    const labelBin = label.toString(2).padStart(8, '0');
    const sdiBin = sdi.toString(2).padStart(2, '0');
    const dataBin = dataField.toString(2).padStart(19, '0');
    const ssmBin = ssm.toString(2).padStart(2, '0');
    const parityBin = parity.toString(2); // 1 bit

    const formattedBinary = `${parityBin} ${ssmBin} ${dataBin} ${sdiBin} ${labelBin}`;
    const hex = dataField.toString(16).toUpperCase().padStart(6, '0');

    let decimal = dataField; // valor padrão

    // 🔁 Condição especial para labels 266 (octal 412) e 267 (octal 413)
    if (label === 182 || label === 183) {
      // Posição de bits no campo dataField (bits 11 a 18 no total)
      const unidadesBits = dataBin.slice(4, 8); // bits 11 a 14 (índice 4 a 7)
      const dezenasBits = dataBin.slice(0, 4);  // bits 15 a 18 (índice 0 a 3)

      const unidades = parseInt(unidadesBits, 2);
      const dezenas = parseInt(dezenasBits, 2);

      decimal = dezenas * 10 + unidades;

      console.log(`Label especial: ${label} (octal ${label.toString(8)})`);
      console.log(`Bits (dataBin): ${dataBin}`);
      console.log(`Bits dezenas (0–3): ${dezenasBits} => ${dezenas}`);
      console.log(`Bits unidades (4–7): ${unidadesBits} => ${unidades}`);
      console.log(`Decimal final (dez * 10 + uni): ${decimal}`);
    }

    console.log(`--- Palavra ARINC 429 recebida para o Label ${label} ---`);
    console.log(`Binário (32 bits): ${binaryString}`);
    console.log(`Formatado: ${formattedBinary}`);
    console.log(`Label (octal): ${label.toString(8).padStart(3, '0')}`);
    console.log(`SDI: ${sdi} (${sdiBin})`);
    console.log(`Data: ${dataField} (${dataBin})`);
    console.log(`SSM: ${ssm} (${ssmBin})`);
    console.log(`Parity: ${parity}`);
    console.log();

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
        decimal // já atualizado se for 266 ou 267
      });
    } else {
      console.warn('mainWindow ou webContents não estão prontos.');
    }
  });
}



// Simula a recepção de dados a cada 2 segundos, como exemplo
setInterval(sendMockDataToFrontend, 2000); 

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

      const rawValue = word.readUInt32BE();
      const reversed = reverseBits32(rawValue);
      const label = (reversed >> 24) & 0xFF;

      if (!labelBuffers[label]) {
        labelBuffers[label] = Buffer.alloc(0);
      }

      labelBuffers[label] = Buffer.concat([labelBuffers[label], word]);

      if (labelBuffers[label].length >= 4) {
        // Se você precisar de dados de ARINC, descomente esta linha
        // processDataAsync(label, labelBuffers[label]).catch(console.error);
        labelBuffers[label] = Buffer.alloc(0);
      }
    }
  });

  port.on('error', (err) => {
    console.error('Erro na porta serial:', err.message);
  });
}

async function listSerialPorts() {
  return await SerialPort.list();
}

module.exports = {
  openPort,
  listSerialPorts,
  setMainWindow
};



// async function processDataAsync(label, word) {
//   await new Promise(resolve => setTimeout(resolve, 10));
// const rawValue = word.readUInt32BE();
// const reversed = reverseBits32(rawValue);

// const binaryString = reversed.toString(2).padStart(32, '0');
// const sdi = (reversed >> 22) & 0x03;
// const dataField = (reversed >> 3) & 0x1FFFFF;
// const ssm = (reversed >> 1) & 0x03;
// const parity = reversed & 0x01;

// const hex = reversed.toString(16).toUpperCase().padStart(8, '0');
// const decimal = dataField;

// console.log(`--- Palavra ARINC 429 recebida para o Label ${label} ---`);
// console.log(`Binário (32 bits): ${binaryString}`);
// console.log(`Label (octal): ${label.toString(8).padStart(3, '0')}`);
// console.log(`SDI: ${sdi}`);
// console.log(`Data: ${dataField}`);
// console.log(`SSM: ${ssm}`);
// console.log(`Parity: ${parity}`);
// console.log();

// if (mainWindow) {
//   mainWindow.webContents.send('decoded-data', {
//     label: label.toString(8).padStart(3, '0'),
//     sdi,
//     data: dataField,
//     ssm,
//     parity,
//     binary: binaryString,
//     hex,
//     decimal
//   });
// }
// }
