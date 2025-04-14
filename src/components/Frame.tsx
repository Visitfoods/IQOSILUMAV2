"use client";

import Image from 'next/image';

export default function Frame() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-20 pointer-events-none">
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: 'url(/IQOSILUMAV2/assets/FRAMEAPP.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.1)',
        }}
      />
    </div>
  );
} 