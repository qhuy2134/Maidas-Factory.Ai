import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Background from './components/Background';
import MaidasMap from './components/MaidasMap';

function App() {
  return (
    <div 
      style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
      onMouseDown={(e) => {
        if (e.button === 1) e.preventDefault(); // Chặn cuộn chuột giữa của trình duyệt
      }}
    >
      <Background />
      
      <TransformWrapper
        initialScale={1}
        minScale={0.3} // Giới hạn thu nhỏ (Ông có thể chỉnh số này tùy ý)
        maxScale={4}   // Giới hạn phóng to
        
        // 1. LUẬT KHÓA TƯỜNG (Tuyệt đối không cho kéo ra ngoài map)
        limitToBounds={true} 
        
        // 2. DIỆT LỖI VĂNG MAP: Phải TẮT tính năng tự động căn giữa. 
        // Đổi lại: Khi thu nhỏ hết cỡ, map sẽ nằm ở góc trên cùng bên trái thay vì giữa màn hình, nhưng đảm bảo KHÔNG BAO GIỜ bị văng nữa.
        centerZoomedOut={false} 
        
        // 3. ZOOM CHẬM
        wheel={{ 
          step: 0.05 // Tốc độ rùa bò, từ từ nhích. Tắt tính năng bôi trơn để tránh kẹt nấc.
        }}
        
        // 4. CHỈ KÉO BẰNG CHUỘT GIỮA
        panning={{ 
          velocityDisabled: true, // Tắt trượt quán tính
          allowLeftClickPan: false,
          allowMiddleClickPan: true,
          allowRightClickPan: false
        }}
      >
        <TransformComponent 
          wrapperStyle={{ width: '100vw', height: '100vh' }}
          // Báo kích thước thật cho Camera để nó xây tường
          contentStyle={{ width: 'max-content', height: 'max-content' }}
        >
          <MaidasMap />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default App;