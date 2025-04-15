const { SerialPort } = require('serialport');

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

async function processDataAsync(label, word) {
  await new Promise(resolve => setTimeout(resolve, 10));
  const rawValue = word.readUInt32BE();
  const reversed = reverseBits32(rawValue);

  const binaryString = reversed.toString(2).padStart(32, '0');
  const sdi = (reversed >> 22) & 0x03;
  const dataField = (reversed >> 3) & 0x1FFFFF;
  const ssm = (reversed >> 1) & 0x03;
  const parity = reversed & 0x01;

  console.log(`--- Palavra ARINC 429 recebida para o Label ${label} ---`);
  console.log(`Binário (32 bits): ${binaryString}`);
  console.log(`Label (octal): ${label.toString(8).padStart(3, '0')}`);
  console.log(`SDI: ${sdi}`);
  console.log(`Data: ${dataField}`);
  console.log(`SSM: ${ssm}`);
  console.log(`Parity: ${parity}`);
  console.log();
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

      const rawValue = word.readUInt32BE();
      const reversed = reverseBits32(rawValue);
      const label = (reversed >> 24) & 0xFF;

      if (!labelBuffers[label]) {
        labelBuffers[label] = Buffer.alloc(0);
      }

      labelBuffers[label] = Buffer.concat([labelBuffers[label], word]);

      if (labelBuffers[label].length >= 4) {
        processDataAsync(label, labelBuffers[label]).catch(console.error);
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
  listSerialPorts
};
