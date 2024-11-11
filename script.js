// Initialize MQTT client with the provided broker
const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt'); 

// Real-time data variables
let currentTemperature = 0;
let currentHumidity = 0;

// Load initial configuration
let temperatureThreshold = parseInt(document.getElementById('temperature-threshold').value) || 30;
let humidityThresholdLow = parseInt(document.getElementById('humidity-threshold-low').value) || 50;
let humidityThresholdHigh = parseInt(document.getElementById('humidity-threshold-high').value) || 70;

// Handle incoming MQTT messages for temperature and humidity
client.on('connect', () => {
  client.subscribe('PvZ/Temperature');
  client.subscribe('PvZ/Humidity');
});

client.on('message', (topic, message) => {
  // Log the raw message
  console.log('Raw MQTT Message:', message.toString());

  let payload;
  try {
    payload = JSON.parse(message.toString());  // Try to parse the JSON message
  } catch (error) {
    console.error('Error parsing message:', error);
    return;  // Exit if parsing fails
  }

  // Log the parsed payload
  console.log('Parsed Payload:', payload);

  if (topic === 'PvZ/Temperature') {
    if (payload.temperature !== undefined && !isNaN(payload.temperature)) {
      currentTemperature = parseFloat(payload.temperature);
      document.getElementById('temperature').innerText = currentTemperature;
      console.log('Received Temperature:', currentTemperature);  
      checkConditions();
    } else {
      console.error('Invalid temperature value:', payload.temperature);
    }
  } else if (topic === 'PvZ/Humidity') {
    if (payload.humidity !== undefined && !isNaN(payload.humidity)) {
      currentHumidity = parseFloat(payload.humidity);
      document.getElementById('humidity').innerText = currentHumidity;
      console.log('Received Humidity:', currentHumidity);  // Log humidity value
      checkConditions();
    } else {
      console.error('Invalid humidity value:', payload.humidity);
    }
  }
});

// Function to check thresholds and control pump and LED
function checkConditions() {
  // Control pump based on humidity
  if (currentHumidity < humidityThresholdLow) {
    client.publish('PvZ/Humidity', 'ON');
  } else if (currentHumidity > humidityThresholdHigh) {
    client.publish('PvZ/Humidity', 'OFF');
  }

  // Activate LED if temperature exceeds threshold
  const ledElement = document.getElementById('alert-led');
  if (currentTemperature > temperatureThreshold) {
    ledElement.classList.remove('led-off');
    ledElement.classList.add('led-on');
  } else {
    ledElement.classList.remove('led-on');
    ledElement.classList.add('led-off');
  }
}

// Save configuration values
document.getElementById('save-config').addEventListener('click', () => {
  temperatureThreshold = parseInt(document.getElementById('temperature-threshold').value) || temperatureThreshold;
  humidityThresholdLow = parseInt(document.getElementById('humidity-threshold-low').value) || humidityThresholdLow;
  humidityThresholdHigh = parseInt(document.getElementById('humidity-threshold-high').value) || humidityThresholdHigh;
});
