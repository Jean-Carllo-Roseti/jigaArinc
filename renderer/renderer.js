//   document.addEventListener('DOMContentLoaded', () => {
//     const portSelect = document.getElementById('port-select');

//   //   window.serial.requestPorts()
//   // .then(() => {
//   //   console.log("Ports request successful");
//   // })
//   // .catch((error) => {
//   //   console.error("Failed to request ports:", error);
//   // });

//   window.serial.requestPorts().then(ports => {
//     console.log("Portas recebidas:", ports);
//     // Seu código para atualizar o dropdown aqui
//   });


//   // Novo código aqui!
// window.serial.onAvailablePorts((event, data) => {
//   const ports = data.detail || data;
//   console.log('Portas disponíveis:', ports);

//   if (!Array.isArray(ports)) {
//     console.warn("Formato inesperado das portas recebidas:", ports);
//     return;
//   }

//   portSelect.innerHTML = '';

//   ports.forEach(port => {
//     const option = document.createElement('option');
//     option.value = port.path;
//     option.textContent = port.friendlyName || port.path;
//     portSelect.appendChild(option);
//   });

//   if (ports.length === 0) {
//     const option = document.createElement('option');
//     option.textContent = 'Nenhuma porta disponível';
//     portSelect.appendChild(option);
//   }
// });

//   // Escutando mudança na seleção da porta
//   portSelect.addEventListener('change', () => {
//     const selectedPort = portSelect.value;

//     if (selectedPort) {
//       window.serial.openSerialPort(selectedPort);
//     } else {
//       console.error('Nenhuma porta selecionada!');
//     }
//   });

//   // Recebendo dados decodificados
//   window.addEventListener('decoded-data', (event) => {
//     const data = event.detail;
//     const tableBody = document.getElementById('data-table-body');
//     const existingRow = document.getElementById(`row-${data.label}`);
  
//     if (existingRow) {
//       existingRow.innerHTML = `
//         <td>${data.label}</td>
//         <td>${data.parityBin}</td>
//         <td>${data.ssmBin}</td>
//         <td>${data.dataBin}</td>
//         <td>${data.sdiBin}</td>        
//         <td>${data.hex}</td>
//         <td>${data.decimal}</td>
//       `;
//       existingRow.classList.add('highlight');
//       setTimeout(() => existingRow.classList.remove('highlight'), 300);
//     } else {
//       const newRow = document.createElement('tr');
//       newRow.id = `row-${data.label}`;
//       newRow.innerHTML = `
//        <td>${data.label}</td>
//         <td>${data.parityBin}</td>
//         <td>${data.ssmBin}</td>
//         <td>${data.dataBin}</td>
//         <td>${data.sdiBin}</td>        
//         <td>${data.hex}</td>
//         <td>${data.decimal}</td>
//       `;
//       tableBody.appendChild(newRow);
//     }
//   });  

//   // Mantém um Set de bits já exibidos por label
// const shownBits = {
//   '270': new Set(),
//   '271': new Set()
// };

// function renderLabelMessages(label) {
//   const container = document.getElementById(`label-${label}-container`);
//   container.innerHTML = '';        // limpa tudo
//   const title = document.createElement('h4');
//   title.textContent = `Label ${label}:`;
//   container.appendChild(title);

//   // Para cada bit no Set, ordenado
//   Array.from(shownBits[label])
//        .sort((a,b) => a - b)
//        .forEach(bit => {
//          // Você pode armazenar a mensagem completa em outro map, mas como
//          // a mensagem não muda, faremos um único lookup no último evento...
//          const msg = document.createElement('div');
//          // Vamos buscar a mensagem no container original de logs (event.detail)
//          // Para simplificar, guardamos na hora do evento:
//          const mensagem = shownMessages[`${label}-${bit}`];
//          msg.textContent = `bit ${bit} | ${mensagem}`;
//          container.appendChild(msg);
//   });
// }

// // Guardamos também as mensagens por label-bit
// const shownMessages = {};

// // Handler genérico
// function handleAlert(label) {
//   return (event) => {
//     const { bit, mensagem } = event.detail;

//     // Se esse bit ainda NÃO foi exibido para este label, adiciona
//     if (!shownBits[label].has(bit)) {
//       shownBits[label].add(bit);
//       shownMessages[`${label}-${bit}`] = mensagem;
//       renderLabelMessages(label);
//     }
//     // se já tinha, não faz nada
//   };
// }

// ipcMain.handle('request-ports', async () => {
//   return await serialManager.listSerialPorts();
// });

// window.addEventListener('label-270-alert', handleAlert('270'));
// window.addEventListener('label-271-alert', handleAlert('271'));
// });

document.addEventListener('DOMContentLoaded', () => {
  const portSelect = document.getElementById('port-select');
  const connectButton = document.getElementById('connect-btn');
  const tableBody = document.getElementById('data-table-body');
  const shownBits = {
      '270': new Set(),
      '271': new Set()
  };
  const shownMessages = {};

  connectButton.addEventListener('click', () => {
    const selectedPort = portSelect.value;
    if (selectedPort) {
        window.serial.openSerialPort(selectedPort);
        console.log('Tentando conectar na porta:', selectedPort);
    } else {
        console.warn('Nenhuma porta selecionada para conectar.');
    }
  });

  // Função para renderizar mensagens de label
  const renderLabelMessages = (label) => {
      const container = document.getElementById(`label-${label}-container`);
      container.innerHTML = '';
      const title = document.createElement('h4');
      title.textContent = `Label ${label}:`;
      container.appendChild(title);

      Array.from(shownBits[label])
          .sort((a, b) => a - b)
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

  // Listeners para alertas
  window.addEventListener('label-270-alert', handleAlert('270'));
  window.addEventListener('label-271-alert', handleAlert('271'));
});