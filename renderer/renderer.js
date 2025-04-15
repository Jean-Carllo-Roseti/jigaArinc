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
  const portSelect = document.getElementById('port-select');

  // Escutando a emissão de portas disponíveis
  window.serial.onAvailablePorts((event, ports) => {
    portSelect.innerHTML = '';

    ports.forEach(port => {
      const option = document.createElement('option');
      option.value = port.path;
      option.textContent = port.path;
      portSelect.appendChild(option);
    });
  });

  // Escutando mudança na seleção da porta
  portSelect.addEventListener('change', () => {
    const selectedPort = portSelect.value;

    if (selectedPort) {
      window.serial.openSerialPort(selectedPort);
    } else {
      console.error('Nenhuma porta selecionada!');
    }
  });

  // Recebendo dados decodificados
  window.addEventListener('decoded-data', (event) => {
    const data = event.detail;
    const tableBody = document.getElementById('data-table-body');
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
});

