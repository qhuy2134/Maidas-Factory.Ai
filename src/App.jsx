import React from 'react';
import Background from './components/Background';
import MaidasMap from './components/MaidasMap';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'auto' }}>
      
      {/* Triệu hồi nền vũ trụ */}
      <Background />
      
      {/* Triệu hồi Thước tọa độ và Sàn Excel */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <MaidasMap />
      </div>

    </div>
  );
}

export default App;