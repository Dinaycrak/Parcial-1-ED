let bits = [0, 0, 0, 0];

const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8000; // WebSocket Port
const CLIENT_ID = "web_client_" + Math.random().toString(16).substr(2, 8);

const TOPIC_WEB_TO_ESP = "parcial/ed/web2esp";
const TOPIC_ESP_TO_WEB = "parcial/ed/esp2web";

const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, CLIENT_ID);

const digitosSVG = {
  0: { a: true,  b: true,  c: true,  d: true,  e: true,  f: true,  g: false },
  1: { a: false, b: true,  c: true,  d: false, e: false, f: false, g: false },
  2: { a: true,  b: true,  c: false, d: true,  e: true,  f: false, g: true  },
  3: { a: true,  b: true,  c: true,  d: true,  e: false, f: false, g: true  },
  4: { a: false, b: true,  c: true,  d: false, e: false, f: true,  g: true  },
  5: { a: true,  b: false, c: true,  d: true,  e: false, f: true,  g: true  },
  6: { a: true,  b: false, c: true,  d: true,  e: true,  f: true,  g: true  },
  7: { a: true,  b: true,  c: true,  d: false, e: false, f: false, g: false },
  8: { a: true,  b: true,  c: true,  d: true,  e: true,  f: true,  g: true  },
  9: { a: true,  b: true,  c: true,  d: true,  e: false, f: true,  g: true  }
};

const segmentos = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

client.connect({
  onSuccess: onConnect,
  onFailure: (err) => {
    document.getElementById('lbl-status').innerText = "Error Conexión";
    document.getElementById('lbl-status').style.color = "#ff3333";
  }
});

function onConnect() {
  document.getElementById('lbl-status').innerText = "Conectado";
  document.getElementById('lbl-status').style.color = "#00ff88";
  client.subscribe(TOPIC_ESP_TO_WEB);
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    document.getElementById('lbl-status').innerText = "Desconectado";
    document.getElementById('lbl-status').style.color = "#ff3333";
  }
}

// RECIBIR DE WOKWI
function onMessageArrived(message) {
  const val = parseInt(message.payloadString);
  if (!isNaN(val)) {
    // Actualizar los bits según el valor recibido de Wokwi
    bits[0] = (val & 1) ? 1 : 0;
    bits[1] = (val & 2) ? 1 : 0;
    bits[2] = (val & 4) ? 1 : 0;
    bits[3] = (val & 8) ? 1 : 0;
    actualizarInterfaz(val, false);
  }
}

// ENVIAR A WOKWI
function toggleBit(indexBit) {
  bits[indexBit] = bits[indexBit] === 0 ? 1 : 0;
  const valDecimal = bits[0] + (bits[1] * 2) + (bits[2] * 4) + (bits[3] * 8);
  
  actualizarInterfaz(valDecimal, true);
}

function actualizarInterfaz(valDecimal, enviarMQTT) {
  // Actualizar botones celestes
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`btn-${i + 1}`);
    if (bits[i] === 1) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  const valBinarioStr = `${bits[3]}${bits[2]}${bits[1]}${bits[0]}`;
  document.getElementById('lbl-binario').innerText = valBinarioStr;
  document.getElementById('lbl-decimal').innerText = valDecimal;

  // Encender segmentos SVG
  if (valDecimal <= 9) {
    const patron = digitosSVG[valDecimal];
    segmentos.forEach(seg => {
      const el = document.getElementById(`seg-${seg}`);
      if (patron[seg]) {
        el.classList.add('on');
      } else {
        el.classList.remove('on');
      }
    });
  } else {
    segmentos.forEach(seg => {
      document.getElementById(`seg-${seg}`).classList.remove('on');
    });
  }

  // Si el cambio proviene de un clic en la página web, enviar a Wokwi
  if (enviarMQTT && client.isConnected()) {
    const message = new Paho.MQTT.Message(valDecimal.toString());
    message.destinationName = TOPIC_WEB_TO_ESP;
    client.send(message);
  }
}