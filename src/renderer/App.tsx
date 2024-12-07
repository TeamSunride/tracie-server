import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import QRCode from 'react-qr-code';
// import bleno from 'bleno';

// bleno.on("stateChange", function (state) {
//   console.log(state);
// });

electron.onNavigate((page) => {
  window.location.href = page;
});

function ConnectToBluetooth() {
  var name = 'name';
  var serviceUuids = ['B370'];

  // send start advertising command
  electron.startAdvertising(name, serviceUuids);
  // bleno.startAdvertising(name, serviceUuids);
  // navigator.bluetooth
  //   .requestDevice({
  //     acceptAllDevices: true,
  //     // filters: [{ services: ["battery_service"]}]
  //   })
  //   .then((device) => {
  //     console.log('Got device:', device.name);
  //   });
}

// function startAdvertising() {
//   navigator.bluetooth
//     .requestLEScan({
//       acceptAllAdvertisements: true,
//     })
//     .then(() => {
//       console.log('Scanning');
//     });
// }

function Hello() {
  return (
    <div>
      <h1>TRACIE SERVER</h1>
      <div className="Hello">TRACIE server is running</div>
      <QRCode value="hey" />
      <button onClick={ConnectToBluetooth}>Connect to Bluetooth</button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
