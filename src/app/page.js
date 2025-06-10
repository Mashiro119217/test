'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [btnScale, setBtnScale] = React.useState(1);
  const [iconAnim, setIconAnim] = React.useState(false);
  const [isTall, setIsTall] = useState(true);

  const containerRef = useRef(null);
  const [minSide, setMinSide] = useState(0);

  useEffect(() => {
    function updateMinSide() {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setMinSide(Math.min(offsetWidth, offsetHeight));
      }
    }
    updateMinSide();
    window.addEventListener('resize', updateMinSide);
    return () => window.removeEventListener('resize', updateMinSide);
  }, []);

  useEffect(() => {
    function checkHeight() {
      setIsTall(window.innerHeight > 420);
    }
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  // 進入動畫結束後導向
  useEffect(() => {
    if (iconAnim) {
      const timer = setTimeout(() => {
        router.push('/menu');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [iconAnim, router]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#172A3F',
        marginTop: 120,
        marginBottom: 140,
        border: '3px solid #C5AC6B',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 大標題 */}
      {isTall ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 32,
            marginBottom: 24,
            zIndex: 10,
            userSelect: 'none',
            // 淡出動畫
            opacity: iconAnim ? 0 : 1,
            transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(40px, 10vw, 80px)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: 10,
              textShadow: '0 2px 12px rgba(0,0,0,0.18)',
              lineHeight: 1.1,
              textAlign: 'center',
              maxWidth: 900,
              minWidth: 220,
              overflowWrap: 'break-word',
              width: '100%',
              display: 'block',
            }}
          >
            夏祭り
          </span>
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 8,
            textShadow: '0 2px 8px rgba(0,0,0,0.18)',
            zIndex: 10,
            userSelect: 'none',
            textAlign: 'center',
            width: '100%',
            // 淡出
            opacity: iconAnim ? 0 : 1,
            transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          夏祭り
        </div>
      )}
      {/* 背景圖片 */}
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src="/menu/home.png"
          alt="Home Icon"
          style={{
            maxWidth: minSide ? `${minSide}px` : '100%',
            maxHeight: minSide ? `${minSide}px` : '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center',
            transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
            transform: iconAnim ? 'scale(2.2)' : 'scale(1)',
            opacity: iconAnim ? 0 : 1,
            display: 'block',
            margin: 'auto',
          }}
        />
      </div>
      {/* 進入按鈕 */}
      <button
        style={{
          position: 'absolute',
          top: isTall ? '85%' : '90%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${btnScale})`,
          margin: 0,
          padding: isTall
            ? 'clamp(6px, 2vw, 10px) clamp(18px, 5vw, 30px)'
            : '6px 18px',
          background: '#C5AC6B',
          color: '#fff',
          fontSize: isTall ? 'clamp(14px, 2.5vw, 20px)' : 14,
          fontWeight: 700,
          border: 'none',
          borderRadius: isTall ? 'clamp(8px, 1.5vw, 12px)' : 8,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition:
            'transform 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.6s cubic-bezier(0.4,0,0.2,1), font-size 0.2s, padding 0.2s, border-radius 0.2s',
          zIndex: 2,
          opacity: iconAnim ? 0 : 1,
          pointerEvents: iconAnim ? 'none' : 'auto',
        }}
        onMouseEnter={() => setBtnScale(1.08)}
        onMouseLeave={() => setBtnScale(1)}
        onMouseDown={() => setBtnScale(0.95)}
        onMouseUp={() => setBtnScale(1.08)}
        onClick={() => {
          setIconAnim(true);
        }}
      >
        入場する
      </button>
    </div>
  );
}
