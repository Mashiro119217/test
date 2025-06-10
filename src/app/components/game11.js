"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import { Flow_Rounded } from "next/font/google";

export default function Game11Canvas() {
  // 狀態宣告與用途說明
  const [success, setSuccess] = useState(false); // 是否成功過關
  const [failed, setFailed] = useState(false); // 是否失敗
  const [showOverlay, setShowOverlay] = useState(false); // 是否顯示彈窗
  const [countdown, setCountdown] = useState(3); // 倒數計時秒數
  const [showStart, setShowStart] = useState(false); // 是否顯示 Start 文字
  const [progress, setProgress] = useState(100); // 進度條百分比
  const [isReadyToHit, setIsReadyToHit] = useState(false); // 是否準備好點擊
  const [showStick, setShowStick] = useState(false);
  const lastHitTimeRef = useRef(0);
  const { user, login } = useAuth();
  const brick1Ref = useRef(null);
  const progressIntervalRef = useRef(null);

  // 初始化檢查是否已過關，若是則不顯示彈窗
  useEffect(() => {
    const hasCleared = localStorage.getItem("game11Success") === "true";
    if (hasCleared) {
      setSuccess(false); 
      setShowOverlay(false);
    }
  }, []);

  // 倒數計時效果，從 countdown 3 開始遞減，倒數結束時顯示 Start 文字
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowStart(true);
      const timer = setTimeout(() => {
        setShowStart(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 啟動進度條倒數，倒數到 0 時停止
  useEffect(() => {
    if (countdown === 0 && !showStart) {
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressIntervalRef.current);
            return 0;
          }
          return prev - 3;
        });
      }, 10);
    }
    return () => clearInterval(progressIntervalRef.current);
  }, [countdown, showStart]);

  // 監控進度條歸零，1.5 秒內未點擊則判定失敗並顯示彈窗
  useEffect(() => {
    if (progress === 0 && !success && !failed) {
      lastHitTimeRef.current = Date.now(); // 記錄時間
      const timer = setTimeout(() => {
        if (!success && !failed) {
          setFailed(true);
          setShowOverlay(true);
        }
      }, 1500); // 超過 1.5 秒未點擊，直接失敗
      return () => clearTimeout(timer);
    }
  }, [progress, success, failed]);

  // handleHit 函式，依據點擊時機判斷成功、失敗、提前點擊等
  function handleHit() {
    if (showStart || countdown > 0 || success || failed) return;
    setShowStick(true);
    setTimeout(() => setShowStick(false), 600); // 播放一次
    const now = Date.now();

    const isEarlyClick = progress > 0;
    const isClickTooLate = progress === 0 && now - lastHitTimeRef.current > 1500;
    const isClickSuccess = progress === 0 && now - lastHitTimeRef.current <= 200;
    const isClickFailWithAnim = progress === 0 && now - lastHitTimeRef.current > 200 && now - lastHitTimeRef.current <= 1500;

    if (isEarlyClick) {
      lastHitTimeRef.current = Date.now();
      setFailed(true);
      setIsReadyToHit(false);
      clearInterval(progressIntervalRef.current);
      setTimeout(() => {
        setShowOverlay(true);
      }, 600);
      return;
    }

    if (isClickSuccess) {
      handleSuccess();
    } else if (isClickFailWithAnim) {
      setFailed(true);
      setIsReadyToHit(false);
      setTimeout(() => {
        setShowOverlay(true);
      }, 600);
    } else if (isClickTooLate) {
      setFailed(true);
      setShowOverlay(true);
    }
  }

  // 監聽鍵盤空白鍵與點擊事件，處理點擊行為判斷
  useEffect(() => {
    function onKeyDown(e) {
      if (showOverlay) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleHit();
      }
    }
    function onClick(e) {
      if (brick1Ref.current && brick1Ref.current.contains(e.target)) {
        handleHit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, [progress, success, failed, showStart, countdown, showOverlay]);

  // 過關行為與分數更新流程
  // 1. 設定 localStorage 過關標記
  // 2. 更新成功狀態與顯示彈窗
  // 3. 若使用者登入，將分數 +1 並同步更新到後端資料庫
  async function handleSuccess() {
    localStorage.setItem("game11Success", "true");
    setSuccess(true);
    setShowOverlay(true);
    // SCORE +1 並同步到 DB
    if (user && user.username) {
      const newScore = (user.score || 0) + 1;
      try {
        const res = await fetch("/api/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, score: newScore }),
        });
        if (res.ok) {
          login({ ...user, score: newScore });
        } else {
          console.error("Failed to update score");
        }
      } catch (err) {
        console.error("Error updating score:", err);
      }
    }
  }

  // 成功後延遲 600ms 顯示彈窗，確保動畫完成
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        // setShowOverlay(true); // 已在 handleSuccess 內處理
      }, 600); // 確保動畫結束後再顯示
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ====== 修正動畫 style 錯誤 ======
  const shouldFallWithAnimation =
    failed && (
      progress > 0 ||
      (progress === 0 && Date.now() - lastHitTimeRef.current <= 1500)
    );
  const towerAnimation = success
    ? 'none'
    : shouldFallWithAnimation
    ? 'dropDown 0.2s forwards, tiltTo30 0.1s forwards 0.2s, fallTo90 0.25s forwards 0.3s'
    : 'none';

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#222222', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* 倒數遮罩 */}
      {(countdown > 0 || (countdown === 0 && showStart)) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          zIndex: 998,
        }} />
      )}
      {/* 倒數數字 */}
      {countdown > 0 && (
        <div
          key={countdown}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 160,
            height: 160,
            borderRadius: '50%',
            backgroundColor: '#E36B5B',
            border: '8px solid #F5F0E4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            // animation 僅套用於容器，不與 transform 衝突
            animation: 'scaleUp 0.5s cubic-bezier(0.7,0.2,0.2,1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: 96,
              fontWeight: 'bold',
              color: '#F5F0E4',
            }}
          >
            {countdown}
          </div>
        </div>
      )}

      {/* Start 文字顯示 */}
      {countdown === 0 && showStart && (
        <div className="strokeText" data-stroke="Start!" id="start-text">
          Start!
        </div>
      )}

      {/* 背景燈籠 */}
      <img 
        src="/lantern.png" alt="lantern" 
        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '25%', objectFit: 'cover', zIndex: 0}}
      />
      
      {/* 中央區域：達摩塔與棍棒 */}
      <div style={{ 
        flexGrow: 1, 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        marginBottom: 10, 
        zIndex: 1,
        overflow: 'hidden',
        maxWidth: '100%',
      }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              transition: 'transform 0.25s ease',
              animation: towerAnimation,
              transform: success ? 'translateY(10vh)' : 'translateY(0)',
              transformOrigin: 'bottom right',
            }}
          >
            <div><img src="/daruma.png" alt="daruma" style={{ width: '25vh', height: '17.5vh' }} /></div>
            <div><img src="/brick_4.png" alt="brick_4" style={{ width: '25vh', height: '10vh' }} /></div>
            <div><img src="/brick_3.png" alt="brick_3" style={{ width: '25vh', height: '10vh' }} /></div>
            <div><img src="/brick_2.png" alt="brick_2" style={{ width: '25vh', height: '10vh' }} /></div>
          </div>
          <div 
            ref={brick1Ref} 
            onClick={handleHit} 
            style={{ 
              width: '25vh', 
              height: '10vh', 
              transition: 'transform 0.1s ease',
              transform: (
                (progress === 0 && success) ||
                (failed && (progress > 0 || Date.now() - lastHitTimeRef.current <= 1500))
              ) ? 'translateX(calc(-25vh - 2vw))' : 'translateY(0)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <img src="/brick_1.png" alt="brick_1" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
        {/* 棍棒圖像，從右側揮向達摩塔，擺在塔的下方右側，稍微傾斜 */}
        <img
          key={showStick ? `swing-${Date.now()}` : 'static'}
          src="/stick.png"
          alt="stick_static"
          className={showStick ? 'swingStick' : ''}
          style={{
            position: 'absolute',
            rotate:'10deg',
            right: 'calc(50% - 17vw)',
            bottom: '4%',
            width: '30vh',
            height: '10vh',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      </div>

      {/* 下方進度條 */}
      <div style={{ height: '2vh', backgroundColor: 'rgba(245, 240, 228, 0.9)', margin: '0 24px 16px', borderRadius:'30px' , overflow: 'hidden' }}>
        <div style={{ width: progress + '%', height: '100%', backgroundColor: '#E36B5B' }}></div>
      </div>

      {/* 成功或失敗後彈窗 */}
      {showOverlay && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div
            style={{
              width: "20vw",
              height: "12.5vw",
              minWidth: "150px",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              border: "3px solid #C5AC6B",
              color: "#C5AC6B",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            }}
          >
            {success ? (
              <>
                <img src="/daruma.png" alt="success_daruma" style={{ width: '5vw', height: 'auto', marginBottom: '0.8vw', minWidth: "64px" }} />
                <h2 style={{ color: "#505166", fontSize: "clamp(16px, 1.8vw, 24px)", fontWeight: 700, marginBottom: 18, textAlign: "center", minWidth: "120px" }}>
                  挑戰成功
                </h2>
              </>
            ) : (
              <>
                <img src="/daruma.png" alt="fail_daruma" style={{ width: '5vw', height: 'auto', marginBottom: '0.8vw', transform: 'rotate(180deg)', minWidth: "64px" }} />
                <h2 style={{ color: "#505166", fontSize: "clamp(16px, 1.8vw, 24px)", fontWeight: 700, marginBottom: 18, textAlign: "center", minWidth: "120px", minWidth: '1vw' }}>
                  挑戰失敗
                </h2>
              </>
            )}
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => {
                  // 重置遊戲狀態
                  setShowOverlay(false);
                  setSuccess(false);
                  setFailed(false);
                  setIsReadyToHit(false);
                  setProgress(100);
                  setCountdown(3);
                  localStorage.removeItem("game11Success");
                  // TODO: 這裡也要重置你自己的遊戲狀態
                }}
                style={{
                  aspectRatio: '2 / 1',
                  minWidth: '80px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: '#E36B5B',
                  border: 'none',
                  borderRadius: '0.5vw',
                  fontWeight: 600,
                  fontSize: 'clamp(14px, 1.2vw, 18px)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  maxWidth: '10vw',
                  whiteSpace: 'nowrap'
                }}
              >
                再玩一次
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                style={{
                  aspectRatio: '2 / 1',
                  minWidth: '80px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: '#505166',
                  border: 'none',
                  borderRadius: '0.5vw',
                  fontWeight: 600,
                  fontSize: 'clamp(14px, 1.2vw, 18px)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  maxWidth: '10vw',
                  whiteSpace: 'nowrap'
                }}
              >
                回到主頁
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 縮放動畫 CSS */}
      <style>{`
        @keyframes dropDown {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(10vh) rotate(0deg); }
        }
        @keyframes scaleUp {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        .strokeText {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 96px;
          font-weight: bold;
          color: #E36B5B;
          z-index: 999;
          animation: scaleUp 0.5s cubic-bezier(0.7,0.2,0.2,1);
        }

        .strokeText::before {
          content: attr(data-stroke);
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
          color: transparent;
          -webkit-text-stroke: 10px #F5F0E4;
          text-stroke: 10px #F5F0E4;
        }

        @keyframes swing {
          0% {
            transform: rotateX(-8deg) rotateZ(10deg) rotateY(4deg);
          }
          100% {
            transform: rotateX(12deg) rotateZ(-20deg) rotateY(-5deg);
          }
        }

        .swingStick {
          transform-origin: right center;
          animation: swing 0.03s ease-out forwards;
        }

        @keyframes fallTo90 {
          0% { transform: translateY(10vh) rotate(0deg); }
          50% { transform: translateY(10vh) rotate(30deg); }
          100% { transform: translateY(10vh) rotate(90deg); }
        }
      `}</style>
    </div>
  );
} 