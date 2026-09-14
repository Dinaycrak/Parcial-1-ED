let bits = [0, 0, 0, 0];

const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "web_client_" + Math.random().toString(16).substr(2, 8);

const TOPIC_WEB_TO_ESP = "parcial/ed/web2esp";
const TOPIC_ESP_TO_WEB = "parcial/ed/esp2web";

const client = new Paho.MQTT.Client(
  MQTT_BROKER,
  MQTT_PORT,
  CLIENT_ID
);

const digitosSVG = {
  0: { a: true,  b: true,  c: true,  d: true,  e: true,  f: true,  g: false },
  1: { a: false, b: true,  c: true,  d: false, e: false, f: false, g: false },
  2: { a: true,  b: true,  c: false, d: true,  e: true,  f: false, g: true },
  3: { a: true,  b: true,  c: true,  d: true,  e: false, f: false, g: true },
  4: { a: false, b: true,  c: true,  d: false, e: false, f: true,  g: true },
  5: { a: true,  b: false, c: true,  d: true,  e: false, f: true,  g: true },
  6: { a: true,  b: false, c: true,  d: true,  e: true,  f: true,  g: true },
  7: { a: true,  b: true,  c: true,  d: false, e: false, f: false, g: false },
  8: { a: true,  b: true,  c: true,  d: true,  e: true,  f: true,  g: true },
  9: { a: true,  b: true,  c: true,  d: true,  e: false, f: true,  g: true }
};

const segmentos = ["a", "b", "c", "d", "e", "f", "g"];

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

actualizarInterfaz(0, false);

client.connect({
  useSSL: true,

  onSuccess: onConnect,

  onFailure: function (err) {
    console.error("Error de conexión MQTT:", err);

    document.getElementById("lbl-status").innerText =
      "Error de conexión";

    document.getElementById("lbl-status").style.color =
      "#ff3333";
  }
});

function onConnect() {
  console.log("Conectado a HiveMQ mediante WSS");

  document.getElementById("lbl-status").innerText =
    "Conectado";

  document.getElementById("lbl-status").style.color =
    "#00ff88";

  client.subscribe(TOPIC_ESP_TO_WEB, {
    onSuccess: function () {
      console.log("Suscrito a:", TOPIC_ESP_TO_WEB);
    },

    onFailure: function (err) {
      console.error("Error al suscribirse:", err);
    }
  });
}

function onConnectionLost(responseObject) {

  if (responseObject.errorCode !== 0) {

    console.error(
      "Conexión perdida:",
      responseObject.errorMessage
    );

    document.getElementById("lbl-status").innerText =
      "Desconectado";

    document.getElementById("lbl-status").style.color =
      "#ff3333";
  }
}


// ======================================
// RECIBIR DATOS DESDE WOKWI
// ======================================

function onMessageArrived(message) {

  console.log(
    "Mensaje recibido desde Wokwi:",
    message.payloadString
  );

  const val = parseInt(message.payloadString);

  if (!isNaN(val)) {

    // Limitar el valor al rango de 4 bits
    const valor = val & 15;

    bits[0] = (valor & 1) ? 1 : 0;
    bits[1] = (valor & 2) ? 1 : 0;
    bits[2] = (valor & 4) ? 1 : 0;
    bits[3] = (valor & 8) ? 1 : 0;

    actualizarInterfaz(valor, false);
  }
}


// ======================================
// ENVIAR DATOS HACIA WOKWI
// ======================================

function toggleBit(indexBit) {

  bits[indexBit] =
    bits[indexBit] === 0 ? 1 : 0;

  const valDecimal =
    bits[0] +
    (bits[1] * 2) +
    (bits[2] * 4) +
    (bits[3] * 8);

  actualizarInterfaz(valDecimal, true);
}


// ======================================
// ACTUALIZAR INTERFAZ
// ======================================

function actualizarInterfaz(valDecimal, enviarMQTT) {

  // -------------------------------
  // BOTONES
  // -------------------------------

  for (let i = 0; i < 4; i++) {

    const btn =
      document.getElementById(`btn-${i + 1}`);

    if (bits[i] === 1) {

      btn.classList.add("active");

    } else {

      btn.classList.remove("active");
    }
  }


  // -------------------------------
  // BINARIO
  // -------------------------------

  const valBinarioStr =
    `${bits[3]}${bits[2]}${bits[1]}${bits[0]}`;

  document.getElementById("lbl-binario").innerText =
    valBinarioStr;


  // -------------------------------
  // DECIMAL
  // -------------------------------

  document.getElementById("lbl-decimal").innerText =
    valDecimal;


  // -------------------------------
  // DISPLAY SVG
  // -------------------------------

  if (valDecimal >= 0 && valDecimal <= 9) {

    const patron =
      digitosSVG[valDecimal];

    segmentos.forEach(seg => {

      const elemento =
        document.getElementById(`seg-${seg}`);

      if (patron[seg]) {

        elemento.classList.add("on");

      } else {

        elemento.classList.remove("on");
      }

    });

  } else {

    // Si es 10-15, apagar todos los segmentos

    segmentos.forEach(seg => {

      document
        .getElementById(`seg-${seg}`)
        .classList.remove("on");

    });
  }


  // -------------------------------
  // ENVIAR MQTT
  // -------------------------------

  if (
    enviarMQTT &&
    client.isConnected()
  ) {

    const message =
      new Paho.MQTT.Message(
        valDecimal.toString()
      );

    message.destinationName =
      TOPIC_WEB_TO_ESP;

    client.send(message);

    console.log(
      "Enviado a Wokwi:",
      valDecimal
    );

  } else if (enviarMQTT) {

    console.warn(
      "No se pudo enviar: MQTT no está conectado"
    );
  }
}