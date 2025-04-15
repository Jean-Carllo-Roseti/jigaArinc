// const { ipcRenderer } = require('electron');  // Importar o ipcRenderer para comunicação com o processo principal

// document.getElementById('abrir-porta').addEventListener('click', () => {
//   const portSelect = document.getElementById('port-select');
//   const selectedPort = portSelect.value;

//   // Verifica se há uma porta selecionada antes de tentar abrir
//   if (selectedPort) {
//     // Envia a porta selecionada para o processo principal
//     ipcRenderer.send('selected-port', selectedPort);
//   } else {
//     console.error('Nenhuma porta selecionada!');
//   }
// });

// // Opcional: Caso queira exibir a lista de portas no frontend, pode usar o seguinte código:

// ipcRenderer.on('available-ports', (event, ports) => {
//   const portSelect = document.getElementById('port-select');
//   ports.forEach(port => {
//     const option = document.createElement('option');
//     option.value = port.path;
//     option.textContent = port.path;
//     portSelect.appendChild(option);
//   });
// });

document.addEventListener('DOMContentLoaded', () => {
  const portSelect = document.getElementById('port-select'); // Dropdown de seleção de porta

  // Escutando a emissão de portas disponíveis do processo principal
  window.serial.onAvailablePorts((event, ports) => {
    // Limpa as opções existentes antes de adicionar novas
    portSelect.innerHTML = '';

    // Cria e adiciona as novas opções no dropdown
    ports.forEach(port => {
      const option = document.createElement('option');
      option.value = port.path;  // Valor da porta
      option.textContent = port.path;  // Nome da porta
      portSelect.appendChild(option);  // Adiciona ao dropdown
    });
  });

  // Escutando a mudança na seleção da porta
  portSelect.addEventListener('change', () => {
    const selectedPort = portSelect.value;
    
    if (selectedPort) {
      window.serial.openSerialPort(selectedPort); // Envia a porta selecionada para o main.js
    } else {
      console.error('Nenhuma porta selecionada!');
    }
  });
});
