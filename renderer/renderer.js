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

  // Função para conectar à porta selecionada
  // connectButton.addEventListener('click', () => {
  //   const selectedPort = portSelect.value;
  //   if (selectedPort) {
  //     window.serial.openSerialPort(selectedPort);
  //   } else {
  //     console.error('Nenhuma porta selecionada');
  //   }
  // });

  // connectButton.addEventListener('click', async () => {
  //   const selectedPort = portSelect.value;
  //   if (selectedPort) {
  //     try {
  //       const result = await window.serial.openSerialPort(selectedPort);
  //       console.log('Resultado da tentativa de conexão:', result); // Log do retorno da tentativa de conexão
  
  //       if (result.success) {
  //         alert(result.message); // Conectado com sucesso
  //         console.log(result.message); // Log de sucesso na conexão
  //       } else {
  //         alert(result.message); // Mostra o erro
  //         console.log(result.message); // Log do erro
  //       }
  //     } catch (error) {
  //       console.error('Erro inesperado ao tentar conectar:', error);
  //       alert('Erro inesperado ao tentar conectar.');
  //     }
  //   } else {
  //     console.error('Nenhuma porta selecionada');
  //     alert('Por favor, selecione uma porta.');
  //   }
  // });
  
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

  // Solicita as portas ao iniciar
  window.serial.requestPorts()
      .catch(error => console.error("Erro ao carregar portas:", error));

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
