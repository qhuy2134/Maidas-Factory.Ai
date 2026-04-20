import React, { useRef, useState, useEffect } from 'react';
import Background from './components/Background';
import MaidasMap from './components/MaidasMap';

function App() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // THUẬT TOÁN ĐỈNH CAO: Đo đạc và ép giới hạn Zoom
  const getDynamicMinScale = () => {
    if (!containerRef.current || !contentRef.current) return 1;
    const container = containerRef.current.getBoundingClientRect();
    const baseWidth = contentRef.current.offsetWidth;
    const baseHeight = contentRef.current.offsetHeight;

    // Tính tỷ lệ cần thiết để map KHÔNG BAO GIỜ nhỏ hơn chiều ngang và chiều dọc màn hình
    const scaleToFitWidth = container.width / baseWidth;
    const scaleToFitHeight = container.height / baseHeight;

    // Lấy số lớn hơn để đảm bảo map luôn che lấp kín mít màn hình, không lòi ra 1 pixel vũ trụ nào
    return Math.max(scaleToFitWidth, scaleToFitHeight);
  };

  const clampPosition = (newX, newY, newScale) => {
    if (!containerRef.current || !contentRef.current) return { x: newX, y: newY };
    const containerRect = containerRef.current.getBoundingClientRect();
    const contentWidth = contentRef.current.offsetWidth * newScale;
    const contentHeight = contentRef.current.offsetHeight * newScale;

    // Vì ta đã ép Dynamic Min Scale, map sẽ luôn luôn >= màn hình. 
    // Giờ chỉ cần xây 4 bức tường sắt ở 4 mép là xong!
    const minX = containerRect.width - contentWidth;
    const clampedX = Math.max(minX, Math.min(0, newX));

    const minY = containerRect.height - contentHeight;
    const clampedY = Math.max(minY, Math.min(0, newY));

    return { x: clampedX, y: clampedY };
  };

  const handleMouseDown = (e) => {
    if (e.button === 1) { 
      e.preventDefault();
      isPanning.current = true;
      startPan.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
      document.body.style.cursor = 'move';
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - startPan.current.x;
    const dy = e.clientY - startPan.current.y;
    
    const { x, y } = clampPosition(startPan.current.tx + dx, startPan.current.ty + dy, transform.scale);
    setTransform(prev => ({ ...prev, x, y }));
  };

  const handleMouseUp = (e) => {
    if (e.button === 1) {
      isPanning.current = false;
      document.body.style.cursor = 'default';
    }
  };

  const handleWheel = (e) => {
    e.preventDefault(); 
    if (!containerRef.current || !contentRef.current) return;

    const zoomFactor = 0.05; 
    const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
    
    const oldScale = transform.scale;
    let newScale = oldScale + delta;

    // BÙA CHÚ TỐI THƯỢNG: Ép map không được thu nhỏ quá mức tính toán
    const minScale = getDynamicMinScale();
    newScale = Math.max(minScale, Math.min(newScale, 4)); 
    
    if (newScale === oldScale) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - transform.x) * (newScale / oldScale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / oldScale);

    const clamped = clampPosition(newX, newY, newScale);
    setTransform({ x: clamped.x, y: clamped.y, scale: newScale });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [transform]);

  useEffect(() => {
    // Tự động kiểm tra và khóa góc ngay lúc mới load web hoặc khi ông bấm '+' thêm ô lưới
    const enforceBounds = () => {
      setTransform(prev => {
        const minScale = getDynamicMinScale();
        const safeScale = Math.max(minScale, prev.scale);
        const clamped = clampPosition(prev.x, prev.y, safeScale);
        return { x: clamped.x, y: clamped.y, scale: safeScale };
      });
    };
    
    window.addEventListener('resize', enforceBounds);
    const resizeObserver = new ResizeObserver(() => enforceBounds());
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    enforceBounds(); // Chạy lệnh khóa ngay vòng đầu

    return () => {
      window.removeEventListener('resize', enforceBounds);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Background />
      <div 
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      >
        <div 
          ref={contentRef}
          style={{ 
            width: 'max-content', height: 'max-content',
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            willChange: 'transform'
          }}
        >
          <MaidasMap scale={transform.scale} />
        </div>
      </div>
    </div>
  );
}

export default App;