// Arreglo con el estado de los 4 bits [bit0, bit1, bit2, bit3]
let bits = [0, 0, 0, 0];

// Mapeo físico de cada número (0 al 9) a sus segmentos [a, b, c, d, e, f, g]
// 1 = Encendido, 0 = Apagado
const patronSegmentos = {
  0: [1, 1, 1, 1, 1, 1, 0],
  1: [0, 1, 1, 0, 0, 0, 0],
  2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1],
  4: [0, 1, 1, 0, 0, 1, 1],
  5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 0, 0],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1]
};

const idSegmentos = ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e', 'seg-f', 'seg-g'];

// Función para alternar el estado del botón
function toggleBit(indexBit) {
  bits[indexBit] = bits[indexBit] === 0 ? 1 : 0;
  
  // Actualizar apariencia física del botón radial
  const btn = document.getElementById(`btn-${indexBit + 1}`);
  if (bits[indexBit] === 1) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }

  actualizarDisplay();
}

function actualizarDisplay() {
  // Convertir los 4 bits a un valor decimal (LSB a MSB)
  const valorDecimal = bits[0] + (bits[1] * 2) + (bits[2] * 4) + (bits[3] * 8);

  // Formato binario para mostrar en pantalla (MSB a LSB)
  const valorBinarioStr = `${bits[3]}${bits[2]}${bits[1]}${bits[0]}`;

  document.getElementById('lbl-binario').innerText = valorBinarioStr;
  document.getElementById('lbl-decimal').innerText = valorDecimal;

  // Si el valor está entre 0 y 9, encender segmentos correspondientes
  if (valorDecimal <= 9) {
    const patron = patronSegmentos[valorDecimal];
    idSegmentos.forEach((id, index) => {
      const el = document.getElementById(id);
      if (patron[index] === 1) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  } else {
    // Si sobrepasa 9 (del 10 al 15 en binario), apagar el display
    apagarDisplay();
  }
}

function apagarDisplay() {
  idSegmentos.forEach((id) => {
    document.getElementById(id).classList.remove('active');
  });
}

// Inicializar estado por defecto (0000 -> Muestra 0)
actualizarDisplay();