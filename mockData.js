// mockData.js mudança de label os primeiros bits, direita, a mensagem vai ser invertida, procolo arinc*
const mockARINCData = [
    {
      binary: '101101101100110011001100001101101', 
      timestamp: Date.now() 
    },  
    {
      binary: '101101111101010101010101011101101',
      timestamp: Date.now() 
    },
    {
      binary: '111110111101010101010101000011101',
      timestamp: Date.now() 
    },
    {
      binary: '011110111101010101010101010011101',
      timestamp: Date.now() 
      },
  ];

  module.exports = { mockARINCData };

// 10110110 = 266 inserir esse valores invertidos.
// 10110111 = 267
// 10111000 = 270
// 10111001 = 271
// 10111011 = 273
// 10111100 = 274
