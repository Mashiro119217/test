'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 載入圖片
const iconMap = Object.fromEntries(
  Array.from({ length: 11 }, (_, i) => [`game${i + 1}`, `/menu/gameIcon${i + 1}.png`])
    .concat([['Home', '/menu/homeIcon.png']])
);

// 遊戲名稱
const gameNames = [
  "神之符印",
  "恋祭の危機",
  "面具對對碰",
  "圈圈屋台",
  "章魚燒不燒焦",
  "撈撈撈金魚",
  "百発百中",
  "守護刨冰",
  "副引き抽せんき",
  "型抜き",
  "だるま落とし"
];

const menuItems = [
  ...Array.from({ length: 11 }, (_, i) => ({ label: `game${i + 1}`, href: `/game${i + 1}` })),
  { label: 'Home', href: '/' },
];

export default function Menu() {
  // 載入狀態
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 預先載入圖片
    let loadedCount = 0;
    const total = menuItems.length;
    menuItems.forEach(item => {
      const img = new window.Image();
      img.src = iconMap[item.label];
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === total) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount += 1;
        if (loadedCount === total) setLoaded(true);
      };
    });
  }, []);

  return (
    <div style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        marginTop: 120,
        marginBottom: 140,
        border: '3px solid #C5AC6B',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        position: 'relative',
    }}>
      {/* 若圖片未載入 */}
      {!loaded ? (
        <div style={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: '#C5AC6B',
          fontWeight: 600,
        }}>
          載入中...
        </div>
      ) : (
        <div className="menu-scroll" style={{
          width: '97%',
          overflowX: 'auto',
          paddingBottom: 18,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(2, 150px)',
            gap: '24px',
            width: '1800px',
            margin: '0 auto',
          }}>
            {menuItems.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className="menu-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  color: '#C5AC6B',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'background 0.2s',
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const img = e.currentTarget.querySelector('img');
                  const shadow = e.currentTarget.querySelector('.menu-shadow-label');
                  if (img) img.style.transform = 'scale(1.15)';
                  if (shadow) shadow.style.opacity = 1;
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img');
                  const shadow = e.currentTarget.querySelector('.menu-shadow-label');
                  if (img) img.style.transform = 'scale(1)';
                  if (shadow) shadow.style.opacity = 0;
                }}
                onMouseDown={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(0.9)';
                }}
                onMouseUp={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(0.95)';
                }}
              >
                <img
                  src={iconMap[item.label]}
                  alt={item.label}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    borderRadius: '16px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transition: 'transform 0.18s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
                {/* hover 顯示攤位名稱 */}
                {(item.label.startsWith('game') || item.label === 'Home') && (
                  <span
                    className="menu-shadow-label"
                    style={{
                      position: 'absolute',
                      left: '10%',
                      right: '10%',
                      bottom: '4%',
                      height: '20%',
                      background: 'rgba(255,255,255,0.75)',
                      color: '#505166',
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: 1,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingBottom: 2,
                      borderRadius: 12,
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: 'opacity 0.35s cubic-bezier(0.4,0,0.2,1)',
                      zIndex: 2,
                      userSelect: 'none',
                    }}
                  >
                    {item.label === 'Home'
                      ? '出る'
                      : gameNames[parseInt(item.label.replace('game', '')) - 1]}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        .menu-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .menu-scroll::-webkit-scrollbar-thumb {
          background: rgba(197, 172, 107, 0.5);
          border-radius: 6px;
          transition: background 0.2s;
        }
        .menu-scroll:hover::-webkit-scrollbar-thumb,
        .menu-scroll:active::-webkit-scrollbar-thumb,
        .menu-scroll:focus::-webkit-scrollbar-thumb {
          background: rgba(197, 172, 107, 0.10);
        }
        .menu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        /* Firefox */
        .menu-scroll {
          scrollbar-color: rgba(197,172,107,0.5) transparent;
          scrollbar-width: thin;
        }
        .menu-scroll:hover,
        .menu-scroll:active,
        .menu-scroll:focus {
          scrollbar-color: rgba(197,172,107,0.5) transparent;
        }
        /* Link 預設、hover/active/focus 狀態字樣顏色 */
        .menu-link {
          color: #C5AC6B;
        }
        .menu-link:hover,
        .menu-link:active,
        .menu-link:focus {
          color: #C5AC6B;
        }
        .menu-link img {
          transition: transform 0.18s;
        }
        .menu-link:hover img,
        .menu-link:active img,
        .menu-link:focus img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}