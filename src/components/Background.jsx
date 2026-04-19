import React from 'react';

const Background = () => {
  return (
    <video 
      autoPlay 
      loop 
      muted 
      playsInline
      style={{
        position: 'fixed', // Ghim chết vào nền
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: -1, // Nằm dưới cùng
        filter: 'brightness(0.6)' // Hơi tối xíu cho nổi cái lưới lên
      }}
    >
      {/* Đảm bảo ông đã có file galaxy.mp4 trong thư mục public nhé */}
      <source src="/galaxy.mp4" type="video/mp4" />
    </video>
  );
};

export default Background;