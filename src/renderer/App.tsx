import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import QRCode from 'react-qr-code';

function Hello() {
  return (
    <div>
      <h1>TRACIE SERVER</h1>
      <div className="Hello">TRACIE server is running</div>
      <QRCode value="hey" />
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
