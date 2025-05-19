document.addEventListener('DOMContentLoaded', () => {
  const portSelect = document.getElementById('port-select');
  const connectButton = document.getElementById('connect-btn');
  const tableBody = document.getElementById('data-table-body');

  // Estruturas para armazenar bits e mensagens
  const shownBits = {
      '270': new Set(),
      '271': new Set()
  };
  const shownMessages = {};
  
  connectButton.addEventListener('click', async () => {
    const selectedPort = portSelect.value;
    if (selectedPort) {
      try {
        const result = await window.serial.openSerialPort(selectedPort);
        console.log('Resultado da tentativa de conexão:', result); // Verifique o que é retornado aqui
  
        if (result && result.success) {
          alert(result.message); // Conectado com sucesso
        } else {
          console.error('Erro na resposta:', result);
          alert(result ? result.message :'Erro desconhecido'); // Mostra o erro
        }
      } catch (error) {
        console.error('Erro inesperado ao tentar conectar:', error);
        alert('Erro inesperado ao tentar conectar.');
      }
    } else {
      console.error('Nenhuma porta selecionada');
      alert('Por favor, selecione uma porta.');
    }
  });

  // Adicione este código ANTES do final do DOMContentLoaded, junto com os outros listeners
  document.getElementById('send-btn').addEventListener('click', async () => {
    const row = document.querySelector('#send-table tbody tr');
    
    // Capturar bits dos campos
    const parityBit = parseInt(row.querySelector('td:nth-child(1) input').value) || 0;
    const ssmBits = parseInt(row.querySelector('td:nth-child(2) input').value) || 0;
    const dataBits = row.querySelector('td:nth-child(3) input').value.padEnd(19, '0');
    const sdiBits = parseInt(row.querySelector('td:nth-child(4) input').value) || 0;
    const labelBits = row.querySelector('td:nth-child(5) input').value.padEnd(8, '0');

    // Montar palavra de 32 bits
    const arincWord = 
      (parityBit << 31) |
      (ssmBits << 29) |
      (parseInt(dataBits, 2) << 8) |
      (sdiBits << 6) |
      parseInt(labelBits, 2);

    // Dividir em 4 bytes (big-endian)
    const byte3 = (arincWord >> 24) & 0xFF; // Bits 31-24
    const byte2 = (arincWord >> 16) & 0xFF; // Bits 23-16
    const byte1 = (arincWord >> 8) & 0xFF;  // Bits 15-8
    const byte0 = arincWord & 0xFF;         // Bits 7-0

    // Enviar bytes sequencialmente
    try {
      await window.serial.sendData(byte3);
      await window.serial.sendData(byte2);
      await window.serial.sendData(byte1);
      await window.serial.sendData(byte0);
      alert('Dados enviados com sucesso!');
    } catch (error) {
      alert('Erro no envio: ' + error.message);
    }
  });
  

  window.serial.requestPorts()
  .then((ports) => {
    console.log('Portas disponíveis:', ports);
    portSelect.innerHTML = '';

    if (!Array.isArray(ports)) {
      console.warn("Formato inesperado:", ports);
      return;
    }

    ports.forEach(port => {
      const option = document.createElement('option');
      option.value = port.path;
      option.textContent = port.friendlyName || port.path;
      portSelect.appendChild(option);
    });

    if (ports.length === 0) {
      const option = document.createElement('option');
      option.textContent = 'Nenhuma porta disponível';
      portSelect.appendChild(option);
    }
  })
  .catch(error => console.error("Erro ao carregar portas:", error));


  // Função para renderizar mensagens de label
  const renderLabelMessages = (label) => {
      const container = document.getElementById(`label-${label}-container`);
      container.innerHTML = '';
      const title = document.createElement('h4');
      title.textContent = `Label ${label}:`;
      container.appendChild(title);

      Array.from(shownBits[label])
          .sort((a, b) => a - b)  // Ordena os bits
          .forEach(bit => {
              const msg = document.createElement('div');
              msg.textContent = `bit ${bit} | ${shownMessages[`${label}-${bit}`]}`;
              container.appendChild(msg);
          });
  };

  // Handler genérico para alertas
  const handleAlert = (label) => (event) => {
      const { bit, mensagem } = event.detail;
      if (!shownBits[label].has(bit)) {
          shownBits[label].add(bit);
          shownMessages[`${label}-${bit}`] = mensagem;
          renderLabelMessages(label);
      }
  };

  // Carrega portas disponíveis
  window.serial.onAvailablePorts((ports) => {
      console.log('Portas disponíveis:', ports);
      portSelect.innerHTML = '';

      if (!Array.isArray(ports)) {
          console.warn("Formato inesperado de portas:", ports);
          return;
      }

      ports.forEach(port => {
          const option = document.createElement('option');
          option.value = port.path;
          option.textContent = port.friendlyName || port.path;
          portSelect.appendChild(option);
      });

      if (ports.length === 0) {
          const option = document.createElement('option');
          option.textContent = 'Nenhuma porta disponível';
          portSelect.appendChild(option);
      }
  });

  // // Solicita as portas ao iniciar
  // window.serial.requestPorts()
  //     .catch(error => console.error("Erro ao carregar portas:", error));

  // Listener para seleção de porta
  portSelect.addEventListener('change', () => {
      const selectedPort = portSelect.value;
      if (selectedPort) {
          window.serial.openSerialPort(selectedPort);
      }
  });

  // Listener para dados decodificados
  window.addEventListener('decoded-data', (event) => {
      const data = event.detail;
      const existingRow = document.getElementById(`row-${data.label}`);

      if (existingRow) {
          existingRow.innerHTML = `
              <td>${data.label}</td>
              <td>${data.parityBin}</td>
              <td>${data.ssmBin}</td>
              <td>${data.dataBin}</td>
              <td>${data.sdiBin}</td>        
              <td>${data.hex}</td>
              <td>${data.decimal}</td>
          `;
          existingRow.classList.add('highlight');
          setTimeout(() => existingRow.classList.remove('highlight'), 300);
      } else {
          const newRow = document.createElement('tr');
          newRow.id = `row-${data.label}`;
          newRow.innerHTML = `
              <td>${data.label}</td>
              <td>${data.parityBin}</td>
              <td>${data.ssmBin}</td>
              <td>${data.dataBin}</td>
              <td>${data.sdiBin}</td>        
              <td>${data.hex}</td>
              <td>${data.decimal}</td>
          `;
          tableBody.appendChild(newRow);
      }
  });

  // Listeners para alertas de labels
  window.addEventListener('label-270-alert', handleAlert('270'));
  window.addEventListener('label-271-alert', handleAlert('271'));
});
