import React from 'react';

const Background = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 0, // Kéo lên tầng 0 cho an toàn
      backgroundColor: '#000',
      pointerEvents: 'none' // Không cho video cản trở thao tác chuột
    }}>
      <video 
        autoPlay loop muted playsInline
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: 0.5 // Thay vì dùng filter, xài opacity cho nhẹ máy
        }}
        // Dòng này cực mạnh: Nếu video lỗi nó sẽ báo ra Console ngay!
        onError={(e) => console.error("🛑 ALO FUTU! KHÔNG LOAD ĐƯỢC VIDEO:", e)}
      >
        <source src="/galaxy.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default Background;