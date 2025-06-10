'use client';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

// 靜態頁面順序（可依需求調整路徑）
const pageOrder = [
  '/',
  '/menu',
  '/game1',
  '/game2',
  '/game3',
  '/game4',
  '/game5',
  '/game6',
  '/game7',
  '/game8',
  '/game9',
  '/game10',
  '/game11',
];

export default function ClientBar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentIdx = pageOrder.indexOf(pathname);

  // 重新整理目前頁面
  const handleRefresh = () => {
    window.location.reload();
  };
  // 上一頁
  const handlePrev = () => {
    if (currentIdx > 0) router.push(pageOrder[currentIdx - 1]);
  };
  // 下一頁
  const handleNext = () => {
    if (currentIdx < pageOrder.length - 1) router.push(pageOrder[currentIdx + 1]);
  };
  // 回首頁
  const handleHome = () => {
    router.push('/');
  };

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: '30px',
      width: 'calc(100% - 48px)',
      maxWidth: 1200,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      background: 'transparent',
      margin: '0 auto',
    }}>
      <div style={{
        width: '97%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#F5F0E4',
        border: '3px solid #C5AC6B',
        borderRadius: 32,
        padding: '2px 24px',
        boxSizing: 'border-box',
      }}>
        {/* 刷新 */}
        <button onClick={handleRefresh} style={{background: 'none', border: 'none', outline: 'none', cursor: 'pointer'}} title="刷新">
          <svg width="32" height="32" fill="none" stroke="#C5AC6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16a12 12 0 1 1 4 9"/><polyline points="4 16 4 22 10 22"/></svg>
        </button>
        {/* 上個page */}
        <button onClick={handlePrev} style={{background: 'none', border: 'none', outline: 'none', cursor: 'pointer'}} title="上個page" disabled={currentIdx <= 0}>
          <svg width="32" height="32" fill="none" stroke="#C5AC6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 8l-8 8 8 8"/></svg>
        </button>
        {/* 主頁 */}
        <button onClick={handleHome} style={{background: 'none', border: 'none', outline: 'none', cursor: 'pointer', padding: 0}} title="主頁">
          <svg width="36" height="36" fill="none" stroke="#C5AC6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 8l12 10"/><path d="M6 18v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V18"/></svg>
        </button>
        {/* 下個page */}
        <button onClick={handleNext} style={{background: 'none', border: 'none', outline: 'none', cursor: 'pointer'}} title="下個page" disabled={currentIdx < 0 || currentIdx >= pageOrder.length - 1}>
          <svg width="32" height="32" fill="none" stroke="#C5AC6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8l8 8-8 8"/></svg>
        </button>
        {/* 選單 */}
        <button onClick={() => router.push('/menu')} style={{background: 'none', border: 'none', outline: 'none', cursor: 'pointer'}} title="選單">
          <svg width="32" height="32" fill="none" stroke="#C5AC6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="26" y2="12"/><line x1="6" y1="18" x2="26" y2="18"/><line x1="6" y1="24" x2="26" y2="24"/></svg>
        </button>
      </div>
    </div>
  );
} 