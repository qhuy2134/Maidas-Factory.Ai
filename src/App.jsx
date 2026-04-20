import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Workspace from './pages/Workspace';
import Archive from './pages/Archive';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ là Xưởng chế tác */}
        <Route path="/" element={<Workspace />} />
        
        {/* Đường dẫn /archive là Nhà kho */}
        <Route path="/archive" element={<Archive />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;