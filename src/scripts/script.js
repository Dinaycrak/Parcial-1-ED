let bits = [0, 0, 0, 0];

function toggleBit(indexBit) {
  bits[indexBit] = bits[indexBit] === 0 ? 1 : 0;
  
  // Alternar estilo del botón radial celeste
  const btn = document.getElementById(`btn-${indexBit + 1}`);
  if (bits[indexBit] === 1) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }

  actualizarInfo();
}

function actualizarInfo() {
  // Calculo de valor decimal basado en LSB -> MSB
  const valorDecimal = bits[0] + (bits[1] * 2) + (bits[2] * 4) + (bits[3] * 8);

  // Formato binario en pantalla (MSB -> LSB)
  const valorBinarioStr = `${bits[3]}${bits[2]}${bits[1]}${bits[0]}`;

  document.getElementById('lbl-binario').innerText = valorBinarioStr;
  document.getElementById('lbl-decimal').innerText = valorDecimal;
}

actualizarInfo();